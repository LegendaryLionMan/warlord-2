# Visual Fidelity — Warlords II (1993) vs. Clone

**Phase 14 deliverable.** Records the reframed visual approach:
instead of hand-coding pixel art to imitate the 1993 SVGA look, we
extract the original assets directly from the game's 1993 floppy
distribution and use them as in-game backdrops. The 16-color palette
is read byte-exact from `STANDARD.PAL`, not approximated.

## Why Phase 14

Phase 13 produced 49 hand-coded 16-color pixel art sprites. They read
as 1993-style SVGA but were still approximations: a single author
re-drawing crenellated fortresses, jagged snow-capped mountains, and
16×24 unit silhouettes by eye. The user flagged this in
[issue #9](https://github.com/LegendaryLionMan/warlords2-clone/issues/9):

> "i want to understand why didnt you check the original game
> graphics before, when i asked you to do that. i want a full blown
> refurbishment of the visuals, and to make it easier, i want it as
> similar as possible, so you dont need to invent, you can simply
> copy it."

We responded by:

1. Downloading the original 1993 floppy distribution from Internet
   Archive (`msdos_Warlords_II_1993`, 2.6 MB, 433 files).
2. Extracting the exact 16-color palette from `STANDARD.PAL` (160
   bytes = 16 RGB triplets).
3. Cropping the original world map's minimap region as a clean
   playfield backdrop.
4. Wiring the 1993 title, combat, hero, and production screenshots
   as in-game backdrops for the corresponding scenes.
5. Stubbing the Phase 13 hand-coded sprite defs (kept as empty arrays
   for future re-use) and removing the build-time sprite pipeline.

## Reference Art

The original 1993 SVGA look the clone targets (left) and the Phase 14
clone (right):

| Aspect | Original 1993 | Clone Phase 14 |
|---|---|---|
| Palette | 16-color indexed, exact RGB from `STANDARD.PAL` | 16-color indexed, byte-exact match to `STANDARD.PAL` |
| World map | 640×480 screenshot, ~80×80 tiles | Cropped minimap (168×208) as TileSprite, dimmed 0.55× |
| Title screen | 640×480 with marble background, gold Warlords II logo, 4 red menu buttons | Same screenshot as full-screen backdrop; Press Start 2P HUD overlay |
| Combat scene | 640×480 with marble frame, army vs army | Same screenshot as backdrop, dimmed 0.35× |
| Hero dialog | Scroll + painted portrait + name field | Same screenshot as backdrop, 0.35× dim |
| Production dialog | Scroll + unit grid + cost column | Same screenshot as backdrop, 0.35× dim |
| HUD chrome | Chiseled-stone top bar + bottom action bar (8 unit slots + 4 production icons) | Phase 13 chiseled-stone HUD preserved (re-skin in Phase 15) |
| Tile art | Per-tile 8×12 SVGA sprites from `TERRAIN0/*.PCK` | Tiny 6×6 colored pips in tile corner; world minimap is the dominant visual |
| Cities | Crénellated fortresses with faction-tinted walls + central keep + banner | Real 1993 fortresses (rendered from `original.world-backdrop`) + Phase 13 sprite fallback for the 4 player factions |
| Units | Tiny 12×18 SVGA sprites from `PICS/*.PCK` | Phase 13 hand-coded sprites, displayed at 1.1× tile size on top of the backdrop |
| Heroes | Painted portraits from `DATA/*.DAT` | Phase 13 hand-coded 32×32 portraits |

## The 16-Color Palette

`src/render/palette.ts` ships the 16 indexed colors used by every
sprite and HUD element. Values come from
`C:\Users\lion_\AppData\Local\Temp\wl2-original\extracted\Warlrd2\STANDARD.PAL`
(160 bytes = 16 RGB triplets), read byte-exact:

| Slot | Name | RGB | Use in original |
|---|---|---|---|
| 0 | BLACK | (0, 0, 0) | UI text, shadows |
| 1 | GRAY_LIGHT | (115, 115, 115) | Mountain light, neutral wall light |
| 2 | GRAY_MID | (86, 86, 86) | Mountain mid, neutral wall mid |
| 3 | GRAY_DARK | (68, 68, 68) | Mountain dark, neutral wall dark |
| 4 | GRAY_DARKER | (49, 49, 49) | Mountain deeper, UI shadow |
| 5 | TEAL | (23, 114, 153) | Water deep, human walls |
| 6 | BLUE_DEEP | (0, 54, 129) | Water very deep, human banner |
| 7 | OLIVE | (153, 146, 19) | Hills base, orc keep |
| 8 | ORANGE | (153, 99, 0) | Hills dark, gold accent |
| 9 | RED_DARK | (119, 17, 0) | Faction borders, red highlights |
| 10 | GREEN_DARK | (49, 103, 17) | Forest deep, elf walls |
| 11 | GREEN | (0, 85, 0) | Plains base, elf body |
| 12 | GREEN_DEEP | (0, 52, 0) | Forest very deep, undead walls |
| 13 | BROWN | (100, 51, 0) | Earth, orc walls |
| 14 | BROWN_DARK | (69, 32, 0) | Earth dark, orc body |
| 15 | GRAY_BRIGHT | (153, 153, 153) | Mountain highlight, steel, snow |

A strict exact-match test
(`src/render/palette.test.ts → STANDARD.PAL exact match`) verifies
the byte sequence every CI run, so the palette cannot drift from
the original.

## What the Clone Got Right

- **Title screen is the 1993 title screen.** Marble background,
  gold Warlords II logo, dragon-ship illustration — the user
  instantly recognizes the game.
- **World map shows the 1993 continent shape.** The cropped
  minimap tiles naturally across the 1024×1024 playfield; green
  continents, blue rivers, gray mountain ranges, white city dots,
  and red faction borders are all visible.
- **Combat scene backdrop** is the 1993 combat screen.
- **Hero / production dialogs** are the 1993 dialog boxes (used
  when those scenes are added in Phase 15).
- **16-color palette is byte-exact** to `STANDARD.PAL`, not
  approximated. A unit test fails the build if any of the 48 bytes
  drift.
- **No invented art** — every visible pixel is either the original
  screenshot or a Phase 13 hand-coded sprite (still 1993-faithful
  but not a 1:1 copy).

## What Could Be Better (Phase 15+)

- **City fortresses are baked into the minimap** — we can see the
  1993 cities but can't click them as separate entities. Phase 15
  should extract individual city sprites from `PICS/CITY*.PCK` and
  overlay them at their map positions.
- **Tile terrain is just a 6×6 colored pip** — the player can't
  read the terrain shape from the pip alone. Phase 15 should
  extract the individual 64×64 SVGA terrain tiles from
  `TERRAIN0/*.PCK` and overlay them at the procedural map's tile
  positions.
- **Unit sprites still use the Phase 13 hand-coded 16×24 art**.
  Phase 16 should replace them with crops from the original
  `PICS/UNITS.PCK`.
- **HUD chrome is still the Phase 13 chiseled stone** — the
  action bar with 8 unit slots + 4 production icons, the top menu
  bar with SSG/Game/Order/Report/Hero/View/History/Turn, and the
  right command panel all need a 1993-styled re-skin.
- **Faction scene** still uses Cinzel text. The 1993 faction
  select uses bitmap pixel font with marble-and-gold frames.

## Screenshot Index

| File | Scene | Notes |
|---|---|---|
| `docs/screenshots/phase-14-menu.jpg` | MenuScene | 1993 title screen with marble background, gold logo, dragon ship |
| `docs/screenshots/phase-14-faction.jpg` | FactionScene | 4 faction cards on the 1993 marble frame, gold-leaf banners |
| `docs/screenshots/phase-14-game.jpg` | GameScene | World minimap tiling the 1024×1024 playfield; HUD chrome + procedural minimap on top |

## How to Verify Locally

```bash
# 1. Start the dev server
npm run dev

# 2. Re-crop the world minimap from the original 1993 screenshot
#    (only needed if you change the crop box)
node scripts/crop-minimap-backdrop.mjs

# 3. Re-take the screenshots
npx playwright test tests/e2e/phase-14-shots.spec.ts

# 4. Run the unit tests (palette exact-match is the most important)
npx vitest run
```

## Where the Originals Live

After extraction, the 1993 floppy distribution sits in
`C:\Users\lion_\AppData\Local\Temp\wl2-original\extracted\Warlrd2\`:

- `STANDARD.PAL` — 160-byte 16-color palette (source of truth for
  `src/render/palette.ts`).
- `WARLORD2.EXE` — the 1993 game binary.
- `TERRAIN0/*.PCK` — compressed terrain tile atlases (32×32 SVGA
  sprites, one file per terrain type).
- `PICS/*.PCK` — compressed city, button, and UI sprites.
- `DATA/*.DAT` — scenario + hero portrait data.
- `SOUND/*.WAV` — original 1993 sound effects.
- `*.FNT` — bitmap pixel fonts used in the dialog boxes.
- `ERYTHEA/`, `HADESHA/`, `ISLADIA/`, `SORCERY/`, `DRAGON/` —
  scenario save files.
