# Phase 16 — Settler, 4 new factions, victory/defeat scenes

**Status:** Complete. The clone now has the full 1993 roster of 8
factions (Siroms, Dark Elves, Fey, Syrnyn added to Humans, Elves,
Orcs, Undead), the Settler unit, and 1993-styled VICTORY / DEFEAT
overlay scenes. All 110 unit + 66 e2e tests pass; typecheck and
lint clean.

**Issue:** https://github.com/LegendaryLionMan/warlords2-clone/issues/11

## Why this phase

Phases 14 + 15 brought the in-game chrome and world map to 1993
fidelity, but the clone only had 4 of the 8 1993 factions
(Humans, Elves, Orcs, Undead) and no settler unit. This phase
finishes the 1993 roster and adds the missing settler + outcome
overlays.

## What this phase ships

### Settler unit
- **`src/data/units.ts`** — new `settler` entry: 200gp, 3 HP, 0 ATK,
  0 DEF, 2 moves, "Founding colonist. Walks onto an empty tile to
  found a new city. Cannot fight."
- **`src/sim/state.ts`** — `UnitId` extended with `'settler'`.
- **`src/config.ts`** — `UNIT_IDS` extended.
- **`src/data/factions.ts`** — every faction's `allowedUnits` now
  includes `'settler'` (except where disallowed by the 1993 roster
  logic, e.g. Orcs can recruit settlers).

### 4 new factions (the missing 1993 roster)
- **`src/sim/state.ts`** — `FactionId` extended with
  `'siroms' | 'darkelves' | 'fey' | 'syrnyn'`.
- **`src/data/factions.ts`** — 4 new entries with stats, lore,
  primaryColor, and heroName:
  - **Siroms** — Highlanders; +2 melee attack, +1 defense.
    Hero: Thane Korr.
  - **Dark Elves** — Fey cousins; +1 ranged attack, +1 defense.
    Hero: Malys Shadowveil.
  - **Fey** — Magical sprites; 10% resurrect on victory.
    Hero: Queen Titania.
  - **Syrnyn** — Dwarven mountaineers; +2 defense, +1 melee attack.
    Hero: King Dwalin.
- **`src/config.ts`** — `FACTIONS` list extended; `FACTION_COLORS`
  palette extended (4 new entries with 1993-appropriate tints);
  `DEFAULT_FACTION_COUNT` bumped to 8.
- **`src/sim/faction-bonus.ts`** — `BONUSES` map extended for the
  4 new factions.
- **`src/render/procedural-sprites.ts`** — `PHASER_FACTION_*`
  color maps extended.
- **`src/render/FactionScene.ts`** — now renders 8 faction cards in
  a 4×2 grid (was 4 cards in a row). Each card shows the hero
  name, tagline, and description. Click to start the game.
- **`src/render/GameScene.ts`** — `citySpriteKey()` extended; new
  factions fall back to the neutral fortress sprite until real
  1993 city variants are extracted.

### 4 more hero portraits
- **`src/data/manifests.ts`** — 4 new hero keys
  (`heroSiroms`, `heroDarkelves`, `heroFey`, `heroSyrnyn`).
- **`src/data/asset-paths.ts`** — paths registered (currently
  reusing the `humans.png` placeholder until the real 1993 portraits
  are extracted from `DATA/*.DAT`).
- **`src/assets/loader.ts`** — `heroKey()` already supports any
  `OwnerId`; the 4 new keys are picked up automatically.

### Victory / Defeat scene
- **`src/render/OutcomeScene.ts`** (new) — 1993-styled overlay with
  a marble-and-gold panel, large VICTORY! (gold) or DEFEAT (red)
  title, sub-quote, Pope attribution, and a "Return to Main Menu"
  button. Plays the appropriate SFX sting and switches the music
  to victory/defeat tracks.
- **`src/render/GameScene.ts.checkOutcome()`** — fires the
  OutcomeScene 800ms after a win or loss.
- **`src/render/BootScene.ts`** — added `?scene=OutcomeScene&kind=won|lost`
  URL param for screenshot/QA use.
- **`src/render/index.ts`** — registered the new scene.

### Tests + docs
- **`tests/e2e/phase-16-shots.spec.ts`** (new) — 3 Playwright
  tests capturing the 8-faction FactionScene, VICTORY, and
  DEFEAT.
