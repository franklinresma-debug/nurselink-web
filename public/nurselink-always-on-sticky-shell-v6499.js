/* NurseLink Always-On Sticky Shell Runtime v64.9.9 */
(() => {
  'use strict';
  const MARK='NURSELINK_ALWAYS_ON_STICKY_SHELL_V6499';

  function mark(){
    const h=document.documentElement;
    h.dataset.nlAlwaysOnStickyShell='v64.9.9';
    h.dataset.nlStickyTopbar='true';
    h.dataset.nlStickySidebar='true';

    for(const el of document.querySelectorAll(
      '.member-react-safe-shell-v108 .sidebar,'+
      '.member-react-safe-shell-v108 [class*="sidebar"],'+
      '.member-react-safe-shell-v108 aside[class*="nav"],'+
      '#nurselink-universal-sidebar'
    )){
      el.dataset.nlAlwaysStickySidebar='true';
    }

    for(const el of document.querySelectorAll(
      '.member-react-safe-shell-v108 [data-nl-minimal-topbar="true"],'+
      '.member-react-safe-shell-v108 [data-nl-mobile-topbar="true"],'+
      '.member-react-safe-shell-v108 .topbar,'+
      '.member-react-safe-shell-v108 .top-bar,'+
      '.member-react-safe-shell-v108 .app-header,'+
      '.member-react-safe-shell-v108 .member-header,'+
      '.member-react-safe-shell-v108 .member-topbar,'+
      '#nurselink-universal-topbar'
    )){
      el.dataset.nlAlwaysStickyTopbar='true';
    }
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
        'style',
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
