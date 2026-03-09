const RESULTS = {
  "methodology": {
    "start_date": "2020-01-02",
    "end_date": "2026-02-21",
    "universe": "XBI Jan 2020 N-PORT holdings",
    "n_companies": 126,
    "weighting": "equal-weight",
    "bootstrap_iterations": 2000,
    "bootstrap_seed": 42,
    "ot_data_primary": "OT 20.02 (Feb 2020 release, no look-ahead)",
    "ot_data_fallback": "OT Platform API current (flagged as ot_recent_fallback)",
    "gs_A_definition": "pct_gs_pairs >= 0.50 (\u226550% of scoreable pairs have score > 0.10)",
    "gs_B_definition": "any Phase2/3/4 scoreable pair with score > 0.10"
  },
  "benchmarks": {
    "XBI_return_pct": 32.82,
    "XBI_dollar_1000": 1328.2,
    "all_universe_mean_pct": 45.72,
    "all_universe_median_pct": -5.4
  },
  "primary": {
    "n_gs": 65,
    "n_nongs": 61,
    "gs_mean": 58.69,
    "nongs_mean": 31.9,
    "gs_median": 0.74,
    "nongs_median": -25.89,
    "gs_ci_lo": 21.06,
    "gs_ci_hi": 102.32,
    "nongs_ci_lo": -5.69,
    "nongs_ci_hi": 75.14,
    "gs_dollar": 1586.94,
    "nongs_dollar": 1319.0,
    "alpha_vs_nongs": 26.79,
    "alpha_vs_xbi": 25.87
  },
  "mendelian": {
    "n_gs": 28,
    "n_nongs": 98,
    "gs_mean": 55.47,
    "nongs_mean": 42.94,
    "gs_median": 27.66,
    "nongs_median": -15.0,
    "gs_ci_lo": 13.23,
    "gs_ci_hi": 100.94,
    "nongs_ci_lo": 9.04,
    "nongs_ci_hi": 79.66,
    "alpha": 12.53
  },
  "sensitivity_proportion": [
    {
      "label": "25%",
      "n_gs": 45,
      "n_nongs": 81,
      "gs_mean": 72.19,
      "nongs_mean": 31.02,
      "alpha": 41.17,
      "gs_ci_lo": 25.18,
      "gs_ci_hi": 124.45
    },
    {
      "label": "33%",
      "n_gs": 35,
      "n_nongs": 91,
      "gs_mean": 63.16,
      "nongs_mean": 39.02,
      "alpha": 24.14,
      "gs_ci_lo": 7.46,
      "gs_ci_hi": 125.65
    },
    {
      "label": "50%",
      "n_gs": 19,
      "n_nongs": 107,
      "gs_mean": 39.48,
      "nongs_mean": 46.83,
      "alpha": -7.35,
      "gs_ci_lo": -24.94,
      "gs_ci_hi": 111.15
    },
    {
      "label": "75%",
      "n_gs": 7,
      "n_nongs": 119,
      "gs_mean": -69.73,
      "nongs_mean": 52.51,
      "alpha": -122.24,
      "gs_ci_lo": -94.13,
      "gs_ci_hi": -42.66
    }
  ],
  "subgroup": {
    "oncology_gs_B_mean_pct": 43.3,
    "oncology_nongs_B_mean_pct": 3.72,
    "nonog_gs_B_mean_pct": 69.02,
    "nonog_nongs_B_mean_pct": 39.74,
    "n_oncology_gs": 20,
    "n_oncology_nongs": 16,
    "n_nonog_gs": 43,
    "n_nonog_nongs": 47
  }
};

const COMPANIES = [
  {
    "ticker": "ABBV",
    "company": "AbbVie Inc",
    "return_pct": 224.56,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 1.0,
    "n_scoreable": 104,
    "n_gs": 103,
    "pct_gs": 0.9904,
    "is_oncology": false,
    "score_source": "ot_2020"
  },
  {
    "ticker": "ACAD",
    "company": "ACADIA Pharmaceuticals Inc",
    "return_pct": -41.64,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.949656,
    "n_scoreable": 4,
    "n_gs": 4,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "ACHN",
    "company": "Achillion Pharmaceuticals Inc",
    "return_pct": 1.7,
    "outcome": "acquired",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.754864,
    "n_scoreable": 1,
    "n_gs": 1,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "ADVM",
    "company": "Adverum Biotechnologies Inc",
    "return_pct": -100.0,
    "outcome": "bankrupt",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "AGEN",
    "company": "Agenus Inc",
    "return_pct": -96.14,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "AGIO",
    "company": "Agios Pharmaceuticals Inc",
    "return_pct": -38.45,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 1.0,
    "n_scoreable": 3,
    "n_gs": 3,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_2020"
  },
  {
    "ticker": "AIMT",
    "company": "Aimmune Therapeutics Inc",
    "return_pct": 40.8,
    "outcome": "acquired",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "AKBA",
    "company": "Akebia Therapeutics Inc",
    "return_pct": -81.39,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.902092,
    "n_scoreable": 4,
    "n_gs": 4,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "AKCA",
    "company": "Akcea Therapeutics Inc",
    "return_pct": -1.9,
    "outcome": "acquired",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.835072,
    "n_scoreable": 2,
    "n_gs": 2,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "ALEC",
    "company": "Alector Inc",
    "return_pct": -87.99,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "ALKS",
    "company": "Alkermes PLC",
    "return_pct": 61.49,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.915177,
    "n_scoreable": 4,
    "n_gs": 4,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "ALLK",
    "company": "Allakos Inc",
    "return_pct": -100.0,
    "outcome": "bankrupt",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "ALLO",
    "company": "Allogene Therapeutics Inc",
    "return_pct": -92.18,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": true,
    "score_source": null
  },
  {
    "ticker": "ALNY",
    "company": "Alnylam Pharmaceuticals Inc",
    "return_pct": 190.77,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 1.0,
    "n_scoreable": 4,
    "n_gs": 4,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_2020"
  },
  {
    "ticker": "ALXN",
    "company": "Alexion Pharmaceuticals Inc",
    "return_pct": 61.4,
    "outcome": "acquired",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.899166,
    "n_scoreable": 3,
    "n_gs": 3,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "AMAG",
    "company": "AMAG Pharmaceuticals Inc",
    "return_pct": -16.7,
    "outcome": "acquired",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "AMGN",
    "company": "Amgen Inc",
    "return_pct": 89.04,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 1.0,
    "n_scoreable": 53,
    "n_gs": 53,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_2020"
  },
  {
    "ticker": "ANAB",
    "company": "AnaptysBio Inc",
    "return_pct": 241.03,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 0.962045,
    "n_scoreable": 3,
    "n_gs": 3,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_2020"
  },
  {
    "ticker": "ANIK",
    "company": "Anika Therapeutics Inc",
    "return_pct": -79.71,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "APLS",
    "company": "Apellis Pharmaceuticals Inc",
    "return_pct": -28.51,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 1.0,
    "n_scoreable": 4,
    "n_gs": 4,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_2020"
  },
  {
    "ticker": "ARNA",
    "company": "Arena Pharmaceuticals Inc",
    "return_pct": 92.4,
    "outcome": "acquired",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 0.955632,
    "n_scoreable": 6,
    "n_gs": 6,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "ARQL",
    "company": "ArQule Inc",
    "return_pct": 0.5,
    "outcome": "acquired",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.930908,
    "n_scoreable": 2,
    "n_gs": 2,
    "pct_gs": 1.0,
    "is_oncology": true,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "ARWR",
    "company": "Arrowhead Pharmaceuticals Inc",
    "return_pct": 0.74,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.534613,
    "n_scoreable": 2,
    "n_gs": 2,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "ATNX",
    "company": "Athenex Inc",
    "return_pct": -99.0,
    "outcome": "bankrupt",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": true,
    "score_source": null
  },
  {
    "ticker": "ATRA",
    "company": "Atara Biotherapeutics Inc",
    "return_pct": -98.98,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": true,
    "score_source": null
  },
  {
    "ticker": "AVRO",
    "company": "Avrobio Inc",
    "return_pct": -90.0,
    "outcome": "bankrupt",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "BBIO",
    "company": "Bridgebio Pharma Inc",
    "return_pct": 105.12,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 1.0,
    "n_scoreable": 1,
    "n_gs": 1,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_2020"
  },
  {
    "ticker": "BCRX",
    "company": "BioCryst Pharmaceuticals Inc",
    "return_pct": 119.12,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.875755,
    "n_scoreable": 3,
    "n_gs": 3,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "BHVN",
    "company": "Biohaven Pharmaceutical Holding Co Ltd",
    "return_pct": 230.0,
    "outcome": "acquired",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "BIIB",
    "company": "Biogen Inc",
    "return_pct": -34.74,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 1.0,
    "n_scoreable": 11,
    "n_gs": 11,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_2020"
  },
  {
    "ticker": "BMRN",
    "company": "BioMarin Pharmaceutical Inc",
    "return_pct": -23.75,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.991628,
    "n_scoreable": 5,
    "n_gs": 5,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "BPMC",
    "company": "Blueprint Medicines Corp",
    "return_pct": 260.0,
    "outcome": "acquired",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.934259,
    "n_scoreable": 16,
    "n_gs": 16,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "CHRS",
    "company": "Coherus Biosciences Inc",
    "return_pct": -91.1,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 0.5,
    "n_scoreable": 1,
    "n_gs": 1,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_2020"
  },
  {
    "ticker": "CLVS",
    "company": "Clovis Oncology Inc",
    "return_pct": -100.0,
    "outcome": "bankrupt",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 1.0,
    "n_scoreable": 3,
    "n_gs": 3,
    "pct_gs": 1.0,
    "is_oncology": true,
    "score_source": "ot_2020"
  },
  {
    "ticker": "CPRX",
    "company": "Catalyst Pharmaceuticals Inc",
    "return_pct": 544.56,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.455179,
    "n_scoreable": 2,
    "n_gs": 2,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "CYTK",
    "company": "Cytokinetics Inc",
    "return_pct": 543.98,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.943323,
    "n_scoreable": 1,
    "n_gs": 1,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "DCPH",
    "company": "Deciphera Pharmaceuticals Inc",
    "return_pct": -3.4,
    "outcome": "acquired",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.966401,
    "n_scoreable": 14,
    "n_gs": 14,
    "pct_gs": 1.0,
    "is_oncology": true,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "DNLI",
    "company": "Denali Therapeutics Inc",
    "return_pct": 23.18,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "DRNA",
    "company": "Dicerna Pharmaceuticals Inc",
    "return_pct": 118.7,
    "outcome": "acquired",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "DVAX",
    "company": "Dynavax Technologies Corp",
    "return_pct": 183.36,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "EBS",
    "company": "Emergent BioSolutions Inc",
    "return_pct": -79.76,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "EDIT",
    "company": "Editas Medicine Inc",
    "return_pct": -93.92,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "EGRX",
    "company": "Eagle Pharmaceuticals Inc/DE",
    "return_pct": -99.67,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "ENTA",
    "company": "Enanta Pharmaceuticals Inc",
    "return_pct": -78.21,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.772003,
    "n_scoreable": 3,
    "n_gs": 3,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "EPZM",
    "company": "Epizyme Inc",
    "return_pct": 105.2,
    "outcome": "acquired",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 0.934979,
    "n_scoreable": 5,
    "n_gs": 5,
    "pct_gs": 1.0,
    "is_oncology": true,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "ESPR",
    "company": "Esperion Therapeutics Inc",
    "return_pct": -94.33,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 1.0,
    "n_scoreable": 10,
    "n_gs": 10,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_2020"
  },
  {
    "ticker": "EXEL",
    "company": "Exelixis Inc",
    "return_pct": 147.06,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 1.0,
    "n_scoreable": 14,
    "n_gs": 14,
    "pct_gs": 1.0,
    "is_oncology": true,
    "score_source": "ot_2020"
  },
  {
    "ticker": "FATE",
    "company": "Fate Therapeutics Inc",
    "return_pct": -92.5,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "FLXN",
    "company": "Flexion Therapeutics Inc",
    "return_pct": -63.0,
    "outcome": "acquired",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": true,
    "score_source": null
  },
  {
    "ticker": "FOLD",
    "company": "Amicus Therapeutics Inc",
    "return_pct": 50.16,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "GBT",
    "company": "Global Blood Therapeutics Inc",
    "return_pct": -2.6,
    "outcome": "acquired",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.885798,
    "n_scoreable": 2,
    "n_gs": 2,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "GILD",
    "company": "Gilead Sciences Inc",
    "return_pct": 192.65,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 1.0,
    "n_scoreable": 79,
    "n_gs": 77,
    "pct_gs": 0.9747,
    "is_oncology": false,
    "score_source": "ot_2020"
  },
  {
    "ticker": "GOSS",
    "company": "Gossamer Bio Inc",
    "return_pct": -86.17,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "GTHX",
    "company": "G1 Therapeutics Inc",
    "return_pct": -75.2,
    "outcome": "acquired",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 1.0,
    "n_scoreable": 8,
    "n_gs": 8,
    "pct_gs": 1.0,
    "is_oncology": true,
    "score_source": "ot_2020"
  },
  {
    "ticker": "HALO",
    "company": "Halozyme Therapeutics Inc",
    "return_pct": 292.15,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": true,
    "score_source": null
  },
  {
    "ticker": "HRTX",
    "company": "Heron Therapeutics Inc",
    "return_pct": -94.91,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "ICPT",
    "company": "Intercept Pharmaceuticals Inc",
    "return_pct": -86.1,
    "outcome": "acquired",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.884568,
    "n_scoreable": 4,
    "n_gs": 4,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "IMGN",
    "company": "ImmunoGen Inc",
    "return_pct": 651.4,
    "outcome": "acquired",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.853948,
    "n_scoreable": 1,
    "n_gs": 1,
    "pct_gs": 1.0,
    "is_oncology": true,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "INCY",
    "company": "Incyte Corp",
    "return_pct": 17.86,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 1.0,
    "n_scoreable": 99,
    "n_gs": 98,
    "pct_gs": 0.9899,
    "is_oncology": true,
    "score_source": "ot_2020"
  },
  {
    "ticker": "INSM",
    "company": "Insmed Inc",
    "return_pct": 597.0,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "IONS",
    "company": "Ionis Pharmaceuticals Inc",
    "return_pct": 36.56,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 1.0,
    "n_scoreable": 3,
    "n_gs": 3,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_2020"
  },
  {
    "ticker": "IOVA",
    "company": "Iovance Biotherapeutics Inc",
    "return_pct": -89.24,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": true,
    "score_source": null
  },
  {
    "ticker": "IRWD",
    "company": "Ironwood Pharmaceuticals Inc",
    "return_pct": -70.14,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.756372,
    "n_scoreable": 2,
    "n_gs": 2,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "KDMN",
    "company": "Kadmon Holdings Inc",
    "return_pct": 171.4,
    "outcome": "acquired",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 0.983426,
    "n_scoreable": 11,
    "n_gs": 11,
    "pct_gs": 1.0,
    "is_oncology": true,
    "score_source": "ot_2020"
  },
  {
    "ticker": "KOD",
    "company": "Kodiak Sciences Inc",
    "return_pct": -62.9,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "KPTI",
    "company": "Karyopharm Therapeutics Inc",
    "return_pct": -96.56,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.92766,
    "n_scoreable": 7,
    "n_gs": 7,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "KRTX",
    "company": "Karuna Therapeutics Inc",
    "return_pct": 227.4,
    "outcome": "acquired",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "KRYS",
    "company": "Krystal Biotech Inc",
    "return_pct": 359.38,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "KURA",
    "company": "Kura Oncology Inc",
    "return_pct": -39.74,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.182379,
    "n_scoreable": 1,
    "n_gs": 1,
    "pct_gs": 1.0,
    "is_oncology": true,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "LGND",
    "company": "Ligand Pharmaceuticals Inc",
    "return_pct": 181.57,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "MDCO",
    "company": "Medicines Co/The",
    "return_pct": 1.8,
    "outcome": "acquired",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 1.0,
    "n_scoreable": 3,
    "n_gs": 3,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_2020"
  },
  {
    "ticker": "MDGL",
    "company": "Madrigal Pharmaceuticals Inc",
    "return_pct": 379.72,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.387924,
    "n_scoreable": 1,
    "n_gs": 1,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "MGNX",
    "company": "MacroGenics Inc",
    "return_pct": -84.23,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 0.953356,
    "n_scoreable": 7,
    "n_gs": 7,
    "pct_gs": 1.0,
    "is_oncology": true,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "MNTA",
    "company": "Momenta Pharmaceuticals Inc",
    "return_pct": 109.3,
    "outcome": "acquired",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "MRNA",
    "company": "Moderna Inc",
    "return_pct": 159.33,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": true,
    "score_source": null
  },
  {
    "ticker": "MRTX",
    "company": "Mirati Therapeutics Inc",
    "return_pct": -47.3,
    "outcome": "acquired",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 0.936175,
    "n_scoreable": 9,
    "n_gs": 9,
    "pct_gs": 1.0,
    "is_oncology": true,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "MYGN",
    "company": "Myriad Genetics Inc",
    "return_pct": -84.31,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 0.934515,
    "n_scoreable": 6,
    "n_gs": 6,
    "pct_gs": 1.0,
    "is_oncology": true,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "NBIX",
    "company": "Neurocrine Biosciences Inc",
    "return_pct": 18.77,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 0.853125,
    "n_scoreable": 1,
    "n_gs": 1,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_2020"
  },
  {
    "ticker": "NXTC",
    "company": "NextCure Inc",
    "return_pct": -97.95,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": true,
    "score_source": null
  },
  {
    "ticker": "OPK",
    "company": "OPKO Health Inc",
    "return_pct": -19.46,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.990046,
    "n_scoreable": 1,
    "n_gs": 1,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "PBYI",
    "company": "Puma Biotechnology Inc",
    "return_pct": -18.98,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 0.953356,
    "n_scoreable": 3,
    "n_gs": 3,
    "pct_gs": 1.0,
    "is_oncology": true,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "PGNX",
    "company": "Progenics Pharmaceuticals Inc",
    "return_pct": 3.6,
    "outcome": "acquired",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.827944,
    "n_scoreable": 1,
    "n_gs": 1,
    "pct_gs": 1.0,
    "is_oncology": true,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "PRNB",
    "company": "Principia Biopharma Inc",
    "return_pct": 90.3,
    "outcome": "acquired",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": true,
    "score_source": null
  },
  {
    "ticker": "PRTA",
    "company": "Prothena Corp PLC",
    "return_pct": -42.29,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "PTCT",
    "company": "PTC Therapeutics Inc",
    "return_pct": 45.87,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.926234,
    "n_scoreable": 1,
    "n_gs": 1,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "PTLA",
    "company": "Portola Pharmaceuticals Inc",
    "return_pct": -36.8,
    "outcome": "acquired",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "RARE",
    "company": "Ultragenyx Pharmaceutical Inc",
    "return_pct": -47.3,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.974571,
    "n_scoreable": 1,
    "n_gs": 1,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "RARX",
    "company": "Ra Pharmaceuticals Inc",
    "return_pct": 113.3,
    "outcome": "acquired",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.934257,
    "n_scoreable": 17,
    "n_gs": 17,
    "pct_gs": 1.0,
    "is_oncology": true,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "RCKT",
    "company": "Rocket Pharmaceuticals Inc",
    "return_pct": -83.78,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "RDUS",
    "company": "Radius Health Inc",
    "return_pct": -42.9,
    "outcome": "acquired",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "REGN",
    "company": "Regeneron Pharmaceuticals Inc",
    "return_pct": 110.24,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 1.0,
    "n_scoreable": 19,
    "n_gs": 18,
    "pct_gs": 0.9474,
    "is_oncology": false,
    "score_source": "ot_2020"
  },
  {
    "ticker": "RYTM",
    "company": "Rhythm Pharmaceuticals Inc",
    "return_pct": 335.72,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 1.0,
    "n_scoreable": 3,
    "n_gs": 3,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_2020"
  },
  {
    "ticker": "SAGE",
    "company": "Sage Therapeutics Inc",
    "return_pct": -93.0,
    "outcome": "acquired",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "SGEN",
    "company": "Seattle Genetics Inc",
    "return_pct": 109.7,
    "outcome": "acquired",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.846901,
    "n_scoreable": 8,
    "n_gs": 8,
    "pct_gs": 1.0,
    "is_oncology": true,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "SGMO",
    "company": "Sangamo Therapeutics Inc",
    "return_pct": -95.37,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.607931,
    "n_scoreable": 1,
    "n_gs": 1,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "SPPI",
    "company": "Spectrum Pharmaceuticals Inc",
    "return_pct": -74.0,
    "outcome": "acquired",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.881924,
    "n_scoreable": 1,
    "n_gs": 1,
    "pct_gs": 1.0,
    "is_oncology": true,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "SRPT",
    "company": "Sarepta Therapeutics Inc",
    "return_pct": -85.37,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.926234,
    "n_scoreable": 1,
    "n_gs": 1,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "STML",
    "company": "Stemline Therapeutics Inc",
    "return_pct": -7.4,
    "outcome": "acquired",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": true,
    "score_source": null
  },
  {
    "ticker": "TGTX",
    "company": "TG Therapeutics Inc",
    "return_pct": 170.17,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": true,
    "best_score": 0.952909,
    "n_scoreable": 17,
    "n_gs": 12,
    "pct_gs": 0.7059,
    "is_oncology": true,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "TPTX",
    "company": "Turning Point Therapeutics Inc",
    "return_pct": 25.0,
    "outcome": "acquired",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": true,
    "score_source": null
  },
  {
    "ticker": "UTHR",
    "company": "United Therapeutics Corp",
    "return_pct": 440.06,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.962992,
    "n_scoreable": 5,
    "n_gs": 5,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "VCEL",
    "company": "Vericel Corp",
    "return_pct": 117.78,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "VKTX",
    "company": "Viking Therapeutics Inc",
    "return_pct": 290.31,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "VNDA",
    "company": "Vanda Pharmaceuticals Inc",
    "return_pct": -64.4,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.913624,
    "n_scoreable": 3,
    "n_gs": 3,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "VRTX",
    "company": "Vertex Pharmaceuticals Inc",
    "return_pct": 117.32,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.979015,
    "n_scoreable": 3,
    "n_gs": 3,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "VYGR",
    "company": "Voyager Therapeutics Inc",
    "return_pct": -74.3,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "XLRN",
    "company": "Acceleron Pharma Inc",
    "return_pct": 236.4,
    "outcome": "acquired",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "XNCR",
    "company": "Xencor Inc",
    "return_pct": -67.37,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": true,
    "score_source": null
  },
  {
    "ticker": "XON",
    "company": "Intrexon Corp",
    "return_pct": -25.89,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": true,
    "score_source": null
  },
  {
    "ticker": "YMAB",
    "company": "Y-mAbs Therapeutics Inc",
    "return_pct": -86.2,
    "outcome": "acquired",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": true,
    "score_source": null
  },
  {
    "ticker": "ZIOP",
    "company": "ZIOPHARM Oncology Inc",
    "return_pct": -99.61,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": true,
    "score_source": null
  },
  {
    "ticker": "BLUE",
    "company": "Bluebird Bio Inc",
    "return_pct": -97.0,
    "outcome": "bankrupt",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.820039,
    "n_scoreable": 2,
    "n_gs": 2,
    "pct_gs": 1.0,
    "is_oncology": true,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "BOLD",
    "company": "Audentes Therapeutics Inc",
    "return_pct": 11.1,
    "outcome": "acquired",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "CCXI",
    "company": "ChemoCentryx Inc",
    "return_pct": 39.9,
    "outcome": "acquired",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "FGEN",
    "company": "FibroGen Inc",
    "return_pct": -99.24,
    "outcome": "active",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.926234,
    "n_scoreable": 1,
    "n_gs": 1,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "FIXX",
    "company": "Homology Medicines Inc",
    "return_pct": -85.0,
    "outcome": "acquired",
    "is_gs_a": true,
    "mendelian_only": false,
    "best_score": 0.991628,
    "n_scoreable": 1,
    "n_gs": 1,
    "pct_gs": 1.0,
    "is_oncology": false,
    "score_source": "ot_recent_fallback"
  },
  {
    "ticker": "IMMU",
    "company": "Immunomedics Inc",
    "return_pct": 319.5,
    "outcome": "acquired",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": true,
    "score_source": null
  },
  {
    "ticker": "NTLA",
    "company": "Intellia Therapeutics Inc",
    "return_pct": -13.31,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "RGNX",
    "company": "REGENXBIO Inc",
    "return_pct": -79.12,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "RTRX",
    "company": "Retrophin Inc",
    "return_pct": 119.11,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "CDNA",
    "company": "CareDx Inc",
    "return_pct": -11.11,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "EXAS",
    "company": "Exact Sciences Corp",
    "return_pct": 8.21,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "NTRA",
    "company": "Natera Inc",
    "return_pct": 537.19,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "NVTA",
    "company": "Invitae Corp",
    "return_pct": -100.0,
    "outcome": "bankrupt",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "TWST",
    "company": "Twist Bioscience Corp",
    "return_pct": 133.05,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  },
  {
    "ticker": "VCYT",
    "company": "Veracyte Inc",
    "return_pct": 29.52,
    "outcome": "active",
    "is_gs_a": false,
    "mendelian_only": false,
    "best_score": null,
    "n_scoreable": 0,
    "n_gs": 0,
    "pct_gs": null,
    "is_oncology": false,
    "score_source": null
  }
];

