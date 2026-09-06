/**
 * HUD controller. Wires the DOM panels to the HUD store. The HUD lives
 * outside the Phaser canvas — it's regular DOM the renderer can layer over.
 */

import { pushHudSnapshot, type HudSnapshot } from './store';
import { mountTopBar } from './panels/top-bar';
import { mountSidePanel } from './panels/side-panel';
import { mountMessageBox } from './panels/message-box';

let mounted = false;
let onEndTurn: () => void = () => {
  pushHudSnapshot({ message: 'End Turn — wired in Phase 4' });
};

/** Mount the HUD once. Idempotent. */
export function initHud(): void {
  if (mounted) return;
  const host = document.getElementById('hud');
  if (!host) {
    console.warn('[hud] no #hud element in DOM; HUD not mounted');
    return;
  }
  host.innerHTML = '';
  mountMessageBox(host);
  mountSidePanel(host);
  mountTopBar(host, onEndTurn);
  mounted = true;
}

/** Set the end-turn handler. Called by the GameScene on create. */
export function setEndTurnHandler(handler: () => void): void {
  onEndTurn = handler;
  if (mounted) {
    const btn = document.querySelector<HTMLButtonElement>('.end-turn-btn');
    if (btn) {
      btn.onclick = () => {
        handler();
        btn.blur();
      };
    }
  }
}

/** Push a partial snapshot to the HUD. */
export function updateHud(patch: Partial<HudSnapshot>): void {
  pushHudSnapshot(patch);
}
