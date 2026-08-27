/* NurseLink Senior Nurse Interface Cohesion v64.0.0 */
(() => {
  const ROUTES = new Set([
    'dashboard','profile','smart-registration','application-status','portfolio',
    'jobs','applications','learning','credentials','qualifications','documents',
    'messages','events','initiatives','policies','welfare','policy-center'
  ]);

  function routeName() {
    const raw = (location.pathname || '/').replace(/^\/+|\/+$/g, '');
    return raw.split('/')[0] || 'dashboard';
  }

  function apply() {
    const route = routeName();
    const html = document.documentElement;
    html.setAttribute('data-nl64', 'enabled');
    html.setAttribute('data-nl-route', ROUTES.has(route) ? route : 'member');

    // Add accessible labels to destructive text-only controls when needed.
    document.querySelectorAll('.danger-link').forEach((el) => {
      if (!el.getAttribute('aria-label')) {
        const text = (el.textContent || 'Remove item').trim();
        el.setAttribute('aria-label', text);
      }
    });

    // Mark wide tables for scroll containment without rewriting React components.
    document.querySelectorAll('.page table').forEach((table) => {
      const parent = table.parentElement;
      if (parent && !parent.classList.contains('nl64-table-scroll')) {
        parent.classList.add('nl64-table-scroll');
      }
    });
  }

  const style = document.createElement('style');
  style.textContent = '.nl64-table-scroll{max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}';
  document.head.appendChild(style);

  apply();
  new MutationObserver(apply).observe(document.documentElement, {subtree:true, childList:true});
  window.addEventListener('popstate', apply);
  document.addEventListener('click', () => setTimeout(apply, 0), true);
})();
