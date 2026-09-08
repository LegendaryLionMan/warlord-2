import Phaser from 'phaser';
import { UI_COLORS } from '../config';
import { listSlots, loadSlot } from '../save/storage';
import { audioManager } from '../assets/audio-manager';
import { hideHud, showHud } from '../hud/hud';

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
    // Phase 14 — hide the HUD so the 1993 title screen is unobscured.
    hideHud();
    this.events.once('shutdown', () => showHud());
    audioManager.playMusic('music.menu');
    this.events.once('shutdown', () => audioManager.stopMusic(400));
    const { width, height } = this.scale;

    // Phase 14 — render the original 1993 Warlords II title screen
    // (screenshot_00.jpg from Internet Archive) as the menu backdrop.
    // This is the actual 1993 SSG/Steve Fawkner title artwork.
    const titleImg = this.add.image(width / 2, height / 2, 'original.title-screen');
    titleImg.setDisplaySize(width, height);
    titleImg.setDepth(-10);

    // "Begin" button — positioned over the original's "Begin" button
    // (lower-left of the title screen, ~x=160, y=320 of 640x480).
    const beginBtn = this.add
      .text(width * 0.18, height * 0.69, 'BEGIN', {
        fontFamily: 'Press Start 2P, monospace',
        fontSize: '14px',
        color: UI_COLORS.gold,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    beginBtn.on('pointerover', () => beginBtn.setColor('#ffffff'));
    beginBtn.on('pointerout', () => beginBtn.setColor(UI_COLORS.gold));
    beginBtn.on('pointerdown', () => this.scene.start('FactionScene'));

    // "Continue" button if a save exists
    const slots = listSlots();
    if (slots.length > 0) {
      const slotName = slots[0]!;
      const cont = this.add
        .text(width * 0.18, height * 0.78, `[ CONTINUE — ${slotName} ]`, {
          fontFamily: 'Press Start 2P, monospace',
          fontSize: '11px',
          color: UI_COLORS.gold,
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

    // Subtle credit at the bottom — the original was made by
    // Strategic Studies Group (SSG), Steve Fawkner et al.
    this.add
      .text(width / 2, height * 0.96, 'Fan clone · Art © 1993 SSG/Steve Fawkner · Built 2026', {
        fontFamily: 'Press Start 2P, monospace',
        fontSize: '8px',
        color: UI_COLORS.textDim,
      })
      .setOrigin(0.5);
  }
}
