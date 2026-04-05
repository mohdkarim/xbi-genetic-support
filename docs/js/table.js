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

const MAPPING_LABELS = {
  chembl_api: 'ChEMBL API',
  chembl_override: 'ChEMBL (corrected)',
  manual_biologic: 'Manual (biologic)',
  manual_antisense: 'Manual (antisense)',
  manual_cell_therapy: 'Manual (cell therapy)',
  gene_therapy_inferred: 'Gene therapy (inferred)',
};

const DS_LABELS = {
  eva: 'ClinVar (EVA)',
  gene2phenotype: 'Gene2Phenotype',
  genomics_england: 'Genomics England',
  orphanet: 'Orphanet',
  gwas_catalog: 'GWAS Catalog',
  ot_genetics_portal: 'OT Genetics Portal',
  postgap: 'PostGAP',
  phewas_catalog: 'PheWAS Catalog',
  uniprot: 'UniProt',
  uniprot_literature: 'UniProt Literature',
  uniprot_variants: 'UniProt Variants',
};

const REASON_LABELS = {
  scored_below_threshold: 'OT 20.02 score &le; 0.80',
  no_ot_match: 'Gene-disease pair not found in OT 20.02',
  no_gene_mapped: 'Drug&rarr;gene mapping not available',
  no_efo_mapped: 'Disease&rarr;EFO mapping not available',
  diagnostic_platform: 'Diagnostic/platform company &mdash; no drug pipeline',
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
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (key === 'lead_phase') {
      va = PHASE_RANK[va] || 0;
      vb = PHASE_RANK[vb] || 0;
    }
    if (typeof va === 'boolean') { va = va ? 1 : 0; vb = vb ? 1 : 0; }
    if (typeof va === 'string') return mult * va.localeCompare(vb);
    return mult * (va - vb);
  });
}

/* ── Helpers ──────────────────────────────────────────────────────────── */
const esc = (s) => s ? String(s).replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
const link = (text, url) => url ? `<a href="${url}" target="_blank" rel="noopener">${text}</a>` : text;

function fmtDatasources(dsString) {
  if (!dsString) return '<span class="dash">&mdash;</span>';
  return dsString.split(',').map(ds => {
    const d = ds.trim();
    const label = DS_LABELS[d] || d;
    const isMendelian = ['eva', 'gene2phenotype', 'genomics_england', 'orphanet', 'uniprot_variants'].includes(d);
    const cls = isMendelian ? 'ds-tag ds-mendelian' : 'ds-tag ds-gwas';
    return `<span class="${cls}">${label}</span>`;
  }).join(' ');
}

function fmtMapping(src) {
  return MAPPING_LABELS[src] || src || '&mdash;';
}

function buildTrialRow(nctId, trialStart) {
  if (!nctId) return '';
  const nctUrl = `https://clinicaltrials.gov/study/${nctId}`;
  const dateStr = trialStart || '';
  return `<div class="audit-row"><span class="audit-label">Trial:</span> ${link(nctId + ' &#8599;', nctUrl)}${dateStr ? ' (started ' + dateStr + ')' : ''}</div>`;
}

function buildGeneDisease(gene, ensemblId, conditions, efoId) {
  const geneUrl = ensemblId ? `https://platform.opentargets.org/target/${ensemblId}` : '';
  const geneDisp = gene ? link(esc(gene) + ' &#8599;', geneUrl) : '&mdash;';
  const diseaseUrl = efoId ? `https://platform.opentargets.org/disease/${efoId}` : '';
  const condFirst = conditions ? conditions.split('|')[0].trim() : '';
  const diseaseDisp = condFirst ? link(esc(condFirst) + ' &#8599;', diseaseUrl) : '&mdash;';
  return `${geneDisp} &rarr; ${diseaseDisp}`;
}

function buildEvidenceLink(ensemblId, efoId) {
  if (!ensemblId || !efoId) return '';
  const url = `https://platform.opentargets.org/evidence/${ensemblId}/${efoId}`;
  return `<div class="audit-row"><span class="audit-label">Evidence:</span> ${link('View in Open Targets &#8599;', url)}</div>`;
}

