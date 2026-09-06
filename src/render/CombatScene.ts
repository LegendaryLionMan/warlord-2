import Phaser from 'phaser';
import { UI_COLORS, UI_COLORS_NUM } from '../config';

/**
 * Combat overlay scene. Modal: pauses the underlying GameScene and
 * presents the attacker / defender summary, then a "Continue" button.
 *
 * Phase 0: placeholder. Phase 3 implements the real combat resolution
 * driven by sim/combat.ts and reads attacker / defender from the GameState.
 */
export class CombatScene extends Phaser.Scene {
  static readonly KEY = 'CombatScene';

  constructor() {
    super(CombatScene.KEY);
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);

    const panel = this.add.rectangle(width / 2, height / 2, 600, 400, 0x1a1a2a, 0.95);
    panel.setStrokeStyle(3, UI_COLORS_NUM.accent);

    this.add
      .text(width / 2, height * 0.32, '⚔ BATTLE ⚔', {
        fontFamily: 'Cinzel, serif',
        fontSize: '42px',
        color: UI_COLORS.gold,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.5, 'Combat overlay — coming in Phase 3', {
        fontFamily: 'Cinzel, serif',
        fontSize: '18px',
        color: UI_COLORS.textDim,
      })
      .setOrigin(0.5);

    const cont = this.add
      .text(width / 2, height * 0.65, '[ Continue ]', {
        fontFamily: 'Cinzel, serif',
        fontSize: '22px',
        color: UI_COLORS.text,
        backgroundColor: '#2a2319',
        padding: { left: 30, right: 30, top: 10, bottom: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    cont.on('pointerover', () => cont.setColor(UI_COLORS.gold));
    cont.on('pointerout', () => cont.setColor(UI_COLORS.text));
    cont.on('pointerdown', () => this.scene.stop());
  }
}
