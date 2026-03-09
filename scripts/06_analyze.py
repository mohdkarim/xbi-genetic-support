#!/usr/bin/env python3
"""
06_analyze.py — Portfolio returns, bootstrap CIs, sensitivity analysis

Computes equal-weight portfolio returns for XBI-G vs XBI-nonG using
both GS-A and GS-B definitions. Adds bootstrap 95% CIs (seed=42, 2000 iter).

Output: target3/final/portfolio_results.json + printed summary
"""

import json
import numpy as np
import pandas as pd
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
BASE = Path(__file__).resolve().parents[1]
MASTER_TSV   = BASE / "final/master.tsv"
OUT_DIR      = BASE / "final"
RESULTS_JSON = OUT_DIR / "portfolio_results.json"
OUT_DIR.mkdir(parents=True, exist_ok=True)

print("=" * 70)
print("06_analyze.py — Portfolio Returns & Bootstrap Confidence Intervals")
print("=" * 70)

# ── Load master ──────────────────────────────────────────────────────────────
master = pd.read_csv(MASTER_TSV, sep="\t", low_memory=False)
print(f"\n[1/5] Loaded master.tsv: {len(master)} companies")

# Ensure return column is numeric
master["return_total_pct"] = pd.to_numeric(master["return_total_pct"], errors="coerce")

# All companies should have returns (we verified 126/126 above)
n_missing = master["return_total_pct"].isna().sum()
if n_missing > 0:
    print(f"  ⚠️  {n_missing} companies missing returns — excluded from analysis")
    master = master[master["return_total_pct"].notna()].copy()

print(f"  Companies with returns: {len(master)}")

# ── Helper functions ─────────────────────────────────────────────────────────
def portfolio_return(returns_pct: np.ndarray) -> float:
    """Equal-weight portfolio return (simple average)."""
    return float(np.mean(returns_pct))

def dollar_value(return_pct: float, initial: float = 1000.0) -> float:
    """$1,000 initial investment → end value."""
    return round(initial * (1 + return_pct / 100), 2)

def bootstrap_ci(
    returns_pct: np.ndarray,
    n_iter: int = 2000,
    ci_pct: float = 95.0,
    seed: int = 42,
) -> tuple[float, float]:
    """Percentile bootstrap CI on equal-weight portfolio return."""
    rng = np.random.default_rng(seed)
    boot_means = []
    n = len(returns_pct)
    for _ in range(n_iter):
        sample = rng.choice(returns_pct, size=n, replace=True)
        boot_means.append(np.mean(sample))
    lo = np.percentile(boot_means, (100 - ci_pct) / 2)
    hi = np.percentile(boot_means, 100 - (100 - ci_pct) / 2)
    return round(lo, 2), round(hi, 2)

def portfolio_stats(
    gs_returns: np.ndarray,
    nongs_returns: np.ndarray,
    label_gs: str,
    label_nongs: str,
    n_iter: int = 2000,
    seed: int = 42,
) -> dict:
    """Compute portfolio stats for one GS definition."""
    gs_ret    = portfolio_return(gs_returns)
    nongs_ret = portfolio_return(nongs_returns)

    gs_ci    = bootstrap_ci(gs_returns,    n_iter=n_iter, seed=seed)
    nongs_ci = bootstrap_ci(nongs_returns, n_iter=n_iter, seed=42+1)  # different seed for non-GS

    return {
        "gs_label":              label_gs,
        "nongs_label":           label_nongs,
        "n_gs":                  int(len(gs_returns)),
        "n_nongs":               int(len(nongs_returns)),
        "gs_mean_return_pct":    round(gs_ret, 2),
        "nongs_mean_return_pct": round(nongs_ret, 2),
        "gs_median_return_pct":  round(float(np.median(gs_returns)), 2),
        "nongs_median_return_pct": round(float(np.median(nongs_returns)), 2),
        "gs_ci_lo":              gs_ci[0],
        "gs_ci_hi":              gs_ci[1],
        "nongs_ci_lo":           nongs_ci[0],
        "nongs_ci_hi":           nongs_ci[1],
        "gs_dollar_1000":        dollar_value(gs_ret),
        "nongs_dollar_1000":     dollar_value(nongs_ret),
        "alpha_pct":             round(gs_ret - nongs_ret, 2),
    }

