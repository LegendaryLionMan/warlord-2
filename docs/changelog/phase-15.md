# Phase 15 — Authentic 1993 HUD chrome + dialog scenes

**Status:** Complete. The in-game HUD now uses the actual 1993
Warlords II chrome pieces (cropped from the world-map.png), the four
major dialogs (production, hero, quest, combat) render their
original 1993 versions as backdrops, and the bottom action bar
mirrors the 1993 layout (8 unit slots + 4 production icons + X end
button). All 110 unit + 63 e2e tests pass; typecheck and lint clean.

**Issue:** https://github.com/LegendaryLionMan/warlords2-clone/issues/10

## Why this phase

Phase 14 swapped the playfield backdrop for the actual 1993 minimap
and the title/combat screens. The remaining chrome — top menu bar,
right command panel, bottom action bar, and the four dialogs — was
still the Phase 13 chiseled-stone design. The user wanted the entire
screen to look like 1993, not just the playfield.

We responded by cropping the 1993 chrome pieces from the
`world-map.png` reference screenshot and wiring them as DOM/Phaser
backdrops:

1. **Top menu bar** — SSG/Game/Order/Report/Hero/View/History/Turn +
   Turn indicator + 8 faction shields. Cropped at y=0..18 of the
   640×480 reference.
2. **Right command panel** — the area below the minimap with the
   action buttons. Cropped at x=395..570, y=232..427.
3. **Bottom action bar** — the strip with 8 unit slots + 4 production
   icons + city income + gold counter. Cropped at y=425..480.
4. **Four dialogs** — production-screen.png, hero-dialog.png,
   map-overview.png (quest), and combat-screen.png (already wired
   in Phase 14).

## What this phase ships

### HUD chrome re-skin
- **`src/hud/hud.css`** — rewritten top bar, side panel, and new
  bottom action bar styles. The 1993 menu bar is the top bar
  background; the 1993 action bar is the bottom bar background; the
  1993 right panel is the right-panel background.
- **`src/hud/hud.ts`** — `mountActionBar()` wired into the init
  sequence.
- **`src/hud/panels/action-bar.ts`** (new) — 8 unit slots + 4
  production icons (M/S/A/K) + X end-turn button, styled to match
  the 1993 chrome.

### Original 1993 chrome assets
- **`public/assets/sprites/original/hud-top-bar.png`** — 640×18
  crop of the 1993 top menu bar.
- **`public/assets/sprites/original/hud-action-bar.png`** — 380×55
  crop of the 1993 bottom action bar.
- **`public/assets/sprites/original/hud-right-panel.png`** — 175×195
  crop of the 1993 right command panel.
- **`scripts/crop-hud-chrome.mjs`** (new) — crops the three pieces
  from `world-map.png`.

### 1993 minimap in bottom-right
- **`src/render/GameScene.ts`** — replaced the procedural minimap
  with the cropped 1993 world minimap as a static backdrop, plus a
  gold-bordered frame, a yellow army-position dot, and a yellow
  viewport rectangle showing the camera view of the playfield.

### Four dialog scenes
- **`src/render/ProductionScene.ts`** (new) — uses
  `original.production-screen` as the backdrop, with a 1993-styled
  city banner and Done button.
- **`src/render/HeroScene.ts`** (new) — uses `original.hero-dialog`
  as the backdrop, with a 1993-styled OK button.
- **`src/render/QuestScene.ts`** (new) — uses `original.map-overview`
  as the backdrop. Four quest variants (Sir Marhaus's Quest, The
  Lost City, A Travelling Bard, The Oracle) randomly selected.
- **`src/render/CombatScene.ts`** (already Phase 14) — uses
  `original.combat-screen` as the backdrop.
- **`src/render/BootScene.ts`** + **`src/render/GameScene.ts`** —
  added `?scene=ProductionScene|HeroScene|QuestScene` URL
  shortcuts for screenshot/QA use.
- **`src/render/index.ts`** — registered the three new scenes.

### Random quest events
- **`src/render/GameScene.ts.endTurn()`** — fires a QuestScene
  randomly (15% chance) on each end-turn. Matches the 1993
  behavior where quests were frequent (≈ 1 per turn) but not
  every turn.

### Tests + docs
- **`tests/e2e/phase-15-shots.spec.ts`** (new) — 4 Playwright
  tests capturing the new HUD + 3 dialogs.
