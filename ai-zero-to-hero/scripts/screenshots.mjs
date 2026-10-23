/**
 * Takes screenshots of the design preview screens (development only).
 *   npm run dev            # in one terminal
 *   node scripts/screenshots.mjs   # in another  → ./screenshots/*.png
 */
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { existsSync, readdirSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT = process.env.OUT ?? 'screenshots';
const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH ?? '/opt/pw-browsers';
const exe =
  process.env.CHROMIUM_PATH ??
  (existsSync(browsersPath) ? readdirSync(browsersPath).filter((d) => d.startsWith('chromium-')).map((d) => `${browsersPath}/${d}/chrome-linux/chrome`)[0] : undefined);

const shots = [
  ['landing', '/', 1440, 900],
  ['login', '/login', 1440, 900],
  ['dashboard', '/preview/dashboard?state=progress', 1440, 900],
  ['session', '/preview/session?order=3', 1440, 900],
  ['quiz', '/preview/quiz', 1440, 900],
  ['results', '/preview/results', 1440, 900],
  ['leaderboard', '/preview/leaderboard', 1440, 900],
];
const only = process.argv.slice(2);

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: exe });
for (const [name, path, width, height] of shots) {
  if (only.length && !only.includes(name)) continue;
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error(`[${name}] page error:`, e.message));
  page.on('console', (m) => m.type() === 'error' && console.error(`[${name}] console:`, m.text()));
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500); // let the duck settle
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log('saved', `${OUT}/${name}.png`);
  await page.close();
}
await browser.close();
