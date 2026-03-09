/**
 * table.js — Company table sort, filter, and rendering
 */

const PHASE_RANK = {
  'PHASE4': 7, 'PHASE3': 6, 'PHASE2/PHASE3': 5, 'PHASE2': 4,
  'PHASE1/PHASE2': 3, 'PHASE1': 2, 'EARLY_PHASE1': 1,
};

const PHASE_ABBREV = {
  'PHASE4': 'P4', 'PHASE3': 'P3', 'PHASE2/PHASE3': 'P2/3', 'PHASE2': 'P2',
  'PHASE1/PHASE2': 'P1/2', 'PHASE1': 'P1', 'EARLY_PHASE1': 'EP1',
};

let currentSort = { key: 'return_pct', dir: 'desc' };
let filteredCompanies = [...COMPANIES];

function getFilteredCompanies() {
  const gsFilter = document.getElementById('filter-gs').value;
  const outcomeFilter = document.getElementById('filter-outcome').value;
  const oncologyFilter = document.getElementById('filter-oncology').value;
  const search = document.getElementById('filter-search').value.toLowerCase().trim();

  return COMPANIES.filter(c => {
    if (gsFilter === 'gs' && !c.is_gs) return false;
    if (gsFilter === 'nongs' && c.is_gs) return false;
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
    // Special: sort lead_phase by rank
    if (key === 'lead_phase') {
      va = PHASE_RANK[va] || 0;
      vb = PHASE_RANK[vb] || 0;
    }
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

  const fmtPhase = (v) => v != null ? (PHASE_ABBREV[v] || v) : '<span class="dash">—</span>';

  const badge = (outcome) => {
    const cls = { active: 'badge-active', acquired: 'badge-acquired', bankrupt: 'badge-bankrupt' };
    return `<span class="badge ${cls[outcome] || ''}">${outcome}</span>`;
  };

  const hasPairs = (ticker) => typeof PIPELINE !== 'undefined' && PIPELINE[ticker] && PIPELINE[ticker].length > 0;

  const fmtSource = (p) => {
    if (p.source === 'ot_2020') return 'OT 20.02';
    let label = 'OT API';
    if (p.validation === 'mendelian') label += ' <span class="source-tag tag-mendelian">Mendelian</span>';
    else if (p.validation === 'bq_confirmed') label += ' <span class="source-tag tag-bq">BQ</span>';
    else if (p.validation === 'mendelian_ancestor') label += ' <span class="source-tag tag-mendelian">Ancestor</span>';
    return label;
  };

  const pairRows = (ticker) => {
    const pairs = PIPELINE[ticker] || [];
    return pairs.map(p => `
      <tr class="pipeline-row" style="display:none">
        <td></td>
        <td colspan="2" class="pipeline-cell">
          ${p.drug ? `<span class="pipeline-drug">${p.drug}</span> ` : ''}
          <a href="https://platform.opentargets.org/target/${p.ensembl_id}" target="_blank" rel="noopener">${p.gene}</a>
          &rarr;
          <a href="https://platform.opentargets.org/disease/${p.efo_id}" target="_blank" rel="noopener">${p.disease}</a>
        </td>
        <td></td>
        <td class="pipeline-score">${p.score.toFixed(3)}</td>
        <td class="pipeline-source">${fmtSource(p)}</td>
        <td colspan="2"></td>
      </tr>
    `).join('');
  };

  tbody.innerHTML = filteredCompanies.map(c => {
    const expandable = hasPairs(c.ticker);
    const expandCls = expandable ? ' expandable' : '';
    const chevron = expandable ? '<span class="expand-icon">&#9654;</span>' : '';
    return `
      <tr class="company-row${expandCls}" data-ticker="${c.ticker}">
        <td class="ticker">${chevron}${c.ticker}</td>
        <td>${c.company}</td>
        <td>${fmt(c.return_pct)}</td>
        <td>${c.is_gs ? '<span class="check">&#10003;</span>' : '<span class="dash">—</span>'}</td>
        <td>${fmtScore(c.lead_score)}</td>
        <td>${fmtPhase(c.lead_phase)}</td>
        <td>${badge(c.outcome)}</td>
        <td>${c.is_oncology ? '<span class="check">&#10003;</span>' : '<span class="dash">—</span>'}</td>
      </tr>
      ${expandable ? pairRows(c.ticker) : ''}
    `;
  }).join('');

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

function initExpandToggle() {
  document.getElementById('company-tbody').addEventListener('click', (e) => {
    const row = e.target.closest('tr.expandable');
    if (!row) return;
    const isOpen = row.classList.contains('expanded');

    // Toggle expanded state
    row.classList.toggle('expanded');

    // Show/hide pipeline rows immediately following this company row
    let sibling = row.nextElementSibling;
    while (sibling && sibling.classList.contains('pipeline-row')) {
      sibling.style.display = isOpen ? 'none' : '';
      sibling = sibling.nextElementSibling;
    }
  });
}

function initCompanyTable() {
  initSortHeaders();
  initFilters();
  initExpandToggle();

  // Set initial sort arrow
  const returnTh = document.querySelector('.company-table th[data-sort="return_pct"]');
  if (returnTh) returnTh.querySelector('.sort-arrow').textContent = '▼';

  renderTableBody();
}
