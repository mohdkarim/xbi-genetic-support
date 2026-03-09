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
import numpy as np
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
BASE = Path(__file__).resolve().parents[1]
SCORED_PIPELINE = BASE / "processed/scored_pipeline.tsv"
RETURNS_JSON    = BASE / "processed/stock_prices_daily.json"
HOLDINGS_TSV    = BASE / "processed/XBI_holdings_20191231_enriched.tsv"
OUT_DIR         = BASE / "final"
OUT_TSV         = OUT_DIR / "master.tsv"

OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Phase order for best-row selection ──────────────────────────────────────
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
print("\n[1/5] Loading inputs...")

pipeline = pd.read_csv(SCORED_PIPELINE, sep="\t", low_memory=False)
print(f"  scored_pipeline.tsv: {len(pipeline):,} rows, {pipeline['ticker'].nunique()} tickers")

with open(RETURNS_JSON) as f:
    returns_data = json.load(f)
returns_df = pd.DataFrame(returns_data.values())
print(f"  stock_prices_daily.json: {len(returns_df)} tickers")

holdings = pd.read_csv(HOLDINGS_TSV, sep="\t", low_memory=False)
# Build ticker → company name lookup
# Use ISSUER_NAME as company name
holdings_lookup = (
    holdings[["TICKER", "ISSUER_NAME"]]
    .drop_duplicates("TICKER")
    .set_index("TICKER")["ISSUER_NAME"]
    .to_dict()
)
print(f"  XBI_holdings: {len(holdings_lookup)} tickers")

# ── Step 1: Company-level metadata from pipeline ─────────────────────────────
print("\n[2/5] Extracting company-level metadata...")

# Columns that are already company-level (same value on every row for a ticker)
company_cols = [
    "n_scoreable_pairs", "n_gs_pairs", "pct_gs_pairs",
    "best_genetic_assoc_score",
    "is_company_gs_A", "is_company_gs_B",
    "is_company_gs_A_at_0_2", "is_company_gs_A_at_0_4", "is_company_gs_A_at_0_8",
    "is_company_gs_B_at_0_05", "is_company_gs_B_at_0_15", "is_company_gs_B_at_0_2",
    "mendelian_only_gs_A",
    "is_gs_A_prop_10", "is_gs_A_prop_20", "is_gs_A_prop_50", "is_gs_A_prop_70",
]

company_meta = (
    pipeline
    .groupby("ticker", sort=False)
    .first()  # All these are identical across rows for same ticker
    [company_cols]
    .reset_index()
)

# ── Step 2: Select best-scoring row per company ──────────────────────────────
# "Best row" = highest genetic_association_score among scoreable rows,
# with phase preference (PHASE3 > PHASE2 > PHASE1) as secondary sort.
# For diagnostic companies there are no scoreable rows → best row = the single row.

print("[3/5] Selecting best asset per company...")

# Add phase rank for sorting
pipeline["phase_rank"] = pipeline["phase"].map(PHASE_RANK).fillna(0)

# Scoreable rows with an actual score
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

# Scoreable rows without a score (gene+EFO present but OT pair missing)
scoreable_no_score = (
    pipeline["is_scoreable"].fillna(False).astype(bool)
    & pipeline["genetic_association_score"].isna()
)
scoreable_no_score_df = pipeline[scoreable_no_score].sort_values(
    ["ticker", "phase_rank"], ascending=[True, False]
)
best_no_score = scoreable_no_score_df.groupby("ticker", sort=False).first().reset_index()

# Non-scoreable (diagnostic, combination, missing gene) — just take first row per ticker
non_scoreable = ~pipeline["ticker"].isin(scoreable_with_score["ticker"].unique())
non_scoreable_df = pipeline[non_scoreable | pipeline["ticker"].isin(
    best_no_score["ticker"].unique()
)]
# Actually: build a complete set per ticker priority
# Priority: best_scored > best_no_score (scoreable but no OT pair) > any first row

all_tickers = pipeline["ticker"].unique()
best_rows = []

for ticker in all_tickers:
    if ticker in best_scored["ticker"].values:
        row = best_scored[best_scored["ticker"] == ticker].iloc[0]
    elif ticker in best_no_score["ticker"].values:
        row = best_no_score[best_no_score["ticker"] == ticker].iloc[0]
    else:
        # Diagnostic platforms or fully non-scoreable
        row = pipeline[pipeline["ticker"] == ticker].iloc[0]
    best_rows.append(row)

