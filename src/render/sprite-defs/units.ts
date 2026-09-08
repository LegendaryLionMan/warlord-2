// Phase 13 — Unit sprite definitions.
//
// 7 base silhouettes (militia, spearman, archer, knight, cavalry,
// wizard, giant) tinted per faction (humans, elves, orcs, undead)
// = 28 sprites total. The original 1993 game had a "uniform color"
// slot that was swapped per faction on the same base sprite. We
// emulate that: each base defines a `body` slot, and we generate
// 4 tinted copies by swapping that slot for the faction's primary
// color.

import type { SpriteDef } from '../pixel-art';

const W = 16;
const H = 24;

function sprite(key: string, rows: string[]): SpriteDef {
  return { key, width: W, height: H, pixels: rows.join('\n') };
}

// Palette slot mapping for units.
//   '0' = transparent
//   '1' = outline (forest-deep — dark)
//   '2' = body (faction primary — set per faction)
//   '3' = cloth accent (plains-shade — green-grey, kept constant)
//   '4' = steel (ui-stone-mid — silver/grey)
//   '5' = skin (mountain-light)
//   '6' = highlight (snow)
//   '7' = gold accent (gold)

// Each base silhouette is 16x24 with `BB` (body) placeholders that
// get replaced with the faction's primary color index.

// The bases use a 1-character code so we can string-replace per
// faction. The actual sprite uses the slot char ('2' for body), so
// all bases share the same body color slot and a per-faction patch
// rewrites the body to the faction color at render time.
//
// For simplicity here, we just hand-author each (base, faction)
// combination by duplicating the base with the body color baked in.

// Faction primary colors (slot indices):
// humans: '6' (water-deep, blue)
// elves:  '1' (forest-deep, dark green) — actually elves are green
// orcs:   '5' (hills-shade, dark brown-red)
// undead: 'c' (ui-stone-dark, very dark gray)

// Body color slot, in the final sprite, will be:
// humans: '6'
// elves:  '2'  (plains-shade, medium green — for variety)
// orcs:   '5'
// undead: 'c'

// Helper to produce a tinted sprite by replacing the placeholder
// color '2' with the faction's body color.
function tint(base: SpriteDef, key: string, bodyChar: string): SpriteDef {
  return {
    key,
    width: base.width,
    height: base.height,
    pixels: base.pixels.replace(/2/g, bodyChar),
  };
}

// We define each base with body='2', then create 4 tinted versions
// per base (7 × 4 = 28 sprites).

