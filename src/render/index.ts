import Phaser from 'phaser';
import { BootScene } from './BootScene';
import { MenuScene } from './MenuScene';
import { FactionScene } from './FactionScene';
import { GameScene } from './GameScene';
import { CombatScene } from './CombatScene';

/**
 * Phaser game configuration. One source of truth for canvas size, scenes,
 * and engine settings.
 */
export const PHASER_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0f0f17',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%',
  },
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scene: [BootScene, MenuScene, FactionScene, GameScene, CombatScene],
  fps: { target: 60, forceSetTimeOut: false },
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true,
  },
};

/** Boot a fresh Phaser game with the project config. */
export function bootPhaser(): Phaser.Game {
  return new Phaser.Game(PHASER_CONFIG);
}
