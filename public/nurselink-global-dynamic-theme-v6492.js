/* NurseLink Global Dynamic Theme Synchronization Runtime v64.9.2 */
(() => {
  'use strict';
  const MARK='NURSELINK_GLOBAL_DYNAMIC_THEME_SYNC_V6492';
  const norm=v=>String(v||'').trim().toLowerCase();

  function detectTheme(){
    const h=document.documentElement,b=document.body;
    for(const raw of [
      h?.dataset?.theme,h?.dataset?.nurselinkTheme,h?.dataset?.colorTheme,
      h?.getAttribute('data-color-theme'),b?.dataset?.theme,b?.dataset?.nurselinkTheme
    ]){
      const v=norm(raw);
      if(v.includes('dark')) return 'dark';
      if(v.includes('light')) return 'light';
    }
    if(h?.classList?.contains('dark')||b?.classList?.contains('dark')) return 'dark';
    if(h?.classList?.contains('light')||b?.classList?.contains('light')) return 'light';

    try{
      for(const k of ['theme','nurselink-theme','nurselinkTheme','color-theme','appearance']){
        const v=norm(localStorage.getItem(k));
        if(v.includes('dark')) return 'dark';
        if(v.includes('light')) return 'light';
      }
    }catch(_){}

    return matchMedia?.('(prefers-color-scheme:dark)').matches?'dark':'light';
  }

  function route(){
    const p=(location.pathname||'/').replace(/\/+$/,'')||'/';
    return p.slice(1)||'home';
  }

  function viewport(){
    const w=innerWidth;
    return w<=767?'mobile':w<=1199?'tablet':'desktop';
  }

  function markDynamic(root=document){
    const selectors=[
      '.card','.panel','[class*="-card"]','[class*="-panel"]',
      'table','button','input','select','textarea',
      '[role="tab"]','[role="button"]',
      '[class*="badge"]','[class*="pill"]',
      '[class*="icon"]','[class*="row"]','[class*="item"]',
      '[class*="metadata"]','[class*="source"]'
    ].join(',');

    for(const el of root.querySelectorAll?.(selectors)||[]){
      if(el.closest?.('.sidebar,[class*="sidebar"]')) continue;
      el.dataset.nlDynamicTheme='true';
    }
  }

  function apply(){
    const h=document.documentElement;
    h.dataset.nlEffectiveTheme=detectTheme();
    h.dataset.nlRoute=route();
    h.dataset.nlViewportClass=viewport();
    h.dataset.nlGlobalDynamicTheme='v64.9.2';

    markDynamic(document);
  }

  let raf=0;
  const schedule=()=>{
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(apply);
  };

  function start(){
    apply();

    const mo=new MutationObserver(mutations=>{
      let shouldApply=false;
      for(const m of mutations){
        if(m.type==='childList' && m.addedNodes.length){
          for(const node of m.addedNodes){
            if(node.nodeType===1){
              markDynamic(node);
              shouldApply=true;
            }
          }
        } else if(m.type==='attributes'){
          shouldApply=true;
        }
      }
      if(shouldApply) schedule();
    });

    mo.observe(document.documentElement,{
      subtree:true,
      childList:true,
      attributes:true,
      attributeFilter:[
        'class','style','data-theme','data-nurselink-theme','data-color-theme',
        'aria-selected','aria-expanded','disabled'
      ]
    });

    addEventListener('resize',schedule,{passive:true});
    addEventListener('orientationchange',schedule,{passive:true});
    addEventListener('storage',schedule);
    addEventListener('popstate',schedule);
    addEventListener('hashchange',schedule);

    try{
      matchMedia('(prefers-color-scheme:dark)').addEventListener('change',schedule);
    }catch(_){}

    console.info(MARK);
  }

  document.readyState==='loading'
    ? document.addEventListener('DOMContentLoaded',start,{once:true})
    : start();
})();
