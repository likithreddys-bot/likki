/**
 * Checks that the page duck walks ACROSS THE CONTENT on every page (development server must be running).
 *
 *   BASE_URL=http://localhost:3000 node scripts/check-roaming.mjs
 *
 * Per route, at desktop and phone size, it samples the duck for ~7s and requires: exactly one duck, sprites
 * loaded, it walks (not teleports) at a slow duck-like speed, covers real distance, and stays inside the window.
 * Then a longer run on one page requires that it rests, sits and walks again, using the page's height as well as its width.
 * Finally it checks that under reduced motion the duck stays put.
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

const read = (page) =>
  page.evaluate(() => {
    const all = document.querySelectorAll('[data-roaming-duck]');
    const el = all[0];
    if (!el) return { count: 0 };
    const m = /translate3d\(([-\d.]+)px,\s*([-\d.]+)px/.exec(el.style.transform || '');
    const imgs = [...el.querySelectorAll('img')];
    return {
      count: all.length,
      x: m ? parseFloat(m[1]) : null,
      y: m ? parseFloat(m[2]) : null,
      pose: el.getAttribute('data-pose'),
      loaded: imgs.length > 0 && imgs.every((i) => i.complete && i.naturalWidth > 0),
      vw: window.innerWidth,
      vh: window.innerHeight,
      t: performance.now(),
    };
  });

async function sample(page, ms, every = 400) {
  const out = [];
  const end = Date.now() + ms;
  while (Date.now() < end) {
    out.push(await read(page));
    await page.waitForTimeout(every);
  }
  return out;
}

const median = (a) => (a.length ? [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)] : 0);

const browser = await chromium.launch({ executablePath: exe });
let failures = 0;
const rows = [];

for (const [vpName, viewport] of VIEWPORTS) {
  for (const [name, path] of ROUTES) {
    const page = await browser.newPage({ viewport });
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1600); // first walk starts ~1.2s after load
    const s = await sample(page, 7000);

    let walked = 0;
    const speeds = [];
    for (let i = 1; i < s.length; i++) {
      const d = Math.hypot(s[i].x - s[i - 1].x, s[i].y - s[i - 1].y);
      if (s[i].pose === 'walking' && s[i - 1].pose === 'walking') {
        walked += d;
        speeds.push(d / ((s[i].t - s[i - 1].t) / 1000));
      }
    }
    const sp = median(speeds);
    const inView = s.every((r) => r.x >= 0 && r.x <= r.vw && r.y >= 0 && r.y <= r.vh + 1);
    const ok =
      s.every((r) => r.count === 1 && r.loaded) &&
      s.some((r) => r.pose === 'walking') &&
      sp > 35 && sp < 60 && walked > 150 && inView && errs.length === 0;
    if (!ok) failures++;
    rows.push({ viewport: vpName, page: name, ducks: s[0].count, walked_px: Math.round(walked), 'median px/s': Math.round(sp), 'inside window': inView, ok: ok ? 'yes' : 'NO', errors: errs.join('; ') });
    await page.close();
  }
}
console.table(rows);

// longer run: it rests, then goes somewhere else, across the whole content area
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + '/preview/session?order=3', { waitUntil: 'networkidle' });
  const s = await sample(page, 45000, 500);
  const poses = new Set(s.map((r) => r.pose));
  const xs = s.map((r) => r.x), ys = s.map((r) => r.y);
  const spanX = Math.max(...xs) - Math.min(...xs), spanY = Math.max(...ys) - Math.min(...ys);
  let walks = 0;
  for (let i = 1; i < s.length; i++) if (s[i].pose === 'walking' && s[i - 1].pose !== 'walking') walks++;
  console.log(`45s on the topic page: poses=${[...poses].join('+')}, walks started=${walks}, x-span=${Math.round(spanX)}px, y-span=${Math.round(spanY)}px`);
  if (!(poses.has('walking') && poses.has('sitting') && walks >= 2 && spanX > 600 && spanY > 80)) {
    console.error('FAILED: the duck should rest, walk again, and cross the content');
    failures++;
  }
  await page.close();
}

// reduced motion: present, but standing still
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const a = await read(page);
  await page.waitForTimeout(3000);
  const b = await read(page);
  const still = a.count === 1 && a.x === b.x && a.y === b.y && b.pose === 'sitting';
  console.log('reduced motion: duck present and standing still:', still);
  if (!still) failures++;
  await page.close();
}

await browser.close();
if (failures) {
  console.error(`FAILED: ${failures} check(s)`);
  process.exit(1);
}
console.log('OK: the duck walks across the content on every page, on desktop and phone.');
