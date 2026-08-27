/* NurseLink Qualifications Theme + Mobile Topbar v64.6.3 */
(() => {
  'use strict';
  const MARK = 'NURSELINK_QUALIFICATIONS_THEME_MOBILE_TOPBAR_V6463';

  const pathRoute = () => {
    const p = (location.pathname || '/').replace(/\/+$/, '') || '/';
    return p === '/qualifications' ? 'qualifications' : '';
  };

  const normalizeTheme = (value) => {
    const v = String(value || '').toLowerCase();
    if (v.includes('dark')) return 'dark';
    if (v.includes('light')) return 'light';
    return '';
  };

  const detectTheme = () => {
    const html = document.documentElement;
    const body = document.body;
    const candidates = [
      html?.dataset?.theme,
      html?.dataset?.nurselinkTheme,
      html?.getAttribute('data-color-theme'),
      body?.dataset?.theme,
      body?.dataset?.nurselinkTheme,
      html?.classList?.contains('dark') ? 'dark' : '',
      body?.classList?.contains('dark') ? 'dark' : ''
    ];
    for (const c of candidates) {
      const t = normalizeTheme(c);
      if (t) return t;
    }
    try {
      const keys = ['theme','nurselink-theme','nurselinkTheme','color-theme'];
      for (const key of keys) {
        const t = normalizeTheme(localStorage.getItem(key));
        if (t) return t;
      }
    } catch (_) {}
    return matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const applyThemeMarker = () => {
    const html = document.documentElement;
    if (!html) return;
    const route = pathRoute();
    if (route) {
      html.dataset.nlRoute = route;
      if (document.body) document.body.dataset.nlRoute = route;
    } else {
      delete html.dataset.nlRoute;
      if (document.body) delete document.body.dataset.nlRoute;
    }
    html.dataset.nlEffectiveTheme = detectTheme();
  };

  const text = el => (el?.textContent || '').trim().toLowerCase();
  const attrText = el => [
    el?.getAttribute?.('aria-label'),
    el?.getAttribute?.('title'),
    el?.getAttribute?.('data-tooltip'),
    el?.getAttribute?.('name')
  ].filter(Boolean).join(' ').toLowerCase();

  const findButton = (root, words) => {
    const nodes = [...root.querySelectorAll('button,a,[role="button"]')];
    return nodes.find(el => {
      const hay = `${attrText(el)} ${text(el)}`;
      return words.some(w => hay.includes(w));
    }) || null;
  };

  const findTopbar = () => {
    const selectors = [
      'header', '.topbar', '.top-bar', '.app-header', '.member-header',
      '[class*="topbar"]', '[class*="top-bar"]', '[class*="header"]'
    ];
    const candidates = [...document.querySelectorAll(selectors.join(','))];
    const menuWords = ['menu','navigation','sidebar'];
    const themeWords = ['theme','dark','light','appearance'];
    const notifWords = ['notification','bell','alert'];
    for (const el of candidates) {
      const rect = el.getBoundingClientRect();
      if (rect.height < 38 || rect.height > 180 || rect.top > 220) continue;
      if (findButton(el, menuWords) && (findButton(el, themeWords) || findButton(el, notifWords))) return el;
    }
    return null;
  };

  const tagMobileTopbar = () => {
    const bar = findTopbar();
    if (!bar) return false;
    bar.dataset.nlMobileTopbar = 'true';

    const menu = findButton(bar, ['menu','navigation','sidebar']);
    const theme = findButton(bar, ['theme','dark','light','appearance']);
    const notif = findButton(bar, ['notification','bell','alert']);
    const profile = findButton(bar, ['profile','account','member','user']);

    if (menu) menu.dataset.nlTopbarMenu = 'true';
    if (theme) theme.dataset.nlTopbarTheme = 'true';
    if (notif) notif.dataset.nlTopbarNotifications = 'true';
    if (profile) profile.dataset.nlTopbarProfile = 'true';

    const brand = [...bar.querySelectorAll('a,div,span,strong')].find(el => {
      const t = text(el);
      return t.includes('nurselink') && (t.includes('kapit') || el.children.length <= 4);
    });
    if (brand) brand.dataset.nlTopbarBrand = 'true';

    const leftCandidates = [menu?.parentElement, brand?.parentElement].filter(Boolean);
    const left = leftCandidates.find(el => el !== bar && el.parentElement === bar) ||
                 (menu && brand ? menu.closest('div') : null);
    if (left && left !== bar) left.dataset.nlTopbarLeft = 'true';

    const actionEls = [profile, theme, notif].filter(Boolean);
    if (actionEls.length >= 2) {
      let common = actionEls[0].parentElement;
      while (common && common !== bar && !actionEls.every(e => common.contains(e))) {
        common = common.parentElement;
      }
      if (common && common !== bar) common.dataset.nlTopbarActions = 'true';
    }

    if (profile) {
      const labels = profile.querySelectorAll('span,small,strong');
      labels.forEach(x => x.dataset.nlTopbarProfileLabel = 'true');
    }
    return true;
  };

  const run = () => {
    applyThemeMarker();
    tagMobileTopbar();
    document.documentElement.dataset.nlV6463 = 'active';
  };

  const mo = new MutationObserver(() => {
    applyThemeMarker();
    tagMobileTopbar();
  });

  const start = () => {
    run();
    mo.observe(document.documentElement, {
      subtree: true, childList: true, attributes: true,
      attributeFilter: ['class','data-theme','data-nurselink-theme','data-color-theme']
    });
    window.addEventListener('popstate', run);
    window.addEventListener('hashchange', run);
    window.addEventListener('storage', applyThemeMarker);
    try {
      matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyThemeMarker);
    } catch (_) {}
    console.info(MARK);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
