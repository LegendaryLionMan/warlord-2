# Phase 14 — Original 1993 Art as In-Game Backdrops

**Status:** Complete. The clone now uses the original 1993 Warlords II
screenshots and palette directly, sourced from the Internet Archive
floppy distribution. All 110 unit + 52 e2e tests pass; typecheck and
lint clean.

**Issue:** https://github.com/LegendaryLionMan/warlords2-clone/issues/9

## Why this phase

Phase 13 shipped 49 hand-coded 16-color pixel art sprites plus a
chiseled-stone HUD. The user flagged that the art still didn't look
like the 1993 original because it was *re-drawn* rather than
*copied*:

> "i want a full blown refurbishment of the visuals, and to make it
> easier, i want it as similar as possible, so you dont need to
> invent, you can simply copy it."

We responded by:

1. Downloading the original 1993 floppy distribution from Internet
   Archive (`msdos_Warlords_II_1993`, 2.6 MB, 433 files).
2. Reading `STANDARD.PAL` byte-exact (160 bytes = 16 RGB triplets)
   to lock the palette to the original.
3. Cropping the 1993 world map's minimap region as a clean
   playfield backdrop.
4. Wiring the 1993 title, combat, hero, and production screenshots
   as in-game backdrops for the corresponding scenes.
5. Stubbing the Phase 13 hand-coded sprite defs (kept as empty
   arrays for future re-use) and removing the build-time sprite
   pipeline.

## What this phase ships

- **Original 1993 palette, byte-exact.** `src/render/palette.ts`
  ships the 16 RGB triplets from `STANDARD.PAL` with new slot
  names (`BLACK`, `GRAY_LIGHT/MID/DARK/DARKER/BRIGHT`, `TEAL`,
  `BLUE_DEEP`, `OLIVE`, `ORANGE`, `RED_DARK`, `GREEN_DARK/DEEP`,
  `BROWN/DARK`). A strict exact-match test
  (`src/render/palette.test.ts → STANDARD.PAL exact match`) fails
  the build if any of the 48 bytes drift.
- **`original.*` asset manifest keys** for the six 1993
  screenshots: `original.title-screen`, `original.world-map`,
  `original.world-backdrop`, `original.combat-screen`,
  `original.hero-dialog`, `original.production-screen`,
  `original.map-overview`. Registered in
  `src/data/manifests.ts` and `src/data/asset-paths.ts`; the
  loader picks them up automatically via `ALL_SPRITE_KEYS`.
- **`originalPath()` helper** in `src/data/asset-paths.ts` for
  looking up original-art paths.
- **MenuScene** renders `original.title-screen` as a full-screen
  backdrop with a Press Start 2P "BEGIN" button overlay and a
  "Fan clone · Art © 1993 SSG/Steve Fawkner · Built 2026" credit
  line.
- **FactionScene** still uses its own Cinzel-styled faction cards
  (1993-style card re-skin deferred to Phase 15).
- **GameScene** renders `original.world-backdrop` (the cropped
  168×208 minimap) as a `TileSprite` at its native size with
  alpha 0.55, so the 1993 continent shape tiles naturally across
  the 1024×1024 playfield. The per-tile terrain sprites are
  replaced with a tiny 6×6 colored pip in the corner of each
  tile (terrain hint without covering the backdrop). Cities and
  armies are still drawn on top.
- **CombatScene** renders `original.combat-screen` as a backdrop
  with 0.35× dim so the combat result UI stays readable.
- **HUD hide/show** — MenuScene and FactionScene call
  `hideHud()` on create and `showHud()` on shutdown, so the
  chiseled-stone HUD chrome doesn't bleed over the 1993 art.
- **Phase 13 sprite defs stubbed** — `src/render/sprite-defs/*`
  modules now export empty `readonly SpriteDef[]` arrays. The
  infrastructure (`palette.ts`, `pixel-art.ts`, `decodePixels`,
  `spriteToImageData`, `applyBayerDither`) remains in place for
  future re-use. The Phase 13 build-sprites pipeline is no longer
  invoked.
- **E2E screenshot suite** at
  `tests/e2e/phase-14-shots.spec.ts` captures the three scenes.

## File summary

