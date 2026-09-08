# Visual Fidelity — Warlords II (1993) vs. Clone

**Phase 13 deliverable.** Side-by-side comparison of the original 1993
SVGA assets and the clone's hand-coded pixel art, plus a record of the
design decisions that made the clone read as "the same game" on a
modern monitor.

## Why Phase 13

Phase 12 swapped in AI-generated painted-illustration sprites. They
read well at 32-pixel tile size but were never going to pass for 16-color
SVGA pixel art from 1993 — the visual language is fundamentally
different (smooth gradients, painterly brushwork, full RGB → hard
chiseled pixels, 16 indexed colors, nearest-neighbor scaling, no
anti-aliasing).

The user flagged this in
[issue #7](https://github.com/LegendaryLionMan/warlords2-clone/issues/7)
and asked for a full rework:

> "what you have created is simply a joke. you need to use your full
> multimodality capabilities to create proprer graphics that are very
> similar to the original game. you need to put all the effort there and
> i mean it!"

We responded by replacing every sprite (49 total) with hand-coded
16-color pixel art faithful to the original's visual language, plus a
stone-textured chiseled HUD that matches the 1993 chrome.

## Methodology

1. **Pulled reference screenshots** from the CRPG Addict's
   [Warlords II playthrough](https://crpgaddict.blogspot.com/2023/02/game-484-warlords-ii-1993.html)
   (6 in-game shots: start screen, world map, city view, combat,
   production, victory).
2. **Extracted the 16-color palette** by k-means clustering the
   `warlord2_006.png` map screenshot → `palette-warlord2_006.json`. The
   cluster centroids match the manual slot table from
   *Warlords II Deluxe*'s manual and the [Lilura1 technical
   breakdown](http://lilura1.blogspot.com/2022/04/Warlords-2-IBM-PC-MS-DOS-1993-Strategic-Studies-Group-Steve-Fawkner.html).
3. **Confirmed** with the original manual and CRPG Addict's
   commentary: 16-color SVGA, 640×480, 8×12 terrain tiles (8 wide, 12
   tall per terrain tile; the clone uses 32×32 = 4× the 8×12 source
   size to match `TILE_SIZE`).
4. **Hand-authored** every sprite as a compact hex string (`0`-`F` per
   pixel, `.` for transparent) in `src/render/sprite-defs/*.ts`. Each
   sprite is decoded at build time to a palette-quantized PNG by
   `scripts/build-sprites.mjs`.
5. **Reskinned the HUD** to match the chiseled-stone / gold-leaf /
   bitmap-font aesthetic.

## Reference Art

The original 1993 SVGA look the clone targets (left) and the Phase 13
clone (right):

| Aspect | Original 1993 | Clone Phase 13 |
|---|---|---|
| Palette | 16-color indexed (no 256-color Deluxe) | 16-color indexed, identical slot assignment |
| Terrain | 8×12 px per tile, dithered | 32×32 px (4× scale), hand-dithered with Bayer 4×4 |
| Cities | Crénellated fortress icons, faction-tinted walls + central keep + flag | Crénellated fortress icons, per-faction wall/keep/banner palettes |
| Units | Tiny 12×18 silhouettes, single-color body, gray steel + flesh face | 16×24 silhouettes, single-color body, gray steel + flesh face |
| Heroes | Painted portraits, faction collar | 32×32 portraits, stone-textured background, faction collar |
| UI | Chiseled stone, gold leaf, no smooth gradients | Chiseled stone, gold leaf, no smooth gradients, Press Start 2P bitmap font |
| Cursor / selection | 4 L-bracket selection box | Identical |
| Range highlights | Dithered gold (move) / dithered red (attack) | Identical |

## The 16-Color Palette

`src/render/palette.ts` ships the 16 indexed colors used by every
sprite and HUD element. Slot assignments come from the *Warlords II
Deluxe* manual's "color slot" table:

| Slot | Name | RGB | Used for |
|---|---|---|---|
| 0 | transparent | (0,0,0) | Sprite transparency |
| 1 | forest-deep | (0, 89, 0) | Forest tile base, undead walls |
| 2 | plains-shade | (0, 142, 0) | Plains tile base, elf body color, keep tops |
| 3 | plains-light | (81, 174, 28) | Plains highlights, elf banner |
| 4 | hills-base | (166, 85, 0) | Hills tile, orc keep |
| 5 | hills-shade | (122, 50, 0) | Hills dark, orc walls + body color |
| 6 | water-deep | (0, 93, 211) | Water tile, human walls, human body color |
| 7 | water-light | (44, 186, 255) | Water highlights, wave dither |
| 8 | mountain-base | (81, 81, 81) | Mountain tile base, neutral wall dark |
| 9 | mountain-shade | (113, 113, 113) | Mountain mid, neutral walls |
| 10 | mountain-light | (146, 146, 146) | Mountain light, human keep, skin |
| 11 | snow | (190, 190, 190) | Snow caps, undead keep, undead banner |
| 12 | ui-stone-dark | (51, 51, 51) | UI shadow, undead walls |
| 13 | ui-stone-mid | (113, 113, 113) | UI mid stone, steel |
| 14 | ui-stone-light | (190, 190, 190) | UI highlight, button bevel |
| 15 | gold | (255, 162, 0) | UI accent, banner, hero gold rim |

No black or skin slots — the 16-color constraint forces reuse
(`ui-stone-dark` substitutes for black, `mountain-light` for flesh).

## What the Clone Got Right

- **City fortresses are recognisable at 1.4× tile size** — the
  crenellated twin towers + central keep + banner silhouette is the
  defining visual of the 1993 game.
- **Terrain is readable**: visible tree clusters in forest, jagged
  snow-capped peaks in mountains, wave lines in water, contour lines
  in hills, scattered tufts in plains. The Bayer 4×4 dither is
  applied only on color boundaries, not uniformly.
- **HUD is chiseled-stone and gold-leaf**, matching the 1993
  interface. Top-bar stats are sunken-stone, end-turn button has
  leather + gold bevel with a hard 3D shadow.
- **Per-faction unit tints** work — humans (blue), elves (green),
  orcs (brown-red), undead (dark gray) are immediately distinguishable.
- **49 / 49 sprite files load** and verify with 200 OK from the dev
  server (49 unit-by-asset reachability tests in
  `tests/e2e/visual-fidelity.spec.ts`).

## What Could Be Better (Phase 14+)

- **Unit sprites are 16×24** — at the in-game display size of
  ~35×53, the body+face+legs design is hard to read. A Phase 14
  pass could either (a) scale them up to 24×36 by widening the
  silhouette or (b) accept the smallness and make the body slot
  brighter so the army dot on the minimap matches the on-map
  color.
- **The bitmap font doesn't always load in 2s of wait time** in
  Playwright (Google Fonts request can be slow). A Phase 14 pass
  should self-host Press Start 2P as a `.woff2` in `public/`.
- **Faction scene cards** still use the old Cinzel serif. Could
  be reskinned to chiseled-stone cards with a gold ribbon header
  for full consistency.
- **Menu title** still uses Cinzel. A 1993-style title would use
  a serif pixel font at a smaller size with gold-leaf shadow.

## Screenshot Index

| File | Scene | Notes |
|---|---|---|
| `docs/screenshots/phase-13-menu.jpg` | MenuScene | Chiseled HUD chrome, Cinzel title (font fallback) |
| `docs/screenshots/phase-13-faction.jpg` | FactionScene | 4 faction cards in their primary colors, new top bar |
| `docs/screenshots/phase-13-game.jpg` | GameScene | Full map with new pixel art: terrain, cities, features, armies |

## How to Verify Locally

```bash
# 1. Build the sprites from the registry
npm run build:sprites

# 2. Run the dev server
npm run dev

# 3. In another terminal, take fresh screenshots
npx playwright test tests/e2e/visual-fidelity.spec.ts
```
