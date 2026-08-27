/* NurseLink Qualifications Theme + Adaptive Mobile Topbar v64.6.8 */
(() => {
  'use strict';
  const MARK = 'NURSELINK_QUALIFICATIONS_THEME_ADAPTIVE_TOPBAR_V6468';

  const norm = v => String(v || '').trim().toLowerCase();
  const words = el => norm([
    el?.getAttribute?.('aria-label'),
    el?.getAttribute?.('title'),
    el?.getAttribute?.('data-tooltip'),
    el?.getAttribute?.('name'),
    el?.textContent
  ].filter(Boolean).join(' '));

  const route = () => {
    const p = (location.pathname || '/').replace(/\/+$/, '') || '/';
    return p === '/qualifications' ? 'qualifications' : '';
  };

  const detectTheme = () => {
    const h = document.documentElement, b = document.body;
    const vals = [
      h?.dataset?.theme, h?.dataset?.nurselinkTheme, h?.getAttribute('data-color-theme'),
      b?.dataset?.theme, b?.dataset?.nurselinkTheme,
      h?.classList?.contains('dark') ? 'dark' : '',
      b?.classList?.contains('dark') ? 'dark' : ''
    ].map(norm);
    if (vals.some(v => v.includes('dark'))) return 'dark';
    if (vals.some(v => v.includes('light'))) return 'light';
    try {
      for (const k of ['theme','nurselink-theme','nurselinkTheme','color-theme']) {
        const v = norm(localStorage.getItem(k));
        if (v.includes('dark')) return 'dark';
        if (v.includes('light')) return 'light';
      }
    } catch (_) {}
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const applyPageMarkers = () => {
    const h = document.documentElement;
    const r = route();
    if (r) {
      h.dataset.nlRoute = r;
      if (document.body) document.body.dataset.nlRoute = r;
    } else {
      delete h.dataset.nlRoute;
      if (document.body) delete document.body.dataset.nlRoute;
    }
    h.dataset.nlEffectiveTheme = detectTheme();
  };

  const findControl = (root, tests) => {
    const list = [...root.querySelectorAll('button,a,[role="button"],input[type="button"]')];
    return list.find(el => tests.some(t => words(el).includes(t))) || null;
  };

  const topbarCandidates = () => [...document.querySelectorAll(
    'header,.topbar,.top-bar,.app-header,.member-header,.member-topbar,' +
    '[class*="topbar"],[class*="top-bar"],[class*="app-header"],[class*="member-header"]'
  )];

  const findTopbar = () => {
    let best = null, score = -1;
    for (const el of topbarCandidates()) {
      const r = el.getBoundingClientRect();
      if (r.width < 240 || r.height < 36 || r.height > 190 || r.top > 230) continue;
      const t = words(el);
      let s = 0;
      if (t.includes('nurselink')) s += 5;
      if (findControl(el, ['menu','navigation','sidebar'])) s += 3;
      if (findControl(el, ['theme','dark','light','appearance'])) s += 3;
      if (findControl(el, ['notification','bell','alert'])) s += 3;
      if (findControl(el, ['profile','account','member','user'])) s += 2;
      if (s > score) { score = s; best = el; }
    }
    return score >= 6 ? best : null;
  };

  const commonAncestorBelow = (root, els) => {
    if (!els.length) return null;
    let node = els[0].parentElement;
    while (node && node !== root) {
      if (els.every(e => node.contains(e))) return node;
      node = node.parentElement;
    }
    return null;
  };

  const identify = bar => {
    const menu = findControl(bar, ['menu','navigation','sidebar']);
    const theme = findControl(bar, ['theme','dark mode','light mode','appearance']);
    const notif = findControl(bar, ['notification','notifications','bell','alerts']);
    let profile = findControl(bar, ['profile','my account','account','member profile','user']);

    // Fallback profile: avatar/image-bearing clickable control that is not menu/theme/notification.
    if (!profile) {
      profile = [...bar.querySelectorAll('button,a,[role="button"]')].find(el =>
        el !== menu && el !== theme && el !== notif &&
        !!el.querySelector('img,[class*="avatar"],[class*="profile"]')
      ) || null;
    }

    let brand = [...bar.querySelectorAll('a,div,span,strong')].find(el => {
      const t = norm(el.textContent);
      return t.includes('nurselink') && el.getBoundingClientRect().width > 35;
    }) || null;

    bar.dataset.nlMobileTopbar = 'true';
    if (menu) menu.dataset.nlTopbarMenu = 'true';
    if (theme) theme.dataset.nlTopbarTheme = 'true';
    if (notif) notif.dataset.nlTopbarNotifications = 'true';
    if (profile) profile.dataset.nlTopbarProfile = 'true';
    if (brand) brand.dataset.nlTopbarBrand = 'true';

    const actions = commonAncestorBelow(bar, [profile, theme, notif].filter(Boolean));
    if (actions) actions.dataset.nlTopbarActions = 'true';

    // Prefer a common left group; otherwise tag the direct child containing menu/brand.
    let left = commonAncestorBelow(bar, [menu, brand].filter(Boolean));
    if (!left && menu) {
      let n = menu;
      while (n.parentElement && n.parentElement !== bar) n = n.parentElement;
      if (n.parentElement === bar) left = n;
    }
    if (left) left.dataset.nlTopbarLeft = 'true';

    if (profile) {
      profile.querySelectorAll('span,small,strong').forEach(x => {
        if (!x.querySelector('img')) x.dataset.nlTopbarProfileLabel = 'true';
      });
    }

    return {bar, menu, brand, profile, theme, notif, actions, left};
  };

  const width = el => el ? el.getBoundingClientRect().width : 0;

  const chooseDensity = refs => {
    const {bar, left, actions, menu, brand, profile, theme, notif} = refs;
    if (!bar || window.innerWidth > 767) {
      if (bar) delete bar.dataset.nlTopbarDensity;
      return;
    }

    const barW = width(bar);
    const actionW = actions ? width(actions) :
      [profile, theme, notif].reduce((n, el) => n + width(el), 0) + 40;
    const menuW = width(menu);
    const brandW = width(brand);
    const leftNeed = left ? width(left) : menuW + brandW + 12;

    // Required breathing room. Use measured content rather than device-name breakpoints.
    const normalNeed = actionW + Math.max(leftNeed, 142) + 24;
    const compactNeed = actionW + Math.max(menuW + Math.min(brandW, 118) + 8, 126) + 14;
    const tightNeed = actionW + Math.max(menuW + 92, 104) + 10;

    let density = 'normal';
    if (barW < normalNeed) density = 'compact';
    if (barW < compactNeed) density = 'tight';
    if (barW < tightNeed) density = 'micro';

    bar.dataset.nlTopbarDensity = density;
  };

  let raf = 0;
  const refresh = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      applyPageMarkers();
      const bar = findTopbar();
      if (!bar) return;
      const refs = identify(bar);
      chooseDensity(refs);
      document.documentElement.dataset.nlV6468 = 'active';
    });
  };

  const start = () => {
    refresh();

    const mo = new MutationObserver(refresh);
    mo.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class','data-theme','data-nurselink-theme','data-color-theme','aria-label']
    });

    let ro;
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(refresh);
      ro.observe(document.documentElement);
    }

    window.addEventListener('resize', refresh, {passive:true});
    window.addEventListener('orientationchange', refresh, {passive:true});
    window.addEventListener('popstate', refresh);
    window.addEventListener('hashchange', refresh);
    window.addEventListener('storage', refresh);

    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', refresh);
    } catch (_) {}

    console.info(MARK);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, {once:true});
  } else {
    start();
  }
})();
