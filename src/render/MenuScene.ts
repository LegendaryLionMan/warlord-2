import Phaser from 'phaser';
import { UI_COLORS } from '../config';
import { listSlots, loadSlot } from '../save/storage';
import { audioManager } from '../assets/audio-manager';
import { hideHud, showHud } from '../hud/hud';
import { drawBackdrop } from './backdrops';

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
    // Phase 14 — hide the HUD so the title screen is unobscured.
    hideHud();
    this.events.once('shutdown', () => showHud());
    audioManager.playMusic('music.menu');
    this.events.once('shutdown', () => audioManager.stopMusic(400));
    const { width, height } = this.scale;

    // Procedural marble + gold menu backdrop. No image references.
    drawBackdrop(this, 'menu');

    // Big "WARLORD 2" title.
    this.add
      .text(width / 2, height * 0.28, 'WARLORD 2', {
        fontFamily: 'Cinzel, serif',
        fontSize: '72px',
        color: UI_COLORS.gold,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Subtitle.
    this.add
      .text(width / 2, height * 0.40, 'a turn-based strategy of eight kingdoms', {
        fontFamily: 'Cinzel, serif',
        fontSize: '18px',
        color: '#c8b890',
        fontStyle: 'italic',
      })
      .setOrigin(0.5);

    // "Begin" button.
    const beginBtn = this.add
      .text(width / 2, height * 0.62, 'BEGIN', {
        fontFamily: 'Press Start 2P, monospace',
        fontSize: '18px',
        color: UI_COLORS.gold,
        fontStyle: 'bold',
        backgroundColor: '#1c1a18',
        padding: { left: 30, right: 30, top: 12, bottom: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    beginBtn.on('pointerover', () => beginBtn.setColor('#ffffff'));
    beginBtn.on('pointerout', () => beginBtn.setColor(UI_COLORS.gold));
    beginBtn.on('pointerdown', () => this.scene.start('FactionScene'));

    // "Continue" button if a save exists.
    const slots = listSlots();
    if (slots.length > 0) {
      const slotName = slots[0]!;
      const cont = this.add
        .text(width / 2, height * 0.72, `[ CONTINUE — ${slotName} ]`, {
          fontFamily: 'Press Start 2P, monospace',
          fontSize: '13px',
          color: UI_COLORS.gold,
          backgroundColor: '#1c1a18',
          padding: { left: 20, right: 20, top: 8, bottom: 8 },
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

    // Footer credit (not affiliated with SSG / Ubisoft).
    this.add
      .text(width / 2, height * 0.95, 'Inspired by 1990s turn-based strategy.  Not affiliated with SSG or Ubisoft.', {
        fontFamily: 'Press Start 2P, monospace',
        fontSize: '8px',
        color: UI_COLORS.textDim,
      })
      .setOrigin(0.5);
  }
}
