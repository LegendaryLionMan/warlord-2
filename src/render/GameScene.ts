import Phaser from 'phaser';
import { UI_COLORS_NUM, TILE_SIZE } from '../config';
import { updateHud, setEndTurnHandler } from '../hud/hud';
import { generateMap, tileAt, isPassable } from '../sim/map';
import { createInitialState, type FactionId, type GameState } from '../sim/state';
import { PerfOverlay } from '../debug/perf';
import { bfsReachable } from '../sim/pathfinding';
import { createArmy, movementBudget, consumeMovement, type ArmyLike } from '../sim/army';
import { resolveCombat, combatTerrainFor, type CombatResult } from '../sim/combat';
import { generateCities, captureCity } from '../sim/city';
import { generateFeatures } from '../sim/features';
import { endPlayerTurn } from '../sim/turn';
import { endAllAiTurns } from '../sim/ai';
import { checkOutcome } from '../sim/win';
import { saveSlot, loadSlot } from '../save/storage';
import { drawArmySprite, drawCitySprite, kindOfUnit } from './procedural-sprites';
import { CombatScene } from './CombatScene';
import { audioManager } from '../assets/audio-manager';
import { hasSprite, unitKey, heroKey } from '../assets/loader';
import { SPRITE_KEYS } from '../data/manifests';
import type { Unit } from '../sim/state';

/**
 * Game scene. Renders the procedural map, the player army, the movement
 * range highlight, and handles camera + selection + click-to-move.
 */
export class GameScene extends Phaser.Scene {
  static readonly KEY = 'GameScene';

  private perf!: PerfOverlay;
  private faction: FactionId = 'humans';
  private state: GameState = undefined as unknown as GameState;
  private tileSprites: Phaser.GameObjects.Rectangle[][] = [];
  private selectionRect: Phaser.GameObjects.Rectangle | null = null;
  private rangeOverlays: Phaser.GameObjects.Rectangle[] = [];
  private minimap!: Phaser.GameObjects.Graphics;
  private armySprite: Phaser.GameObjects.Rectangle | null = null;
  private citySprites: Phaser.GameObjects.Rectangle[] = [];
  private featureSprites: Phaser.GameObjects.Rectangle[] = [];

  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;
  private cameraStartX = 0;
  private cameraStartY = 0;

  constructor() {
    super(GameScene.KEY);
  }

  init(data: { faction?: FactionId; loaded?: boolean }): void {
    this.faction = data.faction ?? 'humans';
  }

