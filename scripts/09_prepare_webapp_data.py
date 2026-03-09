"""
09_prepare_webapp_data.py
Converts final/ outputs into docs/js/data.js for the static webapp.
Handles NaN cleanup, drawdown computation, and data restructuring.
"""
import json
import re
import csv
from pathlib import Path

BASE = Path(__file__).parent.parent
RESULTS_PATH = BASE / "final" / "portfolio_results.json"
QUARTERLY_PATH = BASE / "final" / "quarterly_returns.tsv"
PIPELINE_PATH = BASE / "processed" / "scored_pipeline.tsv"
OUT_PATH = BASE / "docs" / "js" / "data.js"


def load_results():
    """Load portfolio_results.json, replacing NaN with null before parsing."""
    text = RESULTS_PATH.read_text()
    # Python's json.dump serializes float('nan') as NaN (invalid JSON)
    text = re.sub(r'\bNaN\b', 'null', text)
    return json.loads(text)


def load_quarterly():
    """Load quarterly_returns.tsv and prepend initial $1000 row."""
    rows = []
    with open(QUARTERLY_PATH) as f:
        reader = csv.DictReader(f, delimiter='\t')
        for row in reader:
            rows.append({
                "date": row["quarter_end"],
                "gs": round(float(row["xbi_g_value"]), 2),
                "nongs": round(float(row["xbi_nong_value"]), 2),
                "xbi": round(float(row["xbi_etf_value"]), 2),
                "sp500": round(float(row["sp500_value"]), 2),
            })

    # Prepend initial $1000 row
    initial = {"date": "2020-01-02", "gs": 1000, "nongs": 1000, "xbi": 1000, "sp500": 1000}
    rows.insert(0, initial)
    return rows


def compute_drawdowns(quarterly):
    """Compute drawdown from peak for each portfolio at each quarter."""
    portfolios = ["gs", "nongs", "xbi"]
    running_max = {p: 0 for p in portfolios}

    for row in quarterly:
        for p in portfolios:
            val = row[p]
            if val > running_max[p]:
                running_max[p] = val
            dd = round((val - running_max[p]) / running_max[p] * 100, 2)
            row[f"{p}_dd"] = dd

    return quarterly


def build_results(raw):
    """Restructure results for the frontend."""
    xbi_return = raw["benchmarks"]["XBI_return_pct"]
    gs_a = raw["primary_GS_A"]

    results = {
        "methodology": raw["methodology"],
        "benchmarks": raw["benchmarks"],
        "primary": {
            "n_gs": gs_a["n_gs"],
            "n_nongs": gs_a["n_nongs"],
            "gs_mean": gs_a["gs_mean_return_pct"],
            "nongs_mean": gs_a["nongs_mean_return_pct"],
            "gs_median": gs_a["gs_median_return_pct"],
            "nongs_median": gs_a["nongs_median_return_pct"],
            "gs_ci_lo": gs_a["gs_ci_lo"],
            "gs_ci_hi": gs_a["gs_ci_hi"],
            "nongs_ci_lo": gs_a["nongs_ci_lo"],
            "nongs_ci_hi": gs_a["nongs_ci_hi"],
            "gs_dollar": gs_a["gs_dollar_1000"],
            "nongs_dollar": gs_a["nongs_dollar_1000"],
            "alpha_vs_nongs": gs_a["alpha_pct"],
            "alpha_vs_xbi": round(gs_a["gs_mean_return_pct"] - xbi_return, 2),
        },
        "mendelian": {
            "n_gs": raw["mendelian_only"]["n_gs"],
            "n_nongs": raw["mendelian_only"]["n_nongs"],
            "gs_mean": raw["mendelian_only"]["gs_mean_return_pct"],
            "nongs_mean": raw["mendelian_only"]["nongs_mean_return_pct"],
            "gs_median": raw["mendelian_only"]["gs_median_return_pct"],
            "nongs_median": raw["mendelian_only"]["nongs_median_return_pct"],
            "gs_ci_lo": raw["mendelian_only"]["gs_ci_lo"],
            "gs_ci_hi": raw["mendelian_only"]["gs_ci_hi"],
            "nongs_ci_lo": raw["mendelian_only"]["nongs_ci_lo"],
            "nongs_ci_hi": raw["mendelian_only"]["nongs_ci_hi"],
            "alpha": raw["mendelian_only"]["alpha_pct"],
        },
        "sensitivity_proportion": [],
        "subgroup": raw["subgroup"],
    }

    # Convert proportion sensitivity from dict to sorted array
    for key in ["25%", "33%", "50%", "75%"]:
        entry = raw["sensitivity_GS_A_proportion"][key]
        results["sensitivity_proportion"].append({
            "label": key,
            "n_gs": entry["n_gs"],
            "n_nongs": entry["n_nongs"],
            "gs_mean": entry["gs_mean_pct"],
            "nongs_mean": entry["nongs_mean_pct"],
            "alpha": entry["alpha_pct"],
            "gs_ci_lo": entry["gs_ci_lo"],
            "gs_ci_hi": entry["gs_ci_hi"],
        })

    return results


