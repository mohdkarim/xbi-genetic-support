#!/usr/bin/env python3
"""
03_score_ot.py — Annotate + score the XBI pipeline for genetic association evidence.

Steps:
  1. Add annotation columns (row_flag, is_oncology, is_scoreable, gene_source)
  2. Resolve gene symbols for gene therapy / monogenic rows
  3. Add 6 missing diagnostic companies
  4. Map gene_symbol → Ensembl ID
  5. Stepwise OT scoring:
       Tier 1: OT 20.02 NDJSON (primary, zero look-ahead bias)
       Tier 2: Recent OT API fallback + datasource check for time-invariance
  6. Company-level GS classification (GS-A and GS-B, 4 thresholds, Mendelian-only sensitivity)
  7. Output scored_pipeline.tsv + validation summary

Inputs:
  target3/processed/XBI_pipeline_final.tsv
  target3/processed/XBI_holdings_20191231_enriched.tsv
  target3/opentargets/20.02_association_data.json.gz
  target3/opentargets/ensembl_to_gene_symbol_map.csv

Outputs:
  target3/processed/scored_pipeline.tsv
  target3/.tmp/ot_fallback_cache.json
"""

from __future__ import annotations

import gzip
import json
import os
import sys
import time
import urllib.request
import urllib.error
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Optional

# ─── Paths ──────────────────────────────────────────────────────────────────
BASE = Path(__file__).parent.parent
PIPELINE_TSV         = BASE / "processed" / "XBI_pipeline_final.tsv"
HOLDINGS_TSV         = BASE / "processed" / "XBI_holdings_20191231_enriched.tsv"
OT_ASSOC_GZ          = BASE / "opentargets" / "20.02_association_data.json.gz"
ENSEMBL_SYMBOL_CSV   = BASE / "opentargets" / "ensembl_to_gene_symbol_map.csv"
OUTPUT_TSV           = BASE / "processed" / "scored_pipeline.tsv"
FALLBACK_CACHE_JSON  = BASE / ".tmp" / "ot_fallback_cache.json"

OT_GRAPHQL_URL = "https://api.platform.opentargets.org/api/v4/graphql"

# ─── Constants ───────────────────────────────────────────────────────────────

# Combination therapy partner drugs — contaminating the signal for the actual company
# Three categories:
#   1. Checkpoint inhibitors / immunotherapy backbones
#   2. Standard-of-care chemotherapy / conditioning agents (not the sponsor's drug)
#   3. Standard-of-care biologics used as combination partners
# NOTE: blinatumomab (Amgen) and adalimumab (AbbVie) are excluded — those ARE the
#       sponsor company's own proprietary drugs and should be scored.
COMBINATION_BLOCKLIST = {
    # Checkpoint inhibitors / immunotherapy backbones
    "pembrolizumab", "nivolumab", "atezolizumab", "cemiplimab", "ipilimumab",
    "durvalumab", "avelumab",
    # Standard chemotherapy backbones
    "carboplatin", "gemcitabine", "paclitaxel", "cisplatin", "docetaxel",
    "pemetrexed", "oxaliplatin", "irinotecan", "vinorelbine", "capecitabine",
    # Conditioning / lymphodepletion agents (cell therapy prep)
    "fludarabine", "cyclophosphamide",
    # Standard-of-care haematology / oncology backbones
    "azacitidine", "decitabine", "cytarabine", "methotrexate",
    "carfilzomib", "bortezomib", "lenalidomide", "pomalidomide", "thalidomide",
    "dexamethasone", "prednisone", "methylprednisolone",
    # Standard-of-care biologics used as combination partners
    "rituximab", "obinutuzumab", "ofatumumab",
    "cetuximab", "panitumumab",
    "trastuzumab", "pertuzumab",
    "bevacizumab", "ramucirumab",
    # Other combination / PK probe / background drugs
    "erlotinib", "itraconazole", "midazolam", "moxifloxacin",
    # Placebo variants
    "placebo", "matching placebo", "placebo oral capsule",
}

# Oncology keywords
ONCOLOGY_KEYWORDS = [
    "cancer", "tumor", "tumour", "leukemia", "leukaemia", "lymphoma",
    "myeloma", "sarcoma", "carcinoma", "glioma", "melanoma",
    "adenocarcinoma", "hepatoma", "blastoma",
]

