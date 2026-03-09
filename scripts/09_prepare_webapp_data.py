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
QUARTERLY_JSON = BASE / "final" / "quarterly_returns.json"
QUARTERLY_TSV = BASE / "final" / "quarterly_returns.tsv"
PIPELINE_PATH = BASE / "processed" / "scored_pipeline.tsv"
OUT_PATH = BASE / "docs" / "js" / "data.js"


def load_results():
    text = RESULTS_PATH.read_text()
    text = re.sub(r'\bNaN\b', 'null', text)
    return json.loads(text)


def load_quarterly():
    """Load quarterly data for all thresholds from JSON, with TSV fallback."""
    if QUARTERLY_JSON.exists():
        with open(QUARTERLY_JSON) as f:
            all_quarterly = json.load(f)
        # Prepend initial $1000 row to each threshold
        for thresh, rows in all_quarterly.items():
            initial = {"date": "2020-01-02", "gs": 1000, "nongs": 1000, "xbi": 1000, "sp500": 1000}
            rows.insert(0, initial)
        return all_quarterly

    # Fallback: TSV (primary threshold only)
    rows = []
    with open(QUARTERLY_TSV) as f:
        reader = csv.DictReader(f, delimiter='\t')
        for row in reader:
            rows.append({
                "date": row["quarter_end"],
                "gs": round(float(row["xbi_g_value"]), 2),
                "nongs": round(float(row["xbi_nong_value"]), 2),
                "xbi": round(float(row["xbi_etf_value"]), 2),
                "sp500": round(float(row["sp500_value"]), 2),
            })
    initial = {"date": "2020-01-02", "gs": 1000, "nongs": 1000, "xbi": 1000, "sp500": 1000}
    rows.insert(0, initial)
    return {"0.10": rows}


def compute_drawdowns(quarterly):
    """Compute drawdown from peak for each portfolio at each quarter, for all thresholds."""
    for thresh, rows in quarterly.items():
        portfolios = ["gs", "nongs", "xbi", "sp500"]
        running_max = {p: 0 for p in portfolios}
        for row in rows:
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
    xbi_return = raw["benchmarks"]["XBI_return_pct"]
    primary = raw["primary"]

    results = {
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
            "alpha_vs_xbi": round(primary["gs_mean_return_pct"] - xbi_return, 2),
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
        "sensitivity": [],
        "subgroup": raw["subgroup"],
    }

    for key in ["0.10", "0.50", "0.80", "0.95"]:
        entry = raw["sensitivity"][key]
        results["sensitivity"].append({
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
    companies = []
    for c in raw["all_companies"]:
        companies.append({
            "ticker": c["ticker"],
            "company": c["company"],
            "return_pct": c["return_total_pct"],
            "outcome": c["outcome"],
            "is_gs": c["is_gs"],
            "mendelian_only": c["mendelian_only_gs"],
            "lead_score": c["lead_score"],
            "lead_phase": c["lead_phase"],
            "lead_gene": c["lead_gene"],
            "lead_conditions": c["lead_conditions"],
            "best_score": c["best_genetic_assoc_score"],
            "n_scoreable": c["n_scoreable_pairs"],
            "n_gs": c["n_gs_pairs"],
            "is_oncology": c["is_oncology_primary"],
            "score_source": c["ot_score_source_best"],
            "confirmed_pre_2020": c.get("lead_confirmed_pre_2020", False),
            "validation_method": c.get("lead_validation_method", ""),
        })
    return companies


def build_pipeline():
    pairs = {}
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
                condition = row["conditions"].split("|")[0].strip() if row["conditions"] else row["disease_efo_id"]
                # Validation label for OT API rows
                bq_method = row.get("bq_validation_method", "")
                validation = ""
                if row["ot_score_source"] == "ot_recent_fallback":
                    if bq_method in ("bq_direct", "bq_ancestor", "bq_descendant"):
                        validation = "bq_confirmed"
                    elif bq_method == "mendelian_ancestor":
                        validation = "mendelian_ancestor"
                    elif bq_method == "bq_post_2020":
                        validation = "bq_post_2020"
                # Evidence date for any BQ-verified rows
                evidence_date = ""
                if bq_method in ("bq_direct", "bq_ancestor", "bq_descendant", "mendelian_ancestor", "bq_post_2020"):
                    evidence_date = row.get("bq_earliest_date", "")
                pairs[key] = {
                    "gene": row["gene_symbol"],
                    "ensembl_id": row["ensembl_id"],
                    "disease": condition,
                    "efo_id": row["disease_efo_id"],
                    "score": round(score, 3),
                    "source": row["ot_score_source"],
                    "drug": row.get("intervention_name", ""),
                    "validation": validation,
                    "evidence_date": evidence_date,
                }

    by_ticker = {}
    for (ticker, _, _), pair in pairs.items():
        by_ticker.setdefault(ticker, []).append(pair)
    for ticker in by_ticker:
        by_ticker[ticker].sort(key=lambda p: -p["score"])
    return by_ticker


def write_js(results, companies, quarterly, pipeline):
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
    thresholds = list(quarterly.keys())
    n_rows = len(next(iter(quarterly.values())))
    print(f"Loaded quarterly data: {len(thresholds)} thresholds, {n_rows} rows each")

    quarterly = compute_drawdowns(quarterly)
    for thresh in thresholds:
        rows = quarterly[thresh]
        for p in ["gs", "nongs", "xbi"]:
            vals = [row.get(f"{p}_dd", 0) for row in rows]
            max_dd = min(vals) if vals else 0
            print(f"  [{thresh}] {p} max drawdown: {max_dd}%")

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
