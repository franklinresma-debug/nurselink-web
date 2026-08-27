/* NurseLink Mobile Topbar Help Removal v64.8.3 */
(() => {
  if (window.__NL_MOBILE_HELP_REMOVAL_V6483__) return;
  window.__NL_MOBILE_HELP_REMOVAL_V6483__ = true;

  let timer = null;

  function topbar() {
    return document.querySelector(
      '.nurselink-topbar,.nl-topbar,.member-topbar,' +
      'header[class*="topbar"],[class*="topbar"][class*="member"],[data-nl-topbar]'
    ) || document.querySelector('header');
  }

  function signature(el) {
    return [
      el.getAttribute('aria-label') || '',
      el.getAttribute('title') || '',
      el.className || '',
      el.textContent || ''
    ].join(' ').toLowerCase();
  }

  function markHelp() {
    const bar = topbar();
    if (!bar) return;

    for (const el of bar.querySelectorAll('button,[role="button"],a[href]')) {
      if (el.matches('[data-nl6481-control-type="help"]')) {
        el.setAttribute('data-nl6483-mobile-help','1');
        continue;
      }

      const s = signature(el);
      if (/\bhelp\b/.test(s)) {
        el.setAttribute('data-nl6483-mobile-help','1');
      }
    }

    document.documentElement.setAttribute('data-nl6483-mobile-help-removal','1');
  }

  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(markHelp, 100);
  });

  function boot() {
    markHelp();

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class','aria-label','title']
    });

    [250,700,1400].forEach(ms => setTimeout(markHelp, ms));
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot, {once:true})
    : boot();
})();
