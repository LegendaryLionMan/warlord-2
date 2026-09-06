# Phase 1 — Map

> Released: 2026-09-06.

## What shipped

### `src/sim/map.ts` (new)

* `generateMap(state, seed)` — populates `state.map[y][x] = { terrain, variation }`.
* `mulberry32(seed)` — deterministic PRNG so the same seed produces the same map.
* `pickTerrain(x, y, w, h, rand)` — distance-from-center water bias on map edges, uniform random otherwise.
* `punchLakes(state, rand, count)` — clears some water tiles so impassable clusters form lakes, not seas.
* `isPassable(state, x, y)` and `tileAt(state, x, y)` — passability + safe accessors.

### `src/render/GameScene.ts` (rewritten)

* Renders all 32×32 tiles as colored rectangles with thin edges.
* Wheel zoom (0.5×–2×, clamped).
* Middle-drag pan.
* Left-click selects a tile; HUD side panel shows terrain name + coords.
* Minimap in the bottom-right corner (160×120 with gold border).
* `selectionRect` is the gold highlight that follows the selected tile.

### `src/sim/map.test.ts` (new)

* 9 unit tests covering PRNG determinism, grid population, terrain proportions, determinism, `tileAt` bounds, and `isPassable` per terrain.
* Combined with `state.test.ts` we have 15 passing tests.

### `src/hud/store.ts` (extended)

* `HudSnapshot` now has `selectedTerrain` and `selectedXY` so the side panel can show what's clicked.
* Side panel updates from "Click on a city or army" → "Click on a city, army, or tile".

### `src/render/BootScene.ts` (extended)

* New `?scene=GameScene&faction=humans` URL param skips the menu and starts in-game. Useful for QA screenshots and tests.

### `src/main.ts` (extended)

* `initHud()` is now called in `main.ts` so the HUD persists across all scenes (was previously only initialized in the menu).

### Docs

* `docs/gameplay-fidelity.md` — new file mapping map/terrain features to the 1993 original.
* `docs/screenshots/phase-1-map.jpg` — captured in-game view.

## What still needs to land

* **Roads** — terrain table extension.
* **Cities** — placement and rendering. Phase 4.
* **Armies** — Phase 2.
* **Sprite art for tiles** — Phase 9.

## Acceptance

- ✅ `npm run typecheck` clean.
- ✅ `npm test` — 15/15 passing (6 in `state.test.ts`, 9 in `map.test.ts`).
- ✅ `npm run dev` shows the procedurally generated map.
- ✅ Wheel zooms in/out within 0.5×–2×.
- ✅ Middle-drag pans the camera.
- ✅ Left-click selects a tile; side panel updates.
- ✅ Minimap renders in the bottom-right.
- ✅ `docs/gameplay-fidelity.md` written.
- ✅ `docs/screenshots/phase-1-map.jpg` committed.

## Next: Phase 2 — Movement

The next phase adds the player army, BFS movement range, and click-to-move.
