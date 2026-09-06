/**
 * Phase 12 — Audio manager.
 *
 * Single point of control for music and SFX. Wraps Phaser's sound
 * subsystem with mute toggles, URL-param overrides, and a simple
 * cross-fade between music tracks.
 *
 * URL params:
 *   ?mute=1   Mute everything.
 *   ?music=0  Disable music.
 *   ?sfx=0    Disable sound effects.
 *
 * Public API:
 *   AudioManager.init(scene)              — call once per scene
 *   AudioManager.playMusic(key, opts?)    — looped track, cross-fades out the previous one
 *   AudioManager.stopMusic(fadeMs?)      — fade out and stop
 *   AudioManager.playSfx(key, opts?)     — one-shot, can overlap
 *   AudioManager.setMuted(bool)          — toggle everything
 */

import Phaser from 'phaser';

export interface PlayMusicOpts {
  /** Loop the track (default true). */
  loop?: boolean;
  /** Target volume 0..1 (default 0.5). */
  volume?: number;
  /** Fade-in duration in ms (default 800). */
  fadeIn?: number;
  /** Fade-out duration for the previous track in ms (default 600). */
  fadeOut?: number;
}

export interface PlaySfxOpts {
  /** Per-shot volume 0..1 (default 0.7). */
  volume?: number;
  /** Playback rate multiplier (default 1). */
  rate?: number;
}

interface ActiveMusic {
  sound: Phaser.Sound.BaseSound;
  tween?: Phaser.Tweens.Tween;
}

export class AudioManager {
  private scene: Phaser.Scene | null = null;
  private currentMusic: ActiveMusic | null = null;
  private muted = false;
  private musicEnabled = true;
  private sfxEnabled = true;
  private musicVolume = 0.5;
  private sfxVolume = 0.7;

  /** Read URL overrides once, before init. */
  init(scene: Phaser.Scene): void {
    this.scene = scene;
    this.readUrlParams();
  }

  private readUrlParams(): void {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('mute') === '1') this.muted = true;
    if (params.get('music') === '0') this.musicEnabled = false;
    if (params.get('sfx') === '0') this.sfxEnabled = false;
  }

  setMuted(value: boolean): void {
    this.muted = value;
    if (value) this.stopMusic(0);
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMusicEnabled(value: boolean): void {
    this.musicEnabled = value;
    if (!value) this.stopMusic(0);
  }

  setSfxEnabled(value: boolean): void {
    this.sfxEnabled = value;
  }

  /** Play a looping music track. Cross-fades the previous track out. */
  playMusic(key: string, opts: PlayMusicOpts = {}): void {
    if (!this.scene || this.muted || !this.musicEnabled) return;
    if (!this.scene.cache.audio.has(key)) {
      // Audio not loaded — silently ignore.
      return;
    }

    const loop = opts.loop ?? true;
    const volume = opts.volume ?? this.musicVolume;
    const fadeIn = opts.fadeIn ?? 800;
    const fadeOut = opts.fadeOut ?? 600;

    // Fade out previous track (if any) while starting the new one.
    if (this.currentMusic) {
      const prev = this.currentMusic;
      this.scene.tweens.add({
        targets: prev.sound,
        volume: 0,
        duration: fadeOut,
        onComplete: () => prev.sound.stop(),
      });
    }

    const sound = this.scene.sound.add(key, { loop, volume: 0 });
    sound.play();
    this.scene.tweens.add({
      targets: sound,
      volume,
      duration: fadeIn,
    });
    this.currentMusic = { sound };
  }

  /** Stop the current music track, with optional fade-out. */
  stopMusic(fadeMs = 600): void {
    if (!this.scene || !this.currentMusic) return;
    const cur = this.currentMusic;
    this.currentMusic = null;
    if (fadeMs <= 0) {
      cur.sound.stop();
      return;
    }
    this.scene.tweens.add({
      targets: cur.sound,
      volume: 0,
      duration: fadeMs,
      onComplete: () => cur.sound.stop(),
    });
  }

  /** Play a one-shot SFX. Multiple instances can overlap. */
  playSfx(key: string, opts: PlaySfxOpts = {}): void {
    if (!this.scene || this.muted || !this.sfxEnabled) return;
    if (!this.scene.cache.audio.has(key)) return;
    const volume = opts.volume ?? this.sfxVolume;
    const rate = opts.rate ?? 1;
    const sound = this.scene.sound.add(key, { volume, rate });
    sound.once('complete', () => sound.destroy());
    sound.play();
  }

  /** Cleanup on scene shutdown. */
  shutdown(): void {
    this.stopMusic(0);
    this.scene = null;
  }
}

/** Module-level singleton. */
export const audioManager = new AudioManager();
