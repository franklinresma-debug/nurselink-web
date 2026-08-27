/* NurseLink Live DB Overview + Inline Tabs v64.4.8 */
(() => {
  if(window.__NL_LIVE_DB_OVERVIEW_V6448__) return;
  window.__NL_LIVE_DB_OVERVIEW_V6448__=true;

  if(location.pathname.replace(/\/+$/,'')!=='/qualifications') return;

  const TABS=['Overview','Qualifications','Certificates','Portfolio','Experience','Licenses','Education','Documents'];
  const DATA_TABS={
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
  const pill=(s,g=false)=>`<span class="nl6441-status ${g?'good':''}">${esc(s||'Recorded')}</span>`;

  let DATA=null;
  let ACTIVE='Overview';
  let pending=false;

  function memberNumber(){
    return document.querySelector('.nl6439-member-number')?.textContent?.match(/NL-\d{4}-\d+/)?.[0]
      || 'NL-2026-000001';
  }

  function page(){return document.querySelector('.nl6439-page');}
  function nav(){return page()?.querySelector('.nl6439-tabs');}
  function host(){return page()?.querySelector('.nl6441-tab-host');}
  function layout(){return page()?.querySelector('.nl6439-layout');}
  function disclaimer(){return page()?.querySelector('.nl6439-disclaimer');}

  function card(label,count,icon){
    return `<button type="button" class="nl6448-overview-card" data-nl6448-open="${esc(label)}">
      <span>${icon}</span><strong>${count}</strong><small>${esc(label)}</small>
    </button>`;
  }

  function renderOverview(){
    const d=DATA||{};
    return `<section class="nl6441-inline-panel nl6448-live-panel">
      <div class="nl6441-inline-head">
        <div><div class="eyebrow">Professional Profile</div><h2>Overview</h2>
        <p>A live summary of the records currently stored in this member's NurseLink database profile.</p></div>
      </div>
      <div class="nl6448-overview-grid">
        ${card('Certificates',(d.certificates||[]).length,'♢')}
        ${card('Portfolio',(d.portfolio||[]).length,'▤')}
        ${card('Experience',(d.experience||[]).length,'▣')}
        ${card('Licenses',(d.licenses||[]).length,'♜')}
        ${card('Education',(d.education||[]).length,'◇')}
        ${card('Documents',(d.documents||[]).length,'▱')}
      </div>
      <div class="nl6448-live-note">Live database source · refreshed when this profile page loads</div>
    </section>`;
  }

  const renderers={
    Certificates:r=>`<article class="nl6441-record-card"><div class="nl6441-record-icon">✚</div><div class="nl6441-record-copy">
      <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${pill(r.status,r.verified)}</div>
      <p class="nl6441-sub">${esc(r.issuer||'')}</p>${r.description?`<p>${esc(r.description)}</p>`:''}
      <div class="nl6441-meta">${r.issue_date?`<span>Issued ${fmt(r.issue_date)}</span>`:''}${r.expiry_date?`<span>Expires ${fmt(r.expiry_date)}</span>`:'<span>No expiry recorded</span>'}${r.credential_number?`<span>No. ${esc(r.credential_number)}</span>`:''}${r.verified?'<span>✓ Verified</span>':''}</div>
    </div></article>`,
    Portfolio:r=>`<article class="nl6441-record-card"><div class="nl6441-record-icon">▤</div><div class="nl6441-record-copy">
      <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${pill(r.status,r.published)}</div>
      <p class="nl6441-sub">${esc(r.type||'Portfolio')}</p>${r.description?`<p>${esc(r.description)}</p>`:''}
      <div class="nl6441-meta">${r.date?`<span>${fmt(r.date)}</span>`:''}${r.published?'<span>✓ Published</span>':''}</div>
    </div></article>`,
    Experience:r=>`<article class="nl6441-record-card"><div class="nl6441-record-icon">▣</div><div class="nl6441-record-copy">
      <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${r.current?pill('Current',true):''}</div>
      <p class="nl6441-sub">${esc(r.organization||'')}${r.location?` · ${esc(r.location)}`:''}</p>${r.description?`<p>${esc(r.description)}</p>`:''}
      <div class="nl6441-meta"><span>${fmt(r.start_date)}${r.current?' – Present':(r.end_date?` – ${fmt(r.end_date)}`:'')}</span></div>
    </div></article>`,
    Licenses:r=>`<article class="nl6441-record-card"><div class="nl6441-record-icon">♜</div><div class="nl6441-record-copy">
      <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${pill(r.status,r.verified)}</div>
      <p class="nl6441-sub">${esc(r.authority||'')}${r.country?` · ${esc(r.country)}`:''}</p>
      <div class="nl6441-meta">${r.number?`<span>No. ${esc(r.number)}</span>`:''}${r.issue_date?`<span>Issued ${fmt(r.issue_date)}</span>`:''}${r.expiry_date?`<span>Valid until ${fmt(r.expiry_date)}</span>`:''}${r.verified?'<span>✓ Verified</span>':''}</div>
    </div></article>`,
    Education:r=>`<article class="nl6441-record-card"><div class="nl6441-record-icon">◇</div><div class="nl6441-record-copy">
      <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${pill(r.status,false)}</div>
      <p class="nl6441-sub">${esc(r.institution||'')}${r.field?` · ${esc(r.field)}`:''}</p>${r.description?`<p>${esc(r.description)}</p>`:''}
      <div class="nl6441-meta"><span>${fmt(r.start_date)}${r.end_date?` – ${fmt(r.end_date)}`:''}</span></div>
    </div></article>`,
    Documents:r=>`<article class="nl6441-record-card"><div class="nl6441-record-icon">▱</div><div class="nl6441-record-copy">
      <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${pill(r.status,false)}</div>
      <p class="nl6441-sub">${esc(r.type||'Document')}</p>${r.description?`<p>${esc(r.description)}</p>`:''}
      <div class="nl6441-meta">${r.uploaded_at?`<span>Uploaded ${fmt(r.uploaded_at)}</span>`:''}</div>
    </div></article>`
  };

  function renderDataTab(label){
    const key=DATA_TABS[label];
    const rows=DATA?.[key]||[];
    const renderer=renderers[label];

    return `<section class="nl6441-inline-panel nl6448-live-panel">
      <div class="nl6441-inline-head">
        <div><div class="eyebrow">Member Professional Profile</div><h2>${esc(label)}</h2>
        <p>Live database records for ${esc(memberNumber())}.</p></div>
        <div class="nl6441-count"><strong>${rows.length}</strong><span>record${rows.length===1?'':'s'}</span></div>
      </div>
      <div class="nl6441-record-list">
        ${rows.length?rows.map(renderer).join(''):`<div class="nl6441-empty"><div>＋</div><h3>No ${esc(label.toLowerCase())} records</h3><p>No database records are currently available for this tab.</p></div>`}
      </div>
      <div class="nl6448-live-note">Live database source · ${esc(DATA?.member_number||memberNumber())}</div>
    </section>`;
  }

  function updateNav(){
    nav()?.querySelectorAll('[data-nl6441-tab]').forEach(btn=>{
      const active=btn.dataset.nl6441Tab===ACTIVE;
      btn.classList.toggle('active',active);
      if(active)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current');
    });
  }

  function show(label){
    if(!TABS.includes(label))label='Overview';
    ACTIVE=label;
    updateNav();

    const h=host(), l=layout(), d=disclaimer();
    if(!h)return false;

    if(label==='Qualifications'){
      h.hidden=true;
      if(l)l.hidden=false;
      if(d)d.hidden=false;
    }else{
      if(l)l.hidden=true;
      if(d)d.hidden=true;
      h.hidden=false;
      h.innerHTML=label==='Overview'?renderOverview():renderDataTab(label);
    }

    history.replaceState(null,'',`${location.pathname}#${label.toLowerCase()}`);
    return true;
  }

  async function refresh(){
    if(pending)return;
    pending=true;
    try{
      const r=await fetch(`/api/member-profile-live-v6448/${encodeURIComponent(memberNumber())}?_=${Date.now()}`,{
        cache:'no-store',
        headers:{Accept:'application/json'}
      });
      if(!r.ok)throw new Error(`HTTP ${r.status}`);
      const j=await r.json();
      DATA=j?.data||{};
      document.documentElement.setAttribute('data-nl6448-live-db','1');
      show(ACTIVE);
    }catch(e){
      console.error('NurseLink v64.4.8 live database fetch failed',e);
    }finally{
      pending=false;
    }
  }

  function bind(){
    const p=page(), n=nav();
    if(!p||!n)return false;

    // v64.4.1 already has the correct tab buttons. We only replace behavior.
    n.querySelectorAll('[data-nl6441-tab]').forEach(btn=>{
      if(btn.dataset.nl6448Bound==='1')return;
      btn.addEventListener('click',e=>{
        e.preventDefault();
        e.stopImmediatePropagation();
        show(btn.dataset.nl6441Tab);
      },true);
      btn.dataset.nl6448Bound='1';
    });

    document.addEventListener('click',e=>{
      const card=e.target.closest('[data-nl6448-open]');
      if(!card)return;
      e.preventDefault();
      show(card.dataset.nl6448Open);
    },true);

    return true;
  }

  function initialTab(){
    const hash=(location.hash||'').replace('#','').toLowerCase();
    return TABS.find(t=>t.toLowerCase()===hash)||'Overview';
  }

  async function boot(){
    let tries=0;
    while(!bind() && tries++<30){
      await new Promise(r=>setTimeout(r,150));
    }
    ACTIVE=initialTab();
    show(ACTIVE);
    await refresh();
  }

  document.readyState==='loading'
    ? document.addEventListener('DOMContentLoaded',boot,{once:true})
    : boot();

  // Keep v64.4.1 from winning after its own asynchronous redraw.
  let timer=null;
  new MutationObserver(()=>{
    clearTimeout(timer);
    timer=setTimeout(()=>{
      bind();
      const p=page();
      if(!p)return;
      if(ACTIVE!=='Qualifications'){
        const current=host()?.querySelector('.nl6448-live-panel');
        if(!current)show(ACTIVE);
      }
    },70);
  }).observe(document.documentElement,{subtree:true,childList:true});
})();
