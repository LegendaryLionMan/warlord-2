import { describe, it, expect } from 'vitest';
import { createInitialState } from './state';
import { createCity } from './city';
import { createArmy } from './army';
import { checkOutcome } from './win';

describe('checkOutcome', () => {
  it('returns playing at start', () => {
    const s = createInitialState();
    createCity(s, 1, 1, 1, 'humans', 0);
    createCity(s, 5, 5, 1, 'orcs', 0);
    createArmy(s, 1, 1, 'humans', ['militia']);
    expect(checkOutcome(s)).toBe('playing');
  });

  it('wins when player owns 75% of cities', () => {
    const s = createInitialState();
    for (let i = 0; i < 4; i++) createCity(s, i, 0, 1, 'humans', i);
    expect(checkOutcome(s)).toBe('won');
  });

  it('does not win below 75%', () => {
    const s = createInitialState();
    createCity(s, 0, 0, 1, 'humans', 0);
    createCity(s, 1, 0, 1, 'orcs', 0);
    createCity(s, 2, 0, 1, 'orcs', 0);
    createCity(s, 3, 0, 1, 'orcs', 0);
    createArmy(s, 0, 0, 'humans', ['militia']);
    // 1/4 = 25% < 75%
    expect(checkOutcome(s)).toBe('playing');
  });

  it('loses if player has no units and no cities', () => {
    const s = createInitialState();
    createCity(s, 0, 0, 1, 'orcs', 0);
    // Player has no cities and no armies
    expect(checkOutcome(s)).toBe('lost');
  });

  it('still playing when player has only units, no cities', () => {
    const s = createInitialState();
    createCity(s, 0, 0, 1, 'orcs', 0);
    createArmy(s, 1, 0, 'humans', ['militia']);
    // Player has 0 cities but 1 army. Original SPEC: lose all units AND all cities. With an army, still playing.
    expect(checkOutcome(s)).toBe('playing');
  });
});
