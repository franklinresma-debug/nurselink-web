const API_URL = window.NURSELINK_API_URL || 'https://api.amsertech.com'

const mockCandidates = [
  {control_no:'2026-MED-0812',name:'Cueto, Joven S.',specialty:'Staff Nurse I - OR',credential:'verified',credential_label:'Verified / Active',principal:'KFSH&RC Riyadh',stage:'For Interview'},
  {control_no:'2026-MED-0814',name:'Gumilid, Iravy L.',specialty:'ICU / Critical Care',credential:'prometric',credential_label:'Prometric Pass',principal:'Abu Dhabi Health',stage:'Lineup Submitted'},
  {control_no:'2026-MED-0820',name:'Asoy, Roberto G.',specialty:'Endoscopy Nurse',credential:'verified',credential_label:'PRC Verified',principal:'AIPH Program',stage:'Credential Review'},
  {control_no:'2026-MED-0826',name:'Santos, Maria C.',specialty:'PACU / Recovery',credential:'pending',credential_label:'DataFlow Pending',principal:'KFSH&RC Riyadh',stage:'Document Completion'},
  {control_no:'2026-MED-0833',name:'Reyes, Paolo M.',specialty:'Liver Transplant',credential:'verified',credential_label:'Verified / Active',principal:'KFSH&RC Riyadh',stage:'Employer Review'},
  {control_no:'2026-MED-0842',name:'Dela Cruz, Anne P.',specialty:'NICU',credential:'prometric',credential_label:'Prometric Pass',principal:'Abu Dhabi Health',stage:'For Interview'},
  {control_no:'2026-MED-0848',name:'Villanueva, Grace R.',specialty:'Emergency Room',credential:'verified',credential_label:'Verified / Active',principal:'AIPH Program',stage:'Visa Processing'},
  {control_no:'2026-MED-0851',name:'Mendoza, Carlo T.',specialty:'Operating Room',credential:'pending',credential_label:'PRC Review',principal:'KFSH&RC Riyadh',stage:'Credential Review'},
  {control_no:'2026-MED-0857',name:'Navarro, Liza B.',specialty:'Medical-Surgical',credential:'verified',credential_label:'Verified / Active',principal:'Abu Dhabi Health',stage:'Offer Accepted'},
  {control_no:'2026-MED-0861',name:'Flores, Kenneth D.',specialty:'Dialysis',credential:'prometric',credential_label:'Prometric Pass',principal:'KFSH&RC Riyadh',stage:'Lineup Submitted'},
  {control_no:'2026-MED-0868',name:'Ramos, Sheila A.',specialty:'Pediatric ICU',credential:'verified',credential_label:'PRC Verified',principal:'AIPH Program',stage:'For Interview'},
  {control_no:'2026-MED-0874',name:'Garcia, Noel V.',specialty:'Cath Lab',credential:'pending',credential_label:'DataFlow Pending',principal:'KFSH&RC Riyadh',stage:'Document Completion'}
]

let candidates = [...mockCandidates]
let currentPage = 1
let pageSize = 10

const $ = (id) => document.getElementById(id)

function toast(message) {
  const el = $('toast')
  el.textContent = message
  el.classList.add('show')
  clearTimeout(window.__toastTimer)
  window.__toastTimer = setTimeout(() => el.classList.remove('show'), 2200)
}

function normalizedRows(payload) {
  const rows = payload?.data?.data || payload?.data || payload?.lineup || payload
  if (!Array.isArray(rows)) return []

  return rows.map((row, index) => ({
    control_no: row.control_no || row.registration_no || row.reg_no || `NL-${index + 1}`,
    name: row.candidate_name || row.name || [row.last_name, row.first_name].filter(Boolean).join(', ') || 'Unnamed candidate',
    specialty: row.specialty || row.position || row.clinical_specialty || 'Nursing',
    credential: row.credential_status || (row.prc_verified ? 'verified' : row.prometric_passed ? 'prometric' : 'pending'),
    credential_label: row.credential_label || row.status || (row.prc_verified ? 'PRC Verified' : row.prometric_passed ? 'Prometric Pass' : 'Pending Review'),
    principal: row.principal_name || row.hospital_name || row.principal || 'Hospital Principal',
    stage: row.deployment_stage || row.stage || row.lineup_status || 'Pipeline Review'
  }))
}

