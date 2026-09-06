/**
 * Top bar — turn counter, gold, cities, armies, end-turn button.
 * Mounts into a host element; updates from the HUD store.
 */

import { subscribeHud, type HudSnapshot } from '../store';

export interface TopBarElements {
  root: HTMLElement;
  turn: HTMLElement;
  gold: HTMLElement;
  cities: HTMLElement;
  armies: HTMLElement;
  endTurnBtn: HTMLButtonElement;
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

  const endTurnBtn = document.createElement('button');
  endTurnBtn.className = 'end-turn-btn';
  endTurnBtn.textContent = 'End Turn';
  endTurnBtn.addEventListener('click', onEndTurn);

  root.append(turn, gold, cities, armies, endTurnBtn);
  host.appendChild(root);

  const render = (s: HudSnapshot): void => {
    turn.textContent = `⚔ Turn ${s.turn}`;
    gold.textContent = `💰 ${s.gold}`;
    cities.textContent = `🏰 ${s.cities}`;
    armies.textContent = `⚔ ${s.armies}`;
  };

  subscribeHud(render);

  return { root, turn, gold, cities, armies, endTurnBtn };
}
