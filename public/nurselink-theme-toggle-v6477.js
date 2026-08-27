/* NurseLink Simplified Theme Toggle v64.7.7 */
(() => {
  if (window.__NL_THEME_TOGGLE_V6477__) return;
  window.__NL_THEME_TOGGLE_V6477__ = true;

  let toggle = null;
  let lightControl = null;
  let darkControl = null;
  let observer = null;
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
    return document.querySelector(
      '.nurselink-topbar,.nl-topbar,.member-topbar,' +
      'header[class*="topbar"],[class*="topbar"][class*="member"],[data-nl-topbar]'
    ) || document.querySelector('header');
  }

  function signature(el) {
    return [
      el.getAttribute('aria-label') || '',
      el.getAttribute('title') || '',
      el.getAttribute('data-theme') || '',
      el.getAttribute('data-mode') || '',
      el.className || '',
      el.textContent || ''
    ].join(' ').toLowerCase();
  }

  function findLegacyControls() {
    const bar = topbar();
    if (!bar) return;

    const candidates = Array.from(
      bar.querySelectorAll('button,[role="button"],a[href]')
    );

    lightControl = candidates.find(el => {
      const s = signature(el);
      return /\b(light|sun|day)\b/.test(s) && !/\bdark\b/.test(s);
    }) || null;

    darkControl = candidates.find(el => {
      const s = signature(el);
      return /\b(dark|moon|night)\b/.test(s);
    }) || null;

    if (lightControl) lightControl.setAttribute('data-nl6477-legacy-theme-control','1');
    if (darkControl) darkControl.setAttribute('data-nl6477-legacy-theme-control','1');
  }

  function currentTheme() {
    const html = document.documentElement;
    const body = document.body;

    const sig = [
      html.getAttribute('data-theme') || '',
      body?.getAttribute('data-theme') || '',
      html.className || '',
      body?.className || ''
    ].join(' ').toLowerCase();

    if (/\bdark\b/.test(sig)) return 'dark';
    if (/\blight\b/.test(sig)) return 'light';

    const bg = getComputedStyle(body || html).backgroundColor;
    const m = bg.match(/\d+/g)?.map(Number);
    if (m && m.length >= 3) {
      return ((m[0] + m[1] + m[2]) / 3) < 120 ? 'dark' : 'light';
    }

    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function syncToggle() {
    if (!toggle) return;
    const state = currentTheme();
    toggle.setAttribute('data-theme-state', state);
    toggle.setAttribute('aria-checked', state === 'dark' ? 'true' : 'false');
    toggle.setAttribute('aria-label', state === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function invokeTheme(target) {
    if (target === 'light' && lightControl) {
      lightControl.click();
      return true;
    }

    if (target === 'dark' && darkControl) {
      darkControl.click();
      return true;
    }

    return false;
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
      detail: { theme: target }
    }));
  }

  function setTheme(target) {
    const worked = invokeTheme(target);

    if (!worked) fallbackTheme(target);

    requestAnimationFrame(() => {
      syncToggle();
      setTimeout(syncToggle, 120);
    });
  }

  function buildToggle() {
    const bar = topbar();
    if (!bar) return false;

    if (toggle?.isConnected) return true;

    findLegacyControls();

    toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nl6477-theme-toggle';
    toggle.setAttribute('role','switch');
    toggle.innerHTML = `
      <span class="nl6477-theme-knob"></span>
      <span class="nl6477-theme-icon nl6477-theme-sun">${SUN}</span>
      <span class="nl6477-theme-icon nl6477-theme-moon">${MOON}</span>
    `;

    toggle.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });

    const anchor = darkControl || lightControl;

    if (anchor?.parentNode) {
      anchor.parentNode.insertBefore(toggle, anchor);
    } else {
      const controls = bar.querySelector(
        '.topbar-actions,.header-actions,.member-actions,[class*="actions"]'
      );
      (controls || bar).appendChild(toggle);
    }

    document.documentElement.setAttribute('data-nl6477-theme-toggle','1');
    syncToggle();
    return true;
  }

  function init() {
    buildToggle();
    syncToggle();
  }

  observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!toggle?.isConnected) toggle = null;
      init();
    }, 120);
  });

  function boot() {
    init();

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class','data-theme']
    });

    [300,800,1600].forEach(ms => setTimeout(init, ms));
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot, { once:true })
    : boot();
})();
