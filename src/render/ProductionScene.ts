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

    // Procedural production backdrop (dark wood + gold frame). The
    // The production dialog is a procedural panel with a baked-in
    // unit grid; the procedural backdrop is paired with a small
    // recruitment banner + a Done button.
    drawBackdrop(this, 'production');
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

    // Done button (bottom-right).
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
