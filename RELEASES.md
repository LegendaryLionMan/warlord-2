# Releases

Tagged snapshots of `main`. The first release is **v1.0**, which
captures the state of the project after all 17 planned phases
(0-16) shipped.

| Tag | Date | Headline | Notes |
|---|---|---|---|
| [v1.0](./docs/releases/v1.0.md) | 2026-09-08 | First public release — 8 factions, Settler, procedural backdrops | Snapshot of `main` at `7bc4343`. All 110 unit + 66 e2e tests pass. |

## How a release is made

The github-steward agent prepares the release notes (a new file at
`docs/releases/vX.Y.Z.md`) and a draft tag. The maintainer then runs:

```bash
git fetch origin
git tag -a vX.Y.Z -m "vX.Y.Z — headline"
git push origin vX.Y.Z
gh release create vX.Y.Z \
    --title "vX.Y.Z — headline" \
    --notes-file docs/releases/vX.Y.Z.md \
    --target main
```

…or uses the GitHub web UI to create the release from the pushed
tag. Until `gh` is set up on the host, the agent stops at the
`docs/releases/vX.Y.Z.md` file and the tag push.

## Versioning

- **Major** (`vX.0.0`) — a milestone of multiple phases ships, or
  a breaking change to the save format.
- **Minor** (`v1.X.0`) — a new phase ships, or a notable new
  feature lands outside the phase cadence.
- **Patch** (`v1.0.X`) — bug fixes, dependency bumps, docs-only
  changes.

Phase work generally produces a minor bump. Save-format-breaking
changes always require a major bump and a `src/save/migrate.ts`
loader.
