// Phase 13 — Pixel art renderer.
//
// Reads hand-authored sprite definitions (see ./sprite-defs/*) and
// produces ImageData or HTMLCanvasElement suitable for Phaser texture
// registration or direct <img> embedding. Every output is hard-edged
// nearest-neighbor scaled — no anti-aliasing — and quantized to the
// 16-color palette in ./palette.ts.
//
// Two public entry points:
//   - spriteToCanvas(def, scale?): produce an HTMLCanvasElement
//   - spriteToImageData(def): produce ImageData for direct draw
//
// The hand-authored defs use a compact string format: each row is a
// row of hex digits (0-F), with `.` as a synonym for the transparent
// slot. Whitespace and newlines are ignored when decoding.

import { PALETTE, rgbForIndex, type PaletteEntry } from './palette';

export interface SpriteDef {
  /** Texture key (matches `SPRITE_KEYS` in the loader). */
  readonly key: string;
  /** Logical width in pixels. */
  readonly width: number;
  /** Logical height in pixels. */
  readonly height: number;
  /**
   * Pixels as a single string of hex digits. Length must equal
   * width × height. `.` is shorthand for the transparent slot.
   * Whitespace and newlines are stripped on decode.
   */
  readonly pixels: string;
  /** Free-form note for the changelog. */
  readonly notes?: string;
}

/**
 * Decode a sprite def's pixel string into a Uint8Array of palette
 * indices, row-major. Length === width × height.
 */
export function decodePixels(def: SpriteDef): Uint8Array {
  const cleaned = def.pixels.replace(/[\s.]/g, '').toUpperCase();
  if (cleaned.length > def.width * def.height) {
    throw new Error(
      `pixel-art: ${def.key} has too many pixels ` +
        `(${cleaned.length} > ${def.width * def.height})`,
    );
  }
  // Pad with transparent (0) to fill the tile.
  const out = new Uint8Array(def.width * def.height);
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned.charCodeAt(i);
    let slot: number;
    if (ch >= 0x30 && ch <= 0x39) slot = ch - 0x30;          // '0'-'9'
    else if (ch >= 0x41 && ch <= 0x46) slot = ch - 0x41 + 10; // 'A'-'F'
    else throw new Error(`pixel-art: bad char "${cleaned[i]}" in ${def.key}`);
    out[i] = slot;
  }
  return out;
}

/**
 * Render a sprite def to a fresh ImageData at its logical size. The
 * transparent slot is encoded as alpha=0.
 */
export function spriteToImageData(def: SpriteDef): ImageData {
  const idx = decodePixels(def);
  const buf = new Uint8ClampedArray(def.width * def.height * 4);
  for (let i = 0; i < idx.length; i++) {
    const slot = idx[i]!;
    const off = i * 4;
    if (slot === 0) {
      buf[off] = 0; buf[off + 1] = 0; buf[off + 2] = 0; buf[off + 3] = 0;
    } else {
      const e: PaletteEntry = PALETTE[slot]!;
      buf[off] = e.r; buf[off + 1] = e.g; buf[off + 2] = e.b; buf[off + 3] = 255;
    }
  }
  return new ImageData(buf, def.width, def.height);
}

/**
 * Render a sprite def to an HTMLCanvasElement at `scale`x its logical
 * size using nearest-neighbor sampling. Default scale 1.
 */
export function spriteToCanvas(def: SpriteDef, scale: number = 1): HTMLCanvasElement {
  const w = def.width * scale;
  const h = def.height * scale;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('pixel-art: 2d context unavailable');

  if (scale === 1) {
    ctx.putImageData(spriteToImageData(def), 0, 0);
  } else {
    // Draw at 1x then nearest-neighbor scale via ImageData copy.
    const small = spriteToImageData(def);
    // Build the scaled ImageData manually (putImageData would respect
    // canvas smoothing, which we don't want — copy row-by-row).
    const big = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      const sy = (y / scale) | 0;
      for (let x = 0; x < w; x++) {
        const sx = (x / scale) | 0;
        const si = (sy * def.width + sx) * 4;
        const di = (y * w + x) * 4;
        big.data[di]     = small.data[si]!;
        big.data[di + 1] = small.data[si + 1]!;
        big.data[di + 2] = small.data[si + 2]!;
        big.data[di + 3] = small.data[si + 3]!;
      }
    }
    ctx.putImageData(big, 0, 0);
  }
  return canvas;
}

/**
 * Bayer 4×4 ordered dither threshold matrix (values 0-15).
 * Used by the post-processing pipeline when quantizing AI output.
 */
export const BAYER_4X4: readonly number[] = [
  0,  8,  2, 10,
 12,  4, 14,  6,
  3, 11,  1,  9,
 15,  7, 13,  5,
];

/**
 * Apply Bayer 4×4 dithering to an ImageData, mutating in place.
 * Each channel is biased by (Bayer/16 - 0.5) * amount.
 */
export function applyBayerDither(img: ImageData, amount: number = 32): void {
  const d = img.data;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const threshold = BAYER_4X4[(y & 3) * 4 + (x & 3)]! / 16 - 0.5;
      const bias = threshold * amount;
      const i = (y * img.width + x) * 4;
      d[i]     = Math.max(0, Math.min(255, d[i]!     + bias));
      d[i + 1] = Math.max(0, Math.min(255, d[i + 1]! + bias));
      d[i + 2] = Math.max(0, Math.min(255, d[i + 2]! + bias));
    }
  }
}

/**
 * Quantize an ImageData to the 16-color palette, optionally with
 * Bayer dithering. Returns a new ImageData. Used by the post-process
 * step in scripts/postprocess-sprite.mjs.
 */
export function quantizeToPalette(src: ImageData, dither: boolean = true): ImageData {
  if (dither) applyBayerDither(src, 24);
  const out = new ImageData(src.width, src.height);
  for (let i = 0; i < src.data.length; i += 4) {
    const r = src.data[i]!;
    const g = src.data[i + 1]!;
    const b = src.data[i + 2]!;
    const a = src.data[i + 3]!;
    if (a < 8) {
      out.data[i] = 0; out.data[i + 1] = 0; out.data[i + 2] = 0; out.data[i + 3] = 0;
      continue;
    }
    // nearest color
    let bestSlot = 1, bestD = Infinity;
    for (let s = 1; s < PALETTE.length; s++) {
      const e = PALETTE[s]!;
      const dr = e.r - r, dg = e.g - g, db = e.b - b;
      const d = dr * dr + dg * dg + db * db;
      if (d < bestD) { bestD = d; bestSlot = s; }
    }
    const e = rgbForIndex(bestSlot);
    out.data[i]     = e[0];
    out.data[i + 1] = e[1];
    out.data[i + 2] = e[2];
    out.data[i + 3] = 255;
  }
  return out;
}
