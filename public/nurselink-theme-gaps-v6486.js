/* NurseLink Theme Toggle Visibility + Layout Gaps v64.8.6 */
(() => {
  if (window.__NL_THEME_GAPS_V6486__) return;
  window.__NL_THEME_GAPS_V6486__ = true;

  let themeButton = null;
  let lightControl = null;
  let darkControl = null;
  let timer = null;

  const SUN = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="M4.93 4.93l1.42 1.42"></path>
      <path d="M17.65 17.65l1.42 1.42"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="M4.93 19.07l1.42-1.42"></path>
      <path d="M17.65 6.35l1.42-1.42"></path>
    </svg>`;

  const MOON = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>`;

  function topbar() {
    const host = document.getElementById('nl6484-topbar-host');
    if (host?.firstElementChild) return host.firstElementChild;

    return document.querySelector(
      '.nurselink-topbar,.nl-topbar,.member-topbar,' +
      'header[class*="topbar"],[class*="topbar"][class*="member"],[data-nl-topbar]'
    ) || document.querySelector('header');
  }

  function actionsContainer(bar) {
    if (!bar) return null;

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
      if (el && getComputedStyle(el).display !== 'none') return el;
    }

    return bar;
  }

  function signature(el) {
    return [
      el.getAttribute('aria-label') || '',
      el.getAttribute('title') || '',
      el.getAttribute('data-theme') || '',
      el.getAttribute('data-mode') || '',
      el.getAttribute('data-value') || '',
      el.className || '',
      el.textContent || ''
    ].join(' ').toLowerCase();
  }

  function detectLegacyThemeControls() {
    const bar = topbar();
    if (!bar) return;

    const all = Array.from(bar.querySelectorAll('button,[role="button"],a[href]'))
      .filter(el => el !== themeButton && !themeButton?.contains(el));

    lightControl = all.find(el => {
      const s = signature(el);
      return /\b(light|sun|day)\b/.test(s) && !/\bdark\b/.test(s);
    }) || null;

    darkControl = all.find(el => {
      const s = signature(el);
      return /\b(dark|moon|night)\b/.test(s);
    }) || null;

    for (const el of all) {
      const s = signature(el);
      if (
        /\bsystem\b/.test(s) ||
        /\bauto\b/.test(s) ||
        /\bdevice\b/.test(s) ||
        /\bmonitor\b/.test(s) ||
        el.classList.contains('nl6477-theme-toggle') ||
        el.classList.contains('nl6480-theme-button') ||
        el.classList.contains('nl6481-theme-button')
      ) {
        el.setAttribute('data-nl6486-old-theme-control','1');
      }
    }

    if (lightControl) lightControl.setAttribute('data-nl6486-old-theme-control','1');
    if (darkControl) darkControl.setAttribute('data-nl6486-old-theme-control','1');
  }

  function currentTheme() {
    const html = document.documentElement;
    const body = document.body;

    const s = [
      html.getAttribute('data-theme') || '',
      body?.getAttribute('data-theme') || '',
      html.className || '',
      body?.className || ''
    ].join(' ').toLowerCase();

    if (/\bdark\b/.test(s)) return 'dark';
    if (/\blight\b/.test(s)) return 'light';

    const bg = getComputedStyle(body || html).backgroundColor;
    const nums = bg.match(/\d+/g)?.map(Number);
    if (nums && nums.length >= 3) {
      return ((nums[0]+nums[1]+nums[2])/3) < 120 ? 'dark' : 'light';
    }

    return 'light';
  }

  function fallbackTheme(target) {
    const html = document.documentElement;
    const body = document.body;

    html.setAttribute('data-theme', target);
    body?.setAttribute('data-theme', target);

    html.classList.toggle('dark', target === 'dark');
    html.classList.toggle('light', target === 'light');
    body?.classList.toggle('dark', target === 'dark');
    body?.classList.toggle('light', target === 'light');

    try {
      localStorage.setItem('theme', target);
      localStorage.setItem('nurselink-theme', target);
    } catch {}

    window.dispatchEvent(new CustomEvent('nurselink:themechange', {
      detail: {theme: target}
    }));
  }

  function applyTheme(target) {
    detectLegacyThemeControls();

    let native = false;

    if (target === 'light' && lightControl) {
      lightControl.click();
      native = true;
    }

    if (target === 'dark' && darkControl) {
      darkControl.click();
      native = true;
    }

    if (!native) fallbackTheme(target);

    requestAnimationFrame(() => {
      syncThemeButton();
      setTimeout(syncThemeButton,100);
      setTimeout(syncThemeButton,250);
    });
  }

  function syncThemeButton() {
    if (!themeButton?.isConnected) return;

    const state = currentTheme();
    themeButton.setAttribute('data-theme-state', state);

    if (state === 'dark') {
      themeButton.innerHTML = SUN;
      themeButton.setAttribute('aria-label','Switch to light mode');
      themeButton.setAttribute('title','Switch to light mode');
    } else {
      themeButton.innerHTML = MOON;
      themeButton.setAttribute('aria-label','Switch to dark mode');
      themeButton.setAttribute('title','Switch to dark mode');
    }
  }

  function mountThemeButton() {
    const bar = topbar();
    if (!bar) return false;

    if (themeButton?.isConnected) {
      syncThemeButton();
      return true;
    }

    detectLegacyThemeControls();

    const container = actionsContainer(bar);
    if (!container) return false;

    themeButton = document.createElement('button');
    themeButton.type = 'button';
    themeButton.className = 'nl6486-theme-button';

    themeButton.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });

    // Insert near notification/profile but NOT inside any legacy theme wrapper.
    const profileLike = Array.from(container.children).find(el => {
      const s = signature(el);
      return /\b(profile|member|account)\b/.test(s) || el.querySelector('img');
    });

    if (profileLike) {
      container.insertBefore(themeButton, profileLike);
    } else {
      container.appendChild(themeButton);
    }

    document.documentElement.setAttribute('data-nl6486-theme-mounted','1');

    detectLegacyThemeControls();
    syncThemeButton();
    return true;
  }

  function mainShell() {
    return document.querySelector(
      'main,[role="main"],.main-area,.member-main,.nurselink-member-main,.nl-member-shell-main'
    );
  }

  function visible(el) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 20 && r.height > 20 && cs.display !== 'none' && cs.visibility !== 'hidden';
  }

  function markSpacing() {
    const main = mainShell();
    if (!main) return;

    // Major vertical stacks.
    const pageRoots = Array.from(main.querySelectorAll(
      ':scope > div,:scope > section,:scope > article,' +
      ':scope > * > div,:scope > * > section,:scope > * > article'
    )).filter(visible);

    for (const root of pageRoots) {
      const children = Array.from(root.children).filter(visible);
      if (children.length >= 3) {
        root.setAttribute('data-nl6486-stack','1');
      }
    }

    // Grid/card containers.
    for (const el of main.querySelectorAll(
      '[class*="grid"],[class*="cards"],[class*="stats"],[class*="row"]'
    )) {
      if (!visible(el)) continue;
      const children = Array.from(el.children).filter(visible);
      if (children.length >= 2) el.setAttribute('data-nl6486-card-group','1');
    }

    // Self-contained card/panel blocks that are direct siblings.
    const blocks = Array.from(main.querySelectorAll(
      'section,article,[class*="card"],[class*="panel"]'
    )).filter(visible);

    for (const el of blocks) {
      const parent = el.parentElement;
      if (!parent) continue;

      const sibs = Array.from(parent.children).filter(visible);
      if (sibs.length >= 2) el.setAttribute('data-nl6486-spaced-block','1');
    }

    // Tables / table wrappers.
    for (const table of main.querySelectorAll('table,[role="table"]')) {
      const wrap = table.closest('[data-nl6474-table-wrap="1"]') || table.parentElement;
      if (wrap && visible(wrap)) wrap.setAttribute('data-nl6486-table-block','1');
    }

    document.documentElement.setAttribute('data-nl6486-layout-gaps','1');
  }

  function run() {
    mountThemeButton();
    syncThemeButton();
    markSpacing();
  }

  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!themeButton?.isConnected) themeButton = null;
      run();
    },120);
  });

  const push = history.pushState.bind(history);
  history.pushState = function(...args) {
    const out = push(...args);
    setTimeout(run,30);
    setTimeout(run,200);
    return out;
  };

  const replace = history.replaceState.bind(history);
  history.replaceState = function(...args) {
    const out = replace(...args);
    setTimeout(run,30);
    return out;
  };

  window.addEventListener('popstate', () => setTimeout(run,30));
  window.addEventListener('resize', () => setTimeout(markSpacing,100));

  function boot() {
    run();

    observer.observe(document.documentElement,{
      childList:true,
      subtree:true,
      attributes:true,
      attributeFilter:['class','data-theme']
    });

    [250,700,1400].forEach(ms => setTimeout(run,ms));
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded',boot,{once:true})
    : boot();
})();
