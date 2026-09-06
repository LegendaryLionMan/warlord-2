/**
 * Side panel — shows details of the currently selected entity (army or city).
 * In Phase 0 it's a placeholder with a "click on a city or army" message.
 */

import { subscribeHud, type HudSnapshot } from '../store';

export interface SidePanelElements {
  root: HTMLElement;
  body: HTMLElement;
}

export function mountSidePanel(host: HTMLElement): SidePanelElements {
  const root = document.createElement('div');
  root.className = 'side-panel';

  const title = document.createElement('div');
  title.className = 'panel-title';
  title.textContent = 'Selection';

  const body = document.createElement('div');
  body.className = 'panel-body';
  body.innerHTML = '<p class="empty">Click on a city or army.</p>';

  root.append(title, body);
  host.appendChild(root);

  const render = (s: HudSnapshot): void => {
    if (s.selectedName) {
      body.innerHTML = `<p class="selected">${escapeHtml(s.selectedName)}</p>`;
    } else if (s.selectedTerrain) {
      const x = s.selectedXY?.x ?? 0;
      const y = s.selectedXY?.y ?? 0;
      const name = s.selectedTerrain.charAt(0).toUpperCase() + s.selectedTerrain.slice(1);
      body.innerHTML = `
        <p class="selected">${escapeHtml(name)}</p>
        <p class="coord">(${x}, ${y})</p>
      `;
    } else {
      body.innerHTML = '<p class="empty">Click on a city, army, or tile.</p>';
    }
  };

  subscribeHud(render);

  return { root, body };
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
