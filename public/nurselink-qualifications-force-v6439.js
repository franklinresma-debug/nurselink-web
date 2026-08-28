/* NurseLink Qualifications Reference Force Apply v64.3.9 */
(() => {
  if (window.__NL_QUALIFICATIONS_FORCE_APPLY_V6439__) return;
  window.__NL_QUALIFICATIONS_FORCE_APPLY_V6439__ = true;

  const onQualificationsRoute = () => location.pathname.replace(/\/+$/,'') === '/qualifications';

  const esc = (v='') => String(v ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  const fmt = (v) => {
    if (!v) return '—';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return esc(v);
    return d.toLocaleDateString(undefined,{day:'2-digit',month:'short',year:'numeric'});
  };

  const fallback = {
    member_number: 'NL-2026-000001',
    qualification: {
      qualification_title: 'Master of Arts in Nursing',
      field_of_study: 'Nursing Administration and Leadership',
      country_code: 'PH',
      country_name: 'Philippines',
      framework_code: 'PQF',
      framework_name: 'Philippine Qualifications Framework (PQF)',
      framework_level: 'Level 7',
      qualification_type: "Master's Degree",
      nurselink_reference_band: 'Advanced / Postgraduate',
      mapping_confidence: 'High',
      verification_status: 'Verified (Demo)',
      professional_role: 'Head Nurse / Nurse Unit Manager',
      career_level: 'Nursing Leadership',
      professional_readiness_score: 88,
      is_demo: true
    },
    policy: {
      level_count: 8,
      source_authority: 'PQF National Coordinating Council (PQF-NCC)',
      source_url: 'https://pqf.gov.ph',
      source_document_title: 'Philippine Qualifications Framework – Eight-Level Descriptors',
      source_publication_date: '2012-05-18',
      effective_date: '2013-01-01',
      as_of_date: '2026-08-21',
      last_verified_date: '2026-08-21',
      version_label: 'Current Framework Reference',
      policy_status: 'Current',
      verification_status: 'Official Source Verified',
      mapping_confidence: 'High',
      notes: 'The PQF is the national policy instrument for the development and recognition of qualifications in the Philippines.'
    }
  };

  function chipIdentity() {
    const chip = document.querySelector('.user-chip,.nurselink-super-admin-user');
    const name = chip?.querySelector('strong')?.textContent?.trim() || 'FRANKLIN RESMA';
    const member = chip?.querySelector('small')?.textContent?.trim() || 'NL-2026-000001';
    const img = chip?.querySelector('img')?.getAttribute('src') || '';
    return {name, member, img};
  }

  function sideItem(icon,label,value,good=false){
    return `<div class="nl6439-side-item ${good?'good':''}">
      <span class="nl6439-side-icon">${icon}</span>
      <div><small>${esc(label)}</small><strong>${esc(value||'—')}</strong></div>
    </div>`;
  }

  function pill(text,cls=''){
    return `<span class="nl6439-pill ${cls}">${esc(text)}</span>`;
  }

  function render(data) {
    const q = data.qualification || fallback.qualification;
    const p = data.policy || fallback.policy;
    const id = chipIdentity();
    const memberNumber = data.member_number || id.member || fallback.member_number;
    const score = Math.round(Number(q.professional_readiness_score || 88));
    const level = String(q.framework_level || 'Level 7').replace(/^Level\s*/i,'') || '7';
    const role = q.professional_role || 'Head Nurse / Nurse Unit Manager';
    const band = q.nurselink_reference_band || 'Advanced / Postgraduate';

    return `
      <section class="nl6439-page">
        <div class="nl6439-breadcrumb">Home <span>›</span> Members <span>›</span> My Profile <span>›</span> Qualifications</div>

        <div class="nl6439-page-head">
          <div>
            <h1>My Qualifications</h1>
            <p>Manage your professional qualifications and see how they are recognized in the Philippine Qualifications Framework.</p>
          </div>
          <button type="button" onclick="window.print()">⇩ Export to PDF</button>
        </div>

        <section class="nl6439-member-card">
          <div class="nl6439-member-left">
            ${id.img ? `<img class="nl6439-avatar" src="${esc(id.img)}" alt="">` : `<div class="nl6439-avatar nl6439-avatar-fallback">NL</div>`}
            <div class="nl6439-member-copy">
              <span class="nl6439-member-badge">MEMBER</span>
              <div class="nl6439-member-number">${esc(memberNumber)} <button data-copy="${esc(memberNumber)}" type="button">⧉</button></div>
              <h2>${esc(id.name)}</h2>
              <p>${esc(role)}</p>
              <div class="nl6439-identity-meta">
                ${pill(q.is_demo ? '✓ Verified (Demo)' : '✓ Verified','verified')}
                <span>⌖ Philippines</span>
                <span>✉ NurseLink Member</span>
                <span>▣ Joined 2026</span>
              </div>
            </div>
          </div>
          <div class="nl6439-readiness">
            <span>Professional Readiness ⓘ</span>
            <strong>${score}<small>/100</small></strong>
            ${pill(band,'advanced')}
            <a href="#nl6439-framework">View details →</a>
          </div>
        </section>

        <nav class="nl6439-tabs">
          <span>▣ Overview</span>
          <strong>◇ Qualifications</strong>
          <span>♢ Certificates</span>
          <span>▤ Portfolio</span>
          <span>▣ Experience</span>
          <span>♜ Licenses</span>
          <span>◇ Education</span>
          <span>▱ Documents</span>
        </nav>

        <div class="nl6439-layout" id="nl6439-framework">
          <main class="nl6439-framework-section">
            <h2>Qualification Framework Reference</h2>

            <div class="nl6439-framework-top">
              <section class="nl6439-framework-card">
                <div class="nl6439-framework-brand">
                  <div class="nl6439-flag">🇵🇭</div>
                  <div>
                    <span>${esc(q.country_name || 'Philippines')}</span>
                    <h3>${esc(q.framework_name || 'Philippine Qualifications Framework (PQF)')}</h3>
                    <small>National Qualifications Framework</small>
                  </div>
                </div>

                <div class="nl6439-framework-meta">
                  <div><span>Framework Code</span><strong>${esc(q.framework_code || 'PQF')}</strong></div>
                  <div><span>Levels</span><strong>1 – ${esc(p.level_count || 8)}</strong></div>
                  <div><span>Framework Status</span>${pill(p.policy_status || 'Current','current')}</div>
                  <div><span>As of Date</span><strong>${fmt(p.as_of_date || '2026-08-21')}</strong></div>
                </div>

                <p>${esc(p.notes || fallback.policy.notes)}</p>
                <a href="${esc(p.source_url || 'https://pqf.gov.ph')}" target="_blank" rel="noopener">Learn more about PQF ↗</a>
              </section>

              <section class="nl6439-qualification-card">
                <span>Your Qualification ⓘ</span>
                <div class="nl6439-qualification-title">
                  <span class="nl6439-degree-icon">◆</span>
                  <div>
                    <h3>${esc(q.qualification_title || 'Master of Arts in Nursing')}</h3>
                    <p>${esc(q.field_of_study || 'Nursing Administration and Leadership')}</p>
                  </div>
                </div>
                <div class="nl6439-level-block">
                  <span>${esc(q.framework_code || 'PQF')} Level</span>
                  <strong>${esc(level)}</strong>
                </div>
                ${pill(band,'purple')}
                <small>NurseLink Reference Band</small>
                <b>${esc(band)}</b>
              </section>
            </div>

            <div class="nl6439-provenance">
              <div><span>Source Authority</span><strong>${esc(p.source_authority || fallback.policy.source_authority)}</strong></div>
              <div><span>Official Source</span><a href="${esc(p.source_url || fallback.policy.source_url)}" target="_blank" rel="noopener">${esc(p.source_url || fallback.policy.source_url)} ↗</a></div>
              <div><span>Source Document</span><strong>${esc(p.source_document_title || fallback.policy.source_document_title)}</strong></div>
              <div><span>Source Publication Date</span><strong>${fmt(p.source_publication_date || fallback.policy.source_publication_date)}</strong></div>

              <div><span>Effective Date</span><strong>${fmt(p.effective_date || fallback.policy.effective_date)}</strong></div>
              <div><span>As of Date</span><strong>${fmt(p.as_of_date || fallback.policy.as_of_date)}</strong></div>
              <div><span>Last Verified</span><strong>${fmt(p.last_verified_date || fallback.policy.last_verified_date)}</strong></div>
              <div><span>Version / Revision</span><strong>${esc(p.version_label || fallback.policy.version_label)}</strong></div>

              <div><span>Policy Status</span>${pill(p.policy_status || 'Current','current')}</div>
              <div><span>Verification Status</span><strong>${esc(p.verification_status || fallback.policy.verification_status)}</strong></div>
              <div><span>Mapping Confidence</span>${pill(p.mapping_confidence || q.mapping_confidence || 'High','current')}</div>
            </div>

            <div class="nl6439-policy-note">ⓘ This framework information is based on the official source above and may change when updated by the competent authority.</div>
          </main>

          <aside class="nl6439-right">
            <section class="nl6439-side-card">
              <h2>Professional Standing</h2>
              ${sideItem('◆','Professional Title','Registered Nurse')}
              ${sideItem('✓','License Status',q.is_demo?'Active (Demo)':'See Credentials',true)}
              ${sideItem('▣','Regulatory Authority','Professional Regulation Commission (PRC)')}
              ${sideItem('▤','Framework Verification',q.verification_status || 'Verified')}
            </section>

            <section class="nl6439-side-card">
              <h2>Career Snapshot</h2>
              ${sideItem('●','Role',role)}
              ${sideItem('♟','Specialization',q.field_of_study || 'Medical-Surgical Nursing')}
              ${sideItem('◉','Experience','15+ Years')}
              ${sideItem('⌖','Location Preference','Philippines')}
            </section>
          </aside>
        </div>

        <div class="nl6439-disclaimer">
          <span>♢</span>
          <div>
            <strong>Important Disclaimer</strong>
            <p>NurseLink Qualification Framework Reference is provided for professional profiling, career development and matching purposes only. It does not constitute official recognition, credential equivalency, professional registration, immigration assessment, or authorization to practice.</p>
          </div>
        </div>
      </section>`;
  }

  function findRoot() {
    // Never use .main-area itself: it owns the persistent topbar. During a
    // route transition the page may not exist yet, so wait for it instead.
    return document.querySelector('.main-area .page') || null;
  }

  async function hydrateMemberAvatar(page) {
    const avatar = page?.querySelector('.nl6439-avatar');
    if (!avatar || avatar.tagName === 'IMG') return;

    try {
      const response = await fetch('https://api.amsertech.com/api/profile-photo/image', {
        credentials: 'include',
        headers: { Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8' }
      });

      if (!response.ok) return;

      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) return;

      const image = document.createElement('img');
      const objectUrl = URL.createObjectURL(blob);
      image.className = 'nl6439-avatar';
      image.alt = 'NurseLink member profile photo';
      image.src = objectUrl;
      image.addEventListener('load', () => {
        avatar.replaceWith(image);
      }, { once: true });
      image.addEventListener('error', () => URL.revokeObjectURL(objectUrl), { once: true });
    } catch (_) {
      // Keep the initials fallback when no authenticated photo is available.
    }
  }

  function forceMount(data=fallback) {
    const main = findRoot();
    if (!main) return false;

    main.setAttribute('data-nl6439-force-layout','1');

    // Hide all existing direct children before inserting our approved layout.
    Array.from(main.children).forEach(child => {
      if (!child.classList.contains('nl6439-page')) {
        child.setAttribute('data-nl6439-old','1');
      }
    });

    let page = main.querySelector('.nl6439-page');
    if (!page) {
      main.insertAdjacentHTML('afterbegin', render(data));
      page = main.querySelector('.nl6439-page');
    } else {
      page.outerHTML = render(data);
      page = main.querySelector('.nl6439-page');
    }

    main.querySelector('[data-copy]')?.addEventListener('click',async e=>{
      const val=e.currentTarget.getAttribute('data-copy')||'';
      try{
        await navigator.clipboard.writeText(val);
        e.currentTarget.textContent='✓';
        setTimeout(()=>e.currentTarget.textContent='⧉',900);
      }catch(_){}
    });

    hydrateMemberAvatar(page);

    return true;
  }

  // v64.6.2 single-owner repair hook.
  window.__NL6439_FORCE_MOUNT__ = forceMount;
  window.__NL6439_REFERENCE_FALLBACK__ = fallback;

  // v64.6.5: self-contained SPA renderer API.
  // The renderer is defined on every application document, including /dashboard.
  // It does not mount until the route controller explicitly activates /qualifications.
  window.__NL6439_FORCE_MOUNT__ = forceMount;
  window.__NL6439_REFERENCE_FALLBACK__ = fallback;
  window.__NL6439_RENDER_AVAILABLE__ = true;

  window.__NL6439_MOUNT_MODERN_QUALIFICATIONS__ = function(data) {
    if (!onQualificationsRoute()) return false;
    return forceMount(data || fallback);
  };

  window.__NL6439_UNMOUNT_MODERN_QUALIFICATIONS__ = function() {
    document.querySelectorAll('.nl6439-page').forEach(page => page.remove());
    document.querySelectorAll('[data-nl6439-old="1"]').forEach(el => {
      el.removeAttribute('data-nl6439-old');
    });
    return true;
  };

  // Support direct hard-load of /qualifications without relying on SPA navigation.
  function initialBoot() {
    if (!onQualificationsRoute()) return;
    let tries = 0;
    const attempt = () => {
      if (!onQualificationsRoute()) return;
      if (forceMount(fallback)) return;
      if (++tries < 20) setTimeout(attempt, 150);
    };
    attempt();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialBoot, {once:true});
  } else {
    initialBoot();
  }
})();
