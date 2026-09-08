// Copy the original screenshots into the project's public/assets/sprites/
// directory for use as in-game backdrops.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const SRC = 'C:/Users/lion_/AppData/Local/Temp/wl2-research';
const DEST_BASE = 'C:/Users/lion_/OneDrive/Minimax/Warlords 2/public/assets/sprites/original';

mkdirSync(DEST_BASE, { recursive: true });

const FILES = [
  { from: 'original/screenshot_00.jpg', to: 'title-screen.jpg' },
  { from: 'warlord2_006.png', to: 'combat-screen.png' },
  { from: 'warlord2_010.png', to: 'hero-dialog.png' },
  { from: 'warlord2_022.png', to: 'production-screen.png' },
  { from: 'warlord2_045.png', to: 'world-map.png' },
  { from: 'map_overview.png', to: 'map-overview.png' },
];

for (const { from, to } of FILES) {
  const data = readFileSync(`${SRC}/${from}`);
  const dest = `${DEST_BASE}/${to}`;
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, data);
  console.log(`Copied ${from} -> ${to} (${data.length} bytes)`);
}

// Also copy Internet Archive's official screenshots
const IA = 'C:/Users/lion_/AppData/Local/Temp/wl2-research/original';
for (let i = 0; i < 10; i++) {
  const fname = `screenshot_0${i}.jpg`;
  try {
    const data = readFileSync(`${IA}/${fname}`);
    const dest = `${DEST_BASE}/ia-${fname}`;
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, data);
    console.log(`Copied ${fname} -> ia-${fname} (${data.length} bytes)`);
  } catch (e) {
    // skip
  }
}

console.log('Done.');