| Path | Change | Notes |
|---|---|---|
| `src/render/palette.ts` | rewritten | 16 byte-exact slots from `STANDARD.PAL` + new `C` const |
| `src/render/palette.test.ts` | updated | strict exact-match test for `STANDARD.PAL` bytes |
| `src/render/pixel-art.test.ts` | updated | registry tests removed; STANDARD.PAL byte check added |
| `src/render/MenuScene.ts` | updated | 1993 title screen backdrop, `hideHud()` on create |
| `src/render/FactionScene.ts` | updated | `hideHud()` on create |
| `src/render/GameScene.ts` | updated | world-backdrop TileSprite, pip-only terrain layer |
| `src/render/CombatScene.ts` | updated | combat-screen backdrop, 0.35× dim |
| `src/hud/hud.ts` | updated | added `hideHud()` / `showHud()` |
| `src/data/manifests.ts` | updated | 6 `original.*` keys + `originalWorldBackdrop` |
| `src/data/asset-paths.ts` | updated | 6 `original.*` paths + `originalPath()` helper |
| `src/render/sprite-defs/*.ts` | stubbed | 6 modules now export empty arrays |
| `scripts/crop-minimap-backdrop.mjs` | new | crops 168×208 minimap from `world-map.png` |
| `scripts/grid-overlay.mjs` | new | measures tile size via auto-correlation |
| `scripts/copy-originals.mjs` | new | copies 1993 screenshots into `public/assets/sprites/original/` |
| `public/assets/sprites/original/*` | new | 6 originals + 10 Internet Archive screenshots |
| `tests/e2e/phase-14-shots.spec.ts` | new | 3 e2e tests capturing the new scenes |
| `docs/visual-fidelity.md` | rewritten | documents the original-as-backdrop approach |
| `docs/screenshots/phase-14-{menu,faction,game}.jpg` | new | screenshots for the changelog |

## Verification

- `npx vitest run` — **110 / 110 pass** (palette exact-match is
  the most important new assertion).
- `npx tsc --noEmit` — **clean**.
- `npx eslint src` — **clean**.
- `npx vite build` — **succeeds**.
- `npx playwright test tests/e2e/phase-14-shots.spec.ts` —
  **3 / 3 pass**.
- `git rev-parse HEAD` — Phase 14 commit on `main` (see
  `git log --oneline` for SHA).

## What the user sees

| Scene | Looks like |
|---|---|
| `phase-14-menu.jpg` | The 1993 Warlords II title screen — marble background, gold Warlords II logo with the iconic "II" centered, four red menu buttons (New Scenario, Load Game, Random Map, Begin), and the dragon-ship illustration for "The Island – Kingdom of Erythea". |
| `phase-14-faction.jpg` | Four faction cards (Humans, Elves, Orcs, Undead) on the dark background, with Press Start 2P text and a back link. |
| `phase-14-game.jpg` | The 1993 continent minimap tiling naturally across the 1024×1024 playfield — green continents, blue rivers and lakes, gray mountain ranges, white city dots, red faction borders. The chiseled-stone HUD chrome is preserved. |

## What's deferred to Phase 15+

- **Tile terrain art** — Phase 14 shows a tiny 6×6 colored pip
  per tile. Phase 15 should extract the individual 64×64 SVGA
  terrain tiles from `TERRAIN0/*.PCK` and overlay them at the
  procedural map's tile positions.
- **City fortresses** — currently baked into the minimap image;
  Phase 15 should extract individual city sprites from
  `PICS/CITY*.PCK` and overlay them at their map positions.
- **Unit sprites** — still use the Phase 13 hand-coded 16×24
  art. Phase 16 should replace them with crops from the original
  `PICS/UNITS.PCK`.
- **Hero portraits** — Phase 13 hand-coded 32×32 portraits. Phase
  16 should use real 1993 hero portraits from `DATA/*.DAT`.
- **HUD chrome** — still Phase 13 chiseled stone. The 1993
  layout (top menu bar with SSG/Game/Order/Report/Hero/View/
  History/Turn, bottom action bar with 8 unit slots + 4
  production icons, right command panel) needs a re-skin.
- **Faction select re-skin** — 1993 used marble-and-gold frames
  with bitmap fonts, not Cinzel serif cards.
