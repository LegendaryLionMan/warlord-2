/**
 * Procedural sprite fallback. Phase 13 update.
 *
 * Since Phase 12 the renderer in `GameScene` prefers the pre-rendered
 * pixel-art PNGs in `public/assets/sprites/` (built from
 * `src/render/sprite-defs/` by `scripts/build-sprites.mjs`). This file
 * remains as a SAFETY NET in case a sprite is missing at runtime —
 * e.g. a developer's local `public/assets/` got out of sync with the
 * registry. The shapes here intentionally match the old Phase 9 visual
 * language (faction-tinted circles + castletown) so a fallback never
 * looks out of place next to the new pixel art.
 *
 * If you need to regenerate a sprite for any reason, run:
 *   npm run build:sprites
 *
 * That rewrites every PNG from the registry in `src/render/sprite-defs/`.
 * Do not edit the Phaser Graphics functions in this file unless you
 * also have a good reason to keep them around for fallback rendering.
 */

import Phaser from 'phaser';
import { TILE_SIZE } from '../config';
import type { OwnerId, UnitId } from '../sim/state';

const PHASER_FACTION_NUM: Record<OwnerId, number> = {
  humans: 0x3b6fb6,
  elves: 0x2f8a4a,
  orcs: 0x9b2a2a,
  undead: 0x6b3a8a,
  neutral: 0x666666,
};

const PHASER_FACTION_DARK: Record<OwnerId, number> = {
  humans: 0x1e3a8a,
  elves: 0x14532d,
  orcs: 0x5a1414,
  undead: 0x3a1a5a,
  neutral: 0x333333,
};

const PHASER_FACTION_LIGHT: Record<OwnerId, number> = {
  humans: 0x6aa3e8,
  elves: 0x5cc480,
  orcs: 0xcc5050,
  undead: 0x9a6cc0,
  neutral: 0x999999,
};

/** Draw a layered army sprite on `g`. The sprite is a 28×28 icon centered on (cx, cy). */
export function drawArmySprite(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  faction: OwnerId,
  unitKind: 'infantry' | 'ranged' | 'cavalry' | 'magic' | 'siege' = 'infantry',
  isHero: boolean = false,
): void {
  const r = TILE_SIZE * 0.36;
  const main = PHASER_FACTION_NUM[faction];
  const dark = PHASER_FACTION_DARK[faction];
  const light = PHASER_FACTION_LIGHT[faction];

  // Shadow
  g.fillStyle(0x000000, 0.35);
  g.fillCircle(cx, cy + 3, r);

  // Outer ring
  g.fillStyle(dark, 1);
  g.fillCircle(cx, cy, r + 2);
  // Main body
  g.fillStyle(main, 1);
  g.fillCircle(cx, cy, r);
  // Highlight crescent
  g.fillStyle(light, 0.6);
  g.fillCircle(cx - r * 0.3, cy - r * 0.3, r * 0.45);

  // Unit-type icon
  g.lineStyle(2, 0xffffff, 0.95);
  if (unitKind === 'infantry') {
    // Sword: vertical line with cross-guard
    g.beginPath();
    g.moveTo(cx, cy - r * 0.55);
    g.lineTo(cx, cy + r * 0.55);
    g.moveTo(cx - r * 0.3, cy);
    g.lineTo(cx + r * 0.3, cy);
    g.strokePath();
  } else if (unitKind === 'ranged') {
    // Arrow: diagonal line with notch
    g.beginPath();
    g.moveTo(cx - r * 0.45, cy + r * 0.35);
    g.lineTo(cx + r * 0.45, cy - r * 0.35);
    g.moveTo(cx + r * 0.45, cy - r * 0.35);
    g.lineTo(cx + r * 0.2, cy - r * 0.25);
    g.moveTo(cx + r * 0.45, cy - r * 0.35);
    g.lineTo(cx + r * 0.25, cy - r * 0.5);
    g.strokePath();
  } else if (unitKind === 'cavalry') {
    // Horse head: triangle
    g.fillStyle(0xffffff, 0.9);
    g.fillTriangle(cx - r * 0.3, cy + r * 0.4, cx + r * 0.3, cy + r * 0.4, cx, cy - r * 0.5);
  } else if (unitKind === 'magic') {
    // Star: 4-point
    g.fillStyle(0xffffff, 0.95);
    g.fillTriangle(cx, cy - r * 0.5, cx + r * 0.2, cy, cx, cy + r * 0.5);
    g.fillTriangle(cx, cy - r * 0.5, cx - r * 0.2, cy, cx, cy + r * 0.5);
    g.fillTriangle(cx - r * 0.5, cy, cx, cy - r * 0.2, cx, cy + r * 0.2);
    g.fillTriangle(cx + r * 0.5, cy, cx, cy - r * 0.2, cx, cy + r * 0.2);
  } else {
    // Siege: anvil / block
    g.fillStyle(0xffffff, 0.9);
    g.fillRect(cx - r * 0.4, cy - r * 0.2, r * 0.8, r * 0.5);
  }

  // Hero: gold rim
  if (isHero) {
    g.lineStyle(2, 0xffd700, 1);
    g.strokeCircle(cx, cy, r + 4);
  }
}