  create(): void {
    const loaded = (window as unknown as { loadedState?: GameState }).loadedState;
    if (loaded) {
      this.state = loaded;
      this.faction = this.state.playerFaction;
      delete (window as unknown as { loadedState?: GameState }).loadedState;
    } else {
      this.state = createInitialState();
      this.state.playerFaction = this.faction;
      this.state.phase = 'playing';
      generateMap(this.state, 42);
      generateCities(this.state, 42);
      generateFeatures(this.state, 42);
    }

    // Find a passable starting tile for the player army
    const start = this.findPassableStart();
    if (start) {
      const playerArmy = createArmy(this.state, start.x, start.y, this.faction, ['militia', 'spearman']);
      // Spawn one enemy army a few tiles away for the player to engage.
      const enemyStart = this.findPassableStart();
      if (enemyStart) {
        const ex = Math.min(this.state.mapWidth - 1, enemyStart.x + 4);
        const ey = Math.min(this.state.mapHeight - 1, enemyStart.y + 4);
        if (isPassable(this.state, ex, ey)) {
          createArmy(this.state, ex, ey, 'undead', ['militia', 'militia']);
        }
      }
      void playerArmy;
    }

    // Phase 14 — render the original 1993 world map minimap as the
    // playfield backdrop. The cropped minimap is 168x208 (a clean
    // world overview showing the continent shape, faction borders,
    // and city dots in the 1993 style). We use it as a TileSprite at
    // its native size so the continent art tiles naturally across
    // the 1024x1024 playfield without distortion, then dim it
    // (alpha 0.55) so the procedural tile grid + cities + armies
    // remain readable on top.
    const playfieldW = this.state.mapWidth * TILE_SIZE;
    const playfieldH = this.state.mapHeight * TILE_SIZE;
    const worldMap = this.add.tileSprite(0, 0, playfieldW, playfieldH, 'original.world-backdrop');
    worldMap.setOrigin(0, 0);
    worldMap.setDepth(-100);
    worldMap.setAlpha(0.55);

    this.cameras.main.setBackgroundColor(UI_COLORS_NUM.background);
    this.cameras.main.setBounds(0, 0, this.state.mapWidth * TILE_SIZE, this.state.mapHeight * TILE_SIZE);

    // Start gameplay music; ensure cleanup on scene shutdown.
    audioManager.init(this);
    audioManager.playMusic('music.gameplay');
    this.events.once('shutdown', () => audioManager.stopMusic(400));

    this.renderMap();
    this.renderCities();
    this.renderFeatures();
    this.renderArmy();

    // Center the camera on the player's army at the start.
    const army = this.state.armies[0];
    if (army) {
      this.cameras.main.centerOn(army.x * TILE_SIZE + TILE_SIZE / 2, army.y * TILE_SIZE + TILE_SIZE / 2);
    }

    this.selectionRect = this.add.rectangle(0, 0, TILE_SIZE, TILE_SIZE, 0xffd700, 0);
    this.selectionRect.setStrokeStyle(3, 0xffd700, 1);
    this.selectionRect.setVisible(false);
    this.selectionRect.setDepth(100);

    this.minimap = this.add.graphics();
    this.minimap.setScrollFactor(0);
    this.minimap.setDepth(50);
    this.minimap.setPosition(0, 0);
    this.drawMinimap();

    this.setupInput();
    this.perf = new PerfOverlay(this);
    setEndTurnHandler(() => this.endTurn());

    // Wire HUD save/load buttons to the in-memory state.
    window.addEventListener('warlords2:save', () => this.saveState());
    window.addEventListener('warlords2:load', () => this.loadState());

    updateHud({
      turn: this.state.turn,
      gold: this.state.gold,
      cities: this.state.cities.filter((c) => c.owner === this.state.playerFaction).length,
      armies: this.state.armies.length,
      faction: this.state.playerFaction,
    });
  }

  private saveState(): void {
    saveSlot('autosave', this.state);
    updateHud({ message: 'Game saved.' });
  }

  private loadState(): void {
    const state = loadSlot('autosave');
    if (state) {
      this.state = state;
      updateHud({
        turn: this.state.turn,
        gold: this.state.gold,
        cities: this.state.cities.filter((c) => c.owner === this.state.playerFaction).length,
        armies: this.state.armies.length,
        message: 'Game loaded.',
      });
    } else {
      updateHud({ message: 'No saved game found.' });
    }
  }

  private renderCities(): void {
    const g = this.add.graphics();
    g.setDepth(40);
    for (const city of this.state.cities) {
      const cx = city.x * TILE_SIZE + TILE_SIZE / 2;
      const cy = city.y * TILE_SIZE + TILE_SIZE / 2;
      const spriteKey = this.citySpriteKey(city.owner);
      if (spriteKey && hasSprite(this, spriteKey)) {
        const img = this.add.image(cx, cy, spriteKey);
        img.setDisplaySize(TILE_SIZE * 1.4, TILE_SIZE * 1.4);
        img.setDepth(40);
        this.citySprites.push(img as unknown as Phaser.GameObjects.Rectangle);
      } else {
        drawCitySprite(g, cx, cy, city.owner, city.size);
      }
    }
    this.citySprites.push(g as unknown as Phaser.GameObjects.Rectangle);
  }