# ── Benchmark: XBI ETF ───────────────────────────────────────────────────────
def compute_xbi_return() -> float:
    """Compute XBI ETF return from Jan 2, 2020 to Feb 21, 2026 via yfinance."""
    import yfinance as yf
    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        xbi = yf.download("XBI", start="2019-12-30", end="2026-02-25", progress=False)
    if xbi.empty:
        print("  WARNING: Could not fetch XBI data, using fallback 32.8%")
        return 32.8
    close = xbi["Close"].dropna()
    if isinstance(close, pd.DataFrame):
        close = close.iloc[:, 0]  # handle MultiIndex from yfinance
    start_date, end_date = pd.Timestamp("2020-01-02"), pd.Timestamp("2026-02-21")
    p_start = p_end = None
    for offset in range(10):
        d = start_date + pd.Timedelta(days=offset)
        if d in close.index:
            p_start = float(close[d])
            break
    for offset in range(10):
        d = end_date - pd.Timedelta(days=offset)
        if d in close.index:
            p_end = float(close[d])
            break
    if p_start and p_end:
        return round((p_end / p_start - 1) * 100, 2)
    print("  WARNING: Could not find XBI prices, using fallback 32.8%")
    return 32.8

print("\n  Computing XBI ETF benchmark from yfinance...")
XBI_RETURN_PCT = compute_xbi_return()
print(f"  XBI ETF return: {XBI_RETURN_PCT:+.2f}%")

print("\n[2/5] Computing portfolio returns...")

all_returns = master["return_total_pct"].values

# ── Primary analysis: GS-A ───────────────────────────────────────────────────
gs_A_mask   = master["is_company_gs_A"].fillna(False).astype(bool)
nongs_A_mask = ~gs_A_mask

gs_A_returns   = master.loc[gs_A_mask,   "return_total_pct"].values
nongs_A_returns = master.loc[nongs_A_mask, "return_total_pct"].values

stats_A = portfolio_stats(
    gs_A_returns, nongs_A_returns,
    "XBI-G-A (GS-A: ≥50% pairs >0.10)",
    "XBI-nonG-A",
    n_iter=2000, seed=42
)

# ── Primary analysis: GS-B ───────────────────────────────────────────────────
gs_B_mask   = master["is_company_gs_B"].fillna(False).astype(bool)
nongs_B_mask = ~gs_B_mask

gs_B_returns   = master.loc[gs_B_mask,   "return_total_pct"].values
nongs_B_returns = master.loc[nongs_B_mask, "return_total_pct"].values

stats_B = portfolio_stats(
    gs_B_returns, nongs_B_returns,
    "XBI-G-B (GS-B: any Ph2/3/4 pair >0.10)",
    "XBI-nonG-B",
    n_iter=2000, seed=42
)

# ── Mendelian-only GS ────────────────────────────────────────────────────────
mend_mask   = master["mendelian_only_gs_A"].fillna(False).astype(bool)
nonmend_mask = ~mend_mask

mend_returns   = master.loc[mend_mask,   "return_total_pct"].values
nonmend_returns = master.loc[nonmend_mask, "return_total_pct"].values

stats_mend = portfolio_stats(
    mend_returns, nonmend_returns,
    "XBI-G-Mendelian (Mendelian-only GS-A, zero look-ahead)",
    "XBI-nonG-Mendelian",
    n_iter=2000, seed=42
)

# ── Sensitivity at multiple thresholds ──────────────────────────────────────
print("[3/5] Sensitivity analysis across score thresholds...")

