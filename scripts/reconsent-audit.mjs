import { chromium } from 'playwright';

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];
const browser = await chromium.launch({ headless: true });
const results = [];

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(() => localStorage.setItem('nurselink-navigation-tour-v1:reconsent-audit', 'completed'));
  await context.route('**/api.amsertech.com/api/me', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: { id: 'reconsent-audit', name: 'Policy Test Member', email: 'policy@example.test', roles: ['member'], member: { member_no: 'NL-TEST' } } }),
  }));
  await context.route('**/api.amsertech.com/api/policy-consent', async (route) => {
    const accepted = route.request().method() === 'POST';
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { current: accepted, terms_version: '2026-08-18', privacy_version: '2026-08-18' } }) });
  });

  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('https://app.amsertech.com/dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 });
  const banner = page.locator('.policy-consent-banner');
  await banner.waitFor({ state: 'visible', timeout: 15000 });
  const visibleBefore = await banner.isVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  const links = await banner.locator('a').count();
  await banner.getByRole('button', { name: 'Accept both policies' }).click();
  await banner.waitFor({ state: 'detached' });
  results.push({ viewport: viewport.name, visibleBefore, hiddenAfter: !(await banner.isVisible()), links, overflow, errors });
  await context.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
if (results.some((result) => !result.visibleBefore || !result.hiddenAfter || result.links !== 2 || result.overflow || result.errors.length)) process.exitCode = 1;
