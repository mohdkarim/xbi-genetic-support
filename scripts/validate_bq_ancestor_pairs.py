"""
validate_bq_ancestor_pairs.py
Re-validate 6 bq_ancestor gene-disease pairs using BQ association tables
and disease ontology — fully reproducible, no cached API scores.

Approach per pair:
1. Direct check: is the company disease among the target's direct genetic associations?
2. Common ancestor: find shared ontology ancestors between target-associated diseases
   and the company disease
3. Evidence dates: which datasources drive the association, earliest evidenceDate
"""

import os
import sys
from pathlib import Path

sys.stdout.reconfigure(line_buffering=True)

BASE = Path(__file__).parent.parent
BQ_DATASET = "open-targets-prod.platform"
CUTOFF_DATE = "2020-01-02"

BQ_GENETIC_TABLES = [
    "evidence_eva",
    "evidence_clingen",
    "evidence_gene2phenotype",
    "evidence_gene_burden",
    "evidence_genomics_england",
    "evidence_gwas_credible_sets",
    "evidence_orphanet",
    "evidence_uniprot_variants",
]

BROAD_ANCESTORS = {
    "EFO_0000651",    # phenotype
    "MONDO_0000001",  # disease
    "HP_0000118",     # phenotypic abnormality
    "OTAR_0000018",   # clinical phenotype
    "EFO_0000408",    # disease
    "OTAR_0000017",   # phenotype
    "EFO_0010285",    # phenotype (alt)
    "EFO_0000616",    # neoplasm
    "MONDO_0005070",  # neoplasm
    "MONDO_0700096",  # human disease
    "MONDO_0042489",  # disease susceptibility
    "EFO_0000508",    # genetic disorder
    "MONDO_0003847",  # Mendelian disease
}

PAIRS = [
    {"ticker": "ACHN", "gene": "CFD",   "ensembl_id": "ENSG00000197766", "disease_efo": "MONDO_0013892", "disease_name": "C3 Glomerulonephritis"},
    {"ticker": "ALXN", "gene": "C5",    "ensembl_id": "ENSG00000106804", "disease_efo": "MONDO_0016244", "disease_name": "aHUS"},
    {"ticker": "CPRX", "gene": "PDE4B", "ensembl_id": "ENSG00000184588", "disease_efo": "EFO_0008525",   "disease_name": "Spinal Muscular Atrophy"},
    {"ticker": "KPTI", "gene": "TUBB1", "ensembl_id": "ENSG00000101162", "disease_efo": "EFO_0001378",   "disease_name": "Multiple Myeloma"},
    {"ticker": "SGEN", "gene": "FGFR1", "ensembl_id": "ENSG00000077782", "disease_efo": "EFO_0000335",   "disease_name": "Non-Hodgkin Lymphoma"},
    {"ticker": "UTHR", "gene": "TOP1",  "ensembl_id": "ENSG00000198900", "disease_efo": "EFO_0000702",   "disease_name": "Small Cell Lung Cancer"},
]


def init_bq_client():
    from google.cloud import bigquery
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(BASE / "credentials.json")
    return bigquery.Client(project="feedback-bio")


def step1_direct_check(client, target_id, disease_id):
    """Check if the company disease is among the target's direct genetic associations."""
    sql = f"""
    SELECT diseaseId, score
    FROM `{BQ_DATASET}.association_by_datatype_direct`
    WHERE targetId = '{target_id}'
      AND datatypeId = 'genetic_association'
      AND score > 0
    """
    rows = list(client.query(sql).result())
    associated = {row.diseaseId: row.score for row in rows}
    is_direct = disease_id in associated
    direct_score = associated.get(disease_id)
    return is_direct, direct_score, associated


