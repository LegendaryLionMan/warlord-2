/**
 * Armory discounts. Per SPEC: armories reduce recruitment cost by 20%.
 *
 * Pure helpers. The caller (the HUD build menu) decides whether a
 * given city has an adjacent armory feature.
 */

import { UNITS, type UnitTemplate } from '../data/units';
import type { GameState, UnitId } from './state';

const ARMORY_DISCOUNT = 0.2;

/** Returns the actual cost to recruit a unit, with the armory discount if eligible. */
export function recruitmentCost(
  state: GameState,
  cityX: number,
  cityY: number,
  unitId: UnitId,
): number {
  const template: UnitTemplate | undefined = UNITS[unitId];
  if (!template) return 0;
  if (hasAdjacentArmory(state, cityX, cityY)) {
    return Math.floor(template.cost * (1 - ARMORY_DISCOUNT));
  }
  return template.cost;
}

/** True if any of the 8 surrounding tiles is an armory. */
export function hasAdjacentArmory(state: GameState, x: number, y: number): boolean {
  for (const f of state.features) {
    if (f.type !== 'armory') continue;
    if (Math.abs(f.x - x) <= 1 && Math.abs(f.y - y) <= 1) return true;
  }
  return false;
}
