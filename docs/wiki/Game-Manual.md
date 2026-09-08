# Game manual

A condensed version of the in-game rules. Warlord 2 is an
original 4X wargame inspired by the 1990s tradition, so the
core loop (BFS movement, stack combat, city capture, hero
abilities, AI turns) follows the genre conventions. The
implementation is original; the rules below describe what
Warlord 2 actually does, not any specific historical game.

## The goal

You win by either:

- **Capturing 75 %** of the cities on the map, **or**
- **Eliminating all enemy factions** (last faction standing).

You lose if your last army is destroyed or your last city is
captured. (There is no "lose by turn count" condition in this
clone.)

## Factions

All 8 factions from the 1993 game are playable. Each faction has
a distinct stat modifier and a unique hero.

| Faction | Bonus | Hero |
|---|---|---|
| **Humans** | +1 defense (all units) | Sir Marhaus |
| **Elves** | +1 ranged attack | Lady Lorien |
| **Orcs** | +1 melee attack | Orc Warlord |
| **Undead** | 20% resurrect on victory | Necromancer |
| **Siroms** | +2 melee attack, +1 defense | Thane Korr |
| **Night Elves** | +1 ranged attack, +1 defense | Malys Shadowveil |
| **Fey** | 10% resurrect | Queen Titania |
| **Syrnyn** | +2 defense, +1 melee attack | King Dwalin |

Faction colors, banners, and per-faction city fortresses are
in-game; some of the new factions' 1993 hero portraits and city
fortresses are still placeholders (see "Limitations" below).

## Units

12 unit types plus the Settler. Each unit has:

- **HP** — hit points; the unit dies when HP reaches 0.
- **ATK** — base attack roll modifier.
- **DEF** — base defense roll modifier.
- **Moves** — how many tiles the unit can move per turn.
- **Cost** — gold cost to recruit at a city.

| Unit | HP | ATK | DEF | Moves | Cost | Notes |
|---|---|---|---|---|---|---|
| Militia | 1 | 1 | 1 | 1 | 10 | Cheapest fodder. |
| Spearman | 2 | 2 | 2 | 2 | 20 | The bread-and-butter unit. |
| Archer | 1 | 3 | 1 | 2 | 30 | Ranged attacks (1 tile). |
| Cavalry | 3 | 3 | 1 | 4 | 50 | Fast hitters. |
| Knight | 6 | 5 | 4 | 3 | 80 | Heavy hitters. |
| Wizard | 4 | 5 | 2 | 2 | 100 | Magical attacks. |
| Giant | 12 | 8 | 4 | 2 | 150 | Slow but devastating. |
| … (6 more) | … | … | … | … | … | See [`SPEC.md`](https://github.com/LegendaryLionMan/warlords2-clone/blob/main/SPEC.md) for the full table. |
| **Settler** | 3 | 0 | 0 | 2 | 200 | Cannot fight; future phase will let it found cities. |

## Heroes

Every faction's starting army has a hero. Heroes give stat
bonuses to every unit in their stack and can use 4 abilities
(once per hero per game unless noted):

- **Leadership** — +1 ATK to all player units on the map for the
  rest of the turn.
- **Fortify** — +2 DEF to the hero's stack for one turn.
- **Rally** — restore 2 HP to every unit in the hero's stack.
- **Scout** — reveal fog in a 5-tile radius around the hero.

## Combat

When an army moves onto a tile occupied by an enemy, stack
combat resolves:

- Both sides roll: `ATK + d6` for attack, `DEF + d4 + terrain_bonus`
  for defense.
- Higher roll wins. Damage is `max(1, attack - defense)`.
- Units die in order: lowest HP first, alternating between sides
  until one stack is empty.
- Heroes contribute their `attackBonus` / `defenseBonus` to
  every unit in the stack.
- Undead: 20% of attacker losses return on victory (rounded up).
- Fey: 10% of attacker losses return on victory (rounded up).

## Movement

Each unit has a per-turn move budget. Reachable tiles are
highlighted in gold when you click your army. Terrain costs:

| Terrain | Move cost |
|---|---|
| Plains | 1 |
| Forest | 2 |
| Hills | 2 |
| Mountains | ∞ (impassable) |
| Water | ∞ (impassable; no naval units in this clone) |

## Cities

- **Capture** — walk an army onto a neutral or enemy city. The
  city flips to your faction; the garrison (if any) is destroyed.
- **Income** — `size × 3 + 2` gold per turn, paid at the start of
  your turn.
- **Production** — queue a unit at a city. Costs the unit's gold
  price upfront; the unit is delivered after `size` turns.
- **Garrison** — the city holds a defensive stack while
  uncontested. Larger cities have larger garrisons.

## Map features

- **Gold mine** — adjacent cities get +1 gold per turn per mine.
- **Ruin** — capture for a one-time gold bonus and a chance to
  recruit a hero.
- **Armory** — adjacent cities get a 20% recruitment discount.

## Turn order

1. Player turn: move armies, attack, recruit, end turn.
2. AI turns in faction order, each taking one action per army.
3. Combat resolves immediately when a stack move targets an
   enemy-occupied tile.
4. After all AI turns, the round counter increments and
   income is paid.

## Win conditions reminder

- 75 % city capture → **VICTORY** (gold marble-and-gold panel).
- Last faction standing → **VICTORY**.
- Your last city captured or last army destroyed →
  **DEFEAT** (red marble-and-gold panel).

Both panels credit Pope (the 1993 box artist) and offer a
**Return to Main Menu** button.

## Limitations (vs. the 1993 game)

- **No naval units.** No ships, no water movement.
- **No roads.** The 1993 game had a road network that reduced
  move cost. This clone has flat terrain cost.
- **No diplomacy.** No alliances, no tribute.
- **No ranged archer at distance 2.** Archers attack adjacent
  tiles only.
- **No multi-stack battles.** Only 1v1 combat resolves.
- **No random events other than quests.** No plagues, no
  earthquakes.
- **Settler "found city"** — the Settler is in the roster but
  the click-to-found-city handler is not yet wired. Tracked for
  a future phase.
- **Per-faction hero portraits and city fortresses** are
  placeholders; the 1993 originals are in the floppy's
  `DATA/*.DAT` and `PICS/*.PCK` and will be extracted in a future
  phase.

For the authoritative 1993 rules, see the 1993 manual PDF
(Internet Archive mirror, `msdos_Warlords_II_1993`).
