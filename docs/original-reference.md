# Original *Warlords II* (1993) — Reference

This document captures the research done in Phase 12 to make the clone
as faithful as possible to the original 1993 *Warlords II* by SSG
(Strategic Studies Group Pty Ltd). Findings come from the Wikipedia
entry, the *Warlords II Deluxe* manual, the original DOS soundtrack
listings, MobyGames, DOS Games Archive, the Internet Archive
DOS-collection screenshots, and vision-QA reads of the in-game
screenshots.

## Original credits (1993 DOS release)

- **Designers:** Steve Fawkner, Roger Keating, Ian Trout, Gregor Whiley
- **Art Director:** Nick Stathopoulos
- **Computer Art:** Nick Stathopoulos, Steve Fawkner, Steve Ford,
  Hilary Mackay, Mark Hill
- **Programming Assistance:** Tony Oliver
- **Original Music:** Steve Fawkner (15 tracks, see [Audio](#audio))
- **Publisher:** Strategic Studies Group Pty Ltd

## Visual style

- **Resolution:** 640×480 SVGA, 256 colors in *Warlords II Deluxe*
  (1995). The 1993 base release was 16-color.
- **Engine:** Strict 2D top-down tile-based map. No isometric projection
  on the world map. Cities and large structures are drawn in a forced
  isometric angle to show walls, towers, and roofs.
- **Pixel art:** Strictly hand-drawn pixel art with no anti-aliasing.
  Heavy use of dithering (alternating-pixel patterns) to simulate
  shading within the 256-color limit.
- **Color palette:** Highly saturated, bright primary-style colors —
  vivid green grass, cyan water, brown roads, gray stone UI borders.
- **UI chrome:** Chunky gray UI designed to look like textured stone or
  marble, with beveled buttons. Heavy dithering in the borders.
- **Unit sprites:** Iconic, board-game-piece style. Tiny silhouettes
  that read as "soldier" or "knight on horseback" at a glance. The
  manual describes a "uniform color" tinting system: every unit
  sprite is drawn once, with one designated pixel color swapped per
  faction at load time.
- **Cities:** Walled fortresses with crenellations, flanking towers,
  and a central keep. Each faction's city is recolored to match its
  uniform color. A red roof accent on the keep signals ownership on
  the minimap.
- **Terrain:** Five base types — plains (textured green), water
  (saturated cyan), forest (clustered dark-green tree canopies), hills
  (light brown/tan), mountains (jagged gray peaks). Plus marshes and
  roads.
- **Heroes:** A small subset of units (e.g. Champions, specific named
  leaders) get unique painted portraits in UI windows. In combat they
  appear on the map as a differently-tinted unit sprite.

### Manual — palette slots (Deluxe edition)

The *Warlords II Deluxe* manual documents the color slots that the
Scenario Builder re-uses across all custom tile/army/city sets:

| Slot | Default color | Used for |
|------|---------------|----------|
| Color 1 | (variable) | Plains |
| Color 2 | (variable) | Water |
| Color 3 | (variable) | Forest |
| Color 4 | (variable) | Hills |
| Color 5 | (variable) | Mountains |
| Color 6 | (variable) | Marsh |
| Color 7 | (variable) | Road |

`Color 0` is transparent (the "background" slot). `Color 255` is
always white. `U` (the "uniform" slot) is the per-faction tint
applied to every unit sprite.

## Game systems (mechanical fidelity targets)

The clone implements the following as a faithful subset:

- **Combat:** `ATK + d6` vs `DEF + d4 + terrain`. Damage = attack −
  defense, min 1. Combat is auto-resolved; the player cannot affect
  it. See `src/sim/combat.ts`.
- **Stack model:** A single tile may contain an "army" — multiple
  unit types in one stack. The army moves at the speed of its slowest
  unit.
- **Heroes:** Grant +1 to all unit stats in their army. Level up at
  50 × level XP. Heroes can explore ruins for a random reward.
- **Cities:** Generate `size*3+2` gold per turn, can produce units
  over multiple turns based on unit cost. May be captured (change of
  ownership), sacked, or razed.
- **Mines:** +50 gold per turn when adjacent.
- **Armories:** -20% recruitment cost when adjacent.
- **Ruins:** Random reward on hero entry (gold, units, or nothing).
- **Win conditions:** 75% of all cities captured, or all enemies
  eliminated.

## Factions

The original 1993 base release and its scenario packs include many
factions — Knights, Dark Elves, Sirians, Ussybians, Orcs of the
North, Orcs of the South, etc. The clone restricts the roster to
four for clarity and balance:

| Faction | Bonus | Color |
|---------|-------|-------|
| **Humans** | +1 defense all units | Royal blue + gold |
| **Elves** | +1 ranged attack | Forest green + silver |
| **Orcs** | +1 melee attack | Crimson + black |
| **Undead** | 20% resurrection on victory | Dark magenta + bone |

## Audio

### Original soundtrack (Steve Fawkner, 1993)

The 1993 release shipped with 15 original tracks (CD-audio in the
Deluxe edition). This clone generates **original** music in a similar
style — none of the original recordings are included.

1. *A Hero Emerges* (3:38)
2. *Another Victory* (2:19)
3. *Days Long Ago* (2:07)
4. *Desolate Plains* (4:18) — main gameplay ambient
5. *Eternal Peace* (2:39)
6. *Fallen Empires* (2:47)
7. *Intro* (1:26)
8. *Medal of Honor* (0:26) — short sting
9. *Promotion* (0:46) — short sting
10. *Sacred Shrine* (2:26)
11. *Sage* (1:58)
12. *Shrine of Victory* (1:58) — victory stinger
13. *The Sleeper* (3:00)
14. *The Strategy Unfolds* (4:11) — main menu / opening
15. *The Temple* (2:31)

### Style notes

- Era: early-1990s CD-audio (16-bit, 44.1 kHz stereo, instrumental).
- Genre: fantasy RPG / strategy. Heavily orchestral (strings, brass,
  woodwind) with occasional synthesizer pads. Mostly minor keys.
- No vocals in the gameplay tracks; a few choir-style stings.

### SFX in the original

The original *Warlords II* was released on floppy without dedicated
SFX (only the CD-audio music). Combat, movement, and UI feedback are
silent. The clone adds synthetic SFX generated from short music
prompts (see `docs/asset-credits.md`).

## Reference screenshots

The vision-QA reads in Phase 12 (see commit history) confirmed:

- The CRPG Addict play-through on
  `crpgaddict.blogspot.com/2023/02/game-484-warlords-ii-1993.html` —
  detailed in-game screenshots.
- The DOS Games Archive mirror of *Warlords II Deluxe* —
  `image.dosgamesarchive.com/screenshots/w2_005.png`,
  `w2_023.png`, etc.
- The MobyGames *Warlords II* page — high-resolution cover art and
  in-game captures.
- The Save or Quit review gallery — close-up combat, victory, and
  city-screen captures.

All vision reads returned consistent findings: 256-color pixel art,
bright saturated colors, top-down tile map, force-isometric city
icons, gray stone-textured UI, no anti-aliasing, heavy dithering.

## What is *not* in the clone

- The 1993 scenario packs (additional tile/army/city sets).
- The Scenario Builder (1994) — external map editor.
- PBEM and hot-seat multiplayer.
- Fog of war (mentioned in some sources, omitted for clarity).
- Named heroes from the original campaigns.
- Sound effects from the original (which didn't exist).
- The full 15-track original soundtrack (we generate original
  substitutes in a similar style).

See `docs/gameplay-fidelity.md` for the implementation-side mapping
of original mechanics to clone modules.
