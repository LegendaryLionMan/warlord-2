// Phase 13 — Map feature sprite definitions (mine, ruin, armory).
//
// Small 16×16 icons. Hand-authored to read as the original game's
// feature glyphs.

import { C } from '../palette';
import type { SpriteDef } from '../pixel-art';

const h = (n: number) => n.toString(16);

function mine(): SpriteDef {
  // 16×16 gold mine pit: dark stone square, brown center, gold ore.
  const rows: string[] = [];
  for (let y = 0; y < 16; y++) {
    let row = '';
    for (let x = 0; x < 16; x++) {
      // Outer stone border (1 px)
      const onBorder = x === 0 || y === 0 || x === 15 || y === 15;
      // Inner stone ring
      const onInner = x === 1 || y === 1 || x === 14 || y === 14;
      // Pit center (brown)
      const inPit = x >= 4 && x <= 11 && y >= 5 && y <= 10;
      // Gold ore (a few pixels in the pit)
      const isGold = (x === 6 && y === 6) || (x === 7 && y === 7) || (x === 9 && y === 8) || (x === 8 && y === 9);
      if (onBorder) row += h(C.UI_STONE_DARK);
      else if (onInner) row += h(C.UI_STONE_MID);
      else if (isGold) row += h(C.GOLD);
      else if (inPit) row += h(C.HILLS_SHADE);
      else row += h(0);
    }
    rows.push(row);
  }
  return { key: 'feature.mine', width: 16, height: 16, pixels: rows.join('\n'), notes: 'Stone-rimmed pit with brown interior and gold ore.' };
}

function ruin(): SpriteDef {
  // 16×16 broken stone ruin: two columns of dark stone with a gap,
  // a small pillar toppled diagonally.
  const rows: string[] = [];
  for (let y = 0; y < 16; y++) {
    let row = '';
    for (let x = 0; x < 16; x++) {
      // Left column (2 px wide, 3 px tall cap)
      const inLeft = x >= 3 && x <= 4 && y >= 5 && y <= 13;
      // Right column
      const inRight = x >= 11 && x <= 12 && y >= 4 && y <= 12;
      // Caps (slightly wider)
      const inLeftCap = x >= 2 && x <= 5 && y >= 4 && y <= 5;
      const inRightCap = x >= 10 && x <= 13 && y >= 3 && y <= 4;
      // Crumbled stones at base
      const inBase1 = x >= 6 && x <= 8 && y === 13;
      const inBase2 = x >= 9 && x <= 10 && y === 13;
      if (inLeftCap || inRightCap) row += h(C.MOUNTAIN_LIGHT);
      else if (inLeft || inRight) row += h(C.UI_STONE_MID);
      else if (inBase1 || inBase2) row += h(C.UI_STONE_DARK);
      else row += h(0);
    }
    rows.push(row);
  }
  return { key: 'feature.ruin', width: 16, height: 16, pixels: rows.join('\n'), notes: 'Two broken stone columns with caps and rubble at base.' };
}

function armory(): SpriteDef {
  // 16×16 armory: a sword + shield crossed behind a banner.
  // Sword vertical: x=4, y=3..12; hilt x=3,4 y=12..13.
  // Shield round: x=9..13, y=4..12; banner below.
  const rows: string[] = [];
  for (let y = 0; y < 16; y++) {
    let row = '';
    for (let x = 0; x < 16; x++) {
      // sword blade
      const inBlade = x === 4 && y >= 3 && y <= 11;
      const inTip = x === 5 && y === 3;
      const inHilt = (x === 3 || x === 5) && y === 12;
      // shield
      const dx = x - 11, dy = y - 8;
      const inShield = dx * dx + dy * dy <= 16 && dx * dx + dy * dy >= 9;
      // banner
      const inBanner = y === 14 && x >= 3 && x <= 12;
      if (inBlade || inTip) row += h(C.MOUNTAIN_LIGHT);
      else if (inHilt) row += h(C.UI_STONE_DARK);
      else if (inShield) row += h(C.UI_STONE_MID);
      else if (inBanner) row += h(C.GOLD);
      else row += h(0);
    }
    rows.push(row);
  }
  return { key: 'feature.armory', width: 16, height: 16, pixels: rows.join('\n'), notes: 'Vertical sword with round shield behind, gold banner below.' };
}

export const FEATURE_DEFS: readonly SpriteDef[] = [mine(), ruin(), armory()];
