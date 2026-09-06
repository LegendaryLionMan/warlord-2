import Phaser from 'phaser';
import { UI_COLORS, UI_COLORS_NUM } from '../config';
import { listSlots, loadSlot } from '../save/storage';
import { audioManager } from '../assets/audio-manager';

/**
 * Main menu scene. Shows the title, a "New Game" button, and a
 * "Continue" button if a saved game exists.
 */
export class MenuScene extends Phaser.Scene {
  static readonly KEY = 'MenuScene';

  constructor() {
    super(MenuScene.KEY);
  }

  create(): void {
    audioManager.playMusic('music.menu');
    this.events.once('shutdown', () => audioManager.stopMusic(400));
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, UI_COLORS_NUM.background);

    this.add
      .text(width / 2, height * 0.28, 'WARLORDS II', {
        fontFamily: 'Cinzel, serif',
        fontSize: '72px',
        color: UI_COLORS.gold,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setShadow(0, 4, '#5a4510', 0, true, true);

    this.add
      .text(width / 2, height * 0.42, 'Conquer the Kingdom of Illuria', {
        fontFamily: 'Cinzel, serif',
        fontSize: '18px',
        color: UI_COLORS.textDim,
      })
      .setOrigin(0.5);

    // "New Game" button
    const newGameBtn = this.add
      .text(width / 2, height * 0.56, '[ NEW GAME ]', {
        fontFamily: 'Cinzel, serif',
        fontSize: '28px',
        color: UI_COLORS.text,
        backgroundColor: '#2a2319',
        padding: { left: 40, right: 40, top: 14, bottom: 14 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    newGameBtn.on('pointerover', () => newGameBtn.setColor(UI_COLORS.gold));
    newGameBtn.on('pointerout', () => newGameBtn.setColor(UI_COLORS.text));
    newGameBtn.on('pointerdown', () => this.scene.start('FactionScene'));

    // "Continue" button if a save exists
    const slots = listSlots();
    if (slots.length > 0) {
      const slotName = slots[0]!;
      const cont = this.add
        .text(width / 2, height * 0.66, `[ CONTINUE — ${slotName} ]`, {
          fontFamily: 'Cinzel, serif',
          fontSize: '22px',
          color: UI_COLORS.gold,
          backgroundColor: '#1a1a2a',
          padding: { left: 30, right: 30, top: 10, bottom: 10 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      cont.on('pointerover', () => cont.setColor('#ffffff'));
      cont.on('pointerout', () => cont.setColor(UI_COLORS.gold));
      cont.on('pointerdown', () => {
        const state = loadSlot(slotName);
        if (state) {
          (window as unknown as { loadedState: unknown }).loadedState = state;
          this.scene.start('GameScene', { faction: state.playerFaction, loaded: true });
        }
      });
    }

    this.add
      .text(width / 2, height * 0.84, 'Phase 8 — Save/Load', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: UI_COLORS.textDim,
      })
      .setOrigin(0.5);
  }
}
