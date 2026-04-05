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
  const b = RESULTS.benchmarks;
  const r = RESULTS.random_benchmark;
  const container = document.getElementById('metric-cards');

  const fmtRet = (v) => v >= 0 ? `+${v.toFixed(1)}%` : `${v.toFixed(1)}%`;
  const ru = RESULTS.restricted_universe || {};

  // Compute max drawdowns from quarterly data
  let gsMaxDD = 0, nongsMaxDD = 0, xbiMaxDD = 0;
  QUARTERLY.forEach(q => {
    if (q.gs_dd != null && q.gs_dd < gsMaxDD) gsMaxDD = q.gs_dd;
    if (q.nongs_dd != null && q.nongs_dd < nongsMaxDD) nongsMaxDD = q.nongs_dd;
    if (q.xbi_dd != null && q.xbi_dd < xbiMaxDD) xbiMaxDD = q.xbi_dd;
  });

  const ruAlpha = ru.alpha_pct || 0;
  const ruPctile = ru.exact_percentile || 0;

  const cards = [
    {
      value: `${ruAlpha >= 0 ? '+' : ''}${ruAlpha.toFixed(0)}pp`,
      label: `Alpha (Scoreable) <span class="th-tip" data-tip="We tested every possible way to pick ${ru.n_gs} companies from the ${ru.n_gs + ru.n_nongs} scoreable ones (${(ru.total_combinations || 0).toLocaleString()} ways), and XBI-G's return beat ${ruPctile}% of them.">?</span>`,
      detail: `GS vs scored-non-GS (${ru.n_gs || 0} vs ${ru.n_nongs || 0} companies)<br>${ruPctile}th percentile`,
      cls: ruAlpha >= 0 ? 'blue' : 'amber', positive: ruAlpha >= 0
    },
    {
      value: fmtRet(p.gs_mean),
      label: 'XBI-G Mean Return',
      detail: `95% CI: [${fmtRet(p.gs_ci_lo)}, ${fmtRet(p.gs_ci_hi)}]<br>Median: ${fmtRet(p.gs_median)} &middot; n=${p.n_gs}`,
      cls: 'blue', positive: p.gs_mean >= 0
    },
    {
      value: `${p.alpha_vs_nongs >= 0 ? '+' : ''}${p.alpha_vs_nongs}pp`,
      label: 'Alpha (Full Universe)',
      detail: `GS vs all non-GS (${p.n_gs} vs ${p.n_nongs})<br>Beats ${r.gs_percentile_rank}% of ${r.n_draws.toLocaleString()} random portfolios`,
      cls: p.alpha_vs_nongs >= 0 ? 'blue' : 'amber', positive: p.alpha_vs_nongs >= 0
    },
    {
      value: fmtRet(b.XBI_return_pct),
      label: 'XBI ETF Return',
      detail: `Single fund &mdash; not a sample mean<br>Universe median: ${fmtRet(b.all_universe_median_pct)}`,
      cls: '', positive: b.XBI_return_pct >= 0
    },
    {
      value: `${gsMaxDD.toFixed(1)}%`,
      label: 'GS Max Drawdown',
      detail: `vs non-GS: ${nongsMaxDD.toFixed(1)}% &middot; XBI: ${xbiMaxDD.toFixed(1)}%`,
      cls: 'green', positive: false
    }
  ];

  container.innerHTML = cards.map(c => `
    <div class="metric-card ${c.cls}">
      <div class="value ${c.positive ? 'positive' : ''}">${c.value}</div>
      <div class="label">${c.label}</div>
      <div class="detail">${c.detail}</div>
    </div>
  `).join('') + `<p class="metric-footnote">*GS (genetically-supported): lead program's OT 20.02 genetic association score &gt; 0.80. Scoreable alpha compares the ${ru.n_gs + ru.n_nongs} companies with OT 20.02 scores.</p>`;
}

