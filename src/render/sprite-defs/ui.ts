// Phase 13 — UI chrome sprite definitions.
//
// 16×16 simple geometric icons: cursor, selection brackets,
// movement range highlight, attack range highlight.

import { C } from '../palette';
import type { SpriteDef } from '../pixel-art';

const h = (n: number) => n.toString(16);

function cursor(): SpriteDef {
  // 16×16 crosshair: gold center, gray frame, transparent everywhere else.
  // Build it row by row.
  const GOLD = h(C.GOLD);
  const MID = h(C.UI_STONE_MID);
  const rows: string[] = [];
  for (let y = 0; y < 16; y++) {
    let row = '';
    for (let x = 0; x < 16; x++) {
      // Center cross: vertical bar at x=7,8 (y=4..11); horizontal at y=7,8 (x=4..11).
      const inV = x >= 7 && x <= 8 && y >= 3 && y <= 12;
      const inH = y >= 7 && y <= 8 && x >= 3 && x <= 12;
      const inCenter = (x === 7 || x === 8) && (y === 7 || y === 8);
      if (inCenter) row += GOLD;
      else if (inV || inH) row += MID;
      else row += h(0);
    }
    rows.push(row);
  }
  return { key: 'ui.cursor', width: 16, height: 16, pixels: rows.join('\n'), notes: 'Crosshair cursor with gold center and gray frame.' };
}

function selection(): SpriteDef {
  // 16×16 four L-shaped corner brackets forming a selection box.
  // The brackets are in stone-mid, transparent between.
  const M = h(C.UI_STONE_MID);
  const rows: string[] = [];
  for (let y = 0; y < 16; y++) {
    let row = '';
    for (let x = 0; x < 16; x++) {
      // top-left bracket
      const tl = (x === 1 || x === 2 || x === 3) && y <= 4
        || (y === 1 || y === 2 || y === 3) && x <= 4;
      // top-right
      const tr = (x === 12 || x === 13 || x === 14) && y <= 4
        || (y === 1 || y === 2 || y === 3) && x >= 11;
      // bottom-left
      const bl = (x === 1 || x === 2 || x === 3) && y >= 11
        || (y === 12 || y === 13 || y === 14) && x <= 4;
      // bottom-right
      const br = (x === 12 || x === 13 || x === 14) && y >= 11
        || (y === 12 || y === 13 || y === 14) && x >= 11;
      row += (tl || tr || bl || br) ? M : h(0);
    }
    rows.push(row);
  }
  return { key: 'ui.selection', width: 16, height: 16, pixels: rows.join('\n'), notes: 'Four L-shaped stone corner brackets.' };
}

function moveHighlight(): SpriteDef {
  // 16×16 semi-transparent blue tile. We approximate "semi-transparent"
  // with a dithered pattern of water-light and transparent.
  const W = h(C.WATER_LIGHT);
  const rows: string[] = [];
  for (let y = 0; y < 16; y++) {
    let row = '';
    for (let x = 0; x < 16; x++) {
      // Bayer 4×4 dither so it reads as "see-through" blue
      const t = ((x & 3) + (y & 3) * 4) % 5;
      // 60% transparent, 40% cyan
      const show = t < 2;
      row += show ? W : h(0);
    }
    rows.push(row);
  }
  return { key: 'ui.move-highlight', width: 16, height: 16, pixels: rows.join('\n'), notes: 'Dithered cyan highlight for movement range.' };
}

function attackHighlight(): SpriteDef {
  // 16×16 dithered red. We don't have a true red in the 16-color
  // palette, so use gold as a stand-in (it reads as warm/red in the
  // dithered context).
  const G = h(C.GOLD);
  const rows: string[] = [];
  for (let y = 0; y < 16; y++) {
    let row = '';
    for (let x = 0; x < 16; x++) {
      const t = ((x & 3) + (y & 3) * 4) % 5;
      const show = t < 2;
      row += show ? G : h(0);
    }
    rows.push(row);
  }
  return { key: 'ui.attack-highlight', width: 16, height: 16, pixels: rows.join('\n'), notes: 'Dithered gold highlight for attack range (palette-stand-in for red).' };
}

export const UI_DEFS: readonly SpriteDef[] = [
  cursor(),
  selection(),
  moveHighlight(),
  attackHighlight(),
];
