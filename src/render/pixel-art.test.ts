// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { decodePixels, spriteToImageData, BAYER_4X4, applyBayerDither } from './pixel-art';
import type { SpriteDef } from './pixel-art';
import { rgbForIndex } from './palette';
import { TERRAIN_DEFS } from './sprite-defs/terrain';

// Tiny ImageData shim for the Node test environment. jsdom's
// ImageData is incomplete and the bundled canvas polyfill is heavy —
// we just need an object shape compatible with what spriteToImageData
// returns and what applyBayerDither mutates.
class ImageDataShim {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  constructor(data: Uint8ClampedArray, width: number, height: number) {
    this.data = data;
    this.width = width;
    this.height = height;
  }
}
(globalThis as unknown as { ImageData: typeof ImageDataShim }).ImageData = ImageDataShim;

function fakeDef(pixels: string, width: number, height: number, key = 'test'): SpriteDef {
  return { key, width, height, pixels };
}

describe('decodePixels', () => {
  it('decodes a known 2x2 grid', () => {
    const def = fakeDef('12\n34', 2, 2);
    const idx = decodePixels(def);
    expect(idx.length).toBe(4);
    expect(idx[0]).toBe(1);
    expect(idx[1]).toBe(2);
    expect(idx[2]).toBe(3);
    expect(idx[3]).toBe(4);
  });

  it('treats "." as the transparent slot (slot 0)', () => {
    const def = fakeDef('0.\n.0', 2, 2);
    const idx = decodePixels(def);
    expect(idx[0]).toBe(0);
    expect(idx[1]).toBe(0);
    expect(idx[2]).toBe(0);
    expect(idx[3]).toBe(0);
  });

  it('strips whitespace and newlines before counting', () => {
    const def = fakeDef(' 1 2 \n 3 4 ', 2, 2);
    const idx = decodePixels(def);
    expect(idx.length).toBe(4);
    expect(idx[0]).toBe(1);
    expect(idx[3]).toBe(4);
  });

  it('accepts both upper- and lower-case hex', () => {
    const def = fakeDef('af\nbc', 2, 2);
    const idx = decodePixels(def);
    expect(idx[0]).toBe(10);
    expect(idx[1]).toBe(15);
    expect(idx[2]).toBe(11);
    expect(idx[3]).toBe(12);
  });

  it('pads with transparent (0) when fewer chars than width*height', () => {
    const def = fakeDef('1', 2, 2);
    const idx = decodePixels(def);
    expect(idx.length).toBe(4);
    expect(idx[0]).toBe(1);
    expect(idx[1]).toBe(0);
    expect(idx[2]).toBe(0);
    expect(idx[3]).toBe(0);
  });

  it('throws on too many chars', () => {
    const def = fakeDef('12345', 2, 2);
    expect(() => decodePixels(def)).toThrow();
  });

  it('throws on bad chars', () => {
    const def = fakeDef('12\nG0', 2, 2);
    expect(() => decodePixels(def)).toThrow();
  });
});

describe('spriteToImageData', () => {
  it('produces an ImageData of the right size', () => {
    const def = fakeDef('1234', 2, 2);
    const img = spriteToImageData(def);
    expect(img.width).toBe(2);
    expect(img.height).toBe(2);
    expect(img.data.length).toBe(2 * 2 * 4);
  });

  it('encodes the transparent slot as alpha=0', () => {
    const def = fakeDef('0', 1, 1);
    const img = spriteToImageData(def);
    expect(img.data[3]).toBe(0);
  });

  it('encodes a non-transparent slot as alpha=255 with the right RGB', () => {
    // Slot 15 = gray-bright (153, 153, 153) in the new palette
    const def = fakeDef('f', 1, 1);
    const img = spriteToImageData(def);
    expect(img.data[0]).toBe(153);
    expect(img.data[1]).toBe(153);
    expect(img.data[2]).toBe(153);
    expect(img.data[3]).toBe(255);
  });

  it('renders every non-transparent pixel from the Warlord 2 palette', () => {
    const def = fakeDef('1234', 2, 2);
    const img = spriteToImageData(def);
    for (let i = 0; i < 4; i++) {
      const slot = i + 1;
      const [r, g, b] = rgbForIndex(slot);
      expect(img.data[i * 4]).toBe(r);
      expect(img.data[i * 4 + 1]).toBe(g);
      expect(img.data[i * 4 + 2]).toBe(b);
      expect(img.data[i * 4 + 3]).toBe(255);
    }
  });
});

describe('BAYER_4X4', () => {
  it('has 16 entries, all 0..15 unique', () => {
    expect(BAYER_4X4.length).toBe(16);
    const sorted = [...BAYER_4X4].sort((a, b) => a - b);
    expect(sorted).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });
});

describe('applyBayerDither', () => {
  it('mutates a flat-color image to a dithered pattern', () => {
    const data = new Uint8ClampedArray(4 * 4 * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 128; data[i + 1] = 128; data[i + 2] = 128; data[i + 3] = 255;
    }
    const img = new ImageDataShim(data, 4, 4);
    applyBayerDither(img as unknown as ImageData, 32);
    const uniqueValues = new Set<number>();
    for (let i = 0; i < img.data.length; i += 4) uniqueValues.add(img.data[i]!);
    expect(uniqueValues.size).toBeGreaterThan(1);
  });
});

describe('Phase 14 — visual fidelity approach', () => {
  it('uses procedural Phaser Graphics backdrops (no sprite defs)', () => {
    // Phase 14+ reframed the visual approach: instead of hand-coding
    // sprite defs and rendering them at 4x, we now use procedural
    // Phaser Graphics primitives for the menu, the world map, the
    // combat scene, etc. The sprite-defs are stubs.
    //
    // The pixel-art infrastructure (palette, renderer, defs) remains
    // in the codebase for future phases that may add hand-authored
    // overlays or new sprites.
    expect(TERRAIN_DEFS.length).toBe(0);
  });
});
