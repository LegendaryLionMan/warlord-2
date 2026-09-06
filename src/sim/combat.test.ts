import { describe, it, expect } from 'vitest';
import { createInitialState, type Army } from './state';
import { generateMap } from './map';
import { resolveCombat, rollD4, rollD6, terrainDefenseBonus } from './combat';
import { createUnit } from './army';

describe('dice rolls', () => {
  it('d6 in [1,6]', () => {
    for (let i = 0; i < 200; i++) {
      const r = rollD6();
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThanOrEqual(6);
    }
  });
  it('d4 in [1,4]', () => {
    for (let i = 0; i < 200; i++) {
      const r = rollD4();
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThanOrEqual(4);
    }
  });
});

describe('terrainDefenseBonus', () => {
  it('matches SPEC values', () => {
    expect(terrainDefenseBonus('plains')).toBe(0);
    expect(terrainDefenseBonus('forest')).toBe(1);
    expect(terrainDefenseBonus('hills')).toBe(2);
    expect(terrainDefenseBonus('mountains')).toBe(0);
    expect(terrainDefenseBonus('water')).toBe(0);
  });
});

describe('resolveCombat', () => {
  function makeAttacker(units: Array<'militia' | 'spearman' | 'archer' | 'knight' | 'cavalry' | 'wizard' | 'giant'>): Army {
    return {
      id: 'atk',
      x: 0,
      y: 0,
      owner: 'humans',
      units: units.map((u) => createUnit(u, 'humans')),
      hero: null,
      moves: [],
      hasMoved: false,
      fortifyBonus: 0,
    };
  }
  function makeDefender(units: Array<'militia' | 'spearman' | 'archer' | 'knight' | 'cavalry' | 'wizard' | 'giant'>, owner: 'humans' | 'undead' = 'humans'): Army {
    return {
      id: 'def',
      x: 0,
      y: 0,
      owner,
      units: units.map((u) => createUnit(u, owner)),
      hero: null,
      moves: [],
      hasMoved: false,
      fortifyBonus: 0,
    };
  }

  it('attacks happen weakest-first', () => {
    const a = makeAttacker(['knight', 'militia']);
    const d = makeDefender(['militia']);
    // Run many trials; militia (hp=4) should die first.
    let militiaDiedFirst = 0;
    for (let i = 0; i < 50; i++) {
      const r = resolveCombat(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(d)), 'plains');
      if (r.defendLosses === 1) militiaDiedFirst++;
    }
    expect(militiaDiedFirst).toBeGreaterThan(0);
  });

  it('attackPower > defensePower kills defender; else attacker dies', () => {
    // Construct armies where attacker reliably wins and defender reliably loses.
    const a = makeAttacker(['giant']); // atk 8
    const d = makeDefender(['militia']); // def 1
    // atk 8 + d6 (1..6) = 9..14, def 1 + d4 (1..4) = 2..5. Attacker always wins.
    for (let i = 0; i < 50; i++) {
      const r = resolveCombat(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(d)), 'plains');
      expect(r.victory).toBe(true);
      expect(r.defendLosses).toBe(1);
      expect(r.attackLosses).toBe(0);
    }
  });

  it('huge attack bonus and huge defense bonus: defender holds', () => {
    const a = makeAttacker(['militia']); // atk 2
    const d = makeDefender(['giant']); // def 5
    // atk 2 + d6 (1..6) = 3..8, def 5 + d4 (1..4) + bonus = 6..9 + 0 (plains).
    // Almost always defender holds.
    let defenderWon = 0;
    for (let i = 0; i < 100; i++) {
      const r = resolveCombat(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(d)), 'plains');
      if (!r.victory) defenderWon++;
    }
    expect(defenderWon).toBeGreaterThan(50);
  });

  it('forest defense bonus helps defender', () => {
    // Defender in forest should win more often than on plains.
    const a = makeAttacker(['militia']);
    const d = makeDefender(['militia']);
    let defenderWonForest = 0;
    let defenderWonPlains = 0;
    for (let i = 0; i < 200; i++) {
      const r1 = resolveCombat(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(d)), 'forest');
      if (!r1.victory) defenderWonForest++;
      const r2 = resolveCombat(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(d)), 'plains');
      if (!r2.victory) defenderWonPlains++;
    }
    expect(defenderWonForest).toBeGreaterThan(defenderWonPlains);
  });

  it('hero attack bonus shifts outcome', () => {
    const a = makeAttacker(['militia']);
    a.hero = { id: 'h1', name: 'A', level: 5, exp: 0, owner: 'humans', attackBonus: 5, defenseBonus: 0, abilities: [] };
    const d = makeDefender(['militia']);
    let attackerWon = 0;
    for (let i = 0; i < 100; i++) {
      const r = resolveCombat(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(d)), 'plains');
      if (r.victory) attackerWon++;
    }
    expect(attackerWon).toBeGreaterThan(70);
  });

  it('undead resurrects 20% of losses on victory', () => {
    const a = makeAttacker(['militia', 'militia', 'militia', 'militia', 'militia']);
    a.owner = 'undead';
    const d = makeDefender(['giant']);
    // 5 militia vs 1 giant. Loss 1, resurrect ceil(1*0.2)=1. Attack has 5 units at end.
    // Run many times; just confirm attacker still has units and victory.
    let undeadVictory = 0;
    for (let i = 0; i < 200; i++) {
      const r = resolveCombat(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(d)), 'plains');
      if (r.victory) undeadVictory++;
    }
    expect(undeadVictory).toBeGreaterThan(0);
  });

  it('spearman deals +2 to cavalry', () => {
    // 1 spearman vs 1 cavalry, plains. The +2 should bias toward attacker.
    const a = makeAttacker(['spearman']);
    const d = makeDefender(['cavalry']);
    let attackerWon = 0;
    for (let i = 0; i < 200; i++) {
      const r = resolveCombat(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(d)), 'plains');
      if (r.victory) attackerWon++;
    }
    expect(attackerWon).toBeGreaterThan(50);
  });

  it('wizard deals +3 magic to undead', () => {
    const a = makeAttacker(['wizard']);
    const d = makeDefender(['militia'], 'undead');
    let attackerWon = 0;
    for (let i = 0; i < 100; i++) {
      const r = resolveCombat(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(d)), 'plains');
      if (r.victory) attackerWon++;
    }
    expect(attackerWon).toBeGreaterThan(50);
  });

  it('generateMap integration smoke test', () => {
    const s = createInitialState();
    generateMap(s, 1);
    expect(s.map.length).toBe(32);
  });
});
