#!/usr/bin/env python3
"""
08_quarterly_returns.py — Compute quarterly portfolio growth for chart.

Produces a TSV with cumulative $1,000 portfolio value at each quarter-end
for four series: XBI-G, XBI-nonG, XBI ETF, and S&P 500.

Handling of delisted tickers (yfinance returns no data):
  - Parse approximate delist date from acquirer/source_note fields
  - Before delist: hold position at cost (conservative — we don't know the path)
  - After delist: position cashed out at known final return

Output:
  final/quarterly_returns.tsv
"""

from __future__ import annotations

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
PRICES_JSON = BASE_DIR / "processed" / "stock_prices_daily.json"
OUTPUT_TSV = BASE_DIR / "final" / "quarterly_returns.tsv"

START_DATE = pd.Timestamp("2020-01-02")
END_DATE = pd.Timestamp("2026-02-21")
INITIAL_INVESTMENT = 1000.0

# Quarter-end dates from Q1 2020 through Q4 2025, plus study end date
QUARTER_ENDS = (
    pd.date_range("2020-03-31", "2025-12-31", freq="QE").tolist()
    + [END_DATE]
)

MONTH_MAP = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}


def parse_delist_date(acquirer: str, source_note: str) -> pd.Timestamp | None:
    """Extract approximate delist date from acquirer or source_note fields."""
    # Try acquirer first: patterns like "($X/sh, Mon YYYY)" or "(YYYY)"
    for text in [acquirer, source_note]:
        if not text or text == "nan":
            continue
        # Match "Mon YYYY" pattern (e.g., "Jan 2020", "Oct 2022")
        m = re.search(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(20\d{2})', text, re.IGNORECASE)
        if m:
            month = MONTH_MAP[m.group(1).lower()]
            year = int(m.group(2))
            # Use last day of the month as approximate delist date
            return pd.Timestamp(year=year, month=month, day=1) + pd.offsets.MonthEnd(0)
        # Match bare "YYYY" pattern (e.g., "2024")
        m = re.search(r'(20\d{2})', text)
        if m:
            year = int(m.group(1))
            return pd.Timestamp(year=year, month=6, day=30)  # mid-year estimate
    return None


def get_close_on_or_before(series: pd.Series, target_date: pd.Timestamp, window_days: int = 10):
    """Return close price on or before target_date, searching up to window_days back."""
    for offset in range(window_days + 1):
        d = target_date - pd.Timedelta(days=offset)
        if d in series.index:
            return float(series[d])
    return None


def get_close_on_or_after(series: pd.Series, target_date: pd.Timestamp, window_days: int = 10):
    """Return close price on or after target_date, searching up to window_days forward."""
    for offset in range(window_days + 1):
        d = target_date + pd.Timedelta(days=offset)
        if d in series.index:
            return float(series[d])
    return None


def main():
    print("=" * 70)
    print("08_quarterly_returns.py — Quarterly Portfolio Growth")
    print("=" * 70)

    # ── Load master.tsv for GS-A classification ─────────────────────────────
    master = pd.read_csv(MASTER_TSV, sep="\t")
    gs_tickers = set(master.loc[master["is_company_gs_A"] == True, "ticker"])
    nongs_tickers = set(master.loc[master["is_company_gs_A"] == False, "ticker"])
    all_tickers = sorted(gs_tickers | nongs_tickers)
    print(f"\n  GS-A tickers: {len(gs_tickers)}")
    print(f"  non-GS tickers: {len(nongs_tickers)}")
    print(f"  Total: {len(all_tickers)}")

    # ── Load delisted returns + parse delist dates ──────────────────────────
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
    no_date = [t for t, v in delisted.items() if v["delist_date"] is None]
    if no_date:
        print(f"  WARNING: Could not parse delist date for: {no_date}")

    # ── Fetch daily closes from yfinance ────────────────────────────────────
    print(f"\n[1/3] Fetching daily closes from yfinance...")
    # Only fetch active (non-delisted) tickers + benchmarks
    active_tickers = [t for t in all_tickers if t not in delisted]
    fetch_tickers = active_tickers + ["XBI", "^GSPC"]
    raw = yf.download(
        fetch_tickers,
        start="2019-12-30",
        end="2026-02-25",
        progress=True,
        group_by="ticker",
        auto_adjust=True,
    )

    # Extract Close series per ticker
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

    # ── Get start prices for active tickers ─────────────────────────────────
    start_prices = {}
    for ticker in active_tickers:
        if ticker in daily_closes:
            p = get_close_on_or_after(daily_closes[ticker], START_DATE)
            if p is not None:
                start_prices[ticker] = p

    missing_active = [t for t in active_tickers if t not in start_prices]
    if missing_active:
        print(f"  WARNING: No start price for active tickers: {missing_active}")

    # ── Compute quarterly portfolio values ──────────────────────────────────
    print(f"\n[2/3] Computing quarterly portfolio values...")

    n_gs = len(gs_tickers)
    n_nongs = len(nongs_tickers)
    per_company_gs = INITIAL_INVESTMENT / n_gs
    per_company_nongs = INITIAL_INVESTMENT / n_nongs

    rows = []
    for qe in QUARTER_ENDS:
        gs_value = 0.0
        nongs_value = 0.0

        for ticker in all_tickers:
            is_gs = ticker in gs_tickers
            per_co = per_company_gs if is_gs else per_company_nongs
            position_value = per_co  # default: hold at cost

            if ticker in delisted:
                # Delisted ticker — no yfinance data
                info = delisted[ticker]
                delist_date = info["delist_date"]
                final_ret = info["return_total_pct"] / 100.0

                if delist_date is not None and qe >= delist_date:
                    # After delist: cashed out at final return
                    position_value = (1 + final_ret) * per_co
                else:
                    # Before delist (or no date parsed): hold at cost
                    position_value = per_co

            elif ticker in start_prices and ticker in daily_closes:
                # Active ticker with yfinance data
                p_start = start_prices[ticker]
                p_qe = get_close_on_or_before(daily_closes[ticker], qe)
                if p_qe is not None:
                    position_value = (p_qe / p_start) * per_co
                # else: hold at cost (shouldn't happen for active tickers)

            if is_gs:
                gs_value += position_value
            else:
                nongs_value += position_value

        # --- XBI ETF ---
        xbi_value = None
        if "XBI" in daily_closes:
            xbi_start = get_close_on_or_after(daily_closes["XBI"], START_DATE)
            xbi_qe = get_close_on_or_before(daily_closes["XBI"], qe)
            if xbi_start and xbi_qe:
                xbi_value = (xbi_qe / xbi_start) * INITIAL_INVESTMENT

        # --- S&P 500 ---
        sp500_value = None
        if "^GSPC" in daily_closes:
            sp_start = get_close_on_or_after(daily_closes["^GSPC"], START_DATE)
            sp_qe = get_close_on_or_before(daily_closes["^GSPC"], qe)
            if sp_start and sp_qe:
                sp500_value = (sp_qe / sp_start) * INITIAL_INVESTMENT

        rows.append({
            "quarter_end": str(qe.date()),
            "xbi_g_value": round(gs_value, 2),
            "xbi_g_return_pct": round((gs_value / INITIAL_INVESTMENT - 1) * 100, 2),
            "xbi_nong_value": round(nongs_value, 2),
            "xbi_nong_return_pct": round((nongs_value / INITIAL_INVESTMENT - 1) * 100, 2),
            "xbi_etf_value": round(xbi_value, 2) if xbi_value else None,
            "xbi_etf_return_pct": round((xbi_value / INITIAL_INVESTMENT - 1) * 100, 2) if xbi_value else None,
            "sp500_value": round(sp500_value, 2) if sp500_value else None,
            "sp500_return_pct": round((sp500_value / INITIAL_INVESTMENT - 1) * 100, 2) if sp500_value else None,
        })

    # ── Write output ────────────────────────────────────────────────────────
    print(f"\n[3/3] Writing output...")
    out_df = pd.DataFrame(rows)
    out_df.to_csv(OUTPUT_TSV, sep="\t", index=False)

    # ── Print summary ───────────────────────────────────────────────────────
    print(f"\n{'='*70}")
    print(f"{'Quarter':<14} {'XBI-G':>10} {'XBI-nonG':>10} {'XBI ETF':>10} {'S&P 500':>10}")
    print(f"{'':<14} {'$value':>10} {'$value':>10} {'$value':>10} {'$value':>10}")
    print("-" * 58)
    for r in rows:
        xbi_str = f"${r['xbi_etf_value']:,.0f}" if r['xbi_etf_value'] else "n/a"
        sp_str = f"${r['sp500_value']:,.0f}" if r['sp500_value'] else "n/a"
        print(f"  {r['quarter_end']:<12} ${r['xbi_g_value']:>8,.0f} ${r['xbi_nong_value']:>8,.0f} {xbi_str:>10} {sp_str:>10}")

    # ── Print delisted timeline ─────────────────────────────────────────────
    print(f"\n  Delisted tickers timeline:")
    for t in sorted(delisted.keys()):
        info = delisted[t]
        d = info["delist_date"]
        gs_flag = "GS" if t in gs_tickers else "nonGS"
        d_str = str(d.date()) if d else "unknown"
        print(f"    {t:<6} {gs_flag:<6} delist≈{d_str:<12} return={info['return_total_pct']:>+7.1f}%  ({info['outcome']})")

    final = rows[-1]
    print(f"\n  Final values (should match script 06):")
    print(f"    XBI-G:    ${final['xbi_g_value']:,.2f}  ({final['xbi_g_return_pct']:+.1f}%)")
    print(f"    XBI-nonG: ${final['xbi_nong_value']:,.2f}  ({final['xbi_nong_return_pct']:+.1f}%)")
    print(f"    XBI ETF:  ${final['xbi_etf_value']:,.2f}  ({final['xbi_etf_return_pct']:+.1f}%)")
    print(f"    S&P 500:  ${final['sp500_value']:,.2f}  ({final['sp500_return_pct']:+.1f}%)")

    print(f"\nOutput: {OUTPUT_TSV}")
    print("Done.")


if __name__ == "__main__":
    main()
