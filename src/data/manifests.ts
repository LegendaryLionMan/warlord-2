/**
 * Asset manifest keys. Stable strings that gameplay code uses to load assets.
 *
 * The renderer maps these keys to actual Phaser loader calls in src/assets/loader.ts.
 * Never use raw file paths in gameplay code; always go through this manifest.
 */

export const SPRITE_KEYS = {
  // Tiles
  tilePlains: 'tile.plains',
  tileForest: 'tile.forest',
  tileHills: 'tile.hills',
  tileMountains: 'tile.mountains',
  tileWater: 'tile.water',

  // Cities, by faction
  cityHumans: 'city.humans',
  cityElves: 'city.elves',
  cityOrcs: 'city.orcs',
  cityUndead: 'city.undead',
  cityNeutral: 'city.neutral',

  // Armies: 7 unit types x 4 factions
  unitMilitiaHumans: 'unit.militia.humans',
  unitMilitiaElves: 'unit.militia.elves',
  unitMilitiaOrcs: 'unit.militia.orcs',
  unitMilitiaUndead: 'unit.militia.undead',

  unitSpearmanHumans: 'unit.spearman.humans',
  unitSpearmanElves: 'unit.spearman.elves',
  unitSpearmanOrcs: 'unit.spearman.orcs',
  unitSpearmanUndead: 'unit.spearman.undead',

  unitArcherHumans: 'unit.archer.humans',
  unitArcherElves: 'unit.archer.elves',
  unitArcherOrcs: 'unit.archer.orcs',
  unitArcherUndead: 'unit.archer.undead',

  unitKnightHumans: 'unit.knight.humans',
  unitKnightElves: 'unit.knight.elves',
  unitKnightOrcs: 'unit.knight.orcs',
  unitKnightUndead: 'unit.knight.undead',

  unitCavalryHumans: 'unit.cavalry.humans',
  unitCavalryElves: 'unit.cavalry.elves',
  unitCavalryOrcs: 'unit.cavalry.orcs',
  unitCavalryUndead: 'unit.cavalry.undead',

  unitWizardHumans: 'unit.wizard.humans',
  unitWizardElves: 'unit.wizard.elves',
  unitWizardOrcs: 'unit.wizard.orcs',
  unitWizardUndead: 'unit.wizard.undead',

  unitGiantHumans: 'unit.giant.humans',
  unitGiantElves: 'unit.giant.elves',
  unitGiantOrcs: 'unit.giant.orcs',
  unitGiantUndead: 'unit.giant.undead',

  // Heroes
  heroHumans: 'hero.humans',
  heroElves: 'hero.elves',
  heroOrcs: 'hero.orcs',
  heroUndead: 'hero.undead',
  // Phase 16 — 4 additional factions. We use the humans portrait as a
  // placeholder for the new ones; the factions are still selectable
  // and get their own unit tints and bonuses.
  heroSiroms: 'hero.siroms',
  heroNightelves: 'hero.nightelves',
  heroFey: 'hero.fey',
  heroSyrnyn: 'hero.syrnyn',

  // Map features
  featureMine: 'feature.mine',
  featureRuin: 'feature.ruin',
  featureArmory: 'feature.armory',

  // UI
  uiCursor: 'ui.cursor',
  uiSelection: 'ui.selection',
  uiMoveHighlight: 'ui.move-highlight',
  uiAttackHighlight: 'ui.attack-highlight',
} as const;

export type SpriteKey = (typeof SPRITE_KEYS)[keyof typeof SPRITE_KEYS];

export const AUDIO_KEYS = {
  move: 'audio.move',
  attack: 'audio.attack',
  victory: 'audio.victory',
  defeat: 'audio.defeat',
  endTurn: 'audio.end-turn',
  recruit: 'audio.recruit',
  cityCapture: 'audio.city-capture',
} as const;

export type AudioKey = (typeof AUDIO_KEYS)[keyof typeof AUDIO_KEYS];

export const FONT_KEYS = {
  cinzel: 'font.cinzel',
  cinzelBold: 'font.cinzel-bold',
  uncial: 'font.uncial',
} as const;

export type FontKey = (typeof FONT_KEYS)[keyof typeof FONT_KEYS];