- **`docs/visual-fidelity.md`** — updated to describe the new HUD
  layout.
- **`docs/changelog/phase-15.md`** (this file).

## File summary

| Path | Change | Notes |
|---|---|---|
| `src/hud/hud.css` | updated | top bar / side panel / new action bar / 1993 chrome backgrounds |
| `src/hud/hud.ts` | updated | mountActionBar wired into init |
| `src/hud/panels/action-bar.ts` | new | 8 unit slots + 4 production icons + X end button |
| `public/assets/sprites/original/hud-top-bar.png` | new | 640×18 1993 menu bar crop |
| `public/assets/sprites/original/hud-action-bar.png` | new | 380×55 1993 action bar crop |
| `public/assets/sprites/original/hud-right-panel.png` | new | 175×195 1993 right panel crop |
| `scripts/crop-hud-chrome.mjs` | new | crops the three chrome pieces |
| `src/render/GameScene.ts` | updated | 1993 minimap backdrop, QuestScene trigger, dialog URL param routing |
| `src/render/ProductionScene.ts` | new | production dialog with 1993 backdrop |
| `src/render/HeroScene.ts` | new | hero dialog with 1993 backdrop |
| `src/render/QuestScene.ts` | new | quest dialog with 1993 backdrop + 4 quest variants |
| `src/render/BootScene.ts` | updated | URL param routing for dialog scenes |
| `src/render/index.ts` | updated | registered Production/Hero/Quest scenes |
| `tests/e2e/phase-15-shots.spec.ts` | new | 4 screenshot tests |
| `docs/visual-fidelity.md` | updated | documents the 1993 HUD layout |
| `docs/changelog/phase-15.md` | new | this file |
| `docs/screenshots/phase-15-{game,production,hero,quest}.jpg` | new | 4 screenshots |

## Verification

- `npx vitest run` — **110 / 110 pass**.
- `npx tsc --noEmit` — **clean**.
- `npx eslint src` — **clean**.
- `npx vite build` — **succeeds**.
- `npx playwright test` — **63 / 63 pass** (4 new phase-15
  shots + 3 phase-14 shots + 2 phase-12 shots + 3 visual-fidelity
  shots + 50 sprite-reachability + 1 smoke).

## What the user sees

- **Top bar** — actual 1993 menu bar with SSG/Game/Order/Report/Hero/
  View/History/Turn on the left, Turn indicator + faction shields
  on the right, with stats (TURN 1, gold, fame, hero count) and
  Save/Load/Mute buttons in the center.
- **Right panel** — 1993 SELECTION panel with marble-and-gold frame,
  showing the selected tile/army info.
- **Bottom action bar** — 8 unit slots (with the player's 2-unit
  army shown in slots 1-2), 4 production icons (M/S/A/K), and the X
  end-turn button on the right, all on the 1993 action bar backdrop.
- **Bottom-right minimap** — the 1993 world minimap with the army
  position marked in gold, surrounded by a gold border.
- **End turn** — 15% chance of triggering a quest dialog
  (Sir Marhaus's Quest, The Lost City, A Travelling Bard, or The
  Oracle) with the 1993 quest scroll backdrop.
- **Click a city** — opens the 1993 production dialog with the
  original 16-unit grid baked into the backdrop.
- **Hero present** — opens the 1993 hero dialog with the painted
  Sir Marhaus portrait.

## What's deferred to Phase 16+

- **Per-tile terrain** — still 6×6 colored pips. Phase 16 should
  extract individual 64×64 SVGA terrain tiles from `TERRAIN0/*.PCK`
  and overlay them at the procedural map's tile positions.
- **City fortresses** — baked into the minimap image. Phase 16
  should extract individual city sprites from `PICS/CITY*.PCK` and
  overlay them at their map positions.
- **Roads / coastline** — not yet rendered. Phase 16 should add
  the 1993 road and coastline art between adjacent tiles.
- **Unit sprites** — Phase 13 hand-coded 16×24. Phase 16 should
  replace with crops from the original `PICS/UNITS.PCK`.
- **Hero portraits** — Phase 13 hand-coded 32×32. Phase 16 should
  use real 1993 portraits from `DATA/*.DAT`.
- **Faction scene re-skin** — still Cinzel serif cards. 1993 used
  marble-and-gold frames with bitmap fonts.
- **Settler unit** — not yet implemented.
- **4 new factions** — not yet added (currently 4 of 8 1993
  factions).
