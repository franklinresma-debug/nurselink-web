import { chromium } from 'playwright';

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch({ headless: true });
const results = [];

const fulfill = (route, data) => route.fulfill({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify({ data }),
});

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  await context.route('**/api.amsertech.com/api/nurselink/admin/session', (route) => fulfill(route, {
    user: { id: 1, name: 'Consent Audit Administrator', email: 'admin@example.test' },
    access: { role: 'super_administrator', label: 'Super Administrator', is_admin: true, is_super_admin: true, is_reviewer: true },
  }));
  await context.route('**/api.amsertech.com/api/nurselink/admin/management/me', (route) => fulfill(route, {
    roles: ['super_administrator'], permissions: [],
  }));
  await context.route('**/api.amsertech.com/api/nurselink/admin/operations-center/summary', (route) => fulfill(route, {
    metrics: { policy_consent_current: 2, policy_consent_pending: 5 },
    policy_consent: {
      terms_version: '2026-08-18', privacy_version: '2026-08-18', active_accounts: 7, current: 2, pending: 5,
      pending_accounts: Array.from({ length: 5 }, (_, index) => ({
        id: index + 2, name: `Pending Member ${index + 1}`, email: `pending${index + 1}@example.test`,
      })),
    },
    capabilities: { role: 'super_administrator', can_review: true, can_administer: true, can_manage_access: true },
  }));
  await context.route('**/api.amsertech.com/api/nurselink/admin/membership-administration/overview', (route) => fulfill(route, {
    counts: {}, standing: {}, aging: {}, unassigned_reviews: 0, overdue_reviews: 0,
  }));
  await context.route('**/api.amsertech.com/api/nurselink/admin/membership-onboarding/summary', (route) => fulfill(route, {
    counts: {}, overdue: 0, unassigned: 0,
  }));
  await context.route('**/api.amsertech.com/api/nurselink/admin/operations-center/audit-log', (route) => fulfill(route, []));

  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('https://app.amsertech.com/nurselink-admin-dashboard.html#dashboard', { waitUntil: 'domcontentloaded' });
  const panel = page.locator('#dashboardPolicyConsent');
  await panel.getByRole('heading', { name: 'Current Terms & Privacy Consent' }).waitFor();

  const metric = page.getByRole('button', { name: 'Open Policy Consent details' });
  const metrics = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    panelColumns: getComputedStyle(document.querySelector('.nl558-consent-list')).gridTemplateColumns.split(' ').length,
  }));

  results.push({
    viewport: viewport.name,
    metricClickable: await metric.isVisible(),
    panelVisible: await panel.isVisible(),
    pendingRows: await panel.locator('.nl558-consent-account').count(),
    governanceBoundary: (await panel.textContent()).includes('cannot consent on a member’s behalf'),
    ...metrics,
    errors,
  });
  await context.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));

if (results.some((result) => (
  !result.metricClickable
  || !result.panelVisible
  || result.pendingRows !== 5
  || !result.governanceBoundary
  || result.overflow
  || result.errors.length
  || (result.viewport !== 'mobile' && result.panelColumns !== 2)
  || (result.viewport === 'mobile' && result.panelColumns !== 1)
))) process.exitCode = 1;