def step2_ancestor_check(client, company_disease_id, target_associated_diseases):
    """Find common ancestors between target-associated diseases and company disease."""
    if not target_associated_diseases:
        return []

    # Get ancestors of the company's disease
    sql_company = f"""
    SELECT anc.element AS ancestor
    FROM `{BQ_DATASET}.disease`,
    UNNEST(ancestors.list) AS anc
    WHERE id = '{company_disease_id}'
    """
    company_rows = list(client.query(sql_company).result())
    company_ancestors = {row.ancestor for row in company_rows}
    company_ancestors -= BROAD_ANCESTORS

    if not company_ancestors:
        print(f"    Company disease has {len(company_rows)} ancestors, {0} after filtering broad terms")
        return []

    print(f"    Company disease has {len(company_rows)} ancestors, {len(company_ancestors)} after filtering broad terms")

    # Get ancestors of each target-associated disease, find common ones
    disease_ids_str = ", ".join(f"'{d}'" for d in target_associated_diseases)
    company_ancestors_str = ", ".join(f"'{a}'" for a in company_ancestors)

    sql_target = f"""
    SELECT d.id AS target_disease, d3.name AS target_disease_name,
           anc.element AS ancestor, d2.name AS ancestor_name
    FROM `{BQ_DATASET}.disease` d,
    UNNEST(d.ancestors.list) AS anc
    LEFT JOIN `{BQ_DATASET}.disease` d2 ON d2.id = anc.element
    LEFT JOIN `{BQ_DATASET}.disease` d3 ON d3.id = d.id
    WHERE d.id IN ({disease_ids_str})
      AND anc.element IN ({company_ancestors_str})
    """
    target_rows = list(client.query(sql_target).result())

    results = []
    for row in target_rows:
        results.append({
            "target_disease": row.target_disease,
            "target_disease_name": row.target_disease_name,
            "common_ancestor": row.ancestor,
            "ancestor_name": row.ancestor_name,
        })
    return results


def step3_evidence_dates(client, target_id, ancestor_matches):
    """Get datasources and earliest evidence dates for ancestor-matched diseases."""
    if not ancestor_matches:
        return None

    target_diseases = set(m["target_disease"] for m in ancestor_matches)
    disease_ids_str = ", ".join(f"'{d}'" for d in target_diseases)

    # Step 3a: Which datasources drive the indirect association?
    sql_ds = f"""
    SELECT diseaseId, datasourceId, score
    FROM `{BQ_DATASET}.association_by_datasource_indirect`
    WHERE targetId = '{target_id}'
      AND diseaseId IN ({disease_ids_str})
      AND score > 0
    ORDER BY score DESC
    """
    ds_rows = list(client.query(sql_ds).result())

    print(f"    Datasource associations for target diseases:")
    for row in ds_rows:
        print(f"      {row.diseaseId} <- {row.datasourceId} (score={row.score:.4f})")

    # Step 3b: Earliest evidence dates from evidence tables
    union_parts = []
    for table in BQ_GENETIC_TABLES:
        ds_name = table.replace("evidence_", "")
        union_parts.append(
            f"SELECT CAST(evidenceDate AS STRING) AS dt, '{ds_name}' AS ds, diseaseId "
            f"FROM `{BQ_DATASET}.{table}` "
            f"WHERE targetId = '{target_id}' "
            f"AND diseaseId IN ({disease_ids_str}) "
            f"AND evidenceDate IS NOT NULL"
        )

    sql_ev = (
        "WITH all_ev AS (\n  " + "\n  UNION ALL\n  ".join(union_parts) + "\n)\n"
        "SELECT MIN(dt) AS earliest, "
        "ARRAY_AGG(DISTINCT ds) AS datasources, "
        "ARRAY_AGG(DISTINCT diseaseId) AS disease_ids "
        "FROM all_ev"
    )

    ev_rows = list(client.query(sql_ev).result())
    if ev_rows and ev_rows[0].earliest:
        return {
            "earliest_date": ev_rows[0].earliest,
            "datasources": list(ev_rows[0].datasources or []),
            "evidence_disease_ids": list(ev_rows[0].disease_ids or []),
            "pre_2020": ev_rows[0].earliest < CUTOFF_DATE,
        }
    return None