# Mendelian disease EFO/MONDO → causal gene symbol(s)
# Priority: OMIM primary gene / OT Genetics top gene
MONOGENIC_LOOKUP = {
    "MONDO_0010679": ["DMD"],          # Duchenne muscular dystrophy
    "MONDO_0009861": ["PAH"],          # Phenylketonuria
    "MONDO_0011382": ["HBB", "BCL11A"], # Sickle cell disease
    "MONDO_0019300": ["HBB"],          # Beta-thalassemia
    "MONDO_0013791": ["SERPINA1"],     # Alpha-1 antitrypsin deficiency
    "MONDO_0018634": ["TTR"],          # Hereditary transthyretin amyloidosis (ATTR)
    "MONDO_0007037": ["FGFR3"],        # Achondroplasia
    "MONDO_0009661": ["GALNS"],        # MPS IV (Morquio syndrome)
    "MONDO_0010200": ["F8"],           # Hemophilia A
    "MONDO_0010602": ["F9"],           # Hemophilia B
    "MONDO_0009563": ["HEXA"],         # Tay-Sachs disease
    "MONDO_0009994": ["ARSA"],         # Metachromatic leukodystrophy (MLD)
    "MONDO_0012081": ["IDS"],          # MPS II (Hunter syndrome)
    "MONDO_0010741": ["IDUA"],         # MPS I (Hurler/Scheie)
    "MONDO_0009669": ["PSAP"],         # Gaucher disease related
    "MONDO_0018150": ["GBA"],          # Gaucher disease
    "MONDO_0015010": ["HBB"],          # Thalassemia (broad)
    "EFO_0000508":   [],               # Genetic disorder — too broad, skip
    "MONDO_0019052": ["CFTR"],         # Cystic fibrosis
    "MONDO_0010198": ["FANCA"],        # Fanconi anemia
    "MONDO_0013209": ["CEP290"],       # Leber congenital amaurosis 10
    "EFO_0003912":   ["CEP290"],       # Leber congenital amaurosis (general)
    "MONDO_0015564": ["TTR"],          # Familial amyloid polyneuropathy
    "MONDO_0010737": ["F8"],           # Hemophilia (general)
    "EFO_0000691":   ["HBB"],          # Sickle cell anemia
    "EFO_0000692":   ["HBB"],          # Beta thalassemia
    "EFO_0009718":   ["BCL11A"],       # Sickle cell disease (EFO code)
    "MONDO_0004992": [],               # Cancer — too broad, skip
}

# Known gene therapy drug → causal gene(s)
# Used when EFO lookup doesn't resolve gene and drug name is known
GENE_THERAPY_DRUG_LOOKUP = {
    "lentiglobin": ["HBB"],
    "bb1111": ["HBB"],
    "betibeglogene": ["HBB"],    # bluebird bio LentiGlobin BB305 (beta-thal)
    "bb305": ["HBB"],
    "lovo-cel": ["BCL11A"],
    "lovotibeglogene autotemcel": ["BCL11A"],
    "bb2121": ["TNFRSF17"],
    "ide-cel": ["TNFRSF17"],
    "idecabtagene": ["TNFRSF17"],
    "hmi-102": ["PAH"],
    "edit-101": ["CEP290"],
    "rgnx-314": ["VEGFA"],
    "rgx-314": ["VEGFA"],
    "ntla-2001": ["TTR"],
    "sb-525": ["F8"],
    "etranacogene dezaparvovec": ["F9"],
    "fitusiran": ["SERPINC1"],
    "inclisiran": ["PCSK9"],
    "vutrisiran": ["TTR"],
    "givosiran": ["ALAS1"],
    "lumasiran": ["HAO1"],
    "patisiran": ["TTR"],
}

# The 6 diagnostic/platform companies missing from pipeline TSV
DIAGNOSTIC_COMPANIES = {
    "CDNA": "CareDx Inc",
    "EXAS": "Exact Sciences Corp",
    "NTRA": "Natera Inc",
    "NVTA": "Invitae Corp",
    "TWST": "Twist Bioscience Corp",
    "VCYT": "Veracyte Inc",
}

# Mendelian (time-invariant) OT datasources
MENDELIAN_SOURCES = {"orphanet", "eva", "gene2phenotype", "uniprot_variants", "genomics_england"}

# GS score thresholds for sensitivity analysis
GS_THRESHOLDS = [0.05, 0.10, 0.15, 0.20]       # GS-B sensitivity
GS_A_THRESHOLDS = [0.1, 0.2, 0.4, 0.8]         # GS-A sensitivity
GS_PRIMARY_THRESHOLD = 0.10  # Main threshold
GS_A_PROPORTION_THRESHOLDS = [0.25, 0.33, 0.50, 0.75]  # GS-A pipeline-proportion sensitivity


# ─── Helper: OT GraphQL query with retry ─────────────────────────────────────