/** Draw a city sprite at (cx, cy). */
export function drawCitySprite(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  faction: OwnerId,
  size: 1 | 2 | 3,
): void {
  const main = PHASER_FACTION_NUM[faction];
  const dark = PHASER_FACTION_DARK[faction];
  const light = PHASER_FACTION_LIGHT[faction];
  const baseR = TILE_SIZE * (0.25 + size * 0.08);

  // Shadow
  g.fillStyle(0x000000, 0.35);
  g.fillEllipse(cx, cy + 3, baseR * 2, baseR * 0.6);

  // Walls (rectangle base)
  g.fillStyle(dark, 1);
  g.fillRect(cx - baseR, cy - baseR * 0.4, baseR * 2, baseR * 0.8);

  // Inner courtyard
  g.fillStyle(main, 1);
  g.fillRect(cx - baseR * 0.7, cy - baseR * 0.25, baseR * 1.4, baseR * 0.55);

  // Towers (left + right)
  g.fillStyle(light, 1);
  g.fillRect(cx - baseR * 1.1, cy - baseR * 0.9, baseR * 0.35, baseR * 1.1);
  g.fillRect(cx + baseR * 0.75, cy - baseR * 0.9, baseR * 0.35, baseR * 1.1);

  // Tower roofs (triangles)
  g.fillStyle(dark, 1);
  g.fillTriangle(
    cx - baseR * 1.1, cy - baseR * 0.9,
    cx - baseR * 0.75, cy - baseR * 0.9,
    cx - baseR * 0.92, cy - baseR * 1.25,
  );
  g.fillTriangle(
    cx + baseR * 0.75, cy - baseR * 0.9,
    cx + baseR * 1.1, cy - baseR * 0.9,
    cx + baseR * 0.92, cy - baseR * 1.25,
  );

  // Central tower
  g.fillStyle(light, 1);
  g.fillRect(cx - baseR * 0.18, cy - baseR * 1.3, baseR * 0.36, baseR * 0.95);
  // Flag
  g.fillStyle(0xffd700, 1);
  g.fillRect(cx - 1, cy - baseR * 1.6, 2, baseR * 0.3);
  g.fillStyle(0xff5050, 1);
  g.fillTriangle(
    cx + 1, cy - baseR * 1.6,
    cx + baseR * 0.35, cy - baseR * 1.5,
    cx + 1, cy - baseR * 1.4,
  );
}

/** Get the kind of a unit from its id. */
export function kindOfUnit(unitId: UnitId): 'infantry' | 'ranged' | 'cavalry' | 'magic' | 'siege' {
  switch (unitId) {
    case 'archer':
    case 'wizard':
      return 'ranged'; // visual slot
    case 'cavalry':
    case 'knight':
      return 'cavalry';
    case 'giant':
      return 'siege';
    case 'militia':
    case 'spearman':
    default:
      return 'infantry';
  }
}
