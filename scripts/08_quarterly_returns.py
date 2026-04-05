#!/usr/bin/env python3
"""
08_quarterly_returns.py — Compute quarterly portfolio growth for chart.

Produces quarterly_returns.json with cumulative $1,000 portfolio value
at each quarter-end for XBI-G, XBI-NG, XBI ETF, S&P 500, and
Monte Carlo random portfolio bands (5th/50th/95th percentile).

Single GS threshold: > 0.80 (OT 20.02 only).

Handling of delisted tickers:
  - Parse approximate delist date from acquirer/source_note fields
  - Before delist: hold position at cost (conservative)
  - After delist: position cashed out at known final return

Output:
  final/quarterly_returns.json
"""

from __future__ import annotations

import json
import re
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
import yfinance as yf

warnings.filterwarnings("ignore")

BASE_DIR = Path(__file__).parent.parent
MASTER_TSV = BASE_DIR / "final" / "master.tsv"
DELISTED_TSV = BASE_DIR / "processed" / "delisted_returns.tsv"
OUTPUT_JSON = BASE_DIR / "final" / "quarterly_returns.json"

START_DATE = pd.Timestamp("2020-01-02")
END_DATE = pd.Timestamp("2026-04-01")
INITIAL_INVESTMENT = 1000.0
MONTE_CARLO_ITER = 10_000
SEED = 42

QUARTER_ENDS = (
    pd.date_range("2020-03-31", "2025-12-31", freq="QE").tolist()
    + [END_DATE]
)

MONTH_MAP = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}


