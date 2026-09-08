# Security policy

This is a small client-side game with no server, no authentication, and
no telemetry. The attack surface is the browser running the built
`dist/` output. Even so, please report anything you find.

## Supported versions

| Version | Supported |
|---|---|
| `main` branch (current development) | ✅ Yes |
| Latest published release | ✅ Yes |
| Older releases | ❌ No — please upgrade |

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Email **security@legendarylionman.dev** (or open a GitHub issue marked
"security" and request it be converted to a private advisory if email
isn't an option). Include:

- A clear description of the issue and the impact.
- A minimal reproduction (URL, steps, or a code snippet).
- The commit SHA or release tag you observed it on.

I will respond within 72 hours and aim to ship a fix within 14 days for
anything rated High or Critical.

## What is *not* a security issue

- The game using 1993 SSG screenshots as backdrops. This is a
  deliberate, credited, fair-use reuse for a fan-made reconstruction.
  See `docs/asset-credits.md` and the asset notice in `LICENSE`.
- The `localStorage` save format. It's a single JSON blob scoped to
  this origin; nothing sensitive should ever be put in it.
- Cosmetic bugs in the Phaser scenes or DOM HUD. Open a normal issue
  with the `bug` label.
- Phaser or Vite CVEs. Those are upstream — Dependabot will pick them
  up (see open PRs in the issue tracker).

## Scope

In scope:

- Anything that lets a remote attacker run code in the player's
  browser via a crafted save, URL flag, or asset.
- The dev server (`npm run dev`) — though we assume you only run it on
  `localhost` or your own machine.
- The Playwright e2e suite, if a test could leak credentials or
  filesystem data.

Out of scope:

- Phaser, Vite, Vitest, esbuild, or any other dependency. Report those
  upstream; the github-steward agent will review the resulting PR.
- The original 1993 game's bugs (this is a *clone*, not the source).
- The 1993 SSG assets themselves (we don't control their content).
