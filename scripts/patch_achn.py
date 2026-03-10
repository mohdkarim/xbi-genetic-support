"""Patch ACHN's GS status: bq_ancestor validation for CFD→C3 Glomerulonephritis
found NO matching ancestor in BQ association tables. Remove confirmed status."""
import csv
from pathlib import Path

BASE = Path(__file__).parent.parent
TSV = BASE / "processed" / "scored_pipeline.tsv"

rows = []
with open(TSV) as f:
    reader = csv.DictReader(f, delimiter='\t')
    fieldnames = reader.fieldnames
    for row in reader:
        if row["ticker"] != "ACHN":
            rows.append(row)
            continue

        # Row-level: clear bq_ancestor validation on scored CFD→MONDO_0013892 rows
        if (row["gene_symbol"] == "CFD" and
            row["disease_efo_id"] == "MONDO_0013892" and
            row["bq_validation_method"] == "bq_ancestor"):
            row["confirmed_pre_2020"] = "False"
            row["bq_validation_method"] = ""
            row["bq_earliest_date"] = ""

        # Company-level: update confirmed counts and GS status
        row["n_confirmed_pairs"] = "0"
        row["n_confirmed_gs_pairs"] = "0"
        row["best_confirmed_score"] = "0"
        row["lead_confirmed_pre_2020"] = "False"
        row["lead_validation_method"] = ""
        row["is_gs_at_0_1"] = "False"
        row["is_gs_at_0_5"] = "False"
        row["is_gs_at_0_8"] = "False"
        row["is_gs"] = "False"
        row["mendelian_only_gs"] = "False"

        rows.append(row)

with open(TSV, 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t')
    writer.writeheader()
    writer.writerows(rows)

# Verify
gs_count = sum(1 for r in rows if r["is_gs"] == "True")
tickers = sorted(set(r["ticker"] for r in rows if r["is_gs"] == "True"))
print(f"Patched ACHN: is_gs=False, confirmed_pairs=0")
print(f"Total GS companies: {gs_count} -> {len(tickers)} unique tickers")
print(f"ACHN is_gs values: {set(r['is_gs'] for r in rows if r['ticker'] == 'ACHN')}")
