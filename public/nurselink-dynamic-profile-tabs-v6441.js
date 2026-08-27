/* NurseLink Dynamic Member Profile Tabs v64.4.1 */
(() => {
  if (window.__NL_DYNAMIC_PROFILE_TABS_V6441__) return;
  window.__NL_DYNAMIC_PROFILE_TABS_V6441__=true;

  const onQualificationsRoute = () => location.pathname.replace(/\/+$/,'') === '/qualifications';

  const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=(v)=>{
    if(!v)return'—';
    const d=new Date(v);
    return Number.isNaN(d.getTime())?esc(v):d.toLocaleDateString(undefined,{day:'2-digit',month:'short',year:'numeric'});
  };

  const STATE={data:null,active:'Qualifications',loading:false};

  function tabs(){
    return ['Overview','Qualifications','Certificates','Portfolio','Experience','Licenses','Education','Documents'];
  }

  function icon(label){
    return ({
      Overview:'▣',Qualifications:'◇',Certificates:'♢',Portfolio:'▤',
      Experience:'▣',Licenses:'♜',Education:'◇',Documents:'▱'
    })[label]||'•';
  }

  function statusPill(status,good=false){
    return `<span class="nl6441-status ${good?'good':''}">${esc(status||'Recorded')}</span>`;
  }

  function empty(title,description){
    return `<div class="nl6441-empty"><div>＋</div><h3>${esc(title)}</h3><p>${esc(description)}</p></div>`;
  }

  function dates(a,b,current=false){
    if(!a&&!b)return'';
    return `<span>${fmt(a)}${current?' – Present':(b?` – ${fmt(b)}`:'')}</span>`;
  }

  function certificateCard(r){
    return `<article class="nl6441-record-card">
      <div class="nl6441-record-icon">✚</div>
      <div class="nl6441-record-copy">
        <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${statusPill(r.status,r.verified)}</div>
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

  function portfolioCard(r){
    return `<article class="nl6441-record-card">
      <div class="nl6441-record-icon">▤</div>
      <div class="nl6441-record-copy">
        <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${statusPill(r.status,r.published)}</div>
        <p class="nl6441-sub">${esc(r.type||'Portfolio')}</p>
        ${r.description?`<p>${esc(r.description)}</p>`:''}
        <div class="nl6441-meta">${r.date?`<span>${fmt(r.date)}</span>`:''}${r.published?'<span>✓ Published</span>':''}</div>
      </div>
    </article>`;
  }

  function experienceCard(r){
    return `<article class="nl6441-record-card">
      <div class="nl6441-record-icon">▣</div>
      <div class="nl6441-record-copy">
        <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${r.current?statusPill('Current',true):''}</div>
        <p class="nl6441-sub">${esc(r.organization||'')}${r.location?` · ${esc(r.location)}`:''}</p>
        ${r.description?`<p>${esc(r.description)}</p>`:''}
        <div class="nl6441-meta">${dates(r.start_date,r.end_date,r.current)}</div>
      </div>
    </article>`;
  }

  function licenseCard(r){
    return `<article class="nl6441-record-card">
      <div class="nl6441-record-icon">♜</div>
      <div class="nl6441-record-copy">
        <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${statusPill(r.status,r.verified)}</div>
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

  function educationCard(r){
    return `<article class="nl6441-record-card">
      <div class="nl6441-record-icon">◇</div>
      <div class="nl6441-record-copy">
        <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${statusPill(r.status,false)}</div>
        <p class="nl6441-sub">${esc(r.institution||'')}${r.field?` · ${esc(r.field)}`:''}</p>
        ${r.description?`<p>${esc(r.description)}</p>`:''}
        <div class="nl6441-meta">${dates(r.start_date,r.end_date,false)}</div>
      </div>
    </article>`;
  }

  function documentCard(r){
    return `<article class="nl6441-record-card">
      <div class="nl6441-record-icon">▱</div>
      <div class="nl6441-record-copy">
        <div class="nl6441-record-head"><h3>${esc(r.title)}</h3>${statusPill(r.status,false)}</div>
        <p class="nl6441-sub">${esc(r.type||'Document')}</p>
        ${r.description?`<p>${esc(r.description)}</p>`:''}
        <div class="nl6441-meta">${r.uploaded_at?`<span>Uploaded ${fmt(r.uploaded_at)}</span>`:''}</div>
      </div>
    </article>`;
  }

  function recordsPanel(label,records,renderer,description){
    return `<section class="nl6441-inline-panel" data-tab-panel="${esc(label)}">
      <div class="nl6441-inline-head">
        <div><div class="eyebrow">Member Professional Profile</div><h2>${esc(label)}</h2><p>${esc(description)}</p></div>
        <div class="nl6441-count"><strong>${records.length}</strong><span>record${records.length===1?'':'s'}</span></div>
      </div>
      <div class="nl6441-record-list">
        ${records.length?records.map(renderer).join(''):empty(`No ${label.toLowerCase()} recorded yet`,`Records will appear here automatically when they are added to this member's NurseLink profile.`)}
      </div>
    </section>`;
  }

  function overviewPanel(data){
    const sections=[
      ['Certificates',data.certificates?.length||0],
      ['Portfolio',data.portfolio?.length||0],
      ['Experience',data.experience?.length||0],
      ['Licenses',data.licenses?.length||0],
      ['Education',data.education?.length||0],
      ['Documents',data.documents?.length||0],
    ];
    return `<section class="nl6441-inline-panel">
      <div class="nl6441-inline-head"><div><div class="eyebrow">Professional Profile</div><h2>Overview</h2><p>A summary of the records currently stored in this member's NurseLink profile.</p></div></div>
      <div class="nl6441-overview-grid">
        ${sections.map(([name,count])=>`<button type="button" data-open-tab="${name}"><span>${icon(name)}</span><strong>${count}</strong><small>${name}</small></button>`).join('')}
      </div>
    </section>`;
  }

  function panelFor(label){
    const d=STATE.data||{};
    if(label==='Overview')return overviewPanel(d);
    if(label==='Certificates')return recordsPanel('Certificates',d.certificates||[],certificateCard,'Professional certificates and certifications recorded for this member.');
    if(label==='Portfolio')return recordsPanel('Portfolio',d.portfolio||[],portfolioCard,'Projects, leadership work, professional contributions and portfolio evidence.');
    if(label==='Experience')return recordsPanel('Experience',d.experience||[],experienceCard,'Employment and professional nursing experience.');
    if(label==='Licenses')return recordsPanel('Licenses',d.licenses||[],licenseCard,'Professional licenses and registration records.');
    if(label==='Education')return recordsPanel('Education',d.education||[],educationCard,'Academic qualifications and educational background.');
    if(label==='Documents')return recordsPanel('Documents',d.documents||[],documentCard,'Professional documents stored in this member profile.');
    return '';
  }

  function page(){
    return document.querySelector('.nl6439-page');
  }

  function qualificationsContent(p){
    const layout=p.querySelector('.nl6439-layout');
    const disclaimer=p.querySelector('.nl6439-disclaimer');
    return {layout,disclaimer};
  }

  function ensureHost(p){
    let host=p.querySelector('.nl6441-tab-host');
    if(host)return host;

    const {layout}=qualificationsContent(p);
    if(!layout)return null;
    host=document.createElement('div');
    host.className='nl6441-tab-host';
    layout.parentNode.insertBefore(host,layout);
    return host;
  }

  function setActive(label){
    const p=page();
    if(!p)return;

    STATE.active=label;
    const nav=p.querySelector('.nl6439-tabs');
    nav?.querySelectorAll('[data-nl6441-tab]').forEach(a=>{
      const active=a.dataset.nl6441Tab===label;
      a.classList.toggle('active',active);
      if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });

    const {layout,disclaimer}=qualificationsContent(p);
    const host=ensureHost(p);
    if(!host)return;

    if(label==='Qualifications'){
      host.hidden=true;
      if(layout)layout.hidden=false;
      if(disclaimer)disclaimer.hidden=false;
    }else{
      if(layout)layout.hidden=true;
      if(disclaimer)disclaimer.hidden=true;
      host.hidden=false;
      host.innerHTML=STATE.loading
        ? `<div class="nl6441-loading">Loading ${esc(label)}…</div>`
        : panelFor(label);
      host.querySelectorAll('[data-open-tab]').forEach(btn=>btn.addEventListener('click',()=>setActive(btn.dataset.openTab)));
    }

    history.replaceState(null,'',label==='Qualifications'?location.pathname:`${location.pathname}#${label.toLowerCase()}`);
  }

  function rebuildTabs(p){
    const nav=p.querySelector('.nl6439-tabs');
    if(!nav)return false;

    nav.innerHTML=tabs().map(label=>`<button type="button" class="nl6441-tab ${label===STATE.active?'active':''}" data-nl6441-tab="${label}">${icon(label)} ${label}</button>`).join('');
    nav.querySelectorAll('[data-nl6441-tab]').forEach(btn=>btn.addEventListener('click',()=>setActive(btn.dataset.nl6441Tab)));
    return true;
  }

  async function load(){
    STATE.loading=true;
    const initial=(location.hash||'').replace('#','');
    const match=tabs().find(t=>t.toLowerCase()===initial.toLowerCase());
    if(match && match!=='Qualifications') STATE.active=match;

    const p=page();
    if(p){rebuildTabs(p);setActive(STATE.active);}

    try{
      const r=await fetch('/api/member-profile-tabs-v6441',{credentials:'include',headers:{Accept:'application/json'}});
      const j=await r.json().catch(()=>null);
      STATE.data=j?.data||{};
    }catch(_){
      STATE.data={};
    }finally{
      STATE.loading=false;
      const p2=page();
      if(p2){rebuildTabs(p2);setActive(STATE.active);}
    }
  }

  window.__NL6441_LOAD_PROFILE_TABS__ = async function() {
    if (!onQualificationsRoute()) return false;
    await load();
    return true;
  };

  window.__NL6441_SET_ACTIVE_TAB__ = function(label) {
    if (!onQualificationsRoute()) return false;
    setActive(label);
    return true;
  };

  window.__NL6441_PROFILE_TABS_AVAILABLE__ = true;

  function initialBoot(){
    if(!onQualificationsRoute()) return;
    let attempts=0;
    const attempt=()=>{
      if(!onQualificationsRoute()) return;
      const p=page();
      if(!p){
        if(++attempts<20)setTimeout(attempt,150);
        return;
      }
      load();
    };
    attempt();
  }

  document.readyState==='loading'
    ? document.addEventListener('DOMContentLoaded',initialBoot,{once:true})
    : initialBoot();
})();
