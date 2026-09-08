import Phaser from 'phaser';
import { UI_COLORS } from '../config';
import { audioManager } from '../assets/audio-manager';
import { hideHud, showHud } from '../hud/hud';

/**
 * Outcome overlay — fires when the player wins (75% of the kingdom)
 * or loses (faction destroyed). Uses the 1993 marble-and-gold frame
 * style (matching the original 1993 victory/defeat dialogs from
 * the manual) with a centered title, a sub-quote, and a Return to
 * Main Menu button.
 *
 * The 1993 game showed the player's last-known world map with a
 * parchment overlay; for the clone we use a full-screen marble
 * panel since we don't have a victory map.
 */
export class OutcomeScene extends Phaser.Scene {
  static readonly KEY = 'OutcomeScene';

  constructor() {
    super(OutcomeScene.KEY);
  }

  create(): void {
    hideHud();
    this.events.once('shutdown', () => showHud());
    const { width, height } = this.scale;
    const outcome = (window as unknown as { outcomePayload?: { kind: 'won' | 'lost' } }).outcomePayload?.kind ?? 'won';

    // 1993 music sting
    if (outcome === 'won') {
      audioManager.playSfx('sfx.victory-sting');
    } else {
      audioManager.playSfx('sfx.defeat-sting');
    }

    // Marble panel covering the whole playfield.
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a14, 0.85);

    const panelW = 720;
    const panelH = 480;
    const cx = width / 2;
    const cy = height / 2;

    const panel = this.add.rectangle(cx, cy, panelW, panelH, 0x1c1a18, 0.97);
    panel.setStrokeStyle(4, 0xc89a3c);

    // Decorative gold scroll header
    const header = this.add.rectangle(cx, cy - panelH / 2 + 18, panelW - 20, 12, 0xc89a3c, 0.6);
    header.setStrokeStyle(1, 0x1c1a18);
    // Gold corner pips
    this.add.circle(cx - panelW / 2 + 18, cy - panelH / 2 + 18, 6, 0xf4cf6a);
    this.add.circle(cx + panelW / 2 - 18, cy - panelH / 2 + 18, 6, 0xf4cf6a);

    // Outcome title
    const title = outcome === 'won' ? 'VICTORY!' : 'DEFEAT';
    const titleColor = outcome === 'won' ? '#f4cf6a' : '#cc5050';
    this.add
      .text(cx, cy - panelH / 2 + 80, title, {
        fontFamily: 'Cinzel, serif',
        fontSize: '64px',
        color: titleColor,
        fontStyle: 'bold',
        stroke: '#1c1a18',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Subtitle / quote
    const quote = outcome === 'won'
      ? 'Thy kingdom spans 75% of the realm. The crown is thine.'
      : 'Thy banner is broken. The land is lost.';
    this.add
      .text(cx, cy - 60, quote, {
        fontFamily: 'Cinzel, serif',
        fontSize: '20px',
        color: '#e8d8a8',
        align: 'center',
        wordWrap: { width: panelW - 60 },
      })
      .setOrigin(0.5);

    // 1993 attribution
    this.add
      .text(cx, cy + 80, '"Yet thy dread empire, Chaos, is restored."\n— Alexander Pope', {
        fontFamily: 'Cinzel, serif',
        fontSize: '14px',
        color: UI_COLORS.textDim,
        align: 'center',
      })
      .setOrigin(0.5);

    // Return to Main Menu button (1993-styled gold button)
    const btnY = cy + panelH / 2 - 40;
    const btn = this.add
      .text(cx, btnY, 'Return to Main Menu', {
        fontFamily: 'Cinzel, serif',
        fontSize: '18px',
        color: '#1c1a18',
        fontStyle: 'bold',
        backgroundColor: '#c89a3c',
        padding: { x: 24, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor('#1c1a18'));
    btn.on('pointerdown', () => {
      audioManager.stopMusic(0);
      this.scene.stop('GameScene');
      this.scene.start('MenuScene');
    });
  }
}
