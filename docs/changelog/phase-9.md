# Phase 9 — Assets (procedural sprite pipeline)

> Released: 2026-09-06.

## What shipped

### `src/render/procedural-sprites.ts` (new)

The `game-studio:sprite-pipeline` skill expects a host image-generation
tool (`image_synthesize` on the mcode-tools / mavis side). That tool is
not available in this environment, so Phase 9 ships a **procedural**
sprite pipeline instead: deterministic Phaser-Graphics drawings that
give the visual upgrade without external dependencies. When image
generation becomes available, the same manifest keys in
`src/data/manifests.ts` are ready to swap to real art.

* `drawArmySprite(g, cx, cy, faction, unitKind, isHero?)` — Faction-colored
  circle with a darker outer ring, a light highlight crescent, and a
  white icon glyph that hints at the unit's role:
  - infantry: sword (vertical line + cross-guard)
  - ranged:   arrow (diagonal line + notch)
  - cavalry:  horse head (white triangle)
  - magic:    four-point star
  - siege:    anvil / block
  Hero armies get a gold rim around the icon.
* `drawCitySprite(g, cx, cy, faction, size)` — Castle footprint with
  twin towers, a flag, and a base that scales with city size. Uses
  the faction's main, dark, and light palette shades.
* `kindOfUnit(unitId)` — maps a `UnitId` to a sprite kind.

### `src/render/GameScene.ts` (extend)
- `renderArmy()` now uses `drawArmySprite`. For multi-unit stacks it
  shows the strongest unit's icon. `refreshArmySprite()` redraws after
  every move or combat result.
- `renderCities()` now uses `drawCitySprite` on a single `Graphics`
  object per scene (one draw call instead of N).

### Screenshots
- `docs/screenshots/phase-9-sprites.jpg` — captured in-game view
  showing the new city and army art plus the new HUD buttons.

## Acceptance

- ✅ `npm run typecheck` clean.
- ✅ `npm test` — 82/82 passing.
- ✅ Player army renders as a blue circle with a sword.
- ✅ Cities render as castle footprints in faction colors.
- ✅ Mines and ruins render with distinct colors.
- ✅ Save / Load buttons visible in the HUD top bar.

## What still needs to land for a fully asset-rich game

* Per-unit pose art for the seven unit types × four factions
  (currently the strongest-unit icon is the only per-army detail).
* Hero portraits.
* Animated combat hits and city-capture flash (Phase 10 polish).
* Sound effects.

## Next: Phase 10 — Polish

Sound, animation, tutorial, settings, reduced-motion.
