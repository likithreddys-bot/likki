/**
 * Manual check of the walking duck on the dashboard preview (development server must be running).
 * Samples the duck's position every second and reports speed, pose, and whether it ends up sitting on the current stop.
 */
import { chromium } from 'playwright-core';
import { existsSync, readdirSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH ?? '/opt/pw-browsers';
const exe = existsSync(browsersPath) ? readdirSync(browsersPath).filter((d) => d.startsWith('chromium-')).map((d) => `${browsersPath}/${d}/chrome-linux/chrome`)[0] : undefined;
const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`${BASE}/preview/dashboard?state=progress`, { waitUntil: 'networkidle' });

const duck = page.locator('div.pointer-events-none.absolute.left-0.top-0.z-20').first();
const samples = [];
for (let s = 0; s <= 22; s++) {
  const box = await duck.boundingBox();
  const pose = await duck.evaluate((el) => (el.querySelector('.animate-waddle') ? 'walking' : el.querySelector('.animate-breathe') ? 'sitting' : 'hidden'));
  const flipped = await duck.evaluate((el) => !!el.querySelector('[style*="scaleX(-1)"]'));
  samples.push({ s, x: box ? Math.round(box.x + box.width / 2) : null, y: box ? Math.round(box.y + box.height) : null, pose, flipped });
  await page.waitForTimeout(1000);
}
console.table(samples);

let walkingPx = 0, walkingSec = 0;
for (let i = 1; i < samples.length; i++) {
  if (samples[i].pose === 'walking' && samples[i - 1].pose === 'walking') {
    walkingPx += Math.hypot(samples[i].x - samples[i - 1].x, samples[i].y - samples[i - 1].y);
    walkingSec += 1;
  }
}
console.log(`walking: ~${walkingSec ? Math.round(walkingPx / walkingSec) : 0} px/s over ${walkingSec}s (page is scaled to the viewport, 1344px stage)`);
console.log('final pose:', samples.at(-1).pose, '| "you are here!" visible:', await page.getByText('you are here!').isVisible());
console.log('page errors:', errors.length ? errors : 'none');

// hover a finished stop → the duck should go and visit, then come back
await page.getByRole('link', { name: 'Review' }).hover();
await page.waitForTimeout(1500);
const during = await duck.evaluate((el) => (el.querySelector('.animate-waddle') ? 'walking' : 'sitting'));
console.log('after hovering topic 1 for 1.5s, duck is:', during);
await browser.close();
