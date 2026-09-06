/**
 * Top bar — turn counter, gold, cities, armies, end-turn button.
 * Mounts into a host element; updates from the HUD store.
 */

import { subscribeHud, type HudSnapshot } from '../store';
import { audioManager } from '../../assets/audio-manager';

export interface TopBarElements {
  root: HTMLElement;
  turn: HTMLElement;
  gold: HTMLElement;
  cities: HTMLElement;
  armies: HTMLElement;
  endTurnBtn: HTMLButtonElement;
  saveBtn: HTMLButtonElement;
  loadBtn: HTMLButtonElement;
  muteBtn: HTMLButtonElement;
}

export function mountTopBar(host: HTMLElement, onEndTurn: () => void): TopBarElements {
  const root = document.createElement('div');
  root.className = 'top-bar';

  const turn = document.createElement('span');
  turn.className = 'top-stat turn';
  turn.textContent = '⚔ Turn 1';

  const gold = document.createElement('span');
  gold.className = 'top-stat';
  gold.textContent = '💰 500';

  const cities = document.createElement('span');
  cities.className = 'top-stat';
  cities.textContent = '🏰 0';

  const armies = document.createElement('span');
  armies.className = 'top-stat';
  armies.textContent = '⚔ 0';

  const saveBtn = document.createElement('button');
  saveBtn.className = 'hud-action-btn';
  saveBtn.textContent = '💾 Save';
  saveBtn.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('warlords2:save'));
    saveBtn.blur();
  });

  const loadBtn = document.createElement('button');
  loadBtn.className = 'hud-action-btn';
  loadBtn.textContent = '📂 Load';
  loadBtn.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('warlords2:load'));
    loadBtn.blur();
  });

  const muteBtn = document.createElement('button');
  muteBtn.className = 'hud-action-btn mute-btn';
  muteBtn.textContent = '🔊';
  muteBtn.title = 'Mute/unmute audio (M)';
  muteBtn.addEventListener('click', () => {
    const next = !audioManager.isMuted();
    audioManager.setMuted(next);
    muteBtn.textContent = next ? '🔇' : '🔊';
    muteBtn.title = next ? 'Unmute audio (M)' : 'Mute/unmute audio (M)';
    muteBtn.blur();
  });

  const endTurnBtn = document.createElement('button');
  endTurnBtn.className = 'end-turn-btn';
  endTurnBtn.textContent = 'End Turn';
  endTurnBtn.addEventListener('click', () => {
    onEndTurn();
    endTurnBtn.blur();
  });

  root.append(turn, gold, cities, armies, saveBtn, loadBtn, muteBtn, endTurnBtn);
  host.appendChild(root);

  const render = (s: HudSnapshot): void => {
    turn.textContent = `⚔ Turn ${s.turn}`;
    gold.textContent = `💰 ${s.gold}`;
    cities.textContent = `🏰 ${s.cities}`;
    armies.textContent = `⚔ ${s.armies}`;
  };

  subscribeHud(render);

  return { root, turn, gold, cities, armies, endTurnBtn, saveBtn, loadBtn, muteBtn };
}
