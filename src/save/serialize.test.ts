import { describe, it, expect } from 'vitest';
import { createInitialState, type GameState } from '../sim/state';
import { generateMap } from '../sim/map';
import { createCity } from '../sim/city';
import { createArmy } from '../sim/army';
import { serialize, deserialize, SAVE_VERSION } from './serialize';

function buildState(): GameState {
  const s = createInitialState();
  generateMap(s, 7);
  createCity(s, 5, 5, 2, 'humans', 0);
  createCity(s, 10, 5, 2, 'orcs', 0);
  createArmy(s, 6, 5, 'humans', ['militia', 'spearman']);
  return s;
}

describe('serialize / deserialize round-trip', () => {
  it('preserves all fields', () => {
    const original = buildState();
    const payload = serialize(original);
    const restored = deserialize(payload);
    expect(restored.gold).toBe(original.gold);
    expect(restored.turn).toBe(original.turn);
    expect(restored.cities.length).toBe(original.cities.length);
    expect(restored.armies.length).toBe(original.armies.length);
    expect(restored.armies[0]?.units.length).toBe(2);
  });

  it('preserves city ownership', () => {
    const s = buildState();
    const payload = serialize(s);
    const restored = deserialize(payload);
    expect(restored.cities.find((c) => c.x === 5)?.owner).toBe('humans');
    expect(restored.cities.find((c) => c.x === 10)?.owner).toBe('orcs');
  });

  it('records the save version', () => {
    const s = buildState();
    const payload = serialize(s);
    expect(payload.version).toBe(SAVE_VERSION);
    expect(payload.savedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('rejects a wrong-version payload', () => {
    const s = buildState();
    const payload = serialize(s);
    const bad = { ...payload, version: 999 };
    expect(() => deserialize(bad)).toThrow(/version mismatch/i);
  });

  it('handles an empty / freshly-initialized state', () => {
    const s = createInitialState();
    const restored = deserialize(serialize(s));
    expect(restored.gold).toBe(500);
    expect(restored.turn).toBe(1);
  });
});
