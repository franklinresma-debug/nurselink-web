/* NurseLink Shell Stability + Avatar + Hover Fix v64.10.3 */
(() => {
  'use strict';
  const MARK='NURSELINK_SHELL_STABILITY_AVATAR_HOVER_V64103';

  const navItems=[
    ['Dashboard','/'],['My Profile','/profile'],['Smart Registration','/smart-registration'],
    ['Application Status','/applications'],['Portfolio','/portfolio'],['Jobs','/jobs'],
    ['Applications','/applications'],['Mentoring','/nurselink-mentoring.html'],
    ['Engagement Hub','/nurselink-engagement.html'],['Learning','/learning'],
    ['Credentials','/credentials'],['Qualifications','/qualifications'],['Documents','/documents'],
    ['Digital Member ID','/nurselink-digital-id.html'],['Messages','/messages'],['Events','/events'],
    ['Programs & Initiatives','/programs'],['Policies & Advocacy','/policies'],
    ['Welfare & Crisis','/welfare'],['Policy & Privacy','/privacy']
  ];

  const norm=v=>String(v||'').trim().toLowerCase();
  const path=()=>((location.pathname||'/').replace(/\/+$/,'')||'/');

  function detectTheme(){
    const h=document.documentElement,b=document.body;
    for(const raw of [h?.dataset?.theme,h?.dataset?.nurselinkTheme,h?.dataset?.colorTheme,
      h?.getAttribute('data-color-theme'),b?.dataset?.theme]){
      const v=norm(raw); if(v.includes('dark'))return'dark'; if(v.includes('light'))return'light';
    }
    if(h.classList.contains('dark')||b?.classList?.contains('dark'))return'dark';
    if(h.classList.contains('light')||b?.classList?.contains('light'))return'light';
    try{
      for(const k of ['theme','nurselink-theme','nurselinkTheme','color-theme','appearance']){
        const v=norm(localStorage.getItem(k)); if(v.includes('dark'))return'dark'; if(v.includes('light'))return'light';
      }
    }catch(_){}
    return matchMedia?.('(prefers-color-scheme:dark)').matches?'dark':'light';
  }

  function setTheme(theme){
    const h=document.documentElement;
    h.dataset.nlEffectiveTheme=theme; h.dataset.theme=theme;
    h.classList.toggle('dark',theme==='dark'); h.classList.toggle('light',theme==='light');
    try{localStorage.setItem('theme',theme);localStorage.setItem('nurselink-theme',theme)}catch(_){}
    dispatchEvent(new CustomEvent('nurselink:themechange',{detail:{theme}}));
  }

  function visibleBox(el){
    if(!el)return false;
    const cs=getComputedStyle(el),r=el.getBoundingClientRect();
    return cs.display!=='none' && r.width>20 && r.height>20;
  }

  function nativeSidebar(){
    return [...document.querySelectorAll(
      '.member-react-safe-shell-v108 .sidebar,.member-react-safe-shell-v108 [class*="sidebar"],.member-react-safe-shell-v108 aside'
    )].filter(el=>!['nurselink-stable-sidebar','nurselink-canonical-sidebar','nurselink-universal-sidebar'].includes(el.id) && visibleBox(el))
      .find(el=>{
        const r=el.getBoundingClientRect(),t=norm(el.textContent);
        return r.left<60 && r.width>150 && r.width<340 && (t.includes('dashboard')||t.includes('qualifications')||t.includes('documents'));
      })||null;
  }

  function nativeTopbar(){
    return [...document.querySelectorAll(
      '.member-react-safe-shell-v108 header,.member-react-safe-shell-v108 [class*="topbar"],.member-react-safe-shell-v108 [class*="top-bar"],.member-react-safe-shell-v108 [class*="app-header"],.member-react-safe-shell-v108 [class*="member-header"],body > header'
    )].filter(el=>!['nurselink-stable-topbar','nurselink-canonical-topbar','nurselink-universal-topbar'].includes(el.id) && visibleBox(el))
      .find(el=>{
        const r=el.getBoundingClientRect(),t=norm([el.textContent,el.getAttribute('aria-label'),el.className].join(' '));
        return r.top<120 && r.height>=40 && r.height<150 && (t.includes('profile')||t.includes('notification')||t.includes('franklin')||t.includes('theme'));
      })||null;
  }

  function profileImageSrc(){
    const imgs=[...document.images].filter(img=>{
      if(img.closest('#nurselink-stable-sidebar,#nurselink-stable-topbar'))return false;
      const src=img.currentSrc||img.src; if(!src)return false;
      const r=img.getBoundingClientRect();
      const meta=norm([img.alt,img.title,img.className,img.getAttribute('aria-label'),img.parentElement?.textContent].filter(Boolean).join(' '));
      let score=0;
      if(meta.includes('franklin'))score+=8;
      if(meta.includes('profile'))score+=6;
      if(meta.includes('avatar'))score+=5;
      if(meta.includes('member'))score+=3;
      if(r.width>=24&&r.width<=180&&r.height>=24&&r.height<=180)score+=2;
      if(Math.abs(r.width-r.height)<30)score+=2;
      img.dataset.nlsAvatarScore=String(score);
      return score>1;
    });
    imgs.sort((a,b)=>Number(b.dataset.nlsAvatarScore||0)-Number(a.dataset.nlsAvatarScore||0));
    return imgs[0]?.currentSrc||imgs[0]?.src||'';
  }

  function buildSidebar(){
    let aside=document.getElementById('nurselink-stable-sidebar'); if(aside)return aside;
    aside=document.createElement('aside'); aside.id='nurselink-stable-sidebar'; aside.setAttribute('aria-label','NurseLink navigation');
    const brand=document.createElement('div'); brand.className='nls-brand';
    brand.innerHTML='<span class="nls-logo">NL</span><span><strong>NurseLink</strong><small>KAPIT-BISIG</small></span>';
    const nav=document.createElement('nav'),current=path();
    for(const [label,href] of navItems){
      const a=document.createElement('a');a.href=href;a.textContent=label;
      if((href.replace(/\/+$/,'')||'/')===current)a.setAttribute('aria-current','page');
      a.addEventListener('click',()=>document.documentElement.dataset.nlSidebarOpen='false');
      nav.appendChild(a);
    }
    aside.append(brand,nav);document.body.prepend(aside);return aside;
  }

  function buildTopbar(){
    let bar=document.getElementById('nurselink-stable-topbar'); if(bar)return bar;
    bar=document.createElement('header');bar.id='nurselink-stable-topbar';bar.setAttribute('aria-label','NurseLink member topbar');

    const menu=document.createElement('button');menu.type='button';menu.className='nls-action nls-menu';
    menu.setAttribute('aria-label','Open navigation');menu.textContent='☰';
    menu.addEventListener('click',()=>{const h=document.documentElement;h.dataset.nlSidebarOpen=h.dataset.nlSidebarOpen==='true'?'false':'true'});

    const profile=document.createElement('a');profile.href='/profile';profile.className='nls-action nls-profile';profile.setAttribute('aria-label','Profile');
    const avatar=document.createElement('span');avatar.className='nls-avatar';avatar.dataset.nlsAvatar='true';avatar.textContent='NL';
    const label=document.createElement('span');label.className='nls-profile-label';label.textContent='Profile';
    profile.append(avatar,label);

    const theme=document.createElement('button');theme.type='button';theme.className='nls-action';theme.setAttribute('aria-label','Toggle theme');theme.textContent='◐';
    theme.addEventListener('click',()=>setTheme(detectTheme()==='dark'?'light':'dark'));

    const notif=document.createElement('button');notif.type='button';notif.className='nls-action';notif.setAttribute('aria-label','Notifications');notif.textContent='🔔';
    notif.addEventListener('click',()=>dispatchEvent(new CustomEvent('nurselink:notifications')));

    bar.append(menu,profile,theme,notif);document.body.prepend(bar);return bar;
  }

  function syncAvatar(){
    const host=document.querySelector('[data-nls-avatar="true"]'); if(!host)return;
    const src=profileImageSrc(); if(!src)return;
    const existing=host.querySelector('img'); if(existing&&existing.src===src)return;
    host.textContent='';
    const img=document.createElement('img');img.alt='Member profile photo';img.src=src;img.decoding='async';host.appendChild(img);
  }

  function markNativeGeometry(){
    const h=document.documentElement,side=nativeSidebar(),top=nativeTopbar();
    for(const el of document.querySelectorAll('[data-nls-native-sidebar="true"]'))el.removeAttribute('data-nls-native-sidebar');
    for(const el of document.querySelectorAll('[data-nls-native-topbar="true"]'))el.removeAttribute('data-nls-native-topbar');
    if(side)side.dataset.nlsNativeSidebar='true';
    if(top)top.dataset.nlsNativeTopbar='true';
    h.dataset.nlsHasNativeSidebar=side?'true':'false';
    h.dataset.nlsHasNativeTopbar=top?'true':'false';
  }

  function updateActiveNav(){
    const current=path();
    for(const a of document.querySelectorAll('#nurselink-stable-sidebar nav a')){
      a.removeAttribute('aria-current');
      const p=(new URL(a.href,location.href).pathname||'/').replace(/\/+$/,'')||'/';
      if(p===current)a.setAttribute('aria-current','page');
    }
  }

  function forceLayoutRefresh(){
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      dispatchEvent(new Event('resize'));
      document.documentElement.dataset.nlsLayoutReady='true';
    }));
  }

  function refresh(){
    document.documentElement.dataset.nlEffectiveTheme=detectTheme();
    document.documentElement.dataset.nlsStableShell='v64.10.3';
    buildSidebar();buildTopbar();markNativeGeometry();syncAvatar();updateActiveNav();forceLayoutRefresh();
  }

  function patchHistory(){
    for(const name of ['pushState','replaceState']){
      const original=history[name];
      if(original.__nlsPatched)continue;
      const wrapped=function(...args){const out=original.apply(this,args);setTimeout(refresh,80);return out};
      wrapped.__nlsPatched=true;history[name]=wrapped;
    }
  }

  function start(){
    patchHistory();
    refresh();
    setTimeout(refresh,250);
    setTimeout(refresh,800);
    setTimeout(()=>{markNativeGeometry();syncAvatar();updateActiveNav()},1600);
    addEventListener('popstate',()=>setTimeout(refresh,80));
    addEventListener('hashchange',()=>setTimeout(refresh,80));
    addEventListener('storage',()=>document.documentElement.dataset.nlEffectiveTheme=detectTheme());
    console.info(MARK);
  }

  document.readyState==='loading'
    ? document.addEventListener('DOMContentLoaded',start,{once:true})
    : start();
})();
