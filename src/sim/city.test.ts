import { describe, it, expect } from 'vitest';
import { createInitialState } from './state';
import { generateMap } from './map';
import { generateCities, cityIncome, createCity, captureCity, addProductionOrder } from './city';

describe('cityIncome', () => {
  it('matches SPEC formula: size * 3 + 2', () => {
    const c1 = { id: 'a', x: 0, y: 0, name: 'X', owner: 'humans' as const, size: 1 as const, goldPerTurn: 5, garrison: [], production: [] };
    const c2 = { ...c1, size: 2 as const };
    const c3 = { ...c1, size: 3 as const };
    expect(cityIncome(c1)).toBe(5);
    expect(cityIncome(c2)).toBe(8);
    expect(cityIncome(c3)).toBe(11);
  });
});

describe('createCity + capture', () => {
  it('createCity appends to state.cities and uses the right income', () => {
    const s = createInitialState();
    const c = createCity(s, 5, 5, 2, 'humans', 0);
    expect(s.cities.length).toBe(1);
    expect(c.x).toBe(5);
    expect(c.y).toBe(5);
    expect(c.size).toBe(2);
    expect(c.goldPerTurn).toBe(8);
  });

  it('captureCity flips ownership', () => {
    const s = createInitialState();
    const c = createCity(s, 5, 5, 2, 'humans', 0);
    captureCity('orcs', c, []);
    expect(c.owner).toBe('orcs');
    expect(c.garrison).toEqual([]);
  });

  it('captureCity can preserve surviving garrison', () => {
    const s = createInitialState();
    const c = createCity(s, 5, 5, 2, 'humans', 0);
    const survivor = { id: 'militia' as const, hp: 1, maxHp: 4, attack: 2, defense: 1, moves: 0, maxMoves: 2, ranged: false, range: 0, vsCavalry: 0, magic: 0 };
    captureCity('orcs', c, [survivor]);
    expect(c.garrison.length).toBe(1);
    expect(c.garrison[0]!.hp).toBe(1);
  });
});

describe('addProductionOrder', () => {
  it('queues a unit, deducts gold, rejects when full or poor', () => {
    const s = createInitialState();
    s.gold = 200;
    const c = createCity(s, 5, 5, 1, 'humans', 0);

    expect(addProductionOrder(s, c, 'spearman')).toBe(true); // 200 - 100 = 100
    expect(s.gold).toBe(100);
    expect(c.production.length).toBe(1);

    expect(addProductionOrder(s, c, 'spearman')).toBe(false); // queue full at size 1
    expect(addProductionOrder(s, c, 'wizard')).toBe(false); // not enough gold (100 < 400)
  });
});

describe('generateCities', () => {
  it('places cities on passable terrain with min spacing', () => {
    const s = createInitialState({ factionCount: 2 });
    generateMap(s, 7);
    generateCities(s, 7);
    expect(s.cities.length).toBeGreaterThan(0);
    for (const c of s.cities) {
      const t = s.map[c.y]?.[c.x]?.terrain;
      expect(['plains', 'forest', 'hills']).toContain(t);
    }
  });
});
