/* NurseLink Sticky Topbar All Devices v64.7.5 */
(() => {
  if (window.__NL_STICKY_TOPBAR_V6475__) return;
  window.__NL_STICKY_TOPBAR_V6475__ = true;

  let topbar = null;
  let spacer = null;
  let testTimer = null;
  let mutationTimer = null;

  function findTopbar() {
    return document.querySelector(
      '.nurselink-topbar,.nl-topbar,.member-topbar,' +
      'header[class*="topbar"],[class*="topbar"][class*="member"],' +
      '[data-nl-topbar]'
    ) || document.querySelector('header');
  }

  function findSidebar() {
    return document.querySelector(
      '.nurselink-sidebar,.nl-sidebar,aside[class*="sidebar"],' +
      '[class*="sidebar"][class*="member"],[data-nl-sidebar]'
    );
  }

  function ensureSpacer() {
    if (!topbar) return;
    if (spacer?.isConnected) return;

    spacer = document.createElement('div');
    spacer.setAttribute('data-nl6475-topbar-spacer','1');
    topbar.parentNode?.insertBefore(spacer, topbar.nextSibling);
  }

  function updateMetrics() {
    if (!topbar) return;

    const rect = topbar.getBoundingClientRect();
    document.documentElement.style.setProperty(
      '--nl6475-topbar-height',
      `${Math.max(0, Math.round(rect.height))}px`
    );

    const sidebar = findSidebar();
    let left = 0;

    if (innerWidth > 900 && sidebar) {
      const sr = sidebar.getBoundingClientRect();
      if (sr.right > 0 && sr.left <= 1) left = Math.round(sr.right);
    }

    document.documentElement.style.setProperty(
      '--nl6475-fixed-left',
      `${Math.max(0,left)}px`
    );
  }

  function stickySupported() {
    return CSS.supports?.('position','sticky') || CSS.supports?.('position','-webkit-sticky');
  }

  function hasBlockingAncestor() {
    if (!topbar) return false;

    let p = topbar.parentElement;
    while (p && p !== document.body && p !== document.documentElement) {
      const cs = getComputedStyle(p);

      // Horizontal clipping is fine. Vertical scrolling/clipping on an ancestor
      // commonly prevents the header from sticking to the viewport.
      if (['auto','scroll','hidden','clip'].includes(cs.overflowY)) {
        const r = p.getBoundingClientRect();
        if (r.height < document.documentElement.scrollHeight * .85) return true;
      }

      p = p.parentElement;
    }

    return false;
  }

  function enableFixedFallback() {
    ensureSpacer();
    updateMetrics();
    document.documentElement.setAttribute('data-nl6475-fixed-fallback','1');
  }

  function disableFixedFallback() {
    document.documentElement.removeAttribute('data-nl6475-fixed-fallback');
  }

  function verifySticky() {
    if (!topbar) return;

    clearTimeout(testTimer);
    testTimer = setTimeout(() => {
      updateMetrics();

      if (!stickySupported() || hasBlockingAncestor()) {
        enableFixedFallback();
        return;
      }

      disableFixedFallback();
    }, 80);
  }

  function activate() {
    const found = findTopbar();
    if (!found) return;

    if (topbar !== found) {
      topbar = found;
      topbar.setAttribute('data-nl6475-sticky-topbar','1');
      ensureSpacer();
    }

    updateMetrics();
    verifySticky();
    document.documentElement.setAttribute('data-nl6475-sticky-controller','1');
  }

  window.addEventListener('resize', () => {
    clearTimeout(testTimer);
    testTimer = setTimeout(() => {
      activate();
      updateMetrics();
    },100);
  });

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      activate();
      updateMetrics();
    },180);
  });

  const observer = new MutationObserver(() => {
    clearTimeout(mutationTimer);
    mutationTimer = setTimeout(() => {
      if (!topbar?.isConnected) topbar = null;
      activate();
    },120);
  });

  function boot() {
    activate();
    observer.observe(document.documentElement,{
      childList:true,
      subtree:true
    });

    [300,900,1600].forEach(ms => setTimeout(activate,ms));
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded',boot,{once:true})
    : boot();
})();
