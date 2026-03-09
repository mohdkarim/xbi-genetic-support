"""
patch_tier2_mendelian.py
Apply BQ ontology expansion results to scored_pipeline.tsv.
- Upgrades tier2_mendelian pairs with BQ evidence to bq_ancestor (with dates)
- Downgrades pairs without BQ evidence (confirmed_pre_2020 = False)
- Re-derives company-level lead program and GS classification
"""

import csv
import json
import sys
from pathlib import Path
from collections import defaultdict

sys.stdout.reconfigure(line_buffering=True)

BASE = Path(__file__).parent.parent
PIPELINE_PATH = BASE / "processed" / "scored_pipeline.tsv"
BQ_RESULTS_PATH = BASE / ".tmp" / "tier2_mendelian_bq_results.json"
OUTPUT_PATH = BASE / "processed" / "scored_pipeline.tsv"  # overwrite in place

PHASE_RANK = {
    "PHASE4": 7, "PHASE3": 6, "PHASE2/PHASE3": 5, "PHASE2": 4,
    "PHASE1/PHASE2": 3, "PHASE1": 2, "EARLY_PHASE1": 1,
}
GS_THRESHOLDS = [0.10, 0.50, 0.80, 0.95]

DIAGNOSTIC_COMPANIES = {"CDNA", "EXAS", "NTRA", "NVTA", "TWST"}