def build_companies(raw):
    """Extract curated company list from all_companies."""
    companies = []
    for c in raw["all_companies"]:
        companies.append({
            "ticker": c["ticker"],
            "company": c["company"],
            "return_pct": c["return_total_pct"],
            "outcome": c["outcome"],
            "is_gs_a": c["is_company_gs_A"],
            "mendelian_only": c["mendelian_only_gs_A"],
            "best_score": c["best_genetic_assoc_score"],
            "n_scoreable": c["n_scoreable_pairs"],
            "n_gs": c["n_gs_pairs"],
            "pct_gs": c["pct_gs_pairs"],
            "is_oncology": c["is_oncology_primary"],
            "score_source": c["ot_score_source_best"],
        })
    return companies


def build_pipeline():
    """Extract deduplicated scoreable gene-disease pairs per company from scored_pipeline.tsv.

    Returns dict mapping ticker -> list of {gene, ensembl_id, disease, efo_id, score, source}.
    Deduplicates on (ticker, ensembl_id, disease_efo_id), keeping highest score.
    """
    pairs = {}  # (ticker, ensembl_id, efo_id) -> row dict
    with open(PIPELINE_PATH) as f:
        reader = csv.DictReader(f, delimiter='\t')
        for row in reader:
            if row["is_scoreable"] != "True":
                continue
            score_str = row["genetic_association_score"]
            if not score_str or score_str == "":
                continue
            try:
                score = float(score_str)
            except ValueError:
                continue
            if score <= 0:
                continue

            key = (row["ticker"], row["ensembl_id"], row["disease_efo_id"])
            if key not in pairs or score > pairs[key]["score"]:
                # Use first condition label (before pipe) as display name
                condition = row["conditions"].split("|")[0].strip() if row["conditions"] else row["disease_efo_id"]
                pairs[key] = {
                    "gene": row["gene_symbol"],
                    "ensembl_id": row["ensembl_id"],
                    "disease": condition,
                    "efo_id": row["disease_efo_id"],
                    "score": round(score, 3),
                    "source": row["ot_score_source"],
                }

    # Group by ticker
    by_ticker = {}
    for (ticker, _, _), pair in pairs.items():
        by_ticker.setdefault(ticker, []).append(pair)

    # Sort each company's pairs by score descending
    for ticker in by_ticker:
        by_ticker[ticker].sort(key=lambda p: -p["score"])

    return by_ticker


def write_js(results, companies, quarterly, pipeline):
    """Write all data as JS constants to docs/js/data.js."""
    parts = []
    parts.append(f"const RESULTS = {json.dumps(results, indent=2)};")
    parts.append(f"const COMPANIES = {json.dumps(companies, indent=2)};")
    parts.append(f"const QUARTERLY = {json.dumps(quarterly, indent=2)};")
    parts.append(f"const PIPELINE = {json.dumps(pipeline, indent=2)};")

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text("\n\n".join(parts) + "\n")


def main():
    raw = load_results()
    print(f"Loaded portfolio_results.json: {len(raw['all_companies'])} companies")

    quarterly = load_quarterly()
    print(f"Loaded quarterly_returns.tsv: {len(quarterly)} rows (including initial)")

    quarterly = compute_drawdowns(quarterly)
    # Report max drawdowns
    for p in ["gs", "nongs", "xbi"]:
        max_dd = min(row[f"{p}_dd"] for row in quarterly)
        print(f"  {p} max drawdown: {max_dd}%")

    results = build_results(raw)
    companies = build_companies(raw)
    print(f"Companies for webapp: {len(companies)}")

    pipeline = build_pipeline()
    total_pairs = sum(len(v) for v in pipeline.values())
    print(f"Pipeline pairs: {total_pairs} across {len(pipeline)} companies")

    write_js(results, companies, quarterly, pipeline)
    print(f"Wrote {OUT_PATH} ({OUT_PATH.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
