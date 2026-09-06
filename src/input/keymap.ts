/**
 * Physical-input -> action mapping.
 *
 * One place where keys and mouse buttons become Action invocations. The
 * renderer and HUD never check keyboard codes or mouse buttons directly.
 */

import { ACTIONS, type Action } from './actions';

interface KeyBinding {
  /** Phaser/standard key code. */
  key: string;
  /** Mouse button (0 = left, 1 = middle, 2 = right). */
  button?: number;
  action: Action['name'];
}

export const KEY_BINDINGS: ReadonlyArray<KeyBinding> = [
  { key: 'Space', action: ACTIONS.endTurn },
  { key: 'Tab', action: ACTIONS.cycleArmy },
  { key: 'M', action: ACTIONS.toggleMinimap },
  { key: 'F', action: ACTIONS.toggleFog },
  { key: 'Escape', action: ACTIONS.cancel },
  { key: 'R', action: ACTIONS.recruit },
  { key: 'Enter', action: ACTIONS.confirm },
  { key: 'P', action: ACTIONS.pause },
  { key: '`', action: ACTIONS.openDevMenu },
  { key: '', button: 0, action: ACTIONS.select },
  { key: '', button: 2, action: ACTIONS.move },
];

/** Mouse button to action. */
export function actionForButton(button: number): Action['name'] | null {
  const match = KEY_BINDINGS.find((b) => b.button === button);
  return match ? match.action : null;
}

/** Key code to action. */
export function actionForKey(key: string): Action['name'] | null {
  const match = KEY_BINDINGS.find((b) => b.key === key && b.button === undefined);
  return match ? match.action : null;
}
