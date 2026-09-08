// Phase 13 — City sprite definitions.
//
// 32×40 isometric fortress icons. The original 1993 game had 8
// unique city designs (one per faction), each recolorable. The
// clone ships 5: 4 factions + neutral.
//
// All cities share a fortress silhouette — crenellated walls, two
// corner towers, a central keep, a faction banner on top — with
// only the palette colors swapped per faction.

import type { SpriteDef } from '../pixel-art';

const W = 32;
const H = 40;

function fortress(args: {
  key: string;
  wall: string;       // main wall palette index (hex char)
  wallDark: string;    // shadow side
  keep: string;       // central keep body
  keepDark: string;    // central keep shadow
  banner: string;      // banner accent
  ground: string;      // ground / shadow
  snow: string;        // snow/highlight (for cool factions)
  keepTop: string;     // roof of keep
}): SpriteDef {
  const rows: string[] = [];
  // Pad rows to full width with transparent.
  const ensure = (y: number): string => {
    while (rows.length <= y) rows.push('.'.repeat(W));
    const cur = rows[y]!;
    if (cur.length < W) {
      const padded = cur + '.'.repeat(W - cur.length);
      rows[y] = padded;
      return padded;
    }
    return cur;
  };
  // Helper: set a single pixel
  const px = (y: number, x: number, c: string) => {
    if (x < 0 || x >= W) return;
    const row = ensure(y);
    rows[y] = row.slice(0, x) + c + row.slice(x + 1);
  };
  // Helper: fill a rectangle (inclusive bounds)
  const fill = (y0: number, y1: number, x0: number, x1: number, c: string) => {
    for (let y = y0; y <= y1; y++) {
      const row = ensure(y);
      let s = '';
      for (let i = 0; i < W; i++) s += (i >= x0 && i <= x1) ? c : row[i]!;
      rows[y] = s;
    }
  };

  // Sky: rows 0..6 are empty (transparent)
  // Ground line: rows 34..39 — shadow under the city
  fill(34, 39, 0, 31, args.ground);

  // Left corner tower: x=2..8, y=8..33
  fill(8, 33, 2, 8, args.wall);
  // Crenellated top of left tower: y=6..7
  for (const x of [2, 4, 6, 8]) px(6, x, args.wall);
  for (const x of [3, 5, 7]) px(6, x, args.snow); // gap
  for (const x of [2, 4, 6, 8]) px(7, x, args.wall);
  // Right corner tower: x=23..29, y=8..33
  fill(8, 33, 23, 29, args.wall);
  for (const x of [23, 25, 27, 29]) px(6, x, args.wall);
  for (const x of [24, 26, 28]) px(6, x, args.snow);
  for (const x of [23, 25, 27, 29]) px(7, x, args.wall);

  // Tower window slits (dark)
  px(14, 5, args.wallDark);
  px(14, 26, args.wallDark);
  px(20, 5, args.wallDark);
  px(20, 26, args.wallDark);

  // Crenellated wall top: y=10..11, x=9..22
  for (const x of [9, 11, 13, 15, 17, 19, 21]) px(10, x, args.wall);
  for (const x of [10, 12, 14, 16, 18, 20, 22]) px(10, x, args.snow);
  for (let x = 9; x <= 22; x++) px(11, x, args.wall);

  // Main wall: y=12..33, x=9..22
  fill(12, 33, 9, 22, args.wall);

  // Wall shadow on the right side
  fill(12, 33, 21, 22, args.wallDark);

  // Central keep: x=12..19, y=4..33
  fill(4, 9, 12, 19, args.keepTop);
  fill(10, 33, 12, 19, args.keep);
  // Keep right shadow
  fill(10, 33, 18, 19, args.keepDark);
  // Keep windows
  px(16, 15, args.wallDark);
  px(16, 16, args.wallDark);
  px(22, 15, args.wallDark);
  px(22, 16, args.wallDark);
  // Keep door
  fill(28, 33, 14, 17, args.ground);

  // Banner on top of keep: 2 wide, 4 tall at x=15..16, y=0..3
  fill(0, 3, 15, 16, args.banner);
  // Banner pole
  px(0, 15, args.wallDark);
  px(0, 16, args.wallDark);
  px(1, 15, args.wallDark);
  px(1, 16, args.wallDark);

  // Tower top spikes
  px(5, 3, args.banner);
  px(5, 5, args.banner);
  px(5, 7, args.banner);
  px(5, 24, args.banner);
  px(5, 26, args.banner);
  px(5, 28, args.banner);

  // Trim rows to H
  while (rows.length < H) rows.push('.'.repeat(W));
  return { key: args.key, width: W, height: H, pixels: rows.join('\n') };
}

export const CITY_DEFS: readonly SpriteDef[] = [
  // Humans: blue walls (water-deep), silver keep (mountain-light), gold banner
  fortress({
    key: 'city.humans',
    wall:      '6', // water-deep (blue)
    wallDark:  '1', // forest-deep (dark blue-gray)
    keep:      'a', // mountain-light (silver)
    keepDark:  '9', // mountain-shade
    banner:    'f', // gold
    ground:    'c', // ui-stone-dark
    snow:      'e', // ui-stone-light (highlight)
    keepTop:   'a', // mountain-light (silver)
  }),
  // Elves: forest-deep walls, plains-shade keep (green), light green banner
  fortress({
    key: 'city.elves',
    wall:      '1', // forest-deep
    wallDark:  '5', // hills-shade
    keep:      '2', // plains-shade
    keepDark:  '1', // forest-deep
    banner:    '3', // plains-light
    ground:    'c', // ui-stone-dark
    snow:      'e', // ui-stone-light
    keepTop:   '2', // plains-shade
  }),
  // Orcs: dark brown walls (hills-shade), orange-red keep, dark banner
  fortress({
    key: 'city.orcs',
    wall:      '5', // hills-shade
    wallDark:  '1', // forest-deep
    keep:      '4', // hills-base (orange-red)
    keepDark:  '5', // hills-shade
    banner:    '4', // hills-base
    ground:    '1', // forest-deep
    snow:      'e', // ui-stone-light
    keepTop:   '4', // hills-base
  }),
  // Undead: very dark walls (ui-stone-dark), bone-white keep, light banner
  fortress({
    key: 'city.undead',
    wall:      'c', // ui-stone-dark
    wallDark:  '1', // forest-deep
    keep:      'b', // snow (bone white)
    keepDark:  'e', // ui-stone-light
    banner:    'b', // snow
    ground:    '1', // forest-deep
    snow:      'e', // ui-stone-light
    keepTop:   'b', // snow
  }),
  // Neutral: gray stone, plain banner
  fortress({
    key: 'city.neutral',
    wall:      '9', // mountain-shade
    wallDark:  '8', // mountain-base
    keep:      'a', // mountain-light
    keepDark:  '9', // mountain-shade
    banner:    'e', // ui-stone-light
    ground:    'c', // ui-stone-dark
    snow:      'e', // ui-stone-light
    keepTop:   'a', // mountain-light
  }),
];