  private renderFeatures(): void {
    const FEATURE_COLORS: Record<'mine' | 'ruin' | 'armory', number> = {
      mine: 0xaaaaaa,
      ruin: 0x8a4aaa,
      armory: 0x8a5a2a,
    };
    for (const f of this.state.features) {
      const cx = f.x * TILE_SIZE + TILE_SIZE / 2;
      const cy = f.y * TILE_SIZE + TILE_SIZE / 2;
      const spriteKey = this.featureSpriteKey(f.type);
      if (spriteKey && hasSprite(this, spriteKey)) {
        const img = this.add.image(cx, cy, spriteKey);
        img.setDisplaySize(TILE_SIZE * 0.9, TILE_SIZE * 0.9);
        img.setDepth(20);
        this.featureSprites.push(img as unknown as Phaser.GameObjects.Rectangle);
      } else {
        const r = this.add.rectangle(cx, cy, TILE_SIZE * 0.5, TILE_SIZE * 0.5, FEATURE_COLORS[f.type]);
        r.setStrokeStyle(1, 0x000000, 0.4);
        r.setDepth(20);
        this.featureSprites.push(r);
      }
    }
  }

  private citySpriteKey(owner: FactionId | 'neutral'): string | null {
    switch (owner) {
      case 'humans': return SPRITE_KEYS.cityHumans;
      case 'elves':  return SPRITE_KEYS.cityElves;
      case 'orcs':   return SPRITE_KEYS.cityOrcs;
      case 'undead': return SPRITE_KEYS.cityUndead;
      case 'neutral':return SPRITE_KEYS.cityNeutral;
      default:       return null;
    }
  }

  private featureSpriteKey(type: 'mine' | 'ruin' | 'armory'): string | null {
    switch (type) {
      case 'mine':   return SPRITE_KEYS.featureMine;
      case 'ruin':   return SPRITE_KEYS.featureRuin;
      case 'armory': return SPRITE_KEYS.featureArmory;
      default:       return null;
    }
  }

  /** Public hook so the HUD can call end-turn and refresh state. */
  public endTurn(): void {
    const income = endPlayerTurn(this.state);
    audioManager.playSfx('sfx.click');
    updateHud({
      turn: this.state.turn,
      gold: this.state.gold,
      cities: this.state.cities.filter((c) => c.owner === this.state.playerFaction).length,
      armies: this.state.armies.length,
      message: `Turn ${this.state.turn} — +${income}g income`,
    });
    // Now run AI turns. Synchronous; small maps finish in milliseconds.
    const order = endAllAiTurns(this.state);
    if (order.length > 0) {
      updateHud({ message: `AI: ${order.join(', ')} acted. Your turn.` });
    }
    this.drawMinimap();
    this.checkOutcome();
  }

  private checkOutcome(): void {
    const outcome = checkOutcome(this.state);
    if (outcome === 'won') {
      this.state.phase = 'won';
      this.flashTile(Math.floor(this.state.mapWidth / 2), Math.floor(this.state.mapHeight / 2), 0xffd700);
      audioManager.stopMusic(400);
      audioManager.playMusic('music.victory', { loop: false, volume: 0.6 });
      audioManager.playSfx('sfx.victory-sting');
      updateHud({ message: '🏆 VICTORY! You hold 75% of the kingdom.' });
    } else if (outcome === 'lost') {
      this.state.phase = 'lost';
      audioManager.stopMusic(400);
      audioManager.playMusic('music.defeat', { loop: false, volume: 0.5 });
      audioManager.playSfx('sfx.defeat-sting');
      updateHud({ message: '💀 DEFEAT. Your faction is destroyed.' });
    }
  }

