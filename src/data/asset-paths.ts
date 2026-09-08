/**
 * Phase 12 — Asset manifest with public-paths.
 *
 * Maps each manifest key to the public URL of its generated asset
 * (sprites under /assets/sprites/, audio under /assets/audio/).
 *
 * If a file is missing, the loader logs a warning and the renderers
 * fall back to the procedural sprite / no-sound code paths.
 *
 * Audio manifest follows the same pattern.
 */

import { SPRITE_KEYS } from './manifests';

const BASE = '/assets';

function spritePath(file: string): string {
  return `${BASE}/sprites/${file}`;
}

function audioPath(file: string): string {
  return `${BASE}/audio/${file}`;
}

/** Map each SpriteKey to its public file path. */
export const SPRITE_PATHS: Record<string, string> = {
  // Tiles
  [SPRITE_KEYS.tilePlains]:    spritePath('terrain/plains.png'),
  [SPRITE_KEYS.tileForest]:    spritePath('terrain/forest.png'),
  [SPRITE_KEYS.tileHills]:     spritePath('terrain/hills.png'),
  [SPRITE_KEYS.tileMountains]: spritePath('terrain/mountains.png'),
  [SPRITE_KEYS.tileWater]:     spritePath('terrain/water.png'),

  // Cities
  [SPRITE_KEYS.cityHumans]:   spritePath('cities/humans.png'),
  [SPRITE_KEYS.cityElves]:    spritePath('cities/elves.png'),
  [SPRITE_KEYS.cityOrcs]:     spritePath('cities/orcs.png'),
  [SPRITE_KEYS.cityUndead]:   spritePath('cities/undead.png'),
  [SPRITE_KEYS.cityNeutral]:  spritePath('cities/neutral.png'),

  // Features
  [SPRITE_KEYS.featureMine]:   spritePath('features/mine.png'),
  [SPRITE_KEYS.featureRuin]:   spritePath('features/ruin.png'),
  [SPRITE_KEYS.featureArmory]: spritePath('features/armory.png'),

  // UI
  [SPRITE_KEYS.uiCursor]:         spritePath('ui/cursor.png'),
  [SPRITE_KEYS.uiSelection]:      spritePath('ui/selection.png'),
  [SPRITE_KEYS.uiMoveHighlight]:  spritePath('ui/move-highlight.png'),
  [SPRITE_KEYS.uiAttackHighlight]:spritePath('ui/attack-highlight.png'),

  // Heroes
  [SPRITE_KEYS.heroHumans]:   spritePath('heroes/humans.png'),
  [SPRITE_KEYS.heroElves]:    spritePath('heroes/elves.png'),
  [SPRITE_KEYS.heroOrcs]:     spritePath('heroes/orcs.png'),
  [SPRITE_KEYS.heroUndead]:   spritePath('heroes/undead.png'),
  [SPRITE_KEYS.heroSiroms]:    spritePath('heroes/humans.png'),
  [SPRITE_KEYS.heroNightelves]: spritePath('heroes/humans.png'),
  [SPRITE_KEYS.heroFey]:       spritePath('heroes/humans.png'),
  [SPRITE_KEYS.heroSyrnyn]:    spritePath('heroes/humans.png'),
};

/** Build the dynamic unit-sprite path from kind and faction. */
export function unitSpritePath(unit: string, faction: string): string {
  return spritePath(`units/${faction}/${unit}.png`);
}

/** Build the hero portrait path from faction. */
export function heroSpritePath(faction: string): string {
  return spritePath(`heroes/${faction}.png`);
}

/** Audio asset paths. */
export const AUDIO_PATHS: Record<string, string> = {
  // Music tracks (looping)
  'music.menu':           audioPath('music/menu.mp3'),
  'music.faction-select': audioPath('music/faction-select.mp3'),
  'music.gameplay':       audioPath('music/gameplay.mp3'),
  'music.combat':         audioPath('music/combat.mp3'),
  'music.victory':        audioPath('music/victory.mp3'),
  'music.defeat':         audioPath('music/defeat.mp3'),
  'music.ambient-pad':    audioPath('music/ambient-pad.mp3'),
  // Sound effects (one-shot)
  'sfx.sword':        audioPath('sfx/sword.mp3'),
  'sfx.arrow':        audioPath('sfx/arrow.mp3'),
  'sfx.magic':        audioPath('sfx/magic.mp3'),
  'sfx.move':         audioPath('sfx/move.mp3'),
  'sfx.recruit':      audioPath('sfx/recruit.mp3'),
  'sfx.city-capture': audioPath('sfx/city-capture.mp3'),
  'sfx.victory-sting':audioPath('sfx/victory-sting.mp3'),
  'sfx.defeat-sting': audioPath('sfx/defeat-sting.mp3'),
  'sfx.click':        audioPath('sfx/click.mp3'),
  'sfx.error':        audioPath('sfx/error.mp3'),
};

/** All sprite keys, in load order. */
export const ALL_SPRITE_KEYS: string[] = Object.keys(SPRITE_PATHS);

/** All audio keys, in load order. */
export const ALL_AUDIO_KEYS: string[] = Object.keys(AUDIO_PATHS);