def ot_graphql(query: str, variables: dict, max_retries: int = 5) -> dict | None:
    """Execute a GraphQL query against the OT Platform API with exponential backoff."""
    payload = json.dumps({"query": query, "variables": variables}).encode("utf-8")
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(OT_GRAPHQL_URL, data=payload, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as e:
            wait = min(2 ** attempt, 30)
            print(f"  HTTPError {e.code} — retrying in {wait}s...")
            time.sleep(wait)
        except Exception as e:
            wait = min(2 ** attempt, 30)
            print(f"  Error {e} — retrying in {wait}s...")
            time.sleep(wait)
    return None


# OT query — gets both datatypeScores and datasourceScores in one round-trip.
# Note: OT Platform API uses 'datatypeScores' and 'datasourceScores' (not 'datatypes'/'datasources').
OT_ASSOC_QUERY = """
query AssocIndirect($targetId: String!, $diseaseId: String!) {
  target(ensemblId: $targetId) {
    associatedDiseases(
      enableIndirect: true
      Bs: [$diseaseId]
    ) {
      rows {
        disease { id }
        datatypeScores { id score }
        datasourceScores { id score }
      }
    }
  }
}
"""


def fetch_ot_fallback(ensembl_id: str, efo_id: str) -> tuple[float | None, list[str]]:
    """
    Query recent OT API for associationByDatatypeIndirect genetic_association score.
    Single round-trip: gets both datatypeScores and datasourceScores.
    Returns (score_or_None, [datasource_ids]).
    Note: OT Platform API uses 'datatypeScores'/'datasourceScores' (not 'datatypes'/'datasources').
    """
    resp = ot_graphql(OT_ASSOC_QUERY, {"targetId": ensembl_id, "diseaseId": efo_id})
    score = None
    datasources = []

    if resp and resp.get("data", {}).get("target"):
        rows = resp["data"]["target"].get("associatedDiseases", {}).get("rows", [])
        for row in rows:
            if row["disease"]["id"] == efo_id:
                # Extract genetic_association score from datatypeScores
                for dt in row.get("datatypeScores", []):
                    if dt["id"] == "genetic_association":
                        score = dt["score"]
                        break
                # Extract nonzero datasource IDs from datasourceScores
                datasources = [
                    ds["id"] for ds in row.get("datasourceScores", [])
                    if ds.get("score", 0) > 0
                ]
                break

    return score, datasources


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    print("=" * 70)
    print("03_score_ot.py — XBI Genetic Association Scoring")
    print("=" * 70)

    # ── Guard: check OT 20.02 file exists ──────────────────────────────────
    if not OT_ASSOC_GZ.exists():
        print(f"\nERROR: OT 20.02 data not found at {OT_ASSOC_GZ}")
        print("Please download it first:")
        print("  wget https://ftp.ebi.ac.uk/pub/databases/opentargets/platform/20.02/output/20.02_association_data.json.gz \\")
        print(f"       -P {OT_ASSOC_GZ.parent}/")
        sys.exit(1)

    # ── Load pipeline ───────────────────────────────────────────────────────
    print(f"\n[1/7] Loading pipeline from {PIPELINE_TSV.name}...")
    df = pd.read_csv(PIPELINE_TSV, sep="\t", low_memory=False)
    # Normalise date columns
    df["start_date"] = pd.to_datetime(df["start_date"], errors="coerce")
    print(f"      {len(df):,} rows, {df['ticker'].nunique()} tickers")

    # ── STEP 1: Add annotation columns ─────────────────────────────────────
    print("\n[2/7] Adding annotation columns...")

    # row_flag
    def classify_row(row) -> str:
        name = str(row.get("intervention_name", "") or "").lower()
        for term in COMBINATION_BLOCKLIST:
            if term in name:
                return "combination_partner"
        if str(row.get("target_type", "") or "").lower() == "viral":
            return "viral_target"
        conditions_str = str(row.get("conditions", "") or "").lower()
        if "healthy" in conditions_str or "volunteer" in conditions_str:
            return "healthy_volunteer"
        if pd.notna(row.get("start_date")) and row["start_date"] < pd.Timestamp("2015-01-01"):
            return "historical"
        return "valid"

    df["row_flag"] = df.apply(classify_row, axis=1)

    # is_oncology
    def is_oncology(conditions_str: str) -> bool:
        conditions_lower = str(conditions_str or "").lower()
        return any(kw in conditions_lower for kw in ONCOLOGY_KEYWORDS)

    df["is_oncology"] = df["conditions"].apply(is_oncology)

    # Initial is_scoreable (before gene therapy resolution)
    df["is_scoreable"] = (
        (df["row_flag"] == "valid")
        & df["gene_symbol"].notna()
        & (df["gene_symbol"].astype(str).str.strip() != "")
        & (df["gene_symbol"].astype(str).str.strip() != "nan")
        & df["disease_efo_id"].notna()
        & (df["disease_efo_id"].astype(str).str.strip() != "")
        & (df["disease_efo_id"].astype(str).str.strip() != "nan")
    )

    # gene_source
    df["gene_source"] = df["gene_symbol"].apply(
        lambda g: "chembl" if (pd.notna(g) and str(g).strip() not in ("", "nan")) else "missing"
    )

    flag_counts = df["row_flag"].value_counts()
    print(f"      row_flag counts:\n{flag_counts.to_string()}")
    print(f"      initially scoreable: {df['is_scoreable'].sum():,} rows")

    # ── STEP 2: Gene therapy monogenic lookup ───────────────────────────────
    print("\n[3/7] Resolving gene symbols for gene therapy / monogenic rows...")

    resolved_mono = 0
    resolved_drug = 0

    for idx, row in df.iterrows():
        # Only process valid rows with blank gene_symbol
        if row["row_flag"] != "valid":
            continue
        if pd.notna(row["gene_symbol"]) and str(row["gene_symbol"]).strip() not in ("", "nan"):
            continue
        if pd.isna(row["disease_efo_id"]) or str(row["disease_efo_id"]).strip() in ("", "nan"):
            continue

        efo_id = str(row["disease_efo_id"]).strip()
        gene = None

        # 2a: Monogenic disease lookup by EFO ID
        if efo_id in MONOGENIC_LOOKUP:
            genes = MONOGENIC_LOOKUP[efo_id]
            if genes:
                gene = genes[0]  # Use primary causal gene
                resolved_mono += 1

        # 2b: Drug name lookup for known gene therapy programs
        if gene is None:
            drug_name = str(row.get("intervention_name", "") or "").lower().strip()
            for drug_key, genes in GENE_THERAPY_DRUG_LOOKUP.items():
                if drug_key in drug_name and genes:
                    gene = genes[0]
                    resolved_drug += 1
                    break

        if gene is not None:
            df.at[idx, "gene_symbol"] = gene
            df.at[idx, "gene_source"] = "monogenic_causal"

    # Re-evaluate is_scoreable after gene resolution
    df["is_scoreable"] = (
        (df["row_flag"] == "valid")
        & df["gene_symbol"].notna()
        & (df["gene_symbol"].astype(str).str.strip() != "")
        & (df["gene_symbol"].astype(str).str.strip() != "nan")
        & df["disease_efo_id"].notna()
        & (df["disease_efo_id"].astype(str).str.strip() != "")
        & (df["disease_efo_id"].astype(str).str.strip() != "nan")
    )

    print(f"      resolved via monogenic lookup: {resolved_mono}")
    print(f"      resolved via drug name lookup: {resolved_drug}")
    print(f"      scoreable after resolution: {df['is_scoreable'].sum():,} rows")

    # ── STEP 3: Add 6 missing diagnostic companies ──────────────────────────
    print("\n[4/7] Adding 6 missing diagnostic companies...")

    pipeline_cols = list(df.columns)
    diag_rows = []
    for ticker, company in DIAGNOSTIC_COMPANIES.items():
        row = {col: None for col in pipeline_cols}
        row["ticker"] = ticker
        row["sponsor_name"] = company
        row["row_flag"] = "diagnostic_platform"
        row["is_oncology"] = None
        row["is_scoreable"] = False
        row["gene_source"] = "missing"
        diag_rows.append(row)

    diag_df = pd.DataFrame(diag_rows, columns=pipeline_cols)
    # Ensure annotation columns exist in diag_df
    for col in ["row_flag", "is_oncology", "is_scoreable", "gene_source"]:
        if col not in diag_df.columns:
            diag_df[col] = None

    df = pd.concat([df, diag_df], ignore_index=True)
    print(f"      added: {', '.join(DIAGNOSTIC_COMPANIES.keys())}")
    print(f"      total rows now: {len(df):,}")

    # ── STEP 4: Map gene_symbol → Ensembl ID ────────────────────────────────
    print("\n[5/7] Mapping gene_symbol → Ensembl ID...")

    gene_map = pd.read_csv(ENSEMBL_SYMBOL_CSV)
    # gene_map has columns: id (ENSG...), approvedSymbol
    symbol_to_ensembl = dict(zip(gene_map["approvedSymbol"], gene_map["id"]))
    print(f"      loaded {len(symbol_to_ensembl):,} gene→ENSG mappings")

    df["ensembl_id"] = df["gene_symbol"].map(symbol_to_ensembl)

    # Re-check is_scoreable: if ensembl_id is null, can't score even if gene_symbol exists
    df["is_scoreable"] = (
        df["is_scoreable"]
        & df["ensembl_id"].notna()
    )

    unmapped = df[df["gene_symbol"].notna()
                  & (df["gene_symbol"].astype(str).str.strip() != "")
                  & (df["gene_symbol"].astype(str).str.strip() != "nan")
                  & df["ensembl_id"].isna()]
    if len(unmapped) > 0:
        print(f"      WARNING: {len(unmapped)} rows with gene_symbol not in OT 20.02 target list:")
        print(f"      {sorted(unmapped['gene_symbol'].unique())}")

    print(f"      scoreable with valid Ensembl ID: {df['is_scoreable'].sum():,} rows")

    # ── STEP 5: Stepwise OT Scoring ─────────────────────────────────────────
    print("\n[6/7] OT genetic association scoring...")

    # Initialise score columns
    df["genetic_association_score"] = None
    df["ot_score_source"] = None
    df["evidence_predates_2020"] = None
    df["genetic_datasources"] = None  # comma-joined datasource list

    # --- TIER 1: OT 20.02 NDJSON ---
    print("      Tier 1: Loading OT 20.02 NDJSON into memory...")
    ot_2020_scores: dict[tuple, float] = {}
    ot_2020_datasources: dict[tuple, list] = {}  # (target, disease) → nonzero genetic datasources

    with gzip.open(OT_ASSOC_GZ, "rt", encoding="utf-8") as fh:
        for i, line in enumerate(fh):
            r = json.loads(line)
            t_id = r["target"]["id"]
            d_id = r["disease"]["id"]
            datatypes = r["association_score"]["datatypes"]
            ga = datatypes.get("genetic_association", 0)
            if ga > 0:
                key = (t_id, d_id)
                ot_2020_scores[key] = ga
                # Collect nonzero genetic datasources for this pair
                ds_scores = r["association_score"].get("datasources", {})
                genetic_ds = [
                    ds for ds, score in ds_scores.items()
                    if score > 0 and ds in {
                        "eva", "gene2phenotype", "genomics_england", "orphanet",
                        "gwas_catalog", "ot_genetics_portal", "postgap",
                        "phewas_catalog", "uniprot_variants", "uniprot",
                    }
                ]
                ot_2020_datasources[key] = genetic_ds
            if i > 0 and i % 500_000 == 0:
                print(f"      ... {i:,} records processed, {len(ot_2020_scores):,} with GA > 0")

    print(f"      Loaded {len(ot_2020_scores):,} target-disease pairs with genetic_association > 0")

    # Apply Tier 1 scores
    scoreable_mask = df["is_scoreable"]
    tier1_hits = 0
    for idx, row in df[scoreable_mask].iterrows():
        key = (row["ensembl_id"], row["disease_efo_id"])
        if key in ot_2020_scores:
            df.at[idx, "genetic_association_score"] = ot_2020_scores[key]
            df.at[idx, "ot_score_source"] = "ot_2020"
            df.at[idx, "evidence_predates_2020"] = True  # By definition — Feb 2020 data
            ds_list = ot_2020_datasources.get(key, [])
            df.at[idx, "genetic_datasources"] = ",".join(ds_list) if ds_list else None
            tier1_hits += 1

    print(f"      Tier 1 hits: {tier1_hits:,} rows scored from OT 20.02")

    # --- TIER 2: Recent OT API fallback ---
    fallback_needed = df[
        scoreable_mask
        & df["ot_score_source"].isna()
    ][["ensembl_id", "disease_efo_id"]].drop_duplicates()

    print(f"      Tier 2: {len(fallback_needed)} unique pairs need API fallback...")

    # Load cache
    cache: dict = {}
    if FALLBACK_CACHE_JSON.exists():
        with open(FALLBACK_CACHE_JSON) as f:
            cache = json.load(f)
        print(f"      Loaded {len(cache)} cached fallback pairs")

    tier2_hits = 0
    tier2_new = 0
    for _, pair_row in fallback_needed.iterrows():
        ensembl_id = pair_row["ensembl_id"]
        efo_id = pair_row["disease_efo_id"]
        cache_key = f"{ensembl_id}_{efo_id}"

        if cache_key not in cache:
            print(f"      API: {ensembl_id} × {efo_id}")
            score, datasources = fetch_ot_fallback(ensembl_id, efo_id)
            cache[cache_key] = {"score": score, "datasources": datasources}
            tier2_new += 1
            time.sleep(0.3)  # Gentle rate limiting
            # Write cache incrementally every 50 new calls so progress survives interruption
            if tier2_new % 50 == 0:
                FALLBACK_CACHE_JSON.parent.mkdir(parents=True, exist_ok=True)
                with open(FALLBACK_CACHE_JSON, "w") as f:
                    json.dump(cache, f, indent=2)
                print(f"      [cache checkpoint: {tier2_new} new pairs saved]")
        else:
            score = cache[cache_key]["score"]
            datasources = cache[cache_key]["datasources"]

        if score is not None and score > 0:
            # Classify look-ahead risk
            ds_set = set(datasources) if datasources else set()
            if ds_set.issubset(MENDELIAN_SOURCES) and ds_set:
                predates = True
            else:
                predates = "uncertain"

            # Apply to all matching rows
            mask_pair = (
                scoreable_mask
                & df["ot_score_source"].isna()
                & (df["ensembl_id"] == ensembl_id)
                & (df["disease_efo_id"] == efo_id)
            )
            df.loc[mask_pair, "genetic_association_score"] = score
            df.loc[mask_pair, "ot_score_source"] = "ot_recent_fallback"
            df.loc[mask_pair, "evidence_predates_2020"] = str(predates)
            df.loc[mask_pair, "genetic_datasources"] = ",".join(datasources) if datasources else None
            tier2_hits += 1

    # Save updated cache
    if tier2_new > 0:
        FALLBACK_CACHE_JSON.parent.mkdir(parents=True, exist_ok=True)
        with open(FALLBACK_CACHE_JSON, "w") as f:
            json.dump(cache, f, indent=2)
        print(f"      Cached {tier2_new} new API responses to {FALLBACK_CACHE_JSON.name}")

    print(f"      Tier 2 hits: {tier2_hits:,} unique pairs scored from recent OT API")

    # ── STEP 6: Company-level GS classification ─────────────────────────────
    print("\n[7/7] Computing company-level GS classification...")

    # Convert genetic_association_score to float
    df["genetic_association_score"] = pd.to_numeric(df["genetic_association_score"], errors="coerce")

    # Per-company aggregates from scoreable rows
    scoreable_df = df[df["is_scoreable"] == True].copy()

    # Deduplicate by (ticker, gene_symbol, disease_efo_id) — unique pairs
    unique_pairs = scoreable_df.drop_duplicates(subset=["ticker", "ensembl_id", "disease_efo_id"])

    # Company-level stats
    company_stats = (
        unique_pairs.groupby("ticker")
        .agg(
            n_scoreable_pairs=("genetic_association_score", "count"),
            n_gs_pairs=("genetic_association_score", lambda x: (x > GS_PRIMARY_THRESHOLD).sum()),
            best_genetic_assoc_score=("genetic_association_score", "max"),
        )
        .reset_index()
    )
    company_stats["pct_gs_pairs"] = (
        company_stats["n_gs_pairs"] / company_stats["n_scoreable_pairs"]
    ).where(company_stats["n_scoreable_pairs"] > 0)

    # GS-A: ≥50% of scoreable pairs > threshold
    company_stats["is_company_gs_A"] = company_stats["pct_gs_pairs"] >= 0.50

    # GS-A at multiple OT score thresholds (≥50% of pairs > threshold)
    for thresh in GS_A_THRESHOLDS:
        col = f"is_company_gs_A_at_{str(thresh).replace('.', '_')}"
        n_above = unique_pairs.groupby("ticker")["genetic_association_score"].apply(
            lambda x, t=thresh: (x > t).sum()
        )
        company_stats[col] = (
            (n_above.reindex(company_stats["ticker"]).values / company_stats["n_scoreable_pairs"]) >= 0.50
        ).astype(bool).where(company_stats["n_scoreable_pairs"] > 0, False)

    # Drop the 0.1 duplicate (already captured as is_company_gs_A)
    primary_A_col = f"is_company_gs_A_at_{str(GS_PRIMARY_THRESHOLD).replace('.', '_')}"
    if primary_A_col in company_stats.columns:
        company_stats.drop(columns=[primary_A_col], inplace=True)

    # GS-A pipeline-proportion: gs_programs / total_programs at OT > 0.10
    # A "program" = unique (intervention_name, conditions) among valid rows
    # A program is GS if ANY of its rows has genetic_association_score > 0.10
    valid_rows = df[df["row_flag"] == "valid"]
    program_gs = (
        valid_rows.groupby(["ticker", "intervention_name", "conditions"])
        ["genetic_association_score"]
        .apply(lambda x: (x > GS_PRIMARY_THRESHOLD).any())
        .reset_index(name="is_gs_program")
    )
    n_total_programs = program_gs.groupby("ticker").size().rename("n_total_programs")
    n_gs_programs = (
        program_gs[program_gs["is_gs_program"]]
        .groupby("ticker").size().rename("n_gs_programs")
    )
    prop_stats = pd.DataFrame({
        "n_total_programs": n_total_programs,
        "n_gs_programs": n_gs_programs,
    }).fillna({"n_gs_programs": 0}).astype(int).reset_index()
    prop_stats["pct_pipeline_gs"] = (
        prop_stats["n_gs_programs"] / prop_stats["n_total_programs"]
    )

    # Classify at each proportion threshold
    for pct_thresh in GS_A_PROPORTION_THRESHOLDS:
        col = f"is_gs_A_prop_{int(pct_thresh * 100)}"
        prop_stats[col] = prop_stats["pct_pipeline_gs"] >= pct_thresh

    # NOTE: prop_stats covers all tickers with valid rows (not just scoreable).
    # Don't merge into company_stats (which only has scoreable tickers) —
    # merge directly into df after company_stats merge so all tickers get values.

    # GS-B at multiple thresholds: any Phase 2/3/4 pair > threshold
    # Include split phases that span Phase 2+ territory
    PHASE_2_PLUS = ["PHASE2", "PHASE3", "PHASE4", "PHASE1/PHASE2", "PHASE2/PHASE3"]
    phase_scoreable = scoreable_df[
        scoreable_df["phase"].isin(PHASE_2_PLUS)
    ].drop_duplicates(subset=["ticker", "ensembl_id", "disease_efo_id"])

    for thresh in GS_THRESHOLDS:
        col = f"is_company_gs_B_at_{str(thresh).replace('.', '_')}"
        gs_b = (
            phase_scoreable[phase_scoreable["genetic_association_score"] > thresh]
            .groupby("ticker")
            .size()
            .gt(0)
            .reset_index(name=col)
        )
        company_stats = company_stats.merge(gs_b, on="ticker", how="left")
        company_stats[col] = company_stats[col].fillna(False)

    # Rename GS-B at primary threshold for clarity
    primary_col = f"is_company_gs_B_at_{str(GS_PRIMARY_THRESHOLD).replace('.', '_')}"
    company_stats = company_stats.rename(columns={primary_col: "is_company_gs_B"})

    # Mendelian-only GS-A: only count pairs where evidence_predates_2020 == True
    mendelian_pairs = unique_pairs[
        unique_pairs["evidence_predates_2020"].astype(str) == "True"
    ]
    if len(mendelian_pairs) > 0:
        mono_stats = (
            mendelian_pairs.groupby("ticker")
            .agg(
                n_mendelian_pairs=("genetic_association_score", "count"),
                n_mendelian_gs_pairs=("genetic_association_score",
                                      lambda x: (x > GS_PRIMARY_THRESHOLD).sum()),
            )
            .reset_index()
        )
        mono_stats["mendelian_only_gs_A"] = (
            mono_stats["n_mendelian_gs_pairs"] / mono_stats["n_mendelian_pairs"] >= 0.50
        )
        company_stats = company_stats.merge(
            mono_stats[["ticker", "mendelian_only_gs_A"]], on="ticker", how="left"
        )
    else:
        company_stats["mendelian_only_gs_A"] = False

    company_stats["mendelian_only_gs_A"] = company_stats["mendelian_only_gs_A"].fillna(False)

    # Diagnostic companies: all GS flags = False (already False since not scoreable)
    diag_tickers = set(DIAGNOSTIC_COMPANIES.keys())
    for col in [c for c in company_stats.columns if "gs" in c.lower()]:
        company_stats.loc[company_stats["ticker"].isin(diag_tickers), col] = False

    # Merge company stats back into main dataframe
    gs_cols = [c for c in company_stats.columns if c != "ticker"]
    df = df.merge(company_stats[["ticker"] + gs_cols], on="ticker", how="left")

    # Fill GS flags for rows where no scoreable pairs
    bool_cols = [c for c in company_stats.columns
                 if c.startswith("is_company_") or c.endswith("_gs_A") or c.endswith("_gs_B")]
    for col in bool_cols:
        if col in df.columns:
            df[col] = df[col].fillna(False)

    # Merge pipeline-proportion stats directly into df (covers ALL tickers with valid rows)
    prop_cols = (["n_total_programs", "n_gs_programs", "pct_pipeline_gs"]
                 + [f"is_gs_A_prop_{int(t*100)}" for t in GS_A_PROPORTION_THRESHOLDS])
    df = df.merge(prop_stats[["ticker"] + prop_cols], on="ticker", how="left")
    for c in ["n_total_programs", "n_gs_programs"]:
        df[c] = df[c].fillna(0).astype(int)
    df["pct_pipeline_gs"] = df["pct_pipeline_gs"].fillna(0.0)
    for pct_thresh in GS_A_PROPORTION_THRESHOLDS:
        col = f"is_gs_A_prop_{int(pct_thresh * 100)}"
        df[col] = df[col].fillna(False)

    # ── Output ───────────────────────────────────────────────────────────────
    print(f"\n{'=' * 70}")
    print(f"Writing output to {OUTPUT_TSV.name}...")
    df.to_csv(OUTPUT_TSV, sep="\t", index=False)
    print(f"Output: {len(df):,} rows, {df['ticker'].nunique()} tickers")

    # ── Validation summary ───────────────────────────────────────────────────
    print(f"\n{'=' * 70}")
    print("VALIDATION SUMMARY")
    print(f"{'=' * 70}")
    print(f"\nRow counts:")
    print(f"  Total rows:          {len(df):,}")
    print(f"  Valid rows:          {(df['row_flag'] == 'valid').sum():,}")
    print(f"  Scoreable rows:      {df['is_scoreable'].sum():,}")
    print(f"  Unique tickers:      {df['ticker'].nunique()}")

    print(f"\nrow_flag distribution:")
    for flag, cnt in df["row_flag"].value_counts().items():
        print(f"  {flag:<25} {cnt:>6,}")

    print(f"\nOT score source (scoreable rows only):")
    scored_mask = df["is_scoreable"] == True
    for src, cnt in df.loc[scored_mask, "ot_score_source"].value_counts(dropna=False).items():
        print(f"  {str(src):<30} {cnt:>6,}")

    print(f"\nevidence_predates_2020 (scored rows only):")
    scored_nonnull = df.loc[scored_mask & df["ot_score_source"].notna()]
    for val, cnt in scored_nonnull["evidence_predates_2020"].value_counts(dropna=False).items():
        print(f"  {str(val):<30} {cnt:>6,}")

    gs_summary = company_stats[company_stats["n_scoreable_pairs"].notna()].copy()
    n_gs_A = gs_summary["is_company_gs_A"].sum()
    n_gs_B = gs_summary["is_company_gs_B"].sum()
    n_mono = gs_summary["mendelian_only_gs_A"].sum()
    n_total = df["ticker"].nunique()

    print(f"\nGS classification (unique tickers: {n_total}):")
    print(f"  GS-A (≥50% of pairs > 0.10):      {n_gs_A:>3} tickers")
    print(f"  GS-B (any Phase2/3/4 pair > 0.10): {n_gs_B:>3} tickers")
    print(f"  Mendelian-only GS-A:                {n_mono:>3} tickers")

    print(f"\nSensitivity thresholds (GS-A, ≥50% of pairs > threshold):")
    for thresh in GS_A_THRESHOLDS:
        col = f"is_company_gs_A_at_{str(thresh).replace('.', '_')}"
        if thresh == GS_PRIMARY_THRESHOLD:
            col = "is_company_gs_A"
        if col in gs_summary.columns:
            n = gs_summary[col].sum()
            print(f"  GS-A at {thresh:.2f}:                      {n:>3} tickers")

    print(f"\nSensitivity thresholds (GS-A, pipeline proportion ≥ X% programs GS at OT > 0.10):")
    # Use per-ticker deduped view from df (prop_stats covers all tickers)
    ticker_props = df.drop_duplicates("ticker")
    for pct_thresh in GS_A_PROPORTION_THRESHOLDS:
        col = f"is_gs_A_prop_{int(pct_thresh * 100)}"
        if col in ticker_props.columns:
            n = ticker_props[col].sum()
            print(f"  GS-A at ≥{pct_thresh:.0%} pipeline:             {n:>3} tickers")

    print(f"\nSensitivity thresholds (GS-B):")
    for thresh in GS_THRESHOLDS:
        col = f"is_company_gs_B_at_{str(thresh).replace('.', '_')}"
        if col == "is_company_gs_B":
            col_lookup = "is_company_gs_B"
        else:
            col_lookup = col
        if col_lookup in gs_summary.columns:
            n = gs_summary[col_lookup].sum()
            print(f"  GS-B at {thresh:.2f}:                      {n:>3} tickers")

    print(f"\nSpot-check rows (expected values):")
    spot_checks = [
        ("ALNY",  "ENSG00000169174", None, "TTR amyloidosis", "~0.9+", "ot_2020"),
        ("SRPT",  None,              None, "DMD",             "~0.9+", "ot_2020 or ot_recent_fallback"),
        ("BLUE",  None,              None, "beta-thal / SCD", "~0.8+", "ot_2020"),
        ("EXAS",  None,              None, "diagnostic",      "null",  "null"),
    ]
    for ticker, _, _, label, exp_score, exp_src in spot_checks:
        rows = df[df["ticker"] == ticker]
        if len(rows) == 0:
            print(f"  {ticker}: NOT FOUND in output!")
            continue
        best_row = rows.nlargest(1, "genetic_association_score", keep="first") if rows["genetic_association_score"].notna().any() else rows.head(1)
        r = best_row.iloc[0]
        score_val = r.get("genetic_association_score")
        score_str = f"{score_val:.4f}" if pd.notna(score_val) else "null"
        print(f"  {ticker} ({label}):")
        print(f"    gene={r.get('gene_symbol')}, efo={r.get('disease_efo_id')}")
        print(f"    score={score_str}, source={r.get('ot_score_source')}, predates_2020={r.get('evidence_predates_2020')}")
        print(f"    row_flag={r.get('row_flag')}, gene_source={r.get('gene_source')}")
        print(f"    expected: score={exp_score}, source={exp_src}")

    print(f"\n{'=' * 70}")
    print(f"Done. Output: {OUTPUT_TSV}")
    print(f"Fallback cache: {FALLBACK_CACHE_JSON}")


if __name__ == "__main__":
    main()
