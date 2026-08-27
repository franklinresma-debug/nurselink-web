/* NurseLink Mobile Dashboard Menu + Theme Text Reset v64.7.2 */
(() => {
  if (window.__NL_MOBILE_DRAWER_V6472__) return;
  window.__NL_MOBILE_DRAWER_V6472__ = true;

  const BODY_CLASS = 'nl6472-drawer-open';
  let sidebar = null;
  let nav = null;
  let trigger = null;
  let brand = null;

  function findSidebar() {
    return document.querySelector(
      '.nurselink-sidebar,.nl-sidebar,aside[class*="sidebar"],' +
      '[class*="sidebar"][class*="member"],[data-nl-sidebar]'
    );
  }

  function findTopbar() {
    return document.querySelector(
      '.nurselink-topbar,.nl-topbar,.member-topbar,' +
      'header[class*="topbar"],[class*="topbar"][class*="member"]'
    ) || document.querySelector('header');
  }

  function findNav(root) {
    if (!root) return null;
    return root.querySelector('nav,ul,[role="navigation"]') || root;
  }

  function currentLink() {
    if (!nav) return null;
    const path = location.pathname.replace(/\/+$/,'') || '/';
    for (const a of nav.querySelectorAll('a[href]')) {
      try {
        const u = new URL(a.getAttribute('href'), location.href);
        if ((u.pathname.replace(/\/+$/,'') || '/') === path) return a;
      } catch {}
    }
    return null;
  }

  function markCurrent() {
    if (!nav) return;
    nav.querySelectorAll('a[href]').forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('aria-current') === 'page') a.removeAttribute('aria-current');
    });
    const a = currentLink();
    if (a) {
      a.classList.add('active');
      a.setAttribute('aria-current','page');
    }
  }

  function open() {
    if (innerWidth > 900) return;
    document.body.classList.add(BODY_CLASS);
    trigger?.setAttribute('aria-expanded','true');
  }

  function close() {
    document.body.classList.remove(BODY_CLASS);
    trigger?.setAttribute('aria-expanded','false');
  }

  function buildBrand() {
    if (!sidebar || sidebar.querySelector('.nl6472-mobile-brand')) return;

    brand = document.createElement('div');
    brand.className = 'nl6472-mobile-brand';
    brand.innerHTML = `
      <div class="nl6472-mobile-logo" aria-hidden="true">NL</div>
      <div class="nl6472-mobile-brand-copy">
        <div class="nl6472-mobile-brand-title">NurseLink</div>
        <div class="nl6472-mobile-brand-subtitle">KAPIT-BISIG</div>
      </div>
      <button type="button" class="nl6472-mobile-close" aria-label="Close menu">×</button>
    `;

    sidebar.prepend(brand);
    brand.querySelector('.nl6472-mobile-close').addEventListener('click', close);
  }

  function buildTrigger() {
    const topbar = findTopbar();
    if (!topbar) return;

    trigger = topbar.querySelector('.nl6472-mobile-menu-trigger');
    if (trigger) return;

    trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'nl6472-mobile-menu-trigger';
    trigger.setAttribute('aria-label','Open dashboard menu');
    trigger.setAttribute('aria-expanded','false');
    trigger.innerHTML = '<span></span>';

    topbar.prepend(trigger);
    trigger.addEventListener('click', () => {
      document.body.classList.contains(BODY_CLASS) ? close() : open();
    });
  }

  function prepareNav() {
    nav = findNav(sidebar);
    if (!nav) return;
    nav.classList.add('nl6472-mobile-nav');

    nav.querySelectorAll('a[href]').forEach(a => {
      a.addEventListener('click', () => {
        if (innerWidth <= 900) close();
      });
    });

    markCurrent();
  }

  function syncTheme() {
    const html = document.documentElement;
    const body = document.body;
    const sig = `${html.className} ${body?.className || ''} ${html.getAttribute('data-theme') || ''}`.toLowerCase();

    if (/\bdark\b/.test(sig)) {
      html.setAttribute('data-theme','dark');
      return;
    }
    if (/\blight\b/.test(sig)) {
      html.setAttribute('data-theme','light');
      return;
    }

    const bg = getComputedStyle(document.body).backgroundColor;
    const nums = bg.match(/\d+/g)?.map(Number) || [255,255,255];
    const avg = (nums[0]+nums[1]+nums[2])/3;
    html.setAttribute('data-theme', avg < 110 ? 'dark' : 'light');
  }

  function init() {
    sidebar = findSidebar();
    if (!sidebar) return;

    buildBrand();
    prepareNav();
    buildTrigger();
    syncTheme();

    document.documentElement.setAttribute('data-nl6472-mobile-drawer','1');
  }

  document.addEventListener('click', e => {
    if (!document.body.classList.contains(BODY_CLASS)) return;
    if (sidebar?.contains(e.target) || trigger?.contains(e.target)) return;
    close();
  }, true);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });

  window.addEventListener('resize', () => {
    if (innerWidth > 900) close();
  });

  const push = history.pushState.bind(history);
  history.pushState = function(...args) {
    const out = push(...args);
    setTimeout(() => {
      markCurrent();
      close();
    }, 30);
    return out;
  };

  const replace = history.replaceState.bind(history);
  history.replaceState = function(...args) {
    const out = replace(...args);
    setTimeout(markCurrent, 30);
    return out;
  };

  window.addEventListener('popstate', () => {
    setTimeout(() => {
      markCurrent();
      close();
    },30);
  });

  const observer = new MutationObserver(() => {
    clearTimeout(window.__nl6472Mutation);
    window.__nl6472Mutation = setTimeout(() => {
      if (!sidebar?.isConnected) sidebar = findSidebar();
      if (sidebar) {
        buildBrand();
        prepareNav();
      }
      if (!trigger?.isConnected) buildTrigger();
      syncTheme();
      markCurrent();
    },120);
  });

  function boot() {
    init();
    observer.observe(document.documentElement,{
      childList:true,
      subtree:true,
      attributes:true,
      attributeFilter:['class','data-theme']
    });
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded',boot,{once:true})
    : boot();
})();
