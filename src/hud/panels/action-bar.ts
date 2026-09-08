/**
 * Bottom action bar — 8 unit slots for the selected army + 4
 * production icons. Mirrors the 1993 Warlords II action bar
 * (the strip across the bottom showing the current stack and
 * buildable units).
 */

import { subscribeHud, type HudSnapshot } from '../store';
import { UNITS } from '../../data/units';

export interface ActionBarElements {
  root: HTMLElement;
  slots: HTMLElement[];
  productionIcons: HTMLElement[];
}

export function mountActionBar(host: HTMLElement): ActionBarElements {
  const root = document.createElement('div');
  root.className = 'action-bar';

  // 8 unit slots (the army stack).
  const slots: HTMLElement[] = [];
  for (let i = 0; i < 8; i++) {
    const slot = document.createElement('div');
    slot.className = 'action-slot';
    slot.title = `Unit slot ${i + 1}`;
    slots.push(slot);
    root.appendChild(slot);
  }

  // 4 production icons (the buildable unit types).
  const productionIds: Array<keyof typeof UNITS> = ['militia', 'spearman', 'archer', 'knight'];
  const productionIcons: HTMLElement[] = [];
  for (const uid of productionIds) {
    const u = UNITS[uid];
    const icon = document.createElement('div');
    icon.className = 'action-prod';
    icon.title = `${u.name} (${u.cost}gp)`;
    icon.textContent = u.name.charAt(0);
    productionIcons.push(icon);
    root.appendChild(icon);
  }

  // Done / X (end turn) button on the far right.
  const end = document.createElement('div');
  end.className = 'action-end';
  end.textContent = 'X';
  end.title = 'End turn';
  root.appendChild(end);

  host.appendChild(root);

  // Populate slots from a snapshot if a player army is present.
  // Phase 15 wires the actual army state in GameScene; for now we
  // populate from a default placeholder stack so the action bar is
  // visible.
  const placeholder = (): void => {
    slots.forEach((s, i) => {
      s.classList.remove('filled');
      s.textContent = i < 2 ? '1' : '';
      if (i < 2) s.classList.add('filled');
    });
  };
  placeholder();

  subscribeHud((s: HudSnapshot) => {
    // The HUD store only knows counts; the action bar reads army
    // detail from window.actionBarPayload (set by GameScene).
    void s;
  });

  return { root, slots, productionIcons };
}
