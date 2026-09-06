/**
 * Army model. Phase 2: a single player army with one or more units and
 * a movement budget. Phase 3 extends this with stack-based combat; Phase 6
 * adds hero abilities; Phase 5 adds AI-side decisions.
 *
 * Pure functions. No Phaser, no DOM. Fully unit-testable.
 */

import { UNITS, type UnitTemplate } from '../data/units';
import type { Army, GameState, Unit, UnitId } from './state';

let nextId = 1;
function newId(prefix: string): string {
  return `${prefix}_${nextId++}`;
}

/** Create a single Unit from a template, applying faction starting HP. */
export function createUnit(unitId: UnitId, _owner: string): Unit {
  const t: UnitTemplate = UNITS[unitId];
  return {
    id: unitId,
    hp: t.hp,
    maxHp: t.hp,
    attack: t.attack,
    defense: t.defense,
    moves: t.moves,
    maxMoves: t.moves,
    ranged: t.ranged,
    range: t.range,
    vsCavalry: t.vsCavalry,
    magic: t.magic,
  };
}

/** Create a new Army at (x, y) with the given unit types. */
export function createArmy(
  state: GameState,
  x: number,
  y: number,
  owner: Army['owner'],
  unitIds: UnitId[],
): Army {
  const army: Army = {
    id: newId('army'),
    x,
    y,
    owner,
    units: unitIds.map((u) => createUnit(u, owner)),
    hero: null,
    moves: [],
    hasMoved: false,
    fortifyBonus: 0,
  };
  state.armies.push(army);
  return army;
}

/** Minimal interface for functions that only need army coordinates + units. */
export interface ArmyLike {
  x: number;
  y: number;
  units: Array<{ maxMoves: number }>;
}

/** Sum the units' moves into a movement budget for the army. */
export function movementBudget(army: ArmyLike): number {
  return army.units.reduce((max, u) => Math.max(max, u.maxMoves), 0);
}

/** After moving, deduct the move cost from the army's beenMoved flag. */
export function consumeMovement(army: Army): void {
  army.hasMoved = true;
  army.units.forEach((u) => {
    u.moves = 0;
  });
  army.moves = [];
}

/** Reset the army's movement at the start of a new turn. */
export function refreshMovement(army: Army): void {
  army.hasMoved = false;
  army.moves = [];
  army.units.forEach((u) => {
    u.moves = u.maxMoves;
  });
}

/** Returns true if the army has any alive unit. */
export function isAlive(army: Army): boolean {
  return army.units.length > 0;
}
