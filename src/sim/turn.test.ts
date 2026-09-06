import { describe, it, expect } from 'vitest';
import { createInitialState } from './state';
import { createArmy, consumeMovement } from './army';
import { createCity } from './city';
import { endPlayerTurn } from './turn';

describe('endPlayerTurn', () => {
  it('collects income from player cities', () => {
    const s = createInitialState();
    s.gold = 0;
    createCity(s, 5, 5, 2, 'humans', 0);
    createCity(s, 10, 5, 3, 'humans', 1);
    const initialGold = s.gold;
    const income = endPlayerTurn(s);
    expect(income).toBe(8 + 11);
    expect(s.gold).toBe(initialGold + 19);
  });

  it('skips non-player cities', () => {
    const s = createInitialState();
    s.gold = 0;
    createCity(s, 5, 5, 3, 'orcs', 0);
    const income = endPlayerTurn(s);
    expect(income).toBe(0);
  });

  it('resets player army movement', () => {
    const s = createInitialState();
    const a = createArmy(s, 5, 5, 'humans', ['militia']);
    consumeMovement(a);
    expect(a.hasMoved).toBe(true);
    endPlayerTurn(s);
    expect(a.hasMoved).toBe(false);
    expect(a.units[0]!.moves).toBe(2);
  });

  it('advances the turn', () => {
    const s = createInitialState();
    expect(s.turn).toBe(1);
    endPlayerTurn(s);
    expect(s.turn).toBe(2);
  });

  it('does not reset enemy army movement', () => {
    const s = createInitialState();
    const enemy = createArmy(s, 10, 10, 'orcs', ['militia']);
    consumeMovement(enemy);
    endPlayerTurn(s);
    expect(enemy.hasMoved).toBe(true);
  });
});
