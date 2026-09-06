/**
 * Phaser asset loader wrapper.
 *
 * For Phase 0 we don't load any sprite art; everything is procedurally drawn
 * via Phaser graphics. Phase 9 will replace these stub calls with real
 * sprite-sheet loads keyed by the manifest in src/data/manifests.ts.
 */

import Phaser from 'phaser';

export function preloadAssets(_scene: Phaser.Scene): void {
  // Phase 0: no assets to load. Procedural drawing only.
  // Phase 9 will add: terrain tilesets, unit sprites per faction, hero portraits,
  // city variants, feature art, UI cursors, audio files.
}
