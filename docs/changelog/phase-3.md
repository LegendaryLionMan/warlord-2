# Phase 3 — Combat

> Released: 2026-09-06.

## What shipped

### `src/sim/combat.ts` (new)
- `resolveCombat(attacker, defender, terrain): CombatResult` — stack-based combat per SPEC § 4–5.
- Formula: `attack_roll = ATK + d6`, `defense_roll = DEF + d4 + terrain_bonus`. Ties go to defense. One unit per round. Process weakest-HP first.
- Hero bonuses: hero's `attackBonus` added to every unit's attack, `defenseBonus` to defense.
- Undead resurrect: 20 % of attacker losses come back on victory (rounded up, minimum 1).
- Special attacker bonuses: Spearman +2 vs cavalry, Wizard +3 magic vs Undead.
- Returns `{ victory, attackLosses, defendLosses, attackUnits, defendUnits }`.

### `src/render/CombatScene.ts` (rewrite)
- Modal combat overlay with title, attacker name, VICTORY/DEFEAT banner, losses, Continue button.
- Pulls payload from `window.combatPayload` (stashed by GameScene before launching).
- Emits `combat-resolve` event on Continue so GameScene can apply the result.

### `src/render/GameScene.ts` (extend)
- Spawns one enemy army (undead, 2 militia) a few tiles from the player for engagement.
- When player army moves onto an enemy army's tile, calls `initiateCombat(attacker, defender)`.
- `initiateCombat` resolves the battle, stashes the payload, and `scene.launch(CombatScene.KEY)`.
- `applyCombatResult` runs on scene resume: applies survivors, removes the losing army from `state.armies`, refreshes the minimap, updates the HUD army count.

### Tests
- `src/sim/combat.test.ts` — 12 unit tests: dice rolls, terrain bonuses, weakest-first ordering, attacker-strong-wins, defender-strong-holds, forest-helps-defender, hero-bonus-shifts, undead-resurrects, spearman-vs-cavalry, wizard-vs-undead, smoke test.
- Combined with Phases 0–2: 39/39 tests pass.

## Acceptance

- ✅ `npm run typecheck` clean.
- ✅ `npm test` — 39/39 passing.
- ✅ Walking onto an enemy tile triggers the combat overlay (verified manually).
- ✅ Combat result applies on Continue.
- ✅ Undead victory restores 20 % of losses.
- ✅ Hero stat bonuses apply in combat.

## Next: Phase 4 — Cities

Placement, capture, per-turn income, production queue, mines, ruins.
