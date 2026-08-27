/* NurseLink Responsive Brand + Theme Repair v64.9.1 */
(() => {
  if (window.__NL_RESPONSIVE_BRAND_THEME_V6491__) return;
  window.__NL_RESPONSIVE_BRAND_THEME_V6491__ = true;

  let timer = null;

  function text(el) {
    return (el?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function topbar() {
    const host = document.getElementById('nl6484-topbar-host');
    if (host?.firstElementChild) return host.firstElementChild;

    return document.querySelector(
      '.nurselink-topbar,.nl-topbar,.member-topbar,' +
      'header[class*="topbar"],[class*="topbar"][class*="member"],[data-nl-topbar]'
    ) || document.querySelector('header');
  }

  function sidebar() {
    return document.querySelector(
      '.nurselink-sidebar,.nl-sidebar,aside[class*="sidebar"],[data-nl-sidebar]'
    );
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

    try {
      const stored =
        localStorage.getItem('nurselink-theme') ||
        localStorage.getItem('theme');

      if (stored === 'dark' || stored === 'light') return stored;
    } catch {}

    const bg = getComputedStyle(body || html).backgroundColor;
    const nums = bg.match(/\d+/g)?.map(Number);

    if (nums && nums.length >= 3) {
      return ((nums[0] + nums[1] + nums[2]) / 3) < 120 ? 'dark' : 'light';
    }

    return 'light';
  }

  function directSetTheme(target) {
    const html = document.documentElement;
    const body = document.body;

    html.setAttribute('data-theme', target);
    body?.setAttribute('data-theme', target);

    html.classList.toggle('dark', target === 'dark');
    html.classList.toggle('light', target === 'light');

    body?.classList.toggle('dark', target === 'dark');
    body?.classList.toggle('light', target === 'light');

    try {
      localStorage.setItem('nurselink-theme', target);
      localStorage.setItem('theme', target);
    } catch {}

    window.dispatchEvent(
      new CustomEvent('nurselink:themechange', {
        detail: { theme: target }
      })
    );
  }

  function syncThemeButton() {
    const btn = document.querySelector('.nl6486-theme-button');
    if (!btn) return;

    const state = currentTheme();
    btn.setAttribute('data-theme-state', state);

    if (state === 'dark') {
      btn.setAttribute('aria-label', 'Switch to light mode');
      btn.setAttribute('title', 'Switch to light mode');
    } else {
      btn.setAttribute('aria-label', 'Switch to dark mode');
      btn.setAttribute('title', 'Switch to dark mode');
    }
  }

  function hardenThemeButton() {
    const btn = document.querySelector('.nl6486-theme-button');
    if (!btn) return;

    if (btn.getAttribute('data-nl6491-theme-direct') === '1') {
      syncThemeButton();
      return;
    }

    btn.setAttribute('data-nl6491-theme-direct', '1');

    /*
     * Capture phase + stopImmediatePropagation prevents stale hidden theme
     * handlers from cancelling or double-toggling on mobile.
     */
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      directSetTheme(next);

      requestAnimationFrame(syncThemeButton);
      setTimeout(syncThemeButton, 80);
      setTimeout(syncThemeButton, 220);
    }, true);

    syncThemeButton();
  }

  function markDesktopTopbarBrand() {
    const bar = topbar();
    if (!bar) return;

    const candidates = Array.from(
      bar.querySelectorAll('div,section,a,span')
    );

    for (const el of candidates) {
      const t = text(el).toLowerCase();

      if (
        t.includes('kapit-bisig') &&
        t.includes('nurselink') &&
        (
          t.includes('super administrator portal') ||
          t.includes('administrator portal')
        )
      ) {
        const r = el.getBoundingClientRect();

        if (r.width > 100 && r.height > 30 && r.height < 160) {
          el.setAttribute('data-nl6491-topbar-brand', '1');
          break;
        }
      }
    }
  }

  function markMobileBrand() {
    const sb = sidebar();
    if (!sb) return;

    const title = Array.from(sb.querySelectorAll('*'))
      .find(el => text(el) === 'NurseLink');

    const subtitle = Array.from(sb.querySelectorAll('*'))
      .find(el => {
        const t = text(el);
        return t === 'KAPIT-BISIG' || t === 'KAPIT–BISIG';
      });

    if (title) {
      title.setAttribute('data-nl6491-mobile-brand-title','1');
    }

    if (subtitle) {
      subtitle.setAttribute('data-nl6491-mobile-brand-subtitle','1');
    }

    if (!title && !subtitle) return;

    const target = title || subtitle;

    let textBlock = target.parentElement;
    while (textBlock && textBlock !== sb) {
      if (
        title && textBlock.contains(title) &&
        subtitle && textBlock.contains(subtitle)
      ) {
        textBlock.setAttribute('data-nl6491-mobile-brand-text','1');
        break;
      }

      textBlock = textBlock.parentElement;
    }

    if (!textBlock || textBlock === sb) {
      textBlock = target.parentElement;
      textBlock?.setAttribute('data-nl6491-mobile-brand-text','1');
    }

    if (textBlock) {
      const parent = textBlock.parentElement;
      if (parent && parent !== sb) {
        parent.setAttribute('data-nl6491-mobile-brand','1');

        const icon = Array.from(parent.children).find(el => {
          if (el === textBlock) return false;
          const r = el.getBoundingClientRect();
          return r.width <= 60 && r.height <= 60;
        });

        if (icon) {
          icon.setAttribute('data-nl6491-mobile-brand-icon','1');
        }
      }
    }
  }

  function apply() {
    markDesktopTopbarBrand();
    markMobileBrand();
    hardenThemeButton();

    document.documentElement.setAttribute(
      'data-nl6491-responsive-brand-theme',
      '1'
    );
  }

  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(apply, 100);
  });

  const push = history.pushState.bind(history);
  history.pushState = function(...args) {
    const out = push(...args);
    setTimeout(apply, 30);
    setTimeout(apply, 180);
    return out;
  };

  const replace = history.replaceState.bind(history);
  history.replaceState = function(...args) {
    const out = replace(...args);
    setTimeout(apply, 30);
    return out;
  };

  window.addEventListener('popstate', () => setTimeout(apply, 30));
  window.addEventListener('resize', () => setTimeout(apply, 100));

  function boot() {
    apply();

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class','data-theme']
    });

    [250,700,1400].forEach(ms => setTimeout(apply, ms));
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot, { once: true })
    : boot();
})();
