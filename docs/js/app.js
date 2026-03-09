/**
 * app.js — Navigation, metric cards, results table, initialization
 */

/* --- Navigation scroll highlighting --- */
function initNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-80px 0px -60% 0px' });

  sections.forEach(section => observer.observe(section));
}

/* --- Metric Cards --- */
function renderMetricCards() {
  const p = RESULTS.primary;
  const container = document.getElementById('metric-cards');

  const cards = [
    {
      value: `+${p.alpha_vs_xbi}pp`,
      label: 'Alpha vs XBI',
      detail: `GS outperformance over XBI ETF benchmark`,
      cls: 'blue', positive: true
    },
    {
      value: `+${p.gs_mean.toFixed(1)}%`,
      label: 'GS Mean Return',
      detail: `95% CI: [${p.gs_ci_lo.toFixed(1)}%, ${p.gs_ci_hi.toFixed(1)}%]`,
      cls: 'blue', positive: true
    },
    {
      value: `+${p.nongs_mean.toFixed(1)}%`,
      label: 'Non-GS Mean Return',
      detail: `95% CI: [${p.nongs_ci_lo.toFixed(1)}%, ${p.nongs_ci_hi.toFixed(1)}%]`,
      cls: 'amber', positive: true
    },
    {
      value: '-19.6%',
      label: 'GS Max Drawdown',
      detail: `vs non-GS: -42.6% &middot; XBI: -48.1%`,
      cls: 'green', positive: false
    }
  ];

  container.innerHTML = cards.map(c => `
    <div class="metric-card ${c.cls}">
      <div class="value ${c.positive ? 'positive' : ''}">${c.value}</div>
      <div class="label">${c.label}</div>
      <div class="detail">${c.detail}</div>
    </div>
  `).join('');
}

/* --- Results Table --- */
function renderResultsTable() {
  const p = RESULTS.primary;
  const b = RESULTS.benchmarks;
  const table = document.getElementById('results-table');

  const fmt = (v) => v != null ? (v >= 0 ? '+' + v.toFixed(1) + '%' : v.toFixed(1) + '%') : '—';
  const fmtD = (v) => v != null ? '$' + v.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '—';

  table.innerHTML = `
    <thead>
      <tr>
        <th></th>
        <th>XBI-G (GS)</th>
        <th>XBI-nonG</th>
        <th>XBI ETF</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="row-label">n</td>
        <td>${p.n_gs}</td>
        <td>${p.n_nongs}</td>
        <td>—</td>
      </tr>
      <tr>
        <td class="row-label">Mean return</td>
        <td>${fmt(p.gs_mean)}</td>
        <td>${fmt(p.nongs_mean)}</td>
        <td>${fmt(b.XBI_return_pct)}</td>
      </tr>
      <tr>
        <td class="row-label">95% CI</td>
        <td>[${fmt(p.gs_ci_lo)}, ${fmt(p.gs_ci_hi)}]</td>
        <td>[${fmt(p.nongs_ci_lo)}, ${fmt(p.nongs_ci_hi)}]</td>
        <td>—</td>
      </tr>
      <tr>
        <td class="row-label">Median return</td>
        <td>${fmt(p.gs_median)}</td>
        <td>${fmt(p.nongs_median)}</td>
        <td>—</td>
      </tr>
      <tr>
        <td class="row-label">$1,000 &rarr;</td>
        <td>${fmtD(p.gs_dollar)}</td>
        <td>${fmtD(p.nongs_dollar)}</td>
        <td>${fmtD(b.XBI_dollar_1000)}</td>
      </tr>
    </tbody>
  `;
}

/* --- Init --- */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  renderMetricCards();
  renderResultsTable();
  renderAllCharts();
  initCompanyTable();
});
