/* NurseLink Canonical Always-On Shell Runtime v64.10.1 */
(() => {
  'use strict';
  const MARK='NURSELINK_CANONICAL_ALWAYS_ON_SHELL_V64101';

  const navItems=[
    ['Dashboard','/'],
    ['My Profile','/profile'],
    ['Smart Registration','/smart-registration'],
    ['Application Status','/applications'],
    ['Portfolio','/portfolio'],
    ['CV Maker','/nurselink-cv-maker.html'],
    ['Jobs','/jobs'],
    ['Applications','/applications'],
    ['Mentoring','/nurselink-mentoring.html'],
    ['Engagement Hub','/nurselink-engagement.html'],
    ['Learning','/learning'],
    ['Credentials','/credentials'],
    ['Qualifications','/qualifications'],
    ['Documents','/documents'],
    ['Digital Member ID','/nurselink-digital-id.html'],
    ['Messages','/messages'],
    ['Events','/events'],
    ['Programs & Initiatives','/programs'],
    ['Policies & Advocacy','/policies'],
    ['Welfare & Crisis','/welfare'],
    ['Policy & Privacy','/privacy']
  ];

  const norm=v=>String(v||'').trim().toLowerCase();

  function currentPath(){
    return (location.pathname||'/').replace(/\/+$/,'')||'/';
  }

  function detectTheme(){
    const h=document.documentElement,b=document.body;
    for(const raw of [
      h?.dataset?.theme,h?.dataset?.nurselinkTheme,h?.dataset?.colorTheme,
      h?.getAttribute('data-color-theme'),b?.dataset?.theme
    ]){
      const v=norm(raw);
      if(v.includes('dark')) return 'dark';
      if(v.includes('light')) return 'light';
    }
    if(h.classList.contains('dark')||b?.classList?.contains('dark')) return 'dark';
    if(h.classList.contains('light')||b?.classList?.contains('light')) return 'light';

    try{
      for(const k of ['theme','nurselink-theme','nurselinkTheme','color-theme','appearance']){
        const v=norm(localStorage.getItem(k));
        if(v.includes('dark')) return 'dark';
        if(v.includes('light')) return 'light';
      }
    }catch(_){}

    return matchMedia?.('(prefers-color-scheme:dark)').matches?'dark':'light';
  }

  function setTheme(theme){
    const h=document.documentElement;
    h.dataset.nlEffectiveTheme=theme;
    h.dataset.theme=theme;
    h.classList.toggle('dark',theme==='dark');
    h.classList.toggle('light',theme==='light');

    try{
      localStorage.setItem('theme',theme);
      localStorage.setItem('nurselink-theme',theme);
    }catch(_){}

    dispatchEvent(new CustomEvent('nurselink:themechange',{detail:{theme}}));
  }

  function buildSidebar(){
    let aside=document.getElementById('nurselink-canonical-sidebar');
    if(aside) return aside;

    aside=document.createElement('aside');
    aside.id='nurselink-canonical-sidebar';
    aside.setAttribute('aria-label','NurseLink navigation');

    const brand=document.createElement('div');
    brand.className='nlc-brand';
    brand.innerHTML=
      '<span class="nlc-logo">NL</span>'+
      '<span><strong>NurseLink</strong><small>KAPIT-BISIG</small></span>';

    const nav=document.createElement('nav');
    const current=currentPath();

    for(const [label,href] of navItems){
      const a=document.createElement('a');
      a.href=href;
      a.textContent=label;
      if((href.replace(/\/+$/,'')||'/')===current){
        a.setAttribute('aria-current','page');
      }
      a.addEventListener('click',()=>{
        document.documentElement.dataset.nlSidebarOpen='false';
      });
      nav.appendChild(a);
    }

    aside.append(brand,nav);
    document.body.prepend(aside);
    return aside;
  }

  function buildTopbar(){
    let bar=document.getElementById('nurselink-canonical-topbar');
    if(bar) return bar;

    bar=document.createElement('header');
    bar.id='nurselink-canonical-topbar';
    bar.setAttribute('aria-label','NurseLink member topbar');

    const menu=document.createElement('button');
    menu.type='button';
    menu.className='nlc-action nlc-menu';
    menu.setAttribute('aria-label','Open navigation');
    menu.textContent='☰';
    menu.addEventListener('click',()=>{
      const h=document.documentElement;
      h.dataset.nlSidebarOpen=h.dataset.nlSidebarOpen==='true'?'false':'true';
    });

    const profile=document.createElement('a');
    profile.href='/profile';
    profile.className='nlc-action nlc-profile';
    profile.setAttribute('aria-label','Profile');
    profile.innerHTML=
      '<span class="nlc-avatar">NL</span>'+
      '<span class="nlc-profile-label">Profile</span>';

    const theme=document.createElement('button');
    theme.type='button';
    theme.className='nlc-action';
    theme.setAttribute('aria-label','Toggle theme');
    theme.textContent='◐';
    theme.addEventListener('click',()=>{
      setTheme(detectTheme()==='dark'?'light':'dark');
    });

    const notif=document.createElement('button');
    notif.type='button';
    notif.className='nlc-action';
    notif.setAttribute('aria-label','Notifications');
    notif.textContent='🔔';
    notif.addEventListener('click',()=>{
      dispatchEvent(new CustomEvent('nurselink:notifications'));
    });

    bar.append(menu,profile,theme,notif);
    document.body.prepend(bar);
    return bar;
  }

  function removeOldInjectedShell(){
    document.getElementById('nurselink-universal-topbar')?.remove();
    document.getElementById('nurselink-universal-sidebar')?.remove();
  }

  function apply(){
    const h=document.documentElement;
    h.dataset.nlCanonicalShell='true';
    h.dataset.nlCanonicalShellVersion='v64.10.1';
    h.dataset.nlEffectiveTheme=detectTheme();

    removeOldInjectedShell();
    buildSidebar();
    buildTopbar();
  }

  let raf=0;
  const schedule=()=>{
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(apply);
  };

  function start(){
    apply();

    new MutationObserver(schedule).observe(document.documentElement,{
      subtree:true,
      childList:true,
      attributes:true,
      attributeFilter:[
        'class','data-theme','data-nurselink-theme','data-color-theme'
      ]
    });

    addEventListener('resize',schedule,{passive:true});
    addEventListener('orientationchange',schedule,{passive:true});
    addEventListener('popstate',schedule);
    addEventListener('hashchange',schedule);
    addEventListener('storage',schedule);

    console.info(MARK);
  }

  document.readyState==='loading'
    ? document.addEventListener('DOMContentLoaded',start,{once:true})
    : start();
})();
