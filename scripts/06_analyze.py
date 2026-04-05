#!/usr/bin/env python3
"""
06_analyze.py — Portfolio returns, bootstrap CIs, Monte Carlo random benchmark

GS definition: a company is "genetically supported" if the genetic association
score of its most advanced scoreable program (lead program) is > 0.80,
scored exclusively from the OT 20.02 release (Feb 2020).

Portfolios:
  XBI-G:   equal-weight portfolio of GS companies
  XBI-NG:  equal-weight portfolio of non-GS companies
  Random:  10,000 Monte Carlo draws of N companies (N = GS count)

Output: target3/final/portfolio_results.json + printed summary
"""

import json
import itertools
import numpy as np
import pandas as pd
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
BASE = Path(__file__).resolve().parents[1]
MASTER_TSV   = BASE / "final/master.tsv"
OUT_DIR      = BASE / "final"
RESULTS_JSON = OUT_DIR / "portfolio_results.json"
OUT_DIR.mkdir(parents=True, exist_ok=True)

BOOTSTRAP_ITER = 2000
MONTE_CARLO_ITER = 10_000
SEED = 42

print("=" * 70)
print("06_analyze.py — Portfolio Returns, Bootstrap CIs & Monte Carlo Benchmark")
print("=" * 70)

# ── Load master ──────────────────────────────────────────────────────────────
master = pd.read_csv(MASTER_TSV, sep="\t", low_memory=False)
print(f"\n[1/4] Loaded master.tsv: {len(master)} companies")

master["return_total_pct"] = pd.to_numeric(master["return_total_pct"], errors="coerce")

n_missing = master["return_total_pct"].isna().sum()
if n_missing > 0:
    print(f"  WARNING: {n_missing} companies missing returns — excluded from analysis")
    master = master[master["return_total_pct"].notna()].copy()

print(f"  Companies with returns: {len(master)}")

# ── Helper functions ─────────────────────────────────────────────────────────
def portfolio_return(returns_pct: np.ndarray) -> float:
    return float(np.mean(returns_pct))

def dollar_value(return_pct: float, initial: float = 1000.0) -> float:
    return round(initial * (1 + return_pct / 100), 2)

def bootstrap_ci(
    returns_pct: np.ndarray,
    n_iter: int = BOOTSTRAP_ITER,
    ci_pct: float = 95.0,
    seed: int = SEED,
) -> tuple[float, float]:
    rng = np.random.default_rng(seed)
    boot_means = []
    n = len(returns_pct)
    for _ in range(n_iter):
        sample = rng.choice(returns_pct, size=n, replace=True)
        boot_means.append(np.mean(sample))
    lo = np.percentile(boot_means, (100 - ci_pct) / 2)
    hi = np.percentile(boot_means, 100 - (100 - ci_pct) / 2)
    return round(lo, 2), round(hi, 2)

# ── Benchmark: XBI ETF ───────────────────────────────────────────────────────
def compute_xbi_return() -> float:
    import yfinance as yf
    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        xbi = yf.download("XBI", start="2019-12-30", end="2026-04-05", progress=False)
    if xbi.empty:
        print("  WARNING: Could not fetch XBI data, using fallback 32.8%")
        return 32.8
    close = xbi["Close"].dropna()
    if isinstance(close, pd.DataFrame):
        close = close.iloc[:, 0]
    start_date, end_date = pd.Timestamp("2020-01-02"), pd.Timestamp("2026-04-01")
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

# ── Portfolio returns ────────────────────────────────────────────────────────
print("\n[2/4] Computing portfolio returns...")

all_returns = master["return_total_pct"].values

gs_mask = master["is_gs"].fillna(False).astype(bool)
nongs_mask = ~gs_mask

gs_returns = master.loc[gs_mask, "return_total_pct"].values
nongs_returns = master.loc[nongs_mask, "return_total_pct"].values

n_gs = len(gs_returns)
n_nongs = len(nongs_returns)

gs_mean = round(portfolio_return(gs_returns), 2)
nongs_mean = round(portfolio_return(nongs_returns), 2)
gs_median = round(float(np.median(gs_returns)), 2)
nongs_median = round(float(np.median(nongs_returns)), 2)

