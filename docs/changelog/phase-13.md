# Phase 13 — Authentic 16-Color Pixel Art

**Status:** Complete. 49 hand-coded pixel-art sprites shipped, the HUD
reskinned to chiseled-stone 1993 chrome, and the 16-color Warlords II
palette locked in via a typed registry. All 117 unit + e2e tests pass.

**Commits:**
- (see git log — single Phase 13 commit)

**Issue:** https://github.com/LegendaryLionMan/warlords2-clone/issues/8

## What this phase ships

A full visual rework of every in-game sprite + the HUD chrome to match
the 1993 Warlords II SVGA aesthetic:

- **`src/render/palette.ts`** — the 16-color Warlords II palette with
  named slots (`forest-deep`, `plains-shade`, `gold`, `ui-stone-dark`,
  etc.), a `paletteIndex()` lookup that throws on typos, a
  `nearestColorIndex()` for quantizing, and a `C` const map of named
  indices for sprite authors.
- **`src/render/pixel-art.ts`** — hand-authored sprite renderer with
  `decodePixels()`, `spriteToImageData()`, `spriteToCanvas()` (1× or
  N× nearest-neighbor), `BAYER_4X4` ordered-dither matrix,
  `applyBayerDither()`, and `quantizeToPalette()`.
- **`src/render/sprite-defs/`** — six modules, 49 hand-coded sprite
  defs total:
  - `terrain.ts` (5 tiles, 32×32 each) — recognizable tree clusters,
    snow-capped peaks, contour lines, wave dithers, grass tufts.
  - `features.ts` (3 icons) — gold mine, broken ruin, sword+shield
    armory.
  - `ui.ts` (4 icons, 16×16 each) — gold crosshair cursor, 4-bracket
    selection box, dithered cyan move highlight, dithered gold attack
    highlight.
  - `cities.ts` (5 fortresses, 32×40 each) — crenellated twin towers +
    central keep + faction banner; per-faction wall/keep/banner
    palettes.
  - `units.ts` (28 sprites = 7 kinds × 4 factions, 16×24 each) —
    militia, spearman, archer, knight, cavalry, wizard, giant; tinted
    per faction.
  - `heroes.ts` (4 portraits, 32×32 each) — face on stone-textured
    background with faction-colored collar.
- **`scripts/build-sprites.mjs`** — esbuild bundles the registry,
  decodes every def, renders to nearest-neighbor-scaled PNGs at the
  paths `GameScene` and the loader already use. Cache-busted via
  `?t=${Date.now()}` so the dev server picks up registry changes.
- **`public/assets/sprites/**`** — 49 PNGs at 4× logical size (e.g.
  terrain 32×32 → 128×128, cities 32×40 → 128×160, units 16×24 → 64×96).
- **`src/hud/hud.css`** — full rewrite to chiseled-stone 1993 style:
  - 16-color Warlords-II-aware CSS variables
  - 3D hard-edged bevels on every button (gold top/left, dark
    bottom/right, no rounded corners)
  - Press Start 2P bitmap font with Cinzel/VT323/Courier fallback
  - Stone-block dither pattern on the top bar
  - Faction badges in `.faction-badge.{faction}` class
  - Modal / dialog / outcome-flash styles for CombatScene and save
    slots
- **`src/render/procedural-sprites.ts`** — docstring updated to
  reflect that the new PNGs at the existing paths are the source of
  truth. The old Phaser Graphics fallback is now a safety net only
  (reached when `hasSprite` returns false, which won't happen with
  the new PNGs in place).

## Faithful-to-original decisions

- **16-color strict, no extension.** The 1993 base game is 16-color
  SVGA, not 256. (1995's *Warlords II Deluxe* bumped to 256; the
  clone targets the 1993 look.) Slot assignments come from the
  *Deluxe* manual's color-slot table.
- **Hand-coded pixel arrays** as hex strings in `*.ts` files
  (`.` = transparent, `0-F` = palette slot). Padded to logical size
  with transparent when fewer chars than `width × height`.
- **Per-faction tinting** of unit silhouettes via string-replace of
  the body slot index in the build, not a runtime palette swap.
  Simpler, deterministic, one sprite per (kind, faction) combo.
- **No smooth gradients.** Every HUD bevel is a 1-2px hard border.
  Every terrain transition uses 1-2 pixel dither, not a 256-color
  ramp.
- **Nearest-neighbor sampling** in `spriteToCanvas()` and in the
  browser's `image-rendering: pixelated` CSS — no anti-aliasing.
- **Cities at 32×40** (taller than wide for the fortress silhouette
  with banner on top). **Units at 16×24** (small board-game piece
  silhouettes). **Heroes at 32×32** with faction-colored collar.

