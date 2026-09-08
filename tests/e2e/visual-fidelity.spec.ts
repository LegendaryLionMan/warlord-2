// Phase 13 — Visual-fidelity end-to-end test.
//
// This test serves two purposes:
//   1. Verify every pixel-art PNG referenced by the loader is reachable
//      from the running dev server (catches the case where the build
//      script was forgotten, the .vite cache is stale, etc.).
//   2. Take reference screenshots of MenuScene, FactionScene, and
//      GameScene into docs/screenshots/phase-13-*.jpg.
//
// Run:   npm run e2e -- visual-fidelity
// Only run after the dev server is up:  npm run dev

import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = 'docs/screenshots';
const BASE = 'http://localhost:5173';

const SPRITE_PATHS = [
  // Terrain (5)
  '/assets/sprites/terrain/plains.png',
  '/assets/sprites/terrain/forest.png',
  '/assets/sprites/terrain/hills.png',
  '/assets/sprites/terrain/mountains.png',
  '/assets/sprites/terrain/water.png',
  // Cities (5)
  '/assets/sprites/cities/humans.png',
  '/assets/sprites/cities/elves.png',
  '/assets/sprites/cities/orcs.png',
  '/assets/sprites/cities/undead.png',
  '/assets/sprites/cities/neutral.png',
  // Features (3)
  '/assets/sprites/features/mine.png',
  '/assets/sprites/features/ruin.png',
  '/assets/sprites/features/armory.png',
  // UI chrome (4)
  '/assets/sprites/ui/cursor.png',
  '/assets/sprites/ui/selection.png',
  '/assets/sprites/ui/move-highlight.png',
  '/assets/sprites/ui/attack-highlight.png',
  // Heroes (4)
  '/assets/sprites/heroes/humans.png',
  '/assets/sprites/heroes/elves.png',
  '/assets/sprites/heroes/orcs.png',
  '/assets/sprites/heroes/undead.png',
  // Units (28 = 7 kinds x 4 factions)
  ...['humans', 'elves', 'orcs', 'undead'].flatMap((f) =>
    ['militia', 'spearman', 'archer', 'knight', 'cavalry', 'wizard', 'giant'].map(
      (u) => `/assets/sprites/units/${f}/${u}.png`,
    ),
  ),
];

test.describe('Phase 13 — pixel-art assets reachable', () => {
  for (const path of SPRITE_PATHS) {
    test(`GET ${path} returns 200`, async ({ request }) => {
      const resp = await request.get(`${BASE}${path}`);
      expect(resp.status(), `${path} should be served by Vite`).toBe(200);
    });
  }
});

test.describe('Phase 13 — screenshot capture', () => {
  test('MenuScene', async ({ page }) => {
    mkdirSync(OUT, { recursive: true });
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForSelector('canvas', { timeout: 10000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${OUT}/phase-13-menu.jpg`, fullPage: false });
  });

  test('FactionScene', async ({ page }) => {
    await page.goto(`${BASE}/?scene=FactionScene`, { waitUntil: 'networkidle' });
    await page.waitForSelector('canvas', { timeout: 10000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/phase-13-faction.jpg`, fullPage: false });
  });

  test('GameScene', async ({ page }) => {
    await page.goto(`${BASE}/?scene=GameScene&faction=humans`, { waitUntil: 'networkidle' });
    await page.waitForSelector('canvas', { timeout: 10000 });
    // The Phaser loader needs to drain the full terrain/unit/city/feature
    // sprite queue before the first paint completes; allow 7s for that.
    await page.waitForTimeout(7000);
    await page.screenshot({ path: `${OUT}/phase-13-game.jpg`, fullPage: false });
  });
});
