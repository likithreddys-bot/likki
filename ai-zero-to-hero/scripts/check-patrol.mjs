/**
 * Checks that the little robot walks on EVERY page (development server must be running).
 * For each route it makes sure exactly one patrol duck exists, that it is visible inside the window,
 * and that it really moves (sampled 3 seconds apart) at a slow, duck-like speed.
 *
 *   BASE_URL=http://localhost:3000 node scripts/check-patrol.mjs
 */
import { chromium } from 'playwright-core';
import { existsSync, readdirSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH ?? '/opt/pw-browsers';
const exe = existsSync(browsersPath)
  ? readdirSync(browsersPath).filter((d) => d.startsWith('chromium-')).map((d) => `${browsersPath}/${d}/chrome-linux/chrome`)[0]
  : undefined;

const ROUTES = [
  ['landing', '/'],
  ['login', '/login'],
  ['setup', '/setup'],
  ['404 page', '/this-page-does-not-exist'],
  ['dashboard', '/preview/dashboard?state=progress'],
  ['topic session', '/preview/session?order=3'],
  ['final quiz', '/preview/quiz'],
  ['quiz results (pass)', '/preview/results'],
  ['quiz results (fail)', '/preview/results-fail'],
  ['leaderboard', '/preview/leaderboard'],
];
const VIEWPORTS = [
  ['desktop 1440x900', { width: 1440, height: 900 }],
  ['phone 390x844', { width: 390, height: 844 }],
];

const browser = await chromium.launch({ executablePath: exe });
let failures = 0;
const rows = [];

for (const [vpName, viewport] of VIEWPORTS) {
  for (const [name, path] of ROUTES) {
    const page = await browser.newPage({ viewport });
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await page.goto(BASE + path, { waitUntil: 'networkidle' });

    const read = () =>
      page.evaluate(() => {
        const ducks = [...document.querySelectorAll('.duck-patrol')];
        const d = ducks[0];
        if (!d) return { count: 0 };
        const r = d.getBoundingClientRect();
        const imgs = [...d.querySelectorAll('img')];
        return {
          count: ducks.length,
          x: Math.round(r.x + r.width / 2),
          bottom: Math.round(window.innerHeight - r.bottom),
          inView: r.right > 0 && r.left < window.innerWidth && r.top >= 0 && r.bottom <= window.innerHeight + 1,
          loaded: imgs.length === 2 && imgs.every((i) => i.complete && i.naturalWidth > 0),
          waddle: !!d.querySelector('.animate-waddle') && getComputedStyle(d.querySelector('.animate-waddle')).animationName !== 'none',
          fixed: getComputedStyle(d.parentElement).position === 'fixed',
          status: document.title,
        };
      });

    const a = await read();
    await page.waitForTimeout(3000);
    const b = await read();
    const pxPerSec = a.count && b.count ? Math.abs(b.x - a.x) / 3 : 0;
    const status = a.count === 1 && b.count === 1 && a.inView && b.inView && a.loaded && a.waddle && a.fixed && pxPerSec > 3 && pxPerSec < 120 && errs.length === 0;
    if (!status) failures++;
    rows.push({ viewport: vpName, page: name, ducks: a.count, 'moved px': a.count ? b.x - a.x : null, 'px/s': Math.round(pxPerSec), 'in view': a.inView, loaded: a.loaded, waddling: a.waddle, ok: status ? 'yes' : 'NO', errors: errs.length ? errs.join('; ') : '' });
    await page.close();
  }
}

// reduced motion: the duck should still be there, but standing still
const rm = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
await rm.goto(BASE + '/', { waitUntil: 'networkidle' });
const still = await rm.evaluate(() => {
  const d = document.querySelector('.duck-patrol');
  return d ? { present: true, animation: getComputedStyle(d).animationName } : { present: false };
});
await rm.close();

console.table(rows);
console.log('reduced motion:', JSON.stringify(still));
await browser.close();
if (failures || !still.present || still.animation !== 'none') {
  console.error(`FAILED: ${failures} route(s) without a walking duck`);
  process.exit(1);
}
console.log('OK: a duck walks on every page, on desktop and phone.');
