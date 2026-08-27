/* NurseLink Global Blue Sidebar + Sticky Topbar Runtime v64.9.4 */
(() => {
  'use strict';

  const MARK = 'NURSELINK_GLOBAL_BLUE_SIDEBAR_STICKY_TOPBAR_V6494';

  function findTopbars() {
    return [...document.querySelectorAll(
      '[data-nl-minimal-topbar="true"],' +
      '[data-nl-mobile-topbar="true"],' +
      'header,.topbar,.top-bar,.app-header,.member-header,.member-topbar,' +
      '[class*="topbar"],[class*="top-bar"],[class*="app-header"],[class*="member-header"]'
    )];
  }

  function findSidebars() {
    return [...document.querySelectorAll(
      '.member-react-safe-shell-v108 .sidebar,' +
      '.member-react-safe-shell-v108 [class*="sidebar"],' +
      '.member-react-safe-shell-v108 aside[class*="nav"],' +
      '.member-react-safe-shell-v108 nav[class*="sidebar"]'
    )];
  }

  function apply() {
    const html = document.documentElement;
    html.dataset.nlGlobalStickyTopbar = 'true';
    html.dataset.nlGlobalBlueSidebar = 'true';
    html.dataset.nlGlobalShellVersion = 'v64.9.4';

    for (const bar of findTopbars()) {
      const rect = bar.getBoundingClientRect();
      if (rect.height >= 30 && rect.height <= 180) {
        bar.dataset.nlGlobalStickyTopbar = 'true';
      }
    }

    for (const sidebar of findSidebars()) {
      sidebar.dataset.nlGlobalBlueSidebar = 'true';
    }
  }

  let raf = 0;
  const schedule = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(apply);
  };

  function start() {
    apply();

    new MutationObserver(schedule).observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        'class',
        'style',
        'data-theme',
        'data-nurselink-theme',
        'data-color-theme'
      ]
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
