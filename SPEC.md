# Warlords 2 Clone - Game Design Specification

## Overview
A turn-based strategy game inspired by Warlords 2, featuring four playable factions, stack-based tactical combat, hero units with progression, city capture mechanics, and AI opponents.

## Factions

| Faction | Bonus | Unique Units |
|---------|-------|--------------|
| **Humans** | +1 Defense all units | Balanced army composition |
| **Elves** | +1 Ranged attack bonus | Superior archers, forest mobility |
| **Orcs** | +1 Melee attack bonus | No ranged units, high damage |
| **Undead** | 20% unit return on victory | Resurrection, fear effect |

## Unit Types

| Unit | Cost | HP | ATK | DEF | Move | Range | Special |
|------|------|-----|-----|-----|------|-------|---------|
| Militia | 50 | 4 | 2 | 1 | 2 | 1 | Cheap starting unit |
| Spearman | 100 | 6 | 3 | 2 | 2 | 1 | +2 ATK vs Cavalry |
| Archer | 150 | 4 | 4 | 1 | 2 | 2 | Ranged attack |
| Knight | 250 | 10 | 5 | 4 | 3 | 1 | Mounted warrior |
| Cavalry | 300 | 8 | 6 | 3 | 4 | 1 | Fast movement |
| Wizard | 400 | 4 | 7 | 1 | 2 | 2 | Magic +3 vs Undead |
| Giant | 500 | 15 | 8 | 5 | 2 | 1 | Siege powerhouse |

## Combat System

### Stack-Based Combat
- Units are organized into armies (stacks) containing multiple unit types
- Combat is automatic once initiated
- Units fight in order: weakest to strongest (by HP)

### Combat Resolution Formula
```
Attack Roll = ATK + d6 (6-sided die)
Defense Roll = DEF + d4 (4-sided die) + terrain bonus
Damage = Attack Roll - Defense Roll (minimum 1)
```

### Terrain Modifiers
| Terrain | Defense Bonus |
|---------|---------------|
| Plains | +0 |
| Forest | +1 |
| Hills | +2 |
| Mountains | Impassable |
| Water | Impassable |
| City | +2 |

### Combat Resolution
1. Compare total attack vs total defense including dice
2. Higher roll wins
3. Winner deals damage equal to difference
4. Damage distributed among defender units

### Hero Stack Bonus
Heroes provide:
- +1 to all unit stats in their stack
- Special abilities (varies by hero type)
- Level-up experience gain

## Heroes

### Hero Progression
- Start at Level 1 (100 XP)
- Gain XP from combat victories (10 per enemy unit killed)
- Level up: +2 to all stats, unlock ability
- Max level: 10

### Hero Abilities
- **Leadership**: +1 ATK to all friendly units on map
- **Fortify**: +2 DEF to stack for one turn
- **Rally**: Restore 2 HP to all units in stack
- **Scout**: Reveal fog of war in 5-tile radius

## Map Elements

### Grid System
- 32x32 tile map
- Each tile is 32x32 pixels
- Camera pan and zoom supported

### Terrain Types
| Tile | Movement Cost | Defense | Passable |
|------|--------------|---------|----------|
| Plains | 1 | 0 | All |
| Forest | 2 | +1 | All |
| Hills | 2 | +2 | All |
| Mountains | - | - | No |
| Water | - | - | No |
| Road | 0.5 | 0 | All |

### Map Features
- **Cities**: Capture points, produce units, income generation
- **Mines**: +50 gold per turn when adjacent
- **Ruins**: Random reward (gold, units, or artifact)
- **Armories**: Reduce unit recruitment cost by 20%

## Cities

### City Mechanics
- Each city generates 100 gold per turn
- Cities can produce units (turns based on unit cost)
- Capture by moving army onto neutral/enemy city
- Defended cities have garrison units

### City Capture
- Move army onto city tile
- If city has no garrison, captured immediately
- If garrison exists, battle begins
- Captured cities produce income for new owner

## Economy

### Income Sources
- Cities: 100 gold per city per turn
- Mines: 50 gold per adjacent mine per turn
- Victory: Bonus gold for defeating enemies

### Unit Upkeep
- No upkeep cost (simplified)
- Units cost gold to recruit
- Heroes cost 200 gold

## AI Behavior

### AI Strategy
1. **Expansion**: Capture nearby neutral cities
2. **Army Building**: Balance unit composition
3. **Aggression**: Attack weak enemy positions
4. **Defense**: Protect key cities and heroes
5. **Resource Management**: Invest in growth

### AI Decision Making
- Priority 1: Defend threatened cities
- Priority 2: Capture neutral cities
- Priority 3: Build armies
- Priority 4: Attack enemy weak points
- Priority 5: Level up heroes

## Fog of War

### Visibility States
- **Visible**: Full detail, can interact
- **Remembered**: Last known position, no current info
- **Hidden**: Unknown, shows terrain only

### Vision Range
- Normal units: 3 tiles
- Heroes: 5 tiles
- Scouts: 7 tiles

## Win/Lose Conditions

### Victory Conditions
- Capture 75% of all cities on the map
- OR eliminate all enemy factions

### Defeat Conditions
- Lose all units and cities
- Hero dies (optional - can respawn)

## UI Layout

### Main Game Screen
```
+------------------------------------------+
|  [Gold] [Turn] [Phase]  [End Turn Button] |
+------------------------------------------+
|                    |                     |
|    Game Map        |    Minimap           |
|    (Canvas)        |    (Click to move)  |
|                    |                     |
+--------------------+---------------------+
|  Selected Army Panel  |  City/Unit Info    |
+--------------------+---------------------+
|              Action Bar                   |
|  [Move] [Attack] [Fortify] [Recruit]      |
+------------------------------------------+
```

### Minimap
- Fixed 200x200 pixel display
- Shows all terrain and unit positions
- Fog of war applied
- Click to pan main camera

## Controls

### Mouse
- Left-click: Select unit/city/army
- Right-click: Move to location / Attack target
- Middle-click drag: Pan camera
- Scroll wheel: Zoom in/out

### Keyboard
- Space: End turn
- Tab: Cycle through armies
- M: Toggle minimap
- F: Toggle fog of war
- Escape: Deselect / Cancel

## Technical Implementation

### Canvas Rendering
- 60 FPS target
- Layered rendering: terrain → units → effects → UI
- Sprite-based pixel art

### State Management
- Centralized game state object
- Event-driven updates
- Save/Load via JSON serialization

### Audio (Optional)
- Combat sounds
- UI feedback sounds
- Ambient music

## Color Palette

### Faction Colors
| Faction | Primary | Secondary |
|---------|---------|----------|
| Humans | #4169E1 | #1E3A8A |
| Elves | #228B22 | #14532D |
| Orcs | #DC143C | #7F1D1D |
| Undead | #8B008B | #581C87 |

### UI Colors
- Background: #1a1a2e
- Panel: #16213e
- Border: #0f3460
- Text: #e8e8e8
- Accent: #e94560
- Gold: #ffd700