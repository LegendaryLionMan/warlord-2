## What

A short, one-sentence description of the change. If it closes an issue,
end the line with `Closes #N`.

## Why

Link the issue, the spec section, the 1993 manual page, or the
screenshot that motivates the change. Two sentences max.

## Scope

- [ ] One concern only (no drive-by refactors, no unrelated
  formatting, no opportunistic cleanups).
- [ ] All new/changed code is in `src/` and/or `tests/`.
- [ ] If the change touches `src/sim/`, the unit tests in
  `tests/unit/` cover the new logic.
- [ ] If the change touches a Phaser scene or DOM HUD, a Playwright
  e2e test captures the new behavior.

## Validation

Run locally and paste the relevant output:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run e2e    # needs `npm run dev` running in another shell
```

| Command | Result |
|---|---|
| `npm run typecheck` | ✅ / ❌ |
| `npm run lint` | ✅ / ❌ |
| `npm test` | NN / NN pass |
| `npm run build` | ✅ / ❌ |
| `npm run e2e` | NN / NN pass |

## Screenshots

If this is a visual change, drop before/after screenshots in the
editor. Cross-reference `docs/screenshots/` and `docs/asset-credits.md`
for the 1993 originals.

## Asset provenance

If you added or replaced a 1993 asset, link the source file in the
Internet Archive mirror (`msdos_Warlords_II_1993/...`) and confirm
it's used under fair use as fan-clone reconstruction reference.

## Checklist

- [ ] No secrets, credentials, or `localStorage` keys are committed.
- [ ] No new dependency without a justification in the PR body.
- [ ] No change to the `localStorage` save format unless `src/save/`
  is updated to migrate old saves.
- [ ] No commit to `main` from a local branch — this PR is the
  proposed merge.

## For the maintainer

- Squash-merge for one-off fixes; merge-commit for multi-PR phases.
- Tag the merge commit with the next `vX.Y.Z` if this is a release.
- Delete the feature branch after merge.
