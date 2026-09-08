/**
 * Faction data and bonuses.
 *
 * The bonus functions are pure: given a unit context, return the modified
 * stats. The simulation calls these in combat.ts, not the data layer. This
 * keeps the bonus logic testable and easy to extend.
 *
 * Phase 16 — adds the 4 missing 1993 factions: Siroms, Dark Elves, Fey,
 * and Syrnyn. The 1993 roster has 8 factions total; previously the clone
 * only had the original 4 (Humans, Elves, Orcs, Undead).
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
  allowedUnits: ReadonlyArray<'militia' | 'spearman' | 'archer' | 'knight' | 'cavalry' | 'wizard' | 'giant' | 'settler'>;
}

export interface FactionDefinition {
  id: FactionId;
  name: string;
  /** Short flavor text shown on faction select. */
  tagline: string;
  /** Long description for faction select detail. */
  description: string;
  bonus: FactionBonus;
  /** Phase 16 — primary color used for the faction card border, hero
   *  portrait rim, and unit-tint base. Hex string. */
  primaryColor: string;
  /** Phase 16 — display name for the hero portrait. The 1993 game had
   *  a fixed hero per faction (Sir Marhaus for humans, etc.). */
  heroName: string;
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
      allowedUnits: ['militia', 'spearman', 'archer', 'knight', 'cavalry', 'wizard', 'giant', 'settler'],
    },
    primaryColor: '#5a4a8a',
    heroName: 'Sir Marhaus',
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
      allowedUnits: ['militia', 'spearman', 'archer', 'knight', 'wizard', 'giant', 'settler'],
    },
    primaryColor: '#2a6a3a',
    heroName: 'Lady Lorien',
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
      allowedUnits: ['militia', 'spearman', 'knight', 'cavalry', 'giant', 'settler'],
    },
    primaryColor: '#5a3a24',
    heroName: 'Gor Ironfist',
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
      allowedUnits: ['militia', 'spearman', 'archer', 'knight', 'cavalry', 'wizard', 'giant', 'settler'],
    },
    primaryColor: '#3a3a5a',
    heroName: 'Lord Vryx',
  },
  // Phase 16 — the remaining 4 1993 factions. Bonus numbers below are
  // placeholders that mirror the flavor in the 1993 manual; we keep them
  // balanced with the original 4.
  siroms: {
    id: 'siroms',
    name: 'Siroms',
    tagline: 'Mighty Giants with shock melee and stone defense.',
    description: 'Highlanders who excel at siege warfare. Siroms gain +2 melee attack and +1 defense on all units.',
    bonus: {
      flatDefense: 1,
      rangedAttack: 0,
      meleeAttack: 2,
      resurrectFraction: 0,
      allowedUnits: ['militia', 'spearman', 'archer', 'knight', 'cavalry', 'giant', 'settler'],
    },
    primaryColor: '#6a5a4a',
    heroName: 'Thane Korr',
  },
  darkelves: {
    id: 'darkelves',
    name: 'Dark Elves',
    tagline: 'Fey cousins with poison strike and stealth.',
    description: 'Forest kin who deal bonus damage from ambush. Dark Elves gain +1 ranged attack and +1 defense.',
    bonus: {
      flatDefense: 1,
      rangedAttack: 1,
      meleeAttack: 0,
      resurrectFraction: 0,
      allowedUnits: ['militia', 'spearman', 'archer', 'knight', 'wizard', 'settler'],
    },
    primaryColor: '#4a2a6a',
    heroName: 'Malys Shadowveil',
  },
  fey: {
    id: 'fey',
    name: 'Fey',
    tagline: 'Magical sprites with powerful healing spells.',
    description: 'Verdant spirits of the deep wood. Fey wizards gain +2 magic damage and 10% resurrect on victory.',
    bonus: {
      flatDefense: 0,
      rangedAttack: 0,
      meleeAttack: 0,
      resurrectFraction: 0.1,
      allowedUnits: ['militia', 'spearman', 'archer', 'wizard', 'giant', 'settler'],
    },
    primaryColor: '#3a7a5a',
    heroName: 'Queen Titania',
  },
  syrnyn: {
    id: 'syrnyn',
    name: 'Syrnyn',
    tagline: 'Dwarven mountaineers with gold and gem hoarding.',
    description: 'Stout miners and gem-cutters. Syrnyn gain +2 defense and +1 melee attack, but no archers or cavalry.',
    bonus: {
      flatDefense: 2,
      rangedAttack: 0,
      meleeAttack: 1,
      resurrectFraction: 0,
      allowedUnits: ['militia', 'spearman', 'knight', 'giant', 'settler'],
    },
    primaryColor: '#8a6420',
    heroName: 'King Dwalin',
  },
};

/** Returns true if the given faction is allowed to recruit the given unit. */
export function canRecruit(
  faction: FactionId,
  unitId: 'militia' | 'spearman' | 'archer' | 'knight' | 'cavalry' | 'wizard' | 'giant' | 'settler',
): boolean {
  return FACTIONS[faction].bonus.allowedUnits.includes(unitId);
}
