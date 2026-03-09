/**
 * charts.js — All Plotly chart rendering functions
 */

const COLORS = {
  gs: '#1a56db',
  nongs: '#d97706',
  xbi: '#6b7280',
  sp500: '#0d9488',
  gsLight: 'rgba(26, 86, 219, 0.1)',
  nongsLight: 'rgba(217, 119, 6, 0.1)',
  xbiLight: 'rgba(107, 114, 128, 0.1)',
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

/* --- NAV Chart --- */
function renderNAVChart() {
  const dates = QUARTERLY.map(q => q.date);
  const traces = [
    {
      x: dates, y: QUARTERLY.map(q => q.gs),
      name: 'XBI-G (GS)', line: { color: COLORS.gs, width: 3 },
      hovertemplate: 'XBI-G: $%{y:,.0f}<extra></extra>',
    },
    {
      x: dates, y: QUARTERLY.map(q => q.nongs),
      name: 'XBI-nonG', line: { color: COLORS.nongs, width: 3 },
      hovertemplate: 'XBI-nonG: $%{y:,.0f}<extra></extra>',
    },
    {
      x: dates, y: QUARTERLY.map(q => q.xbi),
      name: 'XBI ETF', line: { color: COLORS.xbi, width: 2, dash: 'dash' },
      hovertemplate: 'XBI ETF: $%{y:,.0f}<extra></extra>',
    },
    {
      x: dates, y: QUARTERLY.map(q => q.sp500),
      name: 'S&P 500', line: { color: COLORS.sp500, width: 2, dash: 'dash' },
      hovertemplate: 'S&P 500: $%{y:,.0f}<extra></extra>',
    },
  ];

  const lastQ = QUARTERLY[QUARTERLY.length - 1];
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
  const dates = QUARTERLY.map(q => q.date);
  const traces = [
    {
      x: dates, y: QUARTERLY.map(q => q.gs_dd),
      name: 'XBI-G (GS)', fill: 'tozeroy',
      line: { color: COLORS.gs, width: 2 }, fillcolor: COLORS.gsLight,
      hovertemplate: 'GS: %{y:.1f}%<extra></extra>',
    },
    {
      x: dates, y: QUARTERLY.map(q => q.nongs_dd),
      name: 'XBI-nonG', fill: 'tozeroy',
      line: { color: COLORS.nongs, width: 2 }, fillcolor: COLORS.nongsLight,
      hovertemplate: 'Non-GS: %{y:.1f}%<extra></extra>',
    },
    {
      x: dates, y: QUARTERLY.map(q => q.xbi_dd),
      name: 'XBI ETF', fill: 'tozeroy',
      line: { color: COLORS.xbi, width: 2, dash: 'dash' }, fillcolor: COLORS.xbiLight,
      hovertemplate: 'XBI: %{y:.1f}%<extra></extra>',
    },
  ];

  // Find max drawdown points for annotations
  const annotations = [];
  const portfolios = [
    { key: 'gs_dd', name: 'GS', color: COLORS.gs },
    { key: 'nongs_dd', name: 'Non-GS', color: COLORS.nongs },
    { key: 'xbi_dd', name: 'XBI', color: COLORS.xbi },
  ];
  portfolios.forEach(p => {
    let minVal = 0, minIdx = 0;
    QUARTERLY.forEach((q, i) => {
      if (q[p.key] < minVal) { minVal = q[p.key]; minIdx = i; }
    });
    if (minVal < 0) {
      annotations.push({
        x: QUARTERLY[minIdx].date, y: minVal,
        text: `${p.name}: ${minVal.toFixed(1)}%`,
        showarrow: true, arrowhead: 0, arrowcolor: p.color,
        font: { color: p.color, size: 10, weight: 600 },
        ax: 0, ay: -25,
      });
    }
  });

  const layout = {
    ...CHART_LAYOUT_BASE,
    xaxis: { gridcolor: '#f1f5f9', tickformat: '%b %Y' },
    yaxis: { gridcolor: '#f1f5f9', ticksuffix: '%', title: '', rangemode: 'nonpositive' },
    hovermode: 'x unified',
    legend: { orientation: 'h', y: -0.15, x: 0.5, xanchor: 'center' },
    annotations: annotations,
  };

  Plotly.newPlot('drawdown-chart', traces, layout, CHART_CONFIG);
}

/* --- Scatter: Score vs Return --- */
function renderScatterChart() {
  // Group by GS status and outcome for legend
  const groups = [
    { filter: c => c.is_gs_a && c.outcome === 'active', name: 'GS — Active', color: COLORS.gs, symbol: 'circle' },
    { filter: c => c.is_gs_a && c.outcome === 'acquired', name: 'GS — Acquired', color: COLORS.gs, symbol: 'diamond' },
    { filter: c => c.is_gs_a && c.outcome === 'bankrupt', name: 'GS — Bankrupt', color: COLORS.gs, symbol: 'x' },
    { filter: c => !c.is_gs_a && c.outcome === 'active', name: 'Non-GS — Active', color: COLORS.nongs, symbol: 'circle' },
    { filter: c => !c.is_gs_a && c.outcome === 'acquired', name: 'Non-GS — Acquired', color: COLORS.nongs, symbol: 'diamond' },
    { filter: c => !c.is_gs_a && c.outcome === 'bankrupt', name: 'Non-GS — Bankrupt', color: COLORS.nongs, symbol: 'x' },
  ];

  const traces = groups.map(g => {
    const cos = COMPANIES.filter(c => c.best_score != null && g.filter(c));
    return {
      x: cos.map(c => c.best_score),
      y: cos.map(c => c.return_pct),
      text: cos.map(c => `${c.ticker}: ${c.company}`),
      name: g.name,
      mode: 'markers',
      marker: { color: g.color, symbol: g.symbol, size: 8, opacity: 0.8,
                line: { color: 'white', width: 1 } },
      hovertemplate: '%{text}<br>Score: %{x:.2f}<br>Return: %{y:.1f}%<extra></extra>',
    };
  }).filter(t => t.x.length > 0);

  const layout = {
    ...CHART_LAYOUT_BASE,
    xaxis: { gridcolor: '#f1f5f9', title: 'Best Genetic Association Score', range: [0, 1.05] },
    yaxis: { gridcolor: '#f1f5f9', title: 'Total Return (%)', ticksuffix: '%' },
    hovermode: 'closest',
    legend: { orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center', font: { size: 10 } },
    shapes: [{
      type: 'line', x0: 0, x1: 1.05, y0: 0, y1: 0,
      line: { color: '#cbd5e1', width: 1, dash: 'dot' },
    }],
  };

  Plotly.newPlot('scatter-chart', traces, layout, CHART_CONFIG);
}

/* --- Mendelian Evidence Chart --- */
function renderMendelianChart() {
  const p = RESULTS.primary;
  const m = RESULTS.mendelian;

  const traces = [
    {
      x: ['All GS-A', 'Mendelian Only'],
      y: [p.gs_mean, m.gs_mean],
      name: 'GS',
      type: 'bar',
      marker: { color: COLORS.gs },
      error_y: {
        type: 'data', symmetric: false,
        array: [p.gs_ci_hi - p.gs_mean, m.gs_ci_hi - m.gs_mean],
        arrayminus: [p.gs_mean - p.gs_ci_lo, m.gs_mean - m.gs_ci_lo],
        color: '#64748b', thickness: 1.5,
      },
      text: [`n=${p.n_gs}`, `n=${m.n_gs}`],
      textposition: 'outside',
      hovertemplate: '%{x}: %{y:.1f}% (n=%{text})<extra>GS</extra>',
    },
    {
      x: ['All GS-A', 'Mendelian Only'],
      y: [p.nongs_mean, m.nongs_mean],
      name: 'Non-GS',
      type: 'bar',
      marker: { color: COLORS.nongs },
      error_y: {
        type: 'data', symmetric: false,
        array: [p.nongs_ci_hi - p.nongs_mean, m.nongs_ci_hi - m.nongs_mean],
        arrayminus: [p.nongs_mean - p.nongs_ci_lo, m.nongs_mean - m.nongs_ci_lo],
        color: '#64748b', thickness: 1.5,
      },
      text: [`n=${p.n_nongs}`, `n=${m.n_nongs}`],
      textposition: 'outside',
      hovertemplate: '%{x}: %{y:.1f}% (n=%{text})<extra>Non-GS</extra>',
    },
  ];

  const layout = {
    ...CHART_LAYOUT_BASE,
    barmode: 'group',
    yaxis: { gridcolor: '#f1f5f9', ticksuffix: '%', title: 'Mean Return' },
    xaxis: { gridcolor: '#f1f5f9' },
    legend: { orientation: 'h', y: -0.15, x: 0.5, xanchor: 'center' },
    annotations: [
      { x: 'All GS-A', y: Math.max(p.gs_ci_hi, p.nongs_ci_hi) + 15,
        text: `Alpha: +${p.alpha_vs_nongs}pp`, showarrow: false,
        font: { color: COLORS.gs, size: 12, weight: 700 } },
      { x: 'Mendelian Only', y: Math.max(m.gs_ci_hi, m.nongs_ci_hi) + 15,
        text: `Alpha: +${m.alpha}pp`, showarrow: false,
        font: { color: COLORS.gs, size: 12, weight: 700 } },
    ],
  };

  Plotly.newPlot('mendelian-chart', traces, layout, CHART_CONFIG);
}

/* --- Proportion Threshold Chart --- */
function renderProportionChart() {
  const data = RESULTS.sensitivity_proportion;

  const traces = [
    {
      x: data.map(d => '≥' + d.label),
      y: data.map(d => d.gs_mean),
      name: 'GS',
      type: 'bar',
      marker: { color: COLORS.gs },
      error_y: {
        type: 'data', symmetric: false,
        array: data.map(d => d.gs_ci_hi - d.gs_mean),
        arrayminus: data.map(d => d.gs_mean - d.gs_ci_lo),
        color: '#64748b', thickness: 1.5,
      },
      text: data.map(d => `n=${d.n_gs}`),
      textposition: 'outside',
      hovertemplate: '%{x}: %{y:.1f}% (n=%{text})<extra>GS</extra>',
    },
    {
      x: data.map(d => '≥' + d.label),
      y: data.map(d => d.nongs_mean),
      name: 'Non-GS',
      type: 'bar',
      marker: { color: COLORS.nongs },
      text: data.map(d => `n=${d.n_nongs}`),
      textposition: 'outside',
      hovertemplate: '%{x}: %{y:.1f}% (n=%{text})<extra>Non-GS</extra>',
    },
  ];

  const layout = {
    ...CHART_LAYOUT_BASE,
    barmode: 'group',
    yaxis: { gridcolor: '#f1f5f9', ticksuffix: '%', title: 'Mean Return' },
    xaxis: { gridcolor: '#f1f5f9', title: 'Pipeline Proportion Threshold' },
    legend: { orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center' },
    annotations: data.map((d, i) => ({
      x: '≥' + d.label,
      y: Math.max(d.gs_ci_hi || d.gs_mean, d.nongs_mean) + 15,
      text: `${d.alpha >= 0 ? '+' : ''}${d.alpha.toFixed(1)}pp`,
      showarrow: false,
      font: { color: d.alpha >= 0 ? COLORS.gs : '#dc2626', size: 11, weight: 700 },
    })),
  };

  Plotly.newPlot('proportion-chart', traces, layout, CHART_CONFIG);
}

/* --- Render All --- */
function renderAllCharts() {
  renderNAVChart();
  renderDrawdownChart();
  renderScatterChart();
  renderMendelianChart();
  renderProportionChart();
}
