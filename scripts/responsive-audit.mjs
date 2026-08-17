import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const outputDir = '/tmp/nurselink-responsive-audit';
await mkdir(outputDir, { recursive: true });

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const member = {
  id: 'responsive-audit-member',
  name: 'Responsive Audit Member',
  email: 'responsive.audit@example.test',
  roles: ['member'],
  member: { member_no: 'NL-TEST-RESPONSIVE' },
  application: { progress_percent: 72, status: 'approved' },
};

const browser = await chromium.launch({ headless: true });
const results = [];

for (const viewport of viewports) {
  for (const pageCase of [
    { name: 'register', url: 'https://app.amsertech.com/register', authenticated: false },
    { name: 'dashboard', url: 'https://app.amsertech.com/dashboard', authenticated: true },
  ]) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });

    if (pageCase.authenticated) {
      await context.addInitScript(() => {
        localStorage.setItem('nurselink-navigation-tour-v1:responsive-audit-member', 'completed');
      });
      await context.route('**/api.amsertech.com/api/me', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: member }),
        });
      });
    }

    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', (message) => {
      if (
        message.type() === 'error'
        && !message.text().includes('status of 401 (Unauthorized)')
        && consoleErrors.length < 10
      ) consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    await page.goto(pageCase.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1800);

    const metrics = await page.evaluate(() => {
      const visible = (element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      };

      const overflowers = [...document.querySelectorAll('body *')]
        .filter(visible)
        .map((element) => ({
          tag: element.tagName.toLowerCase(),
          className: String(element.className || '').slice(0, 90),
          rect: element.getBoundingClientRect(),
        }))
        // Ignore deliberately parked off-canvas navigation. Only report an
        // element when it crosses an edge of the visible viewport.
        .filter(({ rect }) => (
          (rect.right > window.innerWidth + 2 && rect.left < window.innerWidth)
          || (rect.left < -2 && rect.right > 0)
        ))
        .slice(0, 12)
        .map(({ tag, className, rect }) => ({ tag, className, left: Math.round(rect.left), right: Math.round(rect.right) }));

      const tinyText = [...document.querySelectorAll('p,span,small,label,a,button,input,select,textarea')]
        .filter(visible)
        .map((element) => ({ element, size: parseFloat(getComputedStyle(element).fontSize) }))
        .filter(({ size }) => size < 12)
        .slice(0, 12)
        .map(({ element, size }) => ({ tag: element.tagName.toLowerCase(), size, text: (element.textContent || '').trim().slice(0, 60) }));

      const smallTargets = [...document.querySelectorAll('button,a[href],input,select,textarea')]
        .filter(visible)
        .map((element) => ({ element, rect: element.getBoundingClientRect() }))
        .filter(({ rect }) => rect.width < 40 || rect.height < 40)
        .slice(0, 12)
        .map(({ element, rect }) => ({
          tag: element.tagName.toLowerCase(),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          text: (element.textContent || element.getAttribute('aria-label') || '').trim().slice(0, 60),
        }));

      return {
        title: document.title,
        bodyWidth: document.body.scrollWidth,
        viewportWidth: window.innerWidth,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        overflowers,
        tinyText,
        smallTargets,
      };
    });

    const screenshot = `${outputDir}/${pageCase.name}-${viewport.name}.png`;
    await page.screenshot({ path: screenshot, fullPage: true });
    results.push({ case: pageCase.name, viewport: viewport.name, screenshot, consoleErrors, ...metrics });
    await context.close();
  }
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
