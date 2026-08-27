/* NurseLink Native Navigation Shell Reset v64.5.9 */
(() => {
  if (window.__NL_NATIVE_SHELL_RESET_V6459__) return;
  window.__NL_NATIVE_SHELL_RESET_V6459__ = true;

  const html = document.documentElement;

  function removeTransientState() {
    [
      'nl6455-loading',
      'nl6456-loading',
      'nl6457-layout-pending',
      'nl6457-layout-ready'
    ].forEach(c => html.classList.remove(c));

    document.body?.removeAttribute('aria-busy');

    // Remove runtime shell overrides left by prior transition experiments.
    html.style.removeProperty('--nl6457-sidebar-width');
    html.style.removeProperty('--nl6457-topbar-height');
  }

  function repaintNativeShell() {
    removeTransientState();

    // Do not measure or rewrite geometry in JS.
    // CSS v64.5.9 is the authoritative desktop shell.
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'));
      });
    });
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', repaintNativeShell, { once: true })
    : repaintNativeShell();

  window.addEventListener('load', repaintNativeShell, { once: true });

  html.setAttribute('data-nl6459-native-shell', '1');
})();
