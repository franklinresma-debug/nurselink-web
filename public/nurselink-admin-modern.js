/* NurseLink Administration Modernization v6.3.0 */
(() => {
  'use strict';

  const KEY = 'nurselink_admin_theme';
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  function storedTheme() {
    try {
      const value = localStorage.getItem(KEY);
      return ['light', 'dark', 'system'].includes(value) ? value : 'system';
    } catch (_) {
      return 'system';
    }
  }

  function resolvedTheme(value) {
    return value === 'system' ? (media.matches ? 'dark' : 'light') : value;
  }

  function applyTheme(value, persist = true) {
    const preferred = ['light', 'dark', 'system'].includes(value) ? value : 'system';
    root.dataset.nlThemePreference = preferred;
    root.dataset.nlTheme = resolvedTheme(preferred);
    root.style.colorScheme = root.dataset.nlTheme;

    const select = document.getElementById('adminThemePreference');
    if (select && select.value !== preferred) select.value = preferred;

    if (persist) {
      try { localStorage.setItem(KEY, preferred); } catch (_) {}
    }
  }

  // Apply immediately so the deferred dashboard controller opens with the right palette.
  applyTheme(storedTheme(), false);

  function bind() {
    const select = document.getElementById('adminThemePreference');
    if (select) {
      select.value = storedTheme();
      select.addEventListener('change', () => applyTheme(select.value));
    }

    // Improve workbench semantics after the existing role-aware controller renders it.
    const workbench = document.getElementById('adminRoleWorkbench');
    if (workbench) {
      workbench.setAttribute('aria-label', 'Quick administrator actions');
      const observer = new MutationObserver(() => {
        const copy = workbench.querySelector('.nl542-role-copy > span');
        if (copy) copy.textContent = 'QUICK ACTIONS';
      });
      observer.observe(workbench, {childList: true, subtree: true});
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, {once:true});
  else bind();

  const onSystemChange = () => {
    if ((root.dataset.nlThemePreference || storedTheme()) === 'system') applyTheme('system', false);
  };
  if (media.addEventListener) media.addEventListener('change', onSystemChange);
  else if (media.addListener) media.addListener(onSystemChange);
})();
