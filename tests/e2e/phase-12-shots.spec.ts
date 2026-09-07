import { test } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = 'docs/screenshots';

test('Phase 12 — capture MenuScene with new art', async ({ page }) => {
  mkdirSync(OUT, { recursive: true });
  await page.goto('http://localhost:5173/');
  await page.waitForSelector('canvas', { timeout: 5000 });
  await page.waitForTimeout(2000); // let menu music + title render
  await page.screenshot({ path: `${OUT}/phase-12-menu.jpg`, fullPage: false });
});

test('Phase 12 — capture FactionScene with new art', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.waitForSelector('canvas', { timeout: 5000 });
  await page.waitForTimeout(2000);
  // Click the New Game text — Phaser text is in the canvas, click center
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  if (box) await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.56);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/phase-12-faction.jpg`, fullPage: false });
});

test('Phase 12 — capture GameScene with new terrain/cities/units', async ({ page }) => {
  await page.goto('http://localhost:5173/?scene=GameScene&faction=humans');
  await page.waitForSelector('canvas', { timeout: 5000 });
  await page.waitForTimeout(3500); // let assets load and render
  await page.screenshot({ path: `${OUT}/phase-12-game.jpg`, fullPage: false });
});