- **`src/sim/state.test.ts`** — updated the default `factionCount`
  assertion from 4 to 8.
- **`docs/changelog/phase-16.md`** (this file).

## File summary

| Path | Change | Notes |
|---|---|---|
| `src/data/units.ts` | updated | new `settler` unit |
| `src/data/factions.ts` | updated | 4 new faction entries |
| `src/data/manifests.ts` | updated | 4 new hero keys |
| `src/data/asset-paths.ts` | updated | 4 new hero paths |
| `src/sim/state.ts` | updated | FactionId, UnitId extended |
| `src/sim/state.test.ts` | updated | default factionCount: 4→8 |
| `src/sim/faction-bonus.ts` | updated | 4 new faction bonuses |
| `src/config.ts` | updated | FACTIONS list, FACTION_COLORS, UNIT_IDS |
| `src/render/FactionScene.ts` | updated | 4×2 grid, hero name on each card |
| `src/render/GameScene.ts` | updated | city sprite fallback, OutcomeScene launch |
| `src/render/BootScene.ts` | updated | OutcomeScene URL param routing |
| `src/render/OutcomeScene.ts` | new | 1993-styled victory/defeat overlay |
| `src/render/procedural-sprites.ts` | updated | faction color maps extended |
| `src/render/index.ts` | updated | registered OutcomeScene |
| `tests/e2e/phase-16-shots.spec.ts` | new | 3 screenshot tests |
| `docs/changelog/phase-16.md` | new | this file |
| `docs/screenshots/phase-16-{faction,victory,defeat}.jpg` | new | 3 screenshots |

## Verification

- `npx vitest run` — **110 / 110 pass**.
- `npx tsc --noEmit` — **clean**.
- `npx eslint src` — **clean**.
- `npx vite build` — **succeeds**.
- `npx playwright test` — **66 / 66 pass** (3 new phase-16 + 4
  phase-15 + 3 phase-14 + 2 phase-12 + 3 visual-fidelity + 50
  sprite-reachability + 1 smoke).

## What the user sees

- **Faction select** — 8 cards in a 4×2 grid: Humans, Elves, Orcs,
  Undead, Siroms, Dark Elves, Fey, Syrnyn. Each card shows the
  faction name, hero name, tagline, and description in the
  faction's primary color.
- **Faction colors** — every faction now has a distinct tint for
  its faction pip, city fortress fallback, and procedural
  rendering. The 4 new factions use 1993-appropriate colors
  (Siroms: tan, Dark Elves: deep purple, Fey: forest green,
  Syrnyn: gold-brown).
- **Faction bonuses** — the 4 new factions have unique stat
  modifiers. Siroms hit harder in melee (+2 ATK), Dark Elves
  are balanced ranged+defense, Fey get a 10% resurrect bonus,
  Syrnyn are tanks (+2 DEF).
- **Settler unit** — defined in the UNITS registry; selectable in
  the production dialog. Cannot fight, but can found new cities
  on empty tiles (foundation logic deferred to a follow-up phase).
- **Win the game** — the world map dims, a marble-and-gold panel
  appears with "VICTORY!" in gold, the Pope attribution, and a
  Return to Main Menu button. Plays the victory sting.
- **Lose the game** — same panel with "DEFEAT" in red and "Thy
  banner is broken." Plays the defeat sting.

## Limitations / future candidates

- **Settler foundation action** — the Settler is in the roster
  but the "walk onto empty tile → found city" interaction is
  not yet wired. A future phase can add the click handler.
- **Real 1993 portraits for new factions** — currently the
  placeholder `humans.png` is reused. Phase 16+ should extract
  the actual Sir Marhaus, Lady Lorien, etc. portraits from
  `DATA/*.DAT` and use distinct art for each.
- **Per-faction city fortresses** — the 4 new factions currently
  use the neutral fortress sprite. The 1993 game has 8 distinct
  fortress designs. Future phases can extract from `PICS/*.PCK`.
- **Per-faction unit sprites** — only Humans/Elves/Orcs/Undead
  have hand-coded unit sprites. The 4 new factions would need
  their own.
- **Roads / coastline** — not yet rendered. Phase 16+ should add
  the 1993 road and coastline art between adjacent tiles.
- **Real 1993 victory map** — the 1993 victory scene showed the
  player's last-known world map with a parchment overlay. The
  clone shows the world map dimmed behind a panel, which is close
  but not identical.
