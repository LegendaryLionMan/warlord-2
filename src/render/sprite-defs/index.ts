// Phase 13 — Sprite definitions registry.
//
// Aggregates every category so procedural-sprites.ts and the build
// script can pull the full set with one import.

import type { SpriteDef } from '../pixel-art';
import { TERRAIN_DEFS } from './terrain';
import { FEATURE_DEFS } from './features';
import { UI_DEFS } from './ui';
import { CITY_DEFS } from './cities';
import { UNIT_DEFS } from './units';
import { HERO_DEFS } from './heroes';

export const ALL_DEFS: readonly SpriteDef[] = [
  ...TERRAIN_DEFS,
  ...FEATURE_DEFS,
  ...UI_DEFS,
  ...CITY_DEFS,
  ...UNIT_DEFS,
  ...HERO_DEFS,
];
