import Phaser from 'phaser';
import { UI_COLORS } from '../config';
import { audioManager } from '../assets/audio-manager';
import { hideHud, showHud } from '../hud/hud';
import { drawBackdrop } from './backdrops';

/**
 * Quest dialog — opens occasionally as a random event. Uses a
 * procedural scroll backdrop, with the quest title, body, and a
 * Done button.
 */
export class QuestScene extends Phaser.Scene {
  static readonly KEY = 'QuestScene';

  // 1990s-style quest text (drawn from the actual 1990s quest pool
  // — see Sir Marhaus's Quest, The Lost City, etc.)
  private static readonly QUESTS: ReadonlyArray<{ title: string; body: string; reward: string }> = [
    {
      title: "Sir Marhaus's Quest",
      body: 'Thou hast completed thy quest! As reward, the priests give thee 1625 gold.',
      reward: '+1625 gold',
    },
    {
      title: 'The Lost City',
      body: 'A wandering hermit points thee to a forgotten city. As reward, the city joins thy kingdom.',
      reward: '+1 city',
    },
    {
      title: 'A Travelling Bard',
      body: 'A minstrel pleaseth the court with a song. The army is heartened — thy troops gain +1 morale this turn.',
      reward: '+1 morale',
    },
    {
      title: 'The Oracle',
      body: 'The Oracle of Erythea grants thee a vision. Thou mayest see all enemy cities for one turn.',
      reward: 'Vision (1 turn)',
    },
  ];

  constructor() {
    super(QuestScene.KEY);
  }

  create(): void {
    hideHud();
    this.events.once('shutdown', () => showHud());
    audioManager.playSfx('sfx.click');
    const { width, height } = this.scale;
    const quest = QuestScene.QUESTS[Math.floor(Math.random() * QuestScene.QUESTS.length)]!;

    // Procedural quest-scroll backdrop (aged paper + gold frame).
    drawBackdrop(this, 'quest');

    // Central panel
    const panelW = 640;
    const panelH = 420;
    const cx = width / 2;
    const cy = height / 2;
    const panel = this.add.rectangle(cx, cy, panelW, panelH, 0x1c1a18, 0.97);
    panel.setStrokeStyle(3, 0xc89a3c);

    // Decorative gold scroll header
    const header = this.add.rectangle(cx, cy - panelH / 2 + 18, panelW - 20, 10, 0xc89a3c, 0.7);
    this.add.circle(cx - panelW / 2 + 16, cy - panelH / 2 + 18, 5, 0xf4cf6a);
    this.add.circle(cx + panelW / 2 - 16, cy - panelH / 2 + 18, 5, 0xf4cf6a);

    // Quest title
    this.add.text(cx, cy - panelH / 2 + 60, quest.title, {
      fontFamily: 'Cinzel, serif',
      fontSize: '30px',
      color: UI_COLORS.gold,
      fontStyle: 'bold',
      stroke: '#1c1a18',
      strokeThickness: 2,
      align: 'center',
      wordWrap: { width: panelW - 80 },
    }).setOrigin(0.5);

    // Quest body
    this.add.text(cx, cy - 20, quest.body, {
      fontFamily: 'Cinzel, serif',
      fontSize: '18px',
      color: '#e8d8a8',
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: panelW - 80 },
    }).setOrigin(0.5);

    // Reward
    this.add.text(cx, cy + 60, `Reward: ${quest.reward}`, {
      fontFamily: 'Cinzel, serif',
      fontSize: '20px',
      color: '#c89a3c',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Done button
    const doneW = 160;
    const doneH = 44;
    const doneX = cx - doneW / 2;
    const doneY = cy + panelH / 2 - doneH - 16;
    const doneBg = this.add.graphics();
    doneBg.fillStyle(0xc89a3c, 1);
    doneBg.fillRect(doneX, doneY, doneW, doneH);
    doneBg.fillStyle(0xf4cf6a, 1);
    doneBg.fillRect(doneX + 2, doneY + 2, doneW - 4, 10);
    doneBg.lineStyle(2, 0x1c1a18, 1);
    doneBg.strokeRect(doneX, doneY, doneW, doneH);
    const done = this.add
      .text(cx, doneY + doneH / 2, 'DONE', {
        fontFamily: 'Cinzel, serif',
        fontSize: '20px',
        color: '#1c1a18',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    done.on('pointerover', () => done.setColor('#4a2a08'));
    done.on('pointerout', () => done.setColor('#1c1a18'));
    done.on('pointerdown', () => this.scene.stop());
  }
}
