#!/usr/bin/env python3
"""
04_fetch_returns.py — Fetch stock returns for all XBI Jan 2020 holdings.

Strategy:
  1. Check delisted_returns.tsv for pre-researched returns (acquisitions, bankruptcies)
  2. Try Yahoo Finance for remaining tickers (Jan 2, 2020 → Feb 21, 2026)
  3. For active tickers: use actual Yahoo prices
  4. For delisted/acquired tickers: Yahoo has historical data up to last trade date

Output:
  processed/stock_prices_daily.json
    {
      "AMGN": {
        "ticker": "AMGN",
        "price_start": 198.23,      # Close on 2020-01-02
        "price_end": 285.41,        # Close on 2026-02-21 (or last trade date)
        "date_start": "2020-01-02",
        "date_end": "2026-02-21",
        "return_total_pct": 44.0,
        "outcome": "active",        # active / acquired / bankrupt / delisted
        "acquirer": null,
        "return_source": "yahoo_finance",  # yahoo_finance / manual_research
        "return_estimated": false
      },
      ...
    }
"""

from __future__ import annotations

import json
import time
import warnings
from pathlib import Path

import pandas as pd
import yfinance as yf

warnings.filterwarnings("ignore")

# ─── Paths ───────────────────────────────────────────────────────────────────
BASE = Path(__file__).resolve().parents[1]
HOLDINGS_TSV = BASE / "processed" / "XBI_holdings_20191231_enriched.tsv"
OUTPUT_JSON  = BASE / "processed" / "stock_prices_daily.json"
DELISTED_TSV = BASE / "processed" / "delisted_returns.tsv"

# ─── Portfolio dates ──────────────────────────────────────────────────────────
START_DATE = "2020-01-01"  # Download from just before to ensure Jan 2 is captured
END_DATE   = "2026-02-22"  # Download through; last trading day = Feb 21, 2026
ENTRY_DATE = pd.Timestamp("2020-01-02")  # First trading day of 2020
EXIT_DATE  = pd.Timestamp("2026-02-21")  # Last Friday before analysis cutoff

# ─── Tickers that changed their symbol (renamed / reverse-merged) ─────────────
# When Yahoo fails for OLD ticker, download NEW ticker and use Jan 2020 price of new series
# (Yahoo Finance adjusts historical prices for the new ticker back through the merger/rename date)
RENAMED_TICKERS = {
    "RTRX": "TVTX",   # Retrophin → Travere Therapeutics (renamed Aug 2021, still active)
    "XON":  "PGEN",   # Intrexon → Precigen (renamed 2020, still active)
    "ZIOP": "TCRT",   # ZIOPHARM → Alaunos Therapeutics (renamed 2021; TCRT series includes reverse splits)
}


def load_delisted_returns() -> dict[str, dict]:
    """Load pre-researched returns for delisted/acquired/bankrupt tickers from TSV."""
    delisted: dict[str, dict] = {}
    if not DELISTED_TSV.exists():
        print(f"  WARNING: {DELISTED_TSV} not found — delisted returns unavailable")
        return delisted

    df = pd.read_csv(DELISTED_TSV, sep="\t")
    for _, row in df.iterrows():
        ticker = str(row["ticker"]).strip().upper()
        acquirer = row.get("acquirer")
        delisted[ticker] = {
            "return_total_pct": float(row["return_total_pct"]),
            "outcome": str(row["outcome"]),
            "acquirer": str(acquirer) if pd.notna(acquirer) and str(acquirer).strip() else None,
            "return_source": "manual_research",
            "return_estimated": True,
        }
    return delisted


def get_close_on_or_after(series: pd.Series, target_date: pd.Timestamp, window_days: int = 5) -> tuple[float, str] | tuple[None, None]:
    """Return (price, date_str) for the first trading day on or after target_date, within window_days."""
    for offset in range(window_days + 1):
        d = target_date + pd.Timedelta(days=offset)
        if d in series.index:
            return float(series[d]), str(d.date())
    return None, None