/* --- Results Table --- */
function renderResultsTable() {
  const p = RESULTS.primary;
  const b = RESULTS.benchmarks;
  const r = RESULTS.random_benchmark;
  const table = document.getElementById('results-table');

  const fmt = (v) => v != null ? (v >= 0 ? '+' + v.toFixed(1) + '%' : v.toFixed(1) + '%') : '—';
  const fmtD = (v) => v != null ? '$' + v.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '—';

  const ru = RESULTS.restricted_universe || {};

  table.innerHTML = `
    <thead>
      <tr>
        <th></th>
        <th colspan="3" class="th-group">Scoreable Universe (${ru.n_gs + ru.n_nongs} companies)</th>
        <th colspan="3" class="th-group">Full Universe (${p.n_gs + p.n_nongs} companies)</th>
      </tr>
      <tr>
        <th></th>
        <th>XBI-G</th>
        <th>Scored non-GS</th>
        <th>XBI ETF</th>
        <th>XBI-G</th>
        <th>All non-GS</th>
        <th>XBI ETF</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="row-label">n</td>
        <td>${ru.n_gs || '—'}</td>
        <td>${ru.n_nongs || '—'}</td>
        <td>—</td>
        <td>${p.n_gs}</td>
        <td>${p.n_nongs}</td>
        <td>—</td>
      </tr>
      <tr>
        <td class="row-label">Mean return</td>
        <td>${fmt(ru.gs_mean_pct)}</td>
        <td>${fmt(ru.nongs_mean_pct)}</td>
        <td>${fmt(b.XBI_return_pct)}</td>
        <td>${fmt(p.gs_mean)}</td>
        <td>${fmt(p.nongs_mean)}</td>
        <td>${fmt(b.XBI_return_pct)}</td>
      </tr>
      <tr>
        <td class="row-label">Median return</td>
        <td>${fmt(ru.gs_median_pct)}</td>
        <td>${fmt(ru.nongs_median_pct)}</td>
        <td>—</td>
        <td>${fmt(p.gs_median)}</td>
        <td>${fmt(p.nongs_median)}</td>
        <td>—</td>
      </tr>
      <tr>
        <td class="row-label">95% CI</td>
        <td>[${fmt(ru.gs_ci_lo)}, ${fmt(ru.gs_ci_hi)}]</td>
        <td>[${fmt(ru.nongs_ci_lo)}, ${fmt(ru.nongs_ci_hi)}]</td>
        <td>—</td>
        <td>[${fmt(p.gs_ci_lo)}, ${fmt(p.gs_ci_hi)}]</td>
        <td>[${fmt(p.nongs_ci_lo)}, ${fmt(p.nongs_ci_hi)}]</td>
        <td>—</td>
      </tr>
      <tr>
        <td class="row-label">Alpha</td>
        <td colspan="2" style="text-align:center;font-weight:600;color:var(--blue)">${fmt(ru.alpha_pct)} (exact ${ru.exact_percentile}th %ile)</td>
        <td>—</td>
        <td colspan="2" style="text-align:center;font-weight:600">${fmt(p.alpha_vs_nongs)} (${r.gs_percentile_rank}th %ile)</td>
        <td>—</td>
      </tr>
      <tr>
        <td class="row-label">$1,000 &rarr;</td>
        <td>${fmtD(1000 * (1 + (ru.gs_mean_pct || 0) / 100))}</td>
        <td>${fmtD(1000 * (1 + (ru.nongs_mean_pct || 0) / 100))}</td>
        <td>${fmtD(b.XBI_dollar_1000)}</td>
        <td>${fmtD(p.gs_dollar)}</td>
        <td>${fmtD(p.nongs_dollar)}</td>
        <td>${fmtD(b.XBI_dollar_1000)}</td>
      </tr>
    </tbody>
  `;
}

/* --- Tooltips --- */
function initTooltips() {
  let popup = null;
  document.addEventListener('mouseover', (e) => {
    const tip = e.target.closest('.th-tip');
    if (!tip) return;
    const text = tip.getAttribute('data-tip');
    if (!text) return;
    popup = document.createElement('div');
    popup.className = 'tooltip-popup';
    popup.textContent = text;
    document.body.appendChild(popup);
    const rect = tip.getBoundingClientRect();
    popup.style.top = (rect.bottom + 6) + 'px';
    popup.style.left = (rect.left + rect.width / 2 - 110) + 'px';
  });
  document.addEventListener('mouseout', (e) => {
    const tip = e.target.closest('.th-tip');
    if (tip && popup) {
      popup.remove();
      popup = null;
    }
  });
}

/* --- Init --- */
document.addEventListener('DOMContentLoaded', () => {
  // Set random N in subtitle
  const randomN = document.getElementById('random-n');
  if (randomN && RESULTS.random_benchmark) {
    randomN.textContent = RESULTS.random_benchmark.draw_size;
  }

  initNav();
  renderMetricCards();
  renderResultsTable();
  renderAllCharts();
  initCompanyTable();
  initTooltips();
});
