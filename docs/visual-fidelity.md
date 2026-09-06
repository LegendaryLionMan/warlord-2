# Visual Fidelity

> Last updated: Phase 0 (Foundation).

The final shipped game must look like a real product, not a tech demo. The
1993 Warlords II is the reference bar; the rebuild is judged against it.

## Tile and sprite standards

* **Base tile:** 32×32 px at 1× zoom.
* **Zoom:** smooth from 0.5× to 2×. `image-rendering: pixelated` for integer
  scales (no blur). Bilinear filtering for fractional.
* **Unit sprites:** 7 unit types × 4 factions = 28 unique army sprites.
  Each sprite has at least idle and "selected" poses. Combat animations
  are a Phase-10 polish item.
* **City sprites:** 1 per faction + 1 neutral = 5 variants.
* **Hero sprites:** 1 per faction.
* **Map features:** mine, ruin, armory — 3 art assets.

## Faction color identity

Visible at a glance in cities, unit trim, and UI accents.

| Faction | Primary  | Secondary | Accent   |
| ------- | -------- | --------- | -------- |
| Humans  | `#3b6fb6` | `#1e3a8a` | `#6aa3e8` |
| Elves   | `#2f8a4a` | `#14532d` | `#5cc480` |
| Orcs    | `#9b2a2a` | `#5a1414` | `#cc5050` |
| Undead  | `#6b3a8a` | `#3a1a5a` | `#9a6cc0` |

## UI typography

* **Title / display:** Uncial Antiqua (heading), Cinzel (subhead).
* **Body:** Cinzel regular.
* **Numeric (HP, gold, etc.):** Cinzel bold.

Loaded from Google Fonts in `index.html`.

## Animation standards

* **Unit movement:** 200–300 ms tween per tile.
* **Combat hit-flash:** 100 ms white flash on the struck unit.
* **City capture:** 400 ms color sweep to the new faction's primary.
* **End-of-turn transition:** 200 ms vignette fade.

The single-file prototype ran a 50 ms render interval that produced visible
jitter. Phase 0+ uses Phaser's `requestAnimationFrame` loop (60 FPS target).

## Audio

* Unit move
* Combat attack
* Combat victory / defeat
* End turn
* Recruit
* City capture

Loaded as Phaser sound objects, keyed by `AUDIO_KEYS` in `src/data/manifests.ts`.

## Phase 0 state

Phase 0 ships only the **theme**: dark backdrop, gold accents, parchment
panels, faction-colored cards on the select screen. All gameplay art is
intentionally placeholder — Phase 9 generates the full sprite sheet.
