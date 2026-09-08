// Phase 13 — 16-color Warlords II palette.
//
// Extracted by k-means on the CRPG Addict's screenshot of the 1993
// original (warlord2_006.png, see scripts/extract-palette.mjs). The
// 1993 base game is 16-color SVGA; the 1995 Deluxe bumped to 256.
// We are cloning the 1993 look, so we ship exactly 16 colors plus
// transparent.
//
// Slot assignments reflect the *Warlords II Deluxe* manual's "color
// slot" table (see docs/original-reference.md): Color 0 is
// transparent, Color 255 is always white, and the rest map to
// named roles.

export interface PaletteEntry {
  /** Palette index (0-15). */
  readonly slot: number;
  /** Named role, e.g. 'plains', 'water-deep', 'ui-stone-mid'. */
  readonly name: string;
  /** 24-bit RGB. */
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

// 16 entries. Sorted roughly by luminance (darkest first) so the
// "shade" mapping reads top-to-bottom from dark to bright.
export const PALETTE: readonly PaletteEntry[] = [
  { slot: 0, name: 'transparent',     r:   0, g:   0, b:   0 }, // Color 0, fully transparent
  { slot: 1, name: 'forest-deep',     r:   0, g:  89, b:   0 }, // darkest green
  { slot: 2, name: 'plains-shade',    r:   0, g: 142, b:   0 }, // medium green
  { slot: 3, name: 'plains-light',    r:  81, g: 174, b:  28 }, // bright green
  { slot: 4, name: 'hills-base',      r: 166, g:  85, b:   0 }, // orange-brown
  { slot: 5, name: 'hills-shade',     r: 122, g:  50, b:   0 }, // dark brown
  { slot: 6, name: 'water-deep',      r:   0, g:  93, b: 211 }, // deep blue
  { slot: 7, name: 'water-light',     r:  44, g: 186, b: 255 }, // bright cyan
  { slot: 8, name: 'mountain-base',   r:  81, g:  81, b:  81 }, // dark stone
  { slot: 9, name: 'mountain-shade',  r: 113, g: 113, b: 113 }, // mid stone
  { slot: 10, name: 'mountain-light', r: 146, g: 146, b: 146 }, // light stone
  { slot: 11, name: 'snow',           r: 190, g: 190, b: 190 }, // near-white
  { slot: 12, name: 'ui-stone-dark',  r:  51, g:  51, b:  51 }, // deep shadow
  { slot: 13, name: 'ui-stone-mid',   r: 113, g: 113, b: 113 }, // mid stone
  { slot: 14, name: 'ui-stone-light', r: 190, g: 190, b: 190 }, // highlight
  { slot: 15, name: 'gold',           r: 255, g: 162, b:   0 }, // UI accent / quest text
] as const;

/** Per-channel color lookup (256 entries of [r,g,b]). */
const RGB: ReadonlyArray<readonly [number, number, number]> = PALETTE.map(
  (e) => [e.r, e.g, e.b] as const,
);

/** Look up RGB for a palette slot. */
export function rgbForIndex(slot: number): readonly [number, number, number] {
  return RGB[slot] ?? [0, 0, 0];
}

/**
 * Look up the named slot, e.g. `paletteIndex('plains-shade')`. Throws
 * if the name is unknown so the build fails fast on typo.
 */
export function paletteIndex(name: string): number {
  const entry = PALETTE.find((e) => e.name === name);
  if (!entry) {
    throw new Error(`palette.ts: unknown palette name "${name}"`);
  }
  return entry.slot;
}

/**
 * Return the palette index whose RGB is nearest to the given color.
 * Used by the post-processing pipeline when quantizing AI output.
 */
export function nearestColorIndex(r: number, g: number, b: number): number {
  let best = 1; // skip transparent
  let bestD = Infinity;
  for (let i = 1; i < PALETTE.length; i++) {
    const entry = PALETTE[i]!;
    const dr = entry.r - r;
    const dg = entry.g - g;
    const db = entry.b - b;
    const d = dr * dr + dg * dg + db * db;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

// Convenience constants for sprite-defs authors — names by purpose
// so the terrain/city/UI authors don't need to remember slot numbers.

export const C = {
  // terrain
  FOREST_DEEP:    paletteIndex('forest-deep'),
  PLAINS_SHADE:   paletteIndex('plains-shade'),
  PLAINS_LIGHT:   paletteIndex('plains-light'),
  HILLS_BASE:     paletteIndex('hills-base'),
  HILLS_SHADE:    paletteIndex('hills-shade'),
  WATER_DEEP:     paletteIndex('water-deep'),
  WATER_LIGHT:    paletteIndex('water-light'),
  MOUNTAIN_BASE:  paletteIndex('mountain-base'),
  MOUNTAIN_SHADE: paletteIndex('mountain-shade'),
  MOUNTAIN_LIGHT: paletteIndex('mountain-light'),
  SNOW:           paletteIndex('snow'),
  // UI / chrome
  UI_STONE_DARK:  paletteIndex('ui-stone-dark'),
  UI_STONE_MID:   paletteIndex('ui-stone-mid'),
  UI_STONE_LIGHT: paletteIndex('ui-stone-light'),
  GOLD:           paletteIndex('gold'),
  // sentinel
  T:              0, // transparent
} as const;
