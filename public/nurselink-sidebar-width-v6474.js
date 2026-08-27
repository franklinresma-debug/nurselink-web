/* NurseLink Sidebar Text + Dashboard Width Normalization v64.7.4 */
(() => {
  if (window.__NL_WIDTH_FIX_V6474__) return;
  window.__NL_WIDTH_FIX_V6474__ = true;

  const CONTENT_ATTR = 'data-nl6474-dashboard-width';
  const TABLE_ATTR = 'data-nl6474-table-wrap';
  let timer = null;

  const EXCLUDED = [
    'header',
    '.nurselink-topbar',
    '.nl-topbar',
    '.member-topbar',
    '.nurselink-sidebar',
    '.nl-sidebar',
    'aside[class*="sidebar"]',
    '[data-nl-sidebar]',
    '.nl6439-page'
  ].join(',');

  function mainArea() {
    return document.querySelector(
      'main,[role="main"],.main-area,.member-main,.nurselink-member-main,.nl-member-shell-main'
    );
  }

  function isVisible(el) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.width > 10 && r.height > 10;
  }

  function standardWidth() {
    // Use a stable desktop target matching the Dashboard column.
    if (innerWidth >= 1200) return 980;
    if (innerWidth >= 901) return Math.max(720, innerWidth - 260);
    return Math.max(320, innerWidth - 24);
  }

  function markWideBlocks() {
    const main = mainArea();
    if (!main) return;

    const target = standardWidth();

    // Look at page-level structural blocks only, not every nested card.
    const candidates = new Set();

    for (const el of main.querySelectorAll(
      ':scope > section,:scope > article,:scope > div,' +
      ':scope > * > section,:scope > * > article'
    )) {
      candidates.add(el);
    }

    for (const el of candidates) {
      if (!isVisible(el)) continue;
      if (el.matches(EXCLUDED) || el.closest('.nl6439-page')) continue;

      const r = el.getBoundingClientRect();

      // Only normalize genuinely oversized page sections.
      if (innerWidth > 1100 && r.width > Math.max(target + 160, innerWidth * .68)) {
        el.setAttribute(CONTENT_ATTR, '1');
      }
    }

    // Known page areas that commonly render edge-to-edge.
    const route = location.pathname.replace(/\/+$/,'');
    if (['/credentials','/application-status','/smart-registration'].includes(route)) {
      const headings = Array.from(main.querySelectorAll('h1,h2')).filter(isVisible);

      for (const h of headings) {
        let block = h.closest('section,article');
        if (!block) {
          const p = h.parentElement;
          if (p && p !== main) block = p;
        }

        if (block && isVisible(block)) {
          const r = block.getBoundingClientRect();
          if (r.width > target + 120) block.setAttribute(CONTENT_ATTR,'1');
        }
      }
    }
  }

  function wrapTables() {
    const main = mainArea();
    if (!main) return;

    main.querySelectorAll('table').forEach(table => {
      if (table.closest(`[${TABLE_ATTR}="1"]`)) return;

      const wrap = document.createElement('div');
      wrap.setAttribute(TABLE_ATTR,'1');
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }

  function scan() {
    markWideBlocks();
    wrapTables();
    document.documentElement.setAttribute('data-nl6474-layout','1');
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(scan, 100);
  }

  const observer = new MutationObserver(schedule);

  const push = history.pushState.bind(history);
  history.pushState = function(...args) {
    const out = push(...args);
    setTimeout(scan,120);
    return out;
  };

  const replace = history.replaceState.bind(history);
  history.replaceState = function(...args) {
    const out = replace(...args);
    setTimeout(scan,120);
    return out;
  };

  window.addEventListener('popstate', () => setTimeout(scan,120));
  window.addEventListener('resize', schedule);

  function boot() {
    scan();
    observer.observe(document.documentElement,{childList:true,subtree:true});
    [300,800,1500].forEach(ms => setTimeout(scan,ms));
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded',boot,{once:true})
    : boot();
})();