best_df = pd.DataFrame(best_rows).reset_index(drop=True)
print(f"  Best rows selected: {len(best_df)} (one per ticker)")

# ── Step 3: Compute per-company derived columns ──────────────────────────────
print("[4/5] Computing derived columns...")

def classify_gene_source_company(ticker_rows: pd.DataFrame) -> str:
    """Summarise gene_source for the best scoreable pairs of a company."""
    scoreable = ticker_rows[ticker_rows["is_scoreable"].fillna(False).astype(bool)]
    if len(scoreable) == 0:
        return "missing"
    sources = set(scoreable["gene_source"].dropna().unique())
    if "chembl" in sources:
        return "chembl"
    if "monogenic_causal" in sources:
        return "monogenic_causal"
    if "web_search" in sources:
        return "web_search"
    return "missing"

def get_ot_score_sources(ticker_rows: pd.DataFrame) -> str:
    """Return comma-separated unique ot_score_source values for scoreable rows."""
    scoreable = ticker_rows[ticker_rows["is_scoreable"].fillna(False).astype(bool)]
    src = scoreable["ot_score_source"].dropna().unique().tolist()
    return ",".join(src) if src else ""

def get_evidence_predates_str(ticker_rows: pd.DataFrame) -> str:
    """Summarise evidence_predates_2020 for a company."""
    scoreable = ticker_rows[
        ticker_rows["is_scoreable"].fillna(False).astype(bool)
        & ticker_rows["genetic_association_score"].notna()
    ]
    vals = set(scoreable["evidence_predates_2020"].dropna().unique())
    if not vals:
        return ""
    if vals == {"True"}:
        return "True"
    if "uncertain" in vals:
        return "uncertain"
    return ",".join(str(v) for v in vals)

def primary_indication(ticker_rows: pd.DataFrame) -> tuple[str, bool]:
    """
    Return (indication_string, is_oncology_primary).
    Use the best-scoring row's conditions; fall back to any non-empty conditions.
    """
    scoreable = ticker_rows[
        ticker_rows["is_scoreable"].fillna(False).astype(bool)
        & ticker_rows["genetic_association_score"].notna()
    ].sort_values(
        ["genetic_association_score", "phase_rank"], ascending=[False, False]
    )
    for col in [scoreable, ticker_rows]:
        for _, r in col.iterrows():
            cond = str(r.get("conditions", "")).strip()
            if cond and cond.lower() not in ("nan", "none", ""):
                is_onco = bool(r.get("is_oncology", False))
                return cond[:120], is_onco
    return "", False

def has_combination_rows_flag(ticker_rows: pd.DataFrame) -> bool:
    return (ticker_rows["row_flag"] == "combination_partner").any()

def pipeline_source_summary(ticker_rows: pd.DataFrame) -> str:
    """ctgov / monogenic_causal / web_search or combo."""
    scoreable = ticker_rows[ticker_rows["is_scoreable"].fillna(False).astype(bool)]
    if len(scoreable) == 0:
        return "ctgov"
    sources = []
    if scoreable["data_source"].str.lower().str.contains("ctgov|clinicaltrials", na=False).any():
        sources.append("ctgov")
    if (scoreable["gene_source"] == "monogenic_causal").any():
        sources.append("monogenic_causal")
    if (scoreable["gene_source"] == "web_search").any():
        sources.append("web_search")
    return ",".join(sources) if sources else "ctgov"

# Compute per-ticker derived metrics
grouped = {ticker: grp for ticker, grp in pipeline.groupby("ticker")}

gene_source_map       = {t: classify_gene_source_company(g)    for t, g in grouped.items()}
ot_sources_map        = {t: get_ot_score_sources(g)             for t, g in grouped.items()}
evidence_pred_map     = {t: get_evidence_predates_str(g)        for t, g in grouped.items()}
indic_map             = {t: primary_indication(g)               for t, g in grouped.items()}
has_comb_map          = {t: has_combination_rows_flag(g)        for t, g in grouped.items()}
pipeline_source_map   = {t: pipeline_source_summary(g)          for t, g in grouped.items()}

