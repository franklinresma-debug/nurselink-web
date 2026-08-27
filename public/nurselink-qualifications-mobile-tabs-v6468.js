/* NurseLink Qualifications Mobile Scroll Tabs v64.6.8 */
(() => {
  if (window.__NL_MOBILE_TABS_V6468__) return;
  window.__NL_MOBILE_TABS_V6468__ = true;

  const QUAL = '/qualifications';

  function onQualifications() {
    return location.pathname.replace(/\/+$/,'') === QUAL;
  }

  function tabStrip() {
    return document.querySelector(
      '.member-profile-tabs-v6441,' +
      '.nl6441-tabs,' +
     '.nl6439-tabs,' +
      '[data-nl-profile-tabs],' +
      '.nl6439-page nav[aria-label*="profile" i],' +
      '.nl6439-page nav[aria-label*="qualification" i]'
    );
  }

  function activeTab(strip) {
    if (!strip) return null;
    return strip.querySelector(
      '[aria-current="page"],[aria-selected="true"],.active,.is-active,' +
      'a[href="#overview"].active,a[href="#qualifications"].active'
    );
  }

  function keepActiveVisible() {
    if (!onQualifications() || window.innerWidth > 900) return;

    const strip = tabStrip();
    const active = activeTab(strip);
    if (!strip || !active) return;

    requestAnimationFrame(() => {
      try {
        active.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      } catch {
        const left = active.offsetLeft - (strip.clientWidth - active.clientWidth) / 2;
        strip.scrollTo({ left: Math.max(0,left), behavior:'smooth' });
      }
    });
  }

  document.addEventListener('click', e => {
    const strip = e.target.closest?.(
      '.member-profile-tabs-v6441,.nl6441-tabs,.nl6439-tabs,[data-nl-profile-tabs]'
    );
    if (!strip) return;
    setTimeout(keepActiveVisible, 40);
  });

  window.addEventListener('resize', () => {
    clearTimeout(window.__nl6468Resize);
    window.__nl6468Resize = setTimeout(keepActiveVisible, 120);
  });

  // Route-aware but does not intercept routing.
  const push = history.pushState.bind(history);
  history.pushState = function(...args) {
    const out = push(...args);
    setTimeout(keepActiveVisible, 120);
    return out;
  };

  const replace = history.replaceState.bind(history);
  history.replaceState = function(...args) {
    const out = replace(...args);
    setTimeout(keepActiveVisible, 120);
    return out;
  };

  window.addEventListener('popstate', () => setTimeout(keepActiveVisible,120));

  const observer = new MutationObserver(() => {
    if (!onQualifications()) return;
    clearTimeout(window.__nl6468Mutation);
    window.__nl6468Mutation = setTimeout(keepActiveVisible, 90);
  });

  function boot() {
    observer.observe(document.documentElement, { childList:true, subtree:true });
    keepActiveVisible();
    document.documentElement.setAttribute('data-nl6468-mobile-tabs','1');
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot, { once:true })
    : boot();
})();
