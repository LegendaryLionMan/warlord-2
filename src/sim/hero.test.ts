import { describe, it, expect } from 'vitest';
import { createInitialState } from './state';
import { createHero, addHeroExperience, applyFortify, applyRally } from './hero';
import { createArmy } from './army';

describe('createHero', () => {
  it('creates a level-1 hero with starting abilities', () => {
    const h = createHero('humans');
    expect(h.level).toBe(1);
    expect(h.attackBonus).toBe(1);
    expect(h.defenseBonus).toBe(0);
    expect(h.abilities).toContain('leadership');
    expect(h.abilities).toContain('fortify');
  });
});

describe('addHeroExperience', () => {
  it('levels up at 50 XP for level 1', () => {
    const h = createHero('humans');
    addHeroExperience(h, 50);
    expect(h.level).toBe(2);
    expect(h.attackBonus).toBe(2);
  });

  it('unlocks next ability on level up', () => {
    const h = createHero('humans');
    addHeroExperience(h, 50);
    expect(h.abilities).toContain('rally');
  });
});

describe('applyFortify', () => {
  it('adds 2 defense to the stack', () => {
    const s = createInitialState();
    const a = createArmy(s, 5, 5, 'humans', ['militia']);
    const h = createHero('humans');
    const beforeDef = a.units[0]!.defense;
    applyFortify(a, h);
    expect(a.units[0]!.defense).toBe(beforeDef + 2);
    expect(a.fortifyBonus).toBe(2);
  });

  it('fails if hero does not have the ability', () => {
    const s = createInitialState();
    const a = createArmy(s, 5, 5, 'humans', ['militia']);
    const h = createHero('humans');
    h.abilities = [];
    expect(applyFortify(a, h)).toBe(false);
  });
});

describe('applyRally', () => {
  it('restores 2 HP to each unit up to max', () => {
    const s = createInitialState();
    const a = createArmy(s, 5, 5, 'humans', ['militia']);
    a.units[0]!.hp = 1;
    const h = createHero('humans');
    h.abilities.push('rally');
    const restored = applyRally(a, h);
    expect(restored).toBe(1);
    expect(a.units[0]!.hp).toBe(3);
  });
});
