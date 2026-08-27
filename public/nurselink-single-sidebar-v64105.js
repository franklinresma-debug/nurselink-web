/* NurseLink Single Sidebar Ownership Runtime v64.10.5 */
(() => {
  'use strict';
  const MARK='NURSELINK_SINGLE_SIDEBAR_OWNERSHIP_V64105';

  function actualNativeSidebar(){
    const candidates=[...document.querySelectorAll(
      '.member-react-safe-shell-v108 .sidebar,'+
      '.member-react-safe-shell-v108 [class*="sidebar"],'+
      '.member-react-safe-shell-v108 aside'
    )];

    for(const el of candidates){
      if(
        el.id==='nurselink-stable-sidebar' ||
        el.id==='nurselink-canonical-sidebar' ||
        el.id==='nurselink-universal-sidebar'
      ) continue;

      const t=String(el.textContent||'').toLowerCase();
      const cls=String(el.className||'').toLowerCase();

      /* Do not rely on current visibility, because v64.10.4 may already have
         collapsed the native sidebar to 0x0. Identify it semantically. */
      if(
        t.includes('dashboard') &&
        (t.includes('qualifications') || t.includes('documents')) &&
        (cls.includes('sidebar') || el.tagName==='ASIDE' || el.closest('.member-react-safe-shell-v108'))
      ){
        return el;
      }
    }
    return null;
  }

  function assignOwner(){
    const h=document.documentElement;
    const native=actualNativeSidebar();

    /* Clear marker from stale elements first. */
    for(const el of document.querySelectorAll('[data-nls-native-sidebar="true"]')){
      if(el!==native) el.removeAttribute('data-nls-native-sidebar');
    }

    if(native){
      native.dataset.nlsNativeSidebar='true';
      h.dataset.nlsSidebarOwner='native';
      h.dataset.nlsHasNativeSidebar='true';
    }else{
      h.dataset.nlsSidebarOwner='stable';
      h.dataset.nlsHasNativeSidebar='false';
    }

    h.dataset.nlSingleSidebarOwnership='v64.10.5';
  }

  function refresh(){
    assignOwner();
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        dispatchEvent(new Event('resize'));
      });
    });
  }

  function start(){
    refresh();

    /* React hydration checkpoints only. */
    setTimeout(refresh,250);
    setTimeout(refresh,800);
    setTimeout(refresh,1600);

    addEventListener('popstate',()=>setTimeout(refresh,80));
    addEventListener('hashchange',()=>setTimeout(refresh,80));
    addEventListener('resize',assignOwner,{passive:true});

    console.info(MARK);
  }

  document.readyState==='loading'
    ? document.addEventListener('DOMContentLoaded',start,{once:true})
    : start();
})();