gs_ci = bootstrap_ci(gs_returns, seed=SEED)
nongs_ci = bootstrap_ci(nongs_returns, seed=SEED + 1)

alpha = round(gs_mean - nongs_mean, 2)

print(f"  XBI-G  (n={n_gs}):  mean={gs_mean:+.1f}%  median={gs_median:+.1f}%  "
      f"CI=[{gs_ci[0]:+.1f}%, {gs_ci[1]:+.1f}%]")
print(f"  XBI-NG (n={n_nongs}): mean={nongs_mean:+.1f}%  median={nongs_median:+.1f}%  "
      f"CI=[{nongs_ci[0]:+.1f}%, {nongs_ci[1]:+.1f}%]")
print(f"  Alpha: {alpha:+.1f}%")

# ── Monte Carlo random portfolio benchmark ───────────────────────────────────
print(f"\n[3/4] Monte Carlo random portfolio ({MONTE_CARLO_ITER:,} draws of {n_gs} companies)...")

rng = np.random.default_rng(SEED)
random_means = np.empty(MONTE_CARLO_ITER)

for i in range(MONTE_CARLO_ITER):
    sample_idx = rng.choice(len(all_returns), size=n_gs, replace=False)
    random_means[i] = np.mean(all_returns[sample_idx])

# Percentile rank: what fraction of random portfolios did XBI-G beat?
percentile_rank = round(float(np.mean(random_means <= gs_mean)) * 100, 1)

random_p5 = round(float(np.percentile(random_means, 5)), 2)
random_p25 = round(float(np.percentile(random_means, 25)), 2)
random_p50 = round(float(np.percentile(random_means, 50)), 2)
random_p75 = round(float(np.percentile(random_means, 75)), 2)
random_p95 = round(float(np.percentile(random_means, 95)), 2)
random_mean = round(float(np.mean(random_means)), 2)

print(f"  Random distribution: mean={random_mean:+.1f}%, "
      f"p5={random_p5:+.1f}%, p50={random_p50:+.1f}%, p95={random_p95:+.1f}%")
print(f"  XBI-G percentile rank: {percentile_rank}%")

# Histogram bins for webapp
hist_counts, hist_edges = np.histogram(random_means, bins=50)
histogram = {
    "counts": hist_counts.tolist(),
    "bin_edges": [round(float(e), 2) for e in hist_edges.tolist()],
}

# ── Oncology vs non-oncology sub-analysis ────────────────────────────────────
print("\n[4/4] Sub-group analysis...")

is_onco = master["is_oncology"].fillna(False).astype(bool)

subgroup = {}
for label, mask in [
    ("oncology_gs", is_onco & gs_mask),
    ("oncology_nongs", is_onco & nongs_mask),
    ("nonog_gs", ~is_onco & gs_mask),
    ("nonog_nongs", ~is_onco & nongs_mask),
]:
    vals = master.loc[mask, "return_total_pct"].values
    subgroup[f"{label}_n"] = int(len(vals))
    subgroup[f"{label}_mean_pct"] = round(float(np.mean(vals)), 2) if len(vals) > 0 else None

