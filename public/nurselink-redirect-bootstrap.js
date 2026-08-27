(function () {
  'use strict';

  var script = document.currentScript;
  var target = script && script.dataset ? String(script.dataset.redirectTarget || '') : '';
  var focus = script && script.dataset ? String(script.dataset.memberPortalFocus || '') : '';

  if (focus) {
    try {
      sessionStorage.setItem('nurselink_member_portal_focus', focus);
    } catch (_) {}
  }

  if (!target || target.charAt(0) !== '/') {
    return;
  }

  location.replace(target);
})();
