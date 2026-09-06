/**
 * Stack-based tactical combat per SPEC § 4–5.
 *
 * Formula:
 *   attack_roll  = ATK + d6
 *   defense_roll = DEF + d4 + terrain_bonus
 * Higher roll wins. Ties go to defense. One unit per round.
 *
 * Process:
 *   - Apply hero bonuses to all units.
 *   - Sort by HP (weakest first), so cheap units die first.
 *   - Alternate until one side is empty.
 *   - Undead resurrect 20% of attacker losses on victory.
 *
 * Pure functions. No Phaser, no DOM. Fully unit-testable.
 */

import { TERRAIN } from '../data/terrain';
import type { Army, GameState, OwnerId, TerrainId, Unit } from './state';

export interface CombatResult {
  victory: boolean;
  attackLosses: number;
  defendLosses: number;
  attackUnits: Unit[];
  defendUnits: Unit[];
}

/** Roll a 6-sided die (1..6). */
export function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/** Roll a 4-sided die (1..4). */
export function rollD4(): number {
  return Math.floor(Math.random() * 4) + 1;
}

/** Returns the defense bonus a defender gets from standing on `terrain`. */
export function terrainDefenseBonus(terrain: TerrainId): number {
  return TERRAIN[terrain].defenseBonus;
}

/** Apply hero bonuses to a copy of a unit list. */
function applyHeroBonuses(units: Unit[], hero: Army['hero']): Unit[] {
  if (!hero) return units;
  return units.map((u) => ({
    ...u,
    attack: u.attack + hero.attackBonus,
    defense: u.defense + hero.defenseBonus,
  }));
}

/** Add Spearman's anti-cavalry and Wizard's anti-undead magic bonuses. */
function applySpecialAttackerBonuses(attacker: Unit, defender: Unit, defenderOwner: OwnerId): number {
  let bonus = 0;
  if (attacker.vsCavalry && defender.id === 'cavalry') bonus += attacker.vsCavalry;
  if (attacker.magic && defenderOwner === 'undead') bonus += attacker.magic;
  return bonus;
}

/** Sort a copy of units by HP ascending — weakest dies first. */
function sortWeakestFirst(units: Unit[]): Unit[] {
  return [...units].sort((a, b) => a.hp - b.hp);
}

/** Resolve a battle between two armies on `terrain`. Returns the result. */
export function resolveCombat(
  attacker: Army,
  defender: Army,
  terrain: TerrainId,
): CombatResult {
  let attackUnits = applyHeroBonuses(sortWeakestFirst(attacker.units), attacker.hero);
  let defendUnits = applyHeroBonuses(sortWeakestFirst(defender.units), defender.hero);

  const defBonus = terrainDefenseBonus(terrain);

  // Track original counts for resurrect + loss accounting.
  const originalAttackCount = attacker.units.length;
  const originalDefendCount = defender.units.length;

  while (attackUnits.length > 0 && defendUnits.length > 0) {
    const attackerUnit = attackUnits[0]!;
    const defenderUnit = defendUnits[0]!;

    const attackPower =
      attackerUnit.attack +
      rollD6() +
      applySpecialAttackerBonuses(attackerUnit, defenderUnit, defender.owner);
    const defensePower = defenderUnit.defense + rollD4() + defBonus;

    if (attackPower > defensePower) {
      // Defender unit dies
      defendUnits.shift();
    } else {
      // Defender holds; attacker loses this unit
      attackUnits.shift();
    }
  }

  const victory = attackUnits.length > 0;
  const attackLosses = originalAttackCount - attackUnits.length;
  const defendLosses = originalDefendCount - defendUnits.length;

  // Undead resurrect: 20% of attacker's losses come back on victory.
  if (attacker.owner === 'undead' && victory && attackLosses > 0) {
    const returned = Math.max(1, Math.ceil(attackLosses * 0.2));
    for (let i = 0; i < returned && i < attacker.units.length; i++) {
      const template = attacker.units[i]!;
      attackUnits.push({ ...template, hp: template.maxHp });
    }
  }

  return {
    victory,
    attackLosses: originalAttackCount - attackUnits.length,
    defendLosses,
    attackUnits,
    defendUnits,
  };
}

/** Returns the terrain the defender is standing on for combat. */
export function combatTerrainFor(state: GameState, x: number, y: number): TerrainId {
  const tile = state.map[y]?.[x];
  return tile?.terrain ?? 'plains';
}
