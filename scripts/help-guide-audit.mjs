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
  await context.addInitScript(() => {
    localStorage.setItem('nurselink-navigation-tour-v1:help-guide-audit', 'completed');
  });
  await context.route('**/api.amsertech.com/api/me', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      data: {
        id: 'help-guide-audit',
        name: 'Help Guide Audit',
        email: 'help-guide@example.test',
        roles: ['applicant'],
        application: { status: 'in_progress', progress_percent: 50 },
      },
    }),
  }));

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('401 (Unauthorized)')) {
      consoleErrors.push(message.text());
    }
  });

  await page.goto('https://app.amsertech.com/dashboard', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Open member navigation guide' }).click();
  await page.getByRole('button', { name: 'Smart Registration' }).click();

  const titles = [];
  for (let index = 0; index < 6; index += 1) {
    titles.push((await page.locator('#navigation-tour-title').textContent()).trim());
    if (index < 5) await page.getByRole('button', { name: 'Next' }).click();
  }

  const metrics = await page.locator('.navigation-tour-box').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      insideViewport: rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight,
      horizontalOverflow: element.scrollWidth > element.clientWidth + 1,
      helpTopics: [...element.querySelectorAll('.navigation-tour-guides button')].map((button) => button.textContent.trim()),
    };
  });

  results.push({ viewport: viewport.name, titles, consoleErrors, ...metrics });
  await context.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));

const failed = results.some((result) => (
  result.titles.length !== 6
  || new Set(result.titles).size !== 6
  || result.consoleErrors.length > 0
  || !result.insideViewport
  || result.horizontalOverflow
  || result.helpTopics.join('|') !== 'Navigation|Smart Registration'
));

if (failed) process.exitCode = 1;
