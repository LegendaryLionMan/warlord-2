import Phaser from 'phaser';
import { preloadAssets, reportLoadFailures } from '../assets/loader';
import { audioManager } from '../assets/audio-manager';

/**
 * Boot scene. Preloads any required assets and transitions to the menu.
 * Phase 0 has nothing to preload; Phase 9 will load real sprite sheets here.
 */
export class BootScene extends Phaser.Scene {
  static readonly KEY = 'BootScene';

  constructor() {
    super(BootScene.KEY);
  }

  preload(): void {
    preloadAssets(this);
    reportLoadFailures(this);
  }

  create(): void {
    audioManager.init(this);
    // Dev shortcut: ?scene=GameScene skips the menu for screenshot/QA use.
    const params = new URLSearchParams(window.location.search);
    const direct = params.get('scene');
    if (
      direct === 'GameScene' ||
      direct === 'ProductionScene' ||
      direct === 'HeroScene' ||
      direct === 'QuestScene'
    ) {
      // All four flow through GameScene; the dialog ones self-launch
      // in GameScene.create() based on the same URL param.
      this.scene.start('GameScene', { faction: params.get('faction') ?? 'humans' });
      return;
    }
    if (direct === 'FactionScene') {
      this.scene.start('FactionScene');
      return;
    }
    if (direct === 'OutcomeScene') {
      // Seed the outcome payload so OutcomeScene can read it when
      // launched from GameScene.create().
      (window as unknown as { outcomePayload: { kind: 'won' | 'lost' } }).outcomePayload = {
        kind: (params.get('kind') as 'won' | 'lost') ?? 'won',
      };
      this.scene.start('GameScene', { faction: params.get('faction') ?? 'humans' });
      return;
    }
    this.scene.start('MenuScene');
  }
}
