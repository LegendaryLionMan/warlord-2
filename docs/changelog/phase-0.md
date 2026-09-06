# Phase 0 — Foundation

> Released: 2026-09-06.

## What shipped

### Tooling

* **Vite 5** + **TypeScript 5** + **ESLint 8** + **Prettier 3** — dev
  server, type checking, lint, and formatting wired up.
* **Vitest 2** for unit tests. **Playwright 1.48** for E2E.
* **`npm run`** scripts: `dev`, `build`, `preview`, `test`, `typecheck`,
  `lint`, `format`, `e2e`.

### Project structure

* `src/sim/` — `state.ts` with `GameState` types and `createInitialState()`.
  Unit-tested.
* `src/data/` — `units.ts`, `factions.ts`, `heroes.ts`, `terrain.ts`,
  `manifests.ts`. Pure data, no logic.
* `src/render/` — `BootScene`, `MenuScene`, `FactionScene`, `GameScene`,
  `CombatScene`. Phaser 3.86.
* `src/hud/` — DOM HUD layer with `top-bar`, `side-panel`, `message-box`.
* `src/input/` — `actions.ts` + `keymap.ts`. Single source for input mapping.
* `src/save/` — `serialize.ts` + `storage.ts` stubs. localStorage adapter
  ready, not yet wired to game flow.
* `src/debug/` — `dev-menu.ts`, `perf.ts`. URL-flag-gated.
* `tests/e2e/smoke.spec.ts` — Playwright smoke test.
* `docs/` — `architecture.md`, `visual-fidelity.md`, this changelog.

### Game scenes

* **Main menu** with the "WARLORDS II" title and a "New Game" button.
* **Faction select** with 4 cards (Humans, Elves, Orcs, Undead), each
  showing name, tagline, description, and a clickable area.
* **Game scene** placeholder — dark canvas, "coming in Phase 1" notice,
  faction echo. HUD scaffold visible.
* **Combat scene** placeholder — modal overlay, "Continue" button.

### HUD

* Top bar: turn counter, gold, cities, armies, end-turn button.
* Side panel: "Click on a city or army" placeholder.
* Message box: transient notifications, 3.5 s auto-hide.

### Documentation

* `README.md` v1 with quick start, project description, link to docs.
* `docs/architecture.md` — module boundaries, state ownership rules.
* `docs/visual-fidelity.md` — sprite, tile, UI, audio standards.
* `docs/changelog/phase-0.md` — this file.

## What's not yet wired

These are stubs that the next phases will fill in:

* `src/sim/map.ts` — procedural map generation (Phase 1).
* `src/sim/combat.ts` — combat resolution (Phase 3).
* `src/sim/turn.ts` — end-of-turn effects (Phase 4).
* `src/render/GameScene.ts` — real map rendering (Phase 1).
* Sprite art for units, terrain, cities, heroes (Phase 9).
* Audio assets (Phase 9).
* Save / load (Phase 8).

## Next: Phase 1 — Map

Phase 1 adds:

* `src/sim/map.ts` — procedural map generation with terrain noise.
* Phaser tile rendering in `GameScene`.
* Camera pan (middle-drag) and zoom (scroll wheel).
* Click-to-select tile.
* `docs/gameplay-fidelity.md` mapping the terrain section to the 1993 game.

## Acceptance

* ✅ `npm install && npm run dev` boots Vite on `localhost:5173`.
* ✅ Phaser canvas shows main menu with title and "New Game" button.
* ✅ Faction select renders 4 cards.
* ✅ HUD scaffold renders (top bar, side panel, end-turn button).
* ✅ `npm test` passes (`sim/state.test.ts`).
* ✅ `npm run typecheck` and `npm run lint` pass clean.
* ✅ `npm run build` produces a deployable `dist/`.
* ✅ All Phase 0 docs and changelog committed.
* ✅ `docs/screenshots/phase-0-menu.jpg` and `phase-0-faction-select.jpg` captured.
