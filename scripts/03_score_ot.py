#!/usr/bin/env python3
"""
03_score_ot.py — Annotate + score the XBI pipeline for genetic association evidence.

Steps:
  1. Add annotation columns (row_flag, is_oncology, is_scoreable, gene_source)
  2. Resolve gene symbols for gene therapy / monogenic rows
  3. Add 6 missing diagnostic companies
  4. Map gene_symbol → Ensembl ID
  5. OT 20.02 NDJSON scoring (germline sources only — excludes somatic evidence)
  6. Company-level GS classification (lead program score > 0.80)
  7. Output scored_pipeline.tsv

Scoring uses ONLY the OT 20.02 release (Feb 2020), guaranteeing zero look-ahead bias.
Both direct and indirect (ontology-propagated) associations are included.

Inputs:
  target3/processed/XBI_pipeline_final.tsv
  target3/processed/XBI_holdings_20191231_enriched.tsv
  target3/opentargets/20.02_association_data.json.gz
  target3/opentargets/ensembl_to_gene_symbol_map.csv

Outputs:
  target3/processed/scored_pipeline.tsv
"""

from __future__ import annotations

import gzip
import json
import sys
import pandas as pd
from pathlib import Path

# ─── Paths ──────────────────────────────────────────────────────────────────
BASE = Path(__file__).parent.parent
PIPELINE_TSV         = BASE / "processed" / "XBI_pipeline_final.tsv"
HOLDINGS_TSV         = BASE / "processed" / "XBI_holdings_20191231_enriched.tsv"
OT_ASSOC_GZ          = BASE / "opentargets" / "20.02_association_data.json.gz"
ENSEMBL_SYMBOL_CSV   = BASE / "opentargets" / "ensembl_to_gene_symbol_map.csv"
OUTPUT_TSV           = BASE / "processed" / "scored_pipeline.tsv"

# ─── Constants ───────────────────────────────────────────────────────────────

# Combination therapy partner drugs — contaminating the signal for the actual company
COMBINATION_BLOCKLIST = {
    # Checkpoint inhibitors / immunotherapy backbones
    "pembrolizumab", "nivolumab", "atezolizumab", "cemiplimab", "ipilimumab",
    "durvalumab", "avelumab",
    # Standard chemotherapy backbones
    "carboplatin", "gemcitabine", "paclitaxel", "nab-paclitaxel", "cisplatin",
    "docetaxel", "pemetrexed", "oxaliplatin", "irinotecan", "vinorelbine",
    "capecitabine",
    # Conditioning / lymphodepletion agents (cell therapy prep)
    "fludarabine", "cyclophosphamide",
    # Standard-of-care haematology / oncology backbones
    "azacitidine", "decitabine", "cytarabine", "methotrexate",
    "carfilzomib", "bortezomib", "lenalidomide", "pomalidomide", "thalidomide",
    "dexamethasone", "prednisone", "methylprednisolone",
    # Standard-of-care targeted therapy (oncology)
    "sunitinib", "bendamustine",
    # Standard-of-care biologics (used as comparators / combination partners)
    "rituximab", "obinutuzumab", "ofatumumab",
    "cetuximab", "panitumumab",
    "trastuzumab", "pertuzumab",
    "bevacizumab", "ramucirumab",
    "adalimumab", "etanercept",  # TNF inhibitors — SOC in autoimmune trials
    # Additional SOC chemotherapy / targeted therapy
    "topotecan", "doxorubicin", "etoposide",
    # SOC hormone therapy
    "enzalutamide",
    # SOC supportive care (G-CSF)
    "pegfilgrastim",
    # Statins (background treatment in cardiometabolic / NASH trials)
    "atorvastatin", "rosuvastatin", "simvastatin", "pravastatin",
    # SOC antiviral background
    "ribavirin",
    # PK probe / interaction study drugs (Phase 1 DDI studies)
    "erlotinib", "itraconazole", "midazolam", "moxifloxacin",
    "rifampin", "omeprazole", "digoxin", "warfarin", "caffeine",
    # OTC analgesics / supportive care (used as comparators)
    "acetaminophen", "naproxen", "enoxaparin",
    # Metabolic SOC
    "metformin",
    # Non-drug comparators / descriptors
    "standard of care", "normal saline",
    # Placebo variants
    "placebo", "matching placebo", "placebo oral capsule",
    "placebo oral tablet", "placebos", "placebo comparator",
    "placebo injection", "placebo tablet", "iv placebo", "placebo capsule",
}