def main():
    print("=" * 70)
    print("validate_bq_ancestor_pairs.py")
    print("Re-validating 6 bq_ancestor pairs via BQ association tables")
    print("=" * 70)

    client = init_bq_client()

    for pair in PAIRS:
        ticker = pair["ticker"]
        gene = pair["gene"]
        eid = pair["ensembl_id"]
        did = pair["disease_efo"]
        dname = pair["disease_name"]

        print(f"\n{'─' * 70}")
        print(f"{ticker}: {gene} ({eid}) → {dname} ({did})")
        print(f"{'─' * 70}")

        # Step 1: Direct check
        is_direct, direct_score, all_associated = step1_direct_check(client, eid, did)
        print(f"\n  Step 1 — Direct association check:")
        print(f"    Target has {len(all_associated)} diseases with direct genetic_association")
        if is_direct:
            print(f"    DIRECT MATCH: {did} score={direct_score:.4f}")
            # Still get evidence dates for direct match
            print(f"\n  Step 3 — Evidence dates (direct):")
            union_parts = []
            disease_ids_str = f"'{did}'"
            for table in BQ_GENETIC_TABLES:
                ds_name = table.replace("evidence_", "")
                union_parts.append(
                    f"SELECT CAST(evidenceDate AS STRING) AS dt, '{ds_name}' AS ds, diseaseId "
                    f"FROM `{BQ_DATASET}.{table}` "
                    f"WHERE targetId = '{eid}' "
                    f"AND diseaseId = '{did}' "
                    f"AND evidenceDate IS NOT NULL"
                )
            sql_ev = (
                "WITH all_ev AS (\n  " + "\n  UNION ALL\n  ".join(union_parts) + "\n)\n"
                "SELECT MIN(dt) AS earliest, "
                "ARRAY_AGG(DISTINCT ds) AS datasources "
                "FROM all_ev"
            )
            ev_rows = list(client.query(sql_ev).result())
            if ev_rows and ev_rows[0].earliest:
                pre = "PRE-2020" if ev_rows[0].earliest < CUTOFF_DATE else "POST-2020"
                print(f"    Earliest evidence: {ev_rows[0].earliest} [{pre}]")
                print(f"    Datasources: {', '.join(ev_rows[0].datasources or [])}")
            else:
                print(f"    No evidence dates found in BQ evidence tables")

            print(f"\n  Result: DIRECT")
            continue

        print(f"    {did} NOT among direct associations")

        # Step 2: Ancestor check
        print(f"\n  Step 2 — Common ancestor check:")
        ancestor_matches = step2_ancestor_check(client, did, list(all_associated.keys()))
        if not ancestor_matches:
            print(f"    NO common ancestors found")
            print(f"\n  Result: NO MATCH")
            continue

        # Deduplicate and display
        unique_ancestors = {}
        for m in ancestor_matches:
            key = m["common_ancestor"]
            if key not in unique_ancestors:
                unique_ancestors[key] = {
                    "ancestor_name": m["ancestor_name"],
                    "target_diseases": {},
                }
            unique_ancestors[key]["target_diseases"][m["target_disease"]] = m["target_disease_name"]

        print(f"    Found {len(unique_ancestors)} common ancestor(s):")
        for anc_id, anc_info in sorted(unique_ancestors.items(), key=lambda x: x[1]["ancestor_name"] or ""):
            print(f"      {anc_id} ({anc_info['ancestor_name']})")
            for td_id, td_name in sorted(anc_info["target_diseases"].items()):
                td_score = all_associated.get(td_id, 0)
                print(f"        via: {td_id} ({td_name}) [GA score={td_score:.4f}]")

        # Step 3: Evidence dates
        print(f"\n  Step 3 — Evidence dates for ancestor-matched diseases:")
        evidence = step3_evidence_dates(client, eid, ancestor_matches)
        if evidence:
            pre = "PRE-2020" if evidence["pre_2020"] else "POST-2020"
            print(f"    Earliest evidence: {evidence['earliest_date']} [{pre}]")
            print(f"    Datasources: {', '.join(evidence['datasources'])}")
            print(f"    Evidence disease IDs: {', '.join(evidence['evidence_disease_ids'])}")
            print(f"\n  Result: ANCESTOR [{pre}]")
        else:
            print(f"    No evidence dates found in BQ evidence tables")
            print(f"\n  Result: ANCESTOR (no evidence dates)")

    print(f"\n{'=' * 70}")
    print("Done.")


if __name__ == "__main__":
    main()
