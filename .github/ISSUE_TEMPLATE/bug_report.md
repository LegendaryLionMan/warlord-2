---
name: Bug report
about: Something in the game is broken or doesn't match the 1993 original
title: "[Bug] "
labels: ["bug"]
assignees: []
---

## What happened

A clear, one-sentence description of the bug.

## Reproduction

1. Run `npm run dev` and open the URL (usually `http://localhost:5173/`).
2. Click … / type … / go to tile (x, y) …
3. Observe: **actual behavior**
4. Expected: **what the 1993 game would have done** (or what the spec
   says — see [`SPEC.md`](https://github.com/LegendaryLionMan/warlords2-clone/blob/main/SPEC.md))

## Environment

- Browser + version: (e.g. Chrome 128)
- OS: (e.g. Windows 11, macOS 15)
- Commit SHA or release tag: (run `git rev-parse HEAD` or check the
  Releases tab)
- URL flags used: (e.g. `?scene=GameScene&faction=humans`)

## Screenshots / video

If it's a visual bug, drag-and-drop an image into the editor. The
1993 reference is in `docs/asset-credits.md` if you need a comparison.

## Console output

Open DevTools → Console, reproduce, and paste any red errors here.
Spoiler: most visual bugs show no console error — that's fine, just
note "no errors".

## Additional context

Anything else that might be relevant — phase, scene, faction, what you
were doing right before, etc.