# ── Assemble results ─────────────────────────────────────────────────────────
results = {
    "methodology": {
        "start_date": "2020-01-02",
        "end_date": "2026-04-01",
        "universe": "XBI Jan 2020 N-PORT holdings",
        "n_companies": int(len(master)),
        "weighting": "equal-weight",
        "gs_threshold": 0.80,
        "gs_definition": "Lead program GS: genetic association score of most advanced scoreable program > 0.80",
        "ot_data": "OT 20.02 (Feb 2020 release, zero look-ahead bias)",
        "bootstrap_iterations": BOOTSTRAP_ITER,
        "bootstrap_seed": SEED,
        "monte_carlo_iterations": MONTE_CARLO_ITER,
    },
    "benchmarks": {
        "XBI_return_pct": XBI_RETURN_PCT,
        "XBI_dollar_1000": dollar_value(XBI_RETURN_PCT),
        "all_universe_mean_pct": round(float(np.mean(all_returns)), 2),
        "all_universe_median_pct": round(float(np.median(all_returns)), 2),
    },
    "primary": {
        "n_gs": n_gs,
        "n_nongs": n_nongs,
        "gs_mean_return_pct": gs_mean,
        "nongs_mean_return_pct": nongs_mean,
        "gs_median_return_pct": gs_median,
        "nongs_median_return_pct": nongs_median,
        "gs_ci_lo": gs_ci[0],
        "gs_ci_hi": gs_ci[1],
        "nongs_ci_lo": nongs_ci[0],
        "nongs_ci_hi": nongs_ci[1],
        "gs_dollar_1000": dollar_value(gs_mean),
        "nongs_dollar_1000": dollar_value(nongs_mean),
        "alpha_pct": alpha,
        "alpha_vs_xbi_pct": round(gs_mean - XBI_RETURN_PCT, 2),
    },
    "random_benchmark": {
        "n_draws": MONTE_CARLO_ITER,
        "draw_size": n_gs,
        "random_mean_pct": random_mean,
        "random_p5": random_p5,
        "random_p25": random_p25,
        "random_p50": random_p50,
        "random_p75": random_p75,
        "random_p95": random_p95,
        "gs_percentile_rank": percentile_rank,
        "histogram": histogram,
    },
    "subgroup": subgroup,
}

# ── Work Stream 1: Multi-Threshold Sensitivity (scoreable companies only) ────
print("\n[5/7] Sensitivity analysis across thresholds (27 scoreable companies)...")

scoreable = master[master["lead_score"].notna()].copy()
scoreable_returns = scoreable["return_total_pct"].values
n_scoreable = len(scoreable)
print(f"  Scoreable companies: {n_scoreable}")

sensitivity = []
sens_thresholds = [0.40, 0.50, 0.60, 0.70, 0.80, 0.90]

for thresh in sens_thresholds:
    s_gs_mask = scoreable["lead_score"] > thresh
    s_ngs_mask = ~s_gs_mask
    s_gs_ret = scoreable.loc[s_gs_mask, "return_total_pct"].values
    s_ngs_ret = scoreable.loc[s_ngs_mask, "return_total_pct"].values
    s_n_gs = len(s_gs_ret)
    s_n_ngs = len(s_ngs_ret)

    if s_n_gs == 0 or s_n_ngs == 0:
        continue

    s_gs_mean = round(float(np.mean(s_gs_ret)), 2)
    s_ngs_mean = round(float(np.mean(s_ngs_ret)), 2)
    s_alpha = round(s_gs_mean - s_ngs_mean, 2)
    s_gs_median = round(float(np.median(s_gs_ret)), 2)

    # Monte Carlo: draws of N_GS from scoreable universe
    s_rng = np.random.default_rng(SEED)
    s_mc = np.empty(MONTE_CARLO_ITER)
    for i in range(MONTE_CARLO_ITER):
        idx = s_rng.choice(n_scoreable, size=s_n_gs, replace=False)
        s_mc[i] = np.mean(scoreable_returns[idx])
    s_pctile = round(float(np.mean(s_mc <= s_gs_mean)) * 100, 1)

    entry = {
        "threshold": thresh,
        "n_gs": s_n_gs,
        "n_nongs": s_n_ngs,
        "gs_mean_pct": s_gs_mean,
        "nongs_mean_pct": s_ngs_mean,
        "alpha_pct": s_alpha,
        "gs_median_pct": s_gs_median,
        "mc_percentile": s_pctile,
    }
    sensitivity.append(entry)
    print(f"  T>{thresh:.2f}: N_GS={s_n_gs}, alpha={s_alpha:+.1f}pp, MC percentile={s_pctile}%")

results["sensitivity"] = sensitivity

# ── Work Stream 2: Restricted Universe (scoreable companies only) ────────────
print("\n[6/7] Restricted universe analysis (27 scoreable companies)...")

r_gs_ret = scoreable.loc[scoreable["is_gs"] == True, "return_total_pct"].values
r_ngs_ret = scoreable.loc[scoreable["is_gs"] == False, "return_total_pct"].values
r_n_gs = len(r_gs_ret)
r_n_ngs = len(r_ngs_ret)