# ── Step 4: Assemble master row per company ──────────────────────────────────
rows = []
for _, best in best_df.iterrows():
    ticker = best["ticker"]

    # Company name
    company = holdings_lookup.get(ticker, best.get("sponsor_name", ""))
    if pd.isna(company):
        company = ""

    # Returns
    ret = returns_data.get(ticker, {})
    return_total_pct = ret.get("return_total_pct")
    return_source    = ret.get("return_source", "")
    return_estimated = ret.get("return_estimated", True)
    outcome          = ret.get("outcome", best.get("outcome", "unknown"))
    acquirer         = ret.get("acquirer")
    price_start      = ret.get("price_start")
    price_end        = ret.get("price_end")
    date_start       = ret.get("date_start", "2020-01-02")
    date_end         = ret.get("date_end", "")

    # Derived
    gene_source_co  = gene_source_map.get(ticker, "missing")
    ot_sources      = ot_sources_map.get(ticker, "")
    evidence_pred   = evidence_pred_map.get(ticker, "")
    indic, is_onco  = indic_map.get(ticker, ("", False))
    has_comb        = has_comb_map.get(ticker, False)
    pipe_source     = pipeline_source_map.get(ticker, "ctgov")

    # GS flags from per-ticker meta (first occurrence already consistent)
    n_sc   = best.get("n_scoreable_pairs")
    n_gs   = best.get("n_gs_pairs")
    pct_gs = best.get("pct_gs_pairs")
    best_score = best.get("best_genetic_assoc_score")

    gs_A         = best.get("is_company_gs_A", False)
    gs_A_020     = best.get("is_company_gs_A_at_0_2", False)
    gs_A_040     = best.get("is_company_gs_A_at_0_4", False)
    gs_A_080     = best.get("is_company_gs_A_at_0_8", False)
    gs_B         = best.get("is_company_gs_B", False)
    gs_B_005     = best.get("is_company_gs_B_at_0_05", False)
    gs_B_015     = best.get("is_company_gs_B_at_0_15", False)
    gs_B_020     = best.get("is_company_gs_B_at_0_2", False)
    mend_gs_A    = best.get("mendelian_only_gs_A", False)

    gs_A_p10     = best.get("is_gs_A_prop_10", False)
    gs_A_p20     = best.get("is_gs_A_prop_20", False)
    gs_A_p50     = best.get("is_gs_A_prop_50", False)
    gs_A_p70     = best.get("is_gs_A_prop_70", False)

    # Company type
    row_flag = best.get("row_flag", "valid")
    company_type = "diagnostics_platform" if row_flag == "diagnostic_platform" else "biotech"

    # Best asset details
    drug_name   = best.get("intervention_name", "")
    chembl_id   = best.get("drug_chembl_id", "")
    target_gene = best.get("gene_symbol", "")
    ensembl_id  = best.get("ensembl_id", "")
    efo_id      = best.get("disease_efo_id", "")
    ga_score    = best.get("genetic_association_score")
    ot_src      = best.get("ot_score_source", "")
    ev_pred     = best.get("evidence_predates_2020", "")
    gen_datasrc = best.get("genetic_datasources", "")

    # is_oncology primary
    is_oncology_primary = bool(is_onco)

    rows.append({
        "ticker":                   ticker,
        "company":                  company,
        "was_in_xbi_jan2020":       True,
        "company_type":             company_type,
        "drug_name":                drug_name if pd.notna(drug_name) else "",
        "chembl_id":                chembl_id if pd.notna(chembl_id) else "",
        "target_gene":              target_gene if pd.notna(target_gene) else "",
        "gene_source":              gene_source_co,
        "indication":               indic,
        "ensembl_id":               ensembl_id if pd.notna(ensembl_id) else "",
        "efo_id":                   efo_id if pd.notna(efo_id) else "",
        "n_scoreable_pairs":        int(n_sc)   if pd.notna(n_sc)   else 0,
        "n_gs_pairs":               int(n_gs)   if pd.notna(n_gs)   else 0,
        "pct_gs_pairs":             round(float(pct_gs), 4) if pd.notna(pct_gs) else None,
        "best_genetic_assoc_score": round(float(best_score), 6) if pd.notna(best_score) else None,
        "best_pair_ga_score":       round(float(ga_score), 6) if pd.notna(ga_score) else None,
        "ot_score_source_best":     str(ot_src) if pd.notna(ot_src) else "",
        "ot_score_sources_all":     ot_sources,
        "evidence_predates_2020":   str(evidence_pred),
        "genetic_datasources":      str(gen_datasrc) if pd.notna(gen_datasrc) else "",
        "is_company_gs_A":          bool(gs_A),
        "gs_A_at_0_20":             bool(gs_A_020),
        "gs_A_at_0_40":             bool(gs_A_040),
        "gs_A_at_0_80":             bool(gs_A_080),
        "is_company_gs_B":          bool(gs_B),
        "gs_B_at_0_05":             bool(gs_B_005),
        "gs_B_at_0_15":             bool(gs_B_015),
        "gs_B_at_0_20":             bool(gs_B_020),
        "mendelian_only_gs_A":      bool(mend_gs_A),
        "gs_A_prop_10":             bool(gs_A_p10),
        "gs_A_prop_20":             bool(gs_A_p20),
        "gs_A_prop_50":             bool(gs_A_p50),
        "gs_A_prop_70":             bool(gs_A_p70),
        "return_total_pct":         return_total_pct,
        "price_start":              price_start,
        "price_end":                price_end,
        "date_start":               date_start,
        "date_end":                 date_end,
        "return_source":            return_source,
        "return_estimated":         bool(return_estimated),
        "outcome":                  outcome,
        "acquirer":                 acquirer if acquirer else "",
        "is_oncology_primary":      is_oncology_primary,
        "has_combination_rows":     bool(has_comb),
        "pipeline_source":          pipe_source,
    })

