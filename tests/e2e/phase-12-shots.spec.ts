import { test } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = 'docs/screenshots';

test('Phase 12 — capture MenuScene', async ({ page }) => {
  mkdirSync(OUT, { recursive: true });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(6000); // let canvas paint and music load
  await page.screenshot({ path: `${OUT}/phase-12-menu.jpg`, fullPage: false });
});

test('Phase 12 — capture GameScene', async ({ page }) => {
  await page.goto('http://localhost:5173/?scene=GameScene&faction=humans', { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(7000); // let assets load and map render
  await page.screenshot({ path: `${OUT}/phase-12-game.jpg`, fullPage: false });
});