  private findPassableStart(): { x: number; y: number } | null {
    // Center the start as close to (width/2, height/2) as passable tiles allow
    const cx = Math.floor(this.state.mapWidth / 2);
    const cy = Math.floor(this.state.mapHeight / 2);
    for (let r = 0; r < Math.max(this.state.mapWidth, this.state.mapHeight); r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const x = cx + dx;
          const y = cy + dy;
          if (x < 0 || y < 0 || x >= this.state.mapWidth || y >= this.state.mapHeight) continue;
          if (isPassable(this.state, x, y)) return { x, y };
        }
      }
    }
    return null;
  }

  private renderMap(): void {
    // Phase 14 — the world-backdrop TileSprite is the playfield's
    // visual layer. We no longer paint full opaque per-tile terrain
    // sprites on top of it; instead each tile gets a tiny colored
    // corner pip (8x8) hinting at terrain type, so the 1993
    // minimap underneath stays the dominant visual.
    for (let y = 0; y < this.state.mapHeight; y++) {
      const row: Phaser.GameObjects.Rectangle[] = [];
      for (let x = 0; x < this.state.mapWidth; x++) {
        const tile = this.state.map[y]?.[x];
        if (!tile) continue;
        const colors = TERRAIN_NUM_COLORS[tile.terrain];
        // Small 6x6 colored pip in the bottom-right corner of the tile.
        const pip = this.add.rectangle(
          x * TILE_SIZE + TILE_SIZE - 5,
          y * TILE_SIZE + TILE_SIZE - 5,
          6,
          6,
          colors.fill,
        );
        pip.setStrokeStyle(1, colors.edge, 0.6);
        pip.setDepth(1);
        row.push(pip as unknown as Phaser.GameObjects.Rectangle);
      }
      this.tileSprites.push(row);
    }
  }

  private renderArmy(): void {
    const army = this.state.armies[0];
    if (!army) return;
    const g = this.add.graphics();
    g.setDepth(50);
    // Draw one sprite per unit; player army only (armies[0]).
    const cx = army.x * TILE_SIZE + TILE_SIZE / 2;
    const cy = army.y * TILE_SIZE + TILE_SIZE / 2;
    // Pick the strongest unit to display.
    const strongest = army.units.length === 1
      ? army.units[0]!
      : army.units.reduce((acc, u) => (u.attack > acc.attack ? u : acc));
    const key = unitKey(strongest.id, army.owner);
    if (key && hasSprite(this, key)) {
      const img = this.add.image(cx, cy, key);
      img.setDisplaySize(TILE_SIZE * 1.1, TILE_SIZE * 1.1);
      img.setDepth(50);
      this.armySprite = img as unknown as Phaser.GameObjects.Rectangle;
    } else {
      drawArmySprite(g, cx, cy, army.owner, kindOfUnit(strongest.id), !!army.hero);
      this.armySprite = g as unknown as Phaser.GameObjects.Rectangle;
    }
    // Hero portrait overlay if present
    if (army.hero) {
      const heroKeyStr = heroKey(army.owner);
      if (heroKeyStr && hasSprite(this, heroKeyStr)) {
        const heroImg = this.add.image(cx, cy, heroKeyStr);
        heroImg.setDisplaySize(TILE_SIZE * 0.45, TILE_SIZE * 0.45);
        heroImg.setPosition(cx, cy - TILE_SIZE * 0.55);
        heroImg.setDepth(60);
        // Gold rim
        // (no easy stroke on Phaser Image; use a circular ring drawn next to it if needed)
      }
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
    // Army dot on minimap
    const army = this.state.armies[0];
    if (army) {
      this.minimap.fillStyle(0xffd700, 1);
      this.minimap.fillRect(
        this.scale.width - W - 12 + army.x * cellW,
        this.scale.height - H - 12 + army.y * cellH,
        Math.max(2, cellW * 1.5),
        Math.max(2, cellH * 1.5),
      );
    }
    this.minimap.lineStyle(2, 0xffd700, 1);
    this.minimap.strokeRect(this.scale.width - W - 12, this.scale.height - H - 12, W, H);
  }

  private setupInput(): void {
    this.input.on('wheel', (_p: Phaser.Input.Pointer, _g: unknown[], _dx: number, dy: number) => {
      const cam = this.cameras.main;
      const newZoom = Phaser.Math.Clamp(cam.zoom * (dy > 0 ? 0.9 : 1.1), 0.5, 2);
      cam.zoomTo(newZoom, 100);
    });

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
        const tx = Math.floor(worldX / TILE_SIZE);
        const ty = Math.floor(worldY / TILE_SIZE);
        this.handleLeftClick(tx, ty);
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

  private handleLeftClick(x: number, y: number): void {
    const tile = tileAt(this.state, x, y);
    if (!tile) return;

    // If the player army is at (x, y) and hasn't moved, show its range
    const army = this.state.armies[0];
    if (army && !army.hasMoved && army.x === x && army.y === y) {
      this.showArmyRange(army);
      this.selectTile(x, y, tile.terrain);
      this.updateArmyHud(army);
      return;
    }

    // If we have a movement range and the click is in it, move the army
    if (army && !army.hasMoved && this.isInRange(x, y)) {
      // Check for enemy army at destination
      const enemy = this.state.armies.find((a) => a !== army && a.x === x && a.y === y);
      if (enemy) {
        this.initiateCombat(army, enemy);
        return;
      }
      this.moveArmyTo(army, x, y);
      this.clearRange();
      this.selectTile(x, y, tile.terrain);
      this.updateArmyHud(army);
      this.drawMinimap();
      return;
    }

    // Default: select tile only
    this.clearRange();
    this.selectTile(x, y, tile.terrain);
    this.updateHudForTile();
  }

  private initiateCombat(attacker: GameState['armies'][number], defender: GameState['armies'][number]): void {
    const terrain = combatTerrainFor(this.state, defender.x, defender.y);
    const result = resolveCombat(attacker, defender, terrain);
    // Stash the result on window for CombatScene to read.
    (window as unknown as { combatPayload: unknown }).combatPayload = { attacker, result };
    // SFX: sword clash, or magic zap if either side has a magic user
    const anyMagic = [...attacker.units, ...defender.units].some((u) => u.magic > 0);
    audioManager.playSfx(anyMagic ? 'sfx.magic' : 'sfx.sword');
    // Listen once for the resolve event from CombatScene.
    this.events.once('resume', () => this.applyCombatResult(attacker, defender, result));
    this.scene.launch(CombatScene.KEY);
  }

  private applyCombatResult(
    attacker: GameState['armies'][number],
    defender: GameState['armies'][number],
    result: CombatResult,
  ): void {
    // Attacker survivors
    attacker.units = result.attackUnits.map((u) => ({
      id: u.id,
      hp: u.hp,
      maxHp: u.maxHp,
      attack: u.attack,
      defense: u.defense,
      moves: 0,
      maxMoves: u.maxMoves,
      ranged: u.ranged,
      range: u.range,
      vsCavalry: u.vsCavalry,
      magic: u.magic,
    } as Unit));
    consumeMovement(attacker);

    // Defender
    if (result.defendUnits.length === 0) {
      const idx = this.state.armies.indexOf(defender);
      if (idx > -1) this.state.armies.splice(idx, 1);
    } else {
      defender.units = result.defendUnits.map((u) => ({
        id: u.id,
        hp: u.hp,
        maxHp: u.maxHp,
        attack: u.attack,
        defense: u.defense,
        moves: 0,
        maxMoves: u.maxMoves,
        ranged: u.ranged,
        range: u.range,
        vsCavalry: u.vsCavalry,
        magic: u.magic,
      } as Unit));
    }

    this.clearRange();
    this.drawMinimap();
    this.refreshArmySprite();
    updateHud({ armies: this.state.armies.length });
  }

  private showArmyRange(army: ArmyLike): void {
    this.clearRange();
    const reachable = bfsReachable(this.state, army.x, army.y, movementBudget(army));
    for (const t of reachable) {
      const overlay = this.add.rectangle(
        t.x * TILE_SIZE + TILE_SIZE / 2,
        t.y * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE,
        TILE_SIZE,
        0xffd700,
        0.25,
      );
      overlay.setStrokeStyle(1, 0xffd700, 0.7);
      overlay.setDepth(20);
      this.rangeOverlays.push(overlay);
    }
  }

  private clearRange(): void {
    for (const o of this.rangeOverlays) o.destroy();
    this.rangeOverlays = [];
  }

  private isInRange(x: number, y: number): boolean {
    return this.rangeOverlays.some((o) => {
      const ox = Math.round((o.x - TILE_SIZE / 2) / TILE_SIZE);
      const oy = Math.round((o.y - TILE_SIZE / 2) / TILE_SIZE);
      return ox === x && oy === y;
    });
  }

  private moveArmyTo(army: GameState['armies'][number], x: number, y: number): void {
    const fromX = army.x;
    const fromY = army.y;
    army.x = x;
    army.y = y;
    consumeMovement(army);
    this.refreshArmySprite();
    this.animateArmyMove(fromX, fromY, x, y);
    audioManager.playSfx('sfx.move');

    // Capture a city if we walked onto one (and it's not already ours).
    const city = this.state.cities.find((c) => c.x === x && c.y === y);
    if (city && city.owner !== army.owner) {
      captureCity(army.owner, city, [...city.garrison]);
      this.refreshCitySprites();
      this.flashTile(x, y, 0xffffff);
      audioManager.playSfx('sfx.city-capture');
      updateHud({
        cities: this.state.cities.filter((c) => c.owner === this.state.playerFaction).length,
        message: `Captured ${city.name}!`,
      });
    }
  }

  /** Tween the army sprite from (fromX, fromY) to (toX, toY) if motion is enabled. */
  private animateArmyMove(fromX: number, fromY: number, toX: number, toY: number): void {
    if (this.motionReduced()) return;
    if (!this.armySprite) return;
    const startX = fromX * TILE_SIZE + TILE_SIZE / 2;
    const startY = fromY * TILE_SIZE + TILE_SIZE / 2;
    const endX = toX * TILE_SIZE + TILE_SIZE / 2;
    const endY = toY * TILE_SIZE + TILE_SIZE / 2;
    this.tweens.add({
      targets: this.armySprite,
      x: endX,
      y: endY,
      duration: 200,
      ease: 'Quad.easeOut',
    });
    void startX;
    void startY;
  }

  /** Brief white-flash on a tile (combat hit or capture). */
  private flashTile(x: number, y: number, color: number = 0xffffff): void {
    if (this.motionReduced()) return;
    const flash = this.add.rectangle(
      x * TILE_SIZE + TILE_SIZE / 2,
      y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE,
      TILE_SIZE,
      color,
      0.7,
    );
    flash.setDepth(80);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy(),
    });
  }

  /** Read ?motion=0 to disable movement animation. Respects prefers-reduced-motion. */
  private motionReduced(): boolean {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get('motion') === '0') return true;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }

  private refreshCitySprites(): void {
    for (const s of this.citySprites) s.destroy();
    this.citySprites = [];
    this.renderCities();
  }

  private refreshArmySprite(): void {
    if (this.armySprite) this.armySprite.destroy();
    this.armySprite = null;
    this.renderArmy();
  }

  private selectTile(x: number, y: number, terrain: 'plains' | 'forest' | 'hills' | 'mountains' | 'water'): void {
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

  private updateArmyHud(army: GameState['armies'][number]): void {
    updateHud({
      selectedName: `Army (${army.units.length} units)`,
      selectedTerrain: null,
      selectedXY: { x: army.x, y: army.y },
    });
    // Side panel updated via dedicated update
    const panel = document.querySelector('.side-panel .panel-body');
    if (panel) {
      panel.innerHTML = `
        <p class="selected">Your Army (${army.units.length} units)</p>
        <p class="coord">(${army.x}, ${army.y})</p>
        <ul class="unit-list">
          ${army.units
            .map(
              (u) => `
            <li class="unit-row">
              <span class="unit-name-text">${u.id}</span>
              <span class="unit-hp-text">${u.hp}/${u.maxHp} HP</span>
            </li>
          `,
            )
            .join('')}
        </ul>
      `;
    }
  }

  private updateHudForTile(): void {
    const panel = document.querySelector('.side-panel .panel-body');
    if (panel) {
      panel.innerHTML = '<p class="empty">Click on a city, army, or tile.</p>';
    }
  }

  update(_time: number, _delta: number): void {
    const simStart = performance.now();
    const simMs = performance.now() - simStart;
    this.perf.tick(simMs);
  }
}

const TERRAIN_NUM_COLORS: Record<'plains' | 'forest' | 'hills' | 'mountains' | 'water', { fill: number; edge: number }> = {
  plains: { fill: 0x6b8e5a, edge: 0x4a6e3a },
  forest: { fill: 0x2d5a2d, edge: 0x0f3f0f },
  hills: { fill: 0x8b6b4a, edge: 0x6a4a2a },
  mountains: { fill: 0x5a5a6a, edge: 0x3a3a4a },
  water: { fill: 0x2a4a7a, edge: 0x0a2a5a },
};
