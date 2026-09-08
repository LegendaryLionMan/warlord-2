import { describe, it, expect } from 'vitest';
import {
  PALETTE,
  paletteIndex,
  nearestColorIndex,
  rgbForIndex,
  C,
} from './palette';

describe('PALETTE', () => {
  it('has exactly 16 entries (the 1993 Warlords II 16-color SVGA palette)', () => {
    expect(PALETTE.length).toBe(16);
  });

  it('has slot numbers 0..15 with no duplicates', () => {
    const slots = PALETTE.map((e) => e.slot).sort((a, b) => a - b);
    expect(slots).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });

  it('slot 0 is the transparent entry', () => {
    expect(PALETTE[0]!.name).toBe('transparent');
  });

  it('has named roles for every slot (not just "color-N")', () => {
    for (const entry of PALETTE) {
      // Transparent sentinel is allowed; every other entry must have
      // a human-readable name with at least one dash or be 'snow'.
      expect(entry.name).toBeTruthy();
      expect(entry.name).not.toMatch(/^color-\d+$/);
    }
  });

  it('every non-transparent entry has 24-bit RGB in [0, 255]', () => {
    for (const entry of PALETTE) {
      expect(entry.r).toBeGreaterThanOrEqual(0);
      expect(entry.r).toBeLessThanOrEqual(255);
      expect(entry.g).toBeGreaterThanOrEqual(0);
      expect(entry.g).toBeLessThanOrEqual(255);
      expect(entry.b).toBeGreaterThanOrEqual(0);
      expect(entry.b).toBeLessThanOrEqual(255);
    }
  });
});

describe('paletteIndex', () => {
  it('returns the right slot for known names', () => {
    expect(paletteIndex('transparent')).toBe(0);
    expect(paletteIndex('gold')).toBe(15);
    expect(paletteIndex('plains-shade')).toBe(2);
    expect(paletteIndex('snow')).toBe(11);
  });

  it('throws on unknown names so typos fail fast at build time', () => {
    expect(() => paletteIndex('not-a-real-color')).toThrow();
  });
});

describe('rgbForIndex', () => {
  it('returns the RGB triple for a known slot', () => {
    const gold = rgbForIndex(15);
    // 255, 162, 0 in our table
    expect(gold[0]).toBe(255);
    expect(gold[1]).toBe(162);
    expect(gold[2]).toBe(0);
  });

  it('returns [0,0,0] for an out-of-range slot (defensive default)', () => {
    const black = rgbForIndex(99);
    expect(black).toEqual([0, 0, 0]);
  });
});

describe('nearestColorIndex', () => {
  it('finds the exact gold slot for the gold RGB', () => {
    expect(nearestColorIndex(255, 162, 0)).toBe(15);
  });

  it('finds the snow slot for the snow RGB', () => {
    expect(nearestColorIndex(190, 190, 190)).toBe(11);
  });

  it('never returns 0 (the transparent slot) for an opaque color', () => {
    const slot = nearestColorIndex(80, 80, 80);
    expect(slot).not.toBe(0);
  });
});

describe('C constant map', () => {
  it('exposes the documented named roles', () => {
    expect(C.FOREST_DEEP).toBe(1);
    expect(C.PLAINS_SHADE).toBe(2);
    expect(C.PLAINS_LIGHT).toBe(3);
    expect(C.HILLS_BASE).toBe(4);
    expect(C.HILLS_SHADE).toBe(5);
    expect(C.WATER_DEEP).toBe(6);
    expect(C.WATER_LIGHT).toBe(7);
    expect(C.MOUNTAIN_BASE).toBe(8);
    expect(C.MOUNTAIN_SHADE).toBe(9);
    expect(C.MOUNTAIN_LIGHT).toBe(10);
    expect(C.SNOW).toBe(11);
    expect(C.UI_STONE_DARK).toBe(12);
    expect(C.UI_STONE_MID).toBe(13);
    expect(C.UI_STONE_LIGHT).toBe(14);
    expect(C.GOLD).toBe(15);
    expect(C.T).toBe(0);
  });
});
