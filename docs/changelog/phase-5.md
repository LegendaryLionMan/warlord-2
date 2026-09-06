# Phase 5 — AI

> Released: 2026-09-06.

## What shipped

### `src/sim/pathfinding.ts` (extend)
- New `aStarPath(state, start, goal): Array<{x, y}>` — A* with Manhattan heuristic, terrain-weighted cost, returns the path (including start + goal) or empty array if unreachable.
- Existing `bfsReachable` unchanged.

### `src/sim/ai.ts` (new)
- `pickTarget(state, army)` — picks nearest non-own city; neutral + enemy both allowed, neutral preferred.
- `maybeRecruit(state, city, faction)` — queues a militia or spearman at faction cities when the treasury allows.
- `endAiTurn(state, faction)` — per-faction turn: process production, fight adjacent enemies, step one tile toward a target city, capture if you step on it, recruit.
- `endAllAiTurns(state)` — runs every non-player faction once; returns the order.

### `src/render/GameScene.ts` (extend)
- `endTurn()` now calls `endAllAiTurns` after `endPlayerTurn`. HUD gets a "AI: enemy1, enemy2 acted" message.

### `src/sim/city.ts` (refactor)
- `generateCities` now picks AI owners from the real faction list (`['humans','elves','orcs','undead']` minus player) instead of the old `enemy1` placeholder.

### Tests
- `src/sim/ai.test.ts` — 7 unit tests (target selection, AI movement, capture, recruitment, multi-faction sequencing).
- `src/sim/pathfinding.test.ts` — 3 new A* tests (start==goal, direct path, unreachable).
- `src/sim/city.test.ts` — 1 new test (AI cities get the right owner).
- Combined: 61/61 tests pass.

## Acceptance

- ✅ `npm run typecheck` clean.
- ✅ `npm test` — 61/61 passing.
- ✅ After the player ends their turn, each AI faction takes a turn.
- ✅ AI moves armies toward the nearest non-own city and captures it.
- ✅ AI fights back when adjacent to the player.
- ✅ AI recruits at owned cities.

## Next: Phase 6 — Faction identity

Apply faction bonuses in combat, hero abilities, armories.
