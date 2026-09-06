import Phaser from 'phaser';
import { preloadAssets } from '../assets/loader';

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
  }

  create(): void {
    // Dev shortcut: ?scene=GameScene skips the menu for screenshot/QA use.
    const params = new URLSearchParams(window.location.search);
    const direct = params.get('scene');
    if (direct === 'GameScene') {
      this.scene.start('GameScene', { faction: params.get('faction') ?? 'humans' });
      return;
    }
    if (direct === 'FactionScene') {
      this.scene.start('FactionScene');
      return;
    }
    this.scene.start('MenuScene');
  }
}
