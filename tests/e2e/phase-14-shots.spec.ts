// Phase 14 — capture the new original-1993 visuals.
import { test } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = 'docs/screenshots';
const BASE = 'http://localhost:5173';

test('Phase 14 — original-1993 title screen', async ({ page }) => {
  mkdirSync(OUT, { recursive: true });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/phase-14-menu.jpg`, fullPage: false });
});

test('Phase 14 — original-1993 world map view', async ({ page }) => {
  await page.goto(`${BASE}/?scene=GameScene&faction=humans`, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(7000);
  await page.screenshot({ path: `${OUT}/phase-14-game.jpg`, fullPage: false });
});

test('Phase 14 — original-1993 faction select', async ({ page }) => {
  await page.goto(`${BASE}/?scene=FactionScene`, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/phase-14-faction.jpg`, fullPage: false });
});
