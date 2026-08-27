/* NurseLink Universal Shell Dedup Runtime v64.9.6 */
(() => {
  'use strict';
  const MARK='NURSELINK_UNIVERSAL_SHELL_DEDUP_V6496';
  const norm=v=>String(v||'').trim().toLowerCase();

  const navItems=[
    ['Dashboard','/'],
    ['My Profile','/profile'],
    ['Smart Registration','/smart-registration'],
    ['Application Status','/applications'],
    ['Portfolio','/portfolio'],
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

  function detectTheme(){
    const h=document.documentElement,b=document.body;
    for(const raw of [
      h?.dataset?.theme,h?.dataset?.nurselinkTheme,h?.dataset?.colorTheme,
      h?.getAttribute('data-color-theme'),b?.dataset?.theme
    ]){
      const v=norm(raw);
      if(v.includes('dark'))return'dark';
      if(v.includes('light'))return'light';
    }
    if(h.classList.contains('dark')||b?.classList?.contains('dark'))return'dark';
    try{
      for(const k of ['theme','nurselink-theme','nurselinkTheme','color-theme','appearance']){
        const v=norm(localStorage.getItem(k));
        if(v.includes('dark'))return'dark';
        if(v.includes('light'))return'light';
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

  function visible(el){
    if(!el) return false;
    const cs=getComputedStyle(el);
    if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)===0)return false;
    const r=el.getBoundingClientRect();
    return r.width>180 && r.height>=36 && r.height<=180;
  }

  function nativeTopbars(){
    const sels=[
      '[data-nl-minimal-topbar="true"]',
      '[data-nl-mobile-topbar="true"]',
      '.member-react-safe-shell-v108 .topbar',
      '.member-react-safe-shell-v108 .top-bar',
      '.member-react-safe-shell-v108 .app-header',
      '.member-react-safe-shell-v108 .member-header',
      '.member-react-safe-shell-v108 .member-topbar',
      '.member-react-safe-shell-v108 header'
    ].join(',');
    return [...document.querySelectorAll(sels)]
      .filter(el=>el.id!=='nurselink-universal-topbar' && visible(el));
  }

  function nativeSidebars(){
    const sels=[
      '.member-react-safe-shell-v108 .sidebar',
      '.member-react-safe-shell-v108 [class*="sidebar"]',
      '.member-react-safe-shell-v108 aside[class*="nav"]'
    ].join(',');
    return [...document.querySelectorAll(sels)]
      .filter(el=>el.id!=='nurselink-universal-sidebar' && visible(el));
  }

  function makeTopbar(){
    if(document.getElementById('nurselink-universal-topbar'))return;
    const bar=document.createElement('header');
    bar.id='nurselink-universal-topbar';
    bar.setAttribute('aria-label','NurseLink member topbar');

    const menu=document.createElement('button');
    menu.type='button';menu.className='nlub-action nlub-menu';
    menu.setAttribute('aria-label','Open navigation');menu.textContent='☰';
    menu.addEventListener('click',()=>{
      const h=document.documentElement;
      h.dataset.nlSidebarOpen=h.dataset.nlSidebarOpen==='true'?'false':'true';
    });

    const profile=document.createElement('a');
    profile.href='/profile';profile.className='nlub-action nlub-profile';
    profile.setAttribute('aria-label','Profile');
    profile.innerHTML='<span class="nlub-avatar">NL</span><span class="nlub-label">Profile</span>';

    const theme=document.createElement('button');
    theme.type='button';theme.className='nlub-action';
    theme.setAttribute('aria-label','Toggle theme');theme.textContent='◐';
    theme.addEventListener('click',()=>setTheme(detectTheme()==='dark'?'light':'dark'));

    const notif=document.createElement('button');
    notif.type='button';notif.className='nlub-action';
    notif.setAttribute('aria-label','Notifications');notif.textContent='🔔';
    notif.addEventListener('click',()=>dispatchEvent(new CustomEvent('nurselink:notifications')));

    bar.append(menu,profile,theme,notif);
    document.body.prepend(bar);
  }

  function makeSidebar(){
    if(document.getElementById('nurselink-universal-sidebar'))return;
    const aside=document.createElement('aside');
    aside.id='nurselink-universal-sidebar';
    aside.setAttribute('aria-label','NurseLink navigation');

    const brand=document.createElement('div');
    brand.className='nlub-brand';
    brand.innerHTML='<span class="nlub-logo">NL</span><span><strong>NurseLink</strong><small>KAPIT-BISIG</small></span>';

    const nav=document.createElement('nav');
    const current=(location.pathname||'/').replace(/\/+$/,'')||'/';
    for(const [label,href] of navItems){
      const a=document.createElement('a');
      a.href=href;a.textContent=label;
      const hp=href.replace(/\/+$/,'')||'/';
      if(hp===current)a.setAttribute('aria-current','page');
      a.addEventListener('click',()=>document.documentElement.dataset.nlSidebarOpen='false');
      nav.appendChild(a);
    }
    aside.append(brand,nav);
    document.body.prepend(aside);
  }

  function removeFallbackTopbar(){
    document.getElementById('nurselink-universal-topbar')?.remove();
  }
  function removeFallbackSidebar(){
    document.getElementById('nurselink-universal-sidebar')?.remove();
  }

  let initialDeadline=Date.now()+2200;

  function reconcile(){
    const h=document.documentElement;
    h.dataset.nlEffectiveTheme=detectTheme();
    h.dataset.nlUniversalShell='v64.9.6';

    const tops=nativeTopbars();
    const sides=nativeSidebars();

    const hasNativeTop=tops.length>0;
    const hasNativeSide=sides.length>0;

    h.dataset.nlNativeTopbar=hasNativeTop?'true':'false';
    h.dataset.nlNativeSidebar=hasNativeSide?'true':'false';

    /* If native components arrive after hydration, remove fallback immediately. */
    if(hasNativeTop){
      removeFallbackTopbar();
      h.dataset.nlFallbackTopbar='false';
    }else if(Date.now()>=initialDeadline){
      makeTopbar();
      h.dataset.nlFallbackTopbar='true';
    }

    if(hasNativeSide){
      removeFallbackSidebar();
      h.dataset.nlFallbackSidebar='false';
    }else if(Date.now()>=initialDeadline){
      makeSidebar();
      h.dataset.nlFallbackSidebar='true';
    }

    h.dataset.nlLegacyShell=(
      h.dataset.nlFallbackTopbar==='true' ||
      h.dataset.nlFallbackSidebar==='true'
    )?'true':'false';
  }

  let raf=0;
  const schedule=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(reconcile)};

  function start(){
    reconcile();

    /* Allow React/native shell to hydrate before injecting fallback. */
    setTimeout(schedule,400);
    setTimeout(schedule,900);
    setTimeout(schedule,1500);
    setTimeout(schedule,2300);

    new MutationObserver(schedule).observe(document.documentElement,{
      subtree:true,childList:true,attributes:true,
      attributeFilter:['class','style','data-theme','data-nurselink-theme','data-color-theme']
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
