"""
validate_tier2_mendelian_bq.py
For each tier2_mendelian pair, query BQ with ontology expansion
(ancestors + descendants) to find verifiable evidence dates.
"""

import csv
import json
import os
import sys
import time
import requests
from pathlib import Path
from collections import defaultdict

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True)

BASE = Path(__file__).parent.parent
PIPELINE_PATH = BASE / "processed" / "scored_pipeline.tsv"
ONTOLOGY_CACHE_PATH = BASE / ".tmp" / "disease_ontology_cache.json"
OUTPUT_PATH = BASE / ".tmp" / "tier2_mendelian_bq_results.json"

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

# Broad top-level ancestors to exclude from expansion (too generic)
BROAD_ANCESTORS = {
    "EFO_0000408",  # disease
    "MONDO_0000001", # disease or disorder
    "OTAR_0000018",  # clinical sign or symptom
    "HP_0000001",    # all
    "EFO_0000616",   # neoplasm
    "MONDO_0005070", # neoplasm
    "HP_0002664",    # neoplasm
    "OTAR_0000006",  # musculoskeletal or connective tissue disease
    "EFO_0010282",   # phenotype
    "EFO_0001444",   # measurement
}

OT_GRAPHQL_URL = "https://api.platform.opentargets.org/api/v4/graphql"


def ot_graphql(query, variables):
    try:
        resp = requests.post(
            OT_GRAPHQL_URL,
            json={"query": query, "variables": variables},
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"  GraphQL error: {e}")
        return None


def fetch_disease_descendants(efo_id):
    query = """
    query($efoId: String!) {
      disease(efoId: $efoId) { descendants }
    }
    """
    resp = ot_graphql(query, {"efoId": efo_id})
    ids = [efo_id]
    if resp and resp.get("data", {}).get("disease"):
        ids.extend(resp["data"]["disease"].get("descendants", []))
    return ids


def fetch_disease_ancestors(efo_id):
    query = """
    query($efoId: String!) {
      disease(efoId: $efoId) { ancestors }
    }
    """
    resp = ot_graphql(query, {"efoId": efo_id})
    ids = []
    if resp and resp.get("data", {}).get("disease"):
        ids.extend(resp["data"]["disease"].get("ancestors", []))
    return ids


def bq_earliest_evidence(client, target_id, disease_ids, tables=None):
    if tables is None:
        tables = BQ_GENETIC_TABLES
    if not disease_ids:
        return None, [], None

    # Batch disease IDs to stay under BQ query size limits
    BATCH_SIZE = 500
    all_earliest = None
    all_datasources = set()
    all_disease_ids = set()

    for batch_start in range(0, len(disease_ids), BATCH_SIZE):
        batch = disease_ids[batch_start:batch_start + BATCH_SIZE]
        disease_ids_str = ", ".join(f"'{d}'" for d in batch)

        union_parts = []
        for table in tables:
            ds_name = table.replace("evidence_", "")
            union_parts.append(
                f"SELECT CAST(evidenceDate AS STRING) AS dt, '{ds_name}' AS ds, diseaseId "
                f"FROM `{BQ_DATASET}.{table}` "
                f"WHERE targetId = '{target_id}' "
                f"AND diseaseId IN ({disease_ids_str}) "
                f"AND evidenceDate IS NOT NULL"
            )

        sql = (
            "WITH all_ev AS (\n  " + "\n  UNION ALL\n  ".join(union_parts) + "\n)\n"
            "SELECT MIN(dt) AS earliest, ARRAY_AGG(DISTINCT ds) AS datasources, "
            "ARRAY_AGG(DISTINCT diseaseId) AS disease_ids FROM all_ev"
        )

        rows = list(client.query(sql).result())
        if rows and rows[0].earliest:
            dt = rows[0].earliest
            if all_earliest is None or dt < all_earliest:
                all_earliest = dt
            all_datasources.update(rows[0].datasources or [])
            all_disease_ids.update(rows[0].disease_ids or [])

    if all_earliest:
        return all_earliest, list(all_datasources), list(all_disease_ids)
    return None, [], None


