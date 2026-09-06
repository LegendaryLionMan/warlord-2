# Phase 7 — Win conditions

> Released: 2026-09-06.

## What shipped

### `src/sim/win.ts` (new)
- `checkOutcome(state): 'playing' | 'won' | 'lost'`
- Win: player owns ≥ 75 % of all cities.
- Lose: player has no units and no cities.
- Otherwise: still playing.

### `src/render/GameScene.ts` (extend)
- `endTurn()` now calls `checkOutcome()` after the AI moves. On win/lose, the HUD message-box shows the result and `state.phase` updates.

### Tests
- `src/sim/win.test.ts` — 5 unit tests (default state, win, sub-threshold, lose, partial-still-playing).
- Combined: 77/77 tests pass.

## Acceptance

- ✅ `npm run typecheck` clean.
- ✅ `npm test` — 77/77 passing.
- ✅ Reaching 75% city ownership shows "VICTORY!" in the HUD.
- ✅ Losing all units and cities shows "DEFEAT." in the HUD.

## Next: Phase 8 — Save/load

JSON serialize, localStorage, export/import file.