def parse_delist_date(acquirer: str, source_note: str) -> pd.Timestamp | None:
    for text in [acquirer, source_note]:
        if not text or text == "nan":
            continue
        m = re.search(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(20\d{2})', text, re.IGNORECASE)
        if m:
            month = MONTH_MAP[m.group(1).lower()]
            year = int(m.group(2))
            return pd.Timestamp(year=year, month=month, day=1) + pd.offsets.MonthEnd(0)
        m = re.search(r'(20\d{2})', text)
        if m:
            year = int(m.group(1))
            return pd.Timestamp(year=year, month=6, day=30)
    return None


def get_close_on_or_before(series: pd.Series, target_date: pd.Timestamp, window_days: int = 10):
    for offset in range(window_days + 1):
        d = target_date - pd.Timedelta(days=offset)
        if d in series.index:
            return float(series[d])
    return None


def get_close_on_or_after(series: pd.Series, target_date: pd.Timestamp, window_days: int = 10):
    for offset in range(window_days + 1):
        d = target_date + pd.Timedelta(days=offset)
        if d in series.index:
            return float(series[d])
    return None


def compute_portfolio_value_at_quarter(
    tickers: list[str],
    per_company: float,
    qe: pd.Timestamp,
    delisted: dict,
    daily_closes: dict,
    start_prices: dict,
) -> float:
    """Compute total portfolio value at a quarter-end for a set of tickers."""
    total = 0.0
    for ticker in tickers:
        position_value = per_company
        if ticker in delisted:
            info = delisted[ticker]
            delist_date = info["delist_date"]
            final_ret = info["return_total_pct"] / 100.0
            if delist_date is not None and qe >= delist_date:
                position_value = (1 + final_ret) * per_company
        elif ticker in start_prices and ticker in daily_closes:
            p_start = start_prices[ticker]
            p_qe = get_close_on_or_before(daily_closes[ticker], qe)
            if p_qe is not None:
                position_value = (p_qe / p_start) * per_company
        total += position_value
    return total


def main():
    print("=" * 70)
    print("08_quarterly_returns.py — Quarterly Portfolio Growth")
    print("=" * 70)

    # ── Load master.tsv ──────────────────────────────────────────────────────
    master = pd.read_csv(MASTER_TSV, sep="\t")
    all_tickers = sorted(master["ticker"].tolist())
    gs_tickers = set(master.loc[master["is_gs"] == True, "ticker"])
    nongs_tickers = set(all_tickers) - gs_tickers
    n_gs = len(gs_tickers)
    n_nongs = len(nongs_tickers)

    print(f"\n  Total tickers: {len(all_tickers)}")
    print(f"  GS (> 0.80): {n_gs}, Non-GS: {n_nongs}")

    # ── Load delisted returns ────────────────────────────────────────────────
    delisted = {}
    if DELISTED_TSV.exists():
        dl_df = pd.read_csv(DELISTED_TSV, sep="\t")
        for _, row in dl_df.iterrows():
            acquirer = str(row.get("acquirer", ""))
            source_note = str(row.get("source_note", ""))
            delist_date = parse_delist_date(acquirer, source_note)
            delisted[row["ticker"]] = {
                "return_total_pct": float(row["return_total_pct"]),
                "outcome": str(row["outcome"]),
                "delist_date": delist_date,
            }
    print(f"  Delisted/acquired tickers: {len(delisted)}")

    # ── Fetch daily closes from yfinance ─────────────────────────────────────
    print(f"\n[1/3] Fetching daily closes from yfinance...")
    active_tickers = [t for t in all_tickers if t not in delisted]
    fetch_tickers = active_tickers + ["XBI", "^GSPC"]
    raw = yf.download(
        fetch_tickers, start="2019-12-30", end="2026-04-05",
        progress=True, group_by="ticker", auto_adjust=True,
    )

    daily_closes = {}
    for ticker in fetch_tickers:
        try:
            if len(fetch_tickers) > 1:
                close_series = raw[ticker]["Close"].dropna()
            else:
                close_series = raw["Close"].dropna()
            if len(close_series) > 0:
                daily_closes[ticker] = close_series
        except (KeyError, TypeError):
            pass

    print(f"  yfinance returned data for {len(daily_closes)} / {len(fetch_tickers)} tickers")

    # ── Get start prices ─────────────────────────────────────────────────────
    start_prices = {}
    for ticker in active_tickers:
        if ticker in daily_closes:
            p = get_close_on_or_after(daily_closes[ticker], START_DATE)
            if p is not None:
                start_prices[ticker] = p

    # ── Compute quarterly series ─────────────────────────────────────────────
    print(f"\n[2/3] Computing quarterly portfolio values...")

    per_company_gs = INITIAL_INVESTMENT / n_gs if n_gs > 0 else 0
    per_company_nongs = INITIAL_INVESTMENT / n_nongs if n_nongs > 0 else 0

    quarterly = []
    for qe in QUARTER_ENDS:
        gs_value = compute_portfolio_value_at_quarter(
            list(gs_tickers), per_company_gs, qe, delisted, daily_closes, start_prices)
        nongs_value = compute_portfolio_value_at_quarter(
            list(nongs_tickers), per_company_nongs, qe, delisted, daily_closes, start_prices)

        # Benchmarks
        xbi_value = sp500_value = None
        if "XBI" in daily_closes:
            xbi_start = get_close_on_or_after(daily_closes["XBI"], START_DATE)
            xbi_qe = get_close_on_or_before(daily_closes["XBI"], qe)
            if xbi_start and xbi_qe:
                xbi_value = round((xbi_qe / xbi_start) * INITIAL_INVESTMENT, 2)
        if "^GSPC" in daily_closes:
            sp_start = get_close_on_or_after(daily_closes["^GSPC"], START_DATE)
            sp_qe = get_close_on_or_before(daily_closes["^GSPC"], qe)
            if sp_start and sp_qe:
                sp500_value = round((sp_qe / sp_start) * INITIAL_INVESTMENT, 2)

        quarterly.append({
            "date": str(qe.date()),
            "gs": round(gs_value, 2),
            "nongs": round(nongs_value, 2),
            "xbi": xbi_value,
            "sp500": sp500_value,
        })

    # ── Monte Carlo random portfolio bands ───────────────────────────────────
    print(f"\n[3/3] Monte Carlo random portfolio bands ({MONTE_CARLO_ITER:,} draws of {n_gs})...")

    rng = np.random.default_rng(SEED)
    all_tickers_list = list(all_tickers)

    for qi, qe in enumerate(QUARTER_ENDS):
        # Compute per-ticker value at this quarter-end (for $1 invested per company)
        ticker_values = {}
        for ticker in all_tickers_list:
            val = 1.0  # default: hold at cost
            if ticker in delisted:
                info = delisted[ticker]
                delist_date = info["delist_date"]
                final_ret = info["return_total_pct"] / 100.0
                if delist_date is not None and qe >= delist_date:
                    val = 1 + final_ret
            elif ticker in start_prices and ticker in daily_closes:
                p_start = start_prices[ticker]
                p_qe = get_close_on_or_before(daily_closes[ticker], qe)
                if p_qe is not None:
                    val = p_qe / p_start
            ticker_values[ticker] = val

        # Build array of per-ticker multipliers in same order
        multipliers = np.array([ticker_values[t] for t in all_tickers_list])

        # Monte Carlo: draw n_gs tickers, compute equal-weight portfolio value
        mc_values = np.empty(MONTE_CARLO_ITER)
        for i in range(MONTE_CARLO_ITER):
            sample_idx = rng.choice(len(all_tickers_list), size=n_gs, replace=False)
            mc_values[i] = np.mean(multipliers[sample_idx]) * INITIAL_INVESTMENT

        quarterly[qi]["random_p5"] = round(float(np.percentile(mc_values, 5)), 2)
        quarterly[qi]["random_p50"] = round(float(np.percentile(mc_values, 50)), 2)
        quarterly[qi]["random_p95"] = round(float(np.percentile(mc_values, 95)), 2)

    # ── Write output ─────────────────────────────────────────────────────────
    with open(OUTPUT_JSON, "w") as f:
        json.dump(quarterly, f, indent=2)
    print(f"\n  Output: {OUTPUT_JSON}")

    # ── Print summary ────────────────────────────────────────────────────────
    print(f"\n{'='*70}")
    print(f"{'Quarter':<14} {'XBI-G':>10} {'XBI-NG':>10} {'Random p50':>12} {'XBI ETF':>10} {'S&P 500':>10}")
    print("-" * 70)
    for r in quarterly:
        xbi_str = f"${r['xbi']:,.0f}" if r['xbi'] else "n/a"
        sp_str = f"${r['sp500']:,.0f}" if r['sp500'] else "n/a"
        rand_str = f"${r['random_p50']:,.0f}" if r.get('random_p50') else "n/a"
        print(f"  {r['date']:<12} ${r['gs']:>8,.0f} ${r['nongs']:>8,.0f} {rand_str:>12} {xbi_str:>10} {sp_str:>10}")

    print(f"\nDone.")


if __name__ == "__main__":
    main()
