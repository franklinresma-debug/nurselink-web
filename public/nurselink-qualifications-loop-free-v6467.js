/* NurseLink Qualifications Loop-Free SPA Controller v64.6.7 */
(() => {
  if (window.__NL_QUAL_LOOP_FREE_V6467__) return;
  window.__NL_QUAL_LOOP_FREE_V6467__ = true;

  const QUAL = '/qualifications';
  let active = false;
  let generation = 0;
  let lastPath = '';
  let routeObserver = null;
  let routeTimer = null;

  const path = () => location.pathname.replace(/\/+$/,'') || '/';
  const isQual = () => path() === QUAL;

  function root() {
    return document.querySelector('.main-area main,.main-area .page,.main-area')
      || document.querySelector('main')
      || document.querySelector('[role="main"]');
  }

  function modern() {
    return document.querySelector('.nl6439-page');
  }

  function visibleLegacyBranchExists() {
    if (!isQual()) return false;
    const r = root();
    if (!r) return false;

    for (const child of Array.from(r.children)) {
      if (child.matches('.nl6439-page') || child.querySelector('.nl6439-page')) continue;
      if (child.getAttribute('data-nl6467-legacy-hidden') === '1') continue;

      const cs = getComputedStyle(child);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;

      const text = (child.textContent || '').replace(/\s+/g,' ');
      if (
        /NurseLink Qualification Readiness/i.test(text) ||
        (/Professional Readiness/i.test(text) && /Getting Started/i.test(text))
      ) {
        return true;
      }
    }
    return false;
  }

  function hideLegacy() {
    if (!isQual()) return;
    const r = root();
    if (!r) return;

    for (const child of Array.from(r.children)) {
      if (child.matches('.nl6439-page') || child.querySelector('.nl6439-page')) continue;

      const text = (child.textContent || '').replace(/\s+/g,' ');
      if (
        /NurseLink Qualification Readiness/i.test(text) ||
        (/Professional Readiness/i.test(text) && /Getting Started/i.test(text))
      ) {
        child.setAttribute('data-nl6467-legacy-hidden','1');
        child.setAttribute('aria-hidden','true');
      }
    }
  }

  function APIsReady() {
    return typeof window.__NL6439_MOUNT_MODERN_QUALIFICATIONS__ === 'function'
      && typeof window.__NL6440_ENHANCE_QUALIFICATIONS__ === 'function'
      && typeof window.__NL6441_LOAD_PROFILE_TABS__ === 'function';
  }

  async function mountModern(reason, myGeneration) {
    if (!active || !isQual() || generation !== myGeneration) return false;

    for (let i=0; i<20 && !APIsReady(); i++) {
      await new Promise(r => setTimeout(r, 50));
      if (!active || !isQual() || generation !== myGeneration) return false;
    }

    if (!APIsReady()) {
      console.error('NurseLink v64.6.7: Qualifications APIs unavailable.');
      return false;
    }

    // If already correct, do not remount.
    if (modern() && !visibleLegacyBranchExists()) {
      hideLegacy();
      return true;
    }

    const ok = window.__NL6439_MOUNT_MODERN_QUALIFICATIONS__(
      window.__NL6439_REFERENCE_FALLBACK__
    );
    if (!ok) return false;

    hideLegacy();

    try { window.__NL6440_ENHANCE_QUALIFICATIONS__(); } catch(e) {
      console.warn('NurseLink v64.6.7 interactions init failed', e);
    }

    try { await window.__NL6441_LOAD_PROFILE_TABS__(); } catch(e) {
      console.warn('NurseLink v64.6.7 profile tabs init failed', e);
    }

    if (!active || !isQual() || generation !== myGeneration) return false;

    hideLegacy();
    document.documentElement.setAttribute('data-nl6467-modern-qualifications','1');
    console.info('NurseLink v64.6.7 mounted modern Qualifications:', reason);
    return true;
  }

  function boundedSettle(myGeneration) {
    // Finite checks only. No continuous content observer.
    const delays = [60, 220, 500, 900, 1500];

    delays.forEach((delay, index) => {
      setTimeout(async () => {
        if (!active || !isQual() || generation !== myGeneration) return;

        if (!modern() || visibleLegacyBranchExists()) {
          await mountModern(`settle-${index+1}`, myGeneration);
        } else {
          hideLegacy();
        }
      }, delay);
    });
  }

  function activate(reason) {
    if (active && isQual()) return;

    active = true;
    generation++;
    const myGeneration = generation;

    document.documentElement.setAttribute('data-nl6467-qual-active','1');

    boundedSettle(myGeneration);

    // First immediate attempt after native router gets a microtask.
    queueMicrotask(() => {
      if (active && isQual() && generation === myGeneration) {
        mountModern(reason, myGeneration);
      }
    });
  }

  function deactivate(reason) {
    if (!active) return;

    active = false;
    generation++;

    try { window.__NL6439_UNMOUNT_MODERN_QUALIFICATIONS__?.(); } catch {}

    document.querySelectorAll('[data-nl6467-legacy-hidden="1"]').forEach(el => {
      el.removeAttribute('data-nl6467-legacy-hidden');
      el.removeAttribute('aria-hidden');
    });

    document.documentElement.removeAttribute('data-nl6467-qual-active');
    document.documentElement.removeAttribute('data-nl6467-modern-qualifications');

    console.info('NurseLink v64.6.7 released Qualifications route:', reason);
  }

  function syncRoute(reason) {
    clearTimeout(routeTimer);
    routeTimer = setTimeout(() => {
      const current = path();

      if (current === lastPath && ((current === QUAL) === active)) return;
      lastPath = current;

      if (current === QUAL) activate(reason);
      else deactivate(reason);
    }, 0);
  }

  const nativePush = history.pushState.bind(history);
  history.pushState = function(...args) {
    const out = nativePush(...args);
    queueMicrotask(() => syncRoute('pushState'));
    return out;
  };

  const nativeReplace = history.replaceState.bind(history);
  history.replaceState = function(...args) {
    const out = nativeReplace(...args);
    queueMicrotask(() => syncRoute('replaceState'));
    return out;
  };

  window.addEventListener('popstate', () => syncRoute('popstate'));

  // Route-only fallback. It watches for URL changes but NEVER remounts based on DOM mutations.
  routeObserver = new MutationObserver(() => {
    if (path() !== lastPath) syncRoute('dom-route-change');
  });

  function start() {
    routeObserver.observe(document.documentElement, { childList:true, subtree:true });
    syncRoute('initial');
    document.documentElement.setAttribute('data-nl6467-route-controller','1');
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', start, { once:true })
    : start();
})();
