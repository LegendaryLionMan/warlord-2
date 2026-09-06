import { describe, it, expect } from 'vitest';
import { applyFactionBonuses, bonusesFor } from './faction-bonus';
import { createUnit } from './army';

describe('bonusesFor', () => {
  it('returns the right per-faction bonus', () => {
    expect(bonusesFor('humans')).toEqual({ flatDefense: 1, rangedAttack: 0, meleeAttack: 0 });
    expect(bonusesFor('elves')).toEqual({ flatDefense: 0, rangedAttack: 1, meleeAttack: 0 });
    expect(bonusesFor('orcs')).toEqual({ flatDefense: 0, rangedAttack: 0, meleeAttack: 1 });
    expect(bonusesFor('undead')).toEqual({ flatDefense: 0, rangedAttack: 0, meleeAttack: 0 });
  });
});

describe('applyFactionBonuses', () => {
  it('Humans get +1 defense on all units', () => {
    const u = createUnit('militia', 'humans');
    const result = applyFactionBonuses([u], 'humans');
    expect(result[0]!.defense).toBe(u.defense + 1);
  });

  it('Elves get +1 attack on ranged units only', () => {
    const archer = createUnit('archer', 'elves');
    const militia = createUnit('militia', 'elves');
    const result = applyFactionBonuses([archer, militia], 'elves');
    expect(result[0]!.attack).toBe(archer.attack + 1);
    expect(result[1]!.attack).toBe(militia.attack);
  });

  it('Orcs get +1 attack on melee units only', () => {
    const knight = createUnit('knight', 'orcs');
    const archer = createUnit('archer', 'orcs');
    const result = applyFactionBonuses([knight, archer], 'orcs');
    expect(result[0]!.attack).toBe(knight.attack + 1);
    expect(result[1]!.attack).toBe(archer.attack);
  });

  it('returns a new list; original is unchanged', () => {
    const u = createUnit('militia', 'humans');
    const result = applyFactionBonuses([u], 'humans');
    expect(result).not.toBe(u);
  });
});
