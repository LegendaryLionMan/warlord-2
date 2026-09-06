/**
 * HUD controller. Wires the DOM panels to the HUD store. The HUD lives
 * outside the Phaser canvas — it's regular DOM the renderer can layer over.
 */

import { pushHudSnapshot, type HudSnapshot } from './store';
import { mountTopBar } from './panels/top-bar';
import { mountSidePanel } from './panels/side-panel';
import { mountMessageBox } from './panels/message-box';

let mounted = false;

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
  mountTopBar(host, () => {
    // Phase 0: end-turn is a no-op. Phase 4 wires this to sim/turn.ts.
    pushHudSnapshot({ message: 'End Turn — wired in Phase 4' });
  });
  mounted = true;
}

/** Push a partial snapshot to the HUD. */
export function updateHud(patch: Partial<HudSnapshot>): void {
  pushHudSnapshot(patch);
}
