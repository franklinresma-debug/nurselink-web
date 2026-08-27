/* NURSELINK_MEMBER_PORTAL_DARK_SURFACE_CLOSURE_V6500 */
(function(){
  'use strict';
  if(window.__NurseLinkMemberDarkSurfaceV6500) return;
  window.__NurseLinkMemberDarkSurfaceV6500=true;

  var memberPaths=[
    '/profile','/smart-registration','/application-status','/portfolio','/jobs',
    '/applications','/learning','/initiatives','/policies','/policy-center',
    '/nurselink-mentoring.html','/nurselink-digital-id.html',
    '/credentials','/qualifications','/documents','/messages','/events',
    '/engagement','/welfare','/dashboard'
  ];
  if(memberPaths.indexOf(location.pathname)===-1) return;

  function rgb(v){
    var m=String(v||'').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    return m?[+m[1],+m[2],+m[3]]:null;
  }

  function darkPage(){
    var c=rgb(getComputedStyle(document.body).backgroundColor);
    return !!(c && (c[0]+c[1]+c[2])/3<90);
  }

  function visible(el){
    if(!el || el.nodeType!==1) return false;
    var r=el.getBoundingClientRect();
    return r.width>0 && r.height>0;
  }

  function shouldTag(el){
    if(!visible(el)) return false;
    if(el.matches('button,a,input,textarea,select,option,svg,img,video,canvas')) return false;

    var r=el.getBoundingClientRect();
    if(r.width<180 || r.height<42) return false;
    if(r.width>window.innerWidth*.96 && r.height>window.innerHeight*.80) return false;
    if(el.children.length>24) return false;

    var cs=getComputedStyle(el);
    var c=rgb(cs.backgroundColor);
    if(!c) return false;
    var avg=(c[0]+c[1]+c[2])/3;
    if(avg<236) return false;

    var radius=parseFloat(cs.borderRadius)||0;
    var border=(parseFloat(cs.borderTopWidth)||0)+(parseFloat(cs.borderLeftWidth)||0);
    var cls=String(el.className||'').toLowerCase();
    var semantic=/card|panel|box|empty|summary|status|profile|settings|editor|share|metric|stat|tile|detail|info|queue|upload|document/.test(cls);

    return radius>=5 || border>0 || semantic;
  }

  function apply(){
    if(!darkPage()) return;
    document.documentElement.setAttribute('data-nl-v65-dark','1');

    var roots=[document.querySelector('main'),document.querySelector('[role="main"]'),document.body].filter(Boolean);
    var root=roots[0];
    [].slice.call(root.querySelectorAll('section,article,div,fieldset,label')).forEach(function(el){
      if(shouldTag(el)) el.classList.add('nl65-dark-component');
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){
      apply(); setTimeout(apply,400); setTimeout(apply,1400);
    });
  }else{
    apply(); setTimeout(apply,400); setTimeout(apply,1400);
  }

  var mo=new MutationObserver(function(){
    clearTimeout(window.__nl65t);
    window.__nl65t=setTimeout(apply,160);
  });
  mo.observe(document.documentElement,{subtree:true,childList:true});
})();