## What this phase replaces

- **Phase 12's AI-painted-illustration sprites** at
  `public/assets/sprites/**`. The new pixel-art files share the same
  paths, so `GameScene` and the loader pick them up automatically
  with no code change beyond the new `src/render/{palette,pixel-art}.ts`
  and `src/render/sprite-defs/` modules.
- **Phase 12's Cinzel-serenade HUD CSS**. The new
  `src/hud/hud.css` is chiseled-stone, no smooth gradients, gold-leaf
  bevels, bitmap font.

## Limitations

- **Unit sprites are still small.** The 16×24 logical size scales to
  64×96 in the PNG, but the game displays them at `TILE_SIZE * 1.1`
  = ~35×53 on a 32-pixel tile. The body+face+legs design is
  recognizable but tight. A Phase 14 pass could enlarge to 24×36
  with wider silhouettes.
- **The bitmap font (Press Start 2P) loads from Google Fonts** and
  may not render in 2s of wait time in Playwright. The screenshots
  show the Cinzel serif fallback for the menu title. A Phase 14 pass
  should self-host the `.woff2`.
- **The menu title and faction cards still use Cinzel serif.** They
  look right in the chiseled HUD chrome but a Phase 14 pass could
  swap them to a serif pixel font.
- **Music and SFX are still missing** (carried over from Phase 12 —
  the matrix API couldn't handle the back-to-back batch generation
  when each track is several minutes long). Run
  `pwsh scripts/gen-music.ps1` when the API is healthier.

## Tests added

- **`src/render/palette.test.ts`** — 13 tests:
  - 16 entries, slots 0..15, no duplicates
  - Slot 0 is transparent, every entry has a named role
  - All RGB in [0, 255]
  - `paletteIndex` and `rgbForIndex` round-trips
  - `nearestColorIndex` finds the exact slot for known RGB
  - `C` constant map exposes the documented named roles
- **`src/render/pixel-art.test.ts`** — 22 tests (uses Node
  environment with a tiny `ImageData` shim, since jsdom's `ImageData`
  is incomplete):
  - `decodePixels` handles `.`/whitespace/case/length mismatch/bad
    chars
  - `spriteToImageData` produces right size + correct RGB for
    transparent + non-transparent slots
  - `BAYER_4X4` has 16 unique 0..15 entries
  - `applyBayerDither` mutates a flat-color image to a dithered
    pattern
  - **Registry sanity**: 5 terrain (32×32), 5 cities (32×40), 28 units
    (16×24), 4 heroes (32×32), 3 features, 4 UI — total 49
  - Every def decodes without error and renders to the right size
  - Every def only uses palette slots 0..15 (no out-of-range)
- **`tests/e2e/visual-fidelity.spec.ts`** — 52 tests:
  - **49 sprite-reachability tests** — `GET /assets/sprites/...` for
    every file in the registry must return 200 (catches the case
    where the build script was forgotten or the dev server cache is
    stale)
  - **3 screenshot-capture tests** — MenuScene, FactionScene, and
    GameScene saved to `docs/screenshots/phase-13-*.jpg`

## Verification

- `npm run lint` — clean
- `npm run typecheck` — clean
- `npm test` — **117/117 pass** (82 existing sim tests + 22 new
  pixel-art tests + 13 new palette tests)
- `npm run build:sprites` — 49/49 sprites written
- `npm run e2e -- visual-fidelity` — 52/52 pass; 49 sprite URLs
  reachable, 3 screenshots captured
- `npm run dev` — game launches at `http://localhost:5173/` with
  the new pixel art and chiseled HUD

## Files changed

### New
- `src/render/palette.ts`
- `src/render/pixel-art.ts`
- `src/render/sprite-defs/{terrain,features,ui,cities,units,heroes,index}.ts`
- `src/render/palette.test.ts`
- `src/render/pixel-art.test.ts`
- `tests/e2e/visual-fidelity.spec.ts`
- `scripts/build-sprites.mjs`
- `docs/visual-fidelity.md`
- `docs/changelog/phase-13.md` — this file

### Modified
- `src/render/procedural-sprites.ts` — docstring updated; the old
  Phaser Graphics code remains as a safety net
- `src/hud/hud.css` — full rewrite to chiseled-stone 1993 style
- `package.json` — added `build:sprites` script; `build` now
  depends on it
- `package-lock.json` — esbuild + pngjs dev deps recorded
- `.gitignore` — ignore the transient `.build-sprites-bundle.mjs`
  artifact

### Replaced
- `public/assets/sprites/**` — 49 PNGs (5 terrain, 5 cities, 3
  features, 28 units, 4 heroes, 4 UI chrome)
- 7 obsolete files removed by the build script
