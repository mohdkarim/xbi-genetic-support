# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## WAT Framework (Workflows, Agents, Tools)

This repo follows the **WAT architecture** — probabilistic AI handles reasoning while deterministic code handles execution.

- **Workflows** (`workflows/`): Markdown SOPs defining objectives, required inputs, which tools to use, expected outputs, and edge case handling.
- **Agent** (you): Read the relevant workflow, run tools in the correct sequence, handle failures gracefully, ask clarifying questions when needed. Don't try to do everything directly — delegate execution to tools.
- **Tools** (`tools/`): Python scripts for deterministic execution — API calls, data transformations, file operations. Credentials live in `.env`.

### Operating Principles

1. **Check `tools/` first** before building anything new. Only create new scripts when nothing exists for the task.
2. **Learn and adapt on failure**: Read the full error trace, fix the script, retest (check with the user before re-running paid API calls), and document what you learned in the workflow.
3. **Keep workflows current**: Update workflows when you find better methods or discover constraints. Don't create or overwrite workflows without asking.
4. **Self-improvement loop**: Identify what broke → fix the tool → verify → update the workflow → move on.
5. **Deliverables go to cloud services** (Google Sheets, Slides, etc.). Local files in `.tmp/` are disposable intermediates.

## Project Overview

**Genetic Alpha (target3)** — An analysis testing whether biotech companies with genetically-supported drug pipelines ("GS companies") outperform those without, using the XBI ETF (SPDR S&P Biotech) January 2020 holdings as the investment universe.

The study uses Open Targets (OT) genetic association scores to classify ~126 biotech companies as GS or non-GS, then compares equal-weight portfolio returns from Jan 2, 2020 to Feb 21, 2026.

## Pipeline Architecture

Scripts run sequentially (03→04→05→06→08). Scripts 01–02 were one-time data preparation steps and are no longer present; their outputs live in `processed/`.

| Script | Purpose | Key I/O |
|--------|---------|---------|
| `03_score_ot.py` | Annotate pipeline rows, resolve gene symbols for gene therapy/monogenic diseases, map to Ensembl IDs, score via OT 20.02 NDJSON (Tier 1) then OT API fallback (Tier 2), compute company-level GS classifications | In: `processed/XBI_pipeline_final.tsv`, `opentargets/20.02_association_data.json.gz` → Out: `processed/scored_pipeline.tsv` |
| `04_fetch_returns.py` | Fetch stock returns via Yahoo Finance with fallbacks for delisted/acquired/bankrupt tickers | In: `processed/XBI_holdings_20191231_enriched.tsv` → Out: `processed/stock_prices_daily.json` |
| `05_build_master.py` | Collapse row-per-trial to one row per company, join returns and company names | In: `processed/scored_pipeline.tsv`, `processed/stock_prices_daily.json` → Out: `final/master.tsv` |
| `06_analyze.py` | Portfolio returns, bootstrap 95% CIs (seed=42, 2000 iter), sensitivity analysis across score thresholds | In: `final/master.tsv` → Out: `final/portfolio_results.json` |
| `08_quarterly_returns.py` | Quarterly return breakdown by portfolio | In: `processed/stock_prices_daily.json`, `final/master.tsv` → Out: `final/quarterly_returns.tsv` |

## Running Scripts

```bash
python3 scripts/03_score_ot.py   # ~5 min (loads 2GB gzipped NDJSON + OT API calls)
python3 scripts/04_fetch_returns.py  # ~5 min (Yahoo Finance rate-limited)
python3 scripts/05_build_master.py
python3 scripts/06_analyze.py
python3 scripts/08_quarterly_returns.py
```

Dependencies: `pandas`, `numpy`, `yfinance`.

## Key Concepts

- **GS-A classification**: ≥50% of a company's scoreable gene–disease pairs have OT genetic_association score > 0.10
- **GS-B classification**: any Phase 2/3/4 gene–disease pair has OT score > 0.10
- **Tiered OT scoring**: Tier 1 uses OT 20.02 NDJSON (Feb 2020 release, zero look-ahead bias); Tier 2 falls back to the current OT Platform GraphQL API with datasource checks for time-invariance (Mendelian sources = safe)
- **evidence_predates_2020**: `True` if OT 20.02 or Mendelian-only datasources; `uncertain` if recent OT API with non-Mendelian datasources
- **Combination blocklist**: Standard-of-care drugs (checkpoint inhibitors, chemo backbones, etc.) are flagged as `combination_partner` to avoid contaminating a sponsor's signal
- **Monogenic lookup**: Gene therapy / rare disease rows with missing gene symbols are resolved via curated EFO→gene and drug→gene dictionaries

## Directory Layout

```
workflows/      # Markdown SOPs (WAT layer 1)
tools/          # Python scripts for deterministic execution (WAT layer 3)
scripts/        # Pipeline scripts (03–06, 08)
raw/            # SEC N-PORT fund holdings (one-time source)
processed/      # Intermediate TSVs and JSON (pipeline stages, stock prices, scored pipeline)
opentargets/    # OT 20.02 association NDJSON (2GB gzipped) + Ensembl-to-symbol mapping
final/          # master.tsv (one row per company) + portfolio_results.json (statistical results)
.tmp/           # Disposable intermediates + OT API fallback cache
.env            # API keys and environment variables
credentials.json, token.json  # Google credentials (gitignored)
```

## Important Notes

- All paths in scripts use `Path(__file__).parent.parent` (scripts 03–04) or absolute `Path("/Users/Mak/target3")` (scripts 05–06, 08) as the base directory.
- Script 04 references `/Users/Mak/target2/genetic-alpha/data/` for fallback return data from a prior analysis.
- The OT 20.02 NDJSON file (`opentargets/20.02_association_data.json.gz`) must be downloaded separately from the EBI FTP site before running script 03.
- Script 03's API fallback cache is incrementally saved every 50 calls, so it's safe to interrupt and resume.
