# Phase 11 — Playtest + deploy

> Released: 2026-09-06.

## What shipped

### Build & deploy
- `npm run build` — produces a static `dist/` directory. Verified working
  in this phase. Phaser bundle is 1.5 MB (352 KB gzipped) — large but
  expected for a game engine. Code-splitting deferred to a future phase.
- README updated with deployment instructions for Vercel, Netlify, GitHub
  Pages, and local preview. The app is fully client-side: no server, no
  database, no env vars. Saves are in `localStorage` per browser.
- URL flags documented in the README: `?scene=`, `?faction=`, `?motion=`,
  `?perf=`, `?dev=`.

### Tests
- All previous phases: 82/82 unit tests pass.
- Build: `npm run build` succeeds.
- Typecheck: `npm run typecheck` clean.
- Lint: `npm run lint` clean.

## Acceptance

- ✅ `npm install && npm run build && npm run preview` boots the game.
- ✅ Build size acceptable (Phaser is the bulk; gzipped to 352 KB).
- ✅ README has deploy instructions.
- ✅ All 11 phases delivered.

## What's left for a fully production-ready game

* **Real sprite art** — Phase 9 ship a procedural fallback because
  `image_synthesize` is not available. When the asset host is
  available, swap `procedural-sprites.ts` calls for sprite-sheet
  loads keyed by `SPRITE_KEYS` in `data/manifests.ts`.
* **Audio** — sound effects for move, attack, victory, defeat. The
  manifest keys (`AUDIO_KEYS`) are already in place.
* **Settings UI** — a real settings menu instead of URL flags.
* **More AI difficulty** — current AI is a reasonable baseline;
  faction-specific personalities and difficulty levels are noted in
  the plan.
* **Tutorials** — first-time player walkthrough.

## End state

The Warlords II clone now has:
- 7 unit types × 4 factions with proper stats, combat rolls, and faction
  bonuses.
- Stack-based tactical combat with hero bonuses, terrain defense,
  undead resurrect, and spearman/wizard special bonuses.
- A* pathfinding for AI, BFS for player movement range.
- Procedural map generation with lakes, hills, forests, mountains.
- 32×32 maps with camera pan/zoom and click-to-select.
- City capture, production queue, per-turn income, mines, ruins, armories.
- Save/load via `localStorage`.
- Movement tweens, tile flash, reduced-motion support.
- 82 passing unit tests, clean typecheck, clean lint, working build.

`★ Insight ─────────────────────────────────────`
The sim/render split paid off in the polish phase. Adding tweens and
flashes was a single change to `GameScene` — the simulation never
touched. State ownership rules held: `combat.ts` doesn't know what a
tween is, `pathfinding.ts` doesn't know what a sprite is, and the
`GameState` type stayed stable across 11 phases.
`─────────────────────────────────────────────────`
