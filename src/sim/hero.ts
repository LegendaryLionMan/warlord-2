/**
 * Hero model. Phase 6 lands the four SPEC abilities:
 * Leadership, Fortify, Rally, Scout.
 *
 * Heroes lead armies; they don't sit in cities. They give stat bonuses to
 * the units in their stack and have a list of unlocked abilities.
 */

import { HERO_ABILITIES, pickRandomHeroName } from '../data/heroes';
import type { Army, GameState, Hero, HeroAbilityId, OwnerId } from './state';

let nextHeroId = 1;

function makeHeroId(): string {
  return `hero_${nextHeroId++}`;
}

/** Create a level-1 hero for the given owner. */
export function createHero(owner: OwnerId, name?: string): Hero {
  const level = 1;
  return {
    id: makeHeroId(),
    name: name ?? pickRandomHeroName(Math.random()),
    level,
    exp: 0,
    owner,
    attackBonus: level,
    defenseBonus: Math.floor(level / 2),
    abilities: ['leadership', 'fortify'],
  };
}

/** All ability ids. */
export const ALL_ABILITY_IDS = Object.keys(HERO_ABILITIES) as HeroAbilityId[];

/** Unlock the next ability for a hero. Returns the new ability id, or null. */
export function unlockNextAbility(hero: Hero): HeroAbilityId | null {
  for (const id of ALL_ABILITY_IDS) {
    if (!hero.abilities.includes(id)) {
      hero.abilities.push(id);
      return id;
    }
  }
  return null;
}

/** Add XP and possibly level up. */
export function addHeroExperience(hero: Hero, xp: number): boolean {
  hero.exp += xp;
  while (hero.exp >= hero.level * 50) {
    hero.exp -= hero.level * 50;
    hero.level += 1;
    hero.attackBonus += 1;
    if (hero.level % 2 === 0) hero.defenseBonus += 1;
    unlockNextAbility(hero);
  }
  return true;
}

/** Apply Leadership: +1 attack to all player units on the map. */
export function applyLeadership(state: GameState, hero: Hero): number {
  if (!hero.abilities.includes('leadership')) return 0;
  let buffed = 0;
  for (const army of state.armies) {
    if (army.owner === state.playerFaction) {
      for (const u of army.units) {
        u.attack += 1;
        buffed++;
      }
    }
  }
  return buffed;
}

/** Apply Fortify: +2 defense to the hero's stack for one turn. */
export function applyFortify(army: Army, hero: Hero): boolean {
  if (!hero.abilities.includes('fortify')) return false;
  for (const u of army.units) {
    u.defense += 2;
  }
  army.fortifyBonus = 2;
  return true;
}

/** Apply Rally: restore 2 HP to each unit in the stack. */
export function applyRally(army: Army, hero: Hero): number {
  if (!hero.abilities.includes('rally')) return 0;
  let restored = 0;
  for (const u of army.units) {
    if (u.hp < u.maxHp) {
      u.hp = Math.min(u.maxHp, u.hp + 2);
      restored++;
    }
  }
  return restored;
}

/** Apply Scout: reveal fog of war in a 5-tile radius around the hero. */
export function applyScout(state: GameState, army: Army, hero: Hero): number {
  if (!hero.abilities.includes('scout')) return 0;
  const r = 5;
  let revealed = 0;
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const x = army.x + dx;
      const y = army.y + dy;
      if (x < 0 || x >= state.mapWidth || y < 0 || y >= state.mapHeight) continue;
      if (Math.hypot(dx, dy) > r) continue;
      if (!state.explored[y]) state.explored[y] = [];
      state.explored[y][x] = true;
      revealed++;
    }
  }
  return revealed;
}
