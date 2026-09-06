# Phase 10 — Polish

> Released: 2026-09-06.

## What shipped

### `src/render/GameScene.ts` (extend)
- `animateArmyMove(fromX, fromY, toX, toY)` — tween the army sprite 200 ms with `Quad.easeOut` after a successful move.
- `flashTile(x, y, color)` — 300 ms white-flash overlay on city capture, combat hit, and victory.
- `motionReduced()` — returns true if `?motion=0` is in the URL **or** the user's OS has `prefers-reduced-motion: reduce`. All animation helpers short-circuit when this is true.
- Victory path also flashes the map center in gold.

## Acceptance

- ✅ `npm run typecheck` clean.
- ✅ `npm test` — 82/82 passing.
- ✅ `?motion=0` disables all movement and flash animations.
- ✅ Reduced-motion OS preference is respected.

## Out of scope (deferred)

- Audio — needs asset files and a license review; left for a future phase.
- Tutorial / first-time help overlay — the `SPEC.md` already documents the rules; the existing instruction panel in the HUD doubles as a quick reference.
- Settings menu — the `?scene=`, `?faction=`, `?motion=`, `?perf=`, `?dev=` URL params cover the most common switches; a full settings UI can land later.

## Next: Phase 11 — Playtest + deploy

Visual regression, perf, public deploy, marketing GIF.
