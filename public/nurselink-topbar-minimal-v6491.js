/* NurseLink Topbar Minimal Actions Runtime v64.9.1 */
(() => {
  'use strict';
  const MARK='NURSELINK_TOPBAR_MINIMAL_ACTIONS_V6491';

  const norm=v=>String(v||'').trim().toLowerCase();
  const text=el=>norm([
    el?.getAttribute?.('aria-label'),
    el?.getAttribute?.('title'),
    el?.getAttribute?.('data-tooltip'),
    el?.getAttribute?.('name'),
    el?.textContent
  ].filter(Boolean).join(' '));

  function findTopbar(){
    const candidates=[...document.querySelectorAll(
      'header,.topbar,.top-bar,.app-header,.member-header,.member-topbar,'+
      '[class*="topbar"],[class*="top-bar"],[class*="app-header"],[class*="member-header"]'
    )];

    let best=null, score=-1;
    for(const el of candidates){
      const r=el.getBoundingClientRect();
      if(r.height<34 || r.height>180 || r.top>220) continue;
      const t=text(el);
      let s=0;
      if(t.includes('nurselink')) s+=3;
      if(t.includes('notification') || t.includes('bell')) s+=3;
      if(t.includes('profile') || t.includes('account') || t.includes('member')) s+=3;
      if(t.includes('theme') || t.includes('dark') || t.includes('light')) s+=3;
      if(s>score){score=s;best=el}
    }
    return score>=3?best:null;
  }

  function allControls(root){
    return [...root.querySelectorAll(
      'a,button,[role="button"],[role="link"],nav a,nav button'
    )];
  }

  function matchControl(root, tests){
    return allControls(root).find(el=>{
      const t=text(el);
      return tests.some(x=>t.includes(x));
    })||null;
  }

  function mark(){
    const bar=findTopbar();
    if(!bar) return;

    bar.dataset.nlMinimalTopbar='true';

    const profile=matchControl(bar,['profile','my account','account','member','user']);
    const theme=matchControl(bar,['theme','dark mode','light mode','appearance']);
    const notif=matchControl(bar,['notification','notifications','bell','alert']);

    if(profile) profile.dataset.nlTopbarProfile='true';
    if(theme) theme.dataset.nlTopbarTheme='true';
    if(notif) notif.dataset.nlTopbarNotifications='true';

    const approved=new Set([profile,theme,notif].filter(Boolean));

    /* Preserve mobile hamburger and brand region only on narrow screens.
       They are structural controls, not page navigation. */
    const menu=matchControl(bar,['menu','navigation','sidebar']);
    if(menu) menu.dataset.nlTopbarMenu='true';

    for(const el of allControls(bar)){
      if(approved.has(el)) continue;
      if(el===menu && innerWidth<=767) continue;
      el.dataset.nlTopbarRemove='true';
    }

    /* Hide nav containers even if descendants are not individually interactive. */
    for(const nav of bar.querySelectorAll('nav,[role="navigation"],[class*="nav"],[class*="menu-list"],[class*="top-links"]')){
      if(nav.contains(profile)||nav.contains(theme)||nav.contains(notif)) continue;
      nav.dataset.nlTopbarCenter='true';
    }

    /* Find common action ancestor */
    const actionEls=[profile,theme,notif].filter(Boolean);
    if(actionEls.length>=2){
      let common=actionEls[0].parentElement;
      while(common && common!==bar && !actionEls.every(e=>common.contains(e))){
        common=common.parentElement;
      }
      if(common && common!==bar) common.dataset.nlTopbarActions='true';
    }

    /* Identify direct left region for desktop hiding/mobile preservation. */
    if(menu){
      let left=menu;
      while(left.parentElement && left.parentElement!==bar) left=left.parentElement;
      if(left.parentElement===bar) left.dataset.nlTopbarLeft='true';
    }

    document.documentElement.dataset.nlTopbarMinimal='v64.9.1';
  }

  let raf=0;
  const schedule=()=>{
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(mark);
  };

  function start(){
    mark();

    new MutationObserver(schedule).observe(document.documentElement,{
      subtree:true,
      childList:true,
      attributes:true,
      attributeFilter:['class','aria-label','title']
    });

    addEventListener('resize',schedule,{passive:true});
    addEventListener('orientationchange',schedule,{passive:true});
    addEventListener('popstate',schedule);
    addEventListener('hashchange',schedule);

    console.info(MARK);
  }

  document.readyState==='loading'
    ? document.addEventListener('DOMContentLoaded',start,{once:true})
    : start();
})();
