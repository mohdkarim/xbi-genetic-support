"""
09_prepare_webapp_data.py
Converts final/ outputs into docs/js/data.js for the static webapp.
Handles NaN cleanup, drawdown computation, and data restructuring.
"""
import json
import re
from pathlib import Path

BASE = Path(__file__).parent.parent
RESULTS_PATH = BASE / "final" / "portfolio_results.json"
QUARTERLY_JSON = BASE / "final" / "quarterly_returns.json"
OUT_PATH = BASE / "docs" / "js" / "data.js"


def load_results():
    text = RESULTS_PATH.read_text()
    text = re.sub(r'\bNaN\b', 'null', text)
    return json.loads(text)


def load_quarterly():
    """Load quarterly data from JSON, prepend initial $1000 row."""
    with open(QUARTERLY_JSON) as f:
        rows = json.load(f)
    initial = {
        "date": "2020-01-02",
        "gs": 1000, "nongs": 1000, "xbi": 1000, "sp500": 1000,
        "random_p5": 1000, "random_p50": 1000, "random_p95": 1000,
    }
    rows.insert(0, initial)
    return rows


def compute_drawdowns(quarterly):
    """Compute drawdown from peak for each portfolio at each quarter."""
    portfolios = ["gs", "nongs", "xbi", "sp500"]
    running_max = {p: 0 for p in portfolios}
    for row in quarterly:
        for p in portfolios:
            val = row.get(p)
            if val is None:
                continue
            if val > running_max[p]:
                running_max[p] = val
            dd = round((val - running_max[p]) / running_max[p] * 100, 2) if running_max[p] > 0 else 0
            row[f"{p}_dd"] = dd
    return quarterly


def build_results(raw):
    primary = raw["primary"]
    rand = raw["random_benchmark"]

    return {
        "methodology": raw["methodology"],
        "benchmarks": raw["benchmarks"],
        "primary": {
            "n_gs": primary["n_gs"],
            "n_nongs": primary["n_nongs"],
            "gs_mean": primary["gs_mean_return_pct"],
            "nongs_mean": primary["nongs_mean_return_pct"],
            "gs_median": primary["gs_median_return_pct"],
            "nongs_median": primary["nongs_median_return_pct"],
            "gs_ci_lo": primary["gs_ci_lo"],
            "gs_ci_hi": primary["gs_ci_hi"],
            "nongs_ci_lo": primary["nongs_ci_lo"],
            "nongs_ci_hi": primary["nongs_ci_hi"],
            "gs_dollar": primary["gs_dollar_1000"],
            "nongs_dollar": primary["nongs_dollar_1000"],
            "alpha_vs_nongs": primary["alpha_pct"],
            "alpha_vs_xbi": primary["alpha_vs_xbi_pct"],
        },
        "random_benchmark": {
            "n_draws": rand["n_draws"],
            "draw_size": rand["draw_size"],
            "random_mean": rand["random_mean_pct"],
            "random_p5": rand["random_p5"],
            "random_p25": rand["random_p25"],
            "random_p50": rand["random_p50"],
            "random_p75": rand["random_p75"],
            "random_p95": rand["random_p95"],
            "gs_percentile_rank": rand["gs_percentile_rank"],
            "histogram": rand["histogram"],
        },
        "subgroup": raw["subgroup"],
        "sensitivity": raw.get("sensitivity", []),
        "restricted_universe": raw.get("restricted_universe", {}),
        "leave_one_out": raw.get("leave_one_out", {}),
    }


def build_companies(raw):
    companies = []
    for c in raw["all_companies"]:
        companies.append({
            "ticker": c["ticker"],
            "company": c.get("company", ""),
            "return_pct": c["return_total_pct"],
            "outcome": c["outcome"],
            "is_gs": c["is_gs"],
            "lead_score": c.get("lead_score"),
            "lead_phase": c.get("lead_phase", ""),
            "lead_gene": c.get("lead_gene", ""),
            "lead_conditions": c.get("lead_conditions", ""),
            "lead_is_direct": c.get("lead_is_direct"),
            "lead_datasources": c.get("lead_datasources", ""),
            "lead_efo_id": c.get("lead_efo_id", ""),
            "lead_ensembl_id": c.get("lead_ensembl_id", ""),
            "lead_nct_id": c.get("lead_nct_id", ""),
            "lead_drug": c.get("lead_drug", ""),
            "lead_trial_start": c.get("lead_trial_start", ""),
            "lead_chembl_id": c.get("lead_chembl_id", ""),
            "lead_mapping_source": c.get("lead_mapping_source", ""),
            "lead_efo_mapping_source": c.get("lead_efo_mapping_source", ""),
            "lead_gene_source": c.get("lead_gene_source", ""),
            "lead_override_note": c.get("lead_override_note", ""),
            "best_score": c.get("best_score"),
            "n_scoreable": c.get("n_scoreable_pairs", 0),
            "n_scored": c.get("n_scored_pairs", 0),
            "is_oncology": c.get("is_oncology", False),
            "target_gene": c.get("target_gene", ""),
            "indication": c.get("indication", ""),
            "price_start": c.get("price_start"),
            "price_end": c.get("price_end"),
            "date_start": c.get("date_start", "2020-01-02"),
            "date_end": c.get("date_end", ""),
            "n_unique_targets": c.get("n_unique_targets", 0),
            "nongs_reason": c.get("nongs_reason", ""),
            "company_type": c.get("company_type", ""),
            "gene_source": c.get("gene_source", ""),
            "drug_name": c.get("drug_name", ""),
            "ensembl_id": c.get("ensembl_id", ""),
            "efo_id": c.get("efo_id", ""),
            "best_nct_id": c.get("best_nct_id", ""),
            "best_trial_start": c.get("best_trial_start", ""),
            "best_drug_chembl_id": c.get("best_drug_chembl_id", ""),
            "best_mapping_source": c.get("best_mapping_source", ""),
            "best_efo_mapping_source": c.get("best_efo_mapping_source", ""),
            "best_phase": c.get("best_phase", ""),
        })
    return companies


def write_js(results, companies, quarterly):
    parts = []
    parts.append(f"const RESULTS = {json.dumps(results, indent=2)};")
    parts.append(f"const COMPANIES = {json.dumps(companies, indent=2)};")
    parts.append(f"const QUARTERLY = {json.dumps(quarterly, indent=2)};")

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text("\n\n".join(parts) + "\n")


def main():
    raw = load_results()
    print(f"Loaded portfolio_results.json: {len(raw['all_companies'])} companies")

    quarterly = load_quarterly()
    print(f"Loaded quarterly data: {len(quarterly)} rows")

    quarterly = compute_drawdowns(quarterly)
    for p in ["gs", "nongs", "xbi"]:
        vals = [row.get(f"{p}_dd", 0) for row in quarterly]
        max_dd = min(vals) if vals else 0
        print(f"  {p} max drawdown: {max_dd}%")

    results = build_results(raw)
    companies = build_companies(raw)
    print(f"Companies for webapp: {len(companies)}")

    write_js(results, companies, quarterly)
    print(f"Wrote {OUT_PATH} ({OUT_PATH.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
