/**
 * End-of-turn effects. Phase 4 only handles the player side; Phase 5
 * adds the AI side.
 */

import { refreshMovement } from './army';
import { cityIncome, processCityProduction } from './city';
import type { GameState } from './state';

/** Player's end-of-turn: collect income, process production, reset movement. */
export function endPlayerTurn(state: GameState): number {
  let totalIncome = 0;
  for (const city of state.cities) {
    if (city.owner === state.playerFaction) {
      totalIncome += cityIncome(city);
      processCityProduction(city, state);
    }
  }
  state.gold += totalIncome;
  state.turn += 1;
  for (const army of state.armies) {
    if (army.owner === state.playerFaction) refreshMovement(army);
  }
  return totalIncome;
}
