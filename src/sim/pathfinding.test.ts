import { describe, it, expect } from 'vitest';
import { createInitialState } from './state';
import { generateMap } from './map';
import { bfsReachable } from './pathfinding';

describe('bfsReachable', () => {
  it('returns just the start tile with 0 budget', () => {
    const s = createInitialState({ mapWidth: 8, mapHeight: 8 });
    generateMap(s, 1);
    expect(bfsReachable(s, 4, 4, 0)).toEqual([]);
  });

  it('reaches 4 tiles with 1 move on all-plains', () => {
    const s = createInitialState({ mapWidth: 8, mapHeight: 8 });
    s.map = Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => ({ terrain: 'plains' as const, variation: 0 })),
    );
    const r = bfsReachable(s, 4, 4, 1);
    expect(r.length).toBe(4);
    const xs = r.map((t) => t.x).sort();
    expect(xs).toEqual([3, 4, 4, 5]);
  });

  it('reaches more tiles with more moves', () => {
    const s = createInitialState({ mapWidth: 16, mapHeight: 16 });
    s.map = Array.from({ length: 16 }, () =>
      Array.from({ length: 16 }, () => ({ terrain: 'plains' as const, variation: 0 })),
    );
    expect(bfsReachable(s, 8, 8, 1).length).toBe(4);
    expect(bfsReachable(s, 8, 8, 2).length).toBeGreaterThan(4);
  });

  it('does not enter water or mountains', () => {
    const s = createInitialState({ mapWidth: 4, mapHeight: 4 });
    s.map = [
      [{ terrain: 'plains', variation: 0 }, { terrain: 'plains', variation: 0 }, { terrain: 'plains', variation: 0 }, { terrain: 'plains', variation: 0 }],
      [{ terrain: 'plains', variation: 0 }, { terrain: 'water', variation: 0 }, { terrain: 'water', variation: 0 }, { terrain: 'plains', variation: 0 }],
      [{ terrain: 'plains', variation: 0 }, { terrain: 'water', variation: 0 }, { terrain: 'mountains', variation: 0 }, { terrain: 'plains', variation: 0 }],
      [{ terrain: 'plains', variation: 0 }, { terrain: 'plains', variation: 0 }, { terrain: 'plains', variation: 0 }, { terrain: 'plains', variation: 0 }],
    ];
    const r = bfsReachable(s, 0, 0, 5);
    const tiles = new Set(r.map((t) => `${t.x},${t.y}`));
    expect(tiles.has('1,0')).toBe(true);
    expect(tiles.has('0,1')).toBe(true);
    expect(tiles.has('1,1')).toBe(false);
  });

  it('costs extra for hills and forest', () => {
    const s = createInitialState({ mapWidth: 4, mapHeight: 1 });
    s.map = [
      [{ terrain: 'plains', variation: 0 }, { terrain: 'hills', variation: 0 }, { terrain: 'plains', variation: 0 }, { terrain: 'plains', variation: 0 }],
    ];
    // 1 move: (1,0) is hills (cost 2), not reachable. 0 tiles.
    expect(bfsReachable(s, 0, 0, 1).length).toBe(0);
    // 2 moves: (1,0) reachable (cost 2). (2,0) requires 2+1=3 via hills. 1 tile.
    expect(bfsReachable(s, 0, 0, 2).length).toBe(1);
    // 3 moves: (1,0) and (2,0) reachable. (3,0) requires 2+1+1=4. 2 tiles.
    expect(bfsReachable(s, 0, 0, 3).length).toBe(2);
    // 4 moves: (1,0), (2,0), (3,0). 3 tiles.
    expect(bfsReachable(s, 0, 0, 4).length).toBe(3);
  });

  it('stays in bounds', () => {
    const s = createInitialState({ mapWidth: 4, mapHeight: 4 });
    s.map = Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => ({ terrain: 'plains' as const, variation: 0 })),
    );
    const r = bfsReachable(s, 0, 0, 10);
    for (const t of r) {
      expect(t.x).toBeGreaterThanOrEqual(0);
      expect(t.x).toBeLessThan(4);
      expect(t.y).toBeGreaterThanOrEqual(0);
      expect(t.y).toBeLessThan(4);
    }
  });
});