sensitivity = {}
for thresh_col, thresh_label in [
    ("gs_B_at_0_05",  "0.05"),
    ("is_company_gs_B", "0.10"),   # primary
    ("gs_B_at_0_15",  "0.15"),
    ("gs_B_at_0_20",  "0.20"),
]:
    mask = master[thresh_col].fillna(False).astype(bool)
    gs_ret   = master.loc[mask,  "return_total_pct"].values
    ngs_ret  = master.loc[~mask, "return_total_pct"].values
    n_gs     = int(mask.sum())
    n_ngs    = int((~mask).sum())
    gs_mean  = round(float(np.mean(gs_ret)),   2) if len(gs_ret)   > 0 else None
    ngs_mean = round(float(np.mean(ngs_ret)),  2) if len(ngs_ret)  > 0 else None
    alpha    = round(gs_mean - ngs_mean, 2) if gs_mean is not None and ngs_mean is not None else None

    ci = bootstrap_ci(gs_ret, n_iter=2000, seed=42) if len(gs_ret) > 1 else (None, None)

    sensitivity[thresh_label] = {
        "threshold":       float(thresh_label),
        "n_gs":            n_gs,
        "n_nongs":         n_ngs,
        "gs_mean_pct":     gs_mean,
        "nongs_mean_pct":  ngs_mean,
        "alpha_pct":       alpha,
        "gs_ci_lo":        round(ci[0], 2) if ci[0] is not None else None,
        "gs_ci_hi":        round(ci[1], 2) if ci[1] is not None else None,
    }

# ── GS-A sensitivity at multiple thresholds ─────────────────────────────────
sensitivity_A = {}
for thresh_col, thresh_label in [
    ("is_company_gs_A", "0.10"),       # primary
    ("gs_A_at_0_20",    "0.20"),
    ("gs_A_at_0_40",    "0.40"),
    ("gs_A_at_0_80",    "0.80"),
]:
    mask = master[thresh_col].fillna(False).astype(bool)
    gs_ret   = master.loc[mask,  "return_total_pct"].values
    ngs_ret  = master.loc[~mask, "return_total_pct"].values
    n_gs     = int(mask.sum())
    n_ngs    = int((~mask).sum())
    gs_mean  = round(float(np.mean(gs_ret)),   2) if len(gs_ret)   > 0 else None
    ngs_mean = round(float(np.mean(ngs_ret)),  2) if len(ngs_ret)  > 0 else None
    alpha    = round(gs_mean - ngs_mean, 2) if gs_mean is not None and ngs_mean is not None else None

    ci = bootstrap_ci(gs_ret, n_iter=2000, seed=42) if len(gs_ret) > 1 else (None, None)

    sensitivity_A[thresh_label] = {
        "threshold":       float(thresh_label),
        "n_gs":            n_gs,
        "n_nongs":         n_ngs,
        "gs_mean_pct":     gs_mean,
        "nongs_mean_pct":  ngs_mean,
        "alpha_pct":       alpha,
        "gs_ci_lo":        round(ci[0], 2) if ci[0] is not None else None,
        "gs_ci_hi":        round(ci[1], 2) if ci[1] is not None else None,
    }

# ── GS-A pair-proportion sensitivity ──────────────────────────────────────
sensitivity_A_prop = {}
for prop_col, prop_label in [
    ("gs_A_prop_10",  "10%"),
    ("gs_A_prop_20",  "20%"),
    ("gs_A_prop_50",  "50%"),
    ("gs_A_prop_70",  "70%"),
]:
    mask = master[prop_col].fillna(False).astype(bool)
    gs_ret   = master.loc[mask,  "return_total_pct"].values
    ngs_ret  = master.loc[~mask, "return_total_pct"].values
    n_gs     = int(mask.sum())
    n_ngs    = int((~mask).sum())
    gs_mean  = round(float(np.mean(gs_ret)),   2) if len(gs_ret)   > 0 else None
    ngs_mean = round(float(np.mean(ngs_ret)),  2) if len(ngs_ret)  > 0 else None
    alpha    = round(gs_mean - ngs_mean, 2) if gs_mean is not None and ngs_mean is not None else None

    ci = bootstrap_ci(gs_ret, n_iter=2000, seed=42) if len(gs_ret) > 1 else (None, None)

    sensitivity_A_prop[prop_label] = {
        "proportion_threshold": prop_label,
        "n_gs":            n_gs,
        "n_nongs":         n_ngs,
        "gs_mean_pct":     gs_mean,
        "nongs_mean_pct":  ngs_mean,
        "alpha_pct":       alpha,
        "gs_ci_lo":        round(ci[0], 2) if ci[0] is not None else None,
        "gs_ci_hi":        round(ci[1], 2) if ci[1] is not None else None,
    }

