/**
 * HUD-readable mirror of game state. The HUD subscribes to this and never
 * touches the sim directly. The sim never writes to this — the renderer
 * pushes a snapshot after each frame.
 */

import type { FactionId, TerrainId } from '../sim/state';

export interface HudSnapshot {
  turn: number;
  gold: number;
  cities: number;
  armies: number;
  faction: FactionId | null;
  selectedName: string | null;
  selectedTerrain: TerrainId | null;
  selectedXY: { x: number; y: number } | null;
  message: string | null;
}

const initial: HudSnapshot = {
  turn: 1,
  gold: 500,
  cities: 0,
  armies: 0,
  faction: null,
  selectedName: null,
  selectedTerrain: null,
  selectedXY: null,
  message: null,
};

let snapshot: HudSnapshot = { ...initial };
const listeners = new Set<(s: HudSnapshot) => void>();

export function getHudSnapshot(): HudSnapshot {
  return snapshot;
}

export function pushHudSnapshot(next: Partial<HudSnapshot>): void {
  snapshot = { ...snapshot, ...next };
  for (const fn of listeners) fn(snapshot);
}

export function subscribeHud(fn: (s: HudSnapshot) => void): () => void {
  listeners.add(fn);
  fn(snapshot);
  return () => listeners.delete(fn);
}
