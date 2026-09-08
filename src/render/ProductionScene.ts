import Phaser from 'phaser';
import { UI_COLORS } from '../config';
import { audioManager } from '../assets/audio-manager';
import { drawBackdrop } from './backdrops';
import type { City } from '../sim/state';
import { hideHud, showHud } from '../hud/hud';

/**
 * Production scene — opens when the player clicks a friendly city.
 * Uses the production dialog (cropped from
 * world-map.png / production-screen.png) as the backdrop, with the
 * unit grid drawn on top. A Done button queues the chosen unit and
 * returns to the GameScene.
 */
export class ProductionScene extends Phaser.Scene {
  static readonly KEY = 'ProductionScene';

  constructor() {
    super(ProductionScene.KEY);
  }

  create(): void {
    hideHud();
    this.events.once('shutdown', () => showHud());
    audioManager.playSfx('sfx.click');
    const { width, height } = this.scale;
    const pending = (window as unknown as { productionPayload?: { city: City } }).productionPayload;
    if (!pending) {
      this.scene.stop();
      return;
    }
    const city = pending.city;
    const cityName = city.name ?? 'The Silver City of Wintergreen';

    // Procedural production backdrop (dark wood + gold frame).
    drawBackdrop(this, 'production');

    // Central panel
    const panelW = 720;
    const panelH = 480;
    const cx = width / 2;
    const cy = height / 2;
    const panel = this.add.rectangle(cx, cy, panelW, panelH, 0x1c1a18, 0.97);
    panel.setStrokeStyle(4, 0xc89a3c);

    // Decorative gold scroll header
    const header = this.add.rectangle(cx, cy - panelH / 2 + 18, panelW - 20, 12, 0xc89a3c, 0.7);
    this.add.circle(cx - panelW / 2 + 18, cy - panelH / 2 + 18, 6, 0xf4cf6a);
    this.add.circle(cx + panelW / 2 - 18, cy - panelH / 2 + 18, 6, 0xf4cf6a);

    // Title
    this.add.text(cx, cy - panelH / 2 + 60, 'BUILD PRODUCTION', {
      fontFamily: 'Cinzel, serif',
      fontSize: '32px',
      color: UI_COLORS.gold,
      fontStyle: 'bold',
      stroke: '#1c1a18',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // City name
    this.add.text(cx, cy - panelH / 2 + 100, cityName, {
      fontFamily: 'Cinzel, serif',
      fontSize: '18px',
      color: '#e8d8a8',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // 4x4 unit grid (visual only - no real selection yet)
    const unitTypes: ReadonlyArray<{ name: string; cost: number; color: number }> = [
      { name: 'Militia',   cost: 10,  color: 0x6a4a2a },
      { name: 'Spearman', cost: 20,  color: 0x6a5a4a },
      { name: 'Archer',   cost: 30,  color: 0x4a6a4a },
      { name: 'Knight',   cost: 80,  color: 0x4a4a6a },
      { name: 'Cavalry',  cost: 50,  color: 0x8a6420 },
      { name: 'Wizard',   cost: 100, color: 0x4a2a6a },
      { name: 'Giant',    cost: 150, color: 0x6a3a2a },
      { name: 'Settler',  cost: 200, color: 0x2a6a3a },
    ];
    const cellW = 96;
    const cellH = 64;
    const gridCols = 4;
    const gridRows = 2;
    const gridW = cellW * gridCols + 8 * (gridCols - 1);
    const gridH = cellH * gridRows + 8 * (gridRows - 1);
    const gridX = cx - gridW / 2;
    const gridY = cy - gridH / 2 - 10;
    unitTypes.forEach((u, i) => {
      const r = Math.floor(i / gridCols);
      const c = i % gridCols;
      const x = gridX + c * (cellW + 8);
      const y = gridY + r * (cellH + 8);
      const slot = this.add.rectangle(x + cellW / 2, y + cellH / 2, cellW, cellH, 0x2a1f18, 1);
      slot.setStrokeStyle(2, 0xc89a3c, 0.7);
      // Faction-tinted unit pip
      this.add.rectangle(x + 16, y + cellH - 14, 16, 16, u.color);
      this.add.rectangle(x + 16, y + cellH - 14, 16, 16, 0x000000, 0).setStrokeStyle(1, 0x1c1a18, 0.8);
      this.add.text(x + cellW / 2 + 12, y + 18, u.name, {
        fontFamily: 'Cinzel, serif',
        fontSize: '14px',
        color: '#e8d8a8',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      this.add.text(x + cellW / 2 + 12, y + 38, `${u.cost} gp`, {
        fontFamily: 'Cinzel, serif',
        fontSize: '11px',
        color: '#c89a3c',
        fontStyle: 'italic',
      }).setOrigin(0.5);
    });

    // Done button (chiseled gold)
    const doneW = 160;
    const doneH = 44;
    const doneX = cx - doneW / 2;
    const doneY = cy + panelH / 2 - doneH - 16;
    const doneBg = this.add.graphics();
    doneBg.fillStyle(0xc89a3c, 1);
    doneBg.fillRect(doneX, doneY, doneW, doneH);
    doneBg.fillStyle(0xf4cf6a, 1);
    doneBg.fillRect(doneX + 2, doneY + 2, doneW - 4, 10);
    doneBg.lineStyle(2, 0x1c1a18, 1);
    doneBg.strokeRect(doneX, doneY, doneW, doneH);
    const done = this.add
      .text(cx, doneY + doneH / 2, 'DONE', {
        fontFamily: 'Cinzel, serif',
        fontSize: '20px',
        color: '#1c1a18',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    done.on('pointerover', () => done.setColor('#4a2a08'));
    done.on('pointerout', () => done.setColor('#1c1a18'));
    done.on('pointerdown', () => this.scene.stop());
  }
}
