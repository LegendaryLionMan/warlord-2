/**
 * Procedural map generation.
 *
 * Generates a 32x32 (or whatever the state's dimensions are) terrain map
 * with the rough proportions of the the 1990s 4X wargame tradition. The algorithm is
 * deliberately simple — distance-from-center for water on the map edges,
 * uniform random for everything else, then a few "lakes" cleared to break
 * up impassable clusters. Phase 9's asset pass replaces the procedural
 * rendering; the data model is what matters here.
 *
 * Pure function. No Phaser, no DOM. Fully unit-testable.
 */

import { TERRAIN } from '../data/terrain';
import type { GameState, Tile, TerrainId } from './state';

/** Per-terrain target proportions. Sum should be <= 1; remainder is plains. */
const TERRAIN_PROPORTIONS: Record<TerrainId, number> = {
  water: 0.05,
  mountains: 0.08,
  hills: 0.18,
  forest: 0.18,
  plains: 0.51,
};

/** Edge band where water is more likely. */
const EDGE_BAND_NORMALIZED = 0.85;
/** Within the edge band, water has this probability per-tile. */
const EDGE_WATER_BIAS = 0.18;

/** Seeded PRNG (mulberry32) — deterministic per seed. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generate a Tile at (x, y) given the center distance. */
function pickTerrain(
  x: number,
  y: number,
  width: number,
  height: number,
  rand: () => number,
): TerrainId {
  const cx = width / 2;
  const cy = height / 2;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  const maxDist = Math.sqrt(cx ** 2 + cy ** 2);
  const normalizedDist = dist / maxDist;

  // Edge bias: water more likely on the map edges
  if (normalizedDist > EDGE_BAND_NORMALIZED && rand() < EDGE_WATER_BIAS) {
    return 'water';
  }

  // Uniform random pick against cumulative proportions
  const r = rand();
  let acc = 0;
  for (const terrain of ['water', 'mountains', 'hills', 'forest', 'plains'] as TerrainId[]) {
    acc += TERRAIN_PROPORTIONS[terrain];
    if (r < acc) return terrain;
  }
  return 'plains';
}

/** Clears some water tiles to break up impassable clusters (lakes instead of seas). */
function punchLakes(state: GameState, rand: () => number, count: number): void {
  for (let i = 0; i < count; i++) {
    const rx = Math.floor(rand() * state.mapWidth);
    const ry = Math.floor(rand() * state.mapHeight);
    const row = state.map[ry];
    if (row && row[rx] && row[rx].terrain === 'water') {
      row[rx] = { terrain: 'plains', variation: rand() };
    }
  }
}

/** Public: populate `state.map` with procedurally generated terrain. */
export function generateMap(state: GameState, seed = Date.now()): void {
  const rand = mulberry32(seed);
  state.map = [];
  for (let y = 0; y < state.mapHeight; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < state.mapWidth; x++) {
      const terrain = pickTerrain(x, y, state.mapWidth, state.mapHeight, rand);
      row.push({ terrain, variation: rand() });
    }
    state.map.push(row);
  }
  punchLakes(state, rand, 6);
}

/** True if the tile is passable ground (excludes water and mountains). */
export function isPassable(state: GameState, x: number, y: number): boolean {
  const row = state.map[y];
  if (!row) return false;
  const tile = row[x];
  if (!tile) return false;
  return TERRAIN[tile.terrain].passable;
}

/** Returns the tile at (x, y) or null if out of bounds. */
export function tileAt(state: GameState, x: number, y: number): Tile | null {
  if (x < 0 || x >= state.mapWidth || y < 0 || y >= state.mapHeight) return null;
  const row = state.map[y];
  if (!row) return null;
  return row[x] ?? null;
}
