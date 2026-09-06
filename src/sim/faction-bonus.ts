/**
 * Faction bonus application. Per SPEC § 2:
 *   Humans  : +1 def to all units
 *   Elves   : +1 atk to ranged units
 *   Orcs    : +1 atk to melee units (no ranged)
 *   Undead  : handled by existing resurrect in combat.ts
 *
 * Pure functions. Mutates a copy of the unit list; the original list
 * is not touched. Combat uses applyFactionBonuses before combat rolls.
 */

import type { OwnerId, Unit } from './state';

export interface FactionBonuses {
  flatDefense: number;
  rangedAttack: number;
  meleeAttack: number;
}

const BONUSES: Record<OwnerId, FactionBonuses> = {
  humans: { flatDefense: 1, rangedAttack: 0, meleeAttack: 0 },
  elves: { flatDefense: 0, rangedAttack: 1, meleeAttack: 0 },
  orcs: { flatDefense: 0, rangedAttack: 0, meleeAttack: 1 },
  undead: { flatDefense: 0, rangedAttack: 0, meleeAttack: 0 },
  neutral: { flatDefense: 0, rangedAttack: 0, meleeAttack: 0 },
};

export function bonusesFor(faction: OwnerId): FactionBonuses {
  return BONUSES[faction];
}

/** Apply the faction's bonuses to a list of units. Returns a NEW list. */
export function applyFactionBonuses(units: Unit[], faction: OwnerId): Unit[] {
  const b = bonusesFor(faction);
  return units.map((u) => {
    const atkBonus = u.ranged ? b.rangedAttack : b.meleeAttack;
    return {
      ...u,
      attack: u.attack + atkBonus,
      defense: u.defense + b.flatDefense,
    };
  });
}
