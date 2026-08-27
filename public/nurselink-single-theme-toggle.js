(() => {
  'use strict';

  const CONTROL = '.member-theme-control-v337';

  function currentTheme() {
    const value =
      document.documentElement.getAttribute('data-theme') ||
      localStorage.getItem('nurselink-member-theme') ||
      'system';

    return value === 'dark' ? 'dark' : 'light';
  }

  function update() {
    document.querySelectorAll(CONTROL).forEach((control) => {
      const light = control.querySelector(
        'button[aria-label="Use light mode"]'
      );
      const dark = control.querySelector(
        'button[aria-label="Use dark mode"]'
      );
      const system = control.querySelector(
        'button[aria-label="Follow system appearance"]'
      );

      [light, dark, system].forEach((button) => {
        if (button) {
          button.removeAttribute('data-nl-single-visible');
          button.setAttribute('aria-hidden', 'true');
          button.tabIndex = -1;
        }
      });

      const visible = currentTheme() === 'dark' ? light : dark;

      if (visible) {
        visible.setAttribute('data-nl-single-visible', 'true');
        visible.setAttribute('aria-hidden', 'false');
        visible.tabIndex = 0;
        visible.title =
          currentTheme() === 'dark'
            ? 'Switch to light mode'
            : 'Switch to dark mode';
      }
    });
  }

  const observer = new MutationObserver(update);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'class']
  });

  document.addEventListener('click', (event) => {
    if (event.target.closest(`${CONTROL} button`)) {
      requestAnimationFrame(update);
      setTimeout(update, 50);
    }
  });

  document.addEventListener('DOMContentLoaded', update);
  update();
  setTimeout(update, 300);
  setTimeout(update, 1200);
})();
