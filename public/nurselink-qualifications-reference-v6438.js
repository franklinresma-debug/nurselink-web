/* NurseLink Qualifications Reference Match v64.3.8 */
(() => {
  if (window.__NL_QUALIFICATIONS_REFERENCE_MATCH_V6438__) return;
  window.__NL_QUALIFICATIONS_REFERENCE_MATCH_V6438__ = true;

  const pathname = location.pathname.replace(/\/+$/, '');
  if (pathname !== '/qualifications') return;

  const esc = (v='') => String(v ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  const fmtDate = (v) => {
    if (!v) return '—';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return esc(v);
    return d.toLocaleDateString(undefined, {day:'2-digit', month:'short', year:'numeric'});
  };

  function getChipIdentity() {
    const chip = document.querySelector('.user-chip, .nurselink-super-admin-user');
    const name = chip?.querySelector('strong')?.textContent?.trim() || 'NurseLink Member';
    const memberNumber = chip?.querySelector('small')?.textContent?.trim() || '';
    const img = chip?.querySelector('img')?.getAttribute('src') || '';
    return {name, memberNumber, img};
  }

  async function fetchFirst(urls) {
    for (const url of urls) {
      try {
        const r = await fetch(url, {
          credentials: 'include',
          headers: {'Accept':'application/json'}
        });
        if (!r.ok) continue;
        const j = await r.json().catch(() => null);
        if (j?.data) return j.data;
      } catch (_) {}
    }
    return null;
  }

  function pill(text, cls='') {
    return `<span class="nl6438-pill ${cls}">${esc(text)}</span>`;
  }

  function item(icon, label, value, cls='') {
    return `
      <div class="nl6438-side-item ${cls}">
        <span class="nl6438-side-icon" aria-hidden="true">${icon}</span>
        <div><small>${esc(label)}</small><strong>${esc(value || '—')}</strong></div>
      </div>`;
  }

  function render(data) {
    const q = data.qualification || {};
    const p = data.policy || {};
    const identity = getChipIdentity();

    const memberNumber = data.member_number || identity.memberNumber || 'NL-2026-000001';
    const score = Math.max(0, Math.min(100, Math.round(Number(q.professional_readiness_score || 88))));
    const level = String(q.framework_level || 'Level 7').replace(/^Level\s*/i, '') || '7';
    const currentRole = q.professional_role || 'Head Nurse / Nurse Unit Manager - Medical-Surgical Unit';
    const careerLevel = q.career_level || 'Nursing Leadership';
    const band = q.nurselink_reference_band || 'Advanced / Postgraduate';
    const verifiedText = q.is_demo ? 'Verified (Demo)' : (q.verification_status || 'Framework Mapped');

    return `
      <section class="nl6438-page">
        <div class="nl6438-breadcrumb">Home <span>›</span> Members <span>›</span> My Profile <span>›</span> Qualifications</div>

        <div class="nl6438-page-head">
          <div>
            <h1>My Qualifications</h1>
            <p>Manage your professional qualifications and see how they are recognized within the applicable qualification framework.</p>
          </div>
          <button type="button" class="nl6438-export" onclick="window.print()">⇩&nbsp; Export to PDF</button>
        </div>

        <section class="nl6438-member-card">
          <div class="nl6438-member-left">
            ${identity.img
              ? `<img class="nl6438-avatar" src="${esc(identity.img)}" alt="">`
              : `<div class="nl6438-avatar nl6438-avatar-fallback">NL</div>`}
            <div class="nl6438-member-copy">
              <span class="nl6438-member-badge">MEMBER</span>
              <div class="nl6438-member-number">${esc(memberNumber)} <button type="button" title="Copy member number" aria-label="Copy member number" data-copy="${esc(memberNumber)}">⧉</button></div>
              <h2>${esc(identity.name)}</h2>
              <p>${esc(currentRole)}</p>
              <div class="nl6438-identity-meta">
                ${pill('✓ ' + verifiedText, 'verified')}
                <span>⌖ Philippines</span>
                <span>✉ Member Account</span>
                <span>▣ NurseLink</span>
              </div>
            </div>
          </div>
          <div class="nl6438-readiness">
            <span>Professional Readiness ⓘ</span>
            <strong>${score}<small>/100</small></strong>
            ${pill(band, 'advanced')}
            <a href="#nl6438-framework">View details →</a>
          </div>
        </section>

        <nav class="nl6438-tabs" aria-label="Member profile sections">
          <span>▣ Overview</span>
          <strong>◇ Qualifications</strong>
          <span>♢ Certificates</span>
          <span>▤ Portfolio</span>
          <span>▣ Experience</span>
          <span>♜ Licenses</span>
          <span>◇ Education</span>
          <span>▱ Documents</span>
        </nav>

        <div class="nl6438-layout" id="nl6438-framework">
          <main class="nl6438-framework-section">
            <h2>Qualification Framework Reference</h2>

            <div class="nl6438-framework-top">
              <section class="nl6438-framework-card">
                <div class="nl6438-framework-brand">
                  <div class="nl6438-flag">🇵🇭</div>
                  <div>
                    <span>${esc(q.country_name || 'Philippines')}</span>
                    <h3>${esc(q.framework_name || 'Philippine Qualifications Framework (PQF)')}</h3>
                    <small>National Qualifications Framework</small>
                  </div>
                </div>

                <div class="nl6438-framework-meta">
                  <div><span>Framework Code</span><strong>${esc(q.framework_code || 'PQF')}</strong></div>
                  <div><span>Levels</span><strong>${p.level_count ? `1 – ${esc(p.level_count)}` : '1 – 8'}</strong></div>
                  <div><span>Framework Status</span>${pill(p.policy_status || 'Current', 'current')}</div>
                  <div><span>As of Date</span><strong>${fmtDate(p.as_of_date || p.last_verified_date || new Date())}</strong></div>
                </div>

                <p>${esc(p.notes || 'This framework is used as the national reference for qualifications in the Philippines and may change when updated by the competent authority.')}</p>
                ${p.source_url ? `<a href="${esc(p.source_url)}" target="_blank" rel="noopener">Learn more about ${esc(q.framework_code || 'PQF')} ↗</a>` : ''}
              </section>

              <section class="nl6438-qualification-card">
                <span>Your Qualification ⓘ</span>
                <div class="nl6438-qualification-title">
                  <span class="nl6438-degree-icon">◆</span>
                  <div><h3>${esc(q.qualification_title || 'Master of Arts in Nursing')}</h3><p>${esc(q.field_of_study || 'Nursing Administration and Leadership')}</p></div>
                </div>
                <div class="nl6438-level-block">
                  <span>${esc(q.framework_code || 'PQF')} Level</span>
                  <strong>${esc(level)}</strong>
                </div>
                ${pill(band, 'purple')}
                <small>NurseLink Reference Band</small>
                <b>${esc(band)}</b>
              </section>
            </div>

            <div class="nl6438-provenance">
              <div><span>Source Authority</span><strong>${esc(p.source_authority || 'PQF National Coordinating Council (PQF-NCC)')}</strong></div>
              <div><span>Official Source</span>${p.source_url ? `<a href="${esc(p.source_url)}" target="_blank" rel="noopener">${esc(p.source_url)} ↗</a>` : '<strong>—</strong>'}</div>
              <div><span>Source Document</span><strong>${esc(p.source_document_title || 'Philippine Qualifications Framework – Eight-Level Descriptors')}</strong></div>
              <div><span>Source Publication Date</span><strong>${fmtDate(p.source_publication_date || '2012-05-18')}</strong></div>

              <div><span>Effective Date</span><strong>${fmtDate(p.effective_date || '2013-01-01')}</strong></div>
              <div><span>As of Date</span><strong>${fmtDate(p.as_of_date || new Date())}</strong></div>
              <div><span>Last Verified</span><strong>${fmtDate(p.last_verified_date || new Date())}</strong></div>
              <div><span>Version / Revision</span><strong>${esc(p.version_label || 'Current Framework Reference')}</strong></div>

              <div><span>Policy Status</span>${pill(p.policy_status || 'Current', 'current')}</div>
              <div><span>Verification Status</span><strong>${esc(p.verification_status || 'Official Source Verified')}</strong></div>
              <div><span>Mapping Confidence</span>${pill(p.mapping_confidence || q.mapping_confidence || 'High', 'current')}</div>
            </div>

            <div class="nl6438-policy-note">ⓘ This framework information is based on the official source above and may change when updated by the competent authority.</div>
          </main>

          <aside class="nl6438-right">
            <section class="nl6438-side-card">
              <h2>Professional Standing</h2>
              ${item('◆','Professional Title','Registered Nurse')}
              ${item('✓','License Status', q.is_demo ? 'Active (Demo)' : 'See Credentials','good')}
              ${item('▣','Regulatory Authority','Professional Regulation Commission (PRC)')}
              ${item('▤','Framework Verification', q.verification_status || 'Self-declared')}
            </section>

            <section class="nl6438-side-card">
              <h2>Career Snapshot</h2>
              ${item('●','Role', currentRole)}
              ${item('♟','Specialization', q.field_of_study || 'Medical-Surgical Nursing')}
              ${item('◉','Career Level', careerLevel)}
              ${item('⌖','Reference Band', band)}
            </section>
          </aside>
        </div>

        <div class="nl6438-disclaimer">
          <span>♢</span>
          <div>
            <strong>Important Disclaimer</strong>
            <p>NurseLink Qualification Framework Reference is provided for professional profiling, career development and matching purposes only. It does not constitute official recognition, credential equivalency, professional registration, immigration assessment, or authorization to practice.</p>
          </div>
        </div>
      </section>
    `;
  }

  function mount(data) {
    const main = document.querySelector('.main-area main, .main-area .page, .main-area') || document.querySelector('main');
    if (!main) return false;

    if (main.querySelector('.nl6438-page')) return true;

    main.setAttribute('data-nl6438-qualifications-root','1');

    // Hide current qualifications content rather than deleting it.
    Array.from(main.children).forEach(child => {
      if (!child.classList.contains('nl6438-page')) {
        child.setAttribute('data-nl6438-original-content','1');
      }
    });

    main.insertAdjacentHTML('afterbegin', render(data));

    main.querySelector('[data-copy]')?.addEventListener('click', async (e) => {
      const value = e.currentTarget.getAttribute('data-copy') || '';
      try {
        await navigator.clipboard.writeText(value);
        e.currentTarget.textContent='✓';
        setTimeout(()=>e.currentTarget.textContent='⧉',1000);
      } catch (_) {}
    });

    return true;
  }

  async function init() {
    const data = await fetchFirst([
      '/api/member-qualification-framework-v6437/me',
      '/api/member-qualification-framework-v6436/me',
      '/api/member-qualification-framework/me',
      '/api/global-qualification-framework/me'
    ]);

    if (!data) return;

    let attempts = 0;
    const tryMount = () => {
      if (mount(data)) return;
      if (++attempts < 12) setTimeout(tryMount, 250);
    };
    tryMount();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once:true});
  } else {
    init();
  }
})();