master = pd.DataFrame(rows)
print(f"  Master rows: {len(master)} (expected: 126)")

# ── Validation ───────────────────────────────────────────────────────────────
print("\n[5/5] Validation & summary...")

n_returns    = master["return_total_pct"].notna().sum()
n_missing_rt = master["return_total_pct"].isna().sum()
n_gs_A       = master["is_company_gs_A"].sum()
n_gs_B       = master["is_company_gs_B"].sum()
n_mend       = master["mendelian_only_gs_A"].sum()
n_diag       = (master["company_type"] == "diagnostics_platform").sum()

print(f"\n  Returns coverage: {n_returns}/{len(master)} ({n_missing_rt} missing)")
print(f"  GS-A (≥50% pairs >0.10):     {n_gs_A} tickers")
print(f"  GS-B (any Ph2/3/4 >0.10):    {n_gs_B} tickers")
print(f"  Mendelian-only GS-A:          {n_mend} tickers")
print(f"  Diagnostic platforms:         {n_diag} tickers")
print(f"  non-GS-A:                     {len(master) - n_gs_A}")

print("\n  Outcome distribution:")
print(master["outcome"].value_counts().to_string())

print("\n  Return source breakdown:")
print(master["return_source"].value_counts().to_string())

# Spot checks
spot_checks = [
    ("ALNY",  "GS-A=True, best_score=1.0"),
    ("NTRA",  "return ~537%, non-GS (diagnostic)"),
    ("AMGN",  "return ~89%, GS-B (large-cap)"),
    ("IMGN",  "return ~651%, GS (acquired at premium)"),
    ("EXAS",  "diagnostic, non-GS, return present"),
    ("ABBV",  "GS-A=True, large pharma, many pairs"),
    ("GILD",  "check GS — HIV is viral target"),
]
print("\n  Spot checks:")
for ticker, note in spot_checks:
    row = master[master["ticker"] == ticker]
    if len(row) == 0:
        print(f"    ❌ {ticker}: NOT FOUND — {note}")
        continue
    r = row.iloc[0]
    ret_str = f"return={r['return_total_pct']:.1f}%" if pd.notna(r['return_total_pct']) else "return=MISSING"
    gs_str = f"gs_A={r['is_company_gs_A']}, gs_B={r['is_company_gs_B']}"
    score_str = f"best_score={r['best_genetic_assoc_score']}" if pd.notna(r['best_genetic_assoc_score']) else "best_score=null"
    print(f"    {ticker}: {ret_str}, {gs_str}, {score_str}  ← {note}")

# ── Write output ─────────────────────────────────────────────────────────────
master.to_csv(OUT_TSV, sep="\t", index=False)
print(f"\nOutput: {OUT_TSV}")
print(f"Columns: {len(master.columns)}")
print("Done.")
