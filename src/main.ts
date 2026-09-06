/**
 * Vite entry point. Mounts the HUD shell, then boots Phaser. The HUD
 * `initHud()` is also called by the MenuScene on first activation; here
 * we just make sure the styles are loaded and the DOM is in place.
 */

import './styles/base.css';
import './hud/hud.css';

import { bootPhaser } from './render';

bootPhaser();
