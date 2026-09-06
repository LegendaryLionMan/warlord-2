import Phaser from 'phaser';
import { UI_COLORS, UI_COLORS_NUM } from '../config';
import { initHud } from '../hud/hud';

/**
 * Main menu scene. Shows the title and a single "New Game" button.
 * In Phase 0 clicking New Game jumps to the faction select.
 */
export class MenuScene extends Phaser.Scene {
  static readonly KEY = 'MenuScene';

  constructor() {
    super(MenuScene.KEY);
  }

  create(): void {
    const { width, height } = this.scale;

    // Dark backdrop with subtle gradient
    this.add.rectangle(width / 2, height / 2, width, height, UI_COLORS_NUM.background);

    // Title
    this.add
      .text(width / 2, height * 0.32, 'WARLORDS II', {
        fontFamily: 'Cinzel, serif',
        fontSize: '72px',
        color: UI_COLORS.gold,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setShadow(0, 4, '#5a4510', 0, true, true);

    this.add
      .text(width / 2, height * 0.46, 'Conquer the Kingdom of Illuria', {
        fontFamily: 'Cinzel, serif',
        fontSize: '18px',
        color: UI_COLORS.textDim,
      })
      .setOrigin(0.5);

    // "New Game" button
    const button = this.add
      .text(width / 2, height * 0.62, '[ NEW GAME ]', {
        fontFamily: 'Cinzel, serif',
        fontSize: '28px',
        color: UI_COLORS.text,
        backgroundColor: '#2a2319',
        padding: { left: 40, right: 40, top: 14, bottom: 14 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on('pointerover', () => button.setColor(UI_COLORS.gold));
    button.on('pointerout', () => button.setColor(UI_COLORS.text));
    button.on('pointerdown', () => this.scene.start('FactionScene'));

    // Phase 0 disclaimer
    this.add
      .text(width / 2, height * 0.82, 'Phase 0 — Foundation build', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: UI_COLORS.textDim,
      })
      .setOrigin(0.5);

    // Initialize the HUD once the first scene mounts
    initHud();
  }
}
