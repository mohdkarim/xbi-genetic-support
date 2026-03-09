#!/usr/bin/env python3
"""
08_quarterly_returns.py — Compute quarterly portfolio growth for chart.

Produces quarterly_returns.json with cumulative $1,000 portfolio value
at each quarter-end for multiple GS score thresholds, plus XBI ETF and S&P 500.

Handling of delisted tickers (yfinance returns no data):
  - Parse approximate delist date from acquirer/source_note fields
  - Before delist: hold position at cost (conservative)
  - After delist: position cashed out at known final return

Output:
  final/quarterly_returns.json  (multi-threshold quarterly data)
  final/quarterly_returns.tsv   (primary threshold only, backward compat)
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
OUTPUT_TSV = BASE_DIR / "final" / "quarterly_returns.tsv"
OUTPUT_JSON = BASE_DIR / "final" / "quarterly_returns.json"

START_DATE = pd.Timestamp("2020-01-02")
END_DATE = pd.Timestamp("2026-02-21")
INITIAL_INVESTMENT = 1000.0

# Score thresholds to compute quarterly data for
THRESHOLDS = {
    "0.10": "is_gs",
    "0.50": "is_gs_at_0_50",
    "0.80": "is_gs_at_0_80",
    "0.95": "is_gs_at_0_95",
}

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


def compute_quarterly_for_threshold(
    gs_tickers: set, all_tickers: list, delisted: dict,
    daily_closes: dict, start_prices: dict,
) -> list[dict]:
    """Compute quarterly portfolio values for a given GS/non-GS split."""
    nongs_tickers = set(all_tickers) - gs_tickers
    n_gs = len(gs_tickers)
    n_nongs = len(nongs_tickers)

    if n_gs == 0 or n_nongs == 0:
        return []

    per_company_gs = INITIAL_INVESTMENT / n_gs
    per_company_nongs = INITIAL_INVESTMENT / n_nongs

    rows = []
    for qe in QUARTER_ENDS:
        gs_value = 0.0
        nongs_value = 0.0

        for ticker in all_tickers:
            is_gs = ticker in gs_tickers
            per_co = per_company_gs if is_gs else per_company_nongs
            position_value = per_co

            if ticker in delisted:
                info = delisted[ticker]
                delist_date = info["delist_date"]
                final_ret = info["return_total_pct"] / 100.0
                if delist_date is not None and qe >= delist_date:
                    position_value = (1 + final_ret) * per_co
            elif ticker in start_prices and ticker in daily_closes:
                p_start = start_prices[ticker]
                p_qe = get_close_on_or_before(daily_closes[ticker], qe)
                if p_qe is not None:
                    position_value = (p_qe / p_start) * per_co

            if is_gs:
                gs_value += position_value
            else:
                nongs_value += position_value

        rows.append({
            "date": str(qe.date()),
            "gs": round(gs_value, 2),
            "nongs": round(nongs_value, 2),
        })

    return rows


def main():
    print("=" * 70)
    print("08_quarterly_returns.py — Quarterly Portfolio Growth")
    print("=" * 70)

    # ── Load master.tsv ──────────────────────────────────────────────────────
    master = pd.read_csv(MASTER_TSV, sep="\t")
    all_tickers = sorted(master["ticker"].tolist())
    print(f"\n  Total tickers: {len(all_tickers)}")

    # Build GS ticker sets for each threshold
    threshold_gs = {}
    for label, col in THRESHOLDS.items():
        gs_set = set(master.loc[master[col] == True, "ticker"])
        threshold_gs[label] = gs_set
        print(f"  Threshold {label}: {len(gs_set)} GS, {len(all_tickers) - len(gs_set)} non-GS")

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
        fetch_tickers, start="2019-12-30", end="2026-02-25",
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

    # ── Compute benchmarks (same for all thresholds) ─────────────────────────
    benchmarks = []
    for qe in QUARTER_ENDS:
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
        benchmarks.append({"date": str(qe.date()), "xbi": xbi_value, "sp500": sp500_value})

    # ── Compute quarterly data for each threshold ────────────────────────────
    print(f"\n[2/3] Computing quarterly portfolio values for {len(THRESHOLDS)} thresholds...")

    all_quarterly = {}
    for label, gs_set in threshold_gs.items():
        quarterly = compute_quarterly_for_threshold(
            gs_set, all_tickers, delisted, daily_closes, start_prices
        )
        # Merge benchmarks into quarterly
        for i, row in enumerate(quarterly):
            row["xbi"] = benchmarks[i]["xbi"]
            row["sp500"] = benchmarks[i]["sp500"]
        all_quarterly[label] = quarterly
        final = quarterly[-1] if quarterly else {}
        print(f"  Threshold {label}: GS=${final.get('gs', 0):,.0f}, "
              f"nonGS=${final.get('nongs', 0):,.0f}")

    # ── Write outputs ────────────────────────────────────────────────────────
    print(f"\n[3/3] Writing output...")

    # JSON with all thresholds
    with open(OUTPUT_JSON, "w") as f:
        json.dump(all_quarterly, f, indent=2)
    print(f"  JSON: {OUTPUT_JSON}")

    # TSV backward compat (primary threshold only)
    primary = all_quarterly.get("0.10", [])
    if primary:
        tsv_rows = []
        for row in primary:
            gs_val = row["gs"]
            nongs_val = row["nongs"]
            tsv_rows.append({
                "quarter_end": row["date"],
                "xbi_g_value": gs_val,
                "xbi_g_return_pct": round((gs_val / INITIAL_INVESTMENT - 1) * 100, 2),
                "xbi_nong_value": nongs_val,
                "xbi_nong_return_pct": round((nongs_val / INITIAL_INVESTMENT - 1) * 100, 2),
                "xbi_etf_value": row["xbi"],
                "xbi_etf_return_pct": round((row["xbi"] / INITIAL_INVESTMENT - 1) * 100, 2) if row["xbi"] else None,
                "sp500_value": row["sp500"],
                "sp500_return_pct": round((row["sp500"] / INITIAL_INVESTMENT - 1) * 100, 2) if row["sp500"] else None,
            })
        pd.DataFrame(tsv_rows).to_csv(OUTPUT_TSV, sep="\t", index=False)
        print(f"  TSV: {OUTPUT_TSV}")

    # ── Print summary ────────────────────────────────────────────────────────
    print(f"\n{'='*70}")
    print(f"{'Quarter':<14} {'XBI-G':>10} {'XBI-nonG':>10} {'XBI ETF':>10} {'S&P 500':>10}")
    print("-" * 58)
    for r in primary:
        xbi_str = f"${r['xbi']:,.0f}" if r['xbi'] else "n/a"
        sp_str = f"${r['sp500']:,.0f}" if r['sp500'] else "n/a"
        print(f"  {r['date']:<12} ${r['gs']:>8,.0f} ${r['nongs']:>8,.0f} {xbi_str:>10} {sp_str:>10}")

    print(f"\nDone.")


if __name__ == "__main__":
    main()
