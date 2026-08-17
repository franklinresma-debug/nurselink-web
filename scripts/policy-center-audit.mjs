import { chromium } from 'playwright';

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];
const browser = await chromium.launch({ headless: true });
const results = [];
const baseUrl = process.env.NURSELINK_AUDIT_BASE_URL || 'https://app.amsertech.com';

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(() => localStorage.setItem('nurselink-navigation-tour-v1:policy-center-audit', 'completed'));
  await context.route('**/api.amsertech.com/api/me', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: { id: 'policy-center-audit', name: 'Policy Center Test', email: 'policy-center@example.test', roles: ['member'], member: { member_no: 'NL-TEST' } } }),
  }));
  await context.route('**/api.amsertech.com/api/policy-consent', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: { current: false, terms_version: '2026-08-18', privacy_version: '2026-08-18', terms_accepted_at: null, privacy_accepted_at: null } }),
  }));

  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${baseUrl}/policy-center`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Policy & Privacy Center' }).waitFor();
  results.push({
    viewport: viewport.name,
    statusVisible: await page.locator('.policy-center-status:visible').first().isVisible(),
    cards: await page.locator('.policy-center-card').count(),
    links: await page.locator('.policy-center-card a').count(),
    acceptButton: await page.locator('.policy-center-status').getByRole('button', { name: 'Accept both policies' }).isVisible(),
    overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
    errors,
  });
  await context.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
if (results.some((result) => !result.statusVisible || result.cards !== 2 || result.links !== 2 || !result.acceptButton || result.overflow || result.errors.length)) process.exitCode = 1;
