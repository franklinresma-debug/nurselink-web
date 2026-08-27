/* NurseLink Native Topbar Collapse Fix Runtime v64.10.4 */
(() => {
  'use strict';
  const MARK='NURSELINK_NATIVE_TOPBAR_COLLAPSE_FIX_V64104';

  function isLooseChrome(el){
    if(!el || el.id==='nurselink-stable-topbar' || el.id==='nurselink-stable-sidebar') return false;
    if(el.closest?.('#nurselink-stable-topbar,#nurselink-stable-sidebar')) return false;

    const r=el.getBoundingClientRect();
    if(r.top>180 || r.height<24 || r.height>220) return false;

    const t=String([
      el.getAttribute?.('aria-label'),
      el.getAttribute?.('title'),
      el.className,
      el.textContent
    ].filter(Boolean).join(' ')).toLowerCase();

    return (
      t.includes('notification') ||
      t.includes('profile') ||
      t.includes('theme') ||
      t.includes('help') ||
      t.includes('franklin') ||
      t.includes('display')
    );
  }

  function markLooseChrome(){
    for(const el of [...document.body.children]){
      if(isLooseChrome(el)){
        el.dataset.nlCompetingChrome='true';
      }
    }
  }

  function collapseNativeChrome(){
    /* Existing v64.10.3 runtime marks the actual native shell pieces.
       This build only collapses them; it does not search/rebuild shell geometry. */
    for(const el of document.querySelectorAll('[data-nls-native-topbar="true"]')){
      el.dataset.nlNativeCollapsed='true';
    }
    for(const el of document.querySelectorAll('[data-nls-native-sidebar="true"]')){
      el.dataset.nlNativeCollapsed='true';
    }

    markLooseChrome();

    const h=document.documentElement;
    h.dataset.nlNativeTopbarCollapseFix='v64.10.4';
  }

  function refresh(){
    collapseNativeChrome();
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        dispatchEvent(new Event('resize'));
      });
    });
  }

  function start(){
    refresh();

    setTimeout(refresh,250);
    setTimeout(refresh,800);
    setTimeout(refresh,1600);

    addEventListener('popstate',()=>setTimeout(refresh,80));
    addEventListener('hashchange',()=>setTimeout(refresh,80));
    addEventListener('resize',()=>collapseNativeChrome(),{passive:true});

    console.info(MARK);
  }

  document.readyState==='loading'
    ? document.addEventListener('DOMContentLoaded',start,{once:true})
    : start();
})();