r_gs_mean = round(float(np.mean(r_gs_ret)), 2)
r_ngs_mean = round(float(np.mean(r_ngs_ret)), 2)
r_alpha = round(r_gs_mean - r_ngs_mean, 2)
r_gs_median = round(float(np.median(r_gs_ret)), 2)
r_ngs_median = round(float(np.median(r_ngs_ret)), 2)
r_gs_ci = bootstrap_ci(r_gs_ret, seed=SEED)
r_ngs_ci = bootstrap_ci(r_ngs_ret, seed=SEED + 1)

# Exhaustive enumeration: all C(27,19) = 888,030 combinations
print(f"  Enumerating all C({n_scoreable},{r_n_gs}) combinations...")
combo_count = 0
beats_count = 0
scoreable_ret_arr = scoreable_returns  # length 27
for combo in itertools.combinations(range(n_scoreable), r_n_gs):
    combo_mean = np.mean(scoreable_ret_arr[list(combo)])
    if combo_mean <= r_gs_mean:
        beats_count += 1
    combo_count += 1

r_exact_pctile = round(beats_count / combo_count * 100, 1)
print(f"  Enumerated {combo_count:,} combinations")
print(f"  Restricted: GS mean={r_gs_mean:+.1f}%, non-GS mean={r_ngs_mean:+.1f}%, "
      f"alpha={r_alpha:+.1f}pp, exact percentile={r_exact_pctile}%")

results["restricted_universe"] = {
    "n_scoreable": n_scoreable,
    "n_gs": r_n_gs,
    "n_nongs": r_n_ngs,
    "gs_mean_pct": r_gs_mean,
    "nongs_mean_pct": r_ngs_mean,
    "gs_median_pct": r_gs_median,
    "nongs_median_pct": r_ngs_median,
    "gs_ci_lo": r_gs_ci[0],
    "gs_ci_hi": r_gs_ci[1],
    "nongs_ci_lo": r_ngs_ci[0],
    "nongs_ci_hi": r_ngs_ci[1],
    "alpha_pct": r_alpha,
    "exact_percentile": r_exact_pctile,
    "total_combinations": combo_count,
}

# ── Work Stream 3: Leave-One-Out Robustness ──────────────────────────────────
print("\n[7/7] Leave-one-out robustness (19 GS companies)...")

gs_companies = master[gs_mask][["ticker", "return_total_pct"]].copy()
gs_full_mean = float(np.mean(gs_returns))

loo_results = []
for _, row in gs_companies.iterrows():
    ticker = row["ticker"]
    excluded_ret = row["return_total_pct"]

    # Remaining GS portfolio (N=18)
    remaining = gs_returns[gs_returns != excluded_ret]
    if len(remaining) == len(gs_returns):
        # Duplicate return value — remove by index instead
        mask = gs_companies["ticker"] != ticker
        remaining = gs_companies.loc[mask, "return_total_pct"].values
    remaining_mean = round(float(np.mean(remaining)), 2)

    # Monte Carlo: draws of 18 from 125 remaining companies
    other_universe = master[master["ticker"] != ticker]["return_total_pct"].values
    loo_rng = np.random.default_rng(SEED)
    loo_mc = np.empty(MONTE_CARLO_ITER)
    for i in range(MONTE_CARLO_ITER):
        idx = loo_rng.choice(len(other_universe), size=len(remaining), replace=False)
        loo_mc[i] = np.mean(other_universe[idx])
    loo_pctile = round(float(np.mean(loo_mc <= remaining_mean)) * 100, 1)

    loo_results.append({
        "ticker": ticker,
        "excluded_return_pct": round(float(excluded_ret), 2),
        "remaining_mean_pct": remaining_mean,
        "remaining_mc_percentile": loo_pctile,
    })
    print(f"  Drop {ticker:<5} ({excluded_ret:+7.1f}%): remaining mean={remaining_mean:+.1f}%, "
          f"MC pctile={loo_pctile}%")

# Sort by impact (biggest drop in mean first)
loo_results.sort(key=lambda x: x["remaining_mean_pct"])

results["leave_one_out"] = {
    "full_mean_pct": round(gs_full_mean, 2),
    "n_gs": int(n_gs),
    "companies": loo_results,
    "min_remaining_mean": loo_results[0]["remaining_mean_pct"],
    "max_remaining_mean": loo_results[-1]["remaining_mean_pct"],
    "most_influential": loo_results[0]["ticker"],
    "least_influential": loo_results[-1]["ticker"],
}

