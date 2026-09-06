/**
 * Performance overlay. Renders FPS, draw calls, and sim-update time.
 * Gated by URL flag `?perf=1`.
 */

export class PerfOverlay {
  private text: Phaser.GameObjects.Text | null = null;
  private enabled = false;
  private lastFrame = performance.now();
  private fpsSamples: number[] = [];
  private lastSimMs = 0;

  constructor(private readonly scene: Phaser.Scene) {
    this.enabled = new URLSearchParams(window.location.search).get('perf') === '1';
    if (this.enabled) this.create();
  }

  private create(): void {
    this.text = this.scene.add.text(8, 8, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffd700',
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: { left: 6, right: 6, top: 4, bottom: 4 },
    });
    this.text.setDepth(10000);
    this.text.setScrollFactor(0);
  }

  /** Update with a per-frame tick. */
  tick(simMs: number): void {
    const now = performance.now();
    const frameMs = now - this.lastFrame;
    this.lastFrame = now;
    this.lastSimMs = simMs;
    if (this.enabled && frameMs > 0) {
      this.fpsSamples.push(1000 / frameMs);
      if (this.fpsSamples.length > 60) this.fpsSamples.shift();
      this.render();
    }
  }

  private render(): void {
    if (!this.text) return;
    const avgFps = this.fpsSamples.reduce((a, b) => a + b, 0) / Math.max(1, this.fpsSamples.length);
    this.text.setText(
      [
        `FPS: ${avgFps.toFixed(0)}`,
        `Sim: ${this.lastSimMs.toFixed(2)}ms`,
        `Draw: ${this.scene.game.loop.actualFps.toFixed(0)}`,
      ].join('\n'),
    );
  }

  destroy(): void {
    this.text?.destroy();
    this.text = null;
  }
}