# Oncology keywords
ONCOLOGY_KEYWORDS = [
    "cancer", "tumor", "tumour", "leukemia", "leukaemia", "lymphoma",
    "myeloma", "sarcoma", "carcinoma", "glioma", "melanoma",
    "adenocarcinoma", "hepatoma", "blastoma",
]

# Mendelian disease EFO/MONDO → causal gene symbol(s)
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
GENE_THERAPY_DRUG_LOOKUP = {
    "lentiglobin": ["HBB"],
    "bb1111": ["HBB"],
    "betibeglogene": ["HBB"],
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

# ─── Lead program overrides ──────────────────────────────────────────────────
# Manual corrections for combination trial contamination:
# In combo trials, the algorithm sometimes scores a partner drug's target instead
# of the sponsor's own drug. These overrides force the correct drug→gene mapping.
#
# Format: ticker → {drug, gene, primary_moa_note (optional annotation)}
# Applied after scoring during lead-program selection.
LEAD_PROGRAM_OVERRIDES = {
    # WRONG DRUG: partner drug scored instead of sponsor's own
    "GTHX": {"drug": "G1T38", "gene": "CDK4",
             "note": "Lerociclib (CDK4/6 inhibitor). Osimertinib (AstraZeneca) was scored in combo trial."},
    "INCY": {"drug": "Ruxolitinib", "gene": "JAK1",
             "note": "Ruxolitinib is Incyte's own JAK1/2 inhibitor. Osimertinib (AstraZeneca) was scored in combo trial."},
    "TGTX": {"drug": "Umbralisib", "gene": "PIK3CD",
             "note": "Umbralisib is TG Therapeutics' own PI3Kd inhibitor. Venetoclax (AbbVie) was scored in combo trial."},
    "ESPR": {"drug": "Bempedoic acid", "gene": "ACLY",
             "note": "Bempedoic acid is Esperion's own ACL inhibitor. Evolocumab (Amgen) was scored in combo trial."},
    "MYGN": {"drug": "Niraparib", "gene": "PARP1",
             "note": "Niraparib is Myriad/Tesaro's own PARP inhibitor. Abiraterone (J&J) was scored in combo trial."},
    # CORRECT DRUG, WRONG PRIMARY TARGET: annotate that primary MoA differs
    "ABBV": {"primary_moa_note": "Primary MoA is JAK1; TYK2 is a secondary pharmacological target"},
    "GILD": {"primary_moa_note": "Primary MoA is JAK1; TYK2 is a secondary pharmacological target"},
}

# Germline genetic association datasources — excludes somatic evidence
GERMLINE_GENETIC_SOURCES = {
    "eva", "gene2phenotype", "genomics_england", "orphanet",
    "gwas_catalog", "ot_genetics_portal", "postgap",
    "phewas_catalog", "uniprot_variants", "uniprot", "uniprot_literature",
}

# GS threshold
GS_THRESHOLD = 0.80

# Phase ranking for lead-program selection (higher = more advanced)
PHASE_RANK = {
    "PHASE4":        7,
    "PHASE3":        6,
    "PHASE2/PHASE3": 5,
    "PHASE2":        4,
    "PHASE1/PHASE2": 3,
    "PHASE1":        2,
    "EARLY_PHASE1":  1,
}


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    print("=" * 70)
    print("03_score_ot.py — XBI Genetic Association Scoring (OT 20.02 only)")
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
    df["start_date"] = pd.to_datetime(df["start_date"], errors="coerce")
    print(f"      {len(df):,} rows, {df['ticker'].nunique()} tickers")

    # ── STEP 1: Add annotation columns ─────────────────────────────────────
    print("\n[2/7] Adding annotation columns...")

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

    def is_oncology(conditions_str: str) -> bool:
        conditions_lower = str(conditions_str or "").lower()
        return any(kw in conditions_lower for kw in ONCOLOGY_KEYWORDS)

    df["is_oncology"] = df["conditions"].apply(is_oncology)

    df["is_scoreable"] = (
        (df["row_flag"] == "valid")
        & df["gene_symbol"].notna()
        & (df["gene_symbol"].astype(str).str.strip() != "")
        & (df["gene_symbol"].astype(str).str.strip() != "nan")
        & df["disease_efo_id"].notna()
        & (df["disease_efo_id"].astype(str).str.strip() != "")
        & (df["disease_efo_id"].astype(str).str.strip() != "nan")
    )

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
        if row["row_flag"] != "valid":
            continue
        if pd.notna(row["gene_symbol"]) and str(row["gene_symbol"]).strip() not in ("", "nan"):
            continue
        if pd.isna(row["disease_efo_id"]) or str(row["disease_efo_id"]).strip() in ("", "nan"):
            continue

        efo_id = str(row["disease_efo_id"]).strip()
        gene = None

        if efo_id in MONOGENIC_LOOKUP:
            genes = MONOGENIC_LOOKUP[efo_id]
            if genes:
                gene = genes[0]
                resolved_mono += 1

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
    df = pd.concat([df, diag_df], ignore_index=True)
    print(f"      added: {', '.join(DIAGNOSTIC_COMPANIES.keys())}")
    print(f"      total rows now: {len(df):,}")

    # ── STEP 4: Map gene_symbol → Ensembl ID ────────────────────────────────
    print("\n[5/7] Mapping gene_symbol → Ensembl ID...")

    gene_map = pd.read_csv(ENSEMBL_SYMBOL_CSV)
    symbol_to_ensembl = dict(zip(gene_map["approvedSymbol"], gene_map["id"]))
    print(f"      loaded {len(symbol_to_ensembl):,} gene→ENSG mappings")

    df["ensembl_id"] = df["gene_symbol"].map(symbol_to_ensembl)

    df["is_scoreable"] = df["is_scoreable"] & df["ensembl_id"].notna()

    unmapped = df[df["gene_symbol"].notna()
                  & (df["gene_symbol"].astype(str).str.strip() != "")
                  & (df["gene_symbol"].astype(str).str.strip() != "nan")
                  & df["ensembl_id"].isna()]
    if len(unmapped) > 0:
        print(f"      WARNING: {len(unmapped)} rows with gene_symbol not in OT 20.02 target list:")
        print(f"      {sorted(unmapped['gene_symbol'].unique())}")

    print(f"      scoreable with valid Ensembl ID: {df['is_scoreable'].sum():,} rows")

    # ── STEP 5: OT 20.02 Scoring ───────────────────────────────────────────
    print("\n[6/7] OT 20.02 genetic association scoring...")

    df["genetic_association_score"] = None
    df["ot_score_source"] = None
    df["is_direct"] = None
    df["germline_datasources"] = None

    # Load OT 20.02 NDJSON into memory
    print("      Loading OT 20.02 NDJSON into memory...")
    ot_scores: dict[tuple, float] = {}
    ot_datasources: dict[tuple, list] = {}
    ot_is_direct: dict[tuple, bool] = {}

    with gzip.open(OT_ASSOC_GZ, "rt", encoding="utf-8") as fh:
        for i, line in enumerate(fh):
            r = json.loads(line)
            t_id = r["target"]["id"]
            d_id = r["disease"]["id"]
            is_direct = r.get("is_direct", None)

            # Use only germline datasource scores
            ds_scores = r["association_score"].get("datasources", {})
            germline_ds = {
                ds: sc for ds, sc in ds_scores.items()
                if sc > 0 and ds in GERMLINE_GENETIC_SOURCES
            }
            if germline_ds:
                key = (t_id, d_id)
                score = max(germline_ds.values())
                # Keep the higher-scoring record if duplicates exist
                if key not in ot_scores or score > ot_scores[key]:
                    ot_scores[key] = score
                    ot_datasources[key] = list(germline_ds.keys())
                    ot_is_direct[key] = is_direct

            if i > 0 and i % 500_000 == 0:
                print(f"      ... {i:,} records processed, {len(ot_scores):,} with GA > 0")

    print(f"      Loaded {len(ot_scores):,} target-disease pairs with germline genetic_association > 0")

    # Apply scores
    scoreable_mask = df["is_scoreable"]
    hits = 0
    for idx, row in df[scoreable_mask].iterrows():
        key = (row["ensembl_id"], row["disease_efo_id"])
        if key in ot_scores:
            df.at[idx, "genetic_association_score"] = ot_scores[key]
            df.at[idx, "ot_score_source"] = "ot_2020"
            df.at[idx, "is_direct"] = ot_is_direct.get(key)
            ds_list = ot_datasources.get(key, [])
            df.at[idx, "germline_datasources"] = ",".join(sorted(ds_list)) if ds_list else None
            hits += 1

    print(f"      Scored: {hits:,} rows from OT 20.02")

    unscored = scoreable_mask.sum() - hits
    print(f"      Unscored (no OT 20.02 match): {unscored:,} rows")

    # ── STEP 6: Company-level GS classification ─────────────────────────────
    print(f"\n[7/7] Computing company-level GS classification (threshold > {GS_THRESHOLD})...")

    df["genetic_association_score"] = pd.to_numeric(df["genetic_association_score"], errors="coerce")

    # Per-company aggregates
    scoreable_df = df[df["is_scoreable"] == True].copy()
    unique_pairs = scoreable_df.drop_duplicates(subset=["ticker", "ensembl_id", "disease_efo_id"])

    company_stats = (
        unique_pairs.groupby("ticker")
        .agg(
            n_scoreable_pairs=("genetic_association_score", "count"),
            n_scored_pairs=("genetic_association_score", lambda x: x.notna().sum()),
            best_score=("genetic_association_score", "max"),
        )
        .reset_index()
    )

    # Lead-program selection: highest phase rank, tiebreak by score
    scored_rows = df[
        (df["is_scoreable"] == True)
        & df["genetic_association_score"].notna()
    ].copy()
    scored_rows["phase_rank"] = scored_rows["phase"].map(PHASE_RANK).fillna(0)

    lead_candidates = (
        scored_rows
        .sort_values(["ticker", "phase_rank", "genetic_association_score"], ascending=[True, False, False])
        .drop_duplicates(subset=["ticker", "ensembl_id", "disease_efo_id"], keep="first")
    )

    if len(lead_candidates) > 0:
        lead_programs = (
            lead_candidates
            .sort_values(["ticker", "phase_rank", "genetic_association_score"], ascending=[True, False, False])
            .groupby("ticker", sort=False)
            .first()
            .reset_index()
        )[["ticker", "phase", "phase_rank", "genetic_association_score",
           "gene_symbol", "ensembl_id", "disease_efo_id", "conditions",
           "is_direct", "germline_datasources",
           "nct_id", "intervention_name", "start_date", "drug_chembl_id",
           "mapping_source", "efo_mapping_source", "gene_source"]]
    else:
        lead_programs = pd.DataFrame(columns=[
            "ticker", "phase", "phase_rank", "genetic_association_score",
            "gene_symbol", "ensembl_id", "disease_efo_id", "conditions",
            "is_direct", "germline_datasources",
            "nct_id", "intervention_name", "start_date", "drug_chembl_id",
            "mapping_source", "efo_mapping_source", "gene_source"])

    lead_programs = lead_programs.rename(columns={
        "phase": "lead_phase",
        "phase_rank": "lead_phase_rank",
        "genetic_association_score": "lead_score",
        "gene_symbol": "lead_gene",
        "ensembl_id": "lead_ensembl_id",
        "disease_efo_id": "lead_efo_id",
        "conditions": "lead_conditions",
        "is_direct": "lead_is_direct",
        "germline_datasources": "lead_datasources",
        "nct_id": "lead_nct_id",
        "intervention_name": "lead_drug",
        "start_date": "lead_trial_start",
        "drug_chembl_id": "lead_chembl_id",
        "mapping_source": "lead_mapping_source",
        "efo_mapping_source": "lead_efo_mapping_source",
        "gene_source": "lead_gene_source",
    })

    company_stats = company_stats.merge(lead_programs, on="ticker", how="left")

    # ── Apply lead program overrides ───────────────────────────────────────
    print("\n      Applying lead program overrides...")
    company_stats["lead_override_note"] = ""

    for ticker, override in LEAD_PROGRAM_OVERRIDES.items():
        if ticker not in company_stats["ticker"].values:
            continue

        idx = company_stats[company_stats["ticker"] == ticker].index[0]

        if "gene" in override:
            # Full override: replace drug and gene, re-score from OT 20.02
            gene = override["gene"]
            drug = override["drug"]
            ensembl_id = symbol_to_ensembl.get(gene, "")
            note = override.get("note", "")

            # Find the best pipeline row for the correct drug
            drug_rows = df[
                (df["ticker"] == ticker)
                & df["intervention_name"].str.contains(drug, case=False, na=False)
                & (df["row_flag"] == "valid")
            ].copy()
            if len(drug_rows) > 0:
                drug_rows["_pr"] = drug_rows["phase"].map(PHASE_RANK).fillna(0)
                best_row = drug_rows.sort_values("_pr", ascending=False).iloc[0]
                nct_id = best_row.get("nct_id", "")
                phase = best_row.get("phase", "")
                trial_start = best_row.get("start_date", "")
                conditions = best_row.get("conditions", "")
                chembl_id = best_row.get("drug_chembl_id", "")
                efo_id = best_row.get("disease_efo_id", "")
            else:
                nct_id = phase = trial_start = conditions = chembl_id = efo_id = ""

            # Look up OT 20.02 score for corrected gene × disease
            ot_score = None
            is_direct = None
            datasources = ""
            if ensembl_id and efo_id:
                key = (ensembl_id, efo_id)
                if key in ot_scores:
                    ot_score = ot_scores[key]
                    is_direct = ot_is_direct.get(key)
                    ds_list = ot_datasources.get(key, [])
                    datasources = ",".join(sorted(ds_list)) if ds_list else ""

            old_drug = company_stats.at[idx, "lead_drug"]
            old_gene = company_stats.at[idx, "lead_gene"]
            old_score = company_stats.at[idx, "lead_score"]

            company_stats.at[idx, "lead_gene"] = gene
            company_stats.at[idx, "lead_ensembl_id"] = ensembl_id
            company_stats.at[idx, "lead_score"] = ot_score
            company_stats.at[idx, "lead_is_direct"] = is_direct
            company_stats.at[idx, "lead_datasources"] = datasources
            company_stats.at[idx, "lead_drug"] = drug
            company_stats.at[idx, "lead_nct_id"] = nct_id
            company_stats.at[idx, "lead_phase"] = phase
            company_stats.at[idx, "lead_trial_start"] = trial_start
            company_stats.at[idx, "lead_conditions"] = conditions
            company_stats.at[idx, "lead_chembl_id"] = chembl_id
            company_stats.at[idx, "lead_efo_id"] = efo_id
            company_stats.at[idx, "lead_mapping_source"] = "manual_override"
            company_stats.at[idx, "lead_gene_source"] = "manual_override"
            company_stats.at[idx, "lead_override_note"] = note

            score_str = f"{ot_score:.4f}" if ot_score is not None else "None"
            print(f"      {ticker}: {old_drug}->{old_gene} ({old_score}) → {drug}->{gene} ({score_str})")

        elif "primary_moa_note" in override:
            # Annotation only: keep existing lead, add note
            company_stats.at[idx, "lead_override_note"] = override["primary_moa_note"]
            print(f"      {ticker}: annotated — {override['primary_moa_note']}")

    # GS classification at 0.80
    company_stats["is_gs"] = (
        company_stats["lead_score"].notna()
        & (company_stats["lead_score"] > GS_THRESHOLD)
    )

    # Diagnostic companies: always non-GS
    diag_tickers = set(DIAGNOSTIC_COMPANIES.keys())
    company_stats.loc[company_stats["ticker"].isin(diag_tickers), "is_gs"] = False

    # Merge company stats back into main dataframe
    gs_cols = [c for c in company_stats.columns if c != "ticker"]
    df = df.merge(company_stats[["ticker"] + gs_cols], on="ticker", how="left")

    df["is_gs"] = df["is_gs"].fillna(False)

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

    print(f"\nOT 20.02 scoring (scoreable rows only):")
    scored_mask = df["is_scoreable"] == True
    n_with_score = (scored_mask & df["ot_score_source"].notna()).sum()
    n_without = (scored_mask & df["ot_score_source"].isna()).sum()
    print(f"  Scored (OT 20.02):   {n_with_score:>6,}")
    print(f"  No OT 20.02 match:   {n_without:>6,}")

    # is_direct breakdown among scored rows
    direct_mask = scored_mask & (df["is_direct"] == True)
    indirect_mask = scored_mask & (df["is_direct"] == False)
    print(f"\nis_direct breakdown (scored rows):")
    print(f"  Direct:              {direct_mask.sum():>6,}")
    print(f"  Indirect:            {indirect_mask.sum():>6,}")

    n_gs = company_stats["is_gs"].sum()
    n_total = df["ticker"].nunique()
    print(f"\nGS classification (lead program score > {GS_THRESHOLD}):")
    print(f"  GS:     {n_gs:>3} tickers")
    print(f"  Non-GS: {n_total - n_gs:>3} tickers")

    # List GS companies
    gs_companies = company_stats[company_stats["is_gs"] == True].sort_values("lead_score", ascending=False)
    print(f"\nGS companies ({len(gs_companies)}):")
    for _, row in gs_companies.iterrows():
        direct_str = "direct" if row.get("lead_is_direct") == True else "indirect"
        print(f"  {row['ticker']:<6} score={row['lead_score']:.4f}  {direct_str:<10} "
              f"phase={row.get('lead_phase', ''):<15} gene={row.get('lead_gene', '')}")

    # Lead program score distribution
    lead_scores = company_stats["lead_score"].dropna()
    if len(lead_scores) > 0:
        print(f"\nLead program score distribution ({len(lead_scores)} companies with scores):")
        print(f"  min={lead_scores.min():.4f}  median={lead_scores.median():.4f}  max={lead_scores.max():.4f}")
        for thresh in [0.10, 0.50, 0.80, 0.95]:
            n_above = (lead_scores > thresh).sum()
            print(f"  > {thresh:.2f}: {n_above:>3} companies")

    print(f"\n{'=' * 70}")
    print(f"Done. Output: {OUTPUT_TSV}")


if __name__ == "__main__":
    main()
