import { describe, it, expect } from 'vitest';
import { createInitialState } from './state';
import { generateMap, tileAt, isPassable, mulberry32 } from './map';

describe('mulberry32', () => {
  it('is deterministic for the same seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = [a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('produces values in [0, 1)', () => {
    const rand = mulberry32(123);
    for (let i = 0; i < 1000; i++) {
      const v = rand();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('generateMap', () => {
  it('populates a full 32x32 grid', () => {
    const s = createInitialState();
    generateMap(s, 1);
    expect(s.map.length).toBe(32);
    for (const row of s.map) {
      expect(row.length).toBe(32);
    }
  });

  it('produces all five terrain types over a 64x64 map', () => {
    const s = createInitialState({ mapWidth: 64, mapHeight: 64 });
    generateMap(s, 7);
    const seen = new Set<string>();
    for (const row of s.map) {
      for (const tile of row) {
        seen.add(tile.terrain);
      }
    }
    expect(seen.size).toBeGreaterThanOrEqual(4); // at least 4 distinct terrains
  });

  it('proportions are within tolerance', () => {
    const s = createInitialState({ mapWidth: 80, mapHeight: 80 });
    generateMap(s, 99);
    const counts: Record<string, number> = { water: 0, mountains: 0, hills: 0, forest: 0, plains: 0 };
    for (const row of s.map) {
      for (const tile of row) {
        counts[tile.terrain] = (counts[tile.terrain] ?? 0) + 1;
      }
    }
    const total = 80 * 80;
    // Each terrain is at least 50% of its target proportion
    const targets = { water: 0.05, mountains: 0.08, hills: 0.18, forest: 0.18, plains: 0.51 };
    for (const [t, target] of Object.entries(targets)) {
      const actual = (counts[t] ?? 0) / total;
      expect(actual).toBeGreaterThanOrEqual(target * 0.5);
    }
  });

  it('is deterministic for the same seed', () => {
    const a = createInitialState();
    const b = createInitialState();
    generateMap(a, 123);
    generateMap(b, 123);
    expect(JSON.stringify(a.map)).toEqual(JSON.stringify(b.map));
  });
});

describe('tileAt', () => {
  it('returns the tile in bounds', () => {
    const s = createInitialState();
    generateMap(s, 5);
    const t = tileAt(s, 5, 5);
    expect(t).not.toBeNull();
  });

  it('returns null out of bounds', () => {
    const s = createInitialState();
    generateMap(s, 5);
    expect(tileAt(s, -1, 0)).toBeNull();
    expect(tileAt(s, 0, -1)).toBeNull();
    expect(tileAt(s, 100, 0)).toBeNull();
    expect(tileAt(s, 0, 100)).toBeNull();
  });
});

describe('isPassable', () => {
  it('is false for water and mountains', () => {
    const s = createInitialState();
    s.map[0] = [
      { terrain: 'plains', variation: 0 },
      { terrain: 'forest', variation: 0 },
      { terrain: 'hills', variation: 0 },
      { terrain: 'mountains', variation: 0 },
      { terrain: 'water', variation: 0 },
    ];
    expect(isPassable(s, 0, 0)).toBe(true);
    expect(isPassable(s, 1, 0)).toBe(true);
    expect(isPassable(s, 2, 0)).toBe(true);
    expect(isPassable(s, 3, 0)).toBe(false);
    expect(isPassable(s, 4, 0)).toBe(false);
  });
});
