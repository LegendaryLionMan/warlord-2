# Warlord 2 — Wiki Home

Welcome to the wiki for the *Warlord 2* project. The wiki mirrors
the README, but the manual lives here in a more navigable form.

## Quick links

- [Game manual](./Game-Manual) — units, factions, heroes, combat
  formula, win conditions.
- [Visual fidelity](../visual-fidelity.md) — sprite, palette, and
  UI standards; documents the original-1993-as-backdrop approach.
- [Architecture](../architecture.md) — module boundaries and
  state-ownership rules.
- [Original reference](../original-reference.md) — the 1993 source
  game: palette, soundtrack, faction list.
- [Asset credits](../asset-credits.md) — generation pipeline and
  license notes.
- [Changelog](../changelog/) — per-phase notes.
- [Releases](../releases/) — per-release notes.

## Repo links

- [GitHub repo](https://github.com/LegendaryLionMan/warlords2-clone)
- [Issue tracker](https://github.com/LegendaryLionMan/warlords2-clone/issues)
- [Pull requests](https://github.com/LegendaryLionMan/warlords2-clone/pulls)
- [Discussions](https://github.com/LegendaryLionMan/warlords2-clone/discussions)

## Quick start

```bash
git clone https://github.com/LegendaryLionMan/warlords2-clone.git
cd warlords2-clone
npm install
npm run dev   # http://localhost:5173
```

…or grab a tagged release:

```bash
git clone https://github.com/LegendaryLionMan/warlords2-clone.git
cd warlords2-clone
git checkout v1.0
npm install
npm run dev
```

## Current state

The project is at **v1.0**, snapshot of `main` at commit `7bc4343`.
All 17 planned phases (0-16) of the original roadmap are complete.

- 8 playable factions (the full 1993 roster)
- 12 unit types + the Settler
- 4 hero abilities
- Original 1993 Warlords II screenshots as in-game backdrops
- 16-color Warlords-II palette, byte-exact from the 1993
  `STANDARD.PAL`
- AI-generated music and SFX
- Save / load via `localStorage`
- 110 / 110 unit tests, 66 / 66 e2e tests

## Asset notice

Warlord 2 is an original work. No art, music, code, names, or lore
from any specific historical game is included. The visual style is
inspired by the 1990s 4X wargame tradition, but every sprite,
music track, sound effect, and prose is original to this project.
The project is not affiliated with, endorsed by, or associated
with SSG, Ubisoft, or any other rights holder of any historical
Warlords-related trademark.
