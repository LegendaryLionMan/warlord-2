# Phase 6 — Faction identity, heroes, armories

> Released: 2026-09-06.

## What shipped

### `src/sim/faction-bonus.ts` (new)
- `bonusesFor(faction)` — returns the per-faction bonus object.
- `applyFactionBonuses(units, faction)` — returns a new unit list with:
  - Humans: +1 def to all units.
  - Elves: +1 atk to ranged units only.
  - Orcs: +1 atk to melee units only.
  - Undead: handled separately by existing resurrect logic.

### `src/sim/hero.ts` (new)
- `createHero(owner, name?)` — level-1 hero with starting abilities Leadership + Fortify.
- `addHeroExperience(hero, xp)` — accumulates XP, levels up at `level * 50`, gains +1 atk per level, +1 def on even levels, unlocks next ability.
- `applyFortify(army, hero)` — +2 def to all units in the stack, marks `army.fortifyBonus = 2`.
- `applyRally(army, hero)` — restores 2 HP to each unit (capped at max).
- `applyLeadership(state, hero)` — +1 atk to all player units on the map.
- `applyScout(state, army, hero)` — reveals fog in 5-tile radius.

### `src/sim/armory.ts` (new)
- `recruitmentCost(state, x, y, unitId)` — base cost minus 20 % if an armory is adjacent.
- `hasAdjacentArmory(state, x, y)` — 3×3 check.

### `src/sim/combat.ts` (extend)
- `resolveCombat` now applies faction bonuses after hero bonuses. Humans get +1 def in the roll, Elves archers get +1 atk, Orcs melee get +1 atk.

### Tests
- `src/sim/faction-bonus.test.ts` — 4 unit tests (per-faction bonus table, applied correctly).
- `src/sim/hero.test.ts` — 4 unit tests (create, XP / level-up, Fortify, Rally).
- Combined: 72/72 tests pass.

## Acceptance

- ✅ `npm run typecheck` clean.
- ✅ `npm test` — 72/72 passing.
- ✅ Humans armies have +1 def in combat rolls.
- ✅ Elves archer attacks have +1 atk.
- ✅ Orcs knight attacks have +1 atk.
- ✅ Hero Fortify adds +2 def to the stack.
- ✅ Hero Rally restores 2 HP per unit.

## Next: Phase 7 — Win conditions

Capture 75 % of cities or eliminate all enemies. End screen.
