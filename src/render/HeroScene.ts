import Phaser from 'phaser';
import { UI_COLORS } from '../config';
import { audioManager } from '../assets/audio-manager';
import { hideHud, showHud } from '../hud/hud';

/**
 * Hero dialog — opens when the player clicks a hero figure on the
 * map. Uses the 1993 "A Hero!" dialog (cropped from
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
    // heroName is reserved for future use (e.g., animated portrait
    // swap) — the backdrop image already shows the painted portrait.
    void pending?.heroName;

    // 1993 hero-dialog backdrop
    const bg = this.add.image(width / 2, height / 2, 'original.hero-dialog');
    bg.setDisplaySize(width, height);
    bg.setDepth(-10);
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.35);

    // OK button
    const ok = this.add
      .text(width - 130, height - 70, 'OK', {
        fontFamily: 'Press Start 2P, monospace',
        fontSize: '14px',
        color: UI_COLORS.gold,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    ok.on('pointerover', () => ok.setColor('#ffffff'));
    ok.on('pointerout', () => ok.setColor(UI_COLORS.gold));
    ok.on('pointerdown', () => this.scene.stop());
  }
}
