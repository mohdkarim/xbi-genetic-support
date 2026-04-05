/**
 * charts.js — All Plotly chart rendering functions
 */

const COLORS = {
  gs: '#1a56db',
  nongs: '#d97706',
  xbi: '#6b7280',
  sp500: '#0d9488',
  random: '#a78bfa',
  gsLight: 'rgba(26, 86, 219, 0.1)',
  nongsLight: 'rgba(217, 119, 6, 0.1)',
  xbiLight: 'rgba(107, 114, 128, 0.1)',
  sp500Light: 'rgba(13, 148, 136, 0.1)',
  randomLight: 'rgba(167, 139, 250, 0.12)',
};

const CHART_CONFIG = {
  responsive: true,
  displayModeBar: false,
};

const CHART_LAYOUT_BASE = {
  font: { family: 'Inter, -apple-system, sans-serif', size: 12, color: '#475569' },
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  margin: { t: 20, r: 30, b: 50, l: 60 },
  hoverlabel: {
    bgcolor: '#1e293b',
    font: { family: 'Inter, sans-serif', size: 12, color: '#fff' },
    bordercolor: 'transparent',
  },
};

/* --- NAV Chart with random portfolio bands --- */
function renderNAVChart() {
  const data = QUARTERLY;
  if (!data || !data.length) return;

  const dates = data.map(q => q.date);
  const traces = [
    {
      x: dates, y: data.map(q => q.gs),
      name: 'XBI-G (GS)', line: { color: COLORS.gs, width: 3 },
      hovertemplate: 'XBI-G: $%{y:,.0f}<extra></extra>',
    },
    {
      x: dates, y: data.map(q => q.nongs),
      name: 'XBI-NG (Non-GS)', line: { color: COLORS.nongs, width: 3 },
      hovertemplate: 'XBI-NG: $%{y:,.0f}<extra></extra>',
    },
    {
      x: dates, y: data.map(q => q.xbi),
      name: 'XBI ETF', line: { color: COLORS.xbi, width: 2, dash: 'dash' },
      hovertemplate: 'XBI ETF: $%{y:,.0f}<extra></extra>',
    },
    {
      x: dates, y: data.map(q => q.sp500),
      name: 'S&P 500', line: { color: COLORS.sp500, width: 2, dash: 'dash' },
      hovertemplate: 'S&P 500: $%{y:,.0f}<extra></extra>',
    },
  ];

  const lastQ = data[data.length - 1];
  const layout = {
    ...CHART_LAYOUT_BASE,
    xaxis: { gridcolor: '#f1f5f9', tickformat: '%b %Y' },
    yaxis: { gridcolor: '#f1f5f9', tickprefix: '$', tickformat: ',d', title: '' },
    hovermode: 'x unified',
    legend: { orientation: 'h', y: -0.15, x: 0.5, xanchor: 'center' },
    shapes: [{
      type: 'line', x0: dates[0], x1: dates[dates.length - 1],
      y0: 1000, y1: 1000,
      line: { color: '#cbd5e1', width: 1, dash: 'dot' },
    }],
    annotations: [
      { x: lastQ.date, y: lastQ.gs, text: `$${lastQ.gs.toFixed(0)}`, showarrow: false, xanchor: 'left', xshift: 8, font: { color: COLORS.gs, size: 11, weight: 600 } },
      { x: lastQ.date, y: lastQ.nongs, text: `$${lastQ.nongs.toFixed(0)}`, showarrow: false, xanchor: 'left', xshift: 8, font: { color: COLORS.nongs, size: 11, weight: 600 } },
      { x: lastQ.date, y: lastQ.sp500, text: `$${lastQ.sp500.toFixed(0)}`, showarrow: false, xanchor: 'left', xshift: 8, font: { color: COLORS.sp500, size: 11, weight: 600 } },
    ],
  };

  Plotly.newPlot('nav-chart', traces, layout, CHART_CONFIG);
}