# ── Oncology vs non-oncology sub-analysis ───────────────────────────────────
print("[4/5] Sub-group analysis...")

is_onco = master["is_oncology_primary"].fillna(False).astype(bool)

# GS-B within oncology
onco_gs   = master.loc[is_onco & gs_B_mask,  "return_total_pct"].values
onco_ngs  = master.loc[is_onco & nongs_B_mask,"return_total_pct"].values
nonog_gs  = master.loc[~is_onco & gs_B_mask, "return_total_pct"].values
nonog_ngs = master.loc[~is_onco & nongs_B_mask,"return_total_pct"].values

subgroup = {
    "oncology_gs_B_mean_pct":     round(float(np.mean(onco_gs)),  2) if len(onco_gs)  > 0 else None,
    "oncology_nongs_B_mean_pct":  round(float(np.mean(onco_ngs)), 2) if len(onco_ngs) > 0 else None,
    "nonog_gs_B_mean_pct":        round(float(np.mean(nonog_gs)), 2) if len(nonog_gs) > 0 else None,
    "nonog_nongs_B_mean_pct":     round(float(np.mean(nonog_ngs)),2) if len(nonog_ngs)> 0 else None,
    "n_oncology_gs":              int(len(onco_gs)),
    "n_oncology_nongs":           int(len(onco_ngs)),
    "n_nonog_gs":                 int(len(nonog_gs)),
    "n_nonog_nongs":              int(len(nonog_ngs)),
}

# ── Assemble results ─────────────────────────────────────────────────────────
results = {
    "methodology": {
        "start_date": "2020-01-02",
        "end_date":   "2026-02-21",
        "universe":   "XBI Jan 2020 N-PORT holdings",
        "n_companies": int(len(master)),
        "weighting":  "equal-weight",
        "bootstrap_iterations": 2000,
        "bootstrap_seed": 42,
        "ot_data_primary": "OT 20.02 (Feb 2020 release, no look-ahead)",
        "ot_data_fallback": "OT Platform API current (flagged as ot_recent_fallback)",
        "gs_A_definition": "pct_gs_pairs >= 0.50 (≥50% of scoreable pairs have score > 0.10)",
        "gs_B_definition": "any Phase2/3/4 scoreable pair with score > 0.10",
    },
    "benchmarks": {
        "XBI_return_pct":    XBI_RETURN_PCT,
        "XBI_dollar_1000":   dollar_value(XBI_RETURN_PCT),
        "all_universe_mean_pct": round(float(np.mean(all_returns)), 2),
        "all_universe_median_pct": round(float(np.median(all_returns)), 2),
    },
    "primary_GS_A": stats_A,
    "primary_GS_B": stats_B,
    "mendelian_only": stats_mend,
    "sensitivity_GS_A": sensitivity_A,
    "sensitivity_GS_A_proportion": sensitivity_A_prop,
    "sensitivity_GS_B": sensitivity,
    "subgroup": subgroup,
}

# ── Print human-readable summary ─────────────────────────────────────────────
print("\n" + "=" * 70)
print("RESULTS SUMMARY")
print("=" * 70)
print(f"Universe: {len(master)} companies | 2020-01-02 → 2026-02-21 | Equal-weight")
print()
print(f"XBI ETF benchmark:    ${dollar_value(XBI_RETURN_PCT):>8,.2f}  (+{XBI_RETURN_PCT:.1f}%)")
print(f"All-universe mean:    {results['benchmarks']['all_universe_mean_pct']:+.1f}%")
print()

