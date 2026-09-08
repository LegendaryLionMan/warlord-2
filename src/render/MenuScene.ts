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

    // Decorative gold scroll banner under the title.
    const banner = this.add.graphics();
    banner.fillStyle(0xc89a3c, 0.85);
    banner.fillRect(width / 2 - 320, height * 0.22 - 4, 640, 2);
    banner.fillRect(width / 2 - 320, height * 0.34 - 4, 640, 2);
    banner.fillStyle(0x6a4a18, 1);
    banner.fillRect(width / 2 - 322, height * 0.22 - 2, 644, 1);
    banner.fillRect(width / 2 - 322, height * 0.34 - 2, 644, 1);
    // Gold corner studs
    banner.fillStyle(0xf4cf6a, 1);
    banner.fillCircle(width / 2 - 320, height * 0.22 - 3, 4);
    banner.fillCircle(width / 2 + 320, height * 0.22 - 3, 4);
    banner.fillCircle(width / 2 - 320, height * 0.34 - 3, 4);
    banner.fillCircle(width / 2 + 320, height * 0.34 - 3, 4);

    // Big "WARLORD 2" title with a darker drop-shadow for depth.
    this.add
      .text(width / 2 + 3, height * 0.28 + 3, 'WARLORD 2', {
        fontFamily: 'Cinzel, serif',
        fontSize: '84px',
        color: '#1a0e08',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height * 0.28, 'WARLORD 2', {
        fontFamily: 'Cinzel, serif',
        fontSize: '84px',
        color: UI_COLORS.gold,
        fontStyle: 'bold',
        stroke: '#4a2a08',
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // Subtitle.
    this.add
      .text(width / 2, height * 0.40, 'a turn-based strategy of eight kingdoms', {
        fontFamily: 'Cinzel, serif',
        fontSize: '20px',
        color: '#e8d8a8',
        fontStyle: 'italic',
      })
      .setOrigin(0.5);

    // "Begin" button - chiseled gold.
    const beginBg = this.add.graphics();
    const beginW = 220;
    const beginH = 56;
    const beginX = width / 2 - beginW / 2;
    const beginY = height * 0.58;
    beginBg.fillStyle(0xc89a3c, 1);
    beginBg.fillRect(beginX, beginY, beginW, beginH);
    beginBg.fillStyle(0xf4cf6a, 1);
    beginBg.fillRect(beginX + 2, beginY + 2, beginW - 4, 12);
    beginBg.fillStyle(0x6a4a18, 1);
    beginBg.fillRect(beginX + 2, beginY + beginH - 6, beginW - 4, 4);
    beginBg.lineStyle(2, 0x1c1a18, 1);
    beginBg.strokeRect(beginX, beginY, beginW, beginH);
    const beginBtn = this.add
      .text(width / 2, beginY + beginH / 2, 'BEGIN', {
        fontFamily: 'Cinzel, serif',
        fontSize: '28px',
        color: '#1c1a18',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    beginBtn.on('pointerover', () => beginBtn.setColor('#4a2a08'));
    beginBtn.on('pointerout', () => beginBtn.setColor('#1c1a18'));
    beginBtn.on('pointerdown', () => this.scene.start('FactionScene'));

    // "Continue" button if a save exists.
    const slots = listSlots();
    if (slots.length > 0) {
      const slotName = slots[0]!;
      const contBg = this.add.graphics();
      const contW = 260;
      const contH = 36;
      const contX = width / 2 - contW / 2;
      const contY = height * 0.70;
      contBg.fillStyle(0x2a1f18, 1);
      contBg.fillRect(contX, contY, contW, contH);
      contBg.lineStyle(2, 0x8a6420, 1);
      contBg.strokeRect(contX, contY, contW, contH);
      const cont = this.add
        .text(width / 2, contY + contH / 2, `Continue — ${slotName}`, {
          fontFamily: 'Cinzel, serif',
          fontSize: '16px',
          color: UI_COLORS.gold,
          fontStyle: 'italic',
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

    // Decorative gold corner pip above the footer.
    const footerPip = this.add.graphics();
    footerPip.fillStyle(0xc89a3c, 1);
    footerPip.fillCircle(width / 2 - 4, height * 0.93, 3);

    // Footer credit (not affiliated with SSG / Ubisoft).
    this.add
      .text(width / 2, height * 0.95, 'Inspired by 1990s turn-based strategy.  Not affiliated with SSG or Ubisoft.', {
        fontFamily: 'Press Start 2P, monospace',
        fontSize: '10px',
        color: '#a09080',
      })
      .setOrigin(0.5);
  }
}
