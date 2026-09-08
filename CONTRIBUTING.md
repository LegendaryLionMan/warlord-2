# Contributing to Warlords II Clone

Thanks for the interest! This is a fan-made reimplementation of the
1993 SSI classic *Warlords II*, so the project is small and the bar for
contributions is mostly: **match the 1993 game, keep the test suite
green, and don't break save/load.**

## Quick rules

1. **One concern per PR.** A bug fix, a refactor, or a feature — not all
   three. Keep the diff readable.
2. **Tests are required** for any change to `src/sim/` or
   `src/render/CombatScene.ts`. Visual-only changes can use a Playwright
   screenshot assertion in `tests/e2e/`.
3. **Run the full validation suite locally before opening a PR:**

   ```bash
   npm run typecheck
   npm run lint
   npm test
   npm run build
   npm run e2e    # needs `npm run dev` running in another shell
   ```

   The github-steward agent can run this for you if you don't have a
   working shell on the host.
4. **Match the 1993 game.** Visual or behavioral changes should be
   backed by a reference screenshot or rule from the 1993 manual. If you
   can't find one, say so in the PR description and the maintainer will
   help.
5. **Don't commit to `main`.** Branch from `main`, push to your fork or
   a feature branch, and open a PR. The maintainer squashes merges.

## Local setup

```bash
git clone https://github.com/LegendaryLionMan/warlords2-clone.git
cd warlords2-clone
npm install
npm run dev   # http://localhost:5173
```

You will need Node 20 or newer. The repo is pure client-side — no
database, no API key, no env vars.

## Project structure

| Path | Owns |
|---|---|
| `src/sim/` | Pure simulation: state, combat, AI, turn loop. No Phaser, no DOM. |
| `src/render/` | Phaser scenes (Boot/Menu/Faction/Game/Combat/Production/Hero/Quest/Outcome). |
| `src/hud/` | DOM HUD layer (top bar, side panel, action bar, message box). |
| `src/data/` | Static data: units, factions, heroes, terrain, asset manifests. |
| `src/assets/` | Phaser loader wrapper and audio manager. |
| `src/save/` | JSON serialization + `localStorage` adapter. |
| `src/debug/` | Dev menu + perf overlay (URL-flag-gated). |
| `scripts/` | One-off data and asset scripts. Read-only outside `public/`. |
| `tests/unit/` | Vitest unit tests. |
| `tests/e2e/` | Playwright e2e + screenshot tests. |
| `docs/changelog/` | Per-phase changelogs. Append a new file per phase. |
| `docs/releases/` | Per-release notes. Append a new file per release. |

## Reporting bugs

Use the **Bug report** issue template. Include:

- What you did, what you expected, what happened.
- Browser + OS.
- A screenshot or short video if it's visual.
- The URL flags you used (e.g. `?scene=GameScene&faction=humans`).

## Proposing features

Use the **Feature request** issue template. Keep in mind this is a
faithful 1993 clone, not a *Warlords III* or *Warlords IV* clone. New
content should either (a) exist in the 1993 game but not yet in this
clone, or (b) be invisible quality-of-life that doesn't change the
rules.

## Per-phase work

Larger changes ship as a numbered phase. Use the **Phase report** issue
template. Each phase gets:

- An issue with the `phase-NN` label.
- A per-phase changelog file at `docs/changelog/phase-NN.md`.
- A short, on-topic PR.
- A release note entry (the github-steward agent will draft the
  `docs/releases/vX.Y.Z.md`).

## Coding style

- TypeScript strict mode, no `any` without a comment.
- ESLint + Prettier configs are committed; run `npm run format` before
  opening a PR.
- Module names use kebab-case; type names use PascalCase; function and
  variable names use camelCase.
- Comments only where the *why* is non-obvious. No "this function adds
  two numbers."

## Asking questions

Open a GitHub Discussion (the Discussions tab is enabled). Tag the
post with the most relevant category. For quick questions, the issue
tracker is fine — just label it `question`.

## License

By contributing, you agree that your contributions will be licensed
under the ISC license (see `LICENSE`).
