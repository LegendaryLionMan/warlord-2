import { describe, it, expect } from 'vitest';
import { createInitialState, isArmy, isCity, type Army, type City } from './state';

describe('createInitialState', () => {
  it('returns a state with the right defaults', () => {
    const s = createInitialState();
    expect(s.turn).toBe(1);
    expect(s.gold).toBe(500);
    expect(s.mapWidth).toBe(32);
    expect(s.mapHeight).toBe(32);
    expect(s.factionCount).toBe(4);
    expect(s.playerFaction).toBe('humans');
    expect(s.fogOfWar).toBe(true);
    expect(s.phase).toBe('menu');
  });

  it('respects overrides', () => {
    const s = createInitialState({
      mapWidth: 40,
      mapHeight: 30,
      factionCount: 2,
      playerFaction: 'elves',
      fogOfWar: false,
    });
    expect(s.mapWidth).toBe(40);
    expect(s.mapHeight).toBe(30);
    expect(s.factionCount).toBe(2);
    expect(s.playerFaction).toBe('elves');
    expect(s.fogOfWar).toBe(false);
  });

  it('starts with empty collections', () => {
    const s = createInitialState();
    expect(s.map).toEqual([]);
    expect(s.cities).toEqual([]);
    expect(s.armies).toEqual([]);
    expect(s.heroes).toEqual([]);
    expect(s.features).toEqual([]);
    expect(s.selectedEntity).toBeNull();
  });
});

describe('isArmy / isCity', () => {
  it('identifies armies', () => {
    const army: Army = {
      id: 'a1',
      x: 0,
      y: 0,
      owner: 'humans',
      units: [],
      hero: null,
      moves: [],
      hasMoved: false,
      fortifyBonus: 0,
    };
    expect(isArmy(army)).toBe(true);
    expect(isCity(army)).toBe(false);
  });

  it('identifies cities', () => {
    const city: City = {
      id: 'c1',
      x: 0,
      y: 0,
      name: 'Test',
      owner: 'humans',
      size: 1,
      goldPerTurn: 100,
      garrison: [],
      production: [],
    };
    expect(isCity(city)).toBe(true);
    expect(isArmy(city)).toBe(false);
  });

  it('handles null', () => {
    expect(isArmy(null)).toBe(false);
    expect(isCity(null)).toBe(false);
  });
});
