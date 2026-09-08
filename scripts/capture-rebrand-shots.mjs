// One-off screenshot capture for the v1.1 rebrand. Runs against the
// local dev server, captures each scene, writes PNGs to docs/screenshots/.

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:5173';
const OUT  = 'docs/screenshots';

mkdirSync(OUT, { recursive: true });

const targets = [
  { name: 'v1-1-game-siroms',  url: '/?scene=GameScene&faction=siroms' },
  { name: 'v1-1-game-fey',     url: '/?scene=GameScene&faction=fey' },
  { name: 'v1-1-combat',       url: '/?scene=CombatScene' },
  { name: 'v1-1-hero',         url: '/?scene=HeroScene' },
  { name: 'v1-1-production',   url: '/?scene=ProductionScene' },
  { name: 'v1-1-quest',        url: '/?scene=QuestScene' },
  { name: 'v1-1-outcome-won',  url: '/?scene=OutcomeScene&kind=won' },
  { name: 'v1-1-outcome-lost', url: '/?scene=OutcomeScene&kind=lost' },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await ctx.newPage();

for (const t of targets) {
  console.log(`Capturing ${t.name} <- ${t.url}`);
  await page.goto(BASE + t.url, { waitUntil: 'networkidle' });
  // Give Phaser a beat to draw the scene + load any audio
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/${t.name}.jpg`, type: 'jpeg', quality: 85, fullPage: false });
}

await browser.close();
console.log('Done.');
