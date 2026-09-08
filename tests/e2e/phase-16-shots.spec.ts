// Phase 16 — capture the 8-faction FactionScene, the Settler unit
// (rendered in the action bar), and the OutcomeScene (victory +
// defeat).
import { test } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = 'docs/screenshots';
const BASE = 'http://localhost:5173';

test.beforeAll(() => {
  mkdirSync(OUT, { recursive: true });
});

test('Phase 16 - 8-faction FactionScene (full roster)', async ({ page }) => {
  await page.goto(`${BASE}/?scene=FactionScene`, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/phase-16-faction.jpg`, fullPage: false });
});

test('Phase 16 — OutcomeScene (VICTORY)', async ({ page }) => {
  await page.goto(`${BASE}/?scene=OutcomeScene&kind=won`, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `${OUT}/phase-16-victory.jpg`, fullPage: false });
});

test('Phase 16 — OutcomeScene (DEFEAT)', async ({ page }) => {
  await page.goto(`${BASE}/?scene=OutcomeScene&kind=lost`, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `${OUT}/phase-16-defeat.jpg`, fullPage: false });
});
