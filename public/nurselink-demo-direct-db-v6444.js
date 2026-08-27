/* NurseLink Demo Tab Direct DB Display v64.4.4 */
(() => {
  if(window.__NL_DEMO_DIRECT_DB_V6444__)return;
  window.__NL_DEMO_DIRECT_DB_V6444__=true;

  if(location.pathname.replace(/\/+$/,'')!=='/qualifications')return;

  const TYPES={
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
  const status=(s,good=false)=>`<span class="nl6441-status ${good?'good':''}">${esc(s||'Recorded')}</span>`;

  let DATA=null;

  function memberNumber(){
    return document.querySelector('.nl6439-member-number')?.textContent?.match(/NL-\d{4}-\d+/)?.[0]
      || document.querySelector('.user-chip small,.nurselink-super-admin-user small')?.textContent?.trim()
      || 'NL-2026-000001';
  }

  function cert(r){
    return `<article class="nl6441-record-card"><div class="nl6441-record-icon">✚</div><div class="nl6441-record-copy">
      <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${status(r.status,r.verified)}</div>
      <p class="nl6441-sub">${esc(r.issuer||'')}</p>${r.description?`<p>${esc(r.description)}</p>`:''}
      <div class="nl6441-meta">${r.issue_date?`<span>Issued ${fmt(r.issue_date)}</span>`:''}${r.expiry_date?`<span>Expires ${fmt(r.expiry_date)}</span>`:'<span>No expiry recorded</span>'}${r.credential_number?`<span>No. ${esc(r.credential_number)}</span>`:''}${r.verified?'<span>✓ Verified</span>':''}</div>
    </div></article>`;
  }

  function portfolio(r){
    return `<article class="nl6441-record-card"><div class="nl6441-record-icon">▤</div><div class="nl6441-record-copy">
      <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${status(r.status,r.published)}</div>
      <p class="nl6441-sub">${esc(r.type||'Portfolio')}</p>${r.description?`<p>${esc(r.description)}</p>`:''}
      <div class="nl6441-meta">${r.date?`<span>${fmt(r.date)}</span>`:''}${r.published?'<span>✓ Published</span>':''}</div>
    </div></article>`;
  }

  function experience(r){
    return `<article class="nl6441-record-card"><div class="nl6441-record-icon">▣</div><div class="nl6441-record-copy">
      <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${r.current?status('Current',true):''}</div>
      <p class="nl6441-sub">${esc(r.organization||'')}${r.location?` · ${esc(r.location)}`:''}</p>${r.description?`<p>${esc(r.description)}</p>`:''}
      <div class="nl6441-meta"><span>${fmt(r.start_date)}${r.current?' – Present':(r.end_date?` – ${fmt(r.end_date)}`:'')}</span></div>
    </div></article>`;
  }

  function license(r){
    return `<article class="nl6441-record-card"><div class="nl6441-record-icon">♜</div><div class="nl6441-record-copy">
      <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${status(r.status,r.verified)}</div>
      <p class="nl6441-sub">${esc(r.authority||'')}${r.country?` · ${esc(r.country)}`:''}</p>
      <div class="nl6441-meta">${r.number?`<span>No. ${esc(r.number)}</span>`:''}${r.issue_date?`<span>Issued ${fmt(r.issue_date)}</span>`:''}${r.expiry_date?`<span>Valid until ${fmt(r.expiry_date)}</span>`:''}${r.verified?'<span>✓ Verified</span>':''}</div>
    </div></article>`;
  }

  function education(r){
    return `<article class="nl6441-record-card"><div class="nl6441-record-icon">◇</div><div class="nl6441-record-copy">
      <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${status(r.status,false)}</div>
      <p class="nl6441-sub">${esc(r.institution||'')}${r.field?` · ${esc(r.field)}`:''}</p>${r.description?`<p>${esc(r.description)}</p>`:''}
      <div class="nl6441-meta"><span>${fmt(r.start_date)}${r.end_date?` – ${fmt(r.end_date)}`:''}</span></div>
    </div></article>`;
  }

  function documentCard(r){
    return `<article class="nl6441-record-card"><div class="nl6441-record-icon">▱</div><div class="nl6441-record-copy">
      <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${status(r.status,false)}</div>
      <p class="nl6441-sub">${esc(r.type||'Document')}</p>${r.description?`<p>${esc(r.description)}</p>`:''}
      <div class="nl6441-meta">${r.uploaded_at?`<span>Uploaded ${fmt(r.uploaded_at)}</span>`:''}</div>
    </div></article>`;
  }

  const renderers={Certificates:cert,Portfolio:portfolio,Experience:experience,Licenses:license,Education:education,Documents:documentCard};

  function activeLabel(){
    return document.querySelector('.nl6439-tabs [data-nl6441-tab].active')?.dataset?.nl6441Tab || '';
  }

  function renderTab(label){
    if(!DATA||!TYPES[label])return false;
    const host=document.querySelector('.nl6441-tab-host');
    if(!host||host.hidden)return false;

    const records=DATA[TYPES[label]]||[];
    host.innerHTML=`<section class="nl6441-inline-panel nl6444-db-panel" data-tab-panel="${esc(label)}">
      <div class="nl6441-inline-head">
        <div><div class="eyebrow">Member Professional Profile</div><h2>${esc(label)}</h2>
        <p>Database records for ${esc(memberNumber())}.</p></div>
        <div class="nl6441-count"><strong>${records.length}</strong><span>record${records.length===1?'':'s'}</span></div>
      </div>
      <div class="nl6441-record-list">${records.length?records.map(renderers[label]).join(''):`<div class="nl6441-empty"><div>＋</div><h3>No ${esc(label.toLowerCase())} records</h3><p>The database endpoint returned no records for this category.</p></div>`}</div>
    </section>`;
    return true;
  }

  async function load(){
    const mn=memberNumber();
    const url=`/api/demo-profile-tabs-v6444/${encodeURIComponent(mn)}?_=${Date.now()}`;
    const r=await fetch(url,{headers:{Accept:'application/json'},cache:'no-store'});
    if(!r.ok)throw new Error(`Demo DB endpoint HTTP ${r.status}`);
    const j=await r.json();
    DATA=j?.data||null;
    if(!DATA)throw new Error('Demo DB endpoint returned no data');
    document.documentElement.setAttribute('data-nl6444-db-ready','1');
  }

  async function boot(){
    try{
      await load();
    }catch(e){
      console.error('NurseLink v64.4.4 demo DB load failed',e);
      return;
    }

    const current=activeLabel();
    if(TYPES[current])renderTab(current);

    document.addEventListener('click',e=>{
      const btn=e.target.closest('[data-nl6441-tab]');
      if(!btn)return;
      const label=btn.dataset.nl6441Tab;
      if(!TYPES[label])return;
      setTimeout(()=>renderTab(label),0);
      setTimeout(()=>renderTab(label),60);
      setTimeout(()=>renderTab(label),180);
    },true);

    let t=null;
    new MutationObserver(()=>{
      clearTimeout(t);
      t=setTimeout(()=>{
        const label=activeLabel();
        if(TYPES[label]&&!document.querySelector('.nl6441-tab-host .nl6444-db-panel'))renderTab(label);
      },80);
    }).observe(document.documentElement,{subtree:true,childList:true});
  }

  document.readyState==='loading'
    ? document.addEventListener('DOMContentLoaded',boot,{once:true})
    : boot();
})();
