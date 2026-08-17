import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';

const testPhoto = await readFile(new URL('../public/nurselink-registration-hero.png', import.meta.url));

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
    localStorage.setItem('nurselink-navigation-tour-v1:photo-audit', 'completed');
  });

  await context.route('**/api.amsertech.com/api/me', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      data: {
        id: 'photo-audit',
        name: 'Photo Audit Member',
        email: 'photo.audit@example.test',
        roles: ['applicant'],
        application: { progress_percent: 20, status: 'draft' },
      },
    }),
  }));

  await context.route('**/api.amsertech.com/api/profile-photo', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      data: {
        profile_photo_url: 'https://api.amsertech.com/api/profile-photo/image?v=audit',
        has_profile_photo: true,
      },
    }),
  }));

  await context.route('**/api.amsertech.com/api/profile-photo/image**', route => route.fulfill({
    status: 200,
    contentType: 'image/png',
    body: testPhoto,
  }));

  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (
      message.type() === 'error'
      && !message.text().includes('status of 401 (Unauthorized)')
    ) errors.push(message.text());
  });

  await page.goto('https://app.amsertech.com/profile', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  await page.waitForFunction(() => {
    const image = document.querySelector('.nurselink-profile-photo-image');
    return image instanceof HTMLImageElement
      && image.src.startsWith('blob:')
      && image.complete
      && image.naturalWidth > 0;
  }, null, { timeout: 10000 });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    const image = document.querySelector('.nurselink-profile-photo-image');
    return image instanceof HTMLImageElement
      && image.src.startsWith('blob:')
      && image.complete
      && image.naturalWidth > 0;
  }, null, { timeout: 10000 });

  const metrics = await page.evaluate(() => {
    const preview = document.querySelector('.nurselink-profile-photo-image');
    const avatar = document.querySelector('.topbar .avatar img.nurselink-avatar-photo');
    return {
      previewLoaded: preview instanceof HTMLImageElement && preview.naturalWidth > 0,
      previewUsesBlob: preview instanceof HTMLImageElement && preview.src.startsWith('blob:'),
      avatarLoaded: avatar instanceof HTMLImageElement && avatar.naturalWidth > 0,
      avatarUsesBlob: avatar instanceof HTMLImageElement && avatar.src.startsWith('blob:'),
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    };
  });

  results.push({ viewport: viewport.name, errors, ...metrics });
  await context.close();
}

await browser.close();

const failed = results.filter(result => (
  result.errors.length
  || !result.previewLoaded
  || !result.previewUsesBlob
  || !result.avatarLoaded
  || !result.avatarUsesBlob
  || result.horizontalOverflow
));

console.log(JSON.stringify({ results, failed: failed.length }, null, 2));
process.exit(failed.length ? 1 : 0);
