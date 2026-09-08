// Phase 14 — Warlords II (1993) 16-color palette.
//
// Extracted from the original game's STANDARD.PAL file
// (msdos_Warlords_II_1993/Warlrd2/STANDARD.PAL). 16 RGB triplets,
// 160 bytes total = 16 × 3 × 1 plane. This is the exact palette the
// 1993 floppy release shipped with.
//
// Slot assignments:
//   0  black                  (outlines, transparent backdrop)
//   1  light gray (73 73 73)  (marble texture, UI mid)
//   2  mid gray (56 56 56)
//   3  dark gray (44 44 44)
//   4  darker gray (31 31 31) (UI shadow)
//   5  teal (17 72 99)        (water deep)
//   6  deep blue (00 36 81)   (water deep highlight)
//   7  olive (99 92 13)       (gold, fire)
//   8  orange (99 63 00)      (mountains, hills, oranges)
//   9  dark red (77 11 00)    (fire, accent)
//   10 dark green (31 67 11)  (forest, grass)
//   11 green (00 55 00)
//   12 deep green (00 34 00)  (forest deep)
//   13 brown (64 33 00)
//   14 dark brown (45 20 00)
//   15 light gray (99 99 99)  (snow, white, mountain light)
//
// Note: 5 grays dominate the palette (0, 1, 2, 3, 4, 15). The original
// was drawn in a high-contrast "stone" aesthetic — much more grey
// than the k-means Phase 13 palette had.

export interface PaletteEntry {
  readonly slot: number;
  readonly name: string;
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export const PALETTE: readonly PaletteEntry[] = [
  { slot:  0, name: 'black',            r:   0, g:   0, b:   0 },
  { slot:  1, name: 'gray-light',       r: 115, g: 115, b: 115 },
  { slot:  2, name: 'gray-mid',         r:  86, g:  86, b:  86 },
  { slot:  3, name: 'gray-dark',        r:  68, g:  68, b:  68 },
  { slot:  4, name: 'gray-darker',      r:  49, g:  49, b:  49 },
  { slot:  5, name: 'teal',             r:  23, g: 114, b: 153 },
  { slot:  6, name: 'blue-deep',        r:   0, g:  54, b: 129 },
  { slot:  7, name: 'olive',            r: 153, g: 146, b:  19 },
  { slot:  8, name: 'orange',           r: 153, g:  99, b:   0 },
  { slot:  9, name: 'red-dark',         r: 119, g:  17, b:   0 },
  { slot: 10, name: 'green-dark',       r:  49, g: 103, b:  17 },
  { slot: 11, name: 'green',            r:   0, g:  85, b:   0 },
  { slot: 12, name: 'green-deep',       r:   0, g:  52, b:   0 },
  { slot: 13, name: 'brown',            r: 100, g:  51, b:   0 },
  { slot: 14, name: 'brown-dark',       r:  69, g:  32, b:   0 },
  { slot: 15, name: 'gray-bright',      r: 153, g: 153, b: 153 },
] as const;

/** Per-channel color lookup (16 entries of [r,g,b]). */
const RGB: ReadonlyArray<readonly [number, number, number]> = PALETTE.map(
  (e) => [e.r, e.g, e.b] as const,
);

/** Look up RGB for a palette slot. */
export function rgbForIndex(slot: number): readonly [number, number, number] {
  return RGB[slot] ?? [0, 0, 0];
}

/** Look up the named slot. Throws if the name is unknown so the build fails fast. */
export function paletteIndex(name: string): number {
  const entry = PALETTE.find((e) => e.name === name);
  if (!entry) {
    throw new Error(`palette.ts: unknown palette name "${name}"`);
  }
  return entry.slot;
}

/** Nearest palette index for an arbitrary RGB color. */
export function nearestColorIndex(r: number, g: number, b: number): number {
  let best = 1; // skip black
  let bestD = Infinity;
  for (let i = 1; i < PALETTE.length; i++) {
    const entry = PALETTE[i]!;
    const dr = entry.r - r;
    const dg = entry.g - g;
    const db = entry.b - b;
    const d = dr * dr + dg * dg + db * db;
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

/** Convenience constants for sprite-defs authors. */
export const C = {
  BLACK:        0,
  GRAY_LIGHT:   paletteIndex('gray-light'),
  GRAY_MID:     paletteIndex('gray-mid'),
  GRAY_DARK:    paletteIndex('gray-dark'),
  GRAY_DARKER:  paletteIndex('gray-darker'),
  TEAL:         paletteIndex('teal'),
  BLUE_DEEP:    paletteIndex('blue-deep'),
  OLIVE:        paletteIndex('olive'),
  ORANGE:       paletteIndex('orange'),
  RED_DARK:     paletteIndex('red-dark'),
  GREEN_DARK:   paletteIndex('green-dark'),
  GREEN:        paletteIndex('green'),
  GREEN_DEEP:   paletteIndex('green-deep'),
  BROWN:        paletteIndex('brown'),
  BROWN_DARK:   paletteIndex('brown-dark'),
  GRAY_BRIGHT:  paletteIndex('gray-bright'),
  T:            0, // transparent
} as const;