const QUARTERLY = [
  {
    "date": "2020-01-02",
    "gs": 1000,
    "nongs": 1000,
    "xbi": 1000,
    "sp500": 1000,
    "gs_dd": 0.0,
    "nongs_dd": 0.0,
    "xbi_dd": 0.0
  },
  {
    "date": "2020-03-31",
    "gs": 911.07,
    "nongs": 903.83,
    "xbi": 817.91,
    "sp500": 793.34,
    "gs_dd": -8.89,
    "nongs_dd": -9.62,
    "xbi_dd": -18.21
  },
  {
    "date": "2020-06-30",
    "gs": 1177.79,
    "nongs": 1109.42,
    "xbi": 1182.59,
    "sp500": 951.64,
    "gs_dd": 0.0,
    "nongs_dd": 0.0,
    "xbi_dd": 0.0
  },
  {
    "date": "2020-09-30",
    "gs": 1104.25,
    "nongs": 1177.86,
    "xbi": 1178.0,
    "sp500": 1032.28,
    "gs_dd": -6.24,
    "nongs_dd": 0.0,
    "xbi_dd": -0.39
  },
  {
    "date": "2020-12-31",
    "gs": 1272.44,
    "nongs": 1625.9,
    "xbi": 1490.05,
    "sp500": 1152.93,
    "gs_dd": 0.0,
    "nongs_dd": 0.0,
    "xbi_dd": 0.0
  },
  {
    "date": "2021-03-31",
    "gs": 1249.01,
    "nongs": 1625.06,
    "xbi": 1436.15,
    "sp500": 1219.48,
    "gs_dd": -1.84,
    "nongs_dd": -0.05,
    "xbi_dd": -3.62
  },
  {
    "date": "2021-06-30",
    "gs": 1265.35,
    "nongs": 1862.6,
    "xbi": 1433.5,
    "sp500": 1319.12,
    "gs_dd": -0.56,
    "nongs_dd": 0.0,
    "xbi_dd": -3.8
  },
  {
    "date": "2021-09-30",
    "gs": 1196.34,
    "nongs": 1884.16,
    "xbi": 1330.91,
    "sp500": 1322.2,
    "gs_dd": -5.98,
    "nongs_dd": 0.0,
    "xbi_dd": -10.68
  },
  {
    "date": "2021-12-31",
    "gs": 1208.38,
    "nongs": 1639.62,
    "xbi": 1185.34,
    "sp500": 1462.98,
    "gs_dd": -5.03,
    "nongs_dd": -12.98,
    "xbi_dd": -20.45
  },
  {
    "date": "2022-03-31",
    "gs": 1164.85,
    "nongs": 1326.03,
    "xbi": 951.58,
    "sp500": 1390.61,
    "gs_dd": -8.46,
    "nongs_dd": -29.62,
    "xbi_dd": -36.14
  },
  {
    "date": "2022-06-30",
    "gs": 1068.16,
    "nongs": 1159.48,
    "xbi": 786.31,
    "sp500": 1161.93,
    "gs_dd": -16.05,
    "nongs_dd": -38.46,
    "xbi_dd": -47.23
  },
  {
    "date": "2022-09-30",
    "gs": 1144.26,
    "nongs": 1161.32,
    "xbi": 839.78,
    "sp500": 1100.61,
    "gs_dd": -10.07,
    "nongs_dd": -38.36,
    "xbi_dd": -43.64
  },
  {
    "date": "2022-12-31",
    "gs": 1225.15,
    "nongs": 1236.44,
    "xbi": 878.74,
    "sp500": 1178.54,
    "gs_dd": -3.72,
    "nongs_dd": -34.38,
    "xbi_dd": -41.03
  },
  {
    "date": "2023-03-31",
    "gs": 1162.23,
    "nongs": 1181.42,
    "xbi": 806.85,
    "sp500": 1261.36,
    "gs_dd": -8.66,
    "nongs_dd": -37.3,
    "xbi_dd": -45.85
  },
  {
    "date": "2023-06-30",
    "gs": 1116.45,
    "nongs": 1206.28,
    "xbi": 880.88,
    "sp500": 1366.05,
    "gs_dd": -12.26,
    "nongs_dd": -35.98,
    "xbi_dd": -40.88
  },
  {
    "date": "2023-09-30",
    "gs": 1022.91,
    "nongs": 1111.75,
    "xbi": 773.1,
    "sp500": 1316.22,
    "gs_dd": -19.61,
    "nongs_dd": -40.99,
    "xbi_dd": -48.12
  },
  {
    "date": "2023-12-31",
    "gs": 1283.04,
    "nongs": 1148.72,
    "xbi": 945.52,
    "sp500": 1464.1,
    "gs_dd": 0.0,
    "nongs_dd": -39.03,
    "xbi_dd": -36.54
  },
  {
    "date": "2024-03-31",
    "gs": 1360.46,
    "nongs": 1327.25,
    "xbi": 1004.82,
    "sp500": 1612.83,
    "gs_dd": 0.0,
    "nongs_dd": -29.56,
    "xbi_dd": -32.56
  },
  {
    "date": "2024-06-30",
    "gs": 1321.49,
    "nongs": 1267.65,
    "xbi": 982.96,
    "sp500": 1676.1,
    "gs_dd": -2.86,
    "nongs_dd": -32.72,
    "xbi_dd": -34.03
  },
  {
    "date": "2024-09-30",
    "gs": 1369.8,
    "nongs": 1276.62,
    "xbi": 1047.68,
    "sp500": 1768.8,
    "gs_dd": 0.0,
    "nongs_dd": -32.24,
    "xbi_dd": -29.69
  },
  {
    "date": "2024-12-31",
    "gs": 1329.19,
    "nongs": 1180.05,
    "xbi": 955.03,
    "sp500": 1805.37,
    "gs_dd": -2.96,
    "nongs_dd": -37.37,
    "xbi_dd": -35.91
  },
  {
    "date": "2025-03-31",
    "gs": 1346.1,
    "nongs": 1091.07,
    "xbi": 860.06,
    "sp500": 1722.56,
    "gs_dd": -1.73,
    "nongs_dd": -42.09,
    "xbi_dd": -42.28
  },
  {
    "date": "2025-06-30",
    "gs": 1324.45,
    "nongs": 1081.73,
    "xbi": 879.55,
    "sp500": 1904.62,
    "gs_dd": -3.31,
    "nongs_dd": -42.59,
    "xbi_dd": -40.97
  },
  {
    "date": "2025-09-30",
    "gs": 1490.25,
    "nongs": 1164.91,
    "xbi": 1063.01,
    "sp500": 2053.03,
    "gs_dd": 0.0,
    "nongs_dd": -38.17,
    "xbi_dd": -28.66
  },
  {
    "date": "2025-12-31",
    "gs": 1609.49,
    "nongs": 1306.26,
    "xbi": 1297.82,
    "sp500": 2101.23,
    "gs_dd": 0.0,
    "nongs_dd": -30.67,
    "xbi_dd": -12.9
  },
  {
    "date": "2026-02-21",
    "gs": 1586.94,
    "nongs": 1289.99,
    "xbi": 1328.16,
    "sp500": 2120.88,
    "gs_dd": -1.4,
    "nongs_dd": -31.54,
    "xbi_dd": -10.86
  }
];