def get_close_on_or_before(series: pd.Series, target_date: pd.Timestamp, window_days: int = 5) -> tuple[float, str] | tuple[None, None]:
    """Return (price, date_str) for the last trading day on or before target_date, within window_days back."""
    for offset in range(window_days + 1):
        d = target_date - pd.Timedelta(days=offset)
        if d in series.index:
            return float(series[d]), str(d.date())
    return None, None


def fetch_ticker_return(ticker: str, delisted_returns: dict) -> dict:
    """
    Fetch return data for a single ticker.
    Returns a dict with all return metadata.
    """
    # Check delisted/acquired returns table first
    if ticker in delisted_returns:
        dr = delisted_returns[ticker]
        print(f"    → Using researched return for {ticker}: {dr['return_total_pct']}% ({dr['outcome']})")
        return {
            "ticker": ticker,
            "price_start": None,
            "price_end": None,
            "date_start": "2020-01-02",
            "date_end": None,
            "return_total_pct": dr["return_total_pct"],
            "outcome": dr["outcome"],
            "acquirer": dr.get("acquirer"),
            "return_source": "manual_research",
            "return_estimated": True,
        }

    # Resolve ticker alias if renamed (e.g., RTRX → TVTX, XON → PGEN)
    yahoo_ticker = RENAMED_TICKERS.get(ticker, ticker)
    if yahoo_ticker != ticker:
        print(f"    {ticker} → using renamed ticker {yahoo_ticker}")

    # Download from Yahoo Finance
    try:
        raw = yf.download(yahoo_ticker, start=START_DATE, end=END_DATE, auto_adjust=True, progress=False)

        # Handle MultiIndex columns (yfinance 1.2.0 always returns MultiIndex)
        if isinstance(raw.columns, pd.MultiIndex):
            if ('Close', yahoo_ticker) in raw.columns:
                close = raw[('Close', yahoo_ticker)]
            else:
                # Try to find Close column regardless of ticker level
                close_cols = [(a, b) for a, b in raw.columns if a == 'Close']
                if close_cols:
                    close = raw[close_cols[0]]
                else:
                    close = pd.Series(dtype=float)
        else:
            close = raw['Close'] if 'Close' in raw.columns else pd.Series(dtype=float)

        close = close.dropna()

        if len(close) < 5:
            raise ValueError(f"Insufficient data: {len(close)} rows")

        # Get entry price (Jan 2, 2020)
        price_start, date_start = get_close_on_or_after(close, ENTRY_DATE)
        if price_start is None:
            raise ValueError("Could not find entry price near 2020-01-02")

        # Get exit price (Feb 21, 2026 or last available trading day)
        price_end, date_end = get_close_on_or_before(close, EXIT_DATE)
        if price_end is None:
            # For delisted companies: use last available day in the data
            price_end = float(close.iloc[-1])
            date_end = str(close.index[-1].date())

        return_pct = (price_end / price_start - 1) * 100

        # Determine outcome from data range
        last_date = pd.Timestamp(close.index[-1])
        if last_date < EXIT_DATE - pd.Timedelta(days=30):
            outcome = "delisted"  # Will be refined by refine_outcomes() if acquired
        else:
            outcome = "active"

        return {
            "ticker": ticker,
            "price_start": round(price_start, 4),
            "price_end": round(price_end, 4),
            "date_start": date_start,
            "date_end": date_end,
            "return_total_pct": round(return_pct, 2),
            "outcome": outcome,
            "acquirer": None,
            "return_source": "yahoo_finance",
            "return_estimated": False,
        }

    except Exception as e:
        print(f"    Yahoo failed for {ticker}: {e}")

        # No fallback available
        print(f"    ⚠️  No fallback available for {ticker}")
        return {
            "ticker": ticker,
            "price_start": None,
            "price_end": None,
            "date_start": None,
            "date_end": None,
            "return_total_pct": None,
            "outcome": "unknown",
            "acquirer": None,
            "return_source": "missing",
            "return_estimated": True,
        }


