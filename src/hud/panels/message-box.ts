/**
 * Message box — transient notifications at the top of the screen.
 * Subscribes to the HUD store; auto-hides 3.5 seconds after a push.
 */

import { subscribeHud, type HudSnapshot } from '../store';

export interface MessageBoxElements {
  root: HTMLElement;
}

let hideTimer: number | null = null;

export function mountMessageBox(host: HTMLElement): MessageBoxElements {
  const root = document.createElement('div');
  root.className = 'message-box hidden';
  host.appendChild(root);

  const render = (s: HudSnapshot): void => {
    if (!s.message) {
      root.classList.add('hidden');
      return;
    }
    root.textContent = s.message;
    root.classList.remove('hidden');
    if (hideTimer !== null) window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      root.classList.add('hidden');
      hideTimer = null;
    }, 3500);
  };

  subscribeHud(render);

  return { root };
}
