# Changelog

All notable changes to this project are documented in this file. The
format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project (mostly) adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For per-phase design notes, see [`docs/changelog/`](./docs/changelog/).
For tagged releases, see [`RELEASES.md`](./RELEASES.md).

## [Unreleased]

### Changed
- The github-steward agent is now responsible for repo-side operations
  (releases, issues, PR triage, label set, milestones, wiki).
- README, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, CODEOWNERS, and
  issue/PR templates added.

## [1.0.0] - 2026-09-08 — first public release

The first tagged release. Snapshot of `main` at `7bc4343`. All 17
phases (0-16) of the original plan are complete. Full notes:
[`docs/releases/v1.0.md`](./docs/releases/v1.0.md).

### Highlights
- Full game loop: map gen, BFS movement, stack-based combat,
  city capture, AI turn, hero abilities, win conditions.
- 8 playable factions: Humans, Elves, Orcs, Undead, **Siroms**,
  **Dark Elves**, **Fey**, **Syrnyn** (the last four added in
  Phase 16 to match the full 1993 roster).
- 12 unit types + the **Settler** (added in Phase 16) for founding
  new cities.
- All in-game art, chrome, and dialogs use the **original 1993
  Warlords II screenshots** as backdrops, sourced from the
  Internet Archive mirror and credited under fair use.
- 16-color Warlords-II palette, byte-exact from the 1993
  `STANDARD.PAL`.
- AI-generated music and SFX (7 tracks, 10 SFX).
- Save/load via `localStorage`.
- 110 / 110 unit tests pass, 66 / 66 Playwright e2e tests pass,
  `npm run typecheck`, `npm run lint`, and `npm run build` clean.

### Per-phase detail (linked)

- [Phase 16](./docs/changelog/phase-16.md) — Settler, 4 new
  factions, VICTORY/DEFEAT scenes.
- [Phase 15](./docs/changelog/phase-15.md) — 1993 HUD chrome
  crops + Production / Hero / Quest dialogs.
- [Phase 14](./docs/changelog/phase-14.md) — Original 1993
  screenshots as in-game backdrops, byte-exact palette.
- [Phase 13](./docs/changelog/phase-13.md) — 49 hand-coded
  16-color pixel-art sprites + chiseled-stone HUD.
- [Phase 12](./docs/changelog/phase-12.md) — AI-painted
  illustration sprites + generated music + SFX.
- [Phases 0-11](./docs/changelog/) — Foundation, map, movement,
  combat, cities, AI, faction identity, win conditions,
  save/load, polish, deploy. The original 12-phase plan.

### Known issues
- The Dependabot PR for Vite 5→8 and Vitest 2→5 (PR #11) is open
  and unvalidated. Major-version bumps; the github-steward agent
  will triage it.
- The "Settler found city" interaction is defined in the registry
  but the click-to-found handler is not yet wired. Future phase.
- Real 1993 per-faction hero portraits and city fortresses are
  not yet extracted; current sprites reuse the neutral fortress
  and `humans.png` portrait as placeholders.
