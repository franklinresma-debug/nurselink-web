import { chromium } from 'playwright';

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];
const panels = ['dashboard', 'applications', 'verification', 'support', 'health', 'settings'];
const browser = await chromium.launch({ headless: true });
const results = [];
const json = (route, data) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data }) });

for (const viewport of viewports) {
  for (const panel of panels) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    await context.route('**/api.amsertech.com/api/nurselink/admin/session', route => json(route, {
      user: { id: 1, name: 'Responsive Audit Administrator', email: 'admin@example.test' },
      access: { role: 'super_administrator', label: 'Super Administrator', is_admin: true, is_super_admin: true, is_reviewer: true },
    }));
    await context.route('**/api.amsertech.com/api/nurselink/admin/management/me', route => json(route, {
      roles: ['super_administrator'], permissions: [], scopes: ['*'], is_super_admin: true, read_only: false,
    }));
    await context.route('**/api.amsertech.com/api/nurselink/admin/operations-center/summary', route => json(route, {
      metrics: { approved_members: 2, pending_membership_applications: 1, policy_consent_current: 2, policy_consent_pending: 5 },
      policy_consent: { terms_version: '2026-08-18', privacy_version: '2026-08-18', active_accounts: 7, current: 2, pending: 5, pending_accounts: [] },
      capabilities: { role: 'super_administrator', can_review: true, can_administer: true, can_manage_access: true },
    }));
    await context.route('**/api.amsertech.com/api/nurselink/admin/membership-administration/overview', route => json(route, {
      counts: { submitted: 1, ready_for_approval: 1, approved: 2 }, standing: { active: 2 }, aging: {}, unassigned_reviews: 1, overdue_reviews: 0,
    }));
    await context.route('**/api.amsertech.com/api/nurselink/admin/membership-onboarding/summary', route => json(route, { counts: {}, overdue: 0, unassigned: 0 }));
    await context.route('**/api.amsertech.com/api/nurselink/admin/membership-administration/staff', route => json(route, []));
    await context.route('**/api.amsertech.com/api/nurselink/admin/membership-administration/queue?**', route => json(route, []));
    await context.route('**/api.amsertech.com/api/nurselink/admin/operations-center/audit-log', route => json(route, []));
    await context.route('**/api.amsertech.com/api/reviewer/credentials**', route => json(route, []));
    await context.route('**/api.amsertech.com/api/nurselink/admin/users', route => json(route, []));
    await context.route('**/api.amsertech.com/api/nurselink/admin/operations-center/support-cases?**', route => json(route, []));
    await context.route('**/api.amsertech.com/api/nurselink/admin/operations-center/system-health', route => json(route, {
      release: '1.0.0-ultahost-pilot.1', database_connected: true, storage_writable: true,
      all_required_tables_present: true, tables: { users: true, members: true, applications: true },
    }));
    await context.route('**/api.amsertech.com/api/reviewer/production-readiness', route => json(route, { summary: { passed: 8 } }));
    await context.route('**/api.amsertech.com/api/nurselink/admin/operations-center/settings', route => json(route, {
      governance: { raw_database_administration: false }, entry_points: { administrator_login: '/nurselink-admin-login.html', administrator_portal: '/admin/' },
    }));
    await context.route('**/api.amsertech.com/api/nurselink/admin/management', route => route.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify({
        data: { roles: [], administrators: [], invitations: [] }, permissions: { can_manage_administrators: false },
      }),
    }));

    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto('https://app.amsertech.com/nurselink-admin-dashboard.html#dashboard', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-panel="dashboard"]:not([hidden])').waitFor();
    if (panel !== 'dashboard') {
      await page.evaluate(target => document.querySelector(`[data-tab="${target}"]`)?.click(), panel);
    }
    await page.locator(`[data-panel="${panel}"]:not([hidden])`).waitFor();
    await page.waitForTimeout(1000);

    const findings = await page.evaluate(() => {
      const visible = element => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      };
      const smallTargets = [...document.querySelectorAll('button,a[href],input,select,textarea')]
        .filter(visible)
        .filter(element => !(element.matches('input[type="checkbox"],input[type="radio"]') && element.closest('label')))
        .map(element => ({ element, rect: element.getBoundingClientRect() }))
        .filter(({ rect }) => rect.width < 40 || rect.height < 40)
        .map(({ element, rect }) => ({ tag: element.tagName.toLowerCase(), width: Math.round(rect.width), height: Math.round(rect.height), text: (element.textContent || element.getAttribute('aria-label') || '').trim().slice(0, 50) }));
      const tinyText = [...document.querySelectorAll('p,span,small,label,a,button,input,select,textarea')]
        .filter(visible).filter(element => parseFloat(getComputedStyle(element).fontSize) < 12)
        .map(element => ({ tag: element.tagName.toLowerCase(), size: parseFloat(getComputedStyle(element).fontSize), text: (element.textContent || '').trim().slice(0, 50) }));
      const unnamedControls = [...document.querySelectorAll('button,a[href]')].filter(visible).filter(element => !(
        (element.getAttribute('aria-label') || '').trim() || (element.getAttribute('aria-labelledby') || '').trim()
        || (element.textContent || '').trim() || (element.getAttribute('title') || '').trim()
      )).map(element => element.outerHTML.slice(0, 120));
      const unlabeledFields = [...document.querySelectorAll('input:not([type="hidden"]),select,textarea')].filter(visible).filter(element => {
        const id = element.id;
        return !element.closest('label') && !(id && document.querySelector(`label[for="${CSS.escape(id)}"]`))
          && !(element.getAttribute('aria-label') || '').trim() && !(element.getAttribute('aria-labelledby') || '').trim();
      }).map(element => element.outerHTML.slice(0, 120));
      const overflowers = [...document.querySelectorAll('body *')].filter(visible)
        .map(element => ({ element, rect: element.getBoundingClientRect() }))
        .filter(({ rect }) => (rect.right > innerWidth + 2 && rect.left < innerWidth) || (rect.left < -2 && rect.right > 0))
        .map(({ element, rect }) => ({
          tag: element.tagName.toLowerCase(), className: String(element.className || '').slice(0, 80),
          left: Math.round(rect.left), right: Math.round(rect.right), text: (element.textContent || '').trim().slice(0, 80),
        })).slice(0, 12);
      return {
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        overflowers, tinyText, smallTargets, unnamedControls, unlabeledFields,
        h1Count: [...document.querySelectorAll('h1,[role="heading"][aria-level="1"]')].filter(visible).length,
        hasMain: Boolean(document.querySelector('main,[role="main"]')),
      };
    });
    results.push({ viewport: viewport.name, panel, ...findings, errors });
    await context.close();
  }
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
if (results.some(result => result.overflow || result.tinyText.length || result.smallTargets.length || result.unnamedControls.length || result.unlabeledFields.length || result.h1Count !== 1 || !result.hasMain || result.errors.length)) process.exitCode = 1;
