# Gameplay Fidelity

> Last updated: Phase 1 (Map).

The final shipped game must match or exceed the 1993 Warlords II in
playability. This document maps each rebuild feature to the original
game's behavior, so we don't drift during development.

## Map & Terrain (Phase 1)

The 1993 Warlords II uses a 60×40 hex grid. The rebuild uses a 32×32
square grid (per the existing prototype and SPEC). Square is more
accessible, A* is simpler on it, and the user has been working with
it. Topology is the only deviation; everything below is preserved.

| Feature | Original (1993) | Rebuild |
| --- | --- | --- |
| Grid | 60×40 hex | 32×32 square |
| Terrain types | Plains, forest, hills, mountains, water, road | Plains, forest, hills, mountains, water (road in Phase 2) |
| Plains | 1 move, +0 def | 1 move, +0 def |
| Forest | 2 move, +1 def, vision -1 | 2 move, +1 def, vision -1 |
| Hills | 2 move, +2 def, vision +1 | 2 move, +2 def, vision +1 |
| Mountains | Impassable to most units, vision +2 | Impassable, vision +2 |
| Water | Impassable to most units, vision 0 | Impassable, vision 0 |
| Map generation | Procedural with hand-tuned seeds | Procedural via `sim/map.ts`, seeded with mulberry32 |
| Tile art | Detailed pixel-art tilesets | Procedural colored rectangles in Phase 1; sprite art in Phase 9 |
| Camera | Pan + zoom | Pan (middle-drag) + zoom (scroll wheel), 0.5×–2× |
| Tile selection | Left-click to inspect | Left-click, HUD side panel shows terrain + coords |
| Minimap | Bottom-right | Bottom-right, 160×120, gold border |

## What still needs to land

* **Roads** — original game has them; not yet in our terrain table.
* **Mine, ruin, armory** — original game has all three; come in Phase 4 + 6.
* **Click-to-move / move budget** — Phase 2.
* **Hero movement** — Phase 2+.

See [SPEC.md § 3 Map Elements](../SPEC.md) for the design source.
