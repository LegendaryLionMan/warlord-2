/**
 * GameState — the single source of truth for the simulation.
 *
 * Hard rule: only modules under src/sim/ may mutate GameState. Phaser scenes
 * and the HUD read it and emit input actions back; they never write to it.
 *
 * The shape of this object is also the on-disk save format. Add new fields
 * to the GameState type with care — saves from earlier versions may need
 * migration in src/save/serialize.ts.
 */

import { STARTING_GOLD, MAP_WIDTH, MAP_HEIGHT, DEFAULT_FACTION_COUNT } from '../config';

/** Stable string identifiers. Avoid using raw strings in gameplay code. */
export type FactionId = 'humans' | 'elves' | 'orcs' | 'undead';
export type TerrainId = 'plains' | 'forest' | 'hills' | 'mountains' | 'water';
export type UnitId = 'militia' | 'spearman' | 'archer' | 'knight' | 'cavalry' | 'wizard' | 'giant';
export type OwnerId = FactionId | 'neutral';

/** A single tile on the map. */
export interface Tile {
  terrain: TerrainId;
  /** 0..1 random value used to vary tile rendering. */
  variation: number;
}

/** A unit in a stack. */
export interface Unit {
  id: UnitId;
  /** Current HP. */
  hp: number;
  /** Max HP. Snapshot of the template's HP at recruitment time. */
  maxHp: number;
  /** Attack stat. */
  attack: number;
  /** Defense stat. */
  defense: number;
  /** Movement points remaining this turn. */
  moves: number;
  /** Max movement points (template). */
  maxMoves: number;
  /** Ranged attack. */
  ranged: boolean;
  /** Range in tiles if ranged. */
  range: number;
  /** Bonus damage vs cavalry (Spearman). */
  vsCavalry: number;
  /** Bonus magic damage vs Undead (Wizard). */
  magic: number;
}

/** A hero leading a stack. */
export interface Hero {
  id: string;
  name: string;
  level: number;
  exp: number;
  owner: OwnerId;
  attackBonus: number;
  defenseBonus: number;
  /** Unlocked hero abilities. */
  abilities: HeroAbilityId[];
}

/** Hero ability identifiers. */
export type HeroAbilityId = 'leadership' | 'fortify' | 'rally' | 'scout';

/** A stack of units on the map, optionally led by a hero. */
export interface Army {
  id: string;
  x: number;
  y: number;
  owner: OwnerId;
  units: Unit[];
  hero: Hero | null;
  /** Tiles this army can move to on the current turn. */
  moves: Array<{ x: number; y: number }>;
  /** True if the army has already acted this turn. */
  hasMoved: boolean;
  /** Optional fortify bonus (from Fortify ability). */
  fortifyBonus: number;
}

/** A city on the map. */
export interface City {
  id: string;
  x: number;
  y: number;
  name: string;
  owner: OwnerId;
  size: 1 | 2 | 3;
  goldPerTurn: number;
  garrison: Unit[];
  production: ProductionOrder[];
}

/** A pending unit production in a city. */
export interface ProductionOrder {
  unitId: UnitId;
  turnsRemaining: number;
}

/** A map feature: mine, ruin, or armory. */
export interface MapFeature {
  id: string;
  type: 'mine' | 'ruin' | 'armory';
  x: number;
  y: number;
  /** For ruins, the resolved reward (gold, units, or artifact). */
  resolved: boolean;
}

/** The complete game state. */
export interface GameState {
  turn: number;
  gold: number;
  map: Tile[][];
  mapWidth: number;
  mapHeight: number;
  cities: City[];
  armies: Army[];
  heroes: Hero[];
  features: MapFeature[];
  playerFaction: FactionId;
  factionCount: number;
  fogOfWar: boolean;
  /** explored[y][x] = has the player ever seen this tile? */
  explored: boolean[][];
  /** Currently selected entity (army or city) for the player. */
  selectedEntity: Army | City | null;
  /** Camera position in pixels. */
  cameraX: number;
  cameraY: number;
  zoom: number;
  /** Animation frame counter for the renderer. */
  animFrame: number;
  /** Status of the game. */
  phase: 'menu' | 'faction-select' | 'playing' | 'won' | 'lost';
}

/** Factory for a fresh game state. The simulation calls this, not the renderer. */
export function createInitialState(options: Partial<Pick<GameState, 'mapWidth' | 'mapHeight' | 'playerFaction' | 'factionCount' | 'fogOfWar'>> = {}): GameState {
  const mapWidth = options.mapWidth ?? MAP_WIDTH;
  const mapHeight = options.mapHeight ?? MAP_HEIGHT;
  const factionCount = options.factionCount ?? DEFAULT_FACTION_COUNT;
  const playerFaction = options.playerFaction ?? 'humans';
  const fogOfWar = options.fogOfWar ?? true;

  return {
    turn: 1,
    gold: STARTING_GOLD,
    map: [],
    mapWidth,
    mapHeight,
    cities: [],
    armies: [],
    heroes: [],
    features: [],
    playerFaction,
    factionCount,
    fogOfWar,
    explored: [],
    selectedEntity: null,
    cameraX: 0,
    cameraY: 0,
    zoom: 1,
    animFrame: 0,
    phase: 'menu',
  };
}

/** Type guard: is the selected entity an army? */
export function isArmy(entity: Army | City | null): entity is Army {
  return entity !== null && 'units' in entity;
}

/** Type guard: is the selected entity a city? */
export function isCity(entity: Army | City | null): entity is City {
  return entity !== null && 'garrison' in entity;
}
