# Phase 2 — Movement

> Released: 2026-09-06.

## What shipped

### `src/sim/pathfinding.ts` (new)
- `bfsReachable(state, startX, startY, movePoints): Array<{x, y, cost}>` — BFS with terrain-weighted move cost, accumulates cost, prunes tiles that exceed budget. Excludes the start tile from results.

### `src/sim/army.ts` (new)
- `createUnit(unitId, owner)` — copies values from a `UnitTemplate` into a `Unit` instance.
- `createArmy(state, x, y, owner, unitIds[])` — appends an `Army` to `state.armies` and returns it.
- `movementBudget(army)` — max unit moves (original game: max-stack-unit moves).
- `consumeMovement(army)` — sets `hasMoved=true`, zeros out unit moves, clears `moves[]`.
- `refreshMovement(army)` — opposite of consume; called at the start of a new turn.
- `isAlive(army)` — true if the army has any unit.
- `ArmyLike` interface — minimal shape for functions that only need coordinates and units.

### `src/render/GameScene.ts` (extended)
- Spawns one player army with a Militia and a Spearman on a passable tile near the map center.
- Centers the camera on the army at start.
- Renders the army as a faction-colored square on the map and as a gold dot on the minimap.
- Click on army → highlights reachable tiles in gold.
- Click on a highlighted tile → moves the army there and consumes the move.
- HUD side panel shows the army's units + HP.

### Tests
- `src/sim/pathfinding.test.ts` — 6 unit tests covering budget, BFS reach, terrain costs, water/mountain exclusion, in-bounds.
- `src/sim/army.test.ts` — 6 unit tests covering factories, lifecycle, movement budget.
- Combined with Phase 0+1: 27/27 tests pass.

### Docs
- `docs/screenshots/phase-2-army.jpg` — captured in-game view with the player army at start.
- `docs/gameplay-fidelity.md` will get a movement section in Phase 3 (combat depends on it).

## Acceptance

- ✅ `npm run typecheck` clean.
- ✅ `npm test` — 27/27 passing.
- ✅ `npm run dev` shows the player army on the map.
- ✅ Click army → reachable tiles highlight.
- ✅ Click highlighted tile → army moves.
- ✅ Camera centers on army at start.
- ✅ `docs/screenshots/phase-2-army.jpg` committed.

## Next: Phase 3 — Combat

Stack-based combat per the SPEC formula. Hero bonuses. Combat overlay scene.
