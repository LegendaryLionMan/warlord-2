// Crop the 1993 Warlords II HUD chrome pieces from the Internet
// Archive screenshots. These will be used as the in-game HUD
// background images so the playfield is framed by authentic
// 1993 chrome instead of the Phase 13 hand-coded chiseled-stone
// panels.
//
// The original game UI layout (640x480):
//   y=0..18    : top menu bar (SSG Game Order Report Hero View History Turn)
//   x=380..568 : right column starts (minimap top, action buttons, etc.)
//   y=425..480 : bottom action bar (8 unit slots + 4 production icons)

import { readFile, writeFile } from 'node:fs/promises';
import { PNG } from 'pngjs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = join(__dirname, '..');

// Use screenshot_03.jpg (loading screen) since it has the same chrome
// layout as the in-game screen but is simpler. Convert to PNG via
// the loader (Phaser will accept jpg through the same path).
const SRC = 'screenshot_03.jpg';
const DST_DIR = join(repoRoot, 'public/assets/sprites/original');

async function loadJpegAsPng(path) {
  // Phaser's loader auto-handles jpg/png, but to crop we need a
  // decoded pixel buffer. Use a tiny canvas via the `sharp` lib if
  // available; otherwise fall back to using Phaser's texture cache
  // at runtime. For a build-time script we can use pngjs on PNGs
  // only — so we look for a PNG copy or use the existing world-map.png
  // which already covers the same chrome.
  throw new Error('Use the existing world-map.png for chrome crops.');
}

// We use world-map.png as the chrome source — it has the same 640x480
// in-game layout as the IA screenshots, and is already a PNG.
const srcPath = join(repoRoot, 'public/assets/sprites/original/world-map.png');
const buf = await readFile(srcPath);
const src = PNG.sync.read(buf);
const { width: sw, height: sh } = src;
console.log(`Source: ${sw}x${sh}`);

function cropRegion(x, y, w, h, outName) {
  if (x + w > sw || y + h > sh) {
    throw new Error(`crop ${outName} ${w}x${h} at (${x},${y}) exceeds source ${sw}x${sh}`);
  }
  const out = new PNG({ width: w, height: h });
  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      const sIdx = ((y + row) * sw + (x + col)) * 4;
      const dIdx = (row * w + col) * 4;
      out.data[dIdx]     = src.data[sIdx];
      out.data[dIdx + 1] = src.data[sIdx + 1];
      out.data[dIdx + 2] = src.data[sIdx + 2];
      out.data[dIdx + 3] = src.data[sIdx + 3];
    }
  }
  const outPath = join(DST_DIR, outName);
  writeFile(outPath, PNG.sync.write(out));
  console.log(`Wrote ${outName} (${w}x${h})`);
}

// Top menu bar (SSG Game Order ... Turn) — full width, 18px tall.
cropRegion(0, 0, 640, 18, 'hud-top-bar.png');

// Bottom action bar — 8 unit slots + 4 production icons.
// Visible at y=425..480 in world-map.png. Approximate.
cropRegion(0, 425, 380, 55, 'hud-action-bar.png');

// Right-side command panel area (the area to the right of the playfield,
// below the minimap and above the action bar). Approximate.
cropRegion(395, 232, 175, 195, 'hud-right-panel.png');

console.log('Done.');
