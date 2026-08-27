/* NurseLink Global Theme Runtime v64.7.3 */
(() => {
  'use strict';
  const MARK = 'NURSELINK_GLOBAL_MEMBER_THEME_REFINEMENT_V6473';
  const normalize = v => String(v || '').trim().toLowerCase();

  function detectTheme() {
    const h = document.documentElement, b = document.body;
    const values = [
      h?.dataset?.theme,
      h?.dataset?.nurselinkTheme,
      h?.dataset?.colorTheme,
      h?.getAttribute('data-color-theme'),
      b?.dataset?.theme,
      b?.dataset?.nurselinkTheme
    ];

    for (const raw of values) {
      const v = normalize(raw);
      if (v.includes('dark')) return 'dark';
      if (v.includes('light')) return 'light';
    }

    if (h?.classList?.contains('dark') || b?.classList?.contains('dark')) return 'dark';
    if (h?.classList?.contains('light') || b?.classList?.contains('light')) return 'light';

    try {
      for (const key of ['theme','nurselink-theme','nurselinkTheme','color-theme','appearance']) {
        const v = normalize(localStorage.getItem(key));
        if (v.includes('dark')) return 'dark';
        if (v.includes('light')) return 'light';
      }
    } catch (_) {}

    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply() {
    const h = document.documentElement;
    h.dataset.nlEffectiveTheme = detectTheme();
    h.dataset.nlGlobalMemberTheme = 'v64.7.3';
  }

  let raf = 0;
  function schedule() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(apply);
  }

  function start() {
    apply();
    const mo = new MutationObserver(schedule);
    mo.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class','data-theme','data-nurselink-theme','data-color-theme']
    });
    window.addEventListener('storage', schedule);
    window.addEventListener('popstate', schedule);
    window.addEventListener('hashchange', schedule);
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', schedule);
    } catch (_) {}
    console.info(MARK);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, {once:true});
  } else {
    start();
  }
})();
