// Phase 14 — Draw a grid overlay on the world map screenshot to
// identify tile positions.

import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const img = PNG.sync.read(readFileSync('C:/Users/lion_/AppData/Local/Temp/wl2-research/warlord2_045.png'));
const W = img.width, H = img.height;

// Draw a red grid every 32 px and a yellow grid every 64 px.
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (x % 32 === 0 || y % 32 === 0) {
      const i = (y * W + x) * 4;
      // semi-transparent red overlay
      img.data[i] = Math.min(255, img.data[i] + 80);
      img.data[i + 1] = img.data[i + 1] >> 1;
      img.data[i + 2] = img.data[i + 2] >> 1;
      img.data[i + 3] = 255;
    }
    if (x % 64 === 0 || y % 64 === 0) {
      const i = (y * W + x) * 4;
      img.data[i] = 255; img.data[i + 1] = 255; img.data[i + 2] = 0;
      img.data[i + 3] = 255;
    }
  }
}

writeFileSync('C:/Users/lion_/AppData/Local/Temp/wl2-original/grid-overlay.png', PNG.sync.write(img));
console.log('Wrote grid overlay to grid-overlay.png');
