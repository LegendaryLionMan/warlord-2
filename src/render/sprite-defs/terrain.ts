// Phase 13 — Terrain sprite definitions (32×32).
//
// Each tile has intentional shapes that read as the corresponding
// 1993 SVGA terrain: visible tree clusters for forest, contour
// lines for hills, jagged snow-capped peaks for mountains, wave
// lines for water. Solid base color with selective dithered
// transitions — NOT uniform dithering everywhere.

import type { SpriteDef } from '../pixel-art';

const TILE = 32;

function tile(key: string, rows: string[]): SpriteDef {
  return { key, width: TILE, height: TILE, pixels: rows.join('\n') };
}

// Build a row of `len` chars from a base with a few accent slots.
function fill(c: string, len: number = TILE): string {
  return c.repeat(len);
}

// Indexed-write helper: `rows[y]` may be `string | undefined` under
// `noUncheckedIndexedAccess`, but we always initialize `rows` to a
// full TILE-sized array first, so the runtime value is always defined.
// Using a `!` cast keeps the call sites readable.
function write(rows: string[], y: number, x: number, c: string): void {
  const cur = rows[y]!;
  if (x < 0 || x >= cur.length) return;
  rows[y] = cur.slice(0, x) + c + cur.slice(x + 1);
}

// --- Plains: solid green with a few tufts of light green and dark
// green "shadows". Most of the tile is the base color.
function plains(): SpriteDef {
  const B = '2'; // plains-shade (base)
  const L = '3'; // plains-light (highlight)
  const D = '1'; // forest-deep (dark tuft)
  const rows: string[] = [];
  // Deterministic seed: scatter ~6 light tufts and ~4 dark tufts.
  const lightTufts: ReadonlyArray<readonly [number, number]> = [
    [4, 6], [11, 4], [20, 9], [27, 5], [8, 22], [24, 26], [3, 28], [16, 17],
  ];
  const darkTufts: ReadonlyArray<readonly [number, number]> = [
    [6, 3], [18, 14], [12, 27], [25, 20], [29, 30],
  ];
  for (let y = 0; y < TILE; y++) {
    rows.push(fill(B));
  }
  for (const pair of lightTufts) {
    const x = pair[0]; const y = pair[1];
    write(rows, y, x, L);
    write(rows, y, Math.min(TILE - 1, x + 1), L);
  }
  for (const pair of darkTufts) {
    const x = pair[0]; const y = pair[1];
    write(rows, y, x, D);
  }
  return tile('terrain.plains', rows);
}

// --- Forest: dark green base with visible tree canopies. We draw
// 3-4 round "canopy" shapes (medium green outline + base interior)
// plus a few smaller bushes.
function forest(): SpriteDef {
  const B = '1'; // forest-deep (base)
  const M = '2'; // plains-shade (canopy highlight)
  const rows: string[] = [];
  for (let y = 0; y < TILE; y++) rows.push(fill(B));

  // Tree canopies: 4×4 round-ish blobs
  const canopies: ReadonlyArray<readonly [number, number]> = [
    [4, 4], [16, 8], [10, 18], [22, 22],
  ];
  for (const pair of canopies) {
    const cx = pair[0]; const cy = pair[1];
    // Outline pixels
    const outline: ReadonlyArray<readonly [number, number]> = [
      [cx + 1, cy], [cx + 2, cy],
      [cx, cy + 1], [cx + 3, cy + 1],
      [cx, cy + 2], [cx + 3, cy + 2],
      [cx + 1, cy + 3], [cx + 2, cy + 3],
    ];
    for (const pix of outline) {
      const x = pix[0]; const y = pix[1];
      if (x >= 0 && x < TILE && y >= 0 && y < TILE) {
        write(rows, y, x, M);
      }
    }
  }

  // Smaller bushes
  const bushes: ReadonlyArray<readonly [number, number]> = [
    [27, 4], [6, 26], [26, 28],
  ];
  for (const pair of bushes) {
    const cx = pair[0]; const cy = pair[1];
    write(rows, cy, cx, M);
    write(rows, cy, cx + 1, M);
    if (cy + 1 < TILE) write(rows, cy + 1, cx, M);
  }

  return tile('terrain.forest', rows);
}