function makeBases(): Record<string, SpriteDef> {
  const bases: Record<string, SpriteDef> = {};

  // --- Militia: simple standing figure with a short spear.
  // Head at y=3, body y=6..15, legs y=16..22, spear y=2..22 right of figure.
  bases['base.militia'] = sprite('base.militia', [
    '..........22....', // 0
    '..........22....', // 1
    '..........22....', // 2
    '....55....22....', // 3  head + spear shaft
    '...5555...22....', // 4  head
    '...5555...226...', // 5  head + spear tip
    '...2222...226...', // 6  body
    '...2222...22....', // 7
    '...2222...22....', // 8
    '...2222...22....', // 9
    '...2222...22....', // 10
    '...2222...22....', // 11
    '...2222...22....', // 12
    '...2222...22....', // 13
    '...2222...22....', // 14
    '...2222...22....', // 15
    '....44....22....', // 16  belt
    '....44....22....', // 17
    '...1111...11....', // 18  legs
    '...1111...11....', // 19
    '...1111...11....', // 20
    '...1111...11....', // 21
    '....11....11....', // 22  feet
    '....11....11....', // 23
  ]);

  // --- Spearman: similar but with a longer pike and bigger shoulders
  bases['base.spearman'] = sprite('base.spearman', [
    '...........22...', // 0
    '...........22...', // 1
    '...........22...', // 2
    '....55.....22.6.', // 3  head + pike
    '...5555....22.6.', // 4
    '...5555....22.6.', // 5
    '...2222....226..', // 6
    '..322223...226..', // 7  shoulders
    '..322223...22...', // 8
    '...2222....22...', // 9
    '...2222....22...', // 10
    '...2222....22...', // 11
    '...2222....22...', // 12
    '...2222....22...', // 13
    '...2222....22...', // 14
    '...2222....22...', // 15
    '....44.....22...', // 16
    '....44.....22...', // 17
    '...1111....11...', // 18
    '...1111....11...', // 19
    '...1111....11...', // // 20
    '...1111....11...', // 21
    '....11.....11...', // 22
    '....11.....11...', // 23
  ]);

  // --- Archer: figure with bow on left
  bases['base.archer'] = sprite('base.archer', [
    '.................', // 0
    '....55...........', // 1
    '...5555..........', // 2  head
    '...5555..........', // 3
    '...2222....44....', // 4  body + bow grip
    '...2222...4.4.4..', // 5  bow arc
    '...2222...4.4.4..', // 6
    '...2222...4.4.4..', // 7
    '...2222....44....', // 8
    '...2222.....4....', // 9  arrow
    '...2222.....4....', // 10
    '...2222....44....', // 11
    '...2222...4.4.4..', // 12
    '...2222...4.4.4..', // 13
    '...2222...4.4.4..', // 14
    '...2222....44....', // 15
    '....44...........', // 16  belt
    '....44...........', // 17
    '...1111..........', // 18
    '...1111..........', // 19
    '...1111..........', // 20
    '...1111..........', // 21
    '....11...........', // 22
    '....11...........', // 23
  ]);

  // --- Knight: full-armor figure with sword raised
  bases['base.knight'] = sprite('base.knight', [
    '.............66..', // 0  sword tip
    '............6....', // 1
    '...........6.....', // 2
    '....666....4.....', // 3  helmet + sword
    '...66666..4......', // 4
    '...64446..4......', // 5
    '...22222.........', // 6  body
    '..322223.........', // 7
    '..322223.........', // 8
    '...2222..........', // 9
    '...2222..........', // 10
    '...2222..........', // 11
    '...2222..........', // 12
    '...2222..........', // 13
    '...2222..........', // 14
    '...2222..........', // 15
    '....44...........', // 16
    '....44...........', // 17
    '...1111..........', // 18
    '...1111..........', // 19
    '...1111..........', // 20
    '...1111..........', // 21
    '....11...........', // 22
    '....11...........', // 23
  ]);

  // --- Cavalry: figure on a horse
  bases['base.cavalry'] = sprite('base.cavalry', [
    '.................', // 0
    '.................', // 1
    '....66...........', // 2  lance tip
    '...6.6...........', // 3
    '...6.6....55.....', // 4  head
    '...6.6...5555....', // 5
    '...555....5555...', // 6
    '..322223...55....', // 7
    '..322223.........', // 8
    '...2222..........', // 9
    '...2222..........', // 10
    '...2222..........', // 11
    '...2222..........', // 12
    '...2222..........', // 13
    '.4444444444......', // 14  horse back
    '.4444444444......', // 15
    '..4444..4444.....', // 16  legs
    '..4444..4444.....', // 17
    '..1111..1111.....', // 18
    '..1111..1111.....', // 19
    '..1111..1111.....', // 20
    '..1111..1111.....', // 21
    '...11....11......', // 22
    '...11....11......', // 23
  ]);

  // --- Wizard: figure with a staff
  bases['base.wizard'] = sprite('base.wizard', [
    '...............4.', // 0  staff
    '..............4..', // 1
    '.............4...', // 2
    '....55.......f...', // 3  head + staff orb
    '...5555......4...', // 4
    '...5555......4...', // 5
    '...2222......4...', // 6
    '..322223.....4...', // 7
    '..322223.....4...', // 8
    '...2222......4...', // 9
    '...2222......4...', // 10
    '...2222......4...', // 11
    '...2222......4...', // 12
    '...2222......4...', // 13
    '...2222......4...', // 14
    '...2222......4...', // 15
    '....44.......4...', // 16
    '....44.......4...', // 17
    '...1111......4...', // 18
    '...1111......4...', // 19
    '...1111..........', // 20
    '...1111..........', // 21
    '....11...........', // 22
    '....11...........', // 23
  ]);

  // --- Giant: large figure with a club
  bases['base.giant'] = sprite('base.giant', [
    '..........11....', // 0  club
    '.........111....', // 1
    '.........111....', // 2
    '....55...111....', // 3
    '...5555...11....', // 4  head + club
    '..355553.........', // 5  shoulders
    '..322223.........', // 6
    '..322223.........', // 7
    '..322223.........', // 8
    '...2222..........', // 9
    '...2222..........', // 10
    '...2222..........', // 11
    '...2222..........', // 12
    '...2222..........', // 13
    '...2222..........', // 14
    '...2222..........', // 15
    '....44...........', // 16
    '....44...........', // 17
    '...1111..........', // 18
    '...1111..........', // 19
    '...1111..........', // 20
    '...1111..........', // 21
    '....11...........', // 22
    '....11...........', // 23
  ]);

  return bases;
}

const BASES = makeBases();

const FACTIONS: Array<{ id: string; bodyChar: string }> = [
  { id: 'humans', bodyChar: '6' }, // water-deep (blue)
  { id: 'elves',  bodyChar: '2' }, // plains-shade (green)
  { id: 'orcs',   bodyChar: '5' }, // hills-shade (brown-red)
  { id: 'undead', bodyChar: 'c' }, // ui-stone-dark (gray-black)
];

export const UNIT_DEFS: readonly SpriteDef[] = (() => {
  const out: SpriteDef[] = [];
  for (const [baseName, baseDef] of Object.entries(BASES)) {
    const unitKind = baseName.replace('base.', '');
    for (const f of FACTIONS) {
      const key = `unit.${unitKind}.${f.id}`;
      out.push(tint(baseDef, key, f.bodyChar));
    }
  }
  return out;
})();
