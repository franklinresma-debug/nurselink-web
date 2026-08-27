/* NurseLink Stable Mobile Topbar Rollback v65.0.9 */
(() => {
  if (window.__NL_STABLE_TOPBAR_ROLLBACK_V6509__) return;
  window.__NL_STABLE_TOPBAR_ROLLBACK_V6509__ = true;

  let mountedBar = null;
  let timer = null;

  function visible(el) {
    if (!el) return false;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 4 && r.height > 4;
  }

  function sig(el) {
    return [
      el?.getAttribute?.('aria-label') || '',
      el?.getAttribute?.('title') || '',
      el?.className || '',
      el?.textContent || ''
    ].join(' ').toLowerCase();
  }

  function topbar() {
    const host = document.getElementById('nl6484-topbar-host');
    if (host?.firstElementChild) return host.firstElementChild;
    return document.querySelector(
      '.nurselink-topbar,.nl-topbar,.member-topbar,' +
      'header[class*="topbar"],[class*="topbar"][class*="member"],[data-nl-topbar]'
    ) || document.querySelector('header');
  }

  function findMenu(bar) {
    const candidates = Array.from(bar.querySelectorAll('button,[role="button"],a'));
    return candidates.find(el => {
      const s = sig(el);
      return /\b(menu|hamburger|drawer|navigation)\b/.test(s);
    }) || candidates.find(el => {
      const r = el.getBoundingClientRect();
      return r.left < innerWidth * .25 && !!el.querySelector('svg');
    }) || null;
  }

  function findTheme(bar) {
    return bar.querySelector('.nl6486-theme-button');
  }

  function findNotification(bar) {
    return Array.from(bar.querySelectorAll('button,[role="button"],a[href],div')).find(el => {
      if (!visible(el)) return false;
      const s = sig(el);
      return /\b(notification|notifications|bell|alert|alerts)\b/.test(s) ||
        !!el.querySelector?.('[class*="badge"],[class*="count"],[data-count],sup');
    }) || null;
  }

  function findProfile(bar) {
    return Array.from(bar.querySelectorAll(
      'button,a,[role="button"],[class*="profile"],[class*="member"],[class*="account"],div'
    )).find(el => {
      if (!visible(el)) return false;
      if (el.matches('.nl6486-theme-button')) return false;
      const img = el.querySelector?.('img');
      if (!img) return false;
      const s = sig(el);
      return /\b(profile|member|account|franklin|resma)\b/.test(s) ||
        !!el.querySelector('[class*="name"],[class*="member-number"],[class*="member-id"]');
    }) || null;
  }

  function closestDirect(el, bar) {
    if (!el) return null;
    let cur = el;
    while (cur.parentElement && cur.parentElement !== bar) cur = cur.parentElement;
    return cur;
  }

  function brand() {
    const wrap = document.createElement('div');
    wrap.setAttribute('data-nl6509-brand','1');

    const title = document.createElement('span');
    title.textContent = 'NurseLink';
    title.setAttribute('data-nl6509-brand-title','1');

    const subtitle = document.createElement('span');
    subtitle.textContent = 'Kapit-Bisig';
    subtitle.setAttribute('data-nl6509-brand-subtitle','1');

    wrap.append(title, subtitle);
    return wrap;
  }

  function slot(name,node) {
    const wrap = document.createElement('div');
    wrap.setAttribute(`data-nl6509-${name}`,'1');
    wrap.appendChild(node);
    return wrap;
  }

  function mount() {
    if (innerWidth > 900) return;
    const bar = topbar();
    if (!bar) return;

    if (
      bar === mountedBar &&
      bar.getAttribute('data-nl6509-topbar') === '1'
    ) return;

    const menu = findMenu(bar);
    const profile = findProfile(bar);
    const theme = findTheme(bar);
    const notification = findNotification(bar);

    if (!menu || !profile || !theme || !notification) return;

    const menuNode = closestDirect(menu,bar);
    const profileNode = closestDirect(profile,bar);
    const themeNode = closestDirect(theme,bar);
    const notificationNode = closestDirect(notification,bar);

    if (!menuNode || !profileNode || !themeNode || !notificationNode) return;

    const left = document.createElement('div');
    left.setAttribute('data-nl6509-left','1');

    const menuSlot = document.createElement('div');
    menuSlot.setAttribute('data-nl6509-menu-slot','1');
    menuSlot.appendChild(menuNode);

    left.appendChild(menuSlot);
    left.appendChild(brand());

    const right = document.createElement('div');
    right.setAttribute('data-nl6509-right','1');
    right.appendChild(slot('profile',profileNode));
    right.appendChild(slot('theme',themeNode));
    right.appendChild(slot('notification',notificationNode));

    for (const child of Array.from(bar.children)) {
      if ([menuNode,profileNode,themeNode,notificationNode].includes(child)) continue;
      child.style.setProperty('display','none','important');
      child.setAttribute('data-nl6509-hidden-extra','1');
    }

    bar.prepend(left);
    bar.appendChild(right);
    bar.setAttribute('data-nl6509-topbar','1');
    mountedBar = bar;
  }

  function remount() {
    mountedBar = null;
    clearTimeout(timer);
    timer = setTimeout(mount,100);
    setTimeout(mount,300);
  }

  const obs = new MutationObserver(() => {
    const current = topbar();
    if (current !== mountedBar || !current?.isConnected) remount();
  });

  window.addEventListener('orientationchange',remount);
  window.addEventListener('popstate',remount);

  function boot() {
    mount();
    obs.observe(document.documentElement,{childList:true,subtree:true});
    [250,700,1400].forEach(ms => setTimeout(mount,ms));
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded',boot,{once:true})
    : boot();
})();
