/**
 * Unit templates. Pure data, no logic.
 *
 * The simulation reads these when creating Unit instances. Faction bonuses
 * (in factions.ts) modify the effective stats at combat time, not the
 * templates themselves.
 */

import type { UnitId } from '../sim/state';

export interface UnitTemplate {
  id: UnitId;
  name: string;
  icon: string;
  cost: number;
  hp: number;
  attack: number;
  defense: number;
  moves: number;
  ranged: boolean;
  range: number;
  vsCavalry: number;
  magic: number;
  buildTime: number;
  description: string;
}

export const UNITS: Record<UnitId, UnitTemplate> = {
  militia: {
    id: 'militia',
    name: 'Militia',
    icon: '⚔',
    cost: 50,
    hp: 4,
    attack: 2,
    defense: 1,
    moves: 2,
    ranged: false,
    range: 0,
    vsCavalry: 0,
    magic: 0,
    buildTime: 1,
    description: 'Cheap starting unit. Limited combat ability but easy to recruit.',
  },
  spearman: {
    id: 'spearman',
    name: 'Spearman',
    icon: '◈',
    cost: 100,
    hp: 6,
    attack: 3,
    defense: 2,
    moves: 2,
    ranged: false,
    range: 0,
    vsCavalry: 2,
    magic: 0,
    buildTime: 1,
    description: 'Pikeman effective against mounted units. Solid defensive unit.',
  },
  archer: {
    id: 'archer',
    name: 'Archer',
    icon: '➶',
    cost: 150,
    hp: 4,
    attack: 4,
    defense: 1,
    moves: 2,
    ranged: true,
    range: 2,
    vsCavalry: 0,
    magic: 0,
    buildTime: 2,
    description: 'Ranged attacker. Hits from 2 tiles away but fragile in melee.',
  },
  knight: {
    id: 'knight',
    name: 'Knight',
    icon: '⌬',
    cost: 250,
    hp: 10,
    attack: 5,
    defense: 4,
    moves: 3,
    ranged: false,
    range: 0,
    vsCavalry: 0,
    magic: 0,
    buildTime: 2,
    description: 'Heavily armoured mounted warrior. High HP and strong defense.',
  },
  cavalry: {
    id: 'cavalry',
    name: 'Cavalry',
    icon: '♞',
    cost: 300,
    hp: 8,
    attack: 6,
    defense: 3,
    moves: 4,
    ranged: false,
    range: 0,
    vsCavalry: 0,
    magic: 0,
    buildTime: 2,
    description: 'Fastest unit on the map. Great for raids and flanking.',
  },
  wizard: {
    id: 'wizard',
    name: 'Wizard',
    icon: '✦',
    cost: 400,
    hp: 4,
    attack: 7,
    defense: 1,
    moves: 2,
    ranged: false,
    range: 0,
    vsCavalry: 0,
    magic: 3,
    buildTime: 3,
    description: 'High damage spellcaster. Bonus magic damage vs Undead.',
  },
  giant: {
    id: 'giant',
    name: 'Giant',
    icon: '☗',
    cost: 500,
    hp: 15,
    attack: 8,
    defense: 5,
    moves: 2,
    ranged: false,
    range: 0,
    vsCavalry: 0,
    magic: 0,
    buildTime: 4,
    description: 'Siege-class unit. Highest HP and damage in the roster. Slow.',
  },
  settler: {
    // Phase 16 — the Settler unit. Cannot attack or defend. Walks onto
    // an unowned tile and founds a new city for the player's faction.
    // Modeled after the Settler archetype: 0 ATK, 0 DEF, low
    // HP, but unique "build" ability.
    id: 'settler',
    name: 'Settler',
    icon: '⌂',
    cost: 200,
    hp: 3,
    attack: 0,
    defense: 0,
    moves: 2,
    ranged: false,
    range: 0,
    vsCavalry: 0,
    magic: 0,
    buildTime: 2,
    description: 'Founding colonist. Walks onto an empty tile to found a new city. Cannot fight.',
  },
};

export const UNIT_LIST: UnitTemplate[] = Object.values(UNITS);
