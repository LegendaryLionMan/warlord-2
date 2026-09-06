/**
 * Win / loss detection. Per SPEC § 11:
 *   - Capture 75% of all cities on the map, OR
 *   - Eliminate all enemy factions.
 *   - Lose if you have no units and no cities.
 */

import type { GameState } from './state';

export type GameOutcome = 'playing' | 'won' | 'lost';

const WIN_THRESHOLD = 0.75;

/** Check the current state and return the outcome. */
export function checkOutcome(state: GameState): GameOutcome {
  if (state.cities.length === 0) return 'playing';

  const totalCities = state.cities.length;
  const playerCities = state.cities.filter((c) => c.owner === state.playerFaction).length;
  if (playerCities / totalCities >= WIN_THRESHOLD) return 'won';

  const playerUnits = state.armies.some(
    (a) => a.owner === state.playerFaction && a.units.length > 0,
  );
  const playerHasCity = playerCities > 0;
  if (!playerUnits && !playerHasCity) return 'lost';

  return 'playing';
}
