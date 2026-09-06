import { describe, it, expect } from 'vitest';
import { createInitialState, type Army } from './state';
import { createArmy, createUnit, movementBudget, refreshMovement, consumeMovement, isAlive } from './army';

describe('army factories and lifecycle', () => {
  it('createUnit copies template values', () => {
    const u = createUnit('militia', 'humans');
    expect(u.hp).toBe(4);
    expect(u.maxHp).toBe(4);
    expect(u.attack).toBe(2);
    expect(u.moves).toBe(2);
  });

  it('createArmy appends to state.armies and returns it', () => {
    const s = createInitialState();
    const army = createArmy(s, 5, 5, 'humans', ['militia', 'spearman']);
    expect(s.armies.length).toBe(1);
    expect(army.x).toBe(5);
    expect(army.y).toBe(5);
    expect(army.units.length).toBe(2);
    expect(army.owner).toBe('humans');
  });

  it('movementBudget is the max unit moves', () => {
    const s = createInitialState();
    const a = createArmy(s, 0, 0, 'humans', ['militia', 'spearman']);
    expect(movementBudget(a)).toBe(2);
  });

  it('refreshMovement resets the budget', () => {
    const s = createInitialState();
    const a = createArmy(s, 0, 0, 'humans', ['militia']);
    a.units[0]!.moves = 0;
    a.hasMoved = true;
    refreshMovement(a);
    expect(a.units[0]!.moves).toBe(2);
    expect(a.hasMoved).toBe(false);
  });

  it('consumeMovement ends the army for this turn', () => {
    const s = createInitialState();
    const a = createArmy(s, 0, 0, 'humans', ['militia']);
    consumeMovement(a);
    expect(a.hasMoved).toBe(true);
    expect(a.units[0]!.moves).toBe(0);
    expect(a.moves).toEqual([]);
  });

  it('isAlive is true with units, false without', () => {
    const s = createInitialState();
    const a: Army = createArmy(s, 0, 0, 'humans', ['militia']);
    expect(isAlive(a)).toBe(true);
    a.units = [];
    expect(isAlive(a)).toBe(false);
  });
});
