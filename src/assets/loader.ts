/**
 * Phase 12 — Phaser asset loader.
 *
 * Loads the AI-generated sprite sheets and music/SFX files
 * (produced by scripts/gen-sprites.ps1 and scripts/gen-music.ps1) from
 * /assets/. Files that fail to load are logged once and the renderers
 * fall back to the procedural-sprites / no-audio paths.
 *
 * Generated art is "AI-assisted" — see docs/asset-credits.md.
 */

import Phaser from 'phaser';
import {
  ALL_AUDIO_KEYS,
  ALL_SPRITE_KEYS,
  AUDIO_PATHS,
  SPRITE_PATHS,
  heroSpritePath,
  unitSpritePath,
} from '../data/asset-paths';
import { FACTIONS } from '../data/factions';
import { UNIT_IDS } from '../config';
import type { FactionId, OwnerId, UnitId } from '../sim/state';

const FACTION_IDS: FactionId[] = Object.values(FACTIONS).map((f) => f.id);
const warned = new Set<string>();

function warnOnce(key: string, msg: string): void {
  if (warned.has(key)) return;
  warned.add(key);
  // eslint-disable-next-line no-console
  console.warn(`[assets] ${msg}`);
}

export function preloadAssets(scene: Phaser.Scene): void {
  // Static sprites (terrain, cities, features, heroes, UI)
  for (const key of ALL_SPRITE_KEYS) {
    const path = SPRITE_PATHS[key];
    if (!path) continue;
    scene.load.image(key, path);
  }

  // Per-faction × per-unit sprite sheets (28 total)
  for (const f of FACTION_IDS) {
    for (const u of UNIT_IDS) {
      const key = `unit.${u}.${f}`;
      scene.load.image(key, unitSpritePath(u, f));
    }
  }

  // Music and SFX
  for (const key of ALL_AUDIO_KEYS) {
    const path = AUDIO_PATHS[key];
    if (!path) continue;
    scene.load.audio(key, path);
  }

  // Hero portraits per faction (loaded via SPRITE_PATHS already; this is a
  // defensive double-bind so legacy code paths still resolve).
  for (const f of FACTION_IDS) {
    scene.load.image(`hero.${f}`, heroSpritePath(f));
  }
}

/** Returns true if a sprite texture has finished loading. */
export function hasSprite(scene: Phaser.Scene, key: string): boolean {
  return scene.textures.exists(key);
}

/** Returns true if an audio buffer has finished loading. */
export function hasAudio(scene: Phaser.Scene, key: string): boolean {
  return scene.cache.audio.has(key);
}

/** Get a unit sprite key from kind + faction. Returns null for 'neutral' (no sprite). */
export function unitKey(unit: UnitId, faction: OwnerId): string | null {
  if (faction === 'neutral') return null;
  return `unit.${unit}.${faction}`;
}

/** Get a hero sprite key from faction. Returns null for 'neutral'. */
export function heroKey(faction: OwnerId): string | null {
  if (faction === 'neutral') return null;
  return `hero.${faction}`;
}

/** For diagnostics: log any failed asset loads. Call after preload. */
export function reportLoadFailures(scene: Phaser.Scene): void {
  scene.load.on('loaderror', (file: Phaser.Loader.File) => {
    warnOnce(file.key, `Failed to load ${file.url ?? file.key}. Falling back to procedural / silent.`);
  });
}
