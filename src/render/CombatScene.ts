import Phaser from 'phaser';
import { UI_COLORS } from '../config';
import { audioManager } from '../assets/audio-manager';
import type { Army } from '../sim/state';
import type { CombatResult } from '../sim/combat';

/**
 * Combat overlay scene. Modal: pauses the underlying GameScene and
 * shows attacker / defender, then a "Continue" button that applies
 * the result. The result is stashed in window.combatResult so the
 * GameScene can read it on resume.
 */
export class CombatScene extends Phaser.Scene {
  static readonly KEY = 'CombatScene';

  constructor() {
    super(CombatScene.KEY);
  }

  create(): void {
    audioManager.playMusic('music.combat');
    audioManager.playSfx('sfx.sword');
    const { width, height } = this.scale;
    const pending = (window as unknown as { combatPayload?: { attacker: Army; result: CombatResult } }).combatPayload;

    // Phase 14 — render the original 1993 combat screen (the world
    // map view + the "Fighting" help dialog from warlord2_006.png) as
    // the combat backdrop, so the player sees the same chrome the
    // 1993 game used to introduce a fight.
    const combatBg = this.add.image(width / 2, height / 2, 'original.combat-screen');
    combatBg.setDisplaySize(width, height);
    combatBg.setDepth(-10);
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.35);

    const panelW = 720;
    const panelH = 460;
    const cx = width / 2;
    const cy = height / 2;

    const panel = this.add.rectangle(cx, cy, panelW, panelH, 0x1a1a2a, 0.96);
    panel.setStrokeStyle(3, 0xe94560);

    this.add
      .text(cx, cy - panelH / 2 + 32, 'BATTLE', {
        fontFamily: 'Cinzel, serif',
        fontSize: '36px',
        color: UI_COLORS.gold,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    if (pending) {
      const { attacker, result } = pending;
      this.add
        .text(cx, cy - 60, `${attacker.hero?.name ?? 'Your forces'} vs. Enemy`, {
          fontFamily: 'Cinzel, serif',
          fontSize: '20px',
          color: '#e8e4d9',
        })
        .setOrigin(0.5);

      const resultColor = result.victory ? '#5cc480' : '#c94a4a';
      const resultText = result.victory ? 'VICTORY!' : 'DEFEAT!';
      this.add
        .text(cx, cy + 40, resultText, {
          fontFamily: 'Cinzel, serif',
          fontSize: '44px',
          color: resultColor,
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      this.add
        .text(
          cx,
          cy + 110,
          `Your losses: ${result.attackLosses}    Enemy losses: ${result.defendLosses}`,
          { fontFamily: 'Cinzel, serif', fontSize: '16px', color: '#a09080' },
        )
        .setOrigin(0.5);
    } else {
      this.add
        .text(cx, cy, 'Combat overlay — coming in Phase 3', {
          fontFamily: 'Cinzel, serif',
          fontSize: '18px',
          color: UI_COLORS.textDim,
        })
        .setOrigin(0.5);
    }

    const cont = this.add
      .text(cx, cy + panelH / 2 - 30, '[ Continue ]', {
        fontFamily: 'Cinzel, serif',
        fontSize: '22px',
        color: UI_COLORS.text,
        backgroundColor: '#2a2319',
        padding: { left: 30, right: 30, top: 10, bottom: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    cont.on('pointerover', () => cont.setColor(UI_COLORS.gold));
    cont.on('pointerout', () => cont.setColor(UI_COLORS.text));
    cont.on('pointerdown', () => {
      // Play victory or defeat sting based on the result.
      if (pending?.result.victory) {
        audioManager.playSfx('sfx.victory-sting');
      } else {
        audioManager.playSfx('sfx.defeat-sting');
      }
      // Apply the combat result to the world before closing.
      this.events.emit('combat-resolve', pending);
      audioManager.stopMusic(400);
      this.scene.stop();
    });
  }
}
