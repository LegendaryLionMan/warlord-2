#!/usr/bin/env node
// Phase 13 — Compile hand-authored sprite definitions into PNG files.
//
// Reads all sprite-defs/*.ts, evaluates them through a tiny TS
// transpiler (esbuild), pulls the SpriteDef[] arrays, renders each
// through the pixel-art renderer, and writes the result to
// public/assets/sprites/<path>.png, mirroring the layout the loader
// expects.
//
// Usage:  node scripts/build-sprites.mjs
//
// Safe to re-run; overwrites only the canonical sprite PNGs.

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import esbuild from 'esbuild';
import { PNG } from 'pngjs';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO = path.resolve(__dirname, '..');

const defsFiles = fs.readdirSync(path.join(REPO, 'src', 'render', 'sprite-defs'))
  .filter(f => f.endsWith('.ts') && f !== 'index.ts');

console.log(`[build-sprites] Found ${defsFiles.length} def file(s):`, defsFiles);

// Bundle the index registry (which imports every defs file) into a
// single ESM file we can dynamic-import.
const result = await esbuild.build({
  entryPoints: [path.join(REPO, 'src', 'render', 'sprite-defs', 'index.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  outfile: path.join(REPO, '.build-sprites-bundle.mjs'),
  write: true,
  logLevel: 'silent',
});

// Just import the bundled registry (cache-busted so reruns see fresh data).
const mod = await import(url.pathToFileURL(path.join(REPO, '.build-sprites-bundle.mjs')).href + '?t=' + Date.now());
const allDefs = mod.ALL_DEFS || [];
console.log(`[build-sprites] ALL_DEFS: ${allDefs.length} sprite(s) registered.`);

console.log(`[build-sprites] Total ${allDefs.length} sprite defs to render.`);

// Re-implement the render here (we can't import the browser-only
// pixel-art.ts which uses document/ImageData). The runtime sprite
// loader uses the same logic in the browser.
const PALETTE = [
  { r:   0, g:   0, b:   0 }, // transparent
  { r:   0, g:  89, b:   0 },
  { r:   0, g: 142, b:   0 },
  { r:  81, g: 174, b:  28 },
  { r: 166, g:  85, b:   0 },
  { r: 122, g:  50, b:   0 },
  { r:   0, g:  93, b: 211 },
  { r:  44, g: 186, b: 255 },
  { r:  81, g:  81, b:  81 },
  { r: 113, g: 113, b: 113 },
  { r: 146, g: 146, b: 146 },
  { r: 190, g: 190, b: 190 },
  { r:  51, g:  51, b:  51 },
  { r: 113, g: 113, b: 113 },
  { r: 190, g: 190, b: 190 },
  { r: 255, g: 162, b:   0 },
];

function decode(def) {
  const cleaned = def.pixels.replace(/[\s.]/g, '').toUpperCase();
  if (cleaned.length > def.width * def.height) {
    throw new Error(`${def.key}: too many pixels (${cleaned.length} > ${def.width*def.height})`);
  }
  // Pad with transparent (0) to fill the tile.
  const out = new Uint8Array(def.width * def.height);
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned.charCodeAt(i);
    if (ch >= 0x30 && ch <= 0x39) out[i] = ch - 0x30;
    else if (ch >= 0x41 && ch <= 0x46) out[i] = ch - 0x41 + 10;
    else throw new Error(`${def.key}: bad char "${cleaned[i]}"`);
  }
  return out;
}

function render(def, scale = 4) {
  const w = def.width * scale, h = def.height * scale;
  const png = new PNG({ width: w, height: h });
  const idx = decode(def);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = (x / scale) | 0, sy = (y / scale) | 0;
      const slot = idx[sy * def.width + sx];
      const off = (y * w + x) << 2;
      if (slot === 0) {
        png.data[off] = 0; png.data[off+1] = 0; png.data[off+2] = 0; png.data[off+3] = 0;
      } else {
        const e = PALETTE[slot];
        png.data[off]   = e.r;
        png.data[off+1] = e.g;
        png.data[off+2] = e.b;
        png.data[off+3] = 255;
      }
    }
  }
  return PNG.sync.write(png);
}

// Map sprite keys to output paths. The keys match the loader
// manifest (src/data/manifests.ts + src/data/asset-paths.ts).
const KEY_TO_PATH = {
  'terrain.plains':    'public/assets/sprites/terrain/plains.png',
  'terrain.forest':    'public/assets/sprites/terrain/forest.png',
  'terrain.hills':     'public/assets/sprites/terrain/hills.png',
  'terrain.mountains': 'public/assets/sprites/terrain/mountains.png',
  'terrain.water':     'public/assets/sprites/terrain/water.png',
  'feature.mine':      'public/assets/sprites/features/mine.png',
  'feature.ruin':      'public/assets/sprites/features/ruin.png',
  'feature.armory':    'public/assets/sprites/features/armory.png',
  'city.humans':       'public/assets/sprites/cities/humans.png',
  'city.elves':        'public/assets/sprites/cities/elves.png',
  'city.orcs':         'public/assets/sprites/cities/orcs.png',
  'city.undead':       'public/assets/sprites/cities/undead.png',
  'city.neutral':      'public/assets/sprites/cities/neutral.png',
  'hero.humans':       'public/assets/sprites/heroes/humans.png',
  'hero.elves':        'public/assets/sprites/heroes/elves.png',
  'hero.orcs':         'public/assets/sprites/heroes/orcs.png',
  'hero.undead':       'public/assets/sprites/heroes/undead.png',
  'ui.cursor':         'public/assets/sprites/ui/cursor.png',
  'ui.selection':      'public/assets/sprites/ui/selection.png',
  'ui.move-highlight': 'public/assets/sprites/ui/move-highlight.png',
  'ui.attack-highlight':'public/assets/sprites/ui/attack-highlight.png',
};

// Build unit and hero mappings dynamically.
for (const unitKind of ['militia', 'spearman', 'archer', 'knight', 'cavalry', 'wizard', 'giant']) {
  for (const faction of ['humans', 'elves', 'orcs', 'undead']) {
    const key = `unit.${unitKind}.${faction}`;
    KEY_TO_PATH[key] = `public/assets/sprites/units/${faction}/${unitKind}.png`;
  }
}

let written = 0;
let skipped = 0;
for (const def of allDefs) {
  const out = KEY_TO_PATH[def.key];
  if (!out) {
    console.warn(`[build-sprites] no path mapping for key "${def.key}", skipping`);
    skipped++;
    continue;
  }
  const abs = path.join(REPO, out);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  // Render at 4x so the on-screen sprite (which is also scaled 4x by
  // Phaser) stays pixel-crisp at typical viewport sizes.
  const buf = render(def, 4);
  fs.writeFileSync(abs, buf);
  written++;
  console.log(`[build-sprites] wrote ${out} (${def.width}x${def.height} -> ${def.width*4}x${def.height*4})`);
}
console.log(`[build-sprites] Done. Wrote ${written}, skipped ${skipped}.`);
