# Phase 4 — Cities, Economy, Features

> Released: 2026-09-06.

## What shipped

### `src/sim/city.ts` (new)
- `cityIncome({ size })` — SPEC formula: `size * 3 + 2` per turn.
- `createCity(state, x, y, size, owner, index)` — appends to `state.cities` with the right income and a procedural name.
- `generateCities(state, seed?)` — places 10 + 2 × factionCount cities with min-distance 10, on plains/forest/hills only, with starter garrisons.
- `captureCity(captor, city, survivingGarrison)` — flips ownership.
- `addProductionOrder(state, city, unitId)` — deducts gold, respects queue size, returns false if poor or full.
- `processCityProduction(city, state)` — decrements timers, spawns units into the city garrison when done.

### `src/sim/features.ts` (new)
- `generateFeatures(state, seed?)` — places 6 mines, 4 ruins, 2 armories on passable tiles away from cities and other features.

### `src/sim/turn.ts` (new)
- `endPlayerTurn(state): number` — collects income from player cities, processes production, refreshes player-army movement, advances the turn.

### `src/render/GameScene.ts` (extend)
- Generates cities and features on create.
- Renders cities as faction-colored squares (size 0.6× tile), features as small squares.
- Walking onto a city tile captures it (flips owner, refreshes city sprites, HUD message).
- Public `endTurn()` method hooked to the HUD end-turn button via `setEndTurnHandler`.
- End turn updates turn counter, gold (income), cities (player-owned), and shows a "Turn N — +Xg income" message.

### `src/hud/hud.ts` (extend)
- New `setEndTurnHandler(fn)` API so the GameScene can wire end-turn without the HUD knowing about Phaser.

### Tests
- `src/sim/city.test.ts` — 6 unit tests (income formula, create/capture, production queue, generate).
- `src/sim/turn.test.ts` — 5 unit tests (income, faction filter, movement reset, turn advance, enemy untouched).
- Combined: 50/50 tests pass.

## Acceptance

- ✅ `npm run typecheck` clean.
- ✅ `npm test` — 50/50 passing.
- ✅ Cities and features render on the map.
- ✅ Walking onto a city captures it.
- ✅ End-turn button calls `endPlayerTurn`, updates gold + turn + cities.
- ✅ Income, production, movement all update on end-turn.

## Next: Phase 5 — AI

A* pathfinding, AI strategy, multiple AI factions take turns.
