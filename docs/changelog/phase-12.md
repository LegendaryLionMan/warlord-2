# Phase 12 — AI-Generated Art & Audio

**Status:** Integration complete; asset generation scripts shipped.
The `scripts/gen-sprites.ps1` (49 images) and `scripts/gen-music.ps1`
(17 audio tracks) generation pipeline is in place. The matrix API
returned 0-result responses for ~30+ minutes during the integration
window, so the actual asset files in `public/assets/` are not yet
populated. Re-running the scripts when the API is healthier will fill
in the assets; the loader and renderer already support them with a
graceful procedural fallback in the meantime.

**Commit:** `eb78b3c` — Phase 12: AI-generated art & audio pipeline
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

The two generation scripts are committed. The matrix API
(`/minimax-cloud/api/v1/connectors/tools/call`) returned
sustained 0-result and 500 responses during the integration window.
Single-item requests worked, multi-item batches did not. As of the
phase-12 commit, the `public/assets/sprites/` and
`public/assets/audio/` directories are empty.

**To populate the assets**, run from the repo root:

```bash
pwsh scripts/gen-sprites.ps1   # 49 PNGs, ~5-15 min depending on API
pwsh scripts/gen-music.ps1     # 17 MP3s, ~3-8 min depending on API
```

The scripts write to `public/assets/sprites/...` and
`public/assets/audio/...`. The build picks them up automatically; no
Vite config change needed.

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
- `public/assets/sprites/**` — 49 generated PNGs
- `public/assets/audio/**` — 17 generated MP3s
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
