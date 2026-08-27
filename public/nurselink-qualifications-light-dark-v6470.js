/* NurseLink Qualifications Light/Dark Theme Runtime v64.7.0 */
(() => {
  'use strict';
  const MARK = 'NURSELINK_QUALIFICATIONS_LIGHT_DARK_V6470';

  const normalize = v => String(v || '').trim().toLowerCase();

  function isQualifications() {
    return (location.pathname || '').replace(/\/+$/, '') === '/qualifications';
  }

  function detectTheme() {
    const h = document.documentElement;
    const b = document.body;

    const candidates = [
      h?.dataset?.theme,
      h?.dataset?.nurselinkTheme,
      h?.dataset?.colorTheme,
      h?.getAttribute('data-color-theme'),
      b?.dataset?.theme,
      b?.dataset?.nurselinkTheme
    ];

    for (const raw of candidates) {
      const v = normalize(raw);
      if (v.includes('dark')) return 'dark';
      if (v.includes('light')) return 'light';
    }

    if (h?.classList?.contains('dark') || b?.classList?.contains('dark')) return 'dark';
    if (h?.classList?.contains('light') || b?.classList?.contains('light')) return 'light';

    try {
      for (const key of [
        'theme',
        'nurselink-theme',
        'nurselinkTheme',
        'color-theme',
        'appearance'
      ]) {
        const v = normalize(localStorage.getItem(key));
        if (v.includes('dark')) return 'dark';
        if (v.includes('light')) return 'light';
      }
    } catch (_) {}

    return window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function apply() {
    const h = document.documentElement;

    if (isQualifications()) {
      h.dataset.nlRoute = 'qualifications';
      if (document.body) document.body.dataset.nlRoute = 'qualifications';
    } else {
      delete h.dataset.nlRoute;
      if (document.body) delete document.body.dataset.nlRoute;
      return;
    }

    h.dataset.nlEffectiveTheme = detectTheme();
    h.dataset.nlQualificationsTheme = 'v64.7.0';
  }

  let raf = 0;
  function schedule() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(apply);
  }

  function start() {
    apply();

    const observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        'class',
        'data-theme',
        'data-nurselink-theme',
        'data-color-theme'
      ]
    });

    window.addEventListener('storage', schedule);
    window.addEventListener('popstate', schedule);
    window.addEventListener('hashchange', schedule);

    try {
      window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', schedule);
    } catch (_) {}

    console.info(MARK);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
