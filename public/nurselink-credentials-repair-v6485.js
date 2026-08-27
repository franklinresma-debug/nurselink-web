/* NurseLink Credentials Page Repair v64.8.5 */
(() => {
  if (window.__NL_CREDENTIALS_REPAIR_V6485__) return;
  window.__NL_CREDENTIALS_REPAIR_V6485__ = true;

  let timer = null;
  let resizeTimer = null;

  const FOREIGN_MARKERS = [
    'mentoring & peer support',
    'connect with nurselink members',
    'career intelligence',
    'professional growth & mobility insights',
    'application readiness',
    'review before you submit',
    'membership review',
    'application timeline'
  ];

  function onCredentials() {
    return location.pathname.replace(/\/+$/,'') === '/credentials';
  }

  function mainShell() {
    return document.querySelector(
      'main,[role="main"],.main-area,.member-main,.nurselink-member-main,.nl-member-shell-main'
    );
  }

  function text(el) {
    return (el?.innerText || el?.textContent || '').replace(/\s+/g,' ').trim().toLowerCase();
  }

  function findCredentialsAnchors() {
    const nodes = Array.from(document.querySelectorAll('h1,h2,h3,[class*="title"],[class*="heading"]'));

    const recordHeading = nodes.find(el =>
      text(el).includes('your nurselink credential records')
    );

    const professionalHeading = nodes.find(el =>
      text(el).includes('credentials & professional development')
    );

    return {recordHeading, professionalHeading};
  }

  function structuralBlock(el) {
    if (!el) return null;

    let cur = el;
    const main = mainShell();

    while (cur && cur.parentElement && cur.parentElement !== main) {
      const parent = cur.parentElement;
      const r = parent.getBoundingClientRect();

      if (
        parent.matches('section,article,[class*="card"],[class*="panel"],[class*="section"]') &&
        r.width > 300
      ) {
        return parent;
      }

      cur = parent;
    }

    return cur || el;
  }

  function findRoot() {
    const {recordHeading, professionalHeading} = findCredentialsAnchors();
    const main = mainShell();

    if (!main) return null;

    const a = structuralBlock(recordHeading);
    const b = structuralBlock(professionalHeading);

    // Find a common page-level parent without swallowing the whole app shell.
    if (a && b) {
      let p = a;
      while (p && p !== main) {
        if (p.contains(b)) return p;
        p = p.parentElement;
      }
    }

    return a || b || main;
  }

  function markStaleFragments() {
    const main = mainShell();
    if (!main) return;

    const {recordHeading, professionalHeading} = findCredentialsAnchors();
    const credentialNodes = new Set(
      [recordHeading, professionalHeading].filter(Boolean)
    );

    const candidates = Array.from(
      main.querySelectorAll('section,article,[class*="card"],[class*="panel"],[class*="section"]')
    );

    for (const el of candidates) {
      if (!el.isConnected) continue;

      const t = text(el);
      if (!t) continue;

      // Never hide anything that contains the actual credentials headings.
      if ([...credentialNodes].some(h => el.contains(h))) continue;

      const foreign = FOREIGN_MARKERS.some(marker => t.includes(marker));
      if (!foreign) continue;

      // Only hide reasonably self-contained blocks, not the entire main shell.
      const r = el.getBoundingClientRect();
      if (r.width > 280 && r.height > 35 && r.height < innerHeight * 0.8) {
        el.setAttribute('data-nl6485-stale-fragment','1');
      }
    }
  }

  function repairTopbarHost() {
    const host = document.getElementById('nl6484-topbar-host');
    if (!host) return;

    // Keep host as the first body-level shell object.
    if (host.parentElement !== document.body) {
      document.body.insertBefore(host, document.body.firstChild);
    } else if (document.body.firstElementChild !== host) {
      document.body.insertBefore(host, document.body.firstChild);
    }

    // Inline !important protection against route CSS.
    host.style.setProperty('position','fixed','important');
    host.style.setProperty('top','0','important');
    host.style.setProperty('right','0','important');
    host.style.setProperty('bottom','auto','important');
    host.style.setProperty('transform','none','important');
    host.style.setProperty('margin','0','important');
    host.style.setProperty('z-index','9500','important');

    let left = 0;
    if (innerWidth > 900) {
      const sidebar = document.querySelector(
        '.nurselink-sidebar,.nl-sidebar,aside[class*="sidebar"],[data-nl-sidebar]'
      );
      if (sidebar) {
        const sr = sidebar.getBoundingClientRect();
        if (sr.left <= 2 && sr.right > 0) left = Math.ceil(sr.right);
      }
    }
    host.style.setProperty('left',`${left}px`,'important');

    const topbar = host.firstElementChild;
    if (topbar) {
      const h = Math.max(52, Math.ceil(topbar.getBoundingClientRect().height));
      document.documentElement.style.setProperty('--nl6484-topbar-height', `${h}px`);
    }
  }

  function normalizePage() {
    if (!onCredentials()) {
      document.documentElement.removeAttribute('data-nl6485-credentials');
      return;
    }

    document.documentElement.setAttribute('data-nl6485-credentials','1');

    const main = mainShell();
    if (main) main.setAttribute('data-nl6485-credentials-main','1');

    const root = findRoot();
    if (root) root.setAttribute('data-nl6485-credentials-root','1');

    markStaleFragments();
    repairTopbarHost();

    requestAnimationFrame(() => {
      repairTopbarHost();

      const host = document.getElementById('nl6484-topbar-host');
      if (host) {
        const rect = host.getBoundingClientRect();
        document.documentElement.setAttribute(
          'data-nl6485-topbar-top',
          Math.abs(rect.top) <= 2 ? 'ok' : 'bad'
        );
      }
    });
  }

  function settle() {
    normalizePage();
    [80,220,500,1000].forEach(ms => setTimeout(normalizePage, ms));
  }

  const push = history.pushState.bind(history);
  history.pushState = function(...args) {
    const out = push(...args);
    setTimeout(settle,20);
    return out;
  };

  const replace = history.replaceState.bind(history);
  history.replaceState = function(...args) {
    const out = replace(...args);
    setTimeout(settle,20);
    return out;
  };

  window.addEventListener('popstate', () => setTimeout(settle,20));

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(normalizePage,100);
  });

  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(normalizePage,120);
  });

  function boot() {
    settle();
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded',boot,{once:true})
    : boot();
})();
