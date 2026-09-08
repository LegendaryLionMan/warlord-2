// Phase 15 — capture the HUD chrome re-skin + the four dialog
// scenes (production, hero, quest, fighting). The dialogs are
// launched via ?scene=ProductionScene|HeroScene|QuestScene and the
// HUD is captured in the normal GameScene view.
import { test } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = 'docs/screenshots';
const BASE = 'http://localhost:5173';

test.beforeAll(() => {
  mkdirSync(OUT, { recursive: true });
});

test('Phase 15 — HUD chrome (top bar, side panel, minimap)', async ({ page }) => {
  await page.goto(`${BASE}/?scene=GameScene&faction=humans`, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(7000);
  await page.screenshot({ path: `${OUT}/phase-15-game.jpg`, fullPage: false });
});

test('Phase 15 — production dialog (Build Production scroll)', async ({ page }) => {
  await page.goto(`${BASE}/?scene=ProductionScene`, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${OUT}/phase-15-production.jpg`, fullPage: false });
});

test('Phase 15 - hero dialog (procedural Hero! panel)', async ({ page }) => {
  await page.goto(`${BASE}/?scene=HeroScene`, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${OUT}/phase-15-hero.jpg`, fullPage: false });
});

test('Phase 15 — quest dialog (quest scroll)', async ({ page }) => {
  await page.goto(`${BASE}/?scene=QuestScene`, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${OUT}/phase-15-quest.jpg`, fullPage: false });
});
