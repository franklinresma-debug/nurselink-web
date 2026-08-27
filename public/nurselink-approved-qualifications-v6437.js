/* NurseLink Approved Qualifications Page Layout v64.3.7 */
(() => {
  if (window.__NL_APPROVED_QUALIFICATIONS_V6437__) return;
  window.__NL_APPROVED_QUALIFICATIONS_V6437__=true;
  if (location.pathname.replace(/\/+$/,'') !== '/qualifications') return;

  const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=(v)=>{if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?esc(v):d.toLocaleDateString(undefined,{day:'2-digit',month:'short',year:'numeric'});};

  function identity(){
    const chip=document.querySelector('.user-chip,.nurselink-super-admin-user');
    return {
      name:chip?.querySelector('strong')?.textContent?.trim()||'NurseLink Member',
      memberNumber:chip?.querySelector('small')?.textContent?.trim()||'',
      img:chip?.querySelector('img')?.getAttribute('src')||''
    };
  }

  async function load(){
    const r=await fetch('/api/member-qualification-framework-v6437/me',{credentials:'include',headers:{Accept:'application/json'}});
    if(!r.ok)return null;
    const j=await r.json().catch(()=>null);
    return j?.data||null;
  }

  function render(data){
    const q=data.qualification||{},p=data.policy||{},u=identity();
    const score=Math.round(Number(q.professional_readiness_score||0));
    const level=String(q.framework_level||'').replace(/^Level\s*/i,'')||'—';
    return `
    <section class="nl6437-qualifications-page">
      <div class="nl6437-title">
        <div><div class="eyebrow">Professional Qualifications</div><h1>My Qualifications</h1>
        <p>Manage your professional qualifications and see how they are referenced within the applicable national qualification framework.</p></div>
        <button type="button" onclick="window.print()">Export to PDF</button>
      </div>

      <div class="nl6437-hero">
        <div class="nl6437-person">
          ${u.img?`<img src="${esc(u.img)}" alt="">`:`<div class="nl6437-avatar">NL</div>`}
          <div><span>MEMBER</span><strong>${esc(data.member_number||u.memberNumber||'—')}</strong>
          <h2>${esc(u.name)}</h2><p>${esc(q.professional_role||'Registered Nurse')}</p></div>
        </div>
        <div class="nl6437-score"><span>Professional Readiness</span><strong>${score}<small>/100</small></strong><em>${esc(q.nurselink_reference_band||'Needs Review')}</em></div>
      </div>

      <nav class="nl6437-tabs"><span>Overview</span><strong>Qualifications</strong><span>Certificates</span><span>Portfolio</span><span>Experience</span><span>Licenses</span><span>Education</span><span>Documents</span></nav>

      <div class="nl6437-layout">
        <main class="nl6437-main">
          <h2>Qualification Framework Reference</h2>
          <div class="nl6437-framework-row">
            <section class="nl6437-framework">
              <span>${esc(q.country_name||'—')}</span><h3>${esc(q.framework_name||q.framework_code||'Qualification Framework')}</h3><small>National Qualifications Framework</small>
              <div class="nl6437-meta">
                <div><span>Framework Code</span><strong>${esc(q.framework_code||'—')}</strong></div>
                <div><span>Levels</span><strong>${esc(p.level_count?`1 – ${p.level_count}`:'—')}</strong></div>
                <div><span>Framework Status</span><strong>${esc(p.policy_status||'—')}</strong></div>
                <div><span>As of Date</span><strong>${fmt(p.as_of_date||p.updated_at)}</strong></div>
              </div>
              <p>${esc(p.notes||'Framework information may change when updated by the competent authority.')}</p>
              ${p.source_url?`<a href="${esc(p.source_url)}" target="_blank" rel="noopener">Learn more about ${esc(q.framework_code||'framework')} ↗</a>`:''}
            </section>

            <section class="nl6437-level-card">
              <span>Your Qualification</span><h3>${esc(q.qualification_title||'—')}</h3><p>${esc(q.field_of_study||'')}</p>
              <div class="nl6437-level"><span>${esc(q.framework_code||'')} Level</span><strong>${esc(level)}</strong></div>
              <em>${esc(q.nurselink_reference_band||'Needs Review')}</em><small>NurseLink Reference Band</small><b>${esc(q.nurselink_reference_band||'—')}</b>
            </section>
          </div>

          <div class="nl6437-provenance">
            <div><span>Source Authority</span><strong>${esc(p.source_authority||'—')}</strong></div>
            <div><span>Official Source</span>${p.source_url?`<a href="${esc(p.source_url)}" target="_blank" rel="noopener">Open source ↗</a>`:'<strong>—</strong>'}</div>
            <div><span>Source Document</span><strong>${esc(p.source_document_title||'—')}</strong></div>
            <div><span>Source Publication Date</span><strong>${fmt(p.source_publication_date)}</strong></div>
            <div><span>Effective Date</span><strong>${fmt(p.effective_date)}</strong></div>
            <div><span>As of Date</span><strong>${fmt(p.as_of_date||p.updated_at)}</strong></div>
            <div><span>Last Verified</span><strong>${fmt(p.last_verified_date||p.updated_at)}</strong></div>
            <div><span>Version / Revision</span><strong>${esc(p.version_label||'current')}</strong></div>
            <div><span>Policy Status</span><strong>${esc(p.policy_status||'—')}</strong></div>
            <div><span>Verification Status</span><strong>${esc(p.verification_status||q.verification_status||'—')}</strong></div>
            <div><span>Mapping Confidence</span><strong>${esc(p.mapping_confidence||q.mapping_confidence||'—')}</strong></div>
          </div>
        </main>

        <aside class="nl6437-side">
          <section><h2>Professional Standing</h2>
            <div><span>Professional Title</span><strong>Registered Nurse</strong></div>
            <div><span>License Status</span><strong>${q.is_demo?'Active (Demo)':'See Credentials'}</strong></div>
            <div><span>Regulatory Authority</span><strong>Professional Regulation Commission (PRC)</strong></div>
            <div><span>Framework Verification</span><strong>${esc(q.verification_status||'—')}</strong></div>
          </section>
          <section><h2>Career Snapshot</h2>
            <div><span>Role</span><strong>${esc(q.professional_role||'—')}</strong></div>
            <div><span>Specialization</span><strong>${esc(q.field_of_study||'—')}</strong></div>
            <div><span>Career Level</span><strong>${esc(q.career_level||'—')}</strong></div>
            <div><span>Reference Band</span><strong>${esc(q.nurselink_reference_band||'—')}</strong></div>
          </section>
        </aside>
      </div>

      <div class="nl6437-disclaimer"><strong>Important Disclaimer</strong><p>NurseLink Qualification Framework Reference is provided for professional profiling, career development and matching purposes only. It does not constitute official recognition, credential equivalency, professional registration, immigration assessment, or authorization to practice.</p></div>
    </section>`;
  }

  async function init(){
    const data=await load().catch(()=>null);
    if(!data)return;
    const main=document.querySelector('.main-area main,.main-area .page,.main-area')||document.querySelector('main');
    if(!main||main.querySelector('.nl6437-qualifications-page'))return;
    main.querySelectorAll('.nl6436-qualifications-page,.nl6433-qf-card,.nl-qf-reference-v6431').forEach(el=>el.style.display='none');
    const header=main.querySelector('.page-header'); if(header)header.style.display='none';
    main.insertAdjacentHTML('afterbegin',render(data));
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();
