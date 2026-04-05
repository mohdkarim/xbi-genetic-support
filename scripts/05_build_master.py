#!/usr/bin/env python3
"""
05_build_master.py — Build master.tsv (one row per company)

Collapses scored_pipeline.tsv (row-per-trial) → 1 row per company.
Joins stock returns from stock_prices_daily.json.
Joins company name from XBI_holdings_20191231_enriched.tsv.

Output: target3/final/master.tsv
"""

import json
import pandas as pd
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
BASE = Path(__file__).resolve().parents[1]
SCORED_PIPELINE = BASE / "processed/scored_pipeline.tsv"
RETURNS_JSON    = BASE / "processed/stock_prices_daily.json"
HOLDINGS_TSV    = BASE / "processed/XBI_holdings_20191231_enriched.tsv"
OUT_DIR         = BASE / "final"
OUT_TSV         = OUT_DIR / "master.tsv"

OUT_DIR.mkdir(parents=True, exist_ok=True)

PHASE_RANK = {
    "PHASE4":       6,
    "PHASE3":       5,
    "PHASE2/PHASE3":4,
    "PHASE2":       3,
    "PHASE1/PHASE2":2,
    "PHASE1":       1,
    "EARLY_PHASE1": 0,
    "PRECLINICAL":  -1,
}

print("=" * 70)
print("05_build_master.py — Collapse pipeline to 1 row per company")
print("=" * 70)

# ── Load inputs ──────────────────────────────────────────────────────────────
print("\n[1/4] Loading inputs...")

pipeline = pd.read_csv(SCORED_PIPELINE, sep="\t", low_memory=False)
print(f"  scored_pipeline.tsv: {len(pipeline):,} rows, {pipeline['ticker'].nunique()} tickers")

with open(RETURNS_JSON) as f:
    returns_data = json.load(f)
returns_df = pd.DataFrame(returns_data.values())
print(f"  stock_prices_daily.json: {len(returns_df)} tickers")

holdings = pd.read_csv(HOLDINGS_TSV, sep="\t", low_memory=False)
holdings_lookup = (
    holdings[["TICKER", "ISSUER_NAME"]]
    .drop_duplicates("TICKER")
    .set_index("TICKER")["ISSUER_NAME"]
    .to_dict()
)
print(f"  XBI_holdings: {len(holdings_lookup)} tickers")

# ── Step 1: Company-level metadata from pipeline ────────────────────────────
print("\n[2/4] Extracting company-level metadata...")

company_cols = [
    "n_scoreable_pairs", "n_scored_pairs", "best_score",
    "lead_phase", "lead_phase_rank", "lead_score",
    "lead_gene", "lead_ensembl_id", "lead_efo_id", "lead_conditions",
    "lead_is_direct", "lead_datasources",
    "lead_nct_id", "lead_drug", "lead_trial_start", "lead_chembl_id",
    "lead_mapping_source", "lead_efo_mapping_source", "lead_gene_source",
    "lead_override_note",
    "is_gs",
]

# Filter to columns that actually exist
company_cols = [c for c in company_cols if c in pipeline.columns]

company_meta = (
    pipeline
    .groupby("ticker", sort=False)
    .first()
    [company_cols]
    .reset_index()
)

# ── Step 2: Select best-scoring row per company ─────────────────────────────
print("[3/4] Selecting best asset per company...")

pipeline["phase_rank"] = pipeline["phase"].map(PHASE_RANK).fillna(0)

has_score = (
    pipeline["is_scoreable"].fillna(False).astype(bool)
    & pipeline["genetic_association_score"].notna()
)

scoreable_with_score = pipeline[has_score].copy()
scoreable_with_score = scoreable_with_score.sort_values(
    ["ticker", "genetic_association_score", "phase_rank"],
    ascending=[True, False, False],
)
best_scored = scoreable_with_score.groupby("ticker", sort=False).first().reset_index()

all_tickers = pipeline["ticker"].unique()
best_rows = []

for ticker in all_tickers:
    if ticker in best_scored["ticker"].values:
        row = best_scored[best_scored["ticker"] == ticker].iloc[0]
    else:
        # No scored rows — prefer valid rows sorted by phase, then any row
        ticker_rows = pipeline[pipeline["ticker"] == ticker]
        valid_rows = ticker_rows[ticker_rows["row_flag"] == "valid"].sort_values(
            "phase_rank", ascending=False)
        if len(valid_rows) > 0:
            row = valid_rows.iloc[0]
        else:
            row = ticker_rows.iloc[0]
    best_rows.append(row)

best_df = pd.DataFrame(best_rows).reset_index(drop=True)
print(f"  Best rows selected: {len(best_df)} (one per ticker)")

# ── Step 3: Assemble master row per company ──────────────────────────────────
print("[4/4] Assembling master...")

def count_unique_targets(ticker_rows: pd.DataFrame) -> int:
    symbols = ticker_rows["gene_symbol"].dropna().str.strip()
    symbols = symbols[symbols != ""]
    return len(symbols.unique())