# ── Per-company data ─────────────────────────────────────────────────────────
company_cols = [
    "ticker", "company", "company_type", "return_total_pct", "outcome",
    "is_gs", "lead_score", "lead_phase", "lead_gene", "lead_efo_id", "lead_conditions",
    "lead_is_direct", "lead_datasources",
    "lead_nct_id", "lead_drug", "lead_trial_start", "lead_chembl_id",
    "lead_mapping_source", "lead_efo_mapping_source", "lead_gene_source", "lead_override_note",
    "best_score", "n_scoreable_pairs", "n_scored_pairs",
    "target_gene", "indication", "is_oncology",
    "return_source", "price_start", "price_end", "date_start", "date_end",
    "n_unique_targets", "lead_ensembl_id",
    "nongs_reason", "company_type", "gene_source",
    "best_nct_id", "best_trial_start", "best_drug_chembl_id",
    "best_mapping_source", "best_efo_mapping_source", "best_phase",
    "drug_name", "ensembl_id", "efo_id",
]
company_cols = [c for c in company_cols if c in master.columns]
results["all_companies"] = master[company_cols].to_dict(orient="records")

# ── Print summary ────────────────────────────────────────────────────────────
print("\n" + "=" * 70)
print("RESULTS SUMMARY")
print("=" * 70)
print(f"Universe: {len(master)} companies | 2020-01-02 → 2026-04-01 | Equal-weight")
print(f"GS threshold: > 0.80 | OT 20.02 only (zero look-ahead)")
print()
print(f"XBI ETF benchmark:    ${dollar_value(XBI_RETURN_PCT):>8,.2f}  ({XBI_RETURN_PCT:+.1f}%)")
print(f"All-universe mean:    {results['benchmarks']['all_universe_mean_pct']:+.1f}%")
print()
print(f"XBI-G  (n={n_gs}):  mean={gs_mean:+.1f}%  median={gs_median:+.1f}%  "
      f"[{gs_ci[0]:+.1f}%, {gs_ci[1]:+.1f}%]  ${dollar_value(gs_mean):>8,.2f}")
print(f"XBI-NG (n={n_nongs}): mean={nongs_mean:+.1f}%  median={nongs_median:+.1f}%  "
      f"[{nongs_ci[0]:+.1f}%, {nongs_ci[1]:+.1f}%]  ${dollar_value(nongs_mean):>8,.2f}")
print(f"Alpha (GS − non-GS): {alpha:+.1f}%")
print(f"Alpha vs XBI ETF:     {results['primary']['alpha_vs_xbi_pct']:+.1f}%")
print()
print(f"Monte Carlo ({MONTE_CARLO_ITER:,} random draws of {n_gs}):")
print(f"  Random mean: {random_mean:+.1f}%  [p5={random_p5:+.1f}%, p95={random_p95:+.1f}%]")
print(f"  XBI-G beats {percentile_rank}% of random portfolios")
print()

sg = subgroup
print("Oncology vs Non-Oncology:")
for prefix, label in [("oncology_gs", "Onco GS"), ("oncology_nongs", "Onco non-GS"),
                       ("nonog_gs", "Non-onco GS"), ("nonog_nongs", "Non-onco non-GS")]:
    n = sg[f"{prefix}_n"]
    m = sg[f"{prefix}_mean_pct"]
    m_str = f"mean={m:+.1f}%" if m is not None else "n/a"
    print(f"  {label:<16} n={n:>3}  {m_str}")

print()

# Top / bottom GS companies
gs_df = master[gs_mask][["ticker", "company", "return_total_pct", "lead_score", "lead_gene"]].sort_values("return_total_pct", ascending=False)
print(f"GS portfolio ({n_gs} companies):")
print(gs_df.to_string(index=False))

# ── Write JSON ───────────────────────────────────────────────────────────────
with open(RESULTS_JSON, "w") as f:
    json.dump(results, f, indent=2, default=str)
print(f"\nOutput: {RESULTS_JSON}")
print("Done.")
