/**
 * Faction data and bonuses.
 *
 * The bonus functions are pure: given a unit context, return the modified
 * stats. The simulation calls these in combat.ts, not the data layer. This
 * keeps the bonus logic testable and easy to extend.
 */

import type { FactionId } from '../sim/state';

export interface FactionBonus {
  /** +X to all units' defense. */
  flatDefense: number;
  /** +X to ranged units' attack. */
  rangedAttack: number;
  /** +X to melee units' attack. */
  meleeAttack: number;
  /** Fraction of losses returned on victory. */
  resurrectFraction: number;
  /** Roster restriction: which units this faction can recruit. */
  allowedUnits: ReadonlyArray<'militia' | 'spearman' | 'archer' | 'knight' | 'cavalry' | 'wizard' | 'giant'>;
}

export interface FactionDefinition {
  id: FactionId;
  name: string;
  /** Short flavor text shown on faction select. */
  tagline: string;
  /** Long description for faction select detail. */
  description: string;
  bonus: FactionBonus;
}

export const FACTIONS: Record<FactionId, FactionDefinition> = {
  humans: {
    id: 'humans',
    name: 'Humans',
    tagline: 'Balanced forces with strong infantry and cavalry.',
    description: 'Masters of adaptability. Humans field every unit type and gain a flat +1 defense across the roster.',
    bonus: {
      flatDefense: 1,
      rangedAttack: 0,
      meleeAttack: 0,
      resurrectFraction: 0,
      allowedUnits: ['militia', 'spearman', 'archer', 'knight', 'cavalry', 'wizard', 'giant'],
    },
  },
  elves: {
    id: 'elves',
    name: 'Elves',
    tagline: 'Superior archers and swift movement.',
    description: 'Forest-dwellers with a +1 attack bonus on all ranged units. Their archers strike first and strike hardest.',
    bonus: {
      flatDefense: 0,
      rangedAttack: 1,
      meleeAttack: 0,
      resurrectFraction: 0,
      allowedUnits: ['militia', 'spearman', 'archer', 'knight', 'wizard', 'giant'],
    },
  },
  orcs: {
    id: 'orcs',
    name: 'Orcs',
    tagline: 'Powerful melee warriors, no ranged capability.',
    description: 'Brutal and direct. Orcs gain +1 attack on all melee units but cannot recruit archers or wizards.',
    bonus: {
      flatDefense: 0,
      rangedAttack: 0,
      meleeAttack: 1,
      resurrectFraction: 0,
      allowedUnits: ['militia', 'spearman', 'knight', 'cavalry', 'giant'],
    },
  },
  undead: {
    id: 'undead',
    name: 'Undead',
    tagline: 'Resurrect fallen units in combat.',
    description: 'Masters of attrition. Undead resurrect 20% of their losses (rounded up) on every victorious engagement.',
    bonus: {
      flatDefense: 0,
      rangedAttack: 0,
      meleeAttack: 0,
      resurrectFraction: 0.2,
      allowedUnits: ['militia', 'spearman', 'archer', 'knight', 'cavalry', 'wizard', 'giant'],
    },
  },
};

/** Returns true if the given faction is allowed to recruit the given unit. */
export function canRecruit(faction: FactionId, unitId: 'militia' | 'spearman' | 'archer' | 'knight' | 'cavalry' | 'wizard' | 'giant'): boolean {
  return FACTIONS[faction].bonus.allowedUnits.includes(unitId);
}
