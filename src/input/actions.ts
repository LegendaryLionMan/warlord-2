/**
 * Action names. Every player intent is one of these.
 *
 * Phaser scenes and the HUD never branch on raw keyboard codes or mouse
 * buttons directly. They emit actions via the input layer, and the input
 * layer translates physical inputs into actions in keymap.ts.
 */

export const ACTIONS = {
  /** Click on the world / map. */
  select: 'select',
  /** Right-click or Enter on a move target. */
  move: 'move',
  /** Attack target. */
  attack: 'attack',
  /** End the current player's turn. */
  endTurn: 'end-turn',
  /** Skip the current selection / cancel an action. */
  cancel: 'cancel',
  /** Cycle through owned armies. */
  cycleArmy: 'cycle-army',
  /** Toggle the minimap visibility. */
  toggleMinimap: 'toggle-minimap',
  /** Toggle fog of war. */
  toggleFog: 'toggle-fog',
  /** Open recruit menu for the selected city. */
  recruit: 'recruit',
  /** Confirm a choice (Start Game, Pick Faction). */
  confirm: 'confirm',
  /** Pause. */
  pause: 'pause',
  /** Open the dev menu (URL flag ?dev=1 only). */
  openDevMenu: 'open-dev-menu',
} as const;

export type ActionName = (typeof ACTIONS)[keyof typeof ACTIONS];

/** A typed action invocation. */
export interface Action {
  name: ActionName;
  /** Optional payload (e.g. world coordinates for a move). */
  payload?: unknown;
}
