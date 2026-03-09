# Genetic Alpha

An analysis testing whether biotech companies with genetically-supported drug
pipelines outperform those without, using the XBI ETF (SPDR S&P Biotech)
January 2020 holdings as the investment universe.

## Overview

This study uses [Open Targets](https://platform.opentargets.org/) genetic
association scores to classify 126 biotech companies as genetically-supported
(GS) or non-GS, then compares equal-weight portfolio returns from January 2,
2020 to February 21, 2026.

**Key finding:** GS companies (n=58) returned +51.7% vs +40.7% for non-GS
(n=68), an alpha of +11.0 percentage points. Alpha increases monotonically
with higher score thresholds, reaching +86.5pp at the 0.95 threshold.

**Key concepts:**

- **Lead-program GS classification**: A company is GS if its most advanced
  clinical program's genetic association score exceeds 0.10 (using only
  evidence confirmed to predate the study start date)
- **Tiered OT scoring**: Tier 1 uses OT 20.02 NDJSON (Feb 2020 release, zero
  look-ahead bias); Tier 2 falls back to the current OT Platform GraphQL API
- **BigQuery evidence validation**: All Tier 2 scores are validated against
  Open Targets BigQuery evidence tables to confirm that genetic evidence
  existed before January 2, 2020. Validation methods include direct evidence
  dating, Mendelian source confirmation, and shared-ancestor disease matching

## Prerequisites

- Python 3.9+
- pip
- Google Cloud credentials (`credentials.json`) for BigQuery access to
  `open-targets-prod.platform` (required for evidence date validation in
  script 03)

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
python3 scripts/03_score_ot.py       # ~5 min (loads 2GB NDJSON + OT API + BQ validation)
python3 scripts/04_fetch_returns.py   # ~5 min (Yahoo Finance, rate-limited)
python3 scripts/05_build_master.py    # Fast
python3 scripts/06_analyze.py         # Fast
python3 scripts/08_quarterly_returns.py  # Fast
python3 scripts/09_prepare_webapp_data.py  # Fast (generates docs/js/data.js)
```

| Script | Purpose | Key Output |
|--------|---------|------------|
| `03_score_ot.py` | Score pipeline with OT genetic association data + BQ evidence validation | `processed/scored_pipeline.tsv` |
| `04_fetch_returns.py` | Fetch stock returns (Yahoo Finance + researched delisted data) | `processed/stock_prices_daily.json` |
| `05_build_master.py` | Collapse to one row per company, join returns | `final/master.tsv` |
| `06_analyze.py` | Portfolio returns, bootstrap 95% CIs, sensitivity analysis | `final/portfolio_results.json` |
| `08_quarterly_returns.py` | Quarterly return breakdown by portfolio | `final/quarterly_returns.json` |
| `09_prepare_webapp_data.py` | Convert final outputs to webapp data | `docs/js/data.js` |

## Evidence Validation

To ensure the study reflects only genetic evidence that was publicly available
at the study start date (January 2, 2020), all Tier 2 API scores undergo
BigQuery validation:

1. **Tier 1 scores** (OT 20.02 release) are automatically confirmed
2. **Tier 2 Mendelian-only** scores (ClinGen, Genomics England, OMIM, etc.)
   are confirmed as time-invariant
3. **Tier 2 non-Mendelian** scores are validated by querying the earliest
   `evidenceDate` across 8 genetic evidence tables in BigQuery, with disease
   ontology expansion (descendants)
4. **Mendelian shared-ancestor recovery**: For companies that would lose GS
   status, a second pass checks whether the target has pre-2020 Mendelian
   evidence for a disease sharing a common ontology ancestor

Only pairs with confirmed pre-2020 evidence are eligible for lead program
selection and GS classification.

## Directory Layout

```
scripts/        Pipeline scripts (03–06, 08–09)
docs/           Static webapp (GitHub Pages)
processed/      Intermediate TSVs and JSON (pipeline I/O)
opentargets/    OT 20.02 NDJSON + Ensembl mapping (download separately)
final/          master.tsv + portfolio_results.json + quarterly returns
raw/            SEC N-PORT fund holdings (large, not included)
.tmp/           Disposable intermediates + BQ validation caches (gitignored)
```

## Key Outputs

- **`final/master.tsv`** — One row per company with GS classifications, OT
  scores, BQ validation status, stock returns, and metadata
- **`final/portfolio_results.json`** — Statistical results including bootstrap
  95% confidence intervals (seed=42, 2000 iterations) and sensitivity analysis
- **`final/quarterly_returns.json`** — Quarterly return breakdown for GS vs
  non-GS portfolios across all score thresholds
- **`docs/js/data.js`** — Webapp data bundle for the static site
