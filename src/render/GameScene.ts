import Phaser from 'phaser';
import { UI_COLORS, UI_COLORS_NUM, TILE_SIZE } from '../config';
import { updateHud } from '../hud/hud';
import type { FactionId } from '../sim/state';
import { PerfOverlay } from '../debug/perf';

/**
 * Game scene. Phase 0 placeholder: shows a dark playfield, a "Coming in
 * Phase 1" notice, and the HUD scaffold. Phase 1 replaces this with the
 * real procedural map and tile rendering.
 */
export class GameScene extends Phaser.Scene {
  static readonly KEY = 'GameScene';

  private perf!: PerfOverlay;
  private faction: FactionId = 'humans';

  constructor() {
    super(GameScene.KEY);
  }

  init(data: { faction?: FactionId }): void {
    this.faction = data.faction ?? 'humans';
  }

  create(): void {
    const { width, height } = this.scale;

    // Dark playfield
    this.add.rectangle(width / 2, height / 2, width, height, UI_COLORS_NUM.background);

    // Subtle grid hint
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1a1a2a, 0.5);
    for (let x = 0; x < width; x += TILE_SIZE) {
      grid.moveTo(x, 0);
      grid.lineTo(x, height);
    }
    for (let y = 0; y < height; y += TILE_SIZE) {
      grid.moveTo(0, y);
      grid.lineTo(width, y);
    }

    // Notice
    this.add
      .text(width / 2, height * 0.4, 'Game scene — coming in Phase 1', {
        fontFamily: 'Cinzel, serif',
        fontSize: '32px',
        color: UI_COLORS.gold,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.48, 'Procedural map, terrain rendering, camera pan/zoom will arrive next.', {
        fontFamily: 'Cinzel, serif',
        fontSize: '14px',
        color: UI_COLORS.textDim,
        wordWrap: { width: 600 },
        align: 'center',
      })
      .setOrigin(0.5);

    // Faction echo
    this.add
      .text(width / 2, height * 0.58, `Selected faction: ${this.faction}`, {
        fontFamily: 'Cinzel, serif',
        fontSize: '16px',
        color: UI_COLORS.text,
      })
      .setOrigin(0.5);

    // Performance overlay
    this.perf = new PerfOverlay(this);

    // Initial HUD push
    updateHud({ turn: 1, gold: 500, cities: 0, armies: 0 });
  }

  update(_time: number, _delta: number): void {
    const simStart = performance.now();
    // Sim runs here in later phases.
    const simMs = performance.now() - simStart;
    this.perf.tick(simMs);
  }
}
