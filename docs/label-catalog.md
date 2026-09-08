# Label catalog

The full set of labels used on this repo. The github-steward agent
applies these per its hard constraints; new labels are created via
the GitHub UI by the maintainer (the agent does not have a
`create_label` tool).

## Status labels

| Label | Color | Meaning |
|---|---|---|
| `bug` | `#d73a4a` | Something is broken or behaves incorrectly. |
| `enhancement` | `#a2eeef` (default) | New feature or improvement. |
| `documentation` | `#0075ca` | Docs-only change (README, `docs/`, wiki, JSDoc). |
| `question` | `#cc317c` | A user question; not necessarily a bug or feature. |
| `wontfix` | `#ffffff` | Acknowledged but not planned. |
| `duplicate` | `#cfd3d7` | Duplicates an existing issue or PR. |
| `invalid` | `#e4e669` | Not a real issue (e.g. user error, misunderstanding). |
| `good first issue` | `#7057ff` (default) | Small, well-scoped, friendly to newcomers. |
| `help wanted` | `#008672` (default) | Extra attention wanted; PRs welcome. |

## Priority labels

| Label | Color | Meaning |
|---|---|---|
| `priority: high` | `#b60205` | Blocks a release or breaks the game loop. |
| `priority: medium` | `#fbca04` | Should land soon; not a release blocker. |
| `priority: low` | `#0e8a16` | Nice to have; can wait. |

## Type labels

| Label | Color | Meaning |
|---|---|---|
| `art` | `#ededed` | Visual or pixel-art work. |
| `audio` | `#ededed` | Music or SFX. |
| `gameplay` | `#ededed` | Combat, movement, AI, factions, hero abilities. |
| `dependencies` | `#0366d6` (default) | Dependabot or other dep updates. |
| `javascript` | `#168700` (default) | JS/TS code change. |
| `visual-fidelity` | `#ededed` | Improving fidelity to the 1993 original. |

## Phase labels

One per phase. Applied by the github-steward agent when a phase
issue is opened and carried through to close. `phase-NN` where `NN`
is zero-padded.

| Label | Phase |
|---|---|
| `phase-0` | Foundation |
| `phase-1` | Map |
| `phase-2` | Movement |
| `phase-3` | Combat |
| `phase-4` | Cities |
| `phase-5` | AI |
| `phase-6` | Faction identity |
| `phase-7` | Win conditions |
| `phase-8` | Save / load |
| `phase-9` | Assets |
| `phase-10` | Polish |
| `phase-11` | Playtest + deploy |
| `phase-12` | AI art & audio |
| `phase-13` | 16-color pixel art |
| `phase-14` | 1993 backdrops |
| `phase-15` | 1993 HUD chrome + dialogs |
| `phase-16` | Settler + 4 new factions + outcomes |

## Lifecycle labels

| Label | Color | Meaning |
|---|---|---|
| `completed` | `#ededed` | The work shipped in a tagged release. Set when the corresponding phase issue is closed. |

## How labels are applied

- **Bug reports** come in pre-labeled with `bug`.
- **Feature requests** come in pre-labeled with `enhancement`.
- **Phase reports** come in pre-labeled with the corresponding
  `phase-NN` and assigned to the maintainer.
- The github-steward agent adds `priority: high|medium|low` within
  5 minutes of opening, based on whether the issue blocks a release
  or is a small QoL change.
- When a phase issue closes, the agent adds `completed` and removes
  the `priority:*` label.
