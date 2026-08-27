/* NurseLink Demo Tab Data Display Fix v64.4.3 */
(() => {
  if (window.__NL_DEMO_TAB_DISPLAY_FIX_V6443__) return;
  window.__NL_DEMO_TAB_DISPLAY_FIX_V6443__=true;

  if (location.pathname.replace(/\/+$/,'') !== '/qualifications') return;

  const TYPE_BY_LABEL={
    Certificates:'certificates',
    Portfolio:'portfolio',
    Experience:'experience',
    Licenses:'licenses',
    Education:'education',
    Documents:'documents'
  };

  const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=(v)=>{
    if(!v)return'—';
    const d=new Date(v);
    return Number.isNaN(d.getTime())?esc(v):d.toLocaleDateString(undefined,{day:'2-digit',month:'short',year:'numeric'});
  };

  function memberNumber(){
    const fromPage=document.querySelector('.nl6439-member-number')?.textContent?.match(/NL-\d{4}-\d+/)?.[0];
    if(fromPage)return fromPage;
    const chip=document.querySelector('.user-chip small,.nurselink-super-admin-user small')?.textContent?.trim();
    if(chip)return chip;
    return 'NL-2026-000001';
  }

  function status(s,good=false){
    return `<span class="nl6441-status ${good?'good':''}">${esc(s||'Recorded')}</span>`;
  }

  function cert(r){
    return `<article class="nl6441-record-card">
      <div class="nl6441-record-icon">✚</div>
      <div class="nl6441-record-copy">
        <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${status(r.status,r.verified)}</div>
        <p class="nl6441-sub">${esc(r.issuer||'')}</p>
        ${r.description?`<p>${esc(r.description)}</p>`:''}
        <div class="nl6441-meta">
          ${r.issue_date?`<span>Issued ${fmt(r.issue_date)}</span>`:''}
          ${r.expiry_date?`<span>Expires ${fmt(r.expiry_date)}</span>`:'<span>No expiry recorded</span>'}
          ${r.credential_number?`<span>No. ${esc(r.credential_number)}</span>`:''}
          ${r.verified?'<span>✓ Verified</span>':''}
        </div>
      </div>
    </article>`;
  }

  function portfolio(r){
    return `<article class="nl6441-record-card">
      <div class="nl6441-record-icon">▤</div>
      <div class="nl6441-record-copy">
        <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${status(r.status,r.published)}</div>
        <p class="nl6441-sub">${esc(r.type||'Portfolio')}</p>
        ${r.description?`<p>${esc(r.description)}</p>`:''}
        <div class="nl6441-meta">${r.date?`<span>${fmt(r.date)}</span>`:''}${r.published?'<span>✓ Published</span>':''}</div>
      </div>
    </article>`;
  }

  function experience(r){
    return `<article class="nl6441-record-card">
      <div class="nl6441-record-icon">▣</div>
      <div class="nl6441-record-copy">
        <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${r.current?status('Current',true):''}</div>
        <p class="nl6441-sub">${esc(r.organization||'')}${r.location?` · ${esc(r.location)}`:''}</p>
        ${r.description?`<p>${esc(r.description)}</p>`:''}
        <div class="nl6441-meta"><span>${fmt(r.start_date)}${r.current?' – Present':(r.end_date?` – ${fmt(r.end_date)}`:'')}</span></div>
      </div>
    </article>`;
  }

  function license(r){
    return `<article class="nl6441-record-card">
      <div class="nl6441-record-icon">♜</div>
      <div class="nl6441-record-copy">
        <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${status(r.status,r.verified)}</div>
        <p class="nl6441-sub">${esc(r.authority||'')}${r.country?` · ${esc(r.country)}`:''}</p>
        <div class="nl6441-meta">
          ${r.number?`<span>No. ${esc(r.number)}</span>`:''}
          ${r.issue_date?`<span>Issued ${fmt(r.issue_date)}</span>`:''}
          ${r.expiry_date?`<span>Valid until ${fmt(r.expiry_date)}</span>`:''}
          ${r.verified?'<span>✓ Verified</span>':''}
        </div>
      </div>
    </article>`;
  }

  function education(r){
    return `<article class="nl6441-record-card">
      <div class="nl6441-record-icon">◇</div>
      <div class="nl6441-record-copy">
        <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${status(r.status,false)}</div>
        <p class="nl6441-sub">${esc(r.institution||'')}${r.field?` · ${esc(r.field)}`:''}</p>
        ${r.description?`<p>${esc(r.description)}</p>`:''}
        <div class="nl6441-meta"><span>${fmt(r.start_date)}${r.end_date?` – ${fmt(r.end_date)}`:''}</span></div>
      </div>
    </article>`;
  }

  function documentCard(r){
    return `<article class="nl6441-record-card">
      <div class="nl6441-record-icon">▱</div>
      <div class="nl6441-record-copy">
        <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${status(r.status,false)}</div>
        <p class="nl6441-sub">${esc(r.type||'Document')}</p>
        ${r.description?`<p>${esc(r.description)}</p>`:''}
        <div class="nl6441-meta">${r.uploaded_at?`<span>Uploaded ${fmt(r.uploaded_at)}</span>`:''}</div>
      </div>
    </article>`;
  }

  const renderers={
    Certificates:cert,
    Portfolio:portfolio,
    Experience:experience,
    Licenses:license,
    Education:education,
    Documents:documentCard
  };

  let DATA=null;

  async function loadData(){
    const mn=memberNumber();
    const r=await fetch(`/api/member-profile-tabs-v6443?member_number=${encodeURIComponent(mn)}`,{
      credentials:'include',
      headers:{Accept:'application/json'}
    });
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const j=await r.json();
    DATA=j?.data||null;
    document.documentElement.setAttribute('data-nl6443-demo-data-ready','1');
    return DATA;
  }

  function activeLabel(){
    const active=document.querySelector('.nl6439-tabs [data-nl6441-tab].active');
    return active?.dataset?.nl6441Tab || '';
  }

  function replacePanel(label){
    if(!DATA || !TYPE_BY_LABEL[label])return false;
    const host=document.querySelector('.nl6441-tab-host');
    if(!host || host.hidden)return false;

    const type=TYPE_BY_LABEL[label];
    const records=DATA[type]||[];
    const renderer=renderers[label];
    if(!renderer)return false;

    host.innerHTML=`
      <section class="nl6441-inline-panel nl6443-demo-filled" data-tab-panel="${esc(label)}">
        <div class="nl6441-inline-head">
          <div><div class="eyebrow">Member Professional Profile</div><h2>${esc(label)}</h2>
          <p>Database-backed demo records for ${esc(memberNumber())}.</p></div>
          <div class="nl6441-count"><strong>${records.length}</strong><span>record${records.length===1?'':'s'}</span></div>
        </div>
        <div class="nl6441-record-list">${records.map(renderer).join('')}</div>
      </section>`;
    return true;
  }

  async function boot(){
    try{await loadData();}catch(e){
      console.warn('NurseLink demo profile data v64.4.3 unavailable:',e);
      return;
    }

    const label=activeLabel();
    if(label)replacePanel(label);

    document.addEventListener('click',e=>{
      const btn=e.target.closest('[data-nl6441-tab]');
      if(!btn)return;
      const label=btn.dataset.nl6441Tab;
      if(!TYPE_BY_LABEL[label])return;
      setTimeout(()=>replacePanel(label),0);
      setTimeout(()=>replacePanel(label),80);
    },true);

    let timer=null;
    new MutationObserver(()=>{
      clearTimeout(timer);
      timer=setTimeout(()=>{
        const label=activeLabel();
        if(TYPE_BY_LABEL[label]){
          const filled=document.querySelector('.nl6441-tab-host .nl6443-demo-filled');
          if(!filled)replacePanel(label);
        }
      },60);
    }).observe(document.documentElement,{subtree:true,childList:true});
  }

  document.readyState==='loading'
    ? document.addEventListener('DOMContentLoaded',boot,{once:true})
    : boot();
})();
