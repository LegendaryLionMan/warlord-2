# Changelog

All notable changes to this project are documented in this file. The
format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project (mostly) adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For per-phase design notes, see [`docs/changelog/`](./docs/changelog/).
For tagged releases, see [`RELEASES.md`](./RELEASES.md).

## [Unreleased]

### Changed
- **Project renamed:** `warlords2-clone` → `warlord-2`. README title,
  `package.json`, GitHub description, and topics all updated. "Warlord
  2" is the name of this specific project; it is not affiliated with
  the original *Warlords / Warlords II* trademark.
- **All in-game backdrops are now procedural.** The original
  screenshots under `public/assets/sprites/original/` were removed.
  The Menu, Game, Combat, Hero, Production, Quest, and Outcome scenes
  now render marble + gold panels via Phaser Graphics primitives
  (see `src/render/backdrops.ts`). The HUD chrome (top bar, right
  panel, bottom action bar) is now CSS-only chiseled-stone.
- **Palette softened.** The 16-colour Warlord 2 palette is inspired
  by the 1990s SVGA 16-colour tradition but is no longer required
  to be byte-equivalent to any specific historical file.
- **Faction rename:** "Dark Elves" → "Night Elves" (the slot
  identity, type, and all internal references).
- **Marketing text updated.** README, in-game footer, and
  `LICENSE` no longer describe the project as "faithful to the 1993
  Warlords II" — they describe it as "inspired by the 1990s 4X
  wargame tradition; built from scratch; not affiliated with SSG
  or Ubisoft".
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
  **Night Elves**, **Fey**, **Syrnyn** (the last four added in
  Phase 16 for an 8-faction roster).
- 12 unit types + the **Settler** (added in Phase 16) for founding
  new cities.
- Original AI-painted sprites (Phase 12), hand-coded 16-colour
  pixel art (Phase 13), procedural marble + gold backdrops
  (Phases 14-16), and a CSS-only chiseled-stone HUD chrome.
- 16-colour Warlord 2 palette inspired by the 1990s SVGA
  16-colour tradition.
- AI-generated music and SFX (7 tracks, 10 SFX).
- Save/load via `localStorage`.
- 110 / 110 unit tests pass, 66 / 66 Playwright e2e tests pass,
  `npm run typecheck`, `npm run lint`, and `npm run build` clean.

### Per-phase detail (linked)

- [Phase 16](./docs/changelog/phase-16.md) — Settler, 4 additional
  factions, marble-and-gold VICTORY/DEFEAT panels.
- [Phase 15](./docs/changelog/phase-15.md) — CSS-only chiseled-stone
  HUD + procedural Production / Hero / Quest panels.
- [Phase 14](./docs/changelog/phase-14.md) — Procedural marble +
  gold backdrops (replaces the earlier 1993-screenshot approach
  that was later removed).
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
- Real per-faction hero portraits and city fortresses are still
  placeholders (the placeholder human portrait is reused for all 8
  factions); the original art is no longer used in-game.
- The `docs/wiki/Game-Manual.md` and other doc pages still mention
  the historical 1990s setting; the wiki is in-repo so the next
  doc pass can update them in place.
