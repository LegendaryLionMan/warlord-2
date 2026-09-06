/**
 * Pathfinding. Phase 2 uses BFS with terrain-weighted costs. Phase 5 swaps
 * the AI's pathfinding for A* (manhattan + tile cost) but BFS remains the
 * default for player movement-range queries — the right answer is "every
 * tile you can reach", not "the shortest path to one tile".
 *
 * Pure functions. No Phaser, no DOM. Fully unit-tested.
 */

import { isPassable } from './map';
import { TERRAIN } from '../data/terrain';
import type { GameState } from './state';

export interface ReachableTile {
  x: number;
  y: number;
  cost: number;
}

const NEIGHBOR_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

/**
 * BFS from (startX, startY) with `movePoints` budget. Returns every tile
 * the army can stand on at the end of its move — including tiles reached
 * with a partial budget remaining.
 */
export function bfsReachable(
  state: GameState,
  startX: number,
  startY: number,
  movePoints: number,
): ReachableTile[] {
  if (movePoints <= 0) return [];
  const result: ReachableTile[] = [];
  const visited = new Map<string, number>();
  const queue: Array<{ x: number; y: number; cost: number }> = [{ x: startX, y: startY, cost: 0 }];
  visited.set(`${startX},${startY}`, 0);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    if (current.cost > 0) {
      result.push({ x: current.x, y: current.y, cost: current.cost });
    }
    for (const [dx, dy] of NEIGHBOR_OFFSETS) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      if (nx < 0 || nx >= state.mapWidth || ny < 0 || ny >= state.mapHeight) continue;
      if (!isPassable(state, nx, ny)) continue;
      const tile = state.map[ny]?.[nx];
      if (!tile) continue;
      const moveCost = TERRAIN[tile.terrain].moveCost;
      if (moveCost === Infinity) continue;
      const newCost = current.cost + moveCost;
      if (newCost > movePoints) continue;
      const key = `${nx},${ny}`;
      const prev = visited.get(key);
      if (prev !== undefined && prev <= newCost) continue;
      visited.set(key, newCost);
      queue.push({ x: nx, y: ny, cost: newCost });
    }
  }
  return result;
}
