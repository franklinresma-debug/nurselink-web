/* NurseLink Sticky Topbar Target Pages Runtime v64.9.3 */
(() => {
  'use strict';

  const MARK = 'NURSELINK_STICKY_TOPBAR_TARGET_PAGES_V6493';

  const TARGET_PATHS = new Set([
    '/nurselink-mentoring.html',
    '/nurselink-engagement.html',
    '/learning',
    '/credentials',
    '/qualifications',
    '/documents',
    '/nurselink-digital-id.html'
  ]);

  function normalizePath() {
    let p = location.pathname || '/';
    if (p.length > 1) p = p.replace(/\/+$/, '');
    return p;
  }

  function isTargetPage() {
    return TARGET_PATHS.has(normalizePath());
  }

  function text(el) {
    return String([
      el?.getAttribute?.('aria-label'),
      el?.getAttribute?.('title'),
      el?.textContent
    ].filter(Boolean).join(' ')).toLowerCase();
  }

  function findTopbar() {
    const candidates = [...document.querySelectorAll(
      'header,.topbar,.top-bar,.app-header,.member-header,.member-topbar,' +
      '[class*="topbar"],[class*="top-bar"],[class*="app-header"],[class*="member-header"]'
    )];

    let best = null;
    let score = -1;

    for (const el of candidates) {
      const r = el.getBoundingClientRect();
      if (r.height < 34 || r.height > 180 || r.top > 260) continue;

      const t = text(el);
      let s = 0;
      if (t.includes('franklin') || t.includes('profile') || t.includes('account')) s += 3;
      if (t.includes('notification') || t.includes('bell')) s += 3;
      if (t.includes('theme') || t.includes('dark') || t.includes('light')) s += 3;
      if (t.includes('nurselink')) s += 2;

      if (s > score) {
        score = s;
        best = el;
      }
    }

    return score >= 2 ? best : null;
  }

  function applyStickyMarker() {
    const html = document.documentElement;
    const enabled = isTargetPage();

    html.dataset.nlStickyTopbarPage = enabled ? 'true' : 'false';
    html.dataset.nlStickyTopbarVersion = 'v64.9.3';

    if (!enabled) return;

    const bar = findTopbar();
    if (bar) {
      bar.dataset.nlStickyTopbar = 'true';
    }
  }

  let raf = 0;
  function schedule() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(applyStickyMarker);
  }

  function start() {
    applyStickyMarker();

    new MutationObserver(schedule).observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'data-theme', 'data-nurselink-theme', 'data-color-theme']
    });

    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    window.addEventListener('popstate', schedule);
    window.addEventListener('hashchange', schedule);

    console.info(MARK);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', start, { once: true })
    : start();
})();
