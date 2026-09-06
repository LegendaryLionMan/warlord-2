import Phaser from 'phaser';
import { UI_COLORS_NUM, TILE_SIZE } from '../config';
import { updateHud } from '../hud/hud';
import { generateMap, tileAt } from '../sim/map';
import { createInitialState, type FactionId, type GameState, type TerrainId } from '../sim/state';
import { PerfOverlay } from '../debug/perf';

/**
 * Game scene. Renders the procedural map, handles camera pan/zoom, and
 * click-to-select tile. Phase 2+ adds armies and movement on top.
 */
export class GameScene extends Phaser.Scene {
  static readonly KEY = 'GameScene';

  private perf!: PerfOverlay;
  private faction: FactionId = 'humans';
  private state!: GameState;
  private tileSprites: Phaser.GameObjects.Rectangle[][] = [];
  private selectionRect: Phaser.GameObjects.Rectangle | null = null;
  private minimap!: Phaser.GameObjects.Graphics;

  // Camera input
  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;
  private cameraStartX = 0;
  private cameraStartY = 0;

  constructor() {
    super(GameScene.KEY);
  }

  init(data: { faction?: FactionId }): void {
    this.faction = data.faction ?? 'humans';
  }

  create(): void {
    const { width: _w, height: _h } = this.scale;

    // Initialize game state and generate map
    this.state = createInitialState();
    this.state.playerFaction = this.faction;
    this.state.phase = 'playing';
    generateMap(this.state, 42);

    // Camera setup — interactive for panning, scroll for zoom
    this.cameras.main.setBackgroundColor(UI_COLORS_NUM.background);
    this.cameras.main.setBounds(0, 0, this.state.mapWidth * TILE_SIZE, this.state.mapHeight * TILE_SIZE);

    // Render all tiles
    this.renderMap();

    // Selection rectangle (initially hidden)
    this.selectionRect = this.add.rectangle(0, 0, TILE_SIZE, TILE_SIZE, 0xffd700, 0);
    this.selectionRect.setStrokeStyle(3, 0xffd700, 1);
    this.selectionRect.setVisible(false);
    this.selectionRect.setDepth(100);

    // Minimap (bottom-right corner)
    this.minimap = this.add.graphics();
    this.minimap.setScrollFactor(0);
    this.minimap.setDepth(50);
    this.minimap.setPosition(0, 0);
    this.drawMinimap();

    // Input handling
    this.setupInput();

    // Performance overlay
    this.perf = new PerfOverlay(this);

    // Initial HUD push
    updateHud({
      turn: this.state.turn,
      gold: this.state.gold,
      cities: this.state.cities.length,
      armies: this.state.armies.length,
      faction: this.state.playerFaction,
    });
  }

  private renderMap(): void {
    for (let y = 0; y < this.state.mapHeight; y++) {
      const row: Phaser.GameObjects.Rectangle[] = [];
      for (let x = 0; x < this.state.mapWidth; x++) {
        const tile = this.state.map[y]?.[x];
        if (!tile) continue;
        const colors = TERRAIN_NUM_COLORS[tile.terrain];

        const rect = this.add.rectangle(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          TILE_SIZE,
          TILE_SIZE,
          colors.fill,
        );
        rect.setStrokeStyle(1, colors.edge, 0.4);
        row.push(rect);
      }
      this.tileSprites.push(row);
    }
  }

  private drawMinimap(): void {
    const W = 160;
    const H = 120;
    const cellW = W / this.state.mapWidth;
    const cellH = H / this.state.mapHeight;

    this.minimap.clear();
    this.minimap.fillStyle(0x000000, 0.6);
    this.minimap.fillRect(this.scale.width - W - 12, this.scale.height - H - 12, W, H);

    for (let y = 0; y < this.state.mapHeight; y++) {
      for (let x = 0; x < this.state.mapWidth; x++) {
        const tile = this.state.map[y]?.[x];
        if (!tile) continue;
        const colors = TERRAIN_NUM_COLORS[tile.terrain];
        this.minimap.fillStyle(colors.fill, 0.8);
        this.minimap.fillRect(
          this.scale.width - W - 12 + x * cellW,
          this.scale.height - H - 12 + y * cellH,
          cellW,
          cellH,
        );
      }
    }
    this.minimap.lineStyle(2, 0xffd700, 1);
    this.minimap.strokeRect(this.scale.width - W - 12, this.scale.height - H - 12, W, H);
  }

  private setupInput(): void {
    // Wheel zoom
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: unknown[], _deltaX: number, deltaY: number) => {
      const cam = this.cameras.main;
      const oldZoom = cam.zoom;
      const newZoom = Phaser.Math.Clamp(oldZoom * (deltaY > 0 ? 0.9 : 1.1), 0.5, 2);
      cam.zoomTo(newZoom, 100);
    });

    // Middle-click drag pan
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.middleButtonDown()) {
        this.isPanning = true;
        this.panStartX = pointer.x;
        this.panStartY = pointer.y;
        this.cameraStartX = this.cameras.main.scrollX;
        this.cameraStartY = this.cameras.main.scrollY;
      } else if (pointer.leftButtonDown()) {
        const worldX = this.cameras.main.scrollX + pointer.x;
        const worldY = this.cameras.main.scrollY + pointer.y;
        const tileX = Math.floor(worldX / TILE_SIZE);
        const tileY = Math.floor(worldY / TILE_SIZE);
        const tile = tileAt(this.state, tileX, tileY);
        if (tile) {
          this.selectTile(tileX, tileY, tile.terrain);
        }
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isPanning) {
        const dx = (pointer.x - this.panStartX) / this.cameras.main.zoom;
        const dy = (pointer.y - this.panStartY) / this.cameras.main.zoom;
        this.cameras.main.scrollX = this.cameraStartX - dx;
        this.cameras.main.scrollY = this.cameraStartY - dy;
      }
    });

    this.input.on('pointerup', () => {
      this.isPanning = false;
    });
  }

  private selectTile(x: number, y: number, terrain: TerrainId): void {
    if (this.selectionRect) {
      this.selectionRect.setPosition(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2);
      this.selectionRect.setVisible(true);
    }
    const name = terrain.charAt(0).toUpperCase() + terrain.slice(1);
    updateHud({
      selectedName: name,
      selectedTerrain: terrain,
      selectedXY: { x, y },
    });
  }

  update(_time: number, _delta: number): void {
    const simStart = performance.now();
    const simMs = performance.now() - simStart;
    this.perf.tick(simMs);
  }
}

/** 24-bit color integers per terrain for Phaser. */
const TERRAIN_NUM_COLORS: Record<TerrainId, { fill: number; edge: number }> = {
  plains: { fill: 0x6b8e5a, edge: 0x4a6e3a },
  forest: { fill: 0x2d5a2d, edge: 0x0f3f0f },
  hills: { fill: 0x8b6b4a, edge: 0x6a4a2a },
  mountains: { fill: 0x5a5a6a, edge: 0x3a3a4a },
  water: { fill: 0x2a4a7a, edge: 0x0a2a5a },
};