const PIPELINE = {
  "ABBV": [
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Myeloproliferative Neoplasm",
      "efo_id": "EFO_0002428",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "TNF",
      "ensembl_id": "ENSG00000232810",
      "disease": "Psoriatic Arthritis",
      "efo_id": "EFO_0003778",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "TNF",
      "ensembl_id": "ENSG00000232810",
      "disease": "Rheumatoid Arthritis",
      "efo_id": "EFO_0000685",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Crohn's Disease (CD)",
      "efo_id": "EFO_0000384",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Rheumatoid Arthritis (RA)",
      "efo_id": "EFO_0000685",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Ulcerative Colitis (UC)",
      "efo_id": "EFO_0000729",
      "score": 0.964,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Ulcerative Colitis (UC)",
      "efo_id": "EFO_0000729",
      "score": 0.963,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PIK3CG",
      "ensembl_id": "ENSG00000105851",
      "disease": "Chronic Lymphocytic Leukemia",
      "efo_id": "EFO_0000095",
      "score": 0.952,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "AXL",
      "ensembl_id": "ENSG00000167601",
      "disease": "Acute Myeloid Leukemia (AML)",
      "efo_id": "EFO_0000222",
      "score": 0.943,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "BCL2",
      "ensembl_id": "ENSG00000171791",
      "disease": "Hematologic Malignancies",
      "efo_id": "EFO_0000574",
      "score": 0.942,
      "source": "ot_2020"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Crohn's Disease (CD)",
      "efo_id": "EFO_0000384",
      "score": 0.942,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Crohn's Disease (CD)",
      "efo_id": "EFO_0000384",
      "score": 0.942,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Ulcerative Colitis (UC)",
      "efo_id": "EFO_0000729",
      "score": 0.942,
      "source": "ot_2020"
    },
    {
      "gene": "ATP4A",
      "ensembl_id": "ENSG00000105675",
      "disease": "Psoriasis",
      "efo_id": "EFO_0000676",
      "score": 0.936,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Rheumatoid Arthritis (RA)",
      "efo_id": "EFO_0000685",
      "score": 0.936,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "IL23A",
      "ensembl_id": "ENSG00000110944",
      "disease": "Asthma",
      "efo_id": "MONDO_0004979",
      "score": 0.936,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Rheumatoid Arthritis (RA)",
      "efo_id": "EFO_0000685",
      "score": 0.935,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PIK3CD",
      "ensembl_id": "ENSG00000171608",
      "disease": "Chronic Lymphocytic Leukemia",
      "efo_id": "EFO_0000095",
      "score": 0.933,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "IL4R",
      "ensembl_id": "ENSG00000077238",
      "disease": "Atopic Dermatitis",
      "efo_id": "EFO_0000274",
      "score": 0.93,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PGR",
      "ensembl_id": "ENSG00000082175",
      "disease": "Endometriosis",
      "efo_id": "EFO_0001065",
      "score": 0.929,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Psoriatic Arthritis",
      "efo_id": "EFO_0003778",
      "score": 0.924,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDCD1",
      "ensembl_id": "ENSG00000188389",
      "disease": "Cancer",
      "efo_id": "MONDO_0004992",
      "score": 0.923,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "GNRHR",
      "ensembl_id": "ENSG00000109163",
      "disease": "Endometriosis",
      "efo_id": "EFO_0001065",
      "score": 0.923,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "BCL2",
      "ensembl_id": "ENSG00000171791",
      "disease": "Chronic Lymphocytic Leukemia",
      "efo_id": "EFO_0000095",
      "score": 0.922,
      "source": "ot_2020"
    },
    {
      "gene": "IL23A",
      "ensembl_id": "ENSG00000110944",
      "disease": "Arthritis, Psoriatic",
      "efo_id": "EFO_0003778",
      "score": 0.922,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Systemic Lupus Erythematosus (SLE)",
      "efo_id": "MONDO_0007915",
      "score": 0.917,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "BTK",
      "ensembl_id": "ENSG00000010671",
      "disease": "Cancer",
      "efo_id": "MONDO_0004992",
      "score": 0.916,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Systemic Lupus Erythematosus (SLE)",
      "efo_id": "MONDO_0007915",
      "score": 0.915,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Systemic Lupus Erythematosus (SLE)",
      "efo_id": "MONDO_0007915",
      "score": 0.915,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "DRD2",
      "ensembl_id": "ENSG00000149295",
      "disease": "Schizophrenia",
      "efo_id": "MONDO_0005090",
      "score": 0.915,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Systemic Lupus Erythematosus (SLE)",
      "efo_id": "MONDO_0007915",
      "score": 0.914,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "BCL2",
      "ensembl_id": "ENSG00000171791",
      "disease": "Cancer",
      "efo_id": "MONDO_0004992",
      "score": 0.901,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "DRD3",
      "ensembl_id": "ENSG00000151577",
      "disease": "Schizophrenia",
      "efo_id": "MONDO_0005090",
      "score": 0.901,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Spondyloarthritis",
      "efo_id": "EFO_0003778",
      "score": 0.901,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Spondyloarthritis",
      "efo_id": "EFO_0003778",
      "score": 0.896,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "BCL2",
      "ensembl_id": "ENSG00000171791",
      "disease": "Acute Myeloid Leukemia (AML)",
      "efo_id": "EFO_0000222",
      "score": 0.894,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "IL23A",
      "ensembl_id": "ENSG00000110944",
      "disease": "Psoriasis",
      "efo_id": "EFO_0000676",
      "score": 0.889,
      "source": "ot_2020"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Psoriatic Arthritis",
      "efo_id": "EFO_0003778",
      "score": 0.888,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "EDNRA",
      "ensembl_id": "ENSG00000151617",
      "disease": "Diabetes",
      "efo_id": "EFO_0000400",
      "score": 0.887,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "DRD2",
      "ensembl_id": "ENSG00000149295",
      "disease": "Major Depressive Disorder",
      "efo_id": "MONDO_0002009",
      "score": 0.886,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "DRD3",
      "ensembl_id": "ENSG00000151577",
      "disease": "Major Depressive Disorder",
      "efo_id": "MONDO_0002009",
      "score": 0.883,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Ulcerative Colitis (UC)",
      "efo_id": "EFO_0000729",
      "score": 0.881,
      "source": "ot_2020"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Crohn's Disease",
      "efo_id": "EFO_0000384",
      "score": 0.878,
      "source": "ot_2020"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Myeloproliferative Neoplasm",
      "efo_id": "EFO_0002428",
      "score": 0.877,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDCD1",
      "ensembl_id": "ENSG00000188389",
      "disease": "Colorectal Cancer",
      "efo_id": "EFO_1001951",
      "score": 0.862,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Ankylosing Spondylitis (AS)",
      "efo_id": "EFO_0003898",
      "score": 0.86,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PARP1",
      "ensembl_id": "ENSG00000143799",
      "disease": "Ovarian Cancer",
      "efo_id": "EFO_0001075",
      "score": 0.858,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TOP2A",
      "ensembl_id": "ENSG00000131747",
      "disease": "Small Cell Lung Cancer",
      "efo_id": "EFO_0000702",
      "score": 0.857,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TOP1",
      "ensembl_id": "ENSG00000198900",
      "disease": "Epithelial Ovarian Cancer",
      "efo_id": "EFO_0001075",
      "score": 0.854,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PIK3CD",
      "ensembl_id": "ENSG00000171608",
      "disease": "Lymphoma",
      "efo_id": "EFO_0000574",
      "score": 0.852,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "VDR",
      "ensembl_id": "ENSG00000111424",
      "disease": "Chronic Kidney Disease (CKD)",
      "efo_id": "EFO_0003884",
      "score": 0.848,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "DRD2",
      "ensembl_id": "ENSG00000149295",
      "disease": "Bipolar I Disorder",
      "efo_id": "EFO_0009963",
      "score": 0.839,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CD38",
      "ensembl_id": "ENSG00000004468",
      "disease": "Multiple Myeloma",
      "efo_id": "EFO_0001378",
      "score": 0.837,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Atopic Dermatitis",
      "efo_id": "EFO_0000274",
      "score": 0.821,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PARP1",
      "ensembl_id": "ENSG00000143799",
      "disease": "Non-small Cell Lung Cancer Stage III",
      "efo_id": "EFO_0003060",
      "score": 0.818,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Atopic Dermatitis",
      "efo_id": "EFO_0000274",
      "score": 0.813,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Atopic Dermatitis",
      "efo_id": "EFO_0000274",
      "score": 0.812,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Ankylosing Spondylitis (AS)",
      "efo_id": "EFO_0003898",
      "score": 0.809,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "BCL2",
      "ensembl_id": "ENSG00000171791",
      "disease": "Multiple Myeloma",
      "efo_id": "EFO_0001378",
      "score": 0.808,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "DRD3",
      "ensembl_id": "ENSG00000151577",
      "disease": "Bipolar I Disorder",
      "efo_id": "EFO_0009963",
      "score": 0.804,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Juvenile Idiopathic Arthritis (JIA)",
      "efo_id": "EFO_0002609",
      "score": 0.797,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Atopic Dermatitis",
      "efo_id": "EFO_0000274",
      "score": 0.797,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TNF",
      "ensembl_id": "ENSG00000232810",
      "disease": "Crohn's Disease",
      "efo_id": "EFO_0000384",
      "score": 0.781,
      "source": "ot_2020"
    },
    {
      "gene": "BCL2L1",
      "ensembl_id": "ENSG00000171552",
      "disease": "Acute Lymphoblastic Leukemia (ALL)",
      "efo_id": "EFO_0000220",
      "score": 0.779,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TNF",
      "ensembl_id": "ENSG00000232810",
      "disease": "Psoriasis",
      "efo_id": "EFO_0000676",
      "score": 0.779,
      "source": "ot_2020"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Takayasu Arteritis (TAK)",
      "efo_id": "EFO_0006803",
      "score": 0.774,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "BCL2L2",
      "ensembl_id": "ENSG00000129473",
      "disease": "Acute Lymphoblastic Leukemia (ALL)",
      "efo_id": "EFO_0000220",
      "score": 0.746,
      "source": "ot_2020"
    },
    {
      "gene": "VKORC1",
      "ensembl_id": "ENSG00000167397",
      "disease": "Psoriasis",
      "efo_id": "EFO_0000676",
      "score": 0.746,
      "source": "ot_2020"
    },
    {
      "gene": "TNF",
      "ensembl_id": "ENSG00000232810",
      "disease": "Axial Spondyloarthritis",
      "efo_id": "EFO_0000706",
      "score": 0.746,
      "source": "ot_2020"
    },
    {
      "gene": "PDCD1",
      "ensembl_id": "ENSG00000188389",
      "disease": "Head and Neck Cancer",
      "efo_id": "EFO_0006859",
      "score": 0.743,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Juvenile Idiopathic Arthritis (JIA)",
      "efo_id": "EFO_0002609",
      "score": 0.736,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "IMPDH2",
      "ensembl_id": "ENSG00000178035",
      "disease": "Chronic Hepatitis C Infection",
      "efo_id": "EFO_0004220",
      "score": 0.733,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Juvenile Idiopathic Arthritis (JIA)",
      "efo_id": "EFO_0002609",
      "score": 0.73,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Juvenile Idiopathic Arthritis (JIA)",
      "efo_id": "EFO_0002609",
      "score": 0.717,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TOP1",
      "ensembl_id": "ENSG00000198900",
      "disease": "Small Cell Lung Cancer",
      "efo_id": "EFO_0000702",
      "score": 0.714,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "IL23A",
      "ensembl_id": "ENSG00000110944",
      "disease": "Psoriatic Arthritis (PsA)",
      "efo_id": "EFO_0000685",
      "score": 0.712,
      "source": "ot_2020"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Takayasu Arteritis (TAK)",
      "efo_id": "EFO_0006803",
      "score": 0.7,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "BCL2L2",
      "ensembl_id": "ENSG00000129473",
      "disease": "Myeloproliferative Neoplasm",
      "efo_id": "EFO_0002428",
      "score": 0.695,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Ankylosing Spondylitis (AS)",
      "efo_id": "EFO_0003898",
      "score": 0.681,
      "source": "ot_2020"
    },
    {
      "gene": "TNF",
      "ensembl_id": "ENSG00000232810",
      "disease": "Ulcerative Colitis",
      "efo_id": "EFO_0000729",
      "score": 0.681,
      "source": "ot_2020"
    },
    {
      "gene": "ESR1",
      "ensembl_id": "ENSG00000091831",
      "disease": "Endometriosis",
      "efo_id": "EFO_0001065",
      "score": 0.681,
      "source": "ot_2020"
    },
    {
      "gene": "PTGS2",
      "ensembl_id": "ENSG00000073756",
      "disease": "Myeloproliferative Neoplasm",
      "efo_id": "EFO_0002428",
      "score": 0.662,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Takayasu Arteritis (TAK)",
      "efo_id": "EFO_0006803",
      "score": 0.661,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "DLL3",
      "ensembl_id": "ENSG00000090932",
      "disease": "Cancer",
      "efo_id": "MONDO_0004992",
      "score": 0.658,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Takayasu Arteritis (TAK)",
      "efo_id": "EFO_0006803",
      "score": 0.658,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Myeloproliferative Neoplasm",
      "efo_id": "EFO_0002428",
      "score": 0.65,
      "source": "ot_2020"
    },
    {
      "gene": "GUCY2C",
      "ensembl_id": "ENSG00000070019",
      "disease": "Functional Constipation",
      "efo_id": "HP_0002019",
      "score": 0.642,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FLT3",
      "ensembl_id": "ENSG00000122025",
      "disease": "Acute Myeloid Leukemia (AML)",
      "efo_id": "EFO_0000222",
      "score": 0.625,
      "source": "ot_2020"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Rheumatoid Arthritis (RA)",
      "efo_id": "EFO_0000685",
      "score": 0.6,
      "source": "ot_2020"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Ankylosing Spondylitis (AS)",
      "efo_id": "EFO_0003898",
      "score": 0.6,
      "source": "ot_2020"
    },
    {
      "gene": "TNF",
      "ensembl_id": "ENSG00000232810",
      "disease": "Hidradenitis Suppurativa",
      "efo_id": "EFO_1000710",
      "score": 0.587,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "NR3C1",
      "ensembl_id": "ENSG00000113580",
      "disease": "Takayasu Arteritis (TAK)",
      "efo_id": "EFO_0006803",
      "score": 0.569,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "DLL3",
      "ensembl_id": "ENSG00000090932",
      "disease": "Glioblastoma",
      "efo_id": "EFO_0000519",
      "score": 0.542,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "BCL2",
      "ensembl_id": "ENSG00000171791",
      "disease": "Myelodysplastic Syndromes (MDS)",
      "efo_id": "EFO_0000198",
      "score": 0.533,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "BCL2",
      "ensembl_id": "ENSG00000171791",
      "disease": "Acute Lymphoblastic Leukemia (ALL)",
      "efo_id": "EFO_0000220",
      "score": 0.525,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "BCL2L1",
      "ensembl_id": "ENSG00000171552",
      "disease": "Myeloproliferative Neoplasm",
      "efo_id": "EFO_0002428",
      "score": 0.5,
      "source": "ot_2020"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Myeloproliferative Neoplasm",
      "efo_id": "EFO_0002428",
      "score": 0.5,
      "source": "ot_2020"
    },
    {
      "gene": "PIK3CG",
      "ensembl_id": "ENSG00000105851",
      "disease": "Lymphoma",
      "efo_id": "EFO_0000574",
      "score": 0.5,
      "source": "ot_2020"
    },
    {
      "gene": "IL23A",
      "ensembl_id": "ENSG00000110944",
      "disease": "Dermatitis",
      "efo_id": "EFO_0000274",
      "score": 0.5,
      "source": "ot_2020"
    },
    {
      "gene": "IL23A",
      "ensembl_id": "ENSG00000110944",
      "disease": "Ulcerative Colitis (UC)",
      "efo_id": "EFO_0000729",
      "score": 0.5,
      "source": "ot_2020"
    },
    {
      "gene": "IL23A",
      "ensembl_id": "ENSG00000110944",
      "disease": "Plaque Psoriasis",
      "efo_id": "EFO_1001494",
      "score": 0.5,
      "source": "ot_2020"
    },
    {
      "gene": "IL23A",
      "ensembl_id": "ENSG00000110944",
      "disease": "Crohn's Disease",
      "efo_id": "EFO_0000384",
      "score": 0.5,
      "source": "ot_2020"
    },
    {
      "gene": "BCL2",
      "ensembl_id": "ENSG00000171791",
      "disease": "Myeloproliferative Neoplasm",
      "efo_id": "EFO_0002428",
      "score": 0.401,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "IL17A",
      "ensembl_id": "ENSG00000112115",
      "disease": "Rheumatoid Arthritis",
      "efo_id": "EFO_0000685",
      "score": 0.042,
      "source": "ot_recent_fallback"
    }
  ],
  "ACAD": [
    {
      "gene": "HTR2A",
      "ensembl_id": "ENSG00000102468",
      "disease": "Agitation and Aggression in Alzheimer's Disease",
      "efo_id": "MONDO_0004975",
      "score": 0.95,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "HTR2A",
      "ensembl_id": "ENSG00000102468",
      "disease": "Parkinson's Disease",
      "efo_id": "MONDO_0005180",
      "score": 0.945,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "HTR2A",
      "ensembl_id": "ENSG00000102468",
      "disease": "Schizophrenia",
      "efo_id": "MONDO_0005090",
      "score": 0.905,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "HTR2A",
      "ensembl_id": "ENSG00000102468",
      "disease": "Adjunctive Treatment of Major Depressive Disorder",
      "efo_id": "MONDO_0002009",
      "score": 0.881,
      "source": "ot_recent_fallback"
    }
  ],
  "ACHN": [
    {
      "gene": "CFD",
      "ensembl_id": "ENSG00000197766",
      "disease": "C3 Glomerulonephritis",
      "efo_id": "MONDO_0013892",
      "score": 0.755,
      "source": "ot_recent_fallback"
    }
  ],
  "AGIO": [
    {
      "gene": "PKLR",
      "ensembl_id": "ENSG00000143627",
      "disease": "Anemia, Hemolytic",
      "efo_id": "MONDO_0002280",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "PKLR",
      "ensembl_id": "ENSG00000143627",
      "disease": "Pyruvate Kinase Deficiency",
      "efo_id": "MONDO_0009950",
      "score": 0.98,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PKLR",
      "ensembl_id": "ENSG00000143627",
      "disease": "Thalassemia",
      "efo_id": "MONDO_0019402",
      "score": 0.939,
      "source": "ot_recent_fallback"
    }
  ],
  "AKBA": [
    {
      "gene": "EPOR",
      "ensembl_id": "ENSG00000187266",
      "disease": "Anemia",
      "efo_id": "MONDO_0002280",
      "score": 0.902,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "EGLN1",
      "ensembl_id": "ENSG00000135766",
      "disease": "Anemia",
      "efo_id": "MONDO_0002280",
      "score": 0.892,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "EGLN2",
      "ensembl_id": "ENSG00000269858",
      "disease": "Anemia",
      "efo_id": "MONDO_0002280",
      "score": 0.59,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "EGLN3",
      "ensembl_id": "ENSG00000129521",
      "disease": "Anemia",
      "efo_id": "MONDO_0002280",
      "score": 0.476,
      "source": "ot_recent_fallback"
    }
  ],
  "AKCA": [
    {
      "gene": "APOC3",
      "ensembl_id": "ENSG00000110245",
      "disease": "Cardiovascular Disease",
      "efo_id": "EFO_0000319",
      "score": 0.835,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "VKORC1",
      "ensembl_id": "ENSG00000167397",
      "disease": "Cardiovascular Diseases",
      "efo_id": "EFO_0000319",
      "score": 0.83,
      "source": "ot_recent_fallback"
    }
  ],
  "ALKS": [
    {
      "gene": "DRD2",
      "ensembl_id": "ENSG00000149295",
      "disease": "Schizophrenia",
      "efo_id": "MONDO_0005090",
      "score": 0.915,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "HTR2A",
      "ensembl_id": "ENSG00000102468",
      "disease": "Schizophrenia",
      "efo_id": "MONDO_0005090",
      "score": 0.905,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "DRD2",
      "ensembl_id": "ENSG00000149295",
      "disease": "Bipolar I Disorder",
      "efo_id": "EFO_0009963",
      "score": 0.839,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "HTR2A",
      "ensembl_id": "ENSG00000102468",
      "disease": "Bipolar I Disorder",
      "efo_id": "EFO_0009963",
      "score": 0.823,
      "source": "ot_recent_fallback"
    }
  ],
  "ALNY": [
    {
      "gene": "TTR",
      "ensembl_id": "ENSG00000118271",
      "disease": "Transthyretin-mediated Amyloidosis (ATTR Amyloidosis)",
      "efo_id": "MONDO_0018634",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "HAO1",
      "ensembl_id": "ENSG00000101323",
      "disease": "Primary Hyperoxaluria Type 1 (PH1)",
      "efo_id": "MONDO_0009823",
      "score": 0.949,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "HAO1",
      "ensembl_id": "ENSG00000101323",
      "disease": "AGT",
      "efo_id": "MONDO_0002474",
      "score": 0.926,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ALAS1",
      "ensembl_id": "ENSG00000023330",
      "disease": "Acute Intermittent Porphyria",
      "efo_id": "MONDO_0008294",
      "score": 0.566,
      "source": "ot_recent_fallback"
    }
  ],
  "ALXN": [
    {
      "gene": "C5",
      "ensembl_id": "ENSG00000106804",
      "disease": "Atypical Hemolytic Uremic Syndrome (aHUS)",
      "efo_id": "MONDO_0016244",
      "score": 0.899,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "C5",
      "ensembl_id": "ENSG00000106804",
      "disease": "Generalized Myasthenia Gravis",
      "efo_id": "EFO_0004991",
      "score": 0.797,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CFD",
      "ensembl_id": "ENSG00000197766",
      "disease": "C3 Glomerulonephritis",
      "efo_id": "MONDO_0013892",
      "score": 0.755,
      "source": "ot_recent_fallback"
    }
  ],
  "AMGN": [
    {
      "gene": "TNF",
      "ensembl_id": "ENSG00000232810",
      "disease": "Psoriatic Arthritis",
      "efo_id": "EFO_0003778",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "PCSK9",
      "ensembl_id": "ENSG00000169174",
      "disease": "Coronary Heart Disease (CHD)",
      "efo_id": "EFO_0001645",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "PCSK9",
      "ensembl_id": "ENSG00000169174",
      "disease": "Heterozygous Familial Hypercholesterolemia",
      "efo_id": "EFO_0004911",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "NPC1L1",
      "ensembl_id": "ENSG00000015520",
      "disease": "Hypercholesterolemia",
      "efo_id": "EFO_0004911",
      "score": 0.969,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TOP2A",
      "ensembl_id": "ENSG00000131747",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.968,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYMS",
      "ensembl_id": "ENSG00000176890",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.964,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "MPL",
      "ensembl_id": "ENSG00000117400",
      "disease": "Chemotherapy-induced Thrombocytopenia",
      "efo_id": "HP_0001873",
      "score": 0.941,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TNFSF11",
      "ensembl_id": "ENSG00000120659",
      "disease": "Osteogenesis Imperfecta (OI)",
      "efo_id": "MONDO_0019019",
      "score": 0.94,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PTGS2",
      "ensembl_id": "ENSG00000073756",
      "disease": "Gout",
      "efo_id": "EFO_0004274",
      "score": 0.94,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "SRD5A1",
      "ensembl_id": "ENSG00000145545",
      "disease": "Prostate Cancer",
      "efo_id": "EFO_0001663",
      "score": 0.935,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CASR",
      "ensembl_id": "ENSG00000036828",
      "disease": "Chronic Kidney Disease",
      "efo_id": "EFO_0003884",
      "score": 0.935,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ATP4A",
      "ensembl_id": "ENSG00000105675",
      "disease": "Tumors",
      "efo_id": "MONDO_0004992",
      "score": 0.93,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CSF3R",
      "ensembl_id": "ENSG00000119535",
      "disease": "Cytopenias",
      "efo_id": "MONDO_0002280",
      "score": 0.912,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "EGFR",
      "ensembl_id": "ENSG00000146648",
      "disease": "Colorectal Cancer",
      "efo_id": "EFO_1001951",
      "score": 0.912,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "EPOR",
      "ensembl_id": "ENSG00000187266",
      "disease": "Anemia",
      "efo_id": "MONDO_0002280",
      "score": 0.902,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "SOST",
      "ensembl_id": "ENSG00000167941",
      "disease": "Postmenopausal Osteoporosis",
      "efo_id": "EFO_0003854",
      "score": 0.889,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CSF3R",
      "ensembl_id": "ENSG00000119535",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.882,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PTGS1",
      "ensembl_id": "ENSG00000095303",
      "disease": "Gout",
      "efo_id": "EFO_0004274",
      "score": 0.879,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDE4B",
      "ensembl_id": "ENSG00000184588",
      "disease": "Plaque Psoriasis",
      "efo_id": "EFO_1001494",
      "score": 0.868,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CALCRL",
      "ensembl_id": "ENSG00000064989",
      "disease": "Migraine Headache",
      "efo_id": "MONDO_0005277",
      "score": 0.859,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CD38",
      "ensembl_id": "ENSG00000004468",
      "disease": "Refractory Multiple Myeloma",
      "efo_id": "EFO_0001378",
      "score": 0.837,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CD3E",
      "ensembl_id": "ENSG00000198851",
      "disease": "Non-Hodgkin's Lymphoma",
      "efo_id": "EFO_0005952",
      "score": 0.826,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CD19",
      "ensembl_id": "ENSG00000177455",
      "disease": "Leukemia, Acute Lymphoblastic",
      "efo_id": "EFO_0000220",
      "score": 0.822,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "EPOR",
      "ensembl_id": "ENSG00000187266",
      "disease": "Kidney Disease",
      "efo_id": "EFO_0003086",
      "score": 0.822,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDE4B",
      "ensembl_id": "ENSG00000184588",
      "disease": "Psoriatic Arthritis",
      "efo_id": "EFO_0003778",
      "score": 0.818,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDE4B",
      "ensembl_id": "ENSG00000184588",
      "disease": "Palmoplantaris Pustulosis",
      "efo_id": "EFO_0000676",
      "score": 0.792,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TNF",
      "ensembl_id": "ENSG00000232810",
      "disease": "Psoriasis",
      "efo_id": "EFO_0000676",
      "score": 0.779,
      "source": "ot_2020"
    },
    {
      "gene": "CD19",
      "ensembl_id": "ENSG00000177455",
      "disease": "Non-Hodgkin's Lymphoma",
      "efo_id": "EFO_0005952",
      "score": 0.77,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CD3E",
      "ensembl_id": "ENSG00000198851",
      "disease": "Acute Lymphoblastic Leukemia",
      "efo_id": "EFO_0000220",
      "score": 0.757,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "AR",
      "ensembl_id": "ENSG00000169083",
      "disease": "Prostate Cancer",
      "efo_id": "EFO_0001663",
      "score": 0.747,
      "source": "ot_2020"
    },
    {
      "gene": "CSF3R",
      "ensembl_id": "ENSG00000119535",
      "disease": "Non-Hodgkin's Lymphoma",
      "efo_id": "EFO_0005952",
      "score": 0.723,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CALCRL",
      "ensembl_id": "ENSG00000064989",
      "disease": "Stable Angina",
      "efo_id": "EFO_0003888",
      "score": 0.714,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "KRAS",
      "ensembl_id": "ENSG00000133703",
      "disease": "Advanced Solid Tumors",
      "efo_id": "EFO_0000335",
      "score": 0.684,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "EPOR",
      "ensembl_id": "ENSG00000187266",
      "disease": "End Stage Renal Disease",
      "efo_id": "EFO_0003884",
      "score": 0.654,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDE4B",
      "ensembl_id": "ENSG00000184588",
      "disease": "Ulcerative Colitis",
      "efo_id": "EFO_0000729",
      "score": 0.65,
      "source": "ot_2020"
    },
    {
      "gene": "CYP17A1",
      "ensembl_id": "ENSG00000148795",
      "disease": "Prostate Cancer",
      "efo_id": "EFO_0001663",
      "score": 0.625,
      "source": "ot_2020"
    },
    {
      "gene": "TSLP",
      "ensembl_id": "ENSG00000145777",
      "disease": "Atopic Dermatitis",
      "efo_id": "EFO_0000274",
      "score": 0.625,
      "source": "ot_2020"
    },
    {
      "gene": "HMGCR",
      "ensembl_id": "ENSG00000113161",
      "disease": "Diabetes, Hyperlipidemia, Mixed Dyslipidemia",
      "efo_id": "EFO_0000662",
      "score": 0.593,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "EGFR",
      "ensembl_id": "ENSG00000146648",
      "disease": "Advanced Solid Tumors",
      "efo_id": "EFO_0000335",
      "score": 0.547,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ERBB2",
      "ensembl_id": "ENSG00000141736",
      "disease": "Advanced Solid Tumors",
      "efo_id": "EFO_0000335",
      "score": 0.547,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CDK4",
      "ensembl_id": "ENSG00000135446",
      "disease": "Advanced Solid Tumors",
      "efo_id": "EFO_0000335",
      "score": 0.547,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "MAP2K1",
      "ensembl_id": "ENSG00000169032",
      "disease": "Advanced Solid Tumors",
      "efo_id": "EFO_0000335",
      "score": 0.547,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TNFSF11",
      "ensembl_id": "ENSG00000120659",
      "disease": "Osteogenesis Imperfecta",
      "efo_id": "MONDO_0009066",
      "score": 0.547,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "IL17RA",
      "ensembl_id": "ENSG00000177663",
      "disease": "Axial Spondyloarthritis",
      "efo_id": "EFO_0000706",
      "score": 0.532,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CD3E",
      "ensembl_id": "ENSG00000198851",
      "disease": "High-risk Diffuse Large B-Cell Lymphoma",
      "efo_id": "EFO_0000403",
      "score": 0.523,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CD19",
      "ensembl_id": "ENSG00000177455",
      "disease": "Relapsed or Refractory Diffuse Large B Cell Lymphoma (DLBCL)",
      "efo_id": "EFO_0000403",
      "score": 0.521,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TUBB1",
      "ensembl_id": "ENSG00000101162",
      "disease": "Acute Lymphoblastic Leukemia (ALL)",
      "efo_id": "EFO_0000220",
      "score": 0.517,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TOP2A",
      "ensembl_id": "ENSG00000131747",
      "disease": "Acute Lymphoblastic Leukemia (ALL)",
      "efo_id": "EFO_0000220",
      "score": 0.5,
      "source": "ot_2020"
    },
    {
      "gene": "TNF",
      "ensembl_id": "ENSG00000232810",
      "disease": "Metastatic Castration-resistant Prostate Cancer",
      "efo_id": "EFO_0001663",
      "score": 0.5,
      "source": "ot_2020"
    },
    {
      "gene": "EPOR",
      "ensembl_id": "ENSG00000187266",
      "disease": "Breast Neoplasms",
      "efo_id": "EFO_0000305",
      "score": 0.5,
      "source": "ot_2020"
    },
    {
      "gene": "TNF",
      "ensembl_id": "ENSG00000232810",
      "disease": "Plaque Psoriasis",
      "efo_id": "EFO_1001494",
      "score": 0.5,
      "source": "ot_2020"
    },
    {
      "gene": "PCSK9",
      "ensembl_id": "ENSG00000169174",
      "disease": "Diabetes, Hyperlipidemia, Mixed Dyslipidemia",
      "efo_id": "EFO_0000662",
      "score": 0.195,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TNFSF11",
      "ensembl_id": "ENSG00000120659",
      "disease": "Giant Cell Tumor of Bone",
      "efo_id": "EFO_0001068",
      "score": 0.116,
      "source": "ot_recent_fallback"
    }
  ],
  "ANAB": [
    {
      "gene": "IL33",
      "ensembl_id": "ENSG00000137033",
      "disease": "Eosinophilic Asthma",
      "efo_id": "EFO_0000270",
      "score": 0.962,
      "source": "ot_2020"
    },
    {
      "gene": "IL33",
      "ensembl_id": "ENSG00000137033",
      "disease": "Atopic Dermatitis",
      "efo_id": "EFO_0000274",
      "score": 0.931,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "IL33",
      "ensembl_id": "ENSG00000137033",
      "disease": "Chronic Rhinosinusitis",
      "efo_id": "MONDO_0004979",
      "score": 0.931,
      "source": "ot_recent_fallback"
    }
  ],
  "APLS": [
    {
      "gene": "C3",
      "ensembl_id": "ENSG00000125730",
      "disease": "Cold Agglutinin Disease",
      "efo_id": "MONDO_0002280",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "C3",
      "ensembl_id": "ENSG00000125730",
      "disease": "Neovascular Age-Related Macular Degeneration",
      "efo_id": "EFO_0004683",
      "score": 0.953,
      "source": "ot_2020"
    },
    {
      "gene": "C3",
      "ensembl_id": "ENSG00000125730",
      "disease": "Geographic Atrophy",
      "efo_id": "EFO_1001492",
      "score": 0.953,
      "source": "ot_2020"
    },
    {
      "gene": "C3",
      "ensembl_id": "ENSG00000125730",
      "disease": "C3 Glomerulonephritis",
      "efo_id": "MONDO_0013892",
      "score": 0.755,
      "source": "ot_recent_fallback"
    }
  ],
  "ARNA": [
    {
      "gene": "S1PR1",
      "ensembl_id": "ENSG00000170989",
      "disease": "Ulcerative Colitis",
      "efo_id": "EFO_0000729",
      "score": 0.956,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "S1PR4",
      "ensembl_id": "ENSG00000125910",
      "disease": "Ulcerative Colitis",
      "efo_id": "EFO_0000729",
      "score": 0.954,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "S1PR5",
      "ensembl_id": "ENSG00000180739",
      "disease": "Atopic Dermatitis",
      "efo_id": "EFO_0000274",
      "score": 0.906,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "S1PR1",
      "ensembl_id": "ENSG00000170989",
      "disease": "Atopic Dermatitis",
      "efo_id": "EFO_0000274",
      "score": 0.803,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "S1PR4",
      "ensembl_id": "ENSG00000125910",
      "disease": "Atopic Dermatitis",
      "efo_id": "EFO_0000274",
      "score": 0.735,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "S1PR5",
      "ensembl_id": "ENSG00000180739",
      "disease": "Ulcerative Colitis",
      "efo_id": "EFO_0000729",
      "score": 0.681,
      "source": "ot_2020"
    }
  ],
  "ARQL": [
    {
      "gene": "ESR1",
      "ensembl_id": "ENSG00000091831",
      "disease": "Cancer",
      "efo_id": "MONDO_0004992",
      "score": 0.931,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "MET",
      "ensembl_id": "ENSG00000105976",
      "disease": "Gastric Cancer",
      "efo_id": "EFO_0000178",
      "score": 0.841,
      "source": "ot_recent_fallback"
    }
  ],
  "ARWR": [
    {
      "gene": "PTGS1",
      "ensembl_id": "ENSG00000095303",
      "disease": "Hepatitis B",
      "efo_id": "EFO_0004197",
      "score": 0.535,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PTGS2",
      "ensembl_id": "ENSG00000073756",
      "disease": "Hepatitis B",
      "efo_id": "EFO_0004197",
      "score": 0.528,
      "source": "ot_recent_fallback"
    }
  ],
  "BBIO": [
    {
      "gene": "TTR",
      "ensembl_id": "ENSG00000118271",
      "disease": "Amyloid Cardiomyopathy, Transthyretin-Related",
      "efo_id": "MONDO_0018634",
      "score": 1.0,
      "source": "ot_2020"
    }
  ],
  "BCRX": [
    {
      "gene": "KLKB1",
      "ensembl_id": "ENSG00000164344",
      "disease": "Hereditary Angioedema",
      "efo_id": "MONDO_0019623",
      "score": 0.876,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "HMGCR",
      "ensembl_id": "ENSG00000113161",
      "disease": "Hereditary Angioedema",
      "efo_id": "MONDO_0019623",
      "score": 0.862,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ATP1A1",
      "ensembl_id": "ENSG00000163399",
      "disease": "Hereditary Angioedema",
      "efo_id": "MONDO_0019623",
      "score": 0.703,
      "source": "ot_recent_fallback"
    }
  ],
  "BIIB": [
    {
      "gene": "SMN2",
      "ensembl_id": "ENSG00000205571",
      "disease": "Spinal Muscular Atrophy",
      "efo_id": "EFO_0008525",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "GRIA1",
      "ensembl_id": "ENSG00000155511",
      "disease": "Cognitive Impairment Associated With Schizophrenia (CIAS)",
      "efo_id": "EFO_0000692",
      "score": 0.944,
      "source": "ot_2020"
    },
    {
      "gene": "GABRA1",
      "ensembl_id": "ENSG00000022355",
      "disease": "Parkinson Disease",
      "efo_id": "MONDO_0005180",
      "score": 0.916,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "KEAP1",
      "ensembl_id": "ENSG00000079999",
      "disease": "Multiple Sclerosis",
      "efo_id": "MONDO_0005301",
      "score": 0.911,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "GABRA1",
      "ensembl_id": "ENSG00000022355",
      "disease": "Major Depressive Disorder",
      "efo_id": "MONDO_0002009",
      "score": 0.886,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "GRIA1",
      "ensembl_id": "ENSG00000155511",
      "disease": "Schizophrenia",
      "efo_id": "MONDO_0005090",
      "score": 0.87,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ITGA4",
      "ensembl_id": "ENSG00000115232",
      "disease": "Acute Ischemic Stroke",
      "efo_id": "EFO_0000712",
      "score": 0.861,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "GABRA1",
      "ensembl_id": "ENSG00000022355",
      "disease": "Insomnia",
      "efo_id": "EFO_0004698",
      "score": 0.789,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PPARG",
      "ensembl_id": "ENSG00000132170",
      "disease": "Pulmonary Hypertension",
      "efo_id": "MONDO_0005149",
      "score": 0.559,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "GABRA1",
      "ensembl_id": "ENSG00000022355",
      "disease": "Essential Tremor",
      "efo_id": "EFO_0001068",
      "score": 0.54,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "SCN9A",
      "ensembl_id": "ENSG00000169432",
      "disease": "Diabetes Mellitus",
      "efo_id": "EFO_0000400",
      "score": 0.5,
      "source": "ot_2020"
    }
  ],
  "BMRN": [
    {
      "gene": "PAH",
      "ensembl_id": "ENSG00000171759",
      "disease": "Phenylketonuria (PKU)",
      "efo_id": "MONDO_0009861",
      "score": 0.992,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "F9",
      "ensembl_id": "ENSG00000101981",
      "disease": "Hemophilia A",
      "efo_id": "MONDO_0010602",
      "score": 0.99,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "DMD",
      "ensembl_id": "ENSG00000198947",
      "disease": "Duchenne Muscular Dystrophy",
      "efo_id": "MONDO_0010679",
      "score": 0.926,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FGFR3",
      "ensembl_id": "ENSG00000068078",
      "disease": "Achondroplasia",
      "efo_id": "MONDO_0007037",
      "score": 0.895,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "NPR2",
      "ensembl_id": "ENSG00000159899",
      "disease": "Achondroplasia",
      "efo_id": "MONDO_0007037",
      "score": 0.894,
      "source": "ot_recent_fallback"
    }
  ],
  "BPMC": [
    {
      "gene": "KIT",
      "ensembl_id": "ENSG00000157404",
      "disease": "GIST",
      "efo_id": "MONDO_0011719",
      "score": 0.934,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDGFRA",
      "ensembl_id": "ENSG00000134853",
      "disease": "GIST",
      "efo_id": "MONDO_0011719",
      "score": 0.934,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "BRAF",
      "ensembl_id": "ENSG00000157764",
      "disease": "GIST",
      "efo_id": "MONDO_0011719",
      "score": 0.934,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "RET",
      "ensembl_id": "ENSG00000165731",
      "disease": "GIST",
      "efo_id": "MONDO_0011719",
      "score": 0.934,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FGFR1",
      "ensembl_id": "ENSG00000077782",
      "disease": "GIST",
      "efo_id": "MONDO_0011719",
      "score": 0.93,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "KDR",
      "ensembl_id": "ENSG00000128052",
      "disease": "GIST",
      "efo_id": "MONDO_0011719",
      "score": 0.929,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ABL1",
      "ensembl_id": "ENSG00000097007",
      "disease": "GIST",
      "efo_id": "MONDO_0011719",
      "score": 0.927,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "RAF1",
      "ensembl_id": "ENSG00000132155",
      "disease": "GIST",
      "efo_id": "MONDO_0011719",
      "score": 0.927,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FGFR2",
      "ensembl_id": "ENSG00000066468",
      "disease": "GIST",
      "efo_id": "MONDO_0011719",
      "score": 0.927,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "MAPK11",
      "ensembl_id": "ENSG00000185386",
      "disease": "GIST",
      "efo_id": "MONDO_0011719",
      "score": 0.923,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "DDR2",
      "ensembl_id": "ENSG00000162733",
      "disease": "GIST",
      "efo_id": "MONDO_0011719",
      "score": 0.923,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TEK",
      "ensembl_id": "ENSG00000120156",
      "disease": "GIST",
      "efo_id": "MONDO_0011719",
      "score": 0.923,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "EPHA2",
      "ensembl_id": "ENSG00000142627",
      "disease": "GIST",
      "efo_id": "MONDO_0011719",
      "score": 0.923,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "NTRK1",
      "ensembl_id": "ENSG00000198400",
      "disease": "GIST",
      "efo_id": "MONDO_0011719",
      "score": 0.923,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FRK",
      "ensembl_id": "ENSG00000111816",
      "disease": "GIST",
      "efo_id": "MONDO_0011719",
      "score": 0.909,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDGFRA",
      "ensembl_id": "ENSG00000134853",
      "disease": "Aggressive Systemic Mastocytosis",
      "efo_id": "MONDO_0009263",
      "score": 0.775,
      "source": "ot_recent_fallback"
    }
  ],
  "CHRS": [
    {
      "gene": "TNF",
      "ensembl_id": "ENSG00000232810",
      "disease": "Plaque Psoriasis",
      "efo_id": "EFO_1001494",
      "score": 0.5,
      "source": "ot_2020"
    }
  ],
  "CLVS": [
    {
      "gene": "EGFR",
      "ensembl_id": "ENSG00000146648",
      "disease": "Non-small Cell Lung Cancer",
      "efo_id": "EFO_0003060",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "MAP2K1",
      "ensembl_id": "ENSG00000169032",
      "disease": "Non-small Cell Lung Cancer",
      "efo_id": "EFO_0003060",
      "score": 0.826,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "MAP2K2",
      "ensembl_id": "ENSG00000126934",
      "disease": "Non-small Cell Lung Cancer",
      "efo_id": "EFO_0003060",
      "score": 0.777,
      "source": "ot_recent_fallback"
    }
  ],
  "CPRX": [
    {
      "gene": "PDE4B",
      "ensembl_id": "ENSG00000184588",
      "disease": "Muscular Atrophy, Spinal",
      "efo_id": "EFO_0008525",
      "score": 0.455,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDE4B",
      "ensembl_id": "ENSG00000184588",
      "disease": "Myasthenia Gravis, Generalized",
      "efo_id": "EFO_0004991",
      "score": 0.441,
      "source": "ot_recent_fallback"
    }
  ],
  "CYTK": [
    {
      "gene": "MYH7",
      "ensembl_id": "ENSG00000092054",
      "disease": "Heart Failure",
      "efo_id": "EFO_0003144",
      "score": 0.943,
      "source": "ot_recent_fallback"
    }
  ],
  "DCPH": [
    {
      "gene": "ABL1",
      "ensembl_id": "ENSG00000097007",
      "disease": "Breast Adenocarcinoma",
      "efo_id": "EFO_0000305",
      "score": 0.966,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "KIT",
      "ensembl_id": "ENSG00000157404",
      "disease": "Gastrointestinal Stromal Tumors",
      "efo_id": "MONDO_0011719",
      "score": 0.934,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDGFRA",
      "ensembl_id": "ENSG00000134853",
      "disease": "Gastrointestinal Stromal Tumors",
      "efo_id": "MONDO_0011719",
      "score": 0.934,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "RET",
      "ensembl_id": "ENSG00000165731",
      "disease": "Gastrointestinal Stromal Tumors",
      "efo_id": "MONDO_0011719",
      "score": 0.934,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "KIT",
      "ensembl_id": "ENSG00000157404",
      "disease": "Advanced Cancers",
      "efo_id": "MONDO_0004992",
      "score": 0.93,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDGFRA",
      "ensembl_id": "ENSG00000134853",
      "disease": "Advanced Cancers",
      "efo_id": "MONDO_0004992",
      "score": 0.93,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "KDR",
      "ensembl_id": "ENSG00000128052",
      "disease": "Gastrointestinal Stromal Tumors",
      "efo_id": "MONDO_0011719",
      "score": 0.929,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FLT1",
      "ensembl_id": "ENSG00000102755",
      "disease": "Gastrointestinal Stromal Tumors",
      "efo_id": "MONDO_0011719",
      "score": 0.929,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDGFRB",
      "ensembl_id": "ENSG00000113721",
      "disease": "Gastrointestinal Stromal Tumors",
      "efo_id": "MONDO_0011719",
      "score": 0.929,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FLT3",
      "ensembl_id": "ENSG00000122025",
      "disease": "Gastrointestinal Stromal Tumors",
      "efo_id": "MONDO_0011719",
      "score": 0.929,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FLT4",
      "ensembl_id": "ENSG00000037280",
      "disease": "Gastrointestinal Stromal Tumors",
      "efo_id": "MONDO_0011719",
      "score": 0.923,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CSF1R",
      "ensembl_id": "ENSG00000182578",
      "disease": "Gastrointestinal Stromal Tumors",
      "efo_id": "MONDO_0011719",
      "score": 0.909,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TEK",
      "ensembl_id": "ENSG00000120156",
      "disease": "Breast Adenocarcinoma",
      "efo_id": "EFO_0000305",
      "score": 0.905,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ABL1",
      "ensembl_id": "ENSG00000097007",
      "disease": "Locally Advanced or Metastatic Solid Tumor",
      "efo_id": "EFO_0000335",
      "score": 0.547,
      "source": "ot_recent_fallback"
    }
  ],
  "ENTA": [
    {
      "gene": "NR1H4",
      "ensembl_id": "ENSG00000012504",
      "disease": "Primary Biliary Cholangitis",
      "efo_id": "EFO_1001486",
      "score": 0.772,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "NR1H4",
      "ensembl_id": "ENSG00000012504",
      "disease": "NASH - Nonalcoholic Steatohepatitis",
      "efo_id": "EFO_1001249",
      "score": 0.749,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "HMGCR",
      "ensembl_id": "ENSG00000113161",
      "disease": "NASH",
      "efo_id": "EFO_1001249",
      "score": 0.749,
      "source": "ot_recent_fallback"
    }
  ],
  "EPZM": [
    {
      "gene": "EZH2",
      "ensembl_id": "ENSG00000106462",
      "disease": "Metastatic Castration-resistant Prostate Cancer",
      "efo_id": "EFO_0001663",
      "score": 0.935,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "EZH2",
      "ensembl_id": "ENSG00000106462",
      "disease": "Follicular Lymphoma",
      "efo_id": "MONDO_0018906",
      "score": 0.748,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "AR",
      "ensembl_id": "ENSG00000169083",
      "disease": "Metastatic Castration-resistant Prostate Cancer",
      "efo_id": "EFO_0001663",
      "score": 0.747,
      "source": "ot_2020"
    },
    {
      "gene": "EZH2",
      "ensembl_id": "ENSG00000106462",
      "disease": "INI1-negative Tumors",
      "efo_id": "EFO_0000616",
      "score": 0.5,
      "source": "ot_2020"
    },
    {
      "gene": "EZH2",
      "ensembl_id": "ENSG00000106462",
      "disease": "BAP1 Loss of Function",
      "efo_id": "EFO_0000588",
      "score": 0.154,
      "source": "ot_recent_fallback"
    }
  ],
  "ESPR": [
    {
      "gene": "PCSK9",
      "ensembl_id": "ENSG00000169174",
      "disease": "Hypercholesterolemia",
      "efo_id": "EFO_0004911",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "HMGCR",
      "ensembl_id": "ENSG00000113161",
      "disease": "Hypercholesterolemia",
      "efo_id": "EFO_0004911",
      "score": 0.969,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "NPC1L1",
      "ensembl_id": "ENSG00000015520",
      "disease": "Hypercholesterolemia",
      "efo_id": "EFO_0004911",
      "score": 0.969,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ACLY",
      "ensembl_id": "ENSG00000131473",
      "disease": "Hypercholesterolemia",
      "efo_id": "EFO_0004911",
      "score": 0.965,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "NPC1L1",
      "ensembl_id": "ENSG00000015520",
      "disease": "Hyperlipidemias",
      "efo_id": "MONDO_0021187",
      "score": 0.884,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "HMGCR",
      "ensembl_id": "ENSG00000113161",
      "disease": "Hyperlipidemia",
      "efo_id": "MONDO_0021187",
      "score": 0.874,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ACLY",
      "ensembl_id": "ENSG00000131473",
      "disease": "Hyperlipidemia",
      "efo_id": "MONDO_0021187",
      "score": 0.857,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "NPC1L1",
      "ensembl_id": "ENSG00000015520",
      "disease": "Atherosclerosis",
      "efo_id": "EFO_0003914",
      "score": 0.775,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ACLY",
      "ensembl_id": "ENSG00000131473",
      "disease": "Atherosclerosis",
      "efo_id": "EFO_0003914",
      "score": 0.729,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ACLY",
      "ensembl_id": "ENSG00000131473",
      "disease": "Atherosclerotic Cardiovascular Diseases",
      "efo_id": "EFO_0001645",
      "score": 0.625,
      "source": "ot_2020"
    }
  ],
  "EXEL": [
    {
      "gene": "MET",
      "ensembl_id": "ENSG00000105976",
      "disease": "Renal Cell Carcinoma",
      "efo_id": "EFO_0000681",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "MET",
      "ensembl_id": "ENSG00000105976",
      "disease": "Castration-resistant Prostate Cancer",
      "efo_id": "EFO_0001663",
      "score": 0.935,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "KDR",
      "ensembl_id": "ENSG00000128052",
      "disease": "Castration-resistant Prostate Cancer",
      "efo_id": "EFO_0001663",
      "score": 0.933,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "KDR",
      "ensembl_id": "ENSG00000128052",
      "disease": "Hepatocellular Carcinoma",
      "efo_id": "EFO_0000182",
      "score": 0.933,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "MET",
      "ensembl_id": "ENSG00000105976",
      "disease": "Hepatocellular Carcinoma",
      "efo_id": "EFO_0000182",
      "score": 0.933,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "KIT",
      "ensembl_id": "ENSG00000157404",
      "disease": "Hepatocellular Carcinoma",
      "efo_id": "EFO_0000182",
      "score": 0.933,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "RAF1",
      "ensembl_id": "ENSG00000132155",
      "disease": "Hepatocellular Carcinoma",
      "efo_id": "EFO_0000182",
      "score": 0.932,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "RET",
      "ensembl_id": "ENSG00000165731",
      "disease": "Hepatocellular Carcinoma",
      "efo_id": "EFO_0000182",
      "score": 0.932,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "BRAF",
      "ensembl_id": "ENSG00000157764",
      "disease": "Hepatocellular Carcinoma",
      "efo_id": "EFO_0000182",
      "score": 0.931,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDGFRB",
      "ensembl_id": "ENSG00000113721",
      "disease": "Hepatocellular Carcinoma",
      "efo_id": "EFO_0000182",
      "score": 0.93,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FLT3",
      "ensembl_id": "ENSG00000122025",
      "disease": "Hepatocellular Carcinoma",
      "efo_id": "EFO_0000182",
      "score": 0.928,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "KDR",
      "ensembl_id": "ENSG00000128052",
      "disease": "Renal Cell Carcinoma",
      "efo_id": "EFO_0000681",
      "score": 0.846,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "KDR",
      "ensembl_id": "ENSG00000128052",
      "disease": "Differentiated Thyroid Cancer",
      "efo_id": "EFO_0002892",
      "score": 0.722,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "MET",
      "ensembl_id": "ENSG00000105976",
      "disease": "Differentiated Thyroid Cancer",
      "efo_id": "EFO_0002892",
      "score": 0.702,
      "source": "ot_recent_fallback"
    }
  ],
  "GBT": [
    {
      "gene": "HBB",
      "ensembl_id": "ENSG00000244734",
      "disease": "Hypoxemia",
      "efo_id": "EFO_0000768",
      "score": 0.886,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "HBB",
      "ensembl_id": "ENSG00000244734",
      "disease": "Sickle Cell Disease",
      "efo_id": "MONDO_0011382",
      "score": 0.608,
      "source": "ot_recent_fallback"
    }
  ],
  "GILD": [
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Rheumatoid Arthritis",
      "efo_id": "EFO_0000685",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Small Bowel Crohn's Disease",
      "efo_id": "EFO_0000384",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "TNF",
      "ensembl_id": "ENSG00000232810",
      "disease": "Rheumatoid Arthritis",
      "efo_id": "EFO_0000685",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "TNF",
      "ensembl_id": "ENSG00000232810",
      "disease": "Psoriatic Arthritis",
      "efo_id": "EFO_0003778",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "ESR1",
      "ensembl_id": "ENSG00000091831",
      "disease": "Advanced Estrogen Receptor Positive HER2- Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.992,
      "source": "ot_2020"
    },
    {
      "gene": "MMP9",
      "ensembl_id": "ENSG00000100985",
      "disease": "Cystic Fibrosis",
      "efo_id": "MONDO_0009061",
      "score": 0.988,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Ulcerative Colitis",
      "efo_id": "EFO_0000729",
      "score": 0.964,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Ulcerative Colitis",
      "efo_id": "EFO_0000729",
      "score": 0.963,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "SYK",
      "ensembl_id": "ENSG00000165025",
      "disease": "Acute Myeloid Leukemia",
      "efo_id": "EFO_0000222",
      "score": 0.95,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Small Bowel Crohn's Disease",
      "efo_id": "EFO_0000384",
      "score": 0.942,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Small Bowel Crohn's Disease",
      "efo_id": "EFO_0000384",
      "score": 0.942,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Ulcerative Colitis",
      "efo_id": "EFO_0000729",
      "score": 0.942,
      "source": "ot_2020"
    },
    {
      "gene": "EDNRA",
      "ensembl_id": "ENSG00000151617",
      "disease": "Herpes Simplex",
      "efo_id": "EFO_0000538",
      "score": 0.936,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Rheumatoid Arthritis",
      "efo_id": "EFO_0000685",
      "score": 0.936,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Rheumatoid Arthritis",
      "efo_id": "EFO_0000685",
      "score": 0.935,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PIK3CD",
      "ensembl_id": "ENSG00000171608",
      "disease": "Chronic Lymphocytic Leukemia",
      "efo_id": "EFO_0000095",
      "score": 0.933,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "BTK",
      "ensembl_id": "ENSG00000010671",
      "disease": "Rheumatoid Arthritis",
      "efo_id": "EFO_0000685",
      "score": 0.933,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ESR1",
      "ensembl_id": "ENSG00000091831",
      "disease": "Solid Tumors and Lymphomas",
      "efo_id": "MONDO_0004992",
      "score": 0.931,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Psoriatic Arthritis",
      "efo_id": "EFO_0003778",
      "score": 0.924,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "BTK",
      "ensembl_id": "ENSG00000010671",
      "disease": "Chronic Lymphocytic Leukemia",
      "efo_id": "EFO_0000095",
      "score": 0.921,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "SYK",
      "ensembl_id": "ENSG00000165025",
      "disease": "Chronic Lymphocytic Leukemia",
      "efo_id": "EFO_0000095",
      "score": 0.92,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Cutaneous Lupus Erythematosus",
      "efo_id": "MONDO_0007915",
      "score": 0.917,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Cutaneous Lupus Erythematosus",
      "efo_id": "MONDO_0007915",
      "score": 0.915,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Cutaneous Lupus Erythematosus",
      "efo_id": "MONDO_0007915",
      "score": 0.915,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Cutaneous Lupus Erythematosus",
      "efo_id": "MONDO_0007915",
      "score": 0.914,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "SYK",
      "ensembl_id": "ENSG00000165025",
      "disease": "Oncology",
      "efo_id": "MONDO_0004992",
      "score": 0.909,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Myelofibrosis",
      "efo_id": "EFO_0002430",
      "score": 0.904,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Myelofibrosis",
      "efo_id": "EFO_0002430",
      "score": 0.904,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Myelofibrosis",
      "efo_id": "EFO_0002430",
      "score": 0.904,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Myelofibrosis",
      "efo_id": "EFO_0002430",
      "score": 0.902,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Psoriatic Arthritis",
      "efo_id": "EFO_0003778",
      "score": 0.901,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Psoriatic Arthritis",
      "efo_id": "EFO_0003778",
      "score": 0.896,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Psoriatic Arthritis",
      "efo_id": "EFO_0003778",
      "score": 0.888,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PIK3CD",
      "ensembl_id": "ENSG00000171608",
      "disease": "Previously Untreated Pancreatic Ductal Adenocarcinoma",
      "efo_id": "EFO_0002618",
      "score": 0.885,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "NR1H4",
      "ensembl_id": "ENSG00000012504",
      "disease": "Primary Sclerosing Cholangitis",
      "efo_id": "EFO_0004268",
      "score": 0.885,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Ulcerative Colitis",
      "efo_id": "EFO_0000729",
      "score": 0.881,
      "source": "ot_2020"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Fistulizing Crohn's Disease",
      "efo_id": "EFO_0000384",
      "score": 0.878,
      "source": "ot_2020"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Sjogren's Syndrome",
      "efo_id": "EFO_0000699",
      "score": 0.875,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "BTK",
      "ensembl_id": "ENSG00000010671",
      "disease": "Sjogren's Syndrome",
      "efo_id": "EFO_0000699",
      "score": 0.87,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Sjogren's Syndrome",
      "efo_id": "EFO_0000699",
      "score": 0.867,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Sjogren's Syndrome",
      "efo_id": "EFO_0000699",
      "score": 0.867,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Sjogren's Syndrome",
      "efo_id": "EFO_0000699",
      "score": 0.866,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PIK3CD",
      "ensembl_id": "ENSG00000171608",
      "disease": "Lymphoid Malignancies",
      "efo_id": "EFO_0000574",
      "score": 0.852,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "SCN5A",
      "ensembl_id": "ENSG00000183873",
      "disease": "Long QT Syndrome",
      "efo_id": "MONDO_0019171",
      "score": 0.839,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PIK3CD",
      "ensembl_id": "ENSG00000171608",
      "disease": "Myelofibrosis",
      "efo_id": "EFO_0002430",
      "score": 0.837,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "NR1H4",
      "ensembl_id": "ENSG00000012504",
      "disease": "Compensated Cirrhosis",
      "efo_id": "EFO_0001422",
      "score": 0.818,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PTGIR",
      "ensembl_id": "ENSG00000160013",
      "disease": "Diabetic Kidney Disease",
      "efo_id": "EFO_0000401",
      "score": 0.818,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CYP3A4",
      "ensembl_id": "ENSG00000160868",
      "disease": "HIV-1 Infection",
      "efo_id": "EFO_0000180",
      "score": 0.792,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CD47",
      "ensembl_id": "ENSG00000196776",
      "disease": "Ovarian Cancer",
      "efo_id": "EFO_0001075",
      "score": 0.789,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CD47",
      "ensembl_id": "ENSG00000196776",
      "disease": "Hematological Malignancies",
      "efo_id": "EFO_0000574",
      "score": 0.785,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CD47",
      "ensembl_id": "ENSG00000196776",
      "disease": "Non Hodgkin Lymphoma",
      "efo_id": "EFO_0005952",
      "score": 0.784,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "SYK",
      "ensembl_id": "ENSG00000165025",
      "disease": "Non-Hodgkin Lymphoma",
      "efo_id": "EFO_0005952",
      "score": 0.782,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "MMP9",
      "ensembl_id": "ENSG00000100985",
      "disease": "Crohn's Disease",
      "efo_id": "EFO_0000384",
      "score": 0.781,
      "source": "ot_2020"
    },
    {
      "gene": "SYK",
      "ensembl_id": "ENSG00000165025",
      "disease": "Acute Lymphoblastic Leukemia",
      "efo_id": "EFO_0000220",
      "score": 0.779,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PTGIR",
      "ensembl_id": "ENSG00000160013",
      "disease": "Nonalcoholic Fatty Liver Disease (NAFLD)",
      "efo_id": "EFO_0003095",
      "score": 0.778,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "MMP9",
      "ensembl_id": "ENSG00000100985",
      "disease": "Rheumatoid Arthritis",
      "efo_id": "EFO_0000685",
      "score": 0.775,
      "source": "ot_2020"
    },
    {
      "gene": "TLR7",
      "ensembl_id": "ENSG00000196664",
      "disease": "HIV-1 Infection",
      "efo_id": "EFO_0000180",
      "score": 0.773,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "NR1H4",
      "ensembl_id": "ENSG00000012504",
      "disease": "Primary Biliary Cholangitis",
      "efo_id": "EFO_1001486",
      "score": 0.772,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "NR1H4",
      "ensembl_id": "ENSG00000012504",
      "disease": "Nonalcoholic Steatohepatitis",
      "efo_id": "EFO_1001249",
      "score": 0.749,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "MMP9",
      "ensembl_id": "ENSG00000100985",
      "disease": "Gastric Adenocarcinoma",
      "efo_id": "EFO_0000178",
      "score": 0.74,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TUBB1",
      "ensembl_id": "ENSG00000101162",
      "disease": "Non-Hodgkin Lymphoma",
      "efo_id": "EFO_0005952",
      "score": 0.69,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYMS",
      "ensembl_id": "ENSG00000176890",
      "disease": "Gastric Adenocarcinoma",
      "efo_id": "EFO_0000178",
      "score": 0.655,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TOP2A",
      "ensembl_id": "ENSG00000131747",
      "disease": "Acute Myeloid Leukemia",
      "efo_id": "EFO_0000222",
      "score": 0.65,
      "source": "ot_2020"
    },
    {
      "gene": "XDH",
      "ensembl_id": "ENSG00000158125",
      "disease": "Non Hodgkin Lymphoma",
      "efo_id": "EFO_0005952",
      "score": 0.627,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Rheumatoid Arthritis",
      "efo_id": "EFO_0000685",
      "score": 0.6,
      "source": "ot_2020"
    },
    {
      "gene": "TLR7",
      "ensembl_id": "ENSG00000196664",
      "disease": "Chronic Hepatitis B",
      "efo_id": "EFO_0004197",
      "score": 0.586,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TUBB1",
      "ensembl_id": "ENSG00000101162",
      "disease": "Acute Lymphoblastic Leukemia",
      "efo_id": "EFO_0000220",
      "score": 0.517,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "MAP3K5",
      "ensembl_id": "ENSG00000197442",
      "disease": "Diabetic Kidney Disease",
      "efo_id": "EFO_0000401",
      "score": 0.513,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "MMP9",
      "ensembl_id": "ENSG00000100985",
      "disease": "Ulcerative Colitis",
      "efo_id": "EFO_0000729",
      "score": 0.5,
      "source": "ot_2020"
    },
    {
      "gene": "TOP2A",
      "ensembl_id": "ENSG00000131747",
      "disease": "Diffuse Large B-Cell Lymphoma",
      "efo_id": "EFO_0000403",
      "score": 0.426,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Noninfectious Uveitis",
      "efo_id": "EFO_1001231",
      "score": 0.407,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Noninfectious Uveitis",
      "efo_id": "EFO_1001231",
      "score": 0.407,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Noninfectious Uveitis",
      "efo_id": "EFO_1001231",
      "score": 0.318,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Noninfectious Uveitis",
      "efo_id": "EFO_1001231",
      "score": 0.318,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PIK3CD",
      "ensembl_id": "ENSG00000171608",
      "disease": "Diffuse Large B-Cell Lymphoma",
      "efo_id": "EFO_0000403",
      "score": 0.273,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "SCN5A",
      "ensembl_id": "ENSG00000183873",
      "disease": "LQT2 Syndrome",
      "efo_id": "EFO_0004276",
      "score": 0.195,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CD47",
      "ensembl_id": "ENSG00000196776",
      "disease": "Colorectal Cancer",
      "efo_id": "EFO_1001951",
      "score": 0.145,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PIK3CD",
      "ensembl_id": "ENSG00000171608",
      "disease": "Follicular Lymphoma",
      "efo_id": "MONDO_0018906",
      "score": 0.035,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "SCN5A",
      "ensembl_id": "ENSG00000183873",
      "disease": "Ischemic Heart Disease",
      "efo_id": "EFO_0003914",
      "score": 0.006,
      "source": "ot_2020"
    }
  ],
  "GTHX": [
    {
      "gene": "EGFR",
      "ensembl_id": "ENSG00000146648",
      "disease": "Carcinoma, Non-Small-Cell Lung",
      "efo_id": "EFO_0003060",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "ESR1",
      "ensembl_id": "ENSG00000091831",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.992,
      "source": "ot_2020"
    },
    {
      "gene": "CDK6",
      "ensembl_id": "ENSG00000105810",
      "disease": "Advanced Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.968,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CDK4",
      "ensembl_id": "ENSG00000135446",
      "disease": "Advanced Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.952,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TOP2A",
      "ensembl_id": "ENSG00000131747",
      "disease": "Small Cell Lung Cancer",
      "efo_id": "EFO_0000702",
      "score": 0.857,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CDK4",
      "ensembl_id": "ENSG00000135446",
      "disease": "Small Cell Lung Cancer",
      "efo_id": "EFO_0000702",
      "score": 0.857,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CDK6",
      "ensembl_id": "ENSG00000105810",
      "disease": "Small Cell Lung Cancer",
      "efo_id": "EFO_0000702",
      "score": 0.857,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TOP1",
      "ensembl_id": "ENSG00000198900",
      "disease": "Small Cell Lung Cancer",
      "efo_id": "EFO_0000702",
      "score": 0.714,
      "source": "ot_recent_fallback"
    }
  ],
  "ICPT": [
    {
      "gene": "NR1H4",
      "ensembl_id": "ENSG00000012504",
      "disease": "Primary Sclerosing Cholangitis (PSC)",
      "efo_id": "EFO_0004268",
      "score": 0.885,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "NR1H4",
      "ensembl_id": "ENSG00000012504",
      "disease": "Liver Cirrhosis, Biliary",
      "efo_id": "EFO_0001422",
      "score": 0.818,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "HMGCR",
      "ensembl_id": "ENSG00000113161",
      "disease": "Nonalcoholic Steatohepatitis",
      "efo_id": "EFO_1001249",
      "score": 0.749,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "NR1H4",
      "ensembl_id": "ENSG00000012504",
      "disease": "Nonalcoholic Steatohepatitis",
      "efo_id": "EFO_1001249",
      "score": 0.749,
      "source": "ot_recent_fallback"
    }
  ],
  "IMGN": [
    {
      "gene": "TOP1",
      "ensembl_id": "ENSG00000198900",
      "disease": "Epithelial Ovarian Cancer",
      "efo_id": "EFO_0001075",
      "score": 0.854,
      "source": "ot_recent_fallback"
    }
  ],
  "INCY": [
    {
      "gene": "EGFR",
      "ensembl_id": "ENSG00000146648",
      "disease": "Lung Cancer",
      "efo_id": "EFO_0001071",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "FGFR2",
      "ensembl_id": "ENSG00000066468",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "MPN (Myeloproliferative Neoplasms)",
      "efo_id": "EFO_0002428",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "ABL1",
      "ensembl_id": "ENSG00000097007",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.966,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Moderate to Severe Ulcerative Colitis",
      "efo_id": "EFO_0000729",
      "score": 0.964,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "RAF1",
      "ensembl_id": "ENSG00000132155",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.963,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDGFRA",
      "ensembl_id": "ENSG00000134853",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.963,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FGFR3",
      "ensembl_id": "ENSG00000068078",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.962,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FGFR1",
      "ensembl_id": "ENSG00000077782",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.96,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDCD1",
      "ensembl_id": "ENSG00000188389",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.959,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "KIT",
      "ensembl_id": "ENSG00000157404",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.948,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "KDR",
      "ensembl_id": "ENSG00000128052",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.948,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "NTRK1",
      "ensembl_id": "ENSG00000198400",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.948,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.948,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.946,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.939,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Vitiligo",
      "efo_id": "EFO_0004208",
      "score": 0.937,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "EPHA2",
      "ensembl_id": "ENSG00000142627",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.936,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "DDR2",
      "ensembl_id": "ENSG00000162733",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.933,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FRK",
      "ensembl_id": "ENSG00000111816",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.932,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Leukemia",
      "efo_id": "EFO_0000565",
      "score": 0.919,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PIK3CD",
      "ensembl_id": "ENSG00000171608",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.917,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "MAPK11",
      "ensembl_id": "ENSG00000185386",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.914,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Non-segmental Vitiligo",
      "efo_id": "EFO_0004208",
      "score": 0.912,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Non-segmental Vitiligo",
      "efo_id": "EFO_0004208",
      "score": 0.91,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TEK",
      "ensembl_id": "ENSG00000120156",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.905,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ABL1",
      "ensembl_id": "ENSG00000097007",
      "disease": "Accelerated Phase Chronic Myeloid Leukemia",
      "efo_id": "EFO_0000220",
      "score": 0.902,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Recurrent Adult Hodgkin's Lymphoma",
      "efo_id": "EFO_0000183",
      "score": 0.9,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ARG1",
      "ensembl_id": "ENSG00000118520",
      "disease": "Bladder Cancer",
      "efo_id": "MONDO_0004986",
      "score": 0.884,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FGFR2",
      "ensembl_id": "ENSG00000066468",
      "disease": "MPN (Myeloproliferative Neoplasms)",
      "efo_id": "EFO_0002428",
      "score": 0.881,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FGFR1",
      "ensembl_id": "ENSG00000077782",
      "disease": "MPN (Myeloproliferative Neoplasms)",
      "efo_id": "EFO_0002428",
      "score": 0.877,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "MPN (Myeloproliferative Neoplasms)",
      "efo_id": "EFO_0002428",
      "score": 0.877,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FGFR3",
      "ensembl_id": "ENSG00000068078",
      "disease": "MPN (Myeloproliferative Neoplasms)",
      "efo_id": "EFO_0002428",
      "score": 0.872,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "BTK",
      "ensembl_id": "ENSG00000010671",
      "disease": "Lymphoma",
      "efo_id": "EFO_0000574",
      "score": 0.857,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PIK3CD",
      "ensembl_id": "ENSG00000171608",
      "disease": "Lymphoma",
      "efo_id": "EFO_0000574",
      "score": 0.852,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Hematologic Malignancies",
      "efo_id": "EFO_0000574",
      "score": 0.851,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "KDR",
      "ensembl_id": "ENSG00000128052",
      "disease": "Renal Cell Carcinoma (RCC)",
      "efo_id": "EFO_0000681",
      "score": 0.846,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDGFRA",
      "ensembl_id": "ENSG00000134853",
      "disease": "Renal Cell Carcinoma (RCC)",
      "efo_id": "EFO_0000681",
      "score": 0.841,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CSF1R",
      "ensembl_id": "ENSG00000182578",
      "disease": "Renal Cell Carcinoma (RCC)",
      "efo_id": "EFO_0000681",
      "score": 0.838,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDGFRB",
      "ensembl_id": "ENSG00000113721",
      "disease": "Renal Cell Carcinoma (RCC)",
      "efo_id": "EFO_0000681",
      "score": 0.837,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "KIT",
      "ensembl_id": "ENSG00000157404",
      "disease": "Renal Cell Carcinoma (RCC)",
      "efo_id": "EFO_0000681",
      "score": 0.836,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "RET",
      "ensembl_id": "ENSG00000165731",
      "disease": "Renal Cell Carcinoma (RCC)",
      "efo_id": "EFO_0000681",
      "score": 0.836,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FLT1",
      "ensembl_id": "ENSG00000102755",
      "disease": "Renal Cell Carcinoma (RCC)",
      "efo_id": "EFO_0000681",
      "score": 0.827,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Atopic Dermatitis",
      "efo_id": "EFO_0000274",
      "score": 0.821,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Atopic Dermatitis",
      "efo_id": "EFO_0000274",
      "score": 0.813,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FLT4",
      "ensembl_id": "ENSG00000037280",
      "disease": "Renal Cell Carcinoma (RCC)",
      "efo_id": "EFO_0000681",
      "score": 0.813,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Atopic Dermatitis",
      "efo_id": "EFO_0000274",
      "score": 0.812,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Lung Cancer",
      "efo_id": "EFO_0001071",
      "score": 0.811,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ARG1",
      "ensembl_id": "ENSG00000118520",
      "disease": "Relapsed or Refractory Multiple Myeloma",
      "efo_id": "EFO_0001378",
      "score": 0.804,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TOP2A",
      "ensembl_id": "ENSG00000131747",
      "disease": "Non-small Cell Lung Cancer",
      "efo_id": "EFO_0003060",
      "score": 0.803,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FLT3",
      "ensembl_id": "ENSG00000122025",
      "disease": "Renal Cell Carcinoma (RCC)",
      "efo_id": "EFO_0000681",
      "score": 0.798,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Atopic Dermatitis",
      "efo_id": "EFO_0000274",
      "score": 0.797,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Vitiligo",
      "efo_id": "EFO_0004208",
      "score": 0.781,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TOP2A",
      "ensembl_id": "ENSG00000131747",
      "disease": "Leukemia",
      "efo_id": "EFO_0000565",
      "score": 0.775,
      "source": "ot_2020"
    },
    {
      "gene": "PDCD1",
      "ensembl_id": "ENSG00000188389",
      "disease": "Non-small Cell Lung Cancer",
      "efo_id": "EFO_0003060",
      "score": 0.774,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "IDO1",
      "ensembl_id": "ENSG00000131203",
      "disease": "Advanced Malignancies",
      "efo_id": "MONDO_0004992",
      "score": 0.772,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "LOXL2",
      "ensembl_id": "ENSG00000134013",
      "disease": "Advanced Malignancies",
      "efo_id": "MONDO_0004992",
      "score": 0.763,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "IDO1",
      "ensembl_id": "ENSG00000131203",
      "disease": "Head and Neck Cancer",
      "efo_id": "EFO_0006859",
      "score": 0.763,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "IDO1",
      "ensembl_id": "ENSG00000131203",
      "disease": "Lung Cancer",
      "efo_id": "EFO_0001071",
      "score": 0.759,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FGFR2",
      "ensembl_id": "ENSG00000066468",
      "disease": "Solid Tumors",
      "efo_id": "EFO_0004282",
      "score": 0.73,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FGFR1",
      "ensembl_id": "ENSG00000077782",
      "disease": "Solid Tumors",
      "efo_id": "EFO_0004282",
      "score": 0.728,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FGFR3",
      "ensembl_id": "ENSG00000068078",
      "disease": "Solid Tumors",
      "efo_id": "EFO_0004282",
      "score": 0.725,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Solid Tumors",
      "efo_id": "EFO_0004282",
      "score": 0.723,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Solid Tumors",
      "efo_id": "EFO_0004282",
      "score": 0.72,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "AR",
      "ensembl_id": "ENSG00000169083",
      "disease": "Solid Tumors",
      "efo_id": "EFO_0004282",
      "score": 0.718,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FGFR1",
      "ensembl_id": "ENSG00000077782",
      "disease": "Advanced or Metastatic Solid Tumors",
      "efo_id": "EFO_0000335",
      "score": 0.684,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Graft-versus-host Disease (GVHD)",
      "efo_id": "MONDO_0013730",
      "score": 0.684,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Graft-versus-host Disease (GVHD)",
      "efo_id": "MONDO_0013730",
      "score": 0.684,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Graft-versus-host Disease (GVHD)",
      "efo_id": "MONDO_0013730",
      "score": 0.684,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Graft-versus-host Disease (GVHD)",
      "efo_id": "MONDO_0013730",
      "score": 0.684,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDGFRB",
      "ensembl_id": "ENSG00000113721",
      "disease": "Graft-versus-host Disease (GVHD)",
      "efo_id": "MONDO_0013730",
      "score": 0.684,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Solid Tumors",
      "efo_id": "EFO_0004282",
      "score": 0.679,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PARP1",
      "ensembl_id": "ENSG00000143799",
      "disease": "Solid Tumors",
      "efo_id": "EFO_0004282",
      "score": 0.676,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Solid Tumors",
      "efo_id": "EFO_0004282",
      "score": 0.674,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CYP17A1",
      "ensembl_id": "ENSG00000148795",
      "disease": "Solid Tumors",
      "efo_id": "EFO_0004282",
      "score": 0.656,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "MPN (Myeloproliferative Neoplasms)",
      "efo_id": "EFO_0002428",
      "score": 0.65,
      "source": "ot_2020"
    },
    {
      "gene": "JAK1",
      "ensembl_id": "ENSG00000162434",
      "disease": "Leukemia",
      "efo_id": "EFO_0000565",
      "score": 0.65,
      "source": "ot_2020"
    },
    {
      "gene": "PIK3CD",
      "ensembl_id": "ENSG00000171608",
      "disease": "Solid Tumors",
      "efo_id": "EFO_0004282",
      "score": 0.637,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYMS",
      "ensembl_id": "ENSG00000176890",
      "disease": "Head and Neck Cancer",
      "efo_id": "EFO_0006859",
      "score": 0.625,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "SRD5A1",
      "ensembl_id": "ENSG00000145545",
      "disease": "Solid Tumors",
      "efo_id": "EFO_0004282",
      "score": 0.554,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "BTK",
      "ensembl_id": "ENSG00000010671",
      "disease": "Graft-versus-host Disease (GVHD)",
      "efo_id": "MONDO_0013730",
      "score": 0.547,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ABL1",
      "ensembl_id": "ENSG00000097007",
      "disease": "Graft-versus-host Disease (GVHD)",
      "efo_id": "MONDO_0013730",
      "score": 0.547,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "KIT",
      "ensembl_id": "ENSG00000157404",
      "disease": "Graft-versus-host Disease (GVHD)",
      "efo_id": "MONDO_0013730",
      "score": 0.547,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PIK3CD",
      "ensembl_id": "ENSG00000171608",
      "disease": "MPN (Myeloproliferative Neoplasms)",
      "efo_id": "EFO_0002428",
      "score": 0.5,
      "source": "ot_2020"
    },
    {
      "gene": "BRAF",
      "ensembl_id": "ENSG00000157764",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.5,
      "source": "ot_2020"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "MPN (Myeloproliferative Neoplasms)",
      "efo_id": "EFO_0002428",
      "score": 0.5,
      "source": "ot_2020"
    },
    {
      "gene": "JAK3",
      "ensembl_id": "ENSG00000105639",
      "disease": "Leukemia",
      "efo_id": "EFO_0000565",
      "score": 0.5,
      "source": "ot_2020"
    },
    {
      "gene": "RET",
      "ensembl_id": "ENSG00000165731",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.49,
      "source": "ot_2020"
    },
    {
      "gene": "JAK2",
      "ensembl_id": "ENSG00000096968",
      "disease": "Leukemia",
      "efo_id": "EFO_0000565",
      "score": 0.49,
      "source": "ot_2020"
    },
    {
      "gene": "IDO1",
      "ensembl_id": "ENSG00000131203",
      "disease": "Solid Tumors",
      "efo_id": "EFO_0004282",
      "score": 0.468,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ARG1",
      "ensembl_id": "ENSG00000118520",
      "disease": "Solid Tumors",
      "efo_id": "EFO_0004282",
      "score": 0.464,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ARG1",
      "ensembl_id": "ENSG00000118520",
      "disease": "Biliary Tract Cancer (BTC)",
      "efo_id": "EFO_0005221",
      "score": 0.284,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYMS",
      "ensembl_id": "ENSG00000176890",
      "disease": "Biliary Tract Cancer (BTC)",
      "efo_id": "EFO_0005221",
      "score": 0.279,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FGFR2",
      "ensembl_id": "ENSG00000066468",
      "disease": "Cholangiocarcinoma",
      "efo_id": "EFO_0005221",
      "score": 0.279,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FGFR3",
      "ensembl_id": "ENSG00000068078",
      "disease": "Cholangiocarcinoma",
      "efo_id": "EFO_0005221",
      "score": 0.279,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FGFR1",
      "ensembl_id": "ENSG00000077782",
      "disease": "Cholangiocarcinoma",
      "efo_id": "EFO_0005221",
      "score": 0.279,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PIK3CD",
      "ensembl_id": "ENSG00000171608",
      "disease": "Refractory Diffuse Large B-Cell Lymphoma",
      "efo_id": "EFO_0000403",
      "score": 0.273,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "IDO1",
      "ensembl_id": "ENSG00000131203",
      "disease": "Renal Cell Carcinoma (RCC)",
      "efo_id": "EFO_0000681",
      "score": 0.125,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TYK2",
      "ensembl_id": "ENSG00000105397",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.002,
      "source": "ot_2020"
    }
  ],
  "IONS": [
    {
      "gene": "TTR",
      "ensembl_id": "ENSG00000118271",
      "disease": "Transthyretin-Mediated Amyloid Cardiomyopathy (ATTR CM)",
      "efo_id": "MONDO_0018634",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "APOC3",
      "ensembl_id": "ENSG00000110245",
      "disease": "Abnormalities, Cardiovascular",
      "efo_id": "EFO_0000319",
      "score": 0.835,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "APOC3",
      "ensembl_id": "ENSG00000110245",
      "disease": "Hypertriglyceridemia",
      "efo_id": "EFO_0004211",
      "score": 0.712,
      "source": "ot_2020"
    }
  ],
  "IRWD": [
    {
      "gene": "TUBA1B",
      "ensembl_id": "ENSG00000123416",
      "disease": "Chronic Kidney Disease (CKD)",
      "efo_id": "EFO_0003884",
      "score": 0.756,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "GUCY2C",
      "ensembl_id": "ENSG00000070019",
      "disease": "Irritable Bowel Syndrome Characterized by Constipation",
      "efo_id": "EFO_0000555",
      "score": 0.61,
      "source": "ot_recent_fallback"
    }
  ],
  "KDMN": [
    {
      "gene": "EGFR",
      "ensembl_id": "ENSG00000146648",
      "disease": "Brain Tumor",
      "efo_id": "EFO_0000519",
      "score": 0.983,
      "source": "ot_2020"
    },
    {
      "gene": "EGFR",
      "ensembl_id": "ENSG00000146648",
      "disease": "ADPKD",
      "efo_id": "EFO_0008620",
      "score": 0.98,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ROCK1",
      "ensembl_id": "ENSG00000067900",
      "disease": "Autoimmune Diseases",
      "efo_id": "EFO_0000540",
      "score": 0.889,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ROCK2",
      "ensembl_id": "ENSG00000134318",
      "disease": "Chronic Plaque Psoriasis",
      "efo_id": "EFO_1001494",
      "score": 0.879,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ROCK1",
      "ensembl_id": "ENSG00000067900",
      "disease": "Chronic Plaque Psoriasis",
      "efo_id": "EFO_1001494",
      "score": 0.849,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "MET",
      "ensembl_id": "ENSG00000105976",
      "disease": "Brain Tumor",
      "efo_id": "EFO_0000519",
      "score": 0.835,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ROCK2",
      "ensembl_id": "ENSG00000134318",
      "disease": "Idiopathic Pulmonary Fibrosis",
      "efo_id": "EFO_0000768",
      "score": 0.825,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ROCK1",
      "ensembl_id": "ENSG00000067900",
      "disease": "Idiopathic Pulmonary Fibrosis",
      "efo_id": "EFO_0000768",
      "score": 0.691,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "MET",
      "ensembl_id": "ENSG00000105976",
      "disease": "ADPKD",
      "efo_id": "EFO_0008620",
      "score": 0.642,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ROCK2",
      "ensembl_id": "ENSG00000134318",
      "disease": "Autoimmune Diseases",
      "efo_id": "EFO_0000540",
      "score": 0.625,
      "source": "ot_2020"
    },
    {
      "gene": "ATP4A",
      "ensembl_id": "ENSG00000105675",
      "disease": "Autoimmune Diseases",
      "efo_id": "EFO_0000540",
      "score": 0.5,
      "source": "ot_2020"
    }
  ],
  "KPTI": [
    {
      "gene": "XPO1",
      "ensembl_id": "ENSG00000082898",
      "disease": "Myelodysplastic Syndrome",
      "efo_id": "EFO_0000198",
      "score": 0.928,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "XPO1",
      "ensembl_id": "ENSG00000082898",
      "disease": "Endometrial Cancer",
      "efo_id": "MONDO_0011962",
      "score": 0.921,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TUBB1",
      "ensembl_id": "ENSG00000101162",
      "disease": "Multiple Myeloma",
      "efo_id": "EFO_0001378",
      "score": 0.875,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CD38",
      "ensembl_id": "ENSG00000004468",
      "disease": "Multiple Myeloma",
      "efo_id": "EFO_0001378",
      "score": 0.837,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TNFRSF17",
      "ensembl_id": "ENSG00000048462",
      "disease": "Multiple Myeloma",
      "efo_id": "EFO_0001378",
      "score": 0.82,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "SLAMF7",
      "ensembl_id": "ENSG00000026751",
      "disease": "Multiple Myeloma",
      "efo_id": "EFO_0001378",
      "score": 0.81,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "XPO1",
      "ensembl_id": "ENSG00000082898",
      "disease": "Multiple Myeloma",
      "efo_id": "EFO_0001378",
      "score": 0.795,
      "source": "ot_recent_fallback"
    }
  ],
  "KURA": [
    {
      "gene": "FNTB",
      "ensembl_id": "ENSG00000257365",
      "disease": "HRAS Mutant Tumor",
      "efo_id": "EFO_0002892",
      "score": 0.182,
      "source": "ot_recent_fallback"
    }
  ],
  "MDCO": [
    {
      "gene": "PCSK9",
      "ensembl_id": "ENSG00000169174",
      "disease": "Elevated Cholesterol",
      "efo_id": "EFO_0004911",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "VKORC1",
      "ensembl_id": "ENSG00000167397",
      "disease": "Acute Bacterial Skin and Skin Structure Infection",
      "efo_id": "EFO_0000618",
      "score": 0.74,
      "source": "ot_2020"
    },
    {
      "gene": "PCSK9",
      "ensembl_id": "ENSG00000169174",
      "disease": "ASCVD",
      "efo_id": "EFO_0003914",
      "score": 0.701,
      "source": "ot_2020"
    }
  ],
  "MDGL": [
    {
      "gene": "THRB",
      "ensembl_id": "ENSG00000151090",
      "disease": "Non-alcoholic Steatohepatitis",
      "efo_id": "EFO_1001249",
      "score": 0.388,
      "source": "ot_recent_fallback"
    }
  ],
  "MGNX": [
    {
      "gene": "ERBB2",
      "ensembl_id": "ENSG00000141736",
      "disease": "HER-2 Positive Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.953,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDCD1",
      "ensembl_id": "ENSG00000188389",
      "disease": "Gastric Cancer",
      "efo_id": "EFO_0000178",
      "score": 0.752,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDCD1",
      "ensembl_id": "ENSG00000188389",
      "disease": "Head and Neck Cancer",
      "efo_id": "EFO_0006859",
      "score": 0.743,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "LAG3",
      "ensembl_id": "ENSG00000089692",
      "disease": "Gastric Cancer",
      "efo_id": "EFO_0000178",
      "score": 0.74,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ERBB2",
      "ensembl_id": "ENSG00000141736",
      "disease": "Gastric Cancer",
      "efo_id": "EFO_0000178",
      "score": 0.7,
      "source": "ot_2020"
    },
    {
      "gene": "ERBB2",
      "ensembl_id": "ENSG00000141736",
      "disease": "Esophageal Cancer",
      "efo_id": "EFO_0002916",
      "score": 0.634,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ERBB2",
      "ensembl_id": "ENSG00000141736",
      "disease": "Advanced Solid Tumors",
      "efo_id": "EFO_0000335",
      "score": 0.547,
      "source": "ot_recent_fallback"
    }
  ],
  "MRTX": [
    {
      "gene": "EGFR",
      "ensembl_id": "ENSG00000146648",
      "disease": "Advanced Cancer",
      "efo_id": "MONDO_0004992",
      "score": 0.936,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ERBB2",
      "ensembl_id": "ENSG00000141736",
      "disease": "Advanced Cancer",
      "efo_id": "MONDO_0004992",
      "score": 0.932,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ERBB4",
      "ensembl_id": "ENSG00000178568",
      "disease": "Advanced Cancer",
      "efo_id": "MONDO_0004992",
      "score": 0.925,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "MET",
      "ensembl_id": "ENSG00000105976",
      "disease": "Clear Cell Renal Cell Carcinoma",
      "efo_id": "EFO_0000349",
      "score": 0.857,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "KDR",
      "ensembl_id": "ENSG00000128052",
      "disease": "Clear Cell Renal Cell Carcinoma",
      "efo_id": "EFO_0000349",
      "score": 0.852,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "AXL",
      "ensembl_id": "ENSG00000167601",
      "disease": "Clear Cell Renal Cell Carcinoma",
      "efo_id": "EFO_0000349",
      "score": 0.842,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "KDR",
      "ensembl_id": "ENSG00000128052",
      "disease": "Carcinoma, Non-Small-Cell Lung",
      "efo_id": "EFO_0003060",
      "score": 0.836,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "MET",
      "ensembl_id": "ENSG00000105976",
      "disease": "Non-Small Cell Lung Cancer",
      "efo_id": "EFO_0003060",
      "score": 0.835,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "AXL",
      "ensembl_id": "ENSG00000167601",
      "disease": "Carcinoma, Non-Small-Cell Lung",
      "efo_id": "EFO_0003060",
      "score": 0.625,
      "source": "ot_2020"
    }
  ],
  "MYGN": [
    {
      "gene": "SRD5A1",
      "ensembl_id": "ENSG00000145545",
      "disease": "Metastatic Castration-resistant Prostate Cancer",
      "efo_id": "EFO_0001663",
      "score": 0.935,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PARP1",
      "ensembl_id": "ENSG00000143799",
      "disease": "Metastatic Castration-resistant Prostate Cancer",
      "efo_id": "EFO_0001663",
      "score": 0.929,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PARP1",
      "ensembl_id": "ENSG00000143799",
      "disease": "Ovarian Neoplasms",
      "efo_id": "EFO_0001075",
      "score": 0.858,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PARP2",
      "ensembl_id": "ENSG00000129484",
      "disease": "Ovarian Cancer",
      "efo_id": "EFO_0001075",
      "score": 0.856,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "AR",
      "ensembl_id": "ENSG00000169083",
      "disease": "Metastatic Castration-resistant Prostate Cancer",
      "efo_id": "EFO_0001663",
      "score": 0.747,
      "source": "ot_2020"
    },
    {
      "gene": "CYP17A1",
      "ensembl_id": "ENSG00000148795",
      "disease": "Metastatic Castration-resistant Prostate Cancer",
      "efo_id": "EFO_0001663",
      "score": 0.625,
      "source": "ot_2020"
    }
  ],
  "NBIX": [
    {
      "gene": "SLC18A2",
      "ensembl_id": "ENSG00000165646",
      "disease": "Tardive Dyskinesia (TD)",
      "efo_id": "EFO_0004280",
      "score": 0.853,
      "source": "ot_2020"
    }
  ],
  "OPK": [
    {
      "gene": "F9",
      "ensembl_id": "ENSG00000101981",
      "disease": "Hemophilia A",
      "efo_id": "MONDO_0010602",
      "score": 0.99,
      "source": "ot_recent_fallback"
    }
  ],
  "PBYI": [
    {
      "gene": "EGFR",
      "ensembl_id": "ENSG00000146648",
      "disease": "Early Stage HER2+ Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.953,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ERBB2",
      "ensembl_id": "ENSG00000141736",
      "disease": "Early Stage HER2+ Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.953,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ERBB4",
      "ensembl_id": "ENSG00000178568",
      "disease": "Early Stage HER2+ Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.65,
      "source": "ot_2020"
    }
  ],
  "PGNX": [
    {
      "gene": "AR",
      "ensembl_id": "ENSG00000169083",
      "disease": "Cancer of the Prostate",
      "efo_id": "EFO_0000625",
      "score": 0.828,
      "source": "ot_recent_fallback"
    }
  ],
  "PTCT": [
    {
      "gene": "DMD",
      "ensembl_id": "ENSG00000198947",
      "disease": "Duchenne Muscular Dystrophy",
      "efo_id": "MONDO_0010679",
      "score": 0.926,
      "source": "ot_recent_fallback"
    }
  ],
  "RARE": [
    {
      "gene": "GALNS",
      "ensembl_id": "ENSG00000141012",
      "disease": "MPS VII",
      "efo_id": "MONDO_0009661",
      "score": 0.975,
      "source": "ot_recent_fallback"
    }
  ],
  "RARX": [
    {
      "gene": "KIT",
      "ensembl_id": "ENSG00000157404",
      "disease": "Gastrointestinal Stromal Tumors",
      "efo_id": "MONDO_0011719",
      "score": 0.934,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDGFRA",
      "ensembl_id": "ENSG00000134853",
      "disease": "Gastrointestinal Stromal Tumors",
      "efo_id": "MONDO_0011719",
      "score": 0.934,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "RET",
      "ensembl_id": "ENSG00000165731",
      "disease": "Gastrointestinal Stromal Tumors",
      "efo_id": "MONDO_0011719",
      "score": 0.934,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "KIT",
      "ensembl_id": "ENSG00000157404",
      "disease": "Advanced Cancers",
      "efo_id": "MONDO_0004992",
      "score": 0.93,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDGFRA",
      "ensembl_id": "ENSG00000134853",
      "disease": "Advanced Cancers",
      "efo_id": "MONDO_0004992",
      "score": 0.93,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "KDR",
      "ensembl_id": "ENSG00000128052",
      "disease": "Gastrointestinal Stromal Tumors",
      "efo_id": "MONDO_0011719",
      "score": 0.929,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FLT1",
      "ensembl_id": "ENSG00000102755",
      "disease": "Gastrointestinal Stromal Tumors",
      "efo_id": "MONDO_0011719",
      "score": 0.929,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDGFRB",
      "ensembl_id": "ENSG00000113721",
      "disease": "Gastrointestinal Stromal Tumors",
      "efo_id": "MONDO_0011719",
      "score": 0.929,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FLT3",
      "ensembl_id": "ENSG00000122025",
      "disease": "Gastrointestinal Stromal Tumors",
      "efo_id": "MONDO_0011719",
      "score": 0.929,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TLR7",
      "ensembl_id": "ENSG00000196664",
      "disease": "Melanoma",
      "efo_id": "EFO_0000756",
      "score": 0.926,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "DMD",
      "ensembl_id": "ENSG00000198947",
      "disease": "Duchenne Muscular Dystrophy",
      "efo_id": "MONDO_0010679",
      "score": 0.926,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FLT4",
      "ensembl_id": "ENSG00000037280",
      "disease": "Gastrointestinal Stromal Tumors",
      "efo_id": "MONDO_0011719",
      "score": 0.923,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TNFSF13B",
      "ensembl_id": "ENSG00000102524",
      "disease": "Systemic Lupus Erythematosus",
      "efo_id": "MONDO_0007915",
      "score": 0.915,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CSF1R",
      "ensembl_id": "ENSG00000182578",
      "disease": "Gastrointestinal Stromal Tumors",
      "efo_id": "MONDO_0011719",
      "score": 0.909,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ATP4A",
      "ensembl_id": "ENSG00000105675",
      "disease": "Pain",
      "efo_id": "HP_0012531",
      "score": 0.837,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ABL1",
      "ensembl_id": "ENSG00000097007",
      "disease": "Locally Advanced or Metastatic Solid Tumor",
      "efo_id": "EFO_0000335",
      "score": 0.547,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TNFSF13B",
      "ensembl_id": "ENSG00000102524",
      "disease": "Idiopathic Thrombocytopenic Purpura",
      "efo_id": "EFO_0007160",
      "score": 0.426,
      "source": "ot_recent_fallback"
    }
  ],
  "REGN": [
    {
      "gene": "PCSK9",
      "ensembl_id": "ENSG00000169174",
      "disease": "Heterozygous Familial Hypercholesterolemia",
      "efo_id": "EFO_0004911",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "NGF",
      "ensembl_id": "ENSG00000134259",
      "disease": "Osteoarthritis, Hip",
      "efo_id": "EFO_1000786",
      "score": 0.962,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "IL4R",
      "ensembl_id": "ENSG00000077238",
      "disease": "Asthma, Allergic",
      "efo_id": "MONDO_0004979",
      "score": 0.932,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "IL33",
      "ensembl_id": "ENSG00000137033",
      "disease": "Asthma, Allergic",
      "efo_id": "MONDO_0004979",
      "score": 0.931,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "IL33",
      "ensembl_id": "ENSG00000137033",
      "disease": "Atopic Dermatitis",
      "efo_id": "EFO_0000274",
      "score": 0.931,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "IL4R",
      "ensembl_id": "ENSG00000077238",
      "disease": "Atopic Dermatitis",
      "efo_id": "EFO_0000274",
      "score": 0.93,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ATP4A",
      "ensembl_id": "ENSG00000105675",
      "disease": "Atopic Dermatitis",
      "efo_id": "EFO_0000274",
      "score": 0.926,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDCD1",
      "ensembl_id": "ENSG00000188389",
      "disease": "Advanced Malignancies",
      "efo_id": "MONDO_0004992",
      "score": 0.923,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDCD1",
      "ensembl_id": "ENSG00000188389",
      "disease": "Melanoma",
      "efo_id": "EFO_0000756",
      "score": 0.923,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "NGF",
      "ensembl_id": "ENSG00000134259",
      "disease": "Osteoarthritis of the Knee or Hip",
      "efo_id": "EFO_0003931",
      "score": 0.915,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "IL1B",
      "ensembl_id": "ENSG00000125538",
      "disease": "Anemia",
      "efo_id": "MONDO_0002280",
      "score": 0.896,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "NGF",
      "ensembl_id": "ENSG00000134259",
      "disease": "Osteoarthritis",
      "efo_id": "MONDO_0005178",
      "score": 0.851,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PTGS2",
      "ensembl_id": "ENSG00000073756",
      "disease": "Osteoarthritis, Hip",
      "efo_id": "EFO_1000786",
      "score": 0.812,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PTGS1",
      "ensembl_id": "ENSG00000095303",
      "disease": "Osteoarthritis, Hip",
      "efo_id": "EFO_1000786",
      "score": 0.776,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PDCD1",
      "ensembl_id": "ENSG00000188389",
      "disease": "Non-small Cell Lung Cancer",
      "efo_id": "EFO_0003060",
      "score": 0.774,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "IL4R",
      "ensembl_id": "ENSG00000077238",
      "disease": "Eosinophilic Esophagitis",
      "efo_id": "EFO_0004232",
      "score": 0.73,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "VKORC1",
      "ensembl_id": "ENSG00000167397",
      "disease": "Atopic Dermatitis",
      "efo_id": "EFO_0000274",
      "score": 0.691,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "VEGFA",
      "ensembl_id": "ENSG00000112715",
      "disease": "Neovascular Age-Related Macular Degeneration",
      "efo_id": "EFO_0004683",
      "score": 0.625,
      "source": "ot_2020"
    },
    {
      "gene": "IL4R",
      "ensembl_id": "ENSG00000077238",
      "disease": "Allergic Rhinitis",
      "efo_id": "EFO_0005854",
      "score": 0.002,
      "source": "ot_2020"
    }
  ],
  "RYTM": [
    {
      "gene": "MC4R",
      "ensembl_id": "ENSG00000166603",
      "disease": "Genetic Obesity",
      "efo_id": "EFO_0001073",
      "score": 1.0,
      "source": "ot_2020"
    },
    {
      "gene": "MC4R",
      "ensembl_id": "ENSG00000166603",
      "disease": "Hypertriglyceridemia",
      "efo_id": "EFO_0004211",
      "score": 0.741,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "MC4R",
      "ensembl_id": "ENSG00000166603",
      "disease": "Prader-Willi Syndrome",
      "efo_id": "MONDO_0008300",
      "score": 0.698,
      "source": "ot_recent_fallback"
    }
  ],
  "SGEN": [
    {
      "gene": "PARP1",
      "ensembl_id": "ENSG00000143799",
      "disease": "Bladder Cancer",
      "efo_id": "MONDO_0004986",
      "score": 0.847,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PARP2",
      "ensembl_id": "ENSG00000129484",
      "disease": "Bladder Cancer",
      "efo_id": "MONDO_0004986",
      "score": 0.702,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FGFR1",
      "ensembl_id": "ENSG00000077782",
      "disease": "Advanced Solid Tumors",
      "efo_id": "EFO_0000335",
      "score": 0.684,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CDK4",
      "ensembl_id": "ENSG00000135446",
      "disease": "Advanced Solid Tumors",
      "efo_id": "EFO_0000335",
      "score": 0.547,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ABL1",
      "ensembl_id": "ENSG00000097007",
      "disease": "Advanced Solid Tumors",
      "efo_id": "EFO_0000335",
      "score": 0.547,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "KIT",
      "ensembl_id": "ENSG00000157404",
      "disease": "Advanced Solid Tumors",
      "efo_id": "EFO_0000335",
      "score": 0.547,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "KDR",
      "ensembl_id": "ENSG00000128052",
      "disease": "Advanced Solid Tumors",
      "efo_id": "EFO_0000335",
      "score": 0.547,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "FLT1",
      "ensembl_id": "ENSG00000102755",
      "disease": "Advanced Solid Tumors",
      "efo_id": "EFO_0000335",
      "score": 0.547,
      "source": "ot_recent_fallback"
    }
  ],
  "SGMO": [
    {
      "gene": "HBB",
      "ensembl_id": "ENSG00000244734",
      "disease": "Sickle Cell Disease",
      "efo_id": "MONDO_0011382",
      "score": 0.608,
      "source": "ot_recent_fallback"
    }
  ],
  "SPPI": [
    {
      "gene": "CSF3R",
      "ensembl_id": "ENSG00000119535",
      "disease": "Breast Cancer",
      "efo_id": "EFO_0000305",
      "score": 0.882,
      "source": "ot_recent_fallback"
    }
  ],
  "SRPT": [
    {
      "gene": "DMD",
      "ensembl_id": "ENSG00000198947",
      "disease": "Duchenne Muscular Dystrophy",
      "efo_id": "MONDO_0010679",
      "score": 0.926,
      "source": "ot_recent_fallback"
    }
  ],
  "TGTX": [
    {
      "gene": "ABL1",
      "ensembl_id": "ENSG00000097007",
      "disease": "Chronic Lymphocytic Leukemia",
      "efo_id": "EFO_0000095",
      "score": 0.953,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PIK3CD",
      "ensembl_id": "ENSG00000171608",
      "disease": "Chronic Lymphocytic Leukemia",
      "efo_id": "EFO_0000095",
      "score": 0.933,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "BCL2",
      "ensembl_id": "ENSG00000171791",
      "disease": "Chronic Lymphocytic Leukemia",
      "efo_id": "EFO_0000095",
      "score": 0.922,
      "source": "ot_2020"
    },
    {
      "gene": "BTK",
      "ensembl_id": "ENSG00000010671",
      "disease": "Chronic Lymphocytic Leukemia",
      "efo_id": "EFO_0000095",
      "score": 0.921,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "MS4A1",
      "ensembl_id": "ENSG00000156738",
      "disease": "Multiple Sclerosis",
      "efo_id": "MONDO_0005301",
      "score": 0.876,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "MS4A1",
      "ensembl_id": "ENSG00000156738",
      "disease": "Chronic Lymphocytic Leukemia",
      "efo_id": "EFO_0000095",
      "score": 0.863,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CSNK1E",
      "ensembl_id": "ENSG00000213923",
      "disease": "Chronic Lymphocytic Leukemia",
      "efo_id": "EFO_0000095",
      "score": 0.748,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ABL1",
      "ensembl_id": "ENSG00000097007",
      "disease": "Diffuse Large B-Cell Lymphoma",
      "efo_id": "EFO_0000403",
      "score": 0.59,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "MS4A1",
      "ensembl_id": "ENSG00000156738",
      "disease": "Diffuse Large B-Cell Lymphoma",
      "efo_id": "EFO_0000403",
      "score": 0.523,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ABL1",
      "ensembl_id": "ENSG00000097007",
      "disease": "Follicular Lymphoma",
      "efo_id": "MONDO_0018906",
      "score": 0.466,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CSNK1E",
      "ensembl_id": "ENSG00000213923",
      "disease": "Follicular Lymphoma",
      "efo_id": "MONDO_0018906",
      "score": 0.428,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PIK3CD",
      "ensembl_id": "ENSG00000171608",
      "disease": "Diffuse Large B-Cell Lymphoma",
      "efo_id": "EFO_0000403",
      "score": 0.273,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PIK3CD",
      "ensembl_id": "ENSG00000171608",
      "disease": "Marginal Zone Lymphoma",
      "efo_id": "EFO_1000630",
      "score": 0.035,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CSNK1E",
      "ensembl_id": "ENSG00000213923",
      "disease": "Marginal Zone Lymphoma",
      "efo_id": "EFO_1000630",
      "score": 0.035,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "ABL1",
      "ensembl_id": "ENSG00000097007",
      "disease": "Marginal Zone Lymphoma",
      "efo_id": "EFO_1000630",
      "score": 0.035,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PIK3CD",
      "ensembl_id": "ENSG00000171608",
      "disease": "Follicular Lymphoma",
      "efo_id": "MONDO_0018906",
      "score": 0.035,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CSNK1E",
      "ensembl_id": "ENSG00000213923",
      "disease": "Diffuse Large B-Cell Lymphoma",
      "efo_id": "EFO_0000403",
      "score": 0.035,
      "source": "ot_recent_fallback"
    }
  ],
  "UTHR": [
    {
      "gene": "PTGIR",
      "ensembl_id": "ENSG00000160013",
      "disease": "Pulmonary Arterial Hypertension",
      "efo_id": "EFO_0001361",
      "score": 0.963,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PTGIR",
      "ensembl_id": "ENSG00000160013",
      "disease": "Heart Failure With Preserved Ejection Fraction",
      "efo_id": "EFO_0003144",
      "score": 0.895,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PTGIR",
      "ensembl_id": "ENSG00000160013",
      "disease": "Chronic Obstructive Pulmonary Disease",
      "efo_id": "EFO_0000341",
      "score": 0.727,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TOP1",
      "ensembl_id": "ENSG00000198900",
      "disease": "Small Cell Lung Cancer",
      "efo_id": "EFO_0000702",
      "score": 0.714,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "PTGIR",
      "ensembl_id": "ENSG00000160013",
      "disease": "Pulmonary Fibrosis",
      "efo_id": "EFO_0009448",
      "score": 0.128,
      "source": "ot_recent_fallback"
    }
  ],
  "VNDA": [
    {
      "gene": "TACR1",
      "ensembl_id": "ENSG00000115353",
      "disease": "Atopic Dermatitis",
      "efo_id": "EFO_0000274",
      "score": 0.914,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "MTNR1A",
      "ensembl_id": "ENSG00000168412",
      "disease": "Autism Spectrum Disorder",
      "efo_id": "EFO_0003756",
      "score": 0.762,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "TACR1",
      "ensembl_id": "ENSG00000115353",
      "disease": "Diabetic Gastroparesis",
      "efo_id": "EFO_1000948",
      "score": 0.412,
      "source": "ot_recent_fallback"
    }
  ],
  "VRTX": [
    {
      "gene": "CFTR",
      "ensembl_id": "ENSG00000001626",
      "disease": "Cystic Fibrosis",
      "efo_id": "MONDO_0009061",
      "score": 0.979,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "CFTR",
      "ensembl_id": "ENSG00000001626",
      "disease": "Advanced Lung Disease",
      "efo_id": "EFO_0001071",
      "score": 0.899,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "HBB",
      "ensembl_id": "ENSG00000244734",
      "disease": "Hematological Diseases",
      "efo_id": "MONDO_0011382",
      "score": 0.608,
      "source": "ot_recent_fallback"
    }
  ],
  "BLUE": [
    {
      "gene": "TNFRSF17",
      "ensembl_id": "ENSG00000048462",
      "disease": "Relapsed/Refractory Multiple Myeloma",
      "efo_id": "EFO_0001378",
      "score": 0.82,
      "source": "ot_recent_fallback"
    },
    {
      "gene": "HBB",
      "ensembl_id": "ENSG00000244734",
      "disease": "Sickle Cell Disease",
      "efo_id": "MONDO_0011382",
      "score": 0.608,
      "source": "ot_recent_fallback"
    }
  ],
  "FGEN": [
    {
      "gene": "DMD",
      "ensembl_id": "ENSG00000198947",
      "disease": "Duchenne Muscular Dystrophy (DMD)",
      "efo_id": "MONDO_0010679",
      "score": 0.926,
      "source": "ot_recent_fallback"
    }
  ],
  "FIXX": [
    {
      "gene": "PAH",
      "ensembl_id": "ENSG00000171759",
      "disease": "Phenylketonuria (PKU)",
      "efo_id": "MONDO_0009861",
      "score": 0.992,
      "source": "ot_recent_fallback"
    }
  ]
};
