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
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('401 (Unauthorized)')) errors.push(message.text());
  });

  await page.goto('https://app.amsertech.com/register', { waitUntil: 'networkidle' });
  const registration = await page.evaluate(() => ({
    modeNotice: document.body.textContent.includes('invited pilot participants only'),
    termsCheckbox: Boolean(document.querySelector('input[type="checkbox"]')?.closest('label')?.textContent.includes('Terms of Use')),
    privacyCheckbox: [...document.querySelectorAll('input[type="checkbox"]')].some((input) => input.closest('label')?.textContent.includes('Privacy Notice')),
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
  }));

  const policies = [];
  for (const path of ['/terms', '/privacy']) {
    await page.goto(`https://app.amsertech.com${path}`, { waitUntil: 'networkidle' });
    policies.push(await page.evaluate(() => ({
      title: document.querySelector('h1')?.textContent,
      sections: document.querySelectorAll('.policy-document section').length,
      paragraphSize: parseFloat(getComputedStyle(document.querySelector('.policy-document p')).fontSize),
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
    })));
  }

  results.push({ viewport: viewport.name, registration, policies, errors });
  await context.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));

const failed = results.some(({ registration, policies, errors }) => (
  errors.length > 0
  || !registration.modeNotice
  || !registration.termsCheckbox
  || !registration.privacyCheckbox
  || registration.overflow
  || policies.some((policy) => !policy.title || policy.sections < 5 || policy.paragraphSize < 14 || policy.overflow)
));

if (failed) process.exitCode = 1;
