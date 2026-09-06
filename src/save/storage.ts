/**
 * localStorage adapter for the save format. Keyed by save slot name.
 *
 * For Phase 0 this is a stub — it works but the sim doesn't call it yet.
 * Phase 8 wires it into the end-turn flow and the menu.
 */

import { deserialize, serialize, type SerializedSave } from './serialize';
import type { GameState } from '../sim/state';

const SLOT_KEY_PREFIX = 'warlords2.save.';

export function saveSlot(name: string, state: GameState): void {
  if (typeof localStorage === 'undefined') return;
  const payload = serialize(state);
  localStorage.setItem(SLOT_KEY_PREFIX + name, JSON.stringify(payload));
}

export function loadSlot(name: string): GameState | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(SLOT_KEY_PREFIX + name);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SerializedSave;
    return deserialize(parsed);
  } catch {
    return null;
  }
}

export function listSlots(): string[] {
  if (typeof localStorage === 'undefined') return [];
  const slots: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(SLOT_KEY_PREFIX)) {
      slots.push(key.slice(SLOT_KEY_PREFIX.length));
    }
  }
  return slots;
}

export function deleteSlot(name: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(SLOT_KEY_PREFIX + name);
}
