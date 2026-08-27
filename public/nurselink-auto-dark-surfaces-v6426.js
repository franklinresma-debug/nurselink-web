/* NurseLink Stable Auto Dark Surface Runtime v64.2.6 */
(() => {
  if (window.__NURSELINK_AUTO_DARK_SURFACE_V6426__) return;
  window.__NURSELINK_AUTO_DARK_SURFACE_V6426__ = true;

  const CLASS = 'nurselink-auto-dark-surface-v6426';
  const OLD_CLASS = 'nurselink-auto-dark-surface-v6425';
  const ROOT_SELECTOR = '.main-area';
  const CANDIDATES = 'div,section,article,li,aside';

  const EXCLUDE = [
    'button','a','input','select','textarea','label','img','svg','canvas','video',
    '[role="button"]','[role="dialog"]',
    '.badge','.status-badge','.nurselink-notification-badge',
    '.nurselink-member-id-status','.nurselink-member-id-qr',
    '.avatar','.user-chip','.member-theme-control-v337',
    '.topbar','.sidebar'
  ].join(',');

  function darkMode() {
    const html = document.documentElement;
    const body = document.body;
    return (
      html.getAttribute('data-theme') === 'dark' ||
      html.classList.contains('dark') ||
      body?.classList.contains('dark')
    );
  }

  function parseColor(color) {
    if (!color || color === 'transparent') return null;
    const m = color.match(/rgba?\(([^)]+)\)/i);
    if (!m) return null;
    const parts = m[1].split(',').map(v => parseFloat(v.trim()));
    if (parts.length < 3) return null;
    return {r:parts[0], g:parts[1], b:parts[2], a:parts.length > 3 ? parts[3] : 1};
  }

  function luminance({r,g,b}) {
    const norm = [r,g,b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126*norm[0] + 0.7152*norm[1] + 0.0722*norm[2];
  }

  function isLightSurface(el) {
    if (!(el instanceof HTMLElement)) return false;
    if (el.classList.contains(CLASS)) return false; // critical anti-flicker latch
    if (el.matches(EXCLUDE) || el.closest('.topbar,.sidebar,[role="dialog"]')) return false;

    const rect = el.getBoundingClientRect();
    if (rect.width < 120 || rect.height < 36) return false;

    const cs = getComputedStyle(el);
    if (cs.display === 'inline' || cs.display === 'inline-block') return false;

    const bg = parseColor(cs.backgroundColor);
    if (!bg || bg.a < 0.55) return false;

    return luminance(bg) >= 0.72;
  }

  function clearAll() {
    document.querySelectorAll('.' + CLASS).forEach(el => el.classList.remove(CLASS));
    document.querySelectorAll('.' + OLD_CLASS).forEach(el => el.classList.remove(OLD_CLASS));
    document.documentElement.removeAttribute('data-nurselink-auto-dark-surfaces');
  }

  function normalize(scope = document) {
    if (!darkMode()) {
      clearAll();
      return;
    }

    // Remove legacy v6425 runtime class once; v6426 owns normalization now.
    document.querySelectorAll('.' + OLD_CLASS).forEach(el => {
      el.classList.remove(OLD_CLASS);
    });

    const root = scope.matches?.(ROOT_SELECTOR) ? scope : document.querySelector(ROOT_SELECTOR);
    if (!root) return;

    if (root.matches?.(CANDIDATES) && isLightSurface(root)) {
      root.classList.add(CLASS);
    }

    root.querySelectorAll(CANDIDATES).forEach(el => {
      if (isLightSurface(el)) {
        el.classList.add(CLASS);
      }
      // IMPORTANT: never remove CLASS while dark mode is active.
    });

    document.documentElement.setAttribute('data-nurselink-auto-dark-surfaces','v64.2.6');
  }

  let scheduled = false;
  function schedule(scope = document) {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      normalize(scope);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => schedule(), {once:true});
  } else {
    schedule();
  }

  // Observe DOM additions only. Do NOT observe class/style mutations caused by ourselves.
  new MutationObserver(records => {
    if (!darkMode()) return;
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof HTMLElement) {
          schedule(node.closest(ROOT_SELECTOR) || document);
          return;
        }
      }
    }
  }).observe(document.documentElement, {
    subtree: true,
    childList: true
  });

  // Theme changes are observed separately.
  new MutationObserver(() => {
    if (darkMode()) schedule();
    else clearAll();
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class','data-theme']
  });

  if (document.body) {
    new MutationObserver(() => {
      if (darkMode()) schedule();
      else clearAll();
    }).observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  addEventListener('resize', () => schedule(), {passive:true});
  addEventListener('popstate', () => schedule());
  document.addEventListener('click', () => setTimeout(() => schedule(), 0), true);
})();
