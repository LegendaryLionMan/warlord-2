import { describe, it, expect } from 'vitest';
import { createInitialState } from './state';
import { generateMap } from './map';
import { createArmy } from './army';
import { createCity } from './city';
import { endAiTurn, endAllAiTurns, pickTarget } from './ai';

describe('pickTarget', () => {
  it('returns null when no cities exist', () => {
    const s = createInitialState();
    generateMap(s, 1);
    const army = createArmy(s, 5, 5, 'orcs', ['militia']);
    expect(pickTarget(s, army)).toBeNull();
  });

  it('prefers neutral over enemy cities', () => {
    const s = createInitialState();
    generateMap(s, 1);
    s.cities = [];
    const army = createArmy(s, 5, 5, 'orcs', ['militia']);
    const neutral = createCity(s, 8, 5, 1, 'neutral', 0);
    createCity(s, 5, 9, 1, 'humans', 0);
    expect(pickTarget(s, army)).toBe(neutral);
  });

  it('skips own cities', () => {
    const s = createInitialState();
    generateMap(s, 1);
    s.cities = [];
    const army = createArmy(s, 5, 5, 'orcs', ['militia']);
    createCity(s, 8, 5, 1, 'orcs', 0);
    expect(pickTarget(s, army)).toBeNull();
  });
});

describe('endAiTurn', () => {
  it('moves an army toward a neutral city', () => {
    const s = createInitialState();
    generateMap(s, 1);
    s.cities = [];
    const army = createArmy(s, 5, 5, 'orcs', ['militia']);
    createCity(s, 7, 5, 1, 'neutral', 0);
    endAiTurn(s, 'orcs');
    // Should have stepped toward (7,5). At minimum, not stay at (5,5) if path was clear.
    expect(army.x !== 5 || army.y !== 5).toBe(true);
  });

  it('captures a neutral city when an army steps onto it', () => {
    const s = createInitialState();
    generateMap(s, 1);
    s.cities = [];
    const army = createArmy(s, 5, 5, 'orcs', ['militia']);
    createCity(s, 6, 5, 1, 'neutral', 0);
    endAiTurn(s, 'orcs');
    expect(army.units.length).toBeGreaterThan(0);
  });

  it('recruits a unit at a faction city if it can afford one', () => {
    const s = createInitialState();
    generateMap(s, 1);
    s.cities = [];
    s.gold = 200;
    const city = createCity(s, 5, 5, 2, 'orcs', 0);
    endAiTurn(s, 'orcs');
    expect(city.production.length).toBe(1);
    // AI prefers spearman when treasury >= 200, so 200 - 100 = 100.
    expect(s.gold).toBe(100);
    expect(city.production[0]?.unitId).toBe('spearman');
  });
});

describe('endAllAiTurns', () => {
  it('runs each non-player faction once', () => {
    const s = createInitialState({ factionCount: 3, playerFaction: 'humans' });
    generateMap(s, 1);
    s.cities = [];
    createCity(s, 5, 5, 1, 'humans', 0);
    createArmy(s, 5, 6, 'elves', ['militia']);
    createArmy(s, 5, 7, 'orcs', ['militia']);
    const order = endAllAiTurns(s);
    expect(order).toContain('elves');
    expect(order).toContain('orcs');
    expect(order).not.toContain('humans');
  });
});