def main():
    from google.cloud import bigquery

    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(BASE / "credentials.json")
    bq_client = bigquery.Client(project="feedback-bio")

    # Load ontology cache
    ontology_cache = {}
    if ONTOLOGY_CACHE_PATH.exists():
        ontology_cache = json.load(open(ONTOLOGY_CACHE_PATH))
        print(f"Loaded ontology cache: {len(ontology_cache)} entries")

    # Get unique tier2_mendelian pairs
    pairs = {}
    with open(PIPELINE_PATH) as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader:
            if row["bq_validation_method"] != "tier2_mendelian":
                continue
            if row["is_scoreable"] != "True":
                continue
            score_str = row["genetic_association_score"]
            if not score_str:
                continue
            try:
                score = float(score_str)
            except ValueError:
                continue
            if score <= 0:
                continue

            key = (row["ensembl_id"], row["disease_efo_id"])
            if key not in pairs:
                pairs[key] = {
                    "gene": row["gene_symbol"],
                    "ensembl_id": row["ensembl_id"],
                    "disease_efo_id": row["disease_efo_id"],
                    "disease_name": row["conditions"].split("|")[0].strip(),
                    "score": score,
                    "datasources": row["genetic_datasources"],
                    "tickers": set(),
                }
            pairs[key]["tickers"].add(row["ticker"])

    print(f"\nUnique tier2_mendelian pairs to check: {len(pairs)}")

    # Process each pair
    results = {}
    for i, ((eid, did), info) in enumerate(pairs.items()):
        gene = info["gene"]
        disease = info["disease_name"][:40]
        tickers = ",".join(sorted(info["tickers"]))
        print(f"\n[{i+1}/{len(pairs)}] {gene} ({eid}) -> {disease} ({did}) tickers={tickers}")

        # Step 1: Direct query (exact disease ID)
        earliest, datasources, _ = bq_earliest_evidence(bq_client, eid, [did])
        if earliest:
            pre_2020 = earliest < CUTOFF_DATE
            print(f"  DIRECT: earliest={earliest} ds={datasources} pre_2020={pre_2020}")
            results[f"{eid}_{did}"] = {
                "gene": gene,
                "ensembl_id": eid,
                "disease_efo_id": did,
                "disease_name": info["disease_name"],
                "method": "bq_direct",
                "earliest_date": earliest,
                "datasources": datasources,
                "pre_2020": pre_2020,
                "tickers": sorted(info["tickers"]),
                "expanded_disease_ids": None,
            }
            continue

        # Step 2: Ontology expansion — descendants of the disease
        if did not in ontology_cache:
            descs = fetch_disease_descendants(did)
            ontology_cache[did] = {"descendants": descs}
            time.sleep(0.15)
        desc_ids = ontology_cache[did].get("descendants", [])

        # Also add self for completeness
        expanded = set(desc_ids)
        expanded.add(did)

        earliest, datasources, matched_diseases = bq_earliest_evidence(
            bq_client, eid, list(expanded)
        )
        if earliest:
            pre_2020 = earliest < CUTOFF_DATE
            print(f"  DESCENDANT: earliest={earliest} ds={datasources} matched={matched_diseases} pre_2020={pre_2020}")
            results[f"{eid}_{did}"] = {
                "gene": gene,
                "ensembl_id": eid,
                "disease_efo_id": did,
                "disease_name": info["disease_name"],
                "method": "bq_descendant",
                "earliest_date": earliest,
                "datasources": datasources,
                "pre_2020": pre_2020,
                "tickers": sorted(info["tickers"]),
                "expanded_disease_ids": matched_diseases,
            }
            continue

        # Step 3: Ontology expansion — ancestors of the disease, then their descendants
        if did not in ontology_cache or "ancestors" not in ontology_cache[did]:
            ancs = fetch_disease_ancestors(did)
            ontology_cache.setdefault(did, {})["ancestors"] = ancs
            time.sleep(0.15)

        ancestors = ontology_cache[did].get("ancestors", [])
        meaningful = [a for a in ancestors if a not in BROAD_ANCESTORS]

        related = set()
        for anc in meaningful:
            if anc not in ontology_cache:
                descs = fetch_disease_descendants(anc)
                ontology_cache[anc] = {"descendants": descs}
                time.sleep(0.15)
            related.update(ontology_cache[anc].get("descendants", []))

        if related:
            earliest, datasources, matched_diseases = bq_earliest_evidence(
                bq_client, eid, list(related)
            )
            if earliest:
                pre_2020 = earliest < CUTOFF_DATE
                print(f"  ANCESTOR: earliest={earliest} ds={datasources} matched={matched_diseases} pre_2020={pre_2020}")
                results[f"{eid}_{did}"] = {
                    "gene": gene,
                    "ensembl_id": eid,
                    "disease_efo_id": did,
                    "disease_name": info["disease_name"],
                    "method": "bq_ancestor",
                    "earliest_date": earliest,
                    "datasources": datasources,
                    "pre_2020": pre_2020,
                    "tickers": sorted(info["tickers"]),
                    "expanded_disease_ids": matched_diseases,
                }
                continue

        print(f"  NO BQ EVIDENCE FOUND")
        results[f"{eid}_{did}"] = {
            "gene": gene,
            "ensembl_id": eid,
            "disease_efo_id": did,
            "disease_name": info["disease_name"],
            "method": "none",
            "earliest_date": None,
            "datasources": [],
            "pre_2020": False,
            "tickers": sorted(info["tickers"]),
            "expanded_disease_ids": None,
        }

    # Save ontology cache
    json.dump(ontology_cache, open(ONTOLOGY_CACHE_PATH, "w"), indent=2)
    print(f"\nSaved ontology cache: {len(ontology_cache)} entries")

    # Save results
    json.dump(results, open(OUTPUT_PATH, "w"), indent=2)
    print(f"Saved results: {OUTPUT_PATH}")

    # Summary
    confirmed = sum(1 for r in results.values() if r["pre_2020"])
    not_found = sum(1 for r in results.values() if r["method"] == "none")
    post_2020 = sum(1 for r in results.values() if r["earliest_date"] and not r["pre_2020"])

    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"  Total pairs checked: {len(results)}")
    print(f"  BQ confirmed pre-2020: {confirmed}")
    print(f"  BQ found but post-2020: {post_2020}")
    print(f"  No BQ evidence: {not_found}")

    by_method = defaultdict(int)
    for r in results.values():
        if r["pre_2020"]:
            by_method[r["method"]] += 1
    print(f"\n  By method:")
    for m, c in sorted(by_method.items()):
        print(f"    {m}: {c}")

    # Show pairs with no evidence
    if not_found > 0:
        print(f"\n  Pairs with NO BQ evidence:")
        for r in sorted(results.values(), key=lambda x: -x["score"] if "score" not in x else 0):
            if r["method"] == "none":
                print(f"    {r['gene']} -> {r['disease_name'][:40]} tickers={r['tickers']}")


if __name__ == "__main__":
    main()
