/**
 * Game-wide constants. Balance numbers, tile size, palette.
 *
 * Anything numerical that affects gameplay lives here so the simulation
 * is easy to tune and test. The renderer reads these for visual choices;
 * the simulation reads them for rules.
 */

import type { FactionId, TerrainId, UnitId } from './sim/state';

/** Tile size in pixels at 1x zoom. */
export const TILE_SIZE = 32;

/** Map dimensions. The original game is 32x32; we keep that. */
export const MAP_WIDTH = 32;
export const MAP_HEIGHT = 32;

/** Factions. Mirrors data/factions.ts but is the canonical list. */
export const FACTIONS: FactionId[] = ['humans', 'elves', 'orcs', 'undead'];

/** Default number of AI opponents. */
export const DEFAULT_FACTION_COUNT = 4;

/** Faction color palette — primary, secondary, accent (Phaser 24-bit color integers). */
export const FACTION_COLORS: Record<FactionId, { primary: number; secondary: number; accent: number; text: string }> = {
  humans: { primary: 0x3b6fb6, secondary: 0x1e3a8a, accent: 0x6aa3e8, text: '#e8efff' },
  elves: { primary: 0x2f8a4a, secondary: 0x14532d, accent: 0x5cc480, text: '#e8f5ec' },
  orcs: { primary: 0x9b2a2a, secondary: 0x5a1414, accent: 0xcc5050, text: '#f5e8e8' },
  undead: { primary: 0x6b3a8a, secondary: 0x3a1a5a, accent: 0x9a6cc0, text: '#f0e8f5' },
};

/** Terrain table — used by the renderer. The sim has its own per-terrain move/defense. */
export const TERRAIN_COLORS: Record<TerrainId, { base: string; alt: string; edge: string }> = {
  plains: { base: '#6b8e5a', alt: '#5a7e4a', edge: '#4a6e3a' },
  forest: { base: '#2d5a2d', alt: '#1e4e1e', edge: '#0f3f0f' },
  hills: { base: '#8b6b4a', alt: '#7a5a3a', edge: '#6a4a2a' },
  mountains: { base: '#5a5a6a', alt: '#4a4a5a', edge: '#3a3a4a' },
  water: { base: '#2a4a7a', alt: '#1a3a6a', edge: '#0a2a5a' },
};

/** UI palette — kept here so HUD CSS variables and Phaser can share. */
export const UI_COLORS = {
  background: '#0f0f17',
  panel: '#1a1a2a',
  panelEdge: '#2a2a4a',
  border: '#0f3460',
  text: '#e8e4d9',
  textDim: '#a09080',
  accent: '#e94560',
  gold: '#ffd700',
  parchment: '#2a2319',
} as const;

/** Phaser 24-bit color integers for the same UI palette. */
export const UI_COLORS_NUM = {
  background: 0x0f0f17,
  panel: 0x1a1a2a,
  panelEdge: 0x2a2a4a,
  border: 0x0f3460,
  text: 0xe8e4d9,
  textDim: 0xa09080,
  accent: 0xe94560,
  gold: 0xffd700,
  parchment: 0x2a2319,
} as const;

/** Starting resources. */
export const STARTING_GOLD = 500;

/** City income per turn. */
export const CITY_INCOME_PER_TURN = 100;

/** Map-feature placement. */
export const CITY_COUNT_PER_FACTION = 2;
export const MINE_COUNT = 6;
export const RUIN_COUNT = 4;
export const ARMORY_COUNT = 2;

/** Combat. */
export const ATTACK_DIE_SIDES = 6;
export const DEFENSE_DIE_SIDES = 4;
export const UNDEAD_RESURRECT_FRACTION = 0.2;

/** Fog of war. */
export const VISION_RADIUS_NORMAL = 3;
export const VISION_RADIUS_HERO = 5;
export const VISION_RADIUS_SCOUT = 7;

/** Unit roster — referenced by data/units.ts. */
export const UNIT_IDS: UnitId[] = ['militia', 'spearman', 'archer', 'knight', 'cavalry', 'wizard', 'giant'];
