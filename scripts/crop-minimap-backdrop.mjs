// Crop the world minimap from the original Warlords II world-map screenshot.
// The minimap (~190x180) shows the entire continent in tiny tiles — perfect
// for use as the in-game playfield backdrop. We upscale it with nearest-neighbor
// so each original pixel becomes a clean ~6x6 block (no blurring), giving the
// world map an authentic chunky look at the 1024x1024 playfield scale.

import { readFile, writeFile } from 'node:fs/promises';
import { PNG } from 'pngjs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = join(__dirname, '..');

const srcPath = join(repoRoot, 'public/assets/sprites/original/world-map.png');
const outPath = join(repoRoot, 'public/assets/sprites/original/world-backdrop.png');

// Approximate minimap region inside the 640x480 world-map.png screenshot.
// Measured from the original game UI: x in [400,568], y in [18,226].
// Includes a 1px gray border around the minimap so the cropped region
// has clean edges.
const crop = { x: 400, y: 18, w: 168, h: 208 };

const buf = await readFile(srcPath);
const src = PNG.sync.read(buf);
const { width: sw, height: sh } = src;

if (crop.x + crop.w > sw || crop.y + crop.h > sh) {
  throw new Error(`crop ${JSON.stringify(crop)} exceeds source ${sw}x${sh}`);
}

const out = new PNG({ width: crop.w, height: crop.h });
for (let y = 0; y < crop.h; y++) {
  for (let x = 0; x < crop.w; x++) {
    const sIdx = ((crop.y + y) * sw + (crop.x + x)) * 4;
    const dIdx = (y * crop.w + x) * 4;
    out.data[dIdx]     = src.data[sIdx];
    out.data[dIdx + 1] = src.data[sIdx + 1];
    out.data[dIdx + 2] = src.data[sIdx + 2];
    out.data[dIdx + 3] = src.data[sIdx + 3];
  }
}

await writeFile(outPath, PNG.sync.write(out));
console.log(`Wrote ${outPath} (${crop.w}x${crop.h})`);
