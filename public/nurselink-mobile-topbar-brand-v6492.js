/* NurseLink Mobile Topbar Brand Label v64.9.2 */
(() => {
  if (window.__NL_MOBILE_TOPBAR_BRAND_V6492__) return;
  window.__NL_MOBILE_TOPBAR_BRAND_V6492__ = true;

  let timer = null;

  function getTopbar() {
    const host = document.getElementById('nl6484-topbar-host');
    if (host?.firstElementChild) return host.firstElementChild;

    return document.querySelector(
      '.nurselink-topbar,.nl-topbar,.member-topbar,' +
      'header[class*="topbar"],[class*="topbar"][class*="member"],[data-nl-topbar]'
    ) || document.querySelector('header');
  }

  function txt(el) {
    return (el?.textContent || '').replace(/\s+/g,' ').trim();
  }

  function replaceMobileBrand() {
    if (innerWidth > 900) return;

    const bar = getTopbar();
    if (!bar) return;

    const candidates = Array.from(bar.querySelectorAll('span,div,strong,b,p'));

    let brand = candidates.find(el => {
      const t = txt(el);
      return t === 'KAPIT-BISIG' || t === 'KAPIT–BISIG' || t.startsWith('KAPIT-B');
    });

    if (!brand) {
      brand = candidates.find(el => {
        const t = txt(el).toLowerCase();
        return t.includes('kapit-bisig') && t.length < 40;
      });
    }

    if (!brand) return;

    brand.textContent = 'NurseLink';
    brand.setAttribute('data-nl6492-mobile-topbar-brand','1');

    document.documentElement.setAttribute('data-nl6492-mobile-brand-label','1');
  }

  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(replaceMobileBrand,100);
  });

  const push = history.pushState.bind(history);
  history.pushState = function(...args) {
    const out = push(...args);
    setTimeout(replaceMobileBrand,30);
    setTimeout(replaceMobileBrand,180);
    return out;
  };

  const replace = history.replaceState.bind(history);
  history.replaceState = function(...args) {
    const out = replace(...args);
    setTimeout(replaceMobileBrand,30);
    return out;
  };

  window.addEventListener('popstate', () => setTimeout(replaceMobileBrand,30));
  window.addEventListener('resize', () => setTimeout(replaceMobileBrand,100));

  function boot() {
    replaceMobileBrand();

    observer.observe(document.documentElement,{
      childList:true,
      subtree:true
    });

    [250,700,1400].forEach(ms => setTimeout(replaceMobileBrand,ms));
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded',boot,{once:true})
    : boot();
})();