for label, st in [
    ("=== GS-A (≥50% scoreable pairs > 0.10) ===", stats_A),
    ("=== GS-B (any Phase2/3/4 pair > 0.10) ===",  stats_B),
    ("=== Mendelian-only GS-A (zero look-ahead) ===", stats_mend),
]:
    print(label)
    print(f"  {st['gs_label']:<48}  n={st['n_gs']:>3}")
    print(f"    Mean return: {st['gs_mean_return_pct']:+.1f}%   "
          f"[95% CI: {st['gs_ci_lo']:+.1f}% — {st['gs_ci_hi']:+.1f}%]   "
          f"Median: {st['gs_median_return_pct']:+.1f}%   "
          f"${dollar_value(st['gs_mean_return_pct']):>8,.2f}")
    print(f"  {st['nongs_label']:<48}  n={st['n_nongs']:>3}")
    print(f"    Mean return: {st['nongs_mean_return_pct']:+.1f}%   "
          f"[95% CI: {st['nongs_ci_lo']:+.1f}% — {st['nongs_ci_hi']:+.1f}%]   "
          f"Median: {st['nongs_median_return_pct']:+.1f}%   "
          f"${dollar_value(st['nongs_mean_return_pct']):>8,.2f}")
    print(f"  Alpha (GS − non-GS): {st['alpha_pct']:+.1f}%")
    print()

print("=== Sensitivity: GS-B at multiple score thresholds ===")
print(f"{'Threshold':<12} {'n_GS':>6} {'n_nonGS':>8} {'GS mean':>10} {'nonGS mean':>12} "
      f"{'Alpha':>8} {'95% CI low':>12} {'95% CI hi':>10}")
for th, sv in sorted(sensitivity.items(), key=lambda x: float(x[0])):
    ci_lo = f"{sv['gs_ci_lo']:+.1f}%" if sv['gs_ci_lo'] is not None else "   n/a"
    ci_hi = f"{sv['gs_ci_hi']:+.1f}%" if sv['gs_ci_hi'] is not None else "   n/a"
    print(f"  {th:<10} {sv['n_gs']:>6} {sv['n_nongs']:>8} "
          f"{sv['gs_mean_pct']:>+9.1f}% {sv['nongs_mean_pct']:>+11.1f}% "
          f"{sv['alpha_pct']:>+7.1f}% {ci_lo:>12} {ci_hi:>10}")

print()
print("=== Sensitivity: GS-A at multiple score thresholds (≥50% pairs > threshold) ===")
print(f"{'Threshold':<12} {'n_GS':>6} {'n_nonGS':>8} {'GS mean':>10} {'nonGS mean':>12} "
      f"{'Alpha':>8} {'95% CI low':>12} {'95% CI hi':>10}")
for th, sv in sorted(sensitivity_A.items(), key=lambda x: float(x[0])):
    ci_lo = f"{sv['gs_ci_lo']:+.1f}%" if sv['gs_ci_lo'] is not None else "   n/a"
    ci_hi = f"{sv['gs_ci_hi']:+.1f}%" if sv['gs_ci_hi'] is not None else "   n/a"
    gs_mean_str  = f"{sv['gs_mean_pct']:>+9.1f}%" if sv['gs_mean_pct'] is not None else "      n/a "
    ngs_mean_str = f"{sv['nongs_mean_pct']:>+11.1f}%" if sv['nongs_mean_pct'] is not None else "        n/a  "
    alpha_str    = f"{sv['alpha_pct']:>+7.1f}%" if sv['alpha_pct'] is not None else "    n/a"
    print(f"  {th:<10} {sv['n_gs']:>6} {sv['n_nongs']:>8} "
          f"{gs_mean_str} {ngs_mean_str} "
          f"{alpha_str} {ci_lo:>12} {ci_hi:>10}")

