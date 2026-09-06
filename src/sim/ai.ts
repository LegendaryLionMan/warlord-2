/**
 * AI strategy. Each non-player faction gets one turn after the player.
 * Per SPEC: defend threatened cities, capture neutral cities, build
 * armies, attack weak enemy points. This implementation is a reasonable
 * baseline; Phase 6 will add faction-specific personalities.
 */

import { aStarPath } from './pathfinding';
import { addProductionOrder, processCityProduction } from './city';
import { resolveCombat } from './combat';
import { UNITS } from '../data/units';
import type { Army, City, GameState, OwnerId, UnitId } from './state';

function manhattan(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/** Pick a target for an AI army: nearest city, preferring neutral or enemy over own. */
export function pickTarget(
  state: GameState,
  army: Army,
): City | null {
  let best: City | null = null;
  let bestScore = Infinity;
  for (const city of state.cities) {
    if (city.owner === army.owner) continue;
    const dist = manhattan({ x: army.x, y: army.y }, { x: city.x, y: city.y });
    const bonus = city.owner === 'neutral' ? -10 : -5;
    const score = dist + bonus;
    if (score < bestScore) {
      bestScore = score;
      best = city;
    }
  }
  return best;
}

/** Recruit a unit at an AI city if it can afford one and the queue isn't full. */
function maybeRecruit(state: GameState, city: City, _faction: OwnerId): void {
  if (city.production.length >= city.size) return;
  const preferred: UnitId[] = state.gold >= 200 ? ['spearman', 'militia'] : ['militia'];
  for (const u of preferred) {
    if (UNITS[u].cost <= state.gold) {
      addProductionOrder(state, city, u);
      return;
    }
  }
}

/** Move an AI army one step toward `goal` using A*. Returns true if it moved. */
function aiStep(state: GameState, army: Army, goal: { x: number; y: number }): boolean {
  const path = aStarPath(state, { x: army.x, y: army.y }, goal);
  if (path.length < 2) return false;
  const next = path[1]!;
  army.x = next.x;
  army.y = next.y;
  return true;
}

/** One AI turn for a single faction. */
export function endAiTurn(state: GameState, faction: OwnerId): void {
  if (faction === state.playerFaction) return;
  // 1. Process production in faction's cities.
  for (const city of state.cities) {
    if (city.owner === faction) {
      processCityProduction(city, state);
    }
  }
  // 2. Each army picks a target, walks toward it, captures/fights if possible.
  const factionArmies = state.armies.filter((a) => a.owner === faction);
  for (const army of factionArmies) {
    if (army.units.length === 0) continue;
    // If adjacent to an enemy, fight.
    const adjacentEnemy = state.armies.find(
      (other) =>
        other !== army &&
        other.owner !== faction &&
        other.owner !== 'neutral' &&
        Math.abs(other.x - army.x) + Math.abs(other.y - army.y) === 1,
    );
    if (adjacentEnemy) {
      const terrain = state.map[adjacentEnemy.y]?.[adjacentEnemy.x]?.terrain ?? 'plains';
      const result = resolveCombat(army, adjacentEnemy, terrain);
      army.units = result.attackUnits.map((u) => ({ ...u, moves: 0 }));
      if (result.defendUnits.length === 0) {
        const idx = state.armies.indexOf(adjacentEnemy);
        if (idx > -1) state.armies.splice(idx, 1);
      } else {
        adjacentEnemy.units = result.defendUnits.map((u) => ({ ...u, moves: 0 }));
      }
      continue;
    }
    // Otherwise, walk toward the nearest non-own city.
    const target = pickTarget(state, army);
    if (target) aiStep(state, army, { x: target.x, y: target.y });
    // If we landed on the city, capture it.
    const cityHere = state.cities.find((c) => c.x === army.x && c.y === army.y);
    if (cityHere && cityHere.owner !== faction) {
      cityHere.owner = faction;
      cityHere.garrison = [];
    }
  }
  // 3. Recruit at faction cities.
  for (const city of state.cities) {
    if (city.owner === faction) maybeRecruit(state, city, faction);
  }
}

/** Run AI turns for all non-player factions. */
export function endAllAiTurns(state: GameState): OwnerId[] {
  const factions = new Set<OwnerId>();
  for (const a of state.armies) if (a.owner !== state.playerFaction) factions.add(a.owner);
  for (const c of state.cities) if (c.owner !== state.playerFaction) factions.add(c.owner);
  const order: OwnerId[] = [];
  for (const f of factions) {
    if (f === 'neutral') continue;
    order.push(f);
    endAiTurn(state, f);
  }
  return order;
}
