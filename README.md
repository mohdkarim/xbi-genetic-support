# Genetic Alpha

An analysis testing whether biotech companies with genetically-supported drug
pipelines outperform those without, using the XBI ETF (SPDR S&P Biotech)
January 2020 holdings as the investment universe.

## Overview

This study uses [Open Targets](https://platform.opentargets.org/) genetic
association scores to classify ~126 biotech companies as genetically-supported
(GS) or non-GS, then compares equal-weight portfolio returns from January 2,
2020 to February 21, 2026.

**Key concepts:**

- **GS-A classification**: ≥50% of a company's scoreable gene–disease pairs
  have OT genetic_association score > 0.10
- **GS-B classification**: any Phase 2/3/4 gene–disease pair has OT score > 0.10
- **Tiered OT scoring**: Tier 1 uses OT 20.02 NDJSON (Feb 2020 release, zero
  look-ahead bias); Tier 2 falls back to the current OT Platform GraphQL API
  with datasource checks for time-invariance (Mendelian sources only)

## Prerequisites

- Python 3.9+
- pip

Install dependencies:

```bash
pip install -r requirements.txt
```

## Data Setup

### Open Targets 20.02 Association Data (required for script 03)

Download the OT 20.02 association data (~766 MB compressed) from the EBI FTP
archive into the `opentargets/` directory:

```bash
curl -o opentargets/20.02_association_data.json.gz \
  ftp://ftp.ebi.ac.uk/pub/databases/opentargets/platform/20.02/output/20.02_association_data.json.gz
```

If the FTP link is unavailable, check the Open Targets archive at:
https://ftp.ebi.ac.uk/pub/databases/opentargets/platform/

## Running the Pipeline

Scripts run sequentially. Scripts 01–02 were one-time data preparation steps;
their outputs are already in `processed/`.

```bash
python3 scripts/03_score_ot.py       # ~5 min (loads 2GB NDJSON + OT API calls)
python3 scripts/04_fetch_returns.py   # ~5 min (Yahoo Finance, rate-limited)
python3 scripts/05_build_master.py    # Fast
python3 scripts/06_analyze.py         # Fast
python3 scripts/08_quarterly_returns.py  # Fast
```

| Script | Purpose | Key Output |
|--------|---------|------------|
| `03_score_ot.py` | Score pipeline with OT genetic association data | `processed/scored_pipeline.tsv` |
| `04_fetch_returns.py` | Fetch stock returns (Yahoo Finance + researched delisted data) | `processed/stock_prices_daily.json` |
| `05_build_master.py` | Collapse to one row per company, join returns | `final/master.tsv` |
| `06_analyze.py` | Portfolio returns, bootstrap 95% CIs, sensitivity analysis | `final/portfolio_results.json` |
| `08_quarterly_returns.py` | Quarterly return breakdown by portfolio | `final/quarterly_returns.tsv` |

## Directory Layout

```
scripts/        Pipeline scripts (03–06, 08)
processed/      Intermediate TSVs and JSON (pipeline I/O)
opentargets/    OT 20.02 NDJSON + Ensembl mapping (download separately)
final/          master.tsv + portfolio_results.json
raw/            SEC N-PORT fund holdings (large, not included)
.tmp/           Disposable intermediates (gitignored)
```

## Key Outputs

- **`final/master.tsv`** — One row per company with GS classifications, OT
  scores, stock returns, and metadata
- **`final/portfolio_results.json`** — Statistical results including bootstrap
  95% confidence intervals (seed=42, 2000 iterations) and sensitivity analysis
- **`final/quarterly_returns.tsv`** — Quarterly return breakdown for GS vs non-GS portfolios
