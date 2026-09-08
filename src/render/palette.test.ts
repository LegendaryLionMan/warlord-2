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

  it('slot 0 is black (the original STANDARD.PAL slot 0)', () => {
    expect(PALETTE[0]!.name).toBe('black');
  });

  it('every entry has a named role', () => {
    for (const entry of PALETTE) {
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

  it('palette matches the original STANDARD.PAL exactly', () => {
    // From the original Warlords II 1993 STANDARD.PAL file (16 RGB
    // triplets, 160 bytes total).
    const expected = [
      [0, 0, 0], [115, 115, 115], [86, 86, 86], [68, 68, 68],
      [49, 49, 49], [23, 114, 153], [0, 54, 129], [153, 146, 19],
      [153, 99, 0], [119, 17, 0], [49, 103, 17], [0, 85, 0],
      [0, 52, 0], [100, 51, 0], [69, 32, 0], [153, 153, 153],
    ];
    for (let i = 0; i < 16; i++) {
      expect(PALETTE[i]!.r).toBe(expected[i]![0]);
      expect(PALETTE[i]!.g).toBe(expected[i]![1]);
      expect(PALETTE[i]!.b).toBe(expected[i]![2]);
    }
  });
});

describe('paletteIndex', () => {
  it('returns the right slot for known names', () => {
    expect(paletteIndex('black')).toBe(0);
    expect(paletteIndex('gray-bright')).toBe(15);
    expect(paletteIndex('gray-light')).toBe(1);
    expect(paletteIndex('green-deep')).toBe(12);
  });

  it('throws on unknown names so typos fail fast at build time', () => {
    expect(() => paletteIndex('not-a-real-color')).toThrow();
  });
});

describe('rgbForIndex', () => {
  it('returns the RGB triple for a known slot', () => {
    // Slot 15 is gray-bright (153, 153, 153)
    const bright = rgbForIndex(15);
    expect(bright[0]).toBe(153);
    expect(bright[1]).toBe(153);
    expect(bright[2]).toBe(153);
  });

  it('returns [0,0,0] for an out-of-range slot (defensive default)', () => {
    const black = rgbForIndex(99);
    expect(black).toEqual([0, 0, 0]);
  });
});

describe('nearestColorIndex', () => {
  it('finds the exact gray-bright slot for (153, 153, 153)', () => {
    expect(nearestColorIndex(153, 153, 153)).toBe(15);
  });

  it('finds the exact blue-deep slot for (0, 54, 129)', () => {
    expect(nearestColorIndex(0, 54, 129)).toBe(6);
  });

  it('never returns 0 (the black slot) for an opaque color', () => {
    const slot = nearestColorIndex(80, 80, 80);
    expect(slot).not.toBe(0);
  });
});

describe('C constant map', () => {
  it('exposes the documented named roles from the original 1993 palette', () => {
    expect(C.GRAY_LIGHT).toBe(1);
    expect(C.GRAY_MID).toBe(2);
    expect(C.GRAY_DARK).toBe(3);
    expect(C.GRAY_DARKER).toBe(4);
    expect(C.TEAL).toBe(5);
    expect(C.BLUE_DEEP).toBe(6);
    expect(C.OLIVE).toBe(7);
    expect(C.ORANGE).toBe(8);
    expect(C.RED_DARK).toBe(9);
    expect(C.GREEN_DARK).toBe(10);
    expect(C.GREEN).toBe(11);
    expect(C.GREEN_DEEP).toBe(12);
    expect(C.BROWN).toBe(13);
    expect(C.BROWN_DARK).toBe(14);
    expect(C.GRAY_BRIGHT).toBe(15);
    expect(C.T).toBe(0);
    expect(C.BLACK).toBe(0);
  });
});
