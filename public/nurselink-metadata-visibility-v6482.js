/* NurseLink Metadata Visibility Runtime v64.8.2 */
(() => {
  'use strict';
  const MARK='NURSELINK_METADATA_VISIBILITY_REFINEMENT_V6482';
  const norm=v=>String(v||'').trim().toLowerCase();
  const route=()=>((location.pathname||'/').replace(/\/+$/,'')||'/').slice(1)||'home';

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

  function apply(){
    const h=document.documentElement;
    h.dataset.nlEffectiveTheme=theme();
    h.dataset.nlRoute=route();
    h.dataset.nlMetadataVisibility='v64.8.2';
  }

  let raf=0;
  const schedule=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(apply)};

  function start(){
    apply();
    new MutationObserver(schedule).observe(document.documentElement,{
      subtree:true,childList:true,attributes:true,
      attributeFilter:['class','data-theme','data-nurselink-theme','data-color-theme']
    });
    addEventListener('storage',schedule);
    addEventListener('popstate',schedule);
    addEventListener('hashchange',schedule);
    try{matchMedia('(prefers-color-scheme:dark)').addEventListener('change',schedule)}catch(_){}
    console.info(MARK);
  }

  document.readyState==='loading'
    ? document.addEventListener('DOMContentLoaded',start,{once:true})
    : start();
})();
