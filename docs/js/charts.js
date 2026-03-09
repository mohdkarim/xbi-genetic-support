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
  sp500Light: 'rgba(13, 148, 136, 0.1)',
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

let currentThreshold = '0.10';

/* --- Threshold Toggle for Performance Charts --- */
function initThresholdToggle() {
  const btns = document.querySelectorAll('.threshold-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentThreshold = btn.dataset.threshold;
      renderNAVChart();
      renderDrawdownChart();
    });
  });
}

/* --- NAV Chart --- */
function renderNAVChart() {
  const data = QUARTERLY[currentThreshold];
  if (!data) return;

  const dates = data.map(q => q.date);
  const traces = [
    {
      x: dates, y: data.map(q => q.gs),
      name: 'GS Portfolio', line: { color: COLORS.gs, width: 3 },
      hovertemplate: 'GS: $%{y:,.0f}<extra></extra>',
    },
    {
      x: dates, y: data.map(q => q.nongs),
      name: 'Non-GS Portfolio', line: { color: COLORS.nongs, width: 3 },
      hovertemplate: 'Non-GS: $%{y:,.0f}<extra></extra>',
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
  const data = QUARTERLY[currentThreshold];
  if (!data) return;

  const dates = data.map(q => q.date);
  const traces = [
    {
      x: dates, y: data.map(q => q.gs_dd),
      name: 'GS Portfolio', fill: 'tozeroy',
      line: { color: COLORS.gs, width: 2 }, fillcolor: COLORS.gsLight,
      hovertemplate: 'GS: %{y:.1f}%<extra></extra>',
    },
    {
      x: dates, y: data.map(q => q.nongs_dd),
      name: 'Non-GS Portfolio', fill: 'tozeroy',
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

  const annotations = [];
  const portfolios = [
    { key: 'gs_dd', name: 'GS', color: COLORS.gs },
    { key: 'nongs_dd', name: 'Non-GS', color: COLORS.nongs },
    { key: 'xbi_dd', name: 'XBI', color: COLORS.xbi },
    { key: 'sp500_dd', name: 'S&P 500', color: COLORS.sp500 },
  ];
  portfolios.forEach(p => {
    let minVal = 0, minIdx = 0;
    data.forEach((q, i) => {
      if (q[p.key] < minVal) { minVal = q[p.key]; minIdx = i; }
    });
    if (minVal < 0) {
      annotations.push({
        x: data[minIdx].date, y: minVal,
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
function renderScatterChart(threshold) {
  threshold = threshold || '0.10';
  const threshVal = parseFloat(threshold);

  const groups = [
    { filter: c => c.lead_score > threshVal && c.outcome === 'active', name: 'GS — Active', color: COLORS.gs, symbol: 'circle' },
    { filter: c => c.lead_score > threshVal && c.outcome === 'acquired', name: 'GS — Acquired', color: COLORS.gs, symbol: 'diamond' },
    { filter: c => c.lead_score > threshVal && c.outcome === 'bankrupt', name: 'GS — Bankrupt', color: COLORS.gs, symbol: 'x' },
    { filter: c => (c.lead_score == null || c.lead_score <= threshVal) && c.outcome === 'active', name: 'Non-GS — Active', color: COLORS.nongs, symbol: 'circle' },
    { filter: c => (c.lead_score == null || c.lead_score <= threshVal) && c.outcome === 'acquired', name: 'Non-GS — Acquired', color: COLORS.nongs, symbol: 'diamond' },
    { filter: c => (c.lead_score == null || c.lead_score <= threshVal) && c.outcome === 'bankrupt', name: 'Non-GS — Bankrupt', color: COLORS.nongs, symbol: 'x' },
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

  // Show companies with no lead_score at x=0
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
        type: 'line', x0: threshVal, x1: threshVal, y0: 0, y1: 1,
        yref: 'paper',
        line: { color: '#dc2626', width: 1.5, dash: 'dash' },
      },
    ],
    annotations: [{
      x: threshVal, y: 1, yref: 'paper',
      text: `Threshold: ${threshold}`, showarrow: false,
      xanchor: 'left', xshift: 8,
      font: { color: '#dc2626', size: 10 },
    }],
  };

  Plotly.newPlot('scatter-chart', traces, layout, CHART_CONFIG);
}

function initScatterDropdown() {
  const dropdown = document.getElementById('scatter-threshold');
  if (dropdown) {
    dropdown.addEventListener('change', () => {
      renderScatterChart(dropdown.value);
    });
  }
}

/* --- Mendelian Evidence Chart --- */
function renderMendelianChart() {
  const p = RESULTS.primary;
  const m = RESULTS.mendelian;
  const xbiReturn = RESULTS.benchmarks.XBI_return_pct;

  const traces = [
    {
      x: ['All GS', 'Mendelian Only'],
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
      x: ['All GS', 'Mendelian Only'],
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
    {
      x: ['All GS', 'Mendelian Only'],
      y: [xbiReturn, xbiReturn],
      name: 'XBI ETF',
      type: 'bar',
      marker: { color: COLORS.xbi },
      hovertemplate: 'XBI ETF: %{y:.1f}%<extra></extra>',
    },
  ];

  const layout = {
    ...CHART_LAYOUT_BASE,
    barmode: 'group',
    yaxis: { gridcolor: '#f1f5f9', ticksuffix: '%', title: 'Mean Return' },
    xaxis: { gridcolor: '#f1f5f9' },
    legend: { orientation: 'h', y: -0.15, x: 0.5, xanchor: 'center' },
    annotations: [
      { x: 'All GS', y: Math.max(p.gs_ci_hi, p.nongs_ci_hi) + 15,
        text: `Alpha: +${p.alpha_vs_nongs}pp`, showarrow: false,
        font: { color: COLORS.gs, size: 12, weight: 700 } },
      { x: 'Mendelian Only', y: Math.max(m.gs_ci_hi, m.nongs_ci_hi) + 15,
        text: `Alpha: +${m.alpha}pp`, showarrow: false,
        font: { color: COLORS.gs, size: 12, weight: 700 } },
    ],
  };

  Plotly.newPlot('mendelian-chart', traces, layout, CHART_CONFIG);
}

/* --- Score Threshold Sensitivity Chart --- */
function renderThresholdChart() {
  const data = RESULTS.sensitivity;
  const xbiReturn = RESULTS.benchmarks.XBI_return_pct;

  const traces = [
    {
      x: data.map(d => '>' + d.label),
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
      x: data.map(d => '>' + d.label),
      y: data.map(d => d.nongs_mean),
      name: 'Non-GS',
      type: 'bar',
      marker: { color: COLORS.nongs },
      text: data.map(d => `n=${d.n_nongs}`),
      textposition: 'outside',
      hovertemplate: '%{x}: %{y:.1f}% (n=%{text})<extra>Non-GS</extra>',
    },
    {
      x: data.map(d => '>' + d.label),
      y: data.map(() => xbiReturn),
      name: 'XBI ETF',
      type: 'bar',
      marker: { color: COLORS.xbi },
      hovertemplate: 'XBI ETF: %{y:.1f}%<extra></extra>',
    },
  ];

  const layout = {
    ...CHART_LAYOUT_BASE,
    barmode: 'group',
    yaxis: { gridcolor: '#f1f5f9', ticksuffix: '%', title: 'Mean Return' },
    xaxis: { gridcolor: '#f1f5f9', title: 'Lead Program Score Threshold' },
    legend: { orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center' },
    annotations: data.map(d => ({
      x: '>' + d.label,
      y: Math.max(d.gs_ci_hi || d.gs_mean, d.nongs_mean) + 15,
      text: `${d.alpha >= 0 ? '+' : ''}${d.alpha.toFixed(1)}pp`,
      showarrow: false,
      font: { color: d.alpha >= 0 ? COLORS.gs : '#dc2626', size: 11, weight: 700 },
    })),
  };

  Plotly.newPlot('threshold-chart', traces, layout, CHART_CONFIG);
}

/* --- Render All --- */
function renderAllCharts() {
  initThresholdToggle();
  initScatterDropdown();
  renderNAVChart();
  renderDrawdownChart();
  renderScatterChart('0.10');
  renderMendelianChart();
  renderThresholdChart();
}