function buildChemblRow(chemblId) {
  if (!chemblId) return '';
  const url = `https://www.ebi.ac.uk/chembl/compound_report_card/${chemblId}/`;
  return `<div class="audit-row"><span class="audit-label">ChEMBL:</span> ${link(chemblId + ' &#8599;', url)}</div>`;
}

/* ── Audit card: scored company (GS or non-GS with score) ────────── */
function buildScoredAuditCard(c) {
  // Use lead_* fields (from the scored pair)
  const drugName = c.lead_drug || c.drug_name || '&mdash;';
  const chemblId = c.lead_chembl_id || c.best_drug_chembl_id || '';
  const chemblUrl = chemblId ? `https://www.ebi.ac.uk/chembl/compound_report_card/${chemblId}/` : '';
  const drugDisplay = chemblUrl ? link(esc(drugName) + ' &#8599;', chemblUrl) : esc(drugName);

  const directLabel = c.lead_is_direct === true ? 'Direct' : c.lead_is_direct === false ? 'Indirect (ontology-propagated)' : '&mdash;';
  const targetCount = c.n_unique_targets || 0;
  const targetLabel = targetCount > 1 ? `Multi-target (${targetCount} genes)` : 'Single target';
  const nctId = c.lead_nct_id || c.best_nct_id || '';
  const trialStart = c.lead_trial_start || c.best_trial_start || '';
  const mapSrc = c.lead_mapping_source || c.best_mapping_source || '';
  const efoMapSrc = c.lead_efo_mapping_source || c.best_efo_mapping_source || '';

  const isBelow = !c.is_gs && c.nongs_reason === 'scored_below_threshold';
  const statusTag = c.is_gs
    ? '<span class="ds-tag ds-mendelian">GS &gt; 0.80</span>'
    : `<span class="ds-tag ds-below">Score &le; 0.80</span>`;

  return `
    <div class="audit-card">
      <div class="audit-grid">
        <div class="audit-section">
          <div class="audit-section-title">Lead Asset</div>
          <div class="audit-row"><span class="audit-label">Drug:</span> ${drugDisplay}</div>
          <div class="audit-row"><span class="audit-label">Phase:</span> ${PHASE_ABBREV[c.lead_phase] || c.lead_phase || '&mdash;'}</div>
          <div class="audit-row"><span class="audit-label">Target(s):</span> ${targetLabel}</div>
          ${buildTrialRow(nctId, trialStart)}
        </div>
        <div class="audit-section">
          <div class="audit-section-title">Genetic Evidence ${statusTag}</div>
          <div class="audit-row"><span class="audit-label">Gene &rarr; Disease:</span> ${buildGeneDisease(c.lead_gene, c.lead_ensembl_id, c.lead_conditions, c.lead_efo_id)}</div>
          <div class="audit-row"><span class="audit-label">OT 20.02 Score:</span> ${c.lead_score != null ? c.lead_score.toFixed(4) : '&mdash;'} (${directLabel})</div>
          <div class="audit-row"><span class="audit-label">Sources:</span> ${fmtDatasources(c.lead_datasources)}</div>
          ${buildEvidenceLink(c.lead_ensembl_id, c.lead_efo_id)}
        </div>
        <div class="audit-section">
          <div class="audit-section-title">Mapping Provenance</div>
          <div class="audit-row"><span class="audit-label">Drug &rarr; Gene:</span> ${esc(fmtMapping(mapSrc))}</div>
          <div class="audit-row"><span class="audit-label">Gene source:</span> ${esc(c.lead_gene_source || c.gene_source || '&mdash;')}</div>
          <div class="audit-row"><span class="audit-label">Condition &rarr; EFO:</span> ${esc(efoMapSrc || '&mdash;')}</div>
          ${buildChemblRow(chemblId)}
        </div>
      </div>
    </div>
  `;
}