async function loadLineup() {
  const jobOrderId = $('jobOrderSelect').value
  const status = $('syncStatus')
  status.innerHTML = '<span class="status-dot"></span> Syncing lineup…'

  try {
    const response = await fetch(`${API_URL}/api/v1/arms/job-orders/${encodeURIComponent(jobOrderId)}/lineup`, {
      credentials: 'include',
      headers: { Accept: 'application/json' }
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    const rows = normalizedRows(data)
    if (rows.length) candidates = rows
    currentPage = 1
    render()
    status.innerHTML = '<span class="status-dot"></span> Live ARMS lineup'
    toast('Hospital lineup refreshed from NurseLink API.')
  } catch (error) {
    candidates = [...mockCandidates]
    currentPage = 1
    render()
    status.innerHTML = '<span class="status-dot"></span> Preview data · API ready'
    toast('Live lineup unavailable. Preview data loaded safely.')
  }
}

function getFilteredRows() {
  const q = `${$('globalSearch').value} ${$('tableSearch').value}`.trim().toLowerCase()
  const credential = $('credentialFilter').value

  return candidates.filter((row) => {
    const haystack = Object.values(row).join(' ').toLowerCase()
    const searchMatch = !q || q.split(/\s+/).every((word) => haystack.includes(word))
    const credentialMatch = credential === 'all' || row.credential === credential
    return searchMatch && credentialMatch
  })
}

function renderRows(rows) {
  $('candidateRows').innerHTML = rows.map((row) => `
    <tr>
      <td><strong>${escapeHtml(row.control_no)}</strong></td>
      <td>${escapeHtml(row.name)}</td>
      <td>${escapeHtml(row.specialty)}</td>
      <td><span class="badge ${badgeClass(row.credential)}">${escapeHtml(row.credential_label)}</span></td>
      <td>${escapeHtml(row.principal)}</td>
      <td><span class="stage">${escapeHtml(row.stage)}</span></td>
      <td class="center">
        <div class="row-actions">
          <button class="manage" data-control="${escapeAttr(row.control_no)}">Manage</button>
          <button class="update" data-control="${escapeAttr(row.control_no)}">Update</button>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7" class="center">No candidates match the current filters.</td></tr>'
}

function renderPagination(totalRows) {
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
  if (currentPage > totalPages) currentPage = totalPages

  const buttons = []
  buttons.push(`<button ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">Prev</button>`)
  for (let page = 1; page <= totalPages; page++) {
    if (totalPages > 7 && Math.abs(page - currentPage) > 2 && page !== 1 && page !== totalPages) continue
    buttons.push(`<button class="${page === currentPage ? 'active' : ''}" data-page="${page}">${page}</button>`)
  }
  buttons.push(`<button ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">Next</button>`)
  $('pagination').innerHTML = buttons.join('')
}

function render() {
  const filtered = getFilteredRows()
  const total = filtered.length
  const startIndex = (currentPage - 1) * pageSize
  const pageRows = filtered.slice(startIndex, startIndex + pageSize)

  renderRows(pageRows)
  renderPagination(total)

  const start = total ? startIndex + 1 : 0
  const end = Math.min(startIndex + pageRows.length, total)
  $('tableSummary').textContent = `Showing ${start} to ${end} of ${total} candidate${total === 1 ? '' : 's'}`
}

function exportCsv() {
  const rows = getFilteredRows()
  const headers = ['Control No.','Candidate Name','Specialty / Area','Credential Status','Principal','Deployment Stage']
  const lines = [headers, ...rows.map((r) => [r.control_no,r.name,r.specialty,r.credential_label,r.principal,r.stage])]
  const csv = lines.map((line) => line.map(csvCell).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `nurselink-lineup-${new Date().toISOString().slice(0,10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
  toast('CSV export created.')
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"','""')}"`
}

function badgeClass(value) {
  if (value === 'verified' || value === true) return 'verified'
  if (value === 'prometric') return 'prometric'
  return 'pending'
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]))
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, '&#39;')
}

$('menuToggle').addEventListener('click', () => document.body.classList.toggle('sidebar-collapsed'))
$('refreshLineup').addEventListener('click', loadLineup)
$('exportButton').addEventListener('click', exportCsv)
$('backToControls').addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}))
$('advancedSearchButton').addEventListener('click', () => $('tableSearch').focus())

for (const id of ['globalSearch','tableSearch']) {
  $(id).addEventListener('input', () => { currentPage = 1; render() })
}
$('credentialFilter').addEventListener('change', () => { currentPage = 1; render() })
$('pageSize').addEventListener('change', (event) => { pageSize = Number(event.target.value); currentPage = 1; render() })
$('jobOrderSelect').addEventListener('change', loadLineup)

$('pagination').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-page]')
  if (!button || button.disabled) return
  currentPage = Number(button.dataset.page)
  render()
})

$('candidateRows').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-control]')
  if (!button) return
  toast(`${button.textContent} candidate ${button.dataset.control}`)
})

document.querySelectorAll('[data-action]').forEach((button) => {
  button.addEventListener('click', () => toast(`${button.textContent.trim()} workflow selected.`))
})

render()