def refine_outcomes(results: dict, delisted_returns: dict) -> dict:
    """
    Refine 'outcome' for delisted companies using researched data,
    and add acquirer info where available.
    """
    for ticker, row in results.items():
        if ticker in delisted_returns:
            dr = delisted_returns[ticker]
            dr_outcome = dr.get("outcome", "")

            # Refine outcome tag
            if dr_outcome in ("acquired", "bankrupt", "dissolved", "restructured"):
                row["outcome"] = dr_outcome
                if dr.get("acquirer"):
                    row["acquirer"] = dr["acquirer"]

    return results


def main():
    print("=" * 70)
    print("04_fetch_returns.py — XBI Jan 2020 Portfolio Returns")
    print("=" * 70)

    # ── Load holdings ────────────────────────────────────────────────────────
    holdings = pd.read_csv(HOLDINGS_TSV, sep="\t")
    tickers = sorted(holdings["TICKER"].dropna().str.strip().unique().tolist())
    print(f"\n[1/3] Processing {len(tickers)} tickers")
    print(f"      Entry date: 2020-01-02 | Exit date: 2026-02-21")

    # ── Load delisted return data ──────────────────────────────────────────
    print(f"\n[2/3] Loading delisted return data...")
    delisted_returns = load_delisted_returns()
    print(f"      Loaded {len(delisted_returns)} delisted return records")

    # ── Fetch returns ────────────────────────────────────────────────────────
    print(f"\n[3/3] Fetching returns from Yahoo Finance...")
    results = {}
    yahoo_ok = 0
    delisted_used = 0
    missing = 0

    for i, ticker in enumerate(tickers):
        if i > 0 and i % 5 == 0:
            time.sleep(0.5)  # Gentle rate limiting (5 tickers then 0.5s pause)
        if i % 20 == 0:
            print(f"  [{i+1}/{len(tickers)}] Processing {ticker}...")

        row = fetch_ticker_return(ticker, delisted_returns)
        results[ticker] = row

        if row["return_source"] == "yahoo_finance":
            yahoo_ok += 1
        elif row["return_source"] == "manual_research":
            delisted_used += 1
        else:
            missing += 1

    # Refine outcomes using delisted metadata
    results = refine_outcomes(results, delisted_returns)

    # ── Save output ──────────────────────────────────────────────────────────
    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_JSON, "w") as f:
        json.dump(results, f, indent=2)

    # ── Summary ──────────────────────────────────────────────────────────────
    print()
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total tickers processed: {len(results)}")
    print(f"  Yahoo Finance data:    {yahoo_ok}")
    print(f"  Delisted researched:   {delisted_used}")
    print(f"  Missing:               {missing}")

    # Outcome distribution
    outcomes = {}
    for row in results.values():
        o = row.get("outcome", "unknown")
        outcomes[o] = outcomes.get(o, 0) + 1
    print(f"\nOutcome distribution:")
    for o, n in sorted(outcomes.items(), key=lambda x: -x[1]):
        print(f"  {o}: {n}")

    # Return completeness
    no_return = [t for t, r in results.items() if r.get("return_total_pct") is None]
    print(f"\nMissing returns: {len(no_return)} tickers")
    if no_return:
        print(f"  {sorted(no_return)}")

    # Spot check known values
    print(f"\nSpot checks:")
    spot_checks = {
        "AMGN": {"expected_range": (30, 80), "note": "large-cap, stable"},
        "XBI":  {"expected_range": (30, 55), "note": "ETF benchmark ~41%"},
        "NTRA": {"expected_range": (400, 600), "note": "+494.2%"},
        "IMGN": {"expected_range": (500, 800), "note": "+651.4%"},
    }
    for check_ticker, check_info in spot_checks.items():
        if check_ticker in results:
            r = results[check_ticker]
            ret = r.get("return_total_pct")
            lo, hi = check_info["expected_range"]
            flag = "✅" if (ret is not None and lo <= ret <= hi) else "⚠️"
            print(f"  {flag} {check_ticker}: {ret}% (expected {lo}–{hi}%, {check_info['note']})")
        else:
            print(f"  ❓ {check_ticker}: not in results")

    print(f"\nOutput: {OUTPUT_JSON}")
    print("Done.")


if __name__ == "__main__":
    main()
