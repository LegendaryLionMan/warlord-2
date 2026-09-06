# Phase 8 — Save/load

> Released: 2026-09-06.

## What shipped

### Tests
- `src/save/serialize.test.ts` — 5 unit tests covering round-trip fidelity, ownership, version field, version-mismatch rejection, and empty-state handling.
- Combined: 82/82 tests pass.

### `src/render/GameScene.ts` (extend)
- New `saveState()` and `loadState()` private methods.
- Listens for `warlords2:save` and `warlords2:load` window events. The HUD buttons dispatch them.

### `src/render/MenuScene.ts` (extend)
- Lists `localStorage` save slots on mount. If any exist, draws a "CONTINUE — &lt;slot&gt;" button that loads the slot and jumps straight to `GameScene` with the loaded state.

### `src/hud/panels/top-bar.ts` (extend)
- New "💾 Save" and "📂 Load" buttons next to "End Turn".

### `src/hud/hud.css` (extend)
- New `.hud-action-btn` class for the save/load buttons (smaller than End Turn, gold-on-hover).

## Acceptance

- ✅ `npm run typecheck` clean.
- ✅ `npm test` — 82/82 passing.
- ✅ Save button persists the in-memory state to `localStorage["warlords2.save.autosave"]`.
- ✅ Load button restores it.
- ✅ Continue button appears on the main menu if a save exists.
