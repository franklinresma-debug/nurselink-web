/* NurseLink Global Responsive Dual Theme Runtime v64.9.0 */
(() => {
  'use strict';
  const MARK='NURSELINK_GLOBAL_RESPONSIVE_DUAL_THEME_V6490';
  const norm=v=>String(v||'').trim().toLowerCase();

  function route(){
    const p=(location.pathname||'/').replace(/\/+$/,'')||'/';
    return p.slice(1)||'home';
  }

  function theme(){
    const h=document.documentElement,b=document.body;
    for(const raw of [
      h?.dataset?.theme,h?.dataset?.nurselinkTheme,h?.dataset?.colorTheme,
      h?.getAttribute('data-color-theme'),b?.dataset?.theme,b?.dataset?.nurselinkTheme
    ]){
      const v=norm(raw);
      if(v.includes('dark'))return'dark';
      if(v.includes('light'))return'light';
    }
    if(h?.classList?.contains('dark')||b?.classList?.contains('dark'))return'dark';
    if(h?.classList?.contains('light')||b?.classList?.contains('light'))return'light';

    try{
      for(const k of ['theme','nurselink-theme','nurselinkTheme','color-theme','appearance']){
        const v=norm(localStorage.getItem(k));
        if(v.includes('dark'))return'dark';
        if(v.includes('light'))return'light';
      }
    }catch(_){}

    return matchMedia?.('(prefers-color-scheme:dark)').matches?'dark':'light';
  }

  function device(){
    const w=window.innerWidth;
    if(w<=767)return'mobile';
    if(w<=1199)return'tablet';
    return'desktop';
  }

  function apply(){
    const h=document.documentElement;
    h.dataset.nlEffectiveTheme=theme();
    h.dataset.nlRoute=route();
    h.dataset.nlViewportClass=device();
    h.dataset.nlGlobalResponsiveDualTheme='v64.9.0';
  }

  let raf=0;
  const schedule=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(apply)};

  function start(){
    apply();

    new MutationObserver(schedule).observe(document.documentElement,{
      subtree:true,
      childList:true,
      attributes:true,
      attributeFilter:['class','data-theme','data-nurselink-theme','data-color-theme']
    });

    window.addEventListener('resize',schedule,{passive:true});
    window.addEventListener('orientationchange',schedule,{passive:true});
    window.addEventListener('storage',schedule);
    window.addEventListener('popstate',schedule);
    window.addEventListener('hashchange',schedule);

    try{
      matchMedia('(prefers-color-scheme:dark)').addEventListener('change',schedule);
    }catch(_){}

    console.info(MARK);
  }

  document.readyState==='loading'
    ? document.addEventListener('DOMContentLoaded',start,{once:true})
    : start();
})();