print()
print("=== Sensitivity: GS-A by pair proportion (≥X% of scoreable pairs > 0.10) ===")
print(f"{'Proportion':<12} {'n_GS':>6} {'n_nonGS':>8} {'GS mean':>10} {'nonGS mean':>12} "
      f"{'Alpha':>8} {'95% CI low':>12} {'95% CI hi':>10}")
for th in ["10%", "20%", "50%", "70%"]:
    sv = sensitivity_A_prop[th]
    ci_lo = f"{sv['gs_ci_lo']:+.1f}%" if sv['gs_ci_lo'] is not None else "   n/a"
    ci_hi = f"{sv['gs_ci_hi']:+.1f}%" if sv['gs_ci_hi'] is not None else "   n/a"
    gs_mean_str  = f"{sv['gs_mean_pct']:>+9.1f}%" if sv['gs_mean_pct'] is not None else "      n/a "
    ngs_mean_str = f"{sv['nongs_mean_pct']:>+11.1f}%" if sv['nongs_mean_pct'] is not None else "        n/a  "
    alpha_str    = f"{sv['alpha_pct']:>+7.1f}%" if sv['alpha_pct'] is not None else "    n/a"
    print(f"  ≥{th:<9} {sv['n_gs']:>6} {sv['n_nongs']:>8} "
          f"{gs_mean_str} {ngs_mean_str} "
          f"{alpha_str} {ci_lo:>12} {ci_hi:>10}")

print()
print("=== Oncology vs Non-Oncology sub-groups (GS-B) ===")
sg = subgroup
print(f"  Oncology:    GS-B n={sg['n_oncology_gs']}, mean={sg['oncology_gs_B_mean_pct']:+.1f}% | "
      f"non-GS-B n={sg['n_oncology_nongs']}, mean={sg['oncology_nongs_B_mean_pct']:+.1f}%")
print(f"  Non-onco:    GS-B n={sg['n_nonog_gs']}, mean={sg['nonog_gs_B_mean_pct']:+.1f}% | "
      f"non-GS-B n={sg['n_nonog_nongs']}, mean={sg['nonog_nongs_B_mean_pct']:+.1f}%")

# ── Per-company returns (for transparency) ──────────────────────────────────
print("\n[5/5] Per-company returns by GS-B classification...")

gs_b_companies = master[gs_B_mask][["ticker","company","return_total_pct","outcome","best_genetic_assoc_score"]].sort_values("return_total_pct", ascending=False)
nongs_b_companies = master[nongs_B_mask][["ticker","company","return_total_pct","outcome"]].sort_values("return_total_pct", ascending=False)

print("\n  GS-B portfolio top 10 & bottom 5:")
print(gs_b_companies.head(10).to_string(index=False))
print("  ...")
print(gs_b_companies.tail(5).to_string(index=False))

print("\n  non-GS-B portfolio top 10 & bottom 5:")
print(nongs_b_companies.head(10).to_string(index=False))
print("  ...")
print(nongs_b_companies.tail(5).to_string(index=False))

# Append company-level returns tables to results for Sheets export
results["gs_B_companies"] = gs_b_companies.to_dict(orient="records")
results["nongs_B_companies"] = nongs_b_companies.to_dict(orient="records")

# Also add full company returns for all definitions
results["all_companies"] = master[[
    "ticker","company","company_type","return_total_pct","outcome",
    "is_company_gs_A","is_company_gs_B","mendelian_only_gs_A",
    "best_genetic_assoc_score","n_scoreable_pairs","n_gs_pairs","pct_gs_pairs",
    "target_gene","indication","ot_score_source_best","evidence_predates_2020",
    "is_oncology_primary","has_combination_rows","return_source","return_estimated",
]].to_dict(orient="records")

# ── Write JSON ───────────────────────────────────────────────────────────────
with open(RESULTS_JSON, "w") as f:
    json.dump(results, f, indent=2, default=str)
print(f"\nOutput: {RESULTS_JSON}")
print("Done.")
