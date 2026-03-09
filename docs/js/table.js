/**
 * table.js — Company table sort, filter, and rendering
 */

let currentSort = { key: 'return_pct', dir: 'desc' };
let filteredCompanies = [...COMPANIES];

function getFilteredCompanies() {
  const gsFilter = document.getElementById('filter-gs').value;
  const outcomeFilter = document.getElementById('filter-outcome').value;
  const oncologyFilter = document.getElementById('filter-oncology').value;
  const search = document.getElementById('filter-search').value.toLowerCase().trim();

  return COMPANIES.filter(c => {
    if (gsFilter === 'gs' && !c.is_gs_a) return false;
    if (gsFilter === 'nongs' && c.is_gs_a) return false;
    if (gsFilter === 'mendelian' && !c.mendelian_only) return false;
    if (outcomeFilter !== 'all' && c.outcome !== outcomeFilter) return false;
    if (oncologyFilter === 'oncology' && !c.is_oncology) return false;
    if (oncologyFilter === 'non-oncology' && c.is_oncology) return false;
    if (search && !c.ticker.toLowerCase().includes(search) && !c.company.toLowerCase().includes(search)) return false;
    return true;
  });
}

function sortCompanies(companies) {
  const { key, dir } = currentSort;
  const mult = dir === 'asc' ? 1 : -1;

  return [...companies].sort((a, b) => {
    let va = a[key], vb = b[key];
    // Handle nulls — push to end
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    // Booleans
    if (typeof va === 'boolean') { va = va ? 1 : 0; vb = vb ? 1 : 0; }
    // Strings
    if (typeof va === 'string') return mult * va.localeCompare(vb);
    // Numbers
    return mult * (va - vb);
  });
}

function renderTableBody() {
  filteredCompanies = sortCompanies(getFilteredCompanies());
  const tbody = document.getElementById('company-tbody');

  const fmt = (v) => {
    if (v == null) return '<span class="dash">—</span>';
    const cls = v >= 0 ? 'return-pos' : 'return-neg';
    const sign = v >= 0 ? '+' : '';
    return `<span class="${cls}">${sign}${v.toFixed(1)}%</span>`;
  };

  const fmtScore = (v) => v != null ? v.toFixed(2) : '<span class="dash">—</span>';

  const badge = (outcome) => {
    const cls = { active: 'badge-active', acquired: 'badge-acquired', bankrupt: 'badge-bankrupt' };
    return `<span class="badge ${cls[outcome] || ''}">${outcome}</span>`;
  };

  tbody.innerHTML = filteredCompanies.map(c => `
    <tr>
      <td class="ticker">${c.ticker}</td>
      <td>${c.company}</td>
      <td>${fmt(c.return_pct)}</td>
      <td>${c.is_gs_a ? '<span class="check">&#10003;</span>' : '<span class="dash">—</span>'}</td>
      <td>${fmtScore(c.best_score)}</td>
      <td>${c.n_gs}/${c.n_scoreable}</td>
      <td>${badge(c.outcome)}</td>
      <td>${c.is_oncology ? '<span class="check">&#10003;</span>' : '<span class="dash">—</span>'}</td>
    </tr>
  `).join('');

  document.getElementById('filter-count').textContent =
    `Showing ${filteredCompanies.length} of ${COMPANIES.length}`;
}

function initSortHeaders() {
  document.querySelectorAll('.company-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (currentSort.key === key) {
        currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
      } else {
        currentSort = { key, dir: key === 'ticker' || key === 'company' || key === 'outcome' ? 'asc' : 'desc' };
      }

      // Update arrow indicators
      document.querySelectorAll('.company-table th .sort-arrow').forEach(a => a.textContent = '');
      th.querySelector('.sort-arrow').textContent = currentSort.dir === 'asc' ? '▲' : '▼';

      renderTableBody();
    });
  });
}

function initFilters() {
  ['filter-gs', 'filter-outcome', 'filter-oncology'].forEach(id => {
    document.getElementById(id).addEventListener('change', renderTableBody);
  });
  document.getElementById('filter-search').addEventListener('input', renderTableBody);
}

function initCompanyTable() {
  initSortHeaders();
  initFilters();

  // Set initial sort arrow
  const returnTh = document.querySelector('.company-table th[data-sort="return_pct"]');
  if (returnTh) returnTh.querySelector('.sort-arrow').textContent = '▼';

  renderTableBody();
}
