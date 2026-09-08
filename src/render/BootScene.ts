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
    if (direct === 'FactionScene') {
      this.scene.start('FactionScene');
      return;
    }
    if (direct === 'CombatScene') {
      // Seed a fake combat payload so CombatScene has something to draw.
      (window as unknown as { combatPayload: { attacker: { hero?: { name: string } }; result: { victory: boolean; attackLosses: number; defendLosses: number } } }).combatPayload = {
        attacker: { hero: { name: 'Sir Marhaus' } },
        result: { victory: true, attackLosses: 2, defendLosses: 5 },
      };
      this.scene.start('CombatScene');
      return;
    }
    if (direct === 'HeroScene') {
      (window as unknown as { heroPayload: { heroName: string } }).heroPayload = {
        heroName: 'Sir Marhaus',
      };
      this.scene.start('HeroScene');
      return;
    }
    if (direct === 'ProductionScene') {
      (window as unknown as { productionPayload: { city: { name?: string } } }).productionPayload = {
        city: { name: 'The Silver City of Wintergreen' },
      };
      this.scene.start('ProductionScene');
      return;
    }
    if (direct === 'QuestScene') {
      this.scene.start('QuestScene');
      return;
    }
    if (direct === 'OutcomeScene') {
      (window as unknown as { outcomePayload: { kind: 'won' | 'lost' } }).outcomePayload = {
        kind: (params.get('kind') as 'won' | 'lost') ?? 'won',
      };
      this.scene.start('OutcomeScene');
      return;
    }
    // Default: GameScene (and the dialog-over-GameScene flow).
    this.scene.start('GameScene', { faction: params.get('faction') ?? 'humans' });
  }
}