grouped = {ticker: grp for ticker, grp in pipeline.groupby("ticker")}
unique_target_map = {t: count_unique_targets(g) for t, g in grouped.items()}

rows = []
for _, best in best_df.iterrows():
    ticker = best["ticker"]

    company = holdings_lookup.get(ticker, best.get("sponsor_name", ""))
    if pd.isna(company):
        company = ""

    ret = returns_data.get(ticker, {})

    # Lead program details from company_meta
    meta = company_meta[company_meta["ticker"] == ticker]
    if len(meta) > 0:
        m = meta.iloc[0]
        lead_phase = m.get("lead_phase", "")
        lead_score = m.get("lead_score")
        lead_gene = m.get("lead_gene", "")
        lead_ensembl_id = m.get("lead_ensembl_id", "")
        lead_efo_id = m.get("lead_efo_id", "")
        lead_conditions = m.get("lead_conditions", "")
        lead_is_direct = m.get("lead_is_direct")
        lead_datasources = m.get("lead_datasources", "")
        lead_nct_id = m.get("lead_nct_id", "")
        lead_drug = m.get("lead_drug", "")
        lead_trial_start = m.get("lead_trial_start", "")
        lead_chembl_id = m.get("lead_chembl_id", "")
        lead_mapping_source = m.get("lead_mapping_source", "")
        lead_efo_mapping_source = m.get("lead_efo_mapping_source", "")
        lead_gene_source = m.get("lead_gene_source", "")
        lead_override_note = m.get("lead_override_note", "")
        is_gs = bool(m.get("is_gs", False))
        n_scoreable = m.get("n_scoreable_pairs")
        n_scored = m.get("n_scored_pairs")
        best_score_val = m.get("best_score")
    else:
        lead_phase = lead_gene = lead_efo_id = lead_conditions = lead_datasources = ""
        lead_ensembl_id = ""
        lead_nct_id = lead_drug = lead_trial_start = lead_chembl_id = ""
        lead_mapping_source = lead_efo_mapping_source = lead_gene_source = lead_override_note = ""
        lead_score = best_score_val = None
        lead_is_direct = None
        is_gs = False
        n_scoreable = n_scored = 0

    # Best asset details (from best row)
    drug_name = best.get("intervention_name", "")
    target_gene = best.get("gene_symbol", "")
    ensembl_id = best.get("ensembl_id", "")
    efo_id = best.get("disease_efo_id", "")
    ga_score = best.get("genetic_association_score")
    is_direct = best.get("is_direct")
    germline_ds = best.get("germline_datasources", "")
    gene_source = best.get("gene_source", "missing")

    # Best-row trial details (available for ALL companies)
    best_nct_id = best.get("nct_id", "")
    best_trial_start = best.get("start_date", "")
    best_drug_chembl = best.get("drug_chembl_id", "")
    best_mapping_src = best.get("mapping_source", "")
    best_efo_mapping = best.get("efo_mapping_source", "")
    best_phase = best.get("phase", "")

    # Oncology from conditions
    conditions = str(best.get("conditions", "") or "").lower()
    is_onco = any(kw in conditions for kw in [
        "cancer", "tumor", "tumour", "leukemia", "leukaemia", "lymphoma",
        "myeloma", "sarcoma", "carcinoma", "glioma", "melanoma",
        "adenocarcinoma", "hepatoma", "blastoma",
    ])

    row_flag = best.get("row_flag", "valid")
    company_type = "diagnostics_platform" if row_flag == "diagnostic_platform" else "biotech"

    # Classification reason
    tg = str(target_gene) if pd.notna(target_gene) else ""
    eid = str(ensembl_id) if pd.notna(ensembl_id) else ""
    efoid = str(efo_id) if pd.notna(efo_id) else ""
    gs_str = str(gene_source) if pd.notna(gene_source) else "missing"

    if is_gs:
        nongs_reason = ""
    elif company_type == "diagnostics_platform":
        nongs_reason = "diagnostic_platform"
    elif pd.notna(lead_score) and float(lead_score) <= 0.80:
        nongs_reason = "scored_below_threshold"
    elif tg.strip() not in ("", "nan") and eid.strip() not in ("", "nan") and efoid.strip() not in ("", "nan"):
        nongs_reason = "no_ot_match"
    elif tg.strip() in ("", "nan") or gs_str == "missing":
        nongs_reason = "no_gene_mapped"
    else:
        nongs_reason = "no_efo_mapped"

    rows.append({
        "ticker":                   ticker,
        "company":                  company,
        "company_type":             company_type,
        "drug_name":                drug_name if pd.notna(drug_name) else "",
        "target_gene":              target_gene if pd.notna(target_gene) else "",
        "gene_source":              gene_source if pd.notna(gene_source) else "missing",
        "ensembl_id":               ensembl_id if pd.notna(ensembl_id) else "",
        "efo_id":                   efo_id if pd.notna(efo_id) else "",
        "indication":               str(best.get("conditions", ""))[:120] if pd.notna(best.get("conditions")) else "",
        "is_oncology":              is_onco,
        "n_scoreable_pairs":        int(n_scoreable) if pd.notna(n_scoreable) else 0,
        "n_scored_pairs":           int(n_scored) if pd.notna(n_scored) else 0,
        "best_score":               round(float(best_score_val), 6) if pd.notna(best_score_val) else None,
        "lead_phase":               str(lead_phase) if pd.notna(lead_phase) else "",
        "lead_score":               round(float(lead_score), 6) if pd.notna(lead_score) else None,
        "lead_gene":                str(lead_gene) if pd.notna(lead_gene) else "",
        "lead_ensembl_id":          str(lead_ensembl_id) if pd.notna(lead_ensembl_id) else "",
        "lead_efo_id":              str(lead_efo_id) if pd.notna(lead_efo_id) else "",
        "lead_conditions":          str(lead_conditions)[:120] if pd.notna(lead_conditions) else "",
        "lead_is_direct":           bool(lead_is_direct) if pd.notna(lead_is_direct) else None,
        "lead_datasources":         str(lead_datasources) if pd.notna(lead_datasources) else "",
        "lead_nct_id":              str(lead_nct_id) if pd.notna(lead_nct_id) else "",
        "lead_drug":                str(lead_drug) if pd.notna(lead_drug) else "",
        "lead_trial_start":         str(lead_trial_start)[:10] if pd.notna(lead_trial_start) else "",
        "lead_chembl_id":           str(lead_chembl_id) if pd.notna(lead_chembl_id) else "",
        "lead_mapping_source":      str(lead_mapping_source) if pd.notna(lead_mapping_source) else "",
        "lead_efo_mapping_source":  str(lead_efo_mapping_source) if pd.notna(lead_efo_mapping_source) else "",
        "lead_gene_source":         str(lead_gene_source) if pd.notna(lead_gene_source) else "",
        "lead_override_note":       str(lead_override_note) if pd.notna(lead_override_note) else "",
        "best_pair_ga_score":       round(float(ga_score), 6) if pd.notna(ga_score) else None,
        "best_pair_is_direct":      bool(is_direct) if pd.notna(is_direct) else None,
        "best_pair_datasources":    str(germline_ds) if pd.notna(germline_ds) else "",
        "is_gs":                    is_gs,
        "nongs_reason":             nongs_reason,
        "best_nct_id":              str(best_nct_id) if pd.notna(best_nct_id) else "",
        "best_trial_start":         str(best_trial_start)[:10] if pd.notna(best_trial_start) else "",
        "best_drug_chembl_id":      str(best_drug_chembl) if pd.notna(best_drug_chembl) else "",
        "best_mapping_source":      str(best_mapping_src) if pd.notna(best_mapping_src) else "",
        "best_efo_mapping_source":  str(best_efo_mapping) if pd.notna(best_efo_mapping) else "",
        "best_phase":               str(best_phase) if pd.notna(best_phase) else "",
        "return_total_pct":         ret.get("return_total_pct"),
        "price_start":              ret.get("price_start"),
        "price_end":                ret.get("price_end"),
        "date_start":               ret.get("date_start", "2020-01-02"),
        "date_end":                 ret.get("date_end", ""),
        "return_source":            ret.get("return_source", ""),
        "outcome":                  ret.get("outcome", "unknown"),
        "acquirer":                 ret.get("acquirer", ""),
        "n_unique_targets":         unique_target_map.get(ticker, 0),
    })

