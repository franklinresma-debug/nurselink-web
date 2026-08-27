/* NurseLink Topbar Control Dimensions v64.8.1 */
(() => {
  if (window.__NL_TOPBAR_DIMENSIONS_V6481__) return;
  window.__NL_TOPBAR_DIMENSIONS_V6481__ = true;

  let timer = null;

  function topbar() {
    return document.querySelector(
      '.nurselink-topbar,.nl-topbar,.member-topbar,' +
      'header[class*="topbar"],[class*="topbar"][class*="member"],[data-nl-topbar]'
    ) || document.querySelector('header');
  }

  function sig(el) {
    return [
      el.getAttribute('aria-label') || '',
      el.getAttribute('title') || '',
      el.className || '',
      el.textContent || ''
    ].join(' ').toLowerCase();
  }

  function classify() {
    const bar = topbar();
    if (!bar) return;

    const controls = Array.from(
      bar.querySelectorAll('button,[role="button"],a[href]')
    );

    for (const el of controls) {
      if (el.closest('.nl6472-mobile-brand')) continue;

      const s = sig(el);

      if (/\bhelp\b/.test(s)) {
        el.setAttribute('data-nl6481-topbar-control','1');
        el.setAttribute('data-nl6481-control-type','help');

        if (!el.getAttribute('aria-label')) el.setAttribute('aria-label','Help');
        if (!el.getAttribute('title')) el.setAttribute('title','Help');
        continue;
      }

      if (
        /\b(notification|notifications|bell|alerts?)\b/.test(s) ||
        el.querySelector('[class*="badge"],[class*="bell"],svg')
          && /\bnotification\b/.test(
            (el.getAttribute('aria-label') || el.getAttribute('title') || '').toLowerCase()
          )
      ) {
        el.setAttribute('data-nl6481-topbar-control','1');
        el.setAttribute('data-nl6481-control-type','notification');
        continue;
      }
    }

    /* Single-tap theme button is already classed; no separate marker needed. */
    const theme = bar.querySelector('.nl6480-theme-button,.nl6481-theme-button');
    if (theme) {
      theme.setAttribute('data-nl6481-control-type','theme');
    }

    document.documentElement.setAttribute('data-nl6481-topbar-dimensions','1');
  }

  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(classify, 100);
  });

  function boot() {
    classify();

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class','aria-label','title']
    });

    [250,700,1400].forEach(ms => setTimeout(classify, ms));
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded',boot,{once:true})
    : boot();
})();
