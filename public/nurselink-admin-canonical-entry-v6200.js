/* NURSELINK_ADMIN_CANONICAL_ENTRY_V6200 */
(function () {
  'use strict';

  var canonicalBase = '/admin/';
  var path = String(window.location.pathname || '');
  var hash = String(window.location.hash || '#/dashboard');

  if (path.indexOf('/nurselink-admin-dashboard.html') !== -1) {
    var route = '#/dashboard';
    if (hash && hash !== '#') {
      if (hash.indexOf('#/') === 0) route = hash;
      else if (hash.indexOf('#') === 0) route = '#/' + hash.slice(1);
    }
    window.location.replace(canonicalBase + route);
  }
})();
