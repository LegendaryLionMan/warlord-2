/**
 * Map features: mines, ruins, armories. Pure data, no rules (rules
 * like mine income happen in the city/turn modules).
 */

import { mulberry32 } from './map';
import type { GameState, MapFeature } from './state';

let nextFeatureId = 1;

function makeFeatureId(): string {
  return `feature_${nextFeatureId++}`;
}

/** Create a map feature at (x, y) of the given type. */
export function createFeature(
  state: GameState,
  x: number,
  y: number,
  type: 'mine' | 'ruin' | 'armory',
): MapFeature {
  const f: MapFeature = {
    id: makeFeatureId(),
    type,
    x,
    y,
    resolved: false,
  };
  state.features.push(f);
  return f;
}

/** Procedurally place mines, ruins, armories. */
export function generateFeatures(state: GameState, seed = Date.now()): void {
  const rand = mulberry32(seed);
  const place = (type: 'mine' | 'ruin' | 'armory', count: number): void => {
    for (let i = 0; i < count; i++) {
      for (let attempt = 0; attempt < 50; attempt++) {
        const x = Math.floor(rand() * (state.mapWidth - 4)) + 2;
        const y = Math.floor(rand() * (state.mapHeight - 4)) + 2;
        const terrain = state.map[y]?.[x]?.terrain;
        if (terrain === 'water' || terrain === 'mountains') continue;
        if (state.cities.some((c) => c.x === x && c.y === y)) continue;
        if (state.features.some((f) => f.x === x && f.y === y)) continue;
        createFeature(state, x, y, type);
        break;
      }
    }
  };
  place('mine', 6);
  place('ruin', 4);
  place('armory', 2);
}

/** Returns the tile at the feature's coordinates or null. */
export function featureTileAt(state: GameState, x: number, y: number): MapFeature | null {
  return state.features.find((f) => f.x === x && f.y === y) ?? null;
}
