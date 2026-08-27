/* NurseLink Legacy Blue Shell Runtime v64.9.7 */
(() => {
  'use strict';

  const MARK='NURSELINK_LEGACY_BLUE_SHELL_V6497';

  const FORCE_PATHS=new Set([
    '/nurselink-engagement.html',
    '/nurselink-mentoring.html',
    '/nurselink-digital-id.html'
  ]);

  const navItems=[
    ['Dashboard','/dashboard'],
    ['My Profile','/profile'],
    ['Smart Registration','/smart-registration'],
    ['Application Status','/application-status'],
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

  const norm=v=>String(v||'').trim().toLowerCase();

  function path(){
    return (location.pathname||'/').replace(/\/+$/,'')||'/';
  }

  function forceLegacyShell(){
    return FORCE_PATHS.has(path());
  }

  function detectTheme(){
    const h=document.documentElement,b=document.body;

    for(const raw of [
      h?.dataset?.theme,
      h?.dataset?.nurselinkTheme,
      h?.dataset?.colorTheme,
      h?.getAttribute('data-color-theme'),
      b?.dataset?.theme
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

  function makeTopbar(){
    let bar=document.getElementById('nurselink-universal-topbar');

    if(!bar){
      bar=document.createElement('header');
      bar.id='nurselink-universal-topbar';
      bar.setAttribute('aria-label','NurseLink member topbar');

      const menu=document.createElement('button');
      menu.type='button';
      menu.className='nlub-action nlub-menu';
      menu.setAttribute('aria-label','Open navigation');
      menu.textContent='☰';
      menu.addEventListener('click',()=>{
        const h=document.documentElement;
        h.dataset.nlSidebarOpen=h.dataset.nlSidebarOpen==='true'?'false':'true';
      });

      const profile=document.createElement('a');
      profile.href='/profile';
      profile.className='nlub-action nlub-profile';
      profile.setAttribute('aria-label','Profile');
      profile.innerHTML='<span class="nlub-avatar">NL</span><span class="nlub-label">Profile</span>';

      const theme=document.createElement('button');
      theme.type='button';
      theme.className='nlub-action nlub-theme';
      theme.setAttribute('aria-label','Toggle theme');
      theme.textContent='◐';
      theme.addEventListener('click',()=>{
        setTheme(detectTheme()==='dark'?'light':'dark');
      });

      const notif=document.createElement('button');
      notif.type='button';
      notif.className='nlub-action nlub-notification';
      notif.setAttribute('aria-label','Notifications');
      notif.textContent='🔔';
      notif.addEventListener('click',()=>{
        dispatchEvent(new CustomEvent('nurselink:notifications'));
      });

      bar.append(menu,profile,theme,notif);
      document.body.prepend(bar);
    }

    return bar;
  }

  function makeSidebar(){
    let aside=document.getElementById('nurselink-universal-sidebar');

    if(!aside){
      aside=document.createElement('aside');
      aside.id='nurselink-universal-sidebar';
      aside.setAttribute('aria-label','NurseLink navigation');

      const brand=document.createElement('div');
      brand.className='nlub-brand';
      brand.innerHTML=
        '<span class="nlub-logo">NL</span>'+
        '<span><strong>NurseLink</strong><small>KAPIT-BISIG</small></span>';

      const nav=document.createElement('nav');
      const current=path();

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
    }

    return aside;
  }

  function hideLegacyNativeBars(){
    if(!forceLegacyShell())return;

    const selectors=[
      'body > nav',
      'body > header:not(#nurselink-universal-topbar)',
      '.top-nav',
      '.site-nav',
      '.member-nav',
      '.legacy-nav'
    ];

    for(const el of document.querySelectorAll(selectors.join(','))){
      if(el.id==='nurselink-universal-topbar')continue;
      el.dataset.nlLegacyNavigationHidden='true';
    }
  }

  function apply(){
    const h=document.documentElement;
    const force=forceLegacyShell();

    h.dataset.nlEffectiveTheme=detectTheme();
    h.dataset.nlForceLegacyShell=force?'true':'false';
    h.dataset.nlLegacyBlueShell='v64.9.7';

    if(force){
      makeTopbar();
      makeSidebar();
      h.dataset.nlFallbackTopbar='true';
      h.dataset.nlFallbackSidebar='true';
      h.dataset.nlLegacyShell='true';
      hideLegacyNativeBars();
    }
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
        'class',
        'data-theme',
        'data-nurselink-theme',
        'data-color-theme'
      ]
    });

    addEventListener('resize',schedule,{passive:true});
    addEventListener('orientationchange',schedule,{passive:true});
    addEventListener('storage',schedule);

    console.info(MARK);
  }

  document.readyState==='loading'
    ? document.addEventListener('DOMContentLoaded',start,{once:true})
    : start();
})();
