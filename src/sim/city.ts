/**
 * Cities. Pure data + rules. Phase 4 lands the city layer:
 * placement, capture, income, production queue.
 *
 * Per SPEC: each city has a name, owner, size (1–3), gold-per-turn,
 * garrison (defending units), and a production queue.
 */

import { createUnit } from './army';
import { UNITS, type UnitTemplate } from '../data/units';
import { mulberry32 } from './map';
import type { City, GameState, OwnerId, Unit, UnitId } from './state';

const CITY_NAME_PREFIXES = [
  'Storm', 'Iron', 'Shadow', 'Golden', 'Crystal', 'Thunder', 'Silver', 'Dark',
  'Bright', 'Ancient', 'Crimson', 'Emerald', 'Azure', 'Mystic', 'Sable',
];
const CITY_NAME_SUFFIXES = [
  'haven', 'forge', 'keep', 'tower', 'vale', 'fall', 'rest', 'watch',
  'peak', 'hold', 'ridge', 'glen', 'march', 'reach', 'wood',
];

let nextCityId = 1;

function makeCityId(): string {
  return `city_${nextCityId++}`;
}

/** Returns the next city name from the prefix/suffix pools. */
export function makeCityName(index: number): string {
  const p = CITY_NAME_PREFIXES[index % CITY_NAME_PREFIXES.length] ?? 'Storm';
  const s = CITY_NAME_SUFFIXES[index % CITY_NAME_SUFFIXES.length] ?? 'haven';
  return `${p} ${s}`;
}

/** Compute per-turn income for a city. SPEC: size * 3 + 2. */
export function cityIncome(city: { size: 1 | 2 | 3 }): number {
  return city.size * 3 + 2;
}

/** Create a City record. Internal — used by generateCities and tests. */
export function createCity(
  state: GameState,
  x: number,
  y: number,
  size: 1 | 2 | 3,
  owner: OwnerId,
  index: number,
): City {
  const city: City = {
    id: makeCityId(),
    x,
    y,
    name: makeCityName(index),
    owner,
    size,
    goldPerTurn: cityIncome({ size }),
    garrison: [],
    production: [],
  };
  state.cities.push(city);
  return city;
}

/** Procedurally place cities on the map with min-distance spacing. */
export function generateCities(state: GameState, seed = Date.now()): void {
  const rand = mulberry32(seed);
  const minDist = 10;
  const target = 10 + state.factionCount * 2;
  let index = 0;
  for (let i = 0; i < target; i++) {
    let placed = false;
    for (let attempt = 0; attempt < 150 && !placed; attempt++) {
      const x = Math.floor(rand() * (state.mapWidth - 4)) + 2;
      const y = Math.floor(rand() * (state.mapHeight - 4)) + 2;
      const terrain = state.map[y]?.[x]?.terrain;
      if (terrain !== 'plains' && terrain !== 'forest' && terrain !== 'hills') continue;
      let tooClose = false;
      for (const c of state.cities) {
        const d = Math.hypot(c.x - x, c.y - y);
        if (d < minDist) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;
      const size = (1 + Math.floor(rand() * 3)) as 1 | 2 | 3;
      const owner: OwnerId = i < state.factionCount ? `enemy${i + 1}` as OwnerId : 'neutral';
      const city = createCity(state, x, y, size, owner, index);
      // Garrison with a few militia for non-neutral cities.
      if (owner !== 'neutral') {
        for (let g = 0; g < size + 1; g++) city.garrison.push(createUnit('militia', owner));
      }
      placed = true;
      index++;
    }
  }
}

/** Capture a city: flip ownership, set the surviving garrison. */
export function captureCity(captor: OwnerId, city: City, survivingGarrison: Unit[] = []): void {
  city.owner = captor;
  city.garrison = survivingGarrison;
}

/** Add a unit to the city's production queue. Deducts gold, respects queue size. */
export function addProductionOrder(state: GameState, city: City, unitId: UnitId): boolean {
  if (city.production.length >= city.size) return false;
  const template: UnitTemplate | undefined = UNITS[unitId];
  if (!template) return false;
  if (state.gold < template.cost) return false;
  state.gold -= template.cost;
  city.production.push({ unitId, turnsRemaining: template.buildTime });
  return true;
}

/** Decrement production timers; spawn units into the city's garrison when done. */
export function processCityProduction(city: City, gameState: GameState): void {
  for (let i = city.production.length - 1; i >= 0; i--) {
    const order = city.production[i];
    if (!order) continue;
    order.turnsRemaining -= 1;
    if (order.turnsRemaining <= 0) {
      const spawned = createUnit(order.unitId, city.owner);
      city.garrison.push(spawned);
      gameState.armies.push({
        id: `garrison_${city.id}_${gameState.armies.length}`,
        x: city.x,
        y: city.y,
        owner: city.owner,
        units: [spawned],
        hero: null,
        moves: [],
        hasMoved: false,
        fortifyBonus: 0,
      });
      city.production.splice(i, 1);
    }
  }
}
