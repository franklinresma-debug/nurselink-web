/* NurseLink Shell Runtime Cleanup v64.10.0 */
(() => {
  'use strict';
  const MARK='NURSELINK_SHELL_RUNTIME_CLEANUP_V64100';

  function removeGhosts(){
    /* Remove stale placeholders produced by older topbar activation scripts. */
    const suspects=[...document.querySelectorAll(
      '[class*="topbar-placeholder"],[class*="header-placeholder"],'+
      '.member-react-safe-shell-v108 header:empty,'+
      '.member-react-safe-shell-v108 [class*="topbar"]:empty'
    )];

    for(const el of suspects){
      if(el.id==='nurselink-universal-topbar') continue;
      const r=el.getBoundingClientRect();
      if(r.height>40 || !el.textContent.trim()){
        el.remove();
      }
    }

    document.documentElement.dataset.nlShellRuntimeCleanup='v64.10.0';
  }

  let raf=0;
  const schedule=()=>{
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(removeGhosts);
  };

  function start(){
    removeGhosts();

    new MutationObserver(schedule).observe(document.documentElement,{
      subtree:true,
      childList:true,
      attributes:true,
      attributeFilter:['class','style']
    });

    addEventListener('resize',schedule,{passive:true});
    addEventListener('orientationchange',schedule,{passive:true});

    console.info(MARK);
  }

  document.readyState==='loading'
    ? document.addEventListener('DOMContentLoaded',start,{once:true})
    : start();
})();
