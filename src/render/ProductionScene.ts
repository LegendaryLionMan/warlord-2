import Phaser from 'phaser';
import { UI_COLORS } from '../config';
import { audioManager } from '../assets/audio-manager';
import type { City } from '../sim/state';
import { hideHud, showHud } from '../hud/hud';

/**
 * Production scene — opens when the player clicks a friendly city.
 * Uses the 1993 "Build Production" dialog (cropped from
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

    // 1993 production-screen backdrop — the original Build
    // Production dialog already has the unit grid baked in, so
    // we just dim it lightly and overlay a small recruitment-status
    // banner + a Done button in the same spot as the 1993 Done.
    const bg = this.add.image(width / 2, height / 2, 'original.production-screen');
    bg.setDisplaySize(width, height);
    bg.setDepth(-10);
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.15);

    // Banner across the top: the city we're recruiting in.
    this.add
      .text(width / 2, 24, `Build Production — ${city.name ?? 'The Silver City of Wintergreen'}`, {
        fontFamily: 'Press Start 2P, monospace',
        fontSize: '12px',
        color: UI_COLORS.gold,
        fontStyle: 'bold',
        backgroundColor: '#1c1a18',
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5);

    // Done button (in the same position as the 1993 Done).
    const done = this.add
      .text(width - 130, height - 60, 'Done', {
        fontFamily: 'Press Start 2P, monospace',
        fontSize: '14px',
        color: UI_COLORS.gold,
        fontStyle: 'bold',
        backgroundColor: '#1c1a18',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    done.on('pointerover', () => done.setColor('#ffffff'));
    done.on('pointerout', () => done.setColor(UI_COLORS.gold));
    done.on('pointerdown', () => this.scene.stop());
  }
}