master = pd.DataFrame(rows)
print(f"  Master rows: {len(master)} (expected: 126)")

# ── Validation ───────────────────────────────────────────────────────────────
print("\nValidation & summary...")

n_returns = master["return_total_pct"].notna().sum()
n_gs = master["is_gs"].sum()
n_total = len(master)

print(f"\n  Returns coverage: {n_returns}/{n_total}")
print(f"  GS (lead score > 0.80): {n_gs} tickers")
print(f"  Non-GS:                 {n_total - n_gs} tickers")

print("\n  Outcome distribution:")
print(master["outcome"].value_counts().to_string())

# Spot checks
spot_checks = [
    ("GILD",  "GS, large pharma"),
    ("ALNY",  "GS, score=1.0"),
    ("NTRA",  "diagnostic, non-GS"),
    ("EXAS",  "diagnostic, non-GS"),
]
print("\n  Spot checks:")
for ticker, note in spot_checks:
    row = master[master["ticker"] == ticker]
    if len(row) == 0:
        print(f"    {ticker}: NOT FOUND — {note}")
        continue
    r = row.iloc[0]
    ret_str = f"return={r['return_total_pct']:.1f}%" if pd.notna(r['return_total_pct']) else "return=MISSING"
    gs_str = f"gs={r['is_gs']}"
    lead_str = f"lead_score={r['lead_score']:.4f}" if pd.notna(r['lead_score']) else "lead_score=null"
    print(f"    {ticker}: {ret_str}, {gs_str}, {lead_str}  <- {note}")

# ── Write output ─────────────────────────────────────────────────────────────
master.to_csv(OUT_TSV, sep="\t", index=False)
print(f"\nOutput: {OUT_TSV}")
print(f"Columns: {len(master.columns)}")
print("Done.")
