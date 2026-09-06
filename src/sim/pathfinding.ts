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

/** Manhattan distance heuristic. Admissible for grid movement. */
function heuristic(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

interface AStarNode {
  x: number;
  y: number;
  g: number;
  f: number;
}

/**
 * A* pathfinding from `start` to `goal` using terrain-weighted cost.
 * Returns the path (including start and goal) or empty if unreachable.
 */
export function aStarPath(
  state: GameState,
  start: { x: number; y: number },
  goal: { x: number; y: number },
): Array<{ x: number; y: number }> {
  if (start.x === goal.x && start.y === goal.y) return [start];

  const open = new Set<string>();
  const cameFrom = new Map<string, { x: number; y: number }>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  const startKey = `${start.x},${start.y}`;
  gScore.set(startKey, 0);
  fScore.set(startKey, heuristic(start.x, start.y, goal.x, goal.y));
  open.add(startKey);

  while (open.size > 0) {
    // Find node in `open` with lowest fScore.
    let currentKey = '';
    let lowestF = Infinity;
    for (const key of open) {
      const f = fScore.get(key) ?? Infinity;
      if (f < lowestF) {
        lowestF = f;
        currentKey = key;
      }
    }
    if (!currentKey) break;
    if (currentKey === `${goal.x},${goal.y}`) {
      // Reconstruct path
      const path: Array<{ x: number; y: number }> = [goal];
      let cur = currentKey;
      while (cameFrom.has(cur)) {
        const prev = cameFrom.get(cur)!;
        path.unshift(prev);
        cur = `${prev.x},${prev.y}`;
      }
      return path;
    }
    open.delete(currentKey);
    const [cx, cy] = currentKey.split(',').map(Number) as [number, number];
    for (const [dx, dy] of NEIGHBOR_OFFSETS) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || nx >= state.mapWidth || ny < 0 || ny >= state.mapHeight) continue;
      if (!isPassable(state, nx, ny)) continue;
      const tile = state.map[ny]?.[nx];
      if (!tile) continue;
      const moveCost = TERRAIN[tile.terrain].moveCost;
      if (moveCost === Infinity) continue;
      const neighborKey = `${nx},${ny}`;
      const tentativeG = (gScore.get(currentKey) ?? Infinity) + moveCost;
      if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
        cameFrom.set(neighborKey, { x: cx, y: cy });
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeG + heuristic(nx, ny, goal.x, goal.y));
        if (!open.has(neighborKey)) open.add(neighborKey);
      }
    }
  }
  return [];
}

export type { AStarNode };
