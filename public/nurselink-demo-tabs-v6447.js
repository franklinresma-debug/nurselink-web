/* NurseLink Demo Tabs DB Snapshot Binder v64.4.7 */
(() => {
  if(window.__NL_DEMO_DB_SNAPSHOT_V6447__) return;
  window.__NL_DEMO_DB_SNAPSHOT_V6447__=true;
  if(location.pathname.replace(/\/+$/,'')!=='/qualifications') return;

  const MAP={Certificates:'certificates',Portfolio:'portfolio',Experience:'experience',Licenses:'licenses',Education:'education',Documents:'documents'};
  const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=(v)=>{if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?esc(v):d.toLocaleDateString(undefined,{day:'2-digit',month:'short',year:'numeric'});};
  const pill=(s,g=false)=>`<span class="nl6441-status ${g?'good':''}">${esc(s||'Recorded')}</span>`;
  let DATA=null;

  function active(){
    return document.querySelector('.nl6439-tabs [data-nl6441-tab].active')?.dataset?.nl6441Tab||'';
  }

  const render={
    Certificates:r=>`<article class="nl6441-record-card"><div class="nl6441-record-icon">✚</div><div class="nl6441-record-copy"><div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${pill(r.status,r.verified)}</div><p class="nl6441-sub">${esc(r.issuer||'')}</p>${r.description?`<p>${esc(r.description)}</p>`:''}<div class="nl6441-meta">${r.issue_date?`<span>Issued ${fmt(r.issue_date)}</span>`:''}${r.expiry_date?`<span>Expires ${fmt(r.expiry_date)}</span>`:'<span>No expiry recorded</span>'}${r.credential_number?`<span>No. ${esc(r.credential_number)}</span>`:''}${r.verified?'<span>✓ Verified</span>':''}</div></div></article>`,
    Portfolio:r=>`<article class="nl6441-record-card"><div class="nl6441-record-icon">▤</div><div class="nl6441-record-copy"><div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${pill(r.status,r.published)}</div><p class="nl6441-sub">${esc(r.type||'Portfolio')}</p>${r.description?`<p>${esc(r.description)}</p>`:''}<div class="nl6441-meta">${r.date?`<span>${fmt(r.date)}</span>`:''}</div></div></article>`,
    Experience:r=>`<article class="nl6441-record-card"><div class="nl6441-record-icon">▣</div><div class="nl6441-record-copy"><div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${r.current?pill('Current',true):''}</div><p class="nl6441-sub">${esc(r.organization||'')}${r.location?` · ${esc(r.location)}`:''}</p>${r.description?`<p>${esc(r.description)}</p>`:''}<div class="nl6441-meta"><span>${fmt(r.start_date)}${r.current?' – Present':(r.end_date?` – ${fmt(r.end_date)}`:'')}</span></div></div></article>`,
    Licenses:r=>`<article class="nl6441-record-card"><div class="nl6441-record-icon">♜</div><div class="nl6441-record-copy"><div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${pill(r.status,r.verified)}</div><p class="nl6441-sub">${esc(r.authority||'')}${r.country?` · ${esc(r.country)}`:''}</p><div class="nl6441-meta">${r.number?`<span>No. ${esc(r.number)}</span>`:''}${r.issue_date?`<span>Issued ${fmt(r.issue_date)}</span>`:''}${r.expiry_date?`<span>Valid until ${fmt(r.expiry_date)}</span>`:''}</div></div></article>`,
    Education:r=>`<article class="nl6441-record-card"><div class="nl6441-record-icon">◇</div><div class="nl6441-record-copy"><div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${pill(r.status,false)}</div><p class="nl6441-sub">${esc(r.institution||'')}${r.field?` · ${esc(r.field)}`:''}</p>${r.description?`<p>${esc(r.description)}</p>`:''}<div class="nl6441-meta"><span>${fmt(r.start_date)}${r.end_date?` – ${fmt(r.end_date)}`:''}</span></div></div></article>`,
    Documents:r=>`<article class="nl6441-record-card"><div class="nl6441-record-icon">▱</div><div class="nl6441-record-copy"><div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${pill(r.status,false)}</div><p class="nl6441-sub">${esc(r.type||'Document')}</p>${r.description?`<p>${esc(r.description)}</p>`:''}<div class="nl6441-meta">${r.uploaded_at?`<span>Uploaded ${fmt(r.uploaded_at)}</span>`:''}</div></div></article>`
  };

  function draw(label){
    if(!DATA||!MAP[label])return false;
    const host=document.querySelector('.nl6441-tab-host');
    if(!host||host.hidden)return false;
    const rows=DATA[MAP[label]]||[];
    host.innerHTML=`<section class="nl6441-inline-panel nl6447-snapshot-panel">
      <div class="nl6441-inline-head">
        <div><div class="eyebrow">Member Professional Profile</div><h2>${esc(label)}</h2>
        <p>Database-backed demo records for ${esc(DATA.member_number||'NL-2026-000001')}.</p></div>
        <div class="nl6441-count"><strong>${rows.length}</strong><span>record${rows.length===1?'':'s'}</span></div>
      </div>
      <div class="nl6441-record-list">${rows.length?rows.map(render[label]).join(''):`<div class="nl6441-empty"><div>＋</div><h3>No ${esc(label.toLowerCase())} records</h3><p>The database snapshot has no records for this tab.</p></div>`}</div>
    </section>`;
    return true;
  }

  async function load(){
    const r=await fetch(`/nurselink-demo-profile-v6447.json?_=${Date.now()}`,{cache:'no-store'});
    if(!r.ok)throw new Error(`Snapshot HTTP ${r.status}`);
    DATA=await r.json();
    document.documentElement.setAttribute('data-nl6447-ready','1');
  }

  async function boot(){
    try{await load();}catch(e){console.error('NurseLink v64.4.7 snapshot load failed',e);return;}

    if(MAP[active()])draw(active());

    document.addEventListener('click',e=>{
      const btn=e.target.closest('[data-nl6441-tab]');
      if(!btn)return;
      const label=btn.dataset.nl6441Tab;
      if(!MAP[label])return;
      setTimeout(()=>draw(label),0);
      setTimeout(()=>draw(label),80);
      setTimeout(()=>draw(label),220);
    },true);

    let timer=null;
    new MutationObserver(()=>{
      clearTimeout(timer);
      timer=setTimeout(()=>{
        const label=active();
        if(MAP[label]&&!document.querySelector('.nl6441-tab-host .nl6447-snapshot-panel'))draw(label);
      },70);
    }).observe(document.documentElement,{subtree:true,childList:true});
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
