/* NURSELINK_ADMIN_PRIVILEGED_SESSION_WATCHDOG_V6200 */
(function () {
  'use strict';

  if (window.__NurseLinkAdminSessionWatchdogV6200) return;
  window.__NurseLinkAdminSessionWatchdogV6200 = true;

  var MAX_WAIT_MS = 15000;
  var started = Date.now();

  function isVerifyScreen() {
    var body = (document.body && document.body.innerText) || '';
    return body.indexOf('Verifying Administrator access') !== -1 ||
           body.indexOf('Checking your privileged NurseLink session') !== -1;
  }

  function recover() {
    if (!isVerifyScreen()) return;
    var elapsed = Date.now() - started;
    if (elapsed < MAX_WAIT_MS) return;

    try {
      sessionStorage.setItem('nurselink_admin_session_watchdog_v6200', String(Date.now()));
    } catch (_) {}

    window.location.replace('/admin/#/dashboard');
  }

  window.setTimeout(recover, MAX_WAIT_MS + 250);
})();
