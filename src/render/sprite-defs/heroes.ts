// Phase 13 — Hero portrait sprite definitions (32x32).
//
// 4 portraits, one per faction. Each shows a face on a stone-textured
// background, with a faction-colored collar/cape.

import type { SpriteDef } from '../pixel-art';

const W = 32;
const H = 32;

function sprite(rows: string[], key: string): SpriteDef {
  return { key, width: W, height: H, pixels: rows.join('\n') };
}

// Helper: build a portrait with a stone background, face, and a
// faction-colored collar at the bottom.
function portrait(args: {
  key: string;
  bg: string;       // background palette char
  face: string;      // face/skin char
  faceShade: string; // face shadow
  hair: string;      // hair/hat
  hairShade: string; // hair shadow
  eye: string;       // eye color
  collar: string;    // faction collar color
  collarShade: string;
}): SpriteDef {
  const rows: string[] = [];
  for (let y = 0; y < H; y++) {
    let row = '';
    for (let x = 0; x < W; x++) {
      // Border: 1px dark frame
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) {
        row += args.collarShade;
        continue;
      }
      // Header bar (top 4 rows): faction color
      if (y < 4) {
        row += args.collar;
        continue;
      }
      // Footer bar (bottom 6 rows): collar
      if (y >= H - 6) {
        row += (x % 3 === 0) ? args.collarShade : args.collar;
        continue;
      }
      // Face oval: roughly centered, 16x16
      const cx = 16, cy = 16;
      const dx = x - cx, dy = (y - cy) * 2; // 2x stretch
      const r2 = dx * dx + dy * dy;
      if (r2 < 60) {
        // Inside face circle
        if (r2 > 40) row += args.faceShade;     // edge shadow
        else if (r2 < 8) row += args.faceShade; // chin shadow
        else row += args.face;                  // main face
        continue;
      }
      // Hair on top of head
      if (dy < -16 && Math.abs(dx) < 9) {
        row += (x + y) % 2 === 0 ? args.hairShade : args.hair;
        continue;
      }
      // Default: stone background with dithered pattern
      const isBgDark = (x + y) % 4 === 0;
      row += isBgDark ? args.bg : args.bg;
    }
    rows.push(row);
  }
  return sprite(rows, args.key);
}

export const HERO_DEFS: readonly SpriteDef[] = [
  // Humans: grizzled warrior, steel armor, blue collar
  portrait({
    key: 'hero.humans',
    bg: '9',          // mountain-shade
    face: '5',        // skin
    faceShade: '4',   // darker skin
    hair: 'e',        // ui-stone-light (gray)
    hairShade: '9',   // mountain-shade
    eye: '1',         // forest-deep (dark eye)
    collar: '6',      // water-deep (blue)
    collarShade: '1', // forest-deep
  }),
  // Elves: ageless ranger, green collar
  portrait({
    key: 'hero.elves',
    bg: '9',
    face: '5',
    faceShade: '4',
    hair: '3',        // plains-light (light green)
    hairShade: '2',   // plains-shade
    eye: '1',
    collar: '2',      // plains-shade (green)
    collarShade: '1', // forest-deep
  }),
  // Orcs: warchief, dark skin, brown collar
  portrait({
    key: 'hero.orcs',
    bg: '9',
    face: '4',        // hills-base (orange-brown skin)
    faceShade: '5',   // hills-shade
    hair: '5',        // hills-shade (dark)
    hairShade: '1',
    eye: 'f',         // gold (yellow eye)
    collar: '5',      // hills-shade (brown)
    collarShade: '1',
  }),
  // Undead: lich, bone face, purple-dark collar
  portrait({
    key: 'hero.undead',
    bg: '9',
    face: 'b',        // snow (bone white)
    faceShade: 'a',   // mountain-light
    hair: 'c',        // ui-stone-dark (black)
    hairShade: '1',
    eye: 'f',         // gold (glowing eye)
    collar: 'c',      // ui-stone-dark
    collarShade: '1',
  }),
];