def main():
    # Load BQ results
    bq_results = json.load(open(BQ_RESULTS_PATH))
    print(f"Loaded BQ results: {len(bq_results)} pairs")

    # Build lookup: (ensembl_id, disease_efo_id) -> result
    bq_lookup = {}
    for key, result in bq_results.items():
        eid = result["ensembl_id"]
        did = result["disease_efo_id"]
        bq_lookup[(eid, did)] = result

    # Read pipeline
    with open(PIPELINE_PATH) as f:
        reader = csv.DictReader(f, delimiter="\t")
        fieldnames = reader.fieldnames
        rows = list(reader)
    print(f"Loaded pipeline: {len(rows)} rows")

    # Step 1: Patch tier2_mendelian rows
    upgraded = 0
    downgraded = 0
    for row in rows:
        if row["bq_validation_method"] != "tier2_mendelian":
            continue

        key = (row["ensembl_id"], row["disease_efo_id"])
        bq = bq_lookup.get(key)
        if not bq:
            continue

        if bq["pre_2020"]:
            # Upgrade: BQ confirms pre-2020
            row["bq_validation_method"] = bq["method"]  # bq_ancestor or bq_direct
            row["bq_earliest_date"] = bq["earliest_date"]
            row["confirmed_pre_2020"] = "True"
            upgraded += 1
        else:
            # Downgrade: no verifiable pre-2020 evidence
            row["bq_validation_method"] = bq["method"] if bq["method"] != "none" else "no_bq_evidence"
            row["bq_earliest_date"] = bq["earliest_date"] or ""
            row["confirmed_pre_2020"] = "False"
            downgraded += 1

    print(f"Upgraded to BQ-confirmed: {upgraded} rows")
    print(f"Downgraded (unverifiable): {downgraded} rows")

    # Step 2: Recompute company-level stats
    # Group by ticker
    by_ticker = defaultdict(list)
    for row in rows:
        by_ticker[row["ticker"]].append(row)

    # For each company, recompute confirmed pair counts and lead program
    gs_changes = []
    for ticker, ticker_rows in by_ticker.items():
        scoreable = [
            r for r in ticker_rows
            if r["is_scoreable"] == "True"
        ]
        confirmed = [
            r for r in scoreable
            if r["confirmed_pre_2020"] == "True"
            and r["genetic_association_score"]
            and float(r["genetic_association_score"]) > 0
        ]

        # Confirmed pair counts
        n_confirmed = len(set(
            (r["ensembl_id"], r["disease_efo_id"]) for r in confirmed
        ))
        n_confirmed_gs = len(set(
            (r["ensembl_id"], r["disease_efo_id"]) for r in confirmed
            if float(r["genetic_association_score"]) > 0.10
        ))
        best_confirmed = max(
            (float(r["genetic_association_score"]) for r in confirmed),
            default=0,
        )

        # Lead program: highest phase, tiebreak by score, among confirmed pairs
        lead = None
        if confirmed:
            # Deduplicate by (ensembl_id, disease_efo_id), keeping highest phase
            pair_best = {}
            for r in confirmed:
                pk = (r["ensembl_id"], r["disease_efo_id"])
                pr = PHASE_RANK.get(r["phase"], 0)
                sc = float(r["genetic_association_score"])
                if pk not in pair_best or (pr, sc) > (pair_best[pk][0], pair_best[pk][1]):
                    pair_best[pk] = (pr, sc, r)

            # Pick overall lead
            candidates = [(pr, sc, r) for (pr, sc, r) in pair_best.values()]
            candidates.sort(key=lambda x: (x[0], x[1]), reverse=True)
            lead = candidates[0][2]

        # GS classification
        lead_score = float(lead["genetic_association_score"]) if lead else None
        old_gs = ticker_rows[0]["is_gs"]

        for thresh in GS_THRESHOLDS:
            col = f"is_gs_at_{str(thresh).replace('.', '_')}"
            val = "True" if (lead_score is not None and lead_score > thresh) else "False"
            # Diagnostic override
            if ticker in DIAGNOSTIC_COMPANIES:
                val = "False"
            for r in ticker_rows:
                r[col] = val

        is_gs = "True" if (lead_score is not None and lead_score > 0.10 and ticker not in DIAGNOSTIC_COMPANIES) else "False"

        # Mendelian-only GS
        mendelian_gs = "False"
        if is_gs == "True" and lead:
            ep = lead.get("evidence_predates_2020", "")
            if ep == "True":
                mendelian_gs = "True"

        # Track changes
        if old_gs != is_gs:
            gs_changes.append((ticker, old_gs, is_gs, lead_score))

        # Write back to all rows for this ticker
        for r in ticker_rows:
            r["n_confirmed_pairs"] = str(n_confirmed)
            r["n_confirmed_gs_pairs"] = str(n_confirmed_gs)
            r["best_confirmed_score"] = str(best_confirmed) if best_confirmed > 0 else ""
            r["is_gs"] = is_gs
            r["mendelian_only_gs"] = mendelian_gs
            if lead:
                r["lead_phase"] = lead["phase"]
                r["lead_phase_rank"] = str(PHASE_RANK.get(lead["phase"], 0))
                r["lead_score"] = lead["genetic_association_score"]
                r["lead_gene"] = lead["gene_symbol"]
                r["lead_ensembl_id"] = lead["ensembl_id"]
                r["lead_efo_id"] = lead["disease_efo_id"]
                r["lead_conditions"] = lead["conditions"]
                r["lead_ot_source"] = lead["ot_score_source"]
                r["lead_evidence_predates_2020"] = lead["evidence_predates_2020"]
                r["lead_datasources"] = lead["genetic_datasources"]
                r["lead_confirmed_pre_2020"] = lead["confirmed_pre_2020"]
                r["lead_validation_method"] = lead["bq_validation_method"]
            else:
                # No confirmed lead
                for col in ["lead_phase", "lead_phase_rank", "lead_score", "lead_gene",
                            "lead_ensembl_id", "lead_efo_id", "lead_conditions",
                            "lead_ot_source", "lead_evidence_predates_2020",
                            "lead_datasources", "lead_confirmed_pre_2020",
                            "lead_validation_method"]:
                    r[col] = ""

    # Write output
    with open(OUTPUT_PATH, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter="\t")
        writer.writeheader()
        writer.writerows(rows)
    print(f"\nWrote {OUTPUT_PATH} ({len(rows)} rows)")

    # Summary
    n_gs = len(set(
        r["ticker"] for r in rows if r["is_gs"] == "True"
    ))
    print(f"\nGS companies at 0.10: {n_gs}")

    if gs_changes:
        print(f"\nGS classification changes ({len(gs_changes)}):")
        for ticker, old, new, score in gs_changes:
            print(f"  {ticker}: {old} -> {new} (lead_score={score})")
    else:
        print("\nNo GS classification changes.")


if __name__ == "__main__":
    main()
