/**
 * Backdrops — procedurally-rendered scene backgrounds.
 *
 * Each scene gets a Container that paints an original 1990s-stylized
 * "marble + gold" panel using only Phaser Graphics primitives (rectangles,
 * gradients, and stroked borders). No image assets — every pixel here is
 * computed at draw time, so the look is wholly original and ships with
 * the code, not as a separate copyright-sensitive screenshot.
 *
 * The visual language is intentionally minimal: a flat base colour from
 * the Warlord 2 16-colour palette, a thin gold frame, and (for the
 * menu / outcome scenes) a subtle marble-ish dither band so the panel
 * reads as a 1990s fantasy-stone backdrop without copying any specific
 * reference image.
 *
 * If you want a richer look, swap the relevant style for a larger set
 * of rects / lines / circles. The existing styles are sized for a
 * 1024x720 viewport and scale with the scene.
 */

import Phaser from 'phaser';

/** One backdrop per scene. Each paints a different mood. */
export type BackdropStyle = 'menu' | 'combat' | 'hero' | 'production' | 'quest' | 'outcome';

/** Base colour + accent for each style. From the Warlord 2 16-colour
 *  palette (see `src/render/palette.ts`). */
const STYLE_PALETTE: Record<
  BackdropStyle,
  { base: number; accent: number; gold: number; dither: number }
> = {
  menu:       { base: 0x1a1410, accent: 0x3a3026, gold: 0xd4af37, dither: 0x2a2018 },
  combat:     { base: 0x2a0808, accent: 0x4a1010, gold: 0xc04020, dither: 0x3a1010 },
  hero:       { base: 0x1a1408, accent: 0x3a2a18, gold: 0xc0a050, dither: 0x2a2010 },
  production: { base: 0x0e0a08, accent: 0x2a1a10, gold: 0xa08040, dither: 0x1a1208 },
  quest:      { base: 0x2a2008, accent: 0x4a3a18, gold: 0xc0a050, dither: 0x3a2a10 },
  outcome:    { base: 0x1a1410, accent: 0x3a3026, gold: 0xd4af37, dither: 0x2a2018 },
};

/**
 * Paint a backdrop for the given style into a new Container at depth -10
 * (i.e. behind any text the caller adds). Returns the container so the
 * caller can position or destroy it.
 */
export function drawBackdrop(scene: Phaser.Scene, style: BackdropStyle): Phaser.GameObjects.Container {
  const { width, height } = scene.scale;
  const palette = STYLE_PALETTE[style];
  const container = scene.add.container(0, 0);
  container.setDepth(-10);

  // 1. Solid base fill.
  container.add(
    scene.add
      .rectangle(width / 2, height / 2, width, height, palette.base)
      .setOrigin(0.5),
  );

  // 2. Subtle marble-ish dither: a 1-px diagonal stripe pattern at low
  // alpha across the upper half. Painted as a grid of tiny rectangles
  // so it scales with the viewport.
  const stripeAlpha = 0.08;
  const stripeStep = 8;
  for (let y = 0; y < height; y += stripeStep) {
    for (let x = 0; x < width; x += stripeStep * 2) {
      if (((x / stripeStep + y / stripeStep) & 1) === 0) continue;
      container.add(
        scene.add
          .rectangle(x, y, stripeStep, stripeStep, palette.dither, stripeAlpha)
          .setOrigin(0, 0),
      );
    }
  }

  // 3. Inner accent panel: a 24-px-inset rectangle in the accent colour,
  // translucent, so the scene has a "framed picture" feel.
  const inset = 24;
  container.add(
    scene.add
      .rectangle(
        width / 2,
        height / 2,
        width - inset * 2,
        height - inset * 2,
        palette.accent,
        0.25,
      )
      .setOrigin(0.5),
  );

  // 4. Gold frame: a 3-px stroke around the inner accent panel.
  const frame = scene.add.graphics();
  frame.lineStyle(3, palette.gold, 1);
  frame.strokeRect(inset, inset, width - inset * 2, height - inset * 2);
  container.add(frame);

  return container;
}

/**
 * Draw a small inset panel (used for in-scene cards like the production
 * city-banner or the hero dialog content box). Lighter-weight than
 * `drawBackdrop`: a flat base + a 2-px gold stroke, no dither.
 */
export function drawPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  style: BackdropStyle = 'menu',
): Phaser.GameObjects.Container {
  const palette = STYLE_PALETTE[style];
  const container = scene.add.container(x, y);
  container.setDepth(-5);

  container.add(
    scene.add.rectangle(w / 2, h / 2, w, h, palette.base, 0.92).setOrigin(0.5),
  );
  const frame = scene.add.graphics();
  frame.lineStyle(2, palette.gold, 1);
  frame.strokeRect(0, 0, w, h);
  container.add(frame);

  return container;
}