// --- Hills: orange-brown base with horizontal "contour" lines in
// darker brown. A few small "bump" shapes.
function hills(): SpriteDef {
  const B = '4'; // hills-base
  const S = '5'; // hills-shade (dark)
  const rows: string[] = [];
  for (let y = 0; y < TILE; y++) rows.push(fill(B));

  // Contour lines at y=4, 11, 18, 25 (every 7 rows)
  for (const y of [4, 11, 18, 25]) {
    // Dithered edge: every other pixel is the shade color
    for (let x = 0; x < TILE; x++) {
      if ((x + y) % 2 === 0) write(rows, y, x, S);
    }
  }

  // A few "peaks" — small bumps using a brighter pattern
  // (just shade → base → shade again on a single column)
  const peaks: ReadonlyArray<readonly [number, number]> = [
    [8, 2], [20, 9], [14, 22],
  ];
  for (const pair of peaks) {
    const px = pair[0]; const py = pair[1];
    // A 3-tall triangular bump
    if (py - 1 >= 0) write(rows, py - 1, px, S);
    if (py < TILE) write(rows, py, px - 1 >= 0 ? px - 1 : px, S);
    if (py < TILE) write(rows, py, px, S);
    if (py < TILE) write(rows, py, px + 1 < TILE ? px + 1 : px, S);
    if (py + 1 < TILE) write(rows, py + 1, px, S);
  }
  return tile('terrain.hills', rows);
}

// --- Mountains: dark gray base with visible jagged peaks. Snow caps
// on the upper third. Most of the tile is base color.
function mountains(): SpriteDef {
  const B = '8'; // mountain-base
  const M = '9'; // mountain-shade (mid gray)
  const L = 'a'; // mountain-light (light gray)
  const S = 'b'; // snow (near-white)
  const rows: string[] = [];
  for (let y = 0; y < TILE; y++) rows.push(fill(B));

  // Draw three jagged peaks in the top half
  const peaks: ReadonlyArray<{ readonly x: number; readonly height: number }> = [
    { x: 6, height: 10 },
    { x: 16, height: 6 },
    { x: 24, height: 12 },
  ];
  for (const p of peaks) {
    const baseY = 18; // mountain "base" line
    const peakY = baseY - p.height;
    // Fill from peakY to baseY in a triangular shape
    for (let dy = 0; dy <= p.height; dy++) {
      const y = peakY + dy;
      if (y < 0 || y >= TILE) continue;
      const widthAtY = Math.max(1, Math.floor((dy / p.height) * 6));
      for (let dx = -widthAtY; dx <= widthAtY; dx++) {
        const x = p.x + dx;
        if (x < 0 || x >= TILE) continue;
        // Color depends on height
        let c: string;
        if (dy < p.height * 0.4) c = S;        // snow cap
        else if (dy < p.height * 0.7) c = L;   // light gray
        else c = M;                             // mid gray
        write(rows, y, x, c);
      }
    }
  }

  return tile('terrain.mountains', rows);
}

// --- Water: solid blue with a few wave lines in cyan. Mostly base
// color with light highlights on a 4-row cycle.
function water(): SpriteDef {
  const B = '6'; // water-deep
  const L = '7'; // water-light (cyan)
  const rows: string[] = [];
  for (let y = 0; y < TILE; y++) rows.push(fill(B));

  // Wave lines: a small dithered strip every 5 rows
  for (let y = 2; y < TILE; y += 5) {
    // A 1-pixel cyan strip with dithered edges
    for (let x = 0; x < TILE; x++) {
      if ((x + y) % 4 < 2) write(rows, y, x, L);
    }
  }
  return tile('terrain.water', rows);
}

export const TERRAIN_DEFS: readonly SpriteDef[] = [
  plains(),
  forest(),
  hills(),
  mountains(),
  water(),
];
