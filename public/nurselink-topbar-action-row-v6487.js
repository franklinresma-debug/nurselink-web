/* NurseLink Topbar Action Row Alignment v64.8.7 */
(() => {
  if (window.__NL_TOPBAR_ACTION_ROW_V6487__) return;
  window.__NL_TOPBAR_ACTION_ROW_V6487__ = true;

  let timer = null;

  function getTopbar() {
    const host = document.getElementById('nl6484-topbar-host');
    if (host?.firstElementChild) return host.firstElementChild;

    return document.querySelector(
      '.nurselink-topbar,.nl-topbar,.member-topbar,' +
      'header[class*="topbar"],[class*="topbar"][class*="member"],[data-nl-topbar]'
    ) || document.querySelector('header');
  }

  function sig(el) {
    return [
      el?.getAttribute?.('aria-label') || '',
      el?.getAttribute?.('title') || '',
      el?.className || '',
      el?.textContent || ''
    ].join(' ').toLowerCase();
  }

  function visible(el) {
    if (!el) return false;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 8 && r.height > 8;
  }

  function findTheme(bar) {
    return bar?.querySelector('.nl6486-theme-button,.nl6481-theme-button,.nl6480-theme-button');
  }

  function findNotification(bar) {
    if (!bar) return null;

    const controls = Array.from(bar.querySelectorAll('button,[role="button"],a[href]'));

    return controls.find(el => {
      if (!visible(el)) return false;
      const s = sig(el);
      return (
        /\b(notification|notifications|bell|alert|alerts)\b/.test(s) ||
        !!el.querySelector('[class*="badge"],[class*="count"],[data-count],sup')
      );
    }) || null;
  }

  function findProfile(bar) {
    if (!bar) return null;

    const candidates = Array.from(bar.querySelectorAll(
      '[class*="profile"],[class*="member"],[class*="account"],div,button,a'
    ));

    return candidates.find(el => {
      if (!visible(el)) return false;
      if (el.matches('.nl6486-theme-button')) return false;

      const hasImg = !!el.querySelector?.('img');
      const s = sig(el);

      return hasImg && (
        /\b(member|profile|account|franklin|resma)\b/.test(s) ||
        !!el.querySelector('[class*="name"],[class*="member-number"],[class*="member-id"]')
      );
    }) || null;
  }

  function commonParent(a,b) {
    if (!a || !b) return null;

    const parentsA = [];
    let p = a.parentElement;
    while (p) {
      parentsA.push(p);
      p = p.parentElement;
    }

    p = b.parentElement;
    while (p) {
      if (parentsA.includes(p)) return p;
      p = p.parentElement;
    }

    return null;
  }

  function chooseRow(bar, profile, notification) {
    if (!bar) return null;

    const common = commonParent(profile, notification);

    if (common && common !== bar && bar.contains(common)) {
      const r = common.getBoundingClientRect();
      if (r.width < bar.getBoundingClientRect().width * .75) return common;
    }

    for (const sel of [
      '.topbar-actions',
      '.header-actions',
      '.member-actions',
      '[class*="topbar-actions"]',
      '[class*="header-actions"]',
      '[class*="member-actions"]',
      '[class*="actions"]'
    ]) {
      const el = bar.querySelector(sel);
      if (visible(el)) return el;
    }

    return bar;
  }

  function directChildOf(row, el) {
    if (!row || !el) return null;

    let cur = el;
    while (cur.parentElement && cur.parentElement !== row) {
      cur = cur.parentElement;
    }

    return cur.parentElement === row ? cur : el;
  }

  function align() {
    const bar = getTopbar();
    if (!bar) return;

    const theme = findTheme(bar);
    const notification = findNotification(bar);
    const profile = findProfile(bar);

    if (!theme) return;

    const row = chooseRow(bar, profile, notification);
    if (!row) return;

    row.setAttribute('data-nl6487-action-row','1');

    const profileItem = directChildOf(row, profile);
    const notificationItem = directChildOf(row, notification);

    if (profileItem) profileItem.setAttribute('data-nl6487-profile','1');
    if (notificationItem) notificationItem.setAttribute('data-nl6487-notification','1');

    // Move theme into the exact same row as profile + notification.
    if (theme.parentElement !== row) {
      if (profileItem && profileItem.parentElement === row) {
        row.insertBefore(theme, profileItem);
      } else if (notificationItem && notificationItem.parentElement === row) {
        row.insertBefore(theme, notificationItem);
      } else {
        row.appendChild(theme);
      }
    } else {
      // Ensure Theme appears before Profile / Notification.
      if (profileItem && theme.nextSibling !== profileItem) {
        row.insertBefore(theme, profileItem);
      } else if (!profileItem && notificationItem) {
        row.insertBefore(theme, notificationItem);
      }
    }

    document.documentElement.setAttribute('data-nl6487-action-row-aligned','1');

    requestAnimationFrame(() => {
      const tr = theme.getBoundingClientRect();
      const rr = row.getBoundingClientRect();

      const themeCenter = tr.top + tr.height / 2;
      const rowCenter = rr.top + rr.height / 2;

      document.documentElement.setAttribute(
        'data-nl6487-theme-center',
        Math.abs(themeCenter - rowCenter) <= 3 ? 'ok' : 'bad'
      );
    });
  }

  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(align,100);
  });

  const push = history.pushState.bind(history);
  history.pushState = function(...args) {
    const out = push(...args);
    setTimeout(align,30);
    setTimeout(align,180);
    return out;
  };

  const replace = history.replaceState.bind(history);
  history.replaceState = function(...args) {
    const out = replace(...args);
    setTimeout(align,30);
    return out;
  };

  window.addEventListener('popstate', () => setTimeout(align,30));
  window.addEventListener('resize', () => setTimeout(align,100));

  function boot() {
    align();
    observer.observe(document.documentElement,{
      childList:true,
      subtree:true
    });

    [250,700,1400].forEach(ms => setTimeout(align,ms));
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded',boot,{once:true})
    : boot();
})();
