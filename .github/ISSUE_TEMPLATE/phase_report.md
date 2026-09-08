---
name: Phase report
about: A numbered phase (Phases 0-16 done; this template is for 17+)
title: "Phase NN: "
labels: ["phase-NN"]
assignees: ["@LegendaryLionMan"]
---

## Goal

One sentence: what does this phase ship?

## Reference

- 1993 source material (manual page, screenshot, or floppy file).
- Relevant `SPEC.md` sections.
- Previous phase: `docs/changelog/phase-(NN-1).md`.

## Scope

Bullet list of what this phase will and won't change. Be specific.
The maintainer will convert the bullet list into a phase plan and
break it into PRs.

## Acceptance

A checklist the maintainer can run through before merging the final
PR. Include the test commands (`npm test`, `npm run e2e`, `npm run
build`, `npm run typecheck`, `npm run lint`) and the expected pass
count.

## Out of scope

What's deliberately *not* in this phase (gets its own issue later).

## Estimated size

- [ ] XS — one PR, < 100 lines
- [ ] S — one PR, < 500 lines
- [ ] M — 2-3 PRs, multiple subsystems
- [ ] L — 4+ PRs, possibly its own branch
- [ ] XL — needs a planning phase first