/* ── Audit card: gene mapped but no OT 20.02 match ──────────────── */
function buildNoMatchAuditCard(c) {
  const drugName = c.drug_name || '&mdash;';
  const chemblId = c.best_drug_chembl_id || '';
  const chemblUrl = chemblId ? `https://www.ebi.ac.uk/chembl/compound_report_card/${chemblId}/` : '';
  const drugDisplay = chemblUrl ? link(esc(drugName) + ' &#8599;', chemblUrl) : esc(drugName);
  const nctId = c.best_nct_id || '';
  const trialStart = c.best_trial_start || '';
  const mapSrc = c.best_mapping_source || '';
  const efoMapSrc = c.best_efo_mapping_source || '';

  return `
    <div class="audit-card">
      <div class="audit-grid">
        <div class="audit-section">
          <div class="audit-section-title">Lead Asset</div>
          <div class="audit-row"><span class="audit-label">Drug:</span> ${drugDisplay}</div>
          <div class="audit-row"><span class="audit-label">Phase:</span> ${PHASE_ABBREV[c.best_phase] || c.best_phase || '&mdash;'}</div>
          ${buildTrialRow(nctId, trialStart)}
        </div>
        <div class="audit-section">
          <div class="audit-section-title">Genetic Evidence <span class="ds-tag ds-nomatch">No OT 20.02 match</span></div>
          <div class="audit-row"><span class="audit-label">Gene &rarr; Disease:</span> ${buildGeneDisease(c.target_gene, c.ensembl_id, c.indication, c.efo_id)}</div>
          <div class="audit-row audit-explain">Gene-disease pair was mapped but not found in the OT 20.02 release (Feb 2020). This means no germline genetic association was recorded for this pair at study start.</div>
          ${buildEvidenceLink(c.ensembl_id, c.efo_id)}
        </div>
        <div class="audit-section">
          <div class="audit-section-title">Mapping Provenance</div>
          <div class="audit-row"><span class="audit-label">Drug &rarr; Gene:</span> ${esc(fmtMapping(mapSrc))}</div>
          <div class="audit-row"><span class="audit-label">Gene source:</span> ${esc(c.gene_source || '&mdash;')}</div>
          <div class="audit-row"><span class="audit-label">Condition &rarr; EFO:</span> ${esc(efoMapSrc || '&mdash;')}</div>
          ${buildChemblRow(chemblId)}
        </div>
      </div>
    </div>
  `;
}

/* ── Audit card: no gene target mapped ───────────────────────────── */
function buildNoGeneAuditCard(c) {
  const drugName = c.drug_name || '&mdash;';
  const nctId = c.best_nct_id || '';
  const trialStart = c.best_trial_start || '';

  return `
    <div class="audit-card">
      <div class="audit-grid">
        <div class="audit-section">
          <div class="audit-section-title">Lead Asset</div>
          <div class="audit-row"><span class="audit-label">Drug:</span> ${esc(drugName)}</div>
          <div class="audit-row"><span class="audit-label">Phase:</span> ${PHASE_ABBREV[c.best_phase] || c.best_phase || '&mdash;'}</div>
          <div class="audit-row"><span class="audit-label">Indication:</span> ${esc(c.indication || '&mdash;')}</div>
          ${buildTrialRow(nctId, trialStart)}
        </div>
        <div class="audit-section" style="grid-column: span 2">
          <div class="audit-section-title">Classification <span class="ds-tag ds-nomatch">No gene target</span></div>
          <div class="audit-row audit-explain">Drug&rarr;gene mapping was not available for this company's lead program. ChEMBL did not return a mechanism of action with a protein target, and no manual override was curated. Without a gene target, genetic association scoring cannot be performed.</div>
        </div>
      </div>
    </div>
  `;
}

/* ── Audit card: diagnostic platform ─────────────────────────────── */
function buildDiagnosticAuditCard(c) {
  return `
    <div class="audit-card">
      <div class="audit-section">
        <div class="audit-section-title">Classification <span class="ds-tag ds-nomatch">Diagnostic / Platform</span></div>
        <div class="audit-row audit-explain">This company is a diagnostics or tools platform without a therapeutic drug pipeline. Genetic association scoring requires a drug&rarr;gene&rarr;disease mapping from clinical trials, which does not apply to diagnostic companies.</div>
      </div>
    </div>
  `;
}

