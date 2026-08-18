import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const localCss = readFileSync(new URL('../public/nurselink-member-verify.css', import.meta.url), 'utf8');
const localJs = readFileSync(new URL('../public/nurselink-member-verify.js', import.meta.url), 'utf8');
const useLocalAssets = process.env.AUDIT_LIVE !== '1';

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];
const cases = ['valid', 'invalid'];
const browser = await chromium.launch({ headless: true });
const results = [];

for (const viewport of viewports) {
  for (const state of cases) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    if (useLocalAssets) {
      await context.route('**/nurselink-member-verify.css', route => route.fulfill({
        status: 200, contentType: 'text/css', body: localCss,
      }));
      await context.route('**/nurselink-member-verify.js', route => route.fulfill({
        status: 200, contentType: 'text/javascript', body: localJs,
      }));
    }
    await context.route('**/api.amsertech.com/api/membership/verify/**', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(state === 'valid' ? { data: {
        valid: true, member_number: 'NL-2026-000001', member_name: 'Audit Member',
        status: 'approved', standing: 'active', approved_at: '2026-08-18T00:00:00Z',
      } } : { message: 'Unable to verify this code.' }),
    }));
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(`https://app.amsertech.com/nurselink-member-verify.html?code=${state}-audit`, { waitUntil: 'domcontentloaded' });
    await page.locator('.verification-card').waitFor();
    const findings = await page.evaluate(() => {
      const visible = element => {
        const rect = element.getBoundingClientRect(); const style = getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      };
      const tinyText = [...document.querySelectorAll('p,span,strong,dt,dd,label,button,input')].filter(visible)
        .filter(element => parseFloat(getComputedStyle(element).fontSize) < 12)
        .map(element => ({ size: parseFloat(getComputedStyle(element).fontSize), text: (element.textContent || '').trim().slice(0, 50) }));
      const smallTargets = [...document.querySelectorAll('button,a[href],input')].filter(visible)
        .map(element => ({ element, rect: element.getBoundingClientRect() })).filter(({ rect }) => rect.width < 40 || rect.height < 40)
        .map(({ element, rect }) => ({ width: Math.round(rect.width), height: Math.round(rect.height), text: (element.textContent || '').trim() }));
      return { overflow: document.documentElement.scrollWidth > innerWidth + 1, tinyText, smallTargets, h1: document.querySelectorAll('h1').length, hasMain: Boolean(document.querySelector('main')) };
    });
    results.push({ viewport: viewport.name, state, ...findings, errors });
    await context.close();
  }
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
if (results.some(result => result.overflow || result.tinyText.length || result.smallTargets.length || result.h1 !== 1 || !result.hasMain || result.errors.length)) process.exitCode = 1;
