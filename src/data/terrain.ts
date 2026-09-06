/**
 * Terrain table. Pure data used by both the sim and the renderer.
 *
 * - moveCost: movement points to enter this tile
 * - defenseBonus: added to a defender's defense roll on this tile
 * - passable: false for mountains and water (units cannot enter)
 * - vision: a multiplier on vision range while standing here (forest = -1, hills = +1)
 */

import type { TerrainId } from '../sim/state';

export interface TerrainDefinition {
  id: TerrainId;
  name: string;
  moveCost: number;
  defenseBonus: number;
  passable: boolean;
  vision: number;
  description: string;
}

export const TERRAIN: Record<TerrainId, TerrainDefinition> = {
  plains: {
    id: 'plains',
    name: 'Plains',
    moveCost: 1,
    defenseBonus: 0,
    passable: true,
    vision: 0,
    description: 'Open ground. No movement or defense modifier.',
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    moveCost: 2,
    defenseBonus: 1,
    passable: true,
    vision: -1,
    description: 'Difficult terrain. Slows movement and gives a defense bonus, but reduces sight.',
  },
  hills: {
    id: 'hills',
    name: 'Hills',
    moveCost: 2,
    defenseBonus: 2,
    passable: true,
    vision: 1,
    description: 'Elevated ground. Strong defensive position with extended sight.',
  },
  mountains: {
    id: 'mountains',
    name: 'Mountains',
    moveCost: Infinity,
    defenseBonus: 0,
    passable: false,
    vision: 2,
    description: 'Impassable to ground units. Heroes can sometimes cross.',
  },
  water: {
    id: 'water',
    name: 'Water',
    moveCost: Infinity,
    defenseBonus: 0,
    passable: false,
    vision: 0,
    description: 'Impassable to ground units. Naval units required.',
  },
};

/** Returns the terrain definition. */
export function terrainAt(id: TerrainId): TerrainDefinition {
  return TERRAIN[id];
}