/* ── Route to correct audit card ─────────────────────────────────── */
function buildAuditCard(c) {
  if (c.is_gs || c.nongs_reason === 'scored_below_threshold') {
    return buildScoredAuditCard(c);
  }
  if (c.nongs_reason === 'no_ot_match') {
    return buildNoMatchAuditCard(c);
  }
  if (c.nongs_reason === 'diagnostic_platform') {
    return buildDiagnosticAuditCard(c);
  }
  // no_gene_mapped, no_efo_mapped, or anything else
  return buildNoGeneAuditCard(c);
}

function renderTableBody() {
  filteredCompanies = sortCompanies(getFilteredCompanies());
  const tbody = document.getElementById('company-tbody');

  const fmt = (c) => {
    const v = c.return_pct;
    if (v == null) return '<span class="dash">&mdash;</span>';
    const cls = v >= 0 ? 'return-pos' : 'return-neg';
    const sign = v >= 0 ? '+' : '';
    let tip = '';
    if (c.price_start != null && c.price_end != null) {
      tip = ` title="$${Number(c.price_start).toFixed(2)} (${c.date_start}) → $${Number(c.price_end).toFixed(2)} (${c.date_end})"`;
    }
    return `<span class="${cls}"${tip}>${sign}${v.toFixed(1)}%</span>`;
  };

  const fmtScore = (v) => v != null ? v.toFixed(2) : '<span class="dash">&mdash;</span>';
  const fmtPhase = (v) => v != null && v !== '' ? (PHASE_ABBREV[v] || v) : '<span class="dash">&mdash;</span>';

  const badge = (outcome) => {
    const cls = { active: 'badge-active', acquired: 'badge-acquired', bankrupt: 'badge-bankrupt' };
    return `<span class="badge ${cls[outcome] || ''}">${outcome}</span>`;
  };

  tbody.innerHTML = filteredCompanies.map(c => {
    const directTag = c.lead_is_direct === true ? '<span class="source-tag tag-ot2020">direct</span>' :
                      c.lead_is_direct === false ? '<span class="source-tag tag-indirect">indirect</span>' : '';

    return `
      <tr class="company-row expandable" data-ticker="${c.ticker}">
        <td class="ticker"><span class="expand-icon">&#9654;</span>${c.ticker}</td>
        <td>${c.company}</td>
        <td>${fmt(c)}</td>
        <td>${c.is_gs ? '<span class="check">&#10003;</span>' : '<span class="dash">&mdash;</span>'}</td>
        <td>${fmtScore(c.lead_score)} ${directTag}</td>
        <td>${fmtPhase(c.lead_phase)}</td>
        <td>${c.lead_gene || '<span class="dash">&mdash;</span>'}</td>
        <td>${badge(c.outcome)}</td>
        <td>${c.is_oncology ? '<span class="check">&#10003;</span>' : '<span class="dash">&mdash;</span>'}</td>
      </tr>
      <tr class="audit-detail-row" data-ticker="${c.ticker}" style="display:none">
        <td colspan="9" class="audit-detail-cell">${buildAuditCard(c)}</td>
      </tr>
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
        currentSort = { key, dir: key === 'ticker' || key === 'company' || key === 'outcome' || key === 'lead_gene' ? 'asc' : 'desc' };
      }

      document.querySelectorAll('.company-table th .sort-arrow').forEach(a => a.textContent = '');
      th.querySelector('.sort-arrow').textContent = currentSort.dir === 'asc' ? '\u25B2' : '\u25BC';

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
    if (e.target.closest('a')) return;

    const isOpen = row.classList.contains('expanded');
    row.classList.toggle('expanded');

    const detailRow = row.nextElementSibling;
    if (detailRow && detailRow.classList.contains('audit-detail-row')) {
      detailRow.style.display = isOpen ? 'none' : '';
    }
  });
}

function initCompanyTable() {
  initSortHeaders();
  initFilters();
  initExpandToggle();

  const returnTh = document.querySelector('.company-table th[data-sort="return_pct"]');
  if (returnTh) returnTh.querySelector('.sort-arrow').textContent = '\u25BC';

  renderTableBody();
}
