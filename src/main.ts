/**
 * Vite entry point. Mounts the HUD shell, then boots Phaser. The HUD
 * is initialized here so it persists across all scenes.
 */

import './styles/base.css';
import './hud/hud.css';

import { bootPhaser } from './render';
import { initHud } from './hud/hud';

initHud();
bootPhaser();