/* --- Drawdown Chart --- */
function renderDrawdownChart() {
  const data = QUARTERLY;
  if (!data || !data.length) return;

  const dates = data.map(q => q.date);
  const traces = [
    {
      x: dates, y: data.map(q => q.gs_dd),
      name: 'XBI-G (GS)', fill: 'tozeroy',
      line: { color: COLORS.gs, width: 2 }, fillcolor: COLORS.gsLight,
      hovertemplate: 'GS: %{y:.1f}%<extra></extra>',
    },
    {
      x: dates, y: data.map(q => q.nongs_dd),
      name: 'XBI-NG (Non-GS)', fill: 'tozeroy',
      line: { color: COLORS.nongs, width: 2 }, fillcolor: COLORS.nongsLight,
      hovertemplate: 'Non-GS: %{y:.1f}%<extra></extra>',
    },
    {
      x: dates, y: data.map(q => q.xbi_dd),
      name: 'XBI ETF', fill: 'tozeroy',
      line: { color: COLORS.xbi, width: 2, dash: 'dash' }, fillcolor: COLORS.xbiLight,
      hovertemplate: 'XBI: %{y:.1f}%<extra></extra>',
    },
    {
      x: dates, y: data.map(q => q.sp500_dd),
      name: 'S&P 500', fill: 'tozeroy',
      line: { color: COLORS.sp500, width: 2, dash: 'dash' }, fillcolor: COLORS.sp500Light,
      hovertemplate: 'S&P 500: %{y:.1f}%<extra></extra>',
    },
  ];

  const layout = {
    ...CHART_LAYOUT_BASE,
    xaxis: { gridcolor: '#f1f5f9', tickformat: '%b %Y' },
    yaxis: { gridcolor: '#f1f5f9', ticksuffix: '%', title: '', rangemode: 'nonpositive' },
    hovermode: 'x unified',
    legend: { orientation: 'h', y: -0.15, x: 0.5, xanchor: 'center' },
  };

  Plotly.newPlot('drawdown-chart', traces, layout, CHART_CONFIG);
}

/* --- Histogram: XBI-G vs Random Portfolios --- */
function renderHistogramChart() {
  const r = RESULTS.random_benchmark;
  if (!r || !r.histogram) return;

  const hist = r.histogram;
  const gsMean = RESULTS.primary.gs_mean;

  // Build bar chart from pre-computed histogram
  const binCenters = [];
  for (let i = 0; i < hist.counts.length; i++) {
    binCenters.push((hist.bin_edges[i] + hist.bin_edges[i + 1]) / 2);
  }

  const barColors = binCenters.map(c => c <= gsMean ? 'rgba(167, 139, 250, 0.6)' : 'rgba(167, 139, 250, 0.3)');

  const traces = [
    {
      x: binCenters,
      y: hist.counts,
      type: 'bar',
      name: 'Random portfolios',
      marker: { color: barColors, line: { color: 'rgba(167, 139, 250, 0.8)', width: 1 } },
      hovertemplate: 'Return: %{x:.0f}%<br>Count: %{y}<extra></extra>',
      width: (hist.bin_edges[1] - hist.bin_edges[0]) * 0.9,
    },
  ];

  const layout = {
    ...CHART_LAYOUT_BASE,
    xaxis: { gridcolor: '#f1f5f9', title: 'Portfolio Mean Return (%)', ticksuffix: '%' },
    yaxis: { gridcolor: '#f1f5f9', title: 'Count (of 10,000)' },
    showlegend: false,
    shapes: [
      {
        type: 'line', x0: gsMean, x1: gsMean, y0: 0, y1: 1, yref: 'paper',
        line: { color: COLORS.gs, width: 3 },
      },
    ],
    annotations: [
      {
        x: gsMean, y: 1, yref: 'paper',
        text: `XBI-G: ${gsMean >= 0 ? '+' : ''}${gsMean.toFixed(1)}%<br>(${r.gs_percentile_rank}th percentile)`,
        showarrow: true, arrowhead: 0, arrowcolor: COLORS.gs,
        ax: 60, ay: -30,
        font: { color: COLORS.gs, size: 12, weight: 700 },
        bgcolor: 'rgba(255,255,255,0.9)',
        bordercolor: COLORS.gs,
        borderwidth: 1,
        borderpad: 4,
      },
    ],
  };

  Plotly.newPlot('histogram-chart', traces, layout, CHART_CONFIG);
}

