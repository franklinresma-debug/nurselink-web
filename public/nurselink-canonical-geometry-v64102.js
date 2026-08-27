/* NurseLink Canonical Shell Geometry Fix Runtime v64.10.2 */
(() => {
  'use strict';
  const MARK='NURSELINK_CANONICAL_SHELL_GEOMETRY_FIX_V64102';

  function visible(el){
    if(!el) return false;
    const cs=getComputedStyle(el);
    const r=el.getBoundingClientRect();
    return cs.display!=='none' && cs.visibility!=='hidden' && r.width>0 && r.height>0;
  }

  function decideContentOffset(){
    const html=document.documentElement;
    const shell=document.querySelector('.member-react-safe-shell-v108');

    if(!shell){
      html.dataset.nlContentNeedsOffset='true';
      return;
    }

    /* Measure where the real main content begins BEFORE canonical compensation.
       If the app already reserves ~sidebar width, don't add another offset. */
    const main=shell.querySelector('main,.main,.content,[class*="workspace"],[class*="page"]');
    if(!main){
      html.dataset.nlContentNeedsOffset='false';
      return;
    }

    const left=main.getBoundingClientRect().left;
    const sidebarWidth=window.innerWidth<=1199 ? 210 : 232;

    /* App already reserves the sidebar column if content starts at least ~70% of it. */
    html.dataset.nlContentNeedsOffset = left < sidebarWidth * .7 ? 'true' : 'false';
  }

  function removeCompetingChrome(){
    /* Remove old injected shells entirely. */
    document.getElementById('nurselink-universal-topbar')?.remove();
    document.getElementById('nurselink-universal-sidebar')?.remove();

    /* Remove loose top-level native controls that escaped prior selectors. */
    for(const el of [...document.body.children]){
      if(el.id==='nurselink-canonical-topbar' || el.id==='nurselink-canonical-sidebar') continue;
      if(el.classList?.contains('member-react-safe-shell-v108')) continue;

      const t=String([
        el.getAttribute?.('aria-label'),
        el.getAttribute?.('class'),
        el.textContent
      ].filter(Boolean).join(' ')).toLowerCase();

      const r=el.getBoundingClientRect();
      if(
        r.top<120 &&
        r.height>30 &&
        r.height<160 &&
        (t.includes('notification') || t.includes('profile') || t.includes('theme') || t.includes('topbar'))
      ){
        el.dataset.nlCompetingChrome='true';
      }
    }
  }

  function apply(){
    const html=document.documentElement;
    html.dataset.nlCanonicalShell='true';
    html.dataset.nlCanonicalShellVersion='v64.10.2';

    removeCompetingChrome();
    decideContentOffset();
  }

  let raf=0;
  const schedule=()=>{
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(apply);
  };

  function start(){
    /* The v64.10.1 canonical shell creates the actual sidebar/topbar. */
    apply();

    setTimeout(schedule,250);
    setTimeout(schedule,750);
    setTimeout(schedule,1500);

    new MutationObserver(schedule).observe(document.documentElement,{
      subtree:true,
      childList:true,
      attributes:true,
      attributeFilter:['class','style','data-theme','data-nurselink-theme','data-color-theme']
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
