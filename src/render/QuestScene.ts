import Phaser from 'phaser';
import { UI_COLORS } from '../config';
import { audioManager } from '../assets/audio-manager';
import { hideHud, showHud } from '../hud/hud';

/**
 * Quest dialog — opens occasionally as a random event. Uses the 1993
 * Quest scroll (cropped from map-overview.png) as the backdrop, with
 * the quest title, body, and a Done button.
 */
export class QuestScene extends Phaser.Scene {
  static readonly KEY = 'QuestScene';

  // 1993-style quest text (drawn from the actual 1993 quest pool
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

    // 1993 quest-scroll backdrop
    const bg = this.add.image(width / 2, height / 2, 'original.map-overview');
    bg.setDisplaySize(width, height);
    bg.setDepth(-10);
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.35);

    // Quest title (above the scroll)
    this.add
      .text(width / 2, 60, quest.title, {
        fontFamily: 'Press Start 2P, monospace',
        fontSize: '16px',
        color: UI_COLORS.gold,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Quest body (multi-line)
    this.add
      .text(width / 2, height / 2 - 40, quest.body, {
        fontFamily: 'Press Start 2P, monospace',
        fontSize: '11px',
        color: UI_COLORS.text,
        align: 'center',
        wordWrap: { width: 480 },
      })
      .setOrigin(0.5);

    // Reward
    this.add
      .text(width / 2, height / 2 + 80, `Reward: ${quest.reward}`, {
        fontFamily: 'Press Start 2P, monospace',
        fontSize: '12px',
        color: '#c89a3c',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Done button
    const done = this.add
      .text(width - 130, height - 80, 'Done', {
        fontFamily: 'Press Start 2P, monospace',
        fontSize: '14px',
        color: UI_COLORS.gold,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    done.on('pointerover', () => done.setColor('#ffffff'));
    done.on('pointerout', () => done.setColor(UI_COLORS.gold));
    done.on('pointerdown', () => this.scene.stop());
  }
}
