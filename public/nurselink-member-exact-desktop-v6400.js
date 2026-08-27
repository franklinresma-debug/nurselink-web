/* NURSELINK_MEMBER_PORTAL_EXACT_DESKTOP_V6400 */
(function(){
  'use strict';
  if(window.__NurseLinkMemberExactDesktopV6400) return;
  window.__NurseLinkMemberExactDesktopV6400=true;

  var allowed=[
    '/profile','/smart-registration','/application-status','/portfolio',
    '/jobs','/applications','/learning','/initiatives','/policies','/policy-center'
  ];
  if(allowed.indexOf(location.pathname)===-1) return;

  var html=document.documentElement;
  html.setAttribute('data-nl-v64-member','1');

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

  function findMain(){
    var els=[].slice.call(document.querySelectorAll('main,[role="main"],.app-main,.page-content,.content'));
    els=els.filter(visible);
    els.sort(function(a,b){
      var ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();
      return (br.width*br.height)-(ar.width*ar.height);
    });
    return els[0]||document.body;
  }

  function tagWrappers(main){
    main.classList.add('nl64-route-root');
    var mw=main.getBoundingClientRect().width;

    var candidates=[].slice.call(main.querySelectorAll('div,section')).filter(function(el){
      if(!visible(el)) return false;
      var r=el.getBoundingClientRect();
      if(r.width<760 || r.width>1350) return false;
      if(mw-r.width<140) return false;
      var cs=getComputedStyle(el);
      var ml=parseFloat(cs.marginLeft)||0, mr=parseFloat(cs.marginRight)||0;
      var centered=Math.abs(ml-mr)<10 && ml>20;
      var maxw=parseFloat(cs.maxWidth)||0;
      var cls=String(el.className||'').toLowerCase();
      var semantic=/container|content|page|shell|wrap|layout|workspace|main/.test(cls);
      return centered || (maxw>=760 && maxw<=1350) || semantic;
    });

    candidates.sort(function(a,b){
      return b.getBoundingClientRect().width-a.getBoundingClientRect().width;
    });

    var chosen=[];
    candidates.forEach(function(el){
      if(chosen.some(function(x){ return x.contains(el); })) return;
      chosen.push(el);
      el.classList.add('nl64-page-wrapper');
    });
  }

  function tagGrids(main){
    [].slice.call(main.querySelectorAll('div,section')).forEach(function(g){
      if(!visible(g)) return;
      var kids=[].slice.call(g.children).filter(visible);
      if(kids.length<2 || kids.length>3) return;
      var gr=g.getBoundingClientRect();
      if(gr.width<900) return;

      var cardKids=kids.filter(function(k){
        var r=k.getBoundingClientRect(),cs=getComputedStyle(k);
        return r.height>80 && r.width>220 &&
          ((parseFloat(cs.borderRadius)||0)>=6 || (parseFloat(cs.borderTopWidth)||0)>0);
      });
      if(cardKids.length!==kids.length) return;

      var tops=cardKids.map(function(k){return Math.round(k.getBoundingClientRect().top);});
      var sameRow=Math.max.apply(null,tops)-Math.min.apply(null,tops)<20;
      if(sameRow) return;

      if(kids.length===2) g.classList.add('nl64-grid-2');
      if(kids.length===3) g.classList.add('nl64-grid-3');
    });
  }

  function tagDarkCards(main){
    if(!darkPage()) return;
    html.setAttribute('data-nl-v64-dark','1');
    [].slice.call(main.querySelectorAll('section,article,div,label')).forEach(function(el){
      if(!visible(el) || el.children.length>14) return;
      var r=el.getBoundingClientRect();
      if(r.width<240 || r.height<50) return;
      var c=rgb(getComputedStyle(el).backgroundColor);
      if(!c) return;
      var avg=(c[0]+c[1]+c[2])/3;
      if(avg>244) el.classList.add('nl64-dark-card');
    });
  }

  function apply(){
    var main=findMain();
    tagWrappers(main);
    tagGrids(main);
    tagDarkCards(main);
  }

  function start(){
    apply();
    setTimeout(apply,400);
    setTimeout(apply,1400);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start);
  else start();

  var mo=new MutationObserver(function(){
    clearTimeout(window.__nl64t);
    window.__nl64t=setTimeout(apply,180);
  });
  mo.observe(document.documentElement,{subtree:true,childList:true});
})();
