import Phaser from 'phaser';
import { UI_COLORS } from '../config';
import { audioManager } from '../assets/audio-manager';
import { hideHud, showHud } from '../hud/hud';
import { drawBackdrop } from './backdrops';

/**
 * Hero dialog — opens when the player clicks a hero figure on the
 * map. Uses the "A Hero!" dialog (cropped from
 * hero-dialog.png) as the backdrop, with the hero name, gender
 * selector, and OK button on top.
 */
export class HeroScene extends Phaser.Scene {
  static readonly KEY = 'HeroScene';

  constructor() {
    super(HeroScene.KEY);
  }

  create(): void {
    hideHud();
    this.events.once('shutdown', () => showHud());
    audioManager.playSfx('sfx.click');
    const { width, height } = this.scale;
    const pending = (window as unknown as { heroPayload?: { heroName: string } }).heroPayload;
    const heroName = pending?.heroName ?? 'A Hero';

    // Procedural hero-dialog backdrop (parchment + gold frame).
    drawBackdrop(this, 'hero');
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.35);

    // Central panel
    const panelW = 560;
    const panelH = 360;
    const cx = width / 2;
    const cy = height / 2;
    const panel = this.add.rectangle(cx, cy, panelW, panelH, 0x1c1a18, 0.96);
    panel.setStrokeStyle(3, 0xc89a3c);

    // Decorative gold scroll header
    this.add.rectangle(cx, cy - panelH / 2 + 16, panelW - 20, 10, 0xc89a3c, 0.7);
    this.add.circle(cx - panelW / 2 + 16, cy - panelH / 2 + 16, 5, 0xf4cf6a);
    this.add.circle(cx + panelW / 2 - 16, cy - panelH / 2 + 16, 5, 0xf4cf6a);

    // Title
    this.add.text(cx, cy - panelH / 2 + 60, 'A HERO!', {
      fontFamily: 'Cinzel, serif',
      fontSize: '40px',
      color: UI_COLORS.gold,
      fontStyle: 'bold',
      stroke: '#1c1a18',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Hero name (large)
    this.add.text(cx, cy - 30, heroName, {
      fontFamily: 'Cinzel, serif',
      fontSize: '32px',
      color: '#e8d8a8',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(cx, cy + 30, 'A wandering adventurer', {
      fontFamily: 'Cinzel, serif',
      fontSize: '16px',
      color: '#a09080',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // OK button (chiseled gold)
    const okW = 140;
    const okH = 44;
    const okX = cx - okW / 2;
    const okY = cy + panelH / 2 - okH - 16;
    const okBg = this.add.graphics();
    okBg.fillStyle(0xc89a3c, 1);
    okBg.fillRect(okX, okY, okW, okH);
    okBg.fillStyle(0xf4cf6a, 1);
    okBg.fillRect(okX + 2, okY + 2, okW - 4, 10);
    okBg.lineStyle(2, 0x1c1a18, 1);
    okBg.strokeRect(okX, okY, okW, okH);
    const ok = this.add
      .text(cx, okY + okH / 2, 'OK', {
        fontFamily: 'Cinzel, serif',
        fontSize: '20px',
        color: '#1c1a18',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    ok.on('pointerover', () => ok.setColor('#4a2a08'));
    ok.on('pointerout', () => ok.setColor('#1c1a18'));
    ok.on('pointerdown', () => this.scene.stop());
  }
}
