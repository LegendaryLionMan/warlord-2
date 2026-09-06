/**
 * GameState <-> JSON serialization. The save format is just the GameState
 * with no transformation; the renderer is not part of the persisted state.
 *
 * Add a version field when the schema changes so older saves can be migrated.
 */

import type { GameState } from '../sim/state';

export const SAVE_VERSION = 1;

export interface SerializedSave {
  version: number;
  savedAt: string; // ISO timestamp
  state: GameState;
}

export function serialize(state: GameState): SerializedSave {
  return {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    state: JSON.parse(JSON.stringify(state)) as GameState,
  };
}

export function deserialize(payload: SerializedSave): GameState {
  if (payload.version !== SAVE_VERSION) {
    throw new Error(
      `Save version mismatch: got ${payload.version}, expected ${SAVE_VERSION}. ` +
        `Add a migration in deserialize() before loading.`,
    );
  }
  return payload.state;
}
