# Asset Credits & Generation

## Visual style

The original *Warlords II* (1993, Strategic Studies Group) is a 256-color
SVGA pixel-art game. Modern generative image models cannot produce true
8-bit pixel art, so the assets in this project are AI-assisted **painted
fantasy illustrations** in a style that evokes the 1993 hand-drawn
aesthetic: heavy dithering, bright saturated colors, isometric city
views, top-down terrain tiles, and a single isolated subject per sprite.

Where the source game painted each faction in a "uniform color" and
re-tinted a base sprite, we generated one sprite per (unit, faction)
combination — 28 unit variants in total — so each army has its own
distinct look.

## Audio style

The original soundtrack by Steve Fawkner (CD-audio in *Warlords II
Deluxe*, 1995) is 15 original fantasy-RPG tracks plus CD-audio stings.
This project does **not** include any of the original audio. Music and
SFX were generated from scratch in a 1990s-CD-audio orchestral style
(see `scripts/gen-music.ps1` for the exact prompts).

## Generation pipeline

- **Source** — `scripts/gen-sprites.ps1`, `scripts/gen-music.ps1`
- **API** — MiniMax / MiniMax connector tools
  (`connector__matrix__generate_image`, `connector__matrix__batch_text_to_music`)
- **Files served from** — `public/assets/`
- **Loaders** — `src/assets/loader.ts`, `src/assets/audio-manager.ts`
- **Manifest** — `src/data/asset-paths.ts`

The scripts are idempotent and re-runnable. If a generation request
fails (transient network errors are common with matrix APIs), the
script retries up to 4 times per batch with exponential backoff. The
loader treats any missing asset as a soft failure and falls back to the
procedural-renderer / silent code path.

## Asset inventory (49 sprites, 17 audio tracks)

### Sprites

| Category | Count | Path |
|----------|------:|------|
| Terrain tiles | 5 | `public/assets/sprites/terrain/` |
| Map features (mine, ruin, armory) | 3 | `public/assets/sprites/features/` |
| Cities (4 factions + neutral) | 5 | `public/assets/sprites/cities/` |
| Hero portraits (4 factions) | 4 | `public/assets/sprites/heroes/` |
| Unit sprites (7 kinds × 4 factions) | 28 | `public/assets/sprites/units/<faction>/` |
| UI chrome (cursor, selection, range highlights) | 4 | `public/assets/sprites/ui/` |
| **Total** | **49** | |

### Audio

| Category | Count | Path |
|----------|------:|------|
| Music tracks (menu, faction-select, gameplay, combat, victory, defeat, ambient) | 7 | `public/assets/audio/music/` |
| Sound effects (sword, arrow, magic, move, recruit, city-capture, victory-sting, defeat-sting, click, error) | 10 | `public/assets/audio/sfx/` |
| **Total** | **17** | |

## URL-flag controls

| Param | Effect |
|-------|--------|
| `?mute=1` | Mute all music and SFX. |
| `?music=0` | Disable music only. |
| `?sfx=0` | Disable sound effects only. |
| `?motion=0` | Disable movement tween (visual; unchanged by audio work). |

## Image-generation prompts (representative)

```
StyleUnit:    1990s fantasy strategy game unit icon, painted semi-realistic
              fantasy illustration with crisp edges, isolated on transparent
              background, centered, single subject, no scenery, no text

Per-faction:  humans — royal blue + gold livery, steel weapons, blue and gold
                       banner
              elves  — forest green + silver livery, silver weapons, green
                       and silver banner
              orcs   — crimson + black livery, rusted iron weapons, red and
                       black banner with crude skull totem
              undead — dark purple + bone-white livery, dark steel weapons,
                       tattered purple and bone banner
```

The full manifest is in `scripts/gen-sprites.ps1` (search for
`$Assets = [ordered]@{}`).

## Music-generation prompts (representative)

```
music.menu:           Epic cinematic orchestral opening theme, sweeping
                      strings, heroic brass fanfare, fantasy strategy game
                      main menu soundtrack, grand reverent and inviting,
                      1990s CD-audio orchestral style, no vocals

music.faction-select: Mystical fantasy faction select theme, ethereal female
                      choir singing softly, crystalline harp arpeggios,
                      magical ceremony, ceremonial and ancient

music.gameplay:       Calm medieval fantasy exploration music, soft wooden
                      flute and lute duet, gentle pastoral, peaceful
                      wandering, 1990s fantasy strategy game ambient
```

The full manifest is in `scripts/gen-music.ps1`.

## License

All generated assets in `public/assets/` are produced from prompts
authored for this project. They are released under the same terms as
the surrounding code (see root `LICENSE`). The generated art is not a
copy of any original *Warlords II* asset — every image and audio clip
was generated from a text prompt that did not name a specific
copyrighted work.

If you regenerate an asset, the new file may differ from the committed
one even with the same prompt and seed (model updates, stochastic
sampling). Re-running `scripts/gen-sprites.ps1` will overwrite the
files in place.
