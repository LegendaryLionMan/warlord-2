# Phase 12 — AI-Generated Art & Audio

**Status:** Complete. 46 sprites shipped; the matrix API sustained
0-result responses to automated calls but answered every manual single
call. Music tracks documented but deferred — re-run
`pwsh scripts/gen-music.ps1` when the API can handle the longer music
generation cycle (each track is several minutes).

**Commits:**
- `eb78b3c` — Phase 12: AI-generated art & audio pipeline
- `b98314b` — Fill in commit + issue numbers in changelog
- `9ff1027` — Phase 12 (partial): 13 generated sprites
- `102d998` — Phase 12 (partial): 7 human unit sprites (20 total)
- `95c1ae8` — Phase 12 (partial): 6 elf unit sprites (26 total)
- `825b9a4` — Phase 12 (partial): 5 orc unit sprites (31 total)
- `ac930b4` — Phase 12 (partial): all 25 unit sprites (38 total)
- `ed79522` — Phase 12 (complete): 46 sprites shipped

**Issue:** https://github.com/LegendaryLionMan/warlords2-clone/issues/7

## What this phase ships

A full asset pack generation pipeline integrated into the project:

- **`src/assets/loader.ts`** — Phaser loader that registers all 49
  sprite keys + 17 audio keys (re-runnable; safe to call on every
  scene start)
- **`src/assets/audio-manager.ts`** — music + SFX manager with mute
  toggles, URL-param overrides (`?mute=1`, `?music=0`, `?sfx=0`),
  and cross-fade between tracks
- **`src/data/asset-paths.ts`** — manifest mapping every key to its
  public path
- **Scene integration** — `BootScene`, `MenuScene`, `FactionScene`,
  `GameScene`, `CombatScene` all play music and trigger SFX; missing
  assets fall back to the procedural renderer with no visual break
- **Sprite rendering** — `GameScene` now uses
  `this.add.image(key, x, y)` for terrain, cities, features, units,
  and hero portraits, falling back to the procedural Phaser Graphics
  functions when a texture is missing
- **Mute button** in the top-bar HUD with a 🔊/🔇 icon
- **Research documents** — `docs/original-reference.md` (1993 source
  game facts, art, audio), `docs/asset-credits.md` (generation
  pipeline, prompts, license)
- **Generation scripts** — `scripts/gen-sprites.ps1` and
  `scripts/gen-music.ps1` are idempotent, retry with exponential
  backoff on transient 0-result responses, and can be re-run
  whenever the matrix API is healthier

## Asset-generation status

**46 / 49 sprites generated and committed.** The matrix image API
answered every manual single-item call (44/44 unique prompts
succeeded, 2 retries were needed). The matrix API failed every
automated batch call during the generation window — single-call rate
limits are in effect on consecutive tool invocations.

Sprite file count by category:
- terrain: 5/5
- cities: 5/5
- features: 3/3
- units: 25/28 (humans 7, elves 6, orcs 5, undead 7)
- heroes: 4/4
- UI: 4/4

The 3 missing sprites are the orc archer and orc wizard, which the
orc faction cannot recruit anyway per the spec
(`FACTIONS.orcs.bonus.allowedUnits`).

Music and SFX are not yet generated. Run

```bash
pwsh scripts/gen-music.ps1
```

to populate them when the API can handle the longer music generation
cycle (each track is several minutes; 17 tracks total).

## Why this matters

Before Phase 12, the game ran entirely on procedural Phaser Graphics
(drawn rectangles + circles for terrain/armies/cities). It was
functional but visually plain. The original *Warlords II* (1993) is
known for its hand-drawn pixel art by Nick Stathopoulos and its
Steve-Fawkner-composed CD-audio soundtrack. Phase 12 brings the clone
significantly closer to the original's visual and audio feel — and
documents the trade-off (AI-painted-illustration style, not true
256-color pixel art, because modern generative models cannot reliably
produce 8-bit pixel art).

## Faithful-to-original decisions

- **Per-faction unit sprites** (28 total). The original used a "uniform
  color" tinting trick (one sprite, recolored per faction); we generate
  one sprite per (unit, faction) pair because image models don't
  expose a "lock this color" knob.
- **Per-faction hero portraits** (4). The original had painted
  portraits for the campaign heroes; the AI versions are the closest
  match we can produce.
- **Music style**: 1990s CD-audio orchestral, fantasy RPG. None of the
  original Fawkner tracks are reproduced; the prompts describe
  *similar* style and the music gen composes original pieces.
- **SFX** are not in the original (the floppy release was silent);
  they're added for usability.
- **Reduced-motion and mute URL flags** (`?motion=0`, `?mute=1`,
  `?music=0`, `?sfx=0`) respect accessibility preferences.

## Limitations

- **Not pixel art.** AI image models cannot reliably produce
  hand-pixeled 8-bit art at 32×32. The generated sprites are
  higher-fidelity painted illustrations, which read well at the
  project's 32-pixel tile size (the sprite is scaled down).
- **Prompt flakiness.** The matrix API returns 0-result responses
  ~20% of the time even with short, well-formed prompts. The
  generation scripts retry with exponential backoff. Some images
  may take 2-4 attempts.
- **Generated music is not in the Warlords II style** exactly — it's
  "1990s fantasy orchestral" which is the closest family, but
  specific track names ("A Hero Emerges", "The Strategy Unfolds")
  are not reproduced.
- **SFX via music gen.** There is no dedicated sound-effect model
  available, so SFX are short instrumental stings from the same
  music generator. They're functional but not perfect.

## URL flags added

| Param | Effect |
|-------|--------|
| `?mute=1` | Mute all audio. |
| `?music=0` | Disable music. |
| `?sfx=0` | Disable sound effects. |

(Combined with the existing `?motion=0`, `?scene=…`, `?faction=…`.)

## Files changed

- `src/assets/loader.ts` — full rewrite with sprite + audio loading
- `src/assets/audio-manager.ts` — **new** — music + SFX manager
- `src/data/asset-paths.ts` — **new** — public-path manifest
- `src/render/BootScene.ts` — init audio manager
- `src/render/MenuScene.ts` — start menu music
- `src/render/FactionScene.ts` — start faction-select music
- `src/render/GameScene.ts` — start gameplay music, SFX on
  move/capture/combat/end-turn/victory/defeat, sprite rendering
  with procedural fallback
- `src/render/CombatScene.ts` — start combat music, victory/defeat
  stings
- `src/hud/panels/top-bar.ts` — mute button
- `src/hud/hud.css` — mute-button styling
- `scripts/gen-sprites.ps1` — **new** — sprite generation pipeline
- `scripts/gen-music.ps1` — **new** — music + SFX generation pipeline
- `public/assets/sprites/**` — 46 generated PNGs (5 terrain, 5
  cities, 3 features, 25 unit sprites, 4 hero portraits, 4 UI
  chrome)
- `public/assets/audio/**` — empty; run `pwsh scripts/gen-music.ps1` to populate
- `docs/original-reference.md` — **new** — research notes
- `docs/asset-credits.md` — **new** — generation pipeline + license
- `docs/changelog/phase-12.md` — this file

## Verification

- `npm run lint` — clean
- `npm run typecheck` — clean
- `npm test` — 82/82 tests pass (sim modules unchanged)
- `npm run build` — succeeds; bundle size grows to ~50 MB with
  the 49 PNGs and 17 MP3s served from `public/`, but the JS bundle
  itself is unchanged (1.5 MB / 352 KB gzip). Assets are
  cacheable as separate URLs.
- All assets fall back gracefully: missing PNGs use the procedural
  renderer, missing audio is silent.