/* --- Scatter: Score vs Return --- */
function renderScatterChart() {
  const threshVal = 0.80;

  const groups = [
    { filter: c => c.is_gs && c.outcome === 'active', name: 'GS — Active', color: COLORS.gs, symbol: 'circle' },
    { filter: c => c.is_gs && c.outcome === 'acquired', name: 'GS — Acquired', color: COLORS.gs, symbol: 'diamond' },
    { filter: c => c.is_gs && c.outcome === 'bankrupt', name: 'GS — Bankrupt', color: COLORS.gs, symbol: 'x' },
    { filter: c => !c.is_gs && c.outcome === 'active', name: 'Non-GS — Active', color: COLORS.nongs, symbol: 'circle' },
    { filter: c => !c.is_gs && c.outcome === 'acquired', name: 'Non-GS — Acquired', color: COLORS.nongs, symbol: 'diamond' },
    { filter: c => !c.is_gs && c.outcome === 'bankrupt', name: 'Non-GS — Bankrupt', color: COLORS.nongs, symbol: 'x' },
  ];

  const traces = groups.map(g => {
    const cos = COMPANIES.filter(c => c.lead_score != null && g.filter(c));
    return {
      x: cos.map(c => c.lead_score),
      y: cos.map(c => c.return_pct),
      text: cos.map(c => `${c.ticker}: ${c.company}`),
      name: g.name,
      mode: 'markers',
      marker: { color: g.color, symbol: g.symbol, size: 8, opacity: 0.8,
                line: { color: 'white', width: 1 } },
      hovertemplate: '%{text}<br>Lead Score: %{x:.2f}<br>Return: %{y:.1f}%<extra></extra>',
    };
  }).filter(t => t.x.length > 0);

  // Companies with no lead_score at x=0
  const noScore = COMPANIES.filter(c => c.lead_score == null);
  if (noScore.length > 0) {
    traces.push({
      x: noScore.map(() => 0),
      y: noScore.map(c => c.return_pct),
      text: noScore.map(c => `${c.ticker}: ${c.company} (no scoreable programs)`),
      name: 'No Score',
      mode: 'markers',
      marker: { color: '#94a3b8', symbol: 'circle-open', size: 7, opacity: 0.5 },
      hovertemplate: '%{text}<br>Return: %{y:.1f}%<extra></extra>',
    });
  }

  const layout = {
    ...CHART_LAYOUT_BASE,
    xaxis: { gridcolor: '#f1f5f9', title: 'Lead Program Genetic Association Score', range: [-0.05, 1.1] },
    yaxis: { gridcolor: '#f1f5f9', title: 'Total Return (%)', ticksuffix: '%' },
    hovermode: 'closest',
    legend: { orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center', font: { size: 10 } },
    shapes: [
      {
        type: 'line', x0: -0.05, x1: 1.1, y0: 0, y1: 0,
        line: { color: '#cbd5e1', width: 1, dash: 'dot' },
      },
      {
        type: 'line', x0: threshVal, x1: threshVal, y0: 0, y1: 1, yref: 'paper',
        line: { color: '#dc2626', width: 1.5, dash: 'dash' },
      },
    ],
    annotations: [{
      x: threshVal, y: 1, yref: 'paper',
      text: 'Threshold: 0.80', showarrow: false,
      xanchor: 'left', xshift: 8,
      font: { color: '#dc2626', size: 10 },
    }],
  };

  Plotly.newPlot('scatter-chart', traces, layout, CHART_CONFIG);
}

/* --- Sensitivity: Threshold vs Alpha bar chart --- */
function renderSensitivityChart() {
  const data = RESULTS.sensitivity;
  if (!data || !data.length) return;

  const traces = [{
    x: data.map(d => '>' + d.threshold.toFixed(2)),
    y: data.map(d => d.alpha_pct),
    type: 'bar',
    marker: {
      color: data.map(d => d.alpha_pct >= 0 ? COLORS.gs : COLORS.nongs),
    },
    text: data.map(d => `MC: ${d.mc_percentile}%ile`),
    textposition: 'outside',
    textfont: { size: 11, color: '#475569' },
    hovertemplate: 'Threshold >%{x}<br>Alpha: %{y:+.1f}pp<br>N_GS: %{customdata[0]}<br>GS mean: %{customdata[1]:+.1f}%<br>MC percentile: %{customdata[2]}%<extra></extra>',
    customdata: data.map(d => [d.n_gs, d.gs_mean_pct, d.mc_percentile]),
  }];

  const layout = {
    ...CHART_LAYOUT_BASE,
    xaxis: { gridcolor: '#f1f5f9', title: 'Lead Program Score Threshold' },
    yaxis: { gridcolor: '#f1f5f9', title: 'Alpha (GS − non-GS, pp)', ticksuffix: 'pp' },
    showlegend: false,
    annotations: data.map(d => ({
      x: '>' + d.threshold.toFixed(2),
      y: d.alpha_pct,
      text: `n=${d.n_gs}`,
      showarrow: false,
      yshift: d.alpha_pct >= 0 ? -15 : 15,
      font: { size: 10, color: '#94a3b8' },
    })),
  };

  Plotly.newPlot('sensitivity-chart', traces, layout, CHART_CONFIG);
}

/* --- Restricted Universe: comparison table (rendered as chart) --- */
function renderRestrictedChart() {
  const r = RESULTS.restricted_universe;
  const p = RESULTS.primary;
  if (!r || !r.n_scoreable) return;

  const categories = ['Full Universe', 'Scoreable Only'];
  const traces = [
    {
      x: categories,
      y: [p.gs_mean, r.gs_mean_pct],
      name: 'GS',
      type: 'bar',
      marker: { color: COLORS.gs },
      error_y: {
        type: 'data', symmetric: false,
        array: [p.gs_ci_hi - p.gs_mean, r.gs_ci_hi - r.gs_mean_pct],
        arrayminus: [p.gs_mean - p.gs_ci_lo, r.gs_mean_pct - r.gs_ci_lo],
        color: '#64748b', thickness: 1.5,
      },
      text: [`n=${p.n_gs}`, `n=${r.n_gs}`],
      textposition: 'outside',
      hovertemplate: '%{x}<br>GS mean: %{y:+.1f}% (n=%{text})<extra></extra>',
    },
    {
      x: categories,
      y: [p.nongs_mean, r.nongs_mean_pct],
      name: 'Non-GS',
      type: 'bar',
      marker: { color: COLORS.nongs },
      error_y: {
        type: 'data', symmetric: false,
        array: [p.nongs_ci_hi - p.nongs_mean, r.nongs_ci_hi - r.nongs_mean_pct],
        arrayminus: [p.nongs_mean - p.nongs_ci_lo, r.nongs_mean_pct - r.nongs_ci_lo],
        color: '#64748b', thickness: 1.5,
      },
      text: [`n=${p.n_nongs}`, `n=${r.n_nongs}`],
      textposition: 'outside',
      hovertemplate: '%{x}<br>Non-GS mean: %{y:+.1f}% (n=%{text})<extra></extra>',
    },
  ];

  const fullAlpha = p.alpha_vs_nongs;
  const rAlpha = r.alpha_pct;

  const layout = {
    ...CHART_LAYOUT_BASE,
    barmode: 'group',
    yaxis: { gridcolor: '#f1f5f9', ticksuffix: '%', title: 'Mean Return' },
    xaxis: { gridcolor: '#f1f5f9' },
    legend: { orientation: 'h', y: -0.15, x: 0.5, xanchor: 'center' },
    annotations: [
      {
        x: 'Full Universe', y: Math.max(p.gs_ci_hi, p.nongs_ci_hi) + 20,
        text: `Alpha: ${fullAlpha >= 0 ? '+' : ''}${fullAlpha}pp`, showarrow: false,
        font: { color: COLORS.gs, size: 12, weight: 700 },
      },
      {
        x: 'Scoreable Only', y: Math.max(r.gs_ci_hi, r.nongs_ci_hi) + 20,
        text: `Alpha: ${rAlpha >= 0 ? '+' : ''}${rAlpha}pp<br>${r.exact_percentile}%ile (exact)`, showarrow: false,
        font: { color: COLORS.gs, size: 12, weight: 700 },
      },
    ],
  };

  Plotly.newPlot('restricted-chart', traces, layout, CHART_CONFIG);
}

/* --- Leave-One-Out Robustness --- */
function renderLOOChart() {
  const loo = RESULTS.leave_one_out;
  if (!loo || !loo.companies) return;

  const companies = loo.companies;
  const fullMean = loo.full_mean_pct;

  const tickers = companies.map(c => c.ticker);
  const means = companies.map(c => c.remaining_mean_pct);
  const colors = companies.map(c =>
    c.remaining_mean_pct >= fullMean ? 'rgba(5, 150, 105, 0.7)' : 'rgba(220, 38, 38, 0.7)'
  );

  const traces = [{
    y: tickers,
    x: means,
    type: 'bar',
    orientation: 'h',
    marker: { color: colors },
    text: companies.map(c => `Drop ${c.ticker} (${c.excluded_return_pct >= 0 ? '+' : ''}${c.excluded_return_pct.toFixed(0)}%): mean=${c.remaining_mean_pct >= 0 ? '+' : ''}${c.remaining_mean_pct.toFixed(1)}%, ${c.remaining_mc_percentile}%ile`),
    hovertemplate: '%{text}<extra></extra>',
  }];

  const layout = {
    ...CHART_LAYOUT_BASE,
    margin: { t: 20, r: 30, b: 50, l: 55 },
    xaxis: { gridcolor: '#f1f5f9', title: 'Portfolio Mean Return (%) with Company Excluded', ticksuffix: '%' },
    yaxis: { gridcolor: '#f1f5f9', autorange: 'reversed' },
    showlegend: false,
    shapes: [{
      type: 'line', x0: fullMean, x1: fullMean, y0: -0.5, y1: tickers.length - 0.5,
      line: { color: COLORS.gs, width: 2, dash: 'dash' },
    }],
    annotations: [{
      x: fullMean, y: -0.8, yref: 'y',
      text: `Full: ${fullMean >= 0 ? '+' : ''}${fullMean.toFixed(1)}%`,
      showarrow: false, xanchor: 'center', yanchor: 'top', yshift: -8,
      font: { color: COLORS.gs, size: 11, weight: 600 },
    }],
  };

  Plotly.newPlot('loo-chart', traces, layout, CHART_CONFIG);
}

/* --- Render All --- */
function renderAllCharts() {
  renderNAVChart();
  renderDrawdownChart();
  renderHistogramChart();
  renderScatterChart();
  renderRestrictedChart();
  renderLOOChart();
}
