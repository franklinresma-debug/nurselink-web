/* NurseLink Sticky Blue Sidebar Runtime v64.9.8 */
(() => {
  'use strict';
  const MARK='NURSELINK_STICKY_BLUE_SIDEBAR_V6498';

  function mark(){
    const html=document.documentElement;
    html.dataset.nlStickyBlueSidebar='v64.9.8';

    const native=[...document.querySelectorAll(
      '.member-react-safe-shell-v108 .sidebar,'+
      '.member-react-safe-shell-v108 [class*="sidebar"],'+
      '.member-react-safe-shell-v108 aside[class*="nav"]'
    )];

    for(const el of native){
      if(el.id==='nurselink-universal-sidebar') continue;
      el.dataset.nlStickySidebar='true';
    }

    const legacy=document.getElementById('nurselink-universal-sidebar');
    if(legacy) legacy.dataset.nlStickySidebar='true';
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
      attributeFilter:[
        'class',
        'data-theme',
        'data-nurselink-theme',
        'data-color-theme'
      ]
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
