# Architecture

> Last updated: Phase 0 (Foundation).

The project follows the **simulation / render split** rule from
[`game-studio:web-game-foundations`](https://github.com): state and rules
live in pure TypeScript modules under `src/sim/`, and Phaser scenes under
`src/render/` read that state and emit input actions back. The DOM HUD
(`src/hud/`) sits on top of the canvas, never inside it.

## Module boundaries

```
                    ┌──────────────────┐
                    │  src/data/       │   pure data: unit templates,
                    │  (units, factions│   faction bonuses, hero
                    │   heroes, terrain│   abilities, terrain table,
                    │   manifests)     │   asset manifest keys
                    └────────┬─────────┘
                             │ imports
                             ▼
┌─────────────┐  mutates  ┌──────────────┐  reads   ┌──────────────┐
│  Player     │ ────────► │  src/sim/    │ ◄─────── │ src/render/  │
│  input      │           │  state + rules│          │ Phaser scenes│
└─────────────┘           └──────┬───────┘          └──────┬───────┘
                                │ snapshot                  │ emits
                                ▼                          ▼
                          ┌──────────────┐          ┌──────────────┐
                          │ src/hud/     │ ◄────────│  DOM panels  │
                          │ store        │          │ top-bar, etc │
                          └──────────────┘          └──────────────┘
```

### `src/sim/` — pure simulation

* No Phaser imports. No DOM imports.
* `state.ts` defines the `GameState` type and `createInitialState()` factory.
* Future phases add `map.ts`, `combat.ts`, `ai.ts`, etc.
* The sim is the **only** module allowed to mutate `GameState`.
* Unit tests live next to source (`*.test.ts`) and run under Vitest.

### `src/render/` — Phaser scenes

* Five scenes: `BootScene`, `MenuScene`, `FactionScene`, `GameScene`, `CombatScene`.
* Each scene reads `GameState` (passed in via init) and emits Phaser events.
* Scenes never reach into DOM directly; the HUD owns that layer.
* `pixelArt: true` and `antialias: false` for crisp sprite rendering.

### `src/hud/` — DOM HUD

* Vanilla TypeScript. No framework. CSS variables for theming.
* `hud.ts` is the controller. `store.ts` is the HUD-readable mirror.
* Panels (`top-bar`, `side-panel`, `message-box`) subscribe to the store.
* The HUD never mutates `GameState`.

### `src/data/` — static data

* `units.ts`, `factions.ts`, `heroes.ts`, `terrain.ts`, `manifests.ts`.
* Pure data, no logic. The sim imports from here; the renderer imports for visuals.

### `src/input/` — action names + keymap

* Every player intent is an `Action` from `actions.ts`.
* `keymap.ts` is the one place that maps Phaser key codes / mouse buttons to actions.

### `src/save/` — JSON serialization

* `serialize.ts` converts `GameState` to a `SerializedSave` (versioned).
* `storage.ts` is the localStorage adapter. Phase 8 wires this into the menu.

### `src/debug/` — dev tools

* `dev-menu.ts` — URL-flag-gated cheats. `?dev=1`.
* `perf.ts` — FPS / sim-time overlay. `?perf=1`.

## State ownership rules

1. `GameState` is the single source of truth.
2. Only `src/sim/*` may mutate it.
3. Phaser scenes receive a read-only reference and emit input actions back.
4. The HUD subscribes to a derived store in `hud/store.ts`; it never mutates `GameState`.
5. Save serializes sim state only — renderer objects are not persisted.

## Why this split

The single-file prototype this rebuild replaces mixed state, rendering, and UI
in one 2,500-line HTML file. Four of its critical bugs (double `init()`,
neutral-city uncapturable, garrison corruption, `let` reassignment) would have
been caught at compile time had the project used TypeScript with a clear state
boundary. The split also makes the sim unit-testable without a browser.

## Phase 0 state

Phase 0 implements the boundary but only stubs the sim:

* `sim/state.ts` — types + factory, fully tested.
* `sim/map.ts`, `combat.ts`, etc. — **not yet**. They arrive in Phases 1–7.

The Phaser scenes in Phase 0 push hardcoded HUD values; the sim/render
contract is real, just not yet exercised end-to-end.
