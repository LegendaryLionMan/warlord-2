import Phaser from 'phaser';
import { UI_COLORS, UI_COLORS_NUM, FACTION_COLORS } from '../config';
import { FACTIONS } from '../data/factions';
import { audioManager } from '../assets/audio-manager';
import { hideHud, showHud } from '../hud/hud';
import type { FactionId } from '../sim/state';

/**
 * Faction select scene. Four faction cards; click one to start the game.
 * The chosen faction is stored on the GameState via the HUD's setPlayerFaction.
 */
export class FactionScene extends Phaser.Scene {
  static readonly KEY = 'FactionScene';

  constructor() {
    super(FactionScene.KEY);
  }

  create(): void {
    // Phase 14 — hide the HUD so the 1993 faction frame is unobscured.
    hideHud();
    this.events.once('shutdown', () => showHud());
    audioManager.playMusic('music.faction-select');
    this.events.once('shutdown', () => audioManager.stopMusic(400));
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, UI_COLORS_NUM.background);

    this.add
      .text(width / 2, height * 0.12, 'Choose Your Faction', {
        fontFamily: 'Cinzel, serif',
        fontSize: '36px',
        color: UI_COLORS.gold,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Phase 16 — 8 factions (the 1993 roster) in a 4×2 grid.
    const factionIds: FactionId[] = [
      'humans', 'elves', 'orcs', 'undead',
      'siroms', 'darkelves', 'fey', 'syrnyn',
    ];
    const cardW = 200;
    const cardH = 220;
    const gapX = 18;
    const gapY = 18;
    const cols = 4;
    const totalW = cardW * cols + gapX * (cols - 1);
    const startX = (width - totalW) / 2 + cardW / 2;
    const startY = height * 0.28 + cardH / 2;

    factionIds.forEach((id, i) => {
      const def = FACTIONS[id];
      const colors = FACTION_COLORS[id];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardW + gapX);
      const y = startY + row * (cardH + gapY);
      this.drawCard(x, y, cardW, cardH, def.name, def.tagline, def.description, def.heroName, colors, () => {
        this.scene.start('GameScene', { faction: id });
      });
    });

    // Back button
    const back = this.add
      .text(width / 2, height * 0.94, '< Back', {
        fontFamily: 'Cinzel, serif',
        fontSize: '18px',
        color: UI_COLORS.textDim,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    back.on('pointerover', () => back.setColor(UI_COLORS.gold));
    back.on('pointerout', () => back.setColor(UI_COLORS.textDim));
    back.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  private drawCard(
    x: number,
    y: number,
    w: number,
    h: number,
    name: string,
    tagline: string,
    description: string,
    heroName: string,
    colors: { primary: number; secondary: number; accent: number; text: string },
    onClick: () => void,
  ): void {
    const card = this.add
      .rectangle(x, y, w, h, colors.secondary, 0.95)
      .setStrokeStyle(3, colors.primary);

    // Top accent bar
    this.add.rectangle(x, y - h / 2 + 4, w, 6, colors.primary).setOrigin(0.5, 0);

    // Faction name
    this.add
      .text(x, y - h / 2 + 40, name, {
        fontFamily: 'Cinzel, serif',
        fontSize: '20px',
        color: Phaser.Display.Color.IntegerToColor(colors.accent).rgba,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Hero name
    this.add
      .text(x, y - h / 2 + 70, `Hero: ${heroName}`, {
        fontFamily: 'Cinzel, serif',
        fontSize: '10px',
        color: colors.text,
      })
      .setOrigin(0.5);

    // Tagline
    this.add
      .text(x, y - h / 2 + 95, tagline, {
        fontFamily: 'Cinzel, serif',
        fontSize: '11px',
        color: colors.text,
        wordWrap: { width: w - 30 },
        align: 'center',
      })
      .setOrigin(0.5, 0);

    // Description
    this.add
      .text(x, y - h / 2 + 130, description, {
        fontFamily: 'Cinzel, serif',
        fontSize: '10px',
        color: '#a09080',
        wordWrap: { width: w - 30 },
        align: 'center',
      })
      .setOrigin(0.5, 0);

    // Bottom strip
    this.add
      .text(x, y + h / 2 - 18, 'Click to choose', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: Phaser.Display.Color.IntegerToColor(colors.accent).rgba,
      })
      .setOrigin(0.5);

    card.setInteractive({ useHandCursor: true });
    card.on('pointerover', () => card.setScale(1.04));
    card.on('pointerout', () => card.setScale(1.0));
    card.on('pointerdown', onClick);
  }
}
