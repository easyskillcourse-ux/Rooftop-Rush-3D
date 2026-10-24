import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  GameState,
  GameMode,
  PlayerMovementState,
  EnvironmentTheme,
  Difficulty,
  GraphicsQuality,
  CharacterSkin,
  ActivePowerUp,
  ObstacleData,
  CollectibleData,
  PlatformGap,
  ChunkSection,
  GameScore,
  LevelMission,
  LevelProgressState,
} from '../types';
import {
  LANE_WIDTH,
  BASE_SPEED,
  MIN_SPEED,
  NORMAL_MAX_SPEED,
  HARD_MAX_SPEED,
  MAX_SPEED,
  ABSOLUTE_HARD_SPEED_LIMIT,
  ACCELERATION_RATE,
  JUMP_VELOCITY,
  GRAVITY,
  SLIDE_DURATION,
  LANE_CHANGE_SPEED,
  CHUNK_LENGTH,
  VISIBLE_CHUNKS,
  DIFFICULTY_SETTINGS,
} from './constants';
import { CharacterModel } from './CharacterModel';
import { EnvironmentBuilder } from './EnvironmentBuilder';
import { ObstaclePool } from './ObstaclePool';
import { sounds } from '../audio/SoundEffects';

export class GameEngine {
  // Three.js Core
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private isSoftwareGl: boolean;

  // Game Systems
  public character: CharacterModel;
  private envBuilder: EnvironmentBuilder;
  private obstaclePool: ObstaclePool;

  // Environment Lighting & Atmosphere
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private rainParticles: THREE.Points | null = null;
  private forestLeafParticles: THREE.Points | null = null;

  // Active World Chunks
  private chunks: {
    data: ChunkSection;
    mesh: THREE.Group;
    sceneryMesh: THREE.Group;
    obstacleMeshes: Map<number, THREE.Group>;
    collectibleMeshes: Map<number, THREE.Group>;
  }[] = [];
  private nextChunkZ = 0;
  private chunkCounter = 0;

  // Player Physics & Movement State Machine
  public targetLane: -1 | 0 | 1 = 0; // -1: Left, 0: Center, 1: Right
  public currentX = 0;
  public playerY = 0;
  public velocityY = 0;
  public isGrounded = true;
  public isSliding = false;
  public slideTimer = 0;
  public landingTimer = 0;
  public movementState: PlayerMovementState = 'RUNNING';
  public isInvulnerable = false;
  private invulnerableTimer = 0;
  private hasPlayedFallSound = false;

  // Game Run State
  public state: GameState = 'TITLE';
  public gameMode: GameMode = 'ENDLESS';
  public currentTheme: EnvironmentTheme = 'LUSH_FOREST';
  public difficulty: Difficulty = 'NORMAL';
  public graphicsQuality: GraphicsQuality = 'HIGH';

  // Level & Mission System Tracker State
  public currentLevelMission: LevelMission | null = null;
  public hasRevivedThisRun: boolean = false;
  public finishGateSpawned: boolean = false;
  private wasOverGap: boolean = false;
  private coinTrailsTracked: Map<number, number> = new Map(); // trailGroup -> collected count
  public levelProgress: LevelProgressState = {
    currentLevel: 1,
    isLevelMode: false,
    mission: null,
    coinsCollected: 0,
    jumpsDone: 0,
    laneChangesDone: 0,
    checkpointsPassed: 0,
    gapsCleared: 0,
    obstaclesPassed: 0,
    coinTrailsDone: 0,
    movingPlatformsCrossed: 0,
    bridgesCrossed: 0,
    collisionsCount: 0,
    isMissionComplete: false,
    finishGateReached: false,
    finishGateZ: 0,
  };

  // Balanced Running Speeds (Strictly 30-40 normal range, 35 base, 50 absolute max)
  public speed = BASE_SPEED;
  public distance = 0;
  public coins = 0;
  public gems = 0;
  public score = 0;
  public multiplier = 1;
  public activePowerUps: Map<string, ActivePowerUp> = new Map();
  private lastCheckpointMeters = 0;

  // Throttled UI Updates
  private hudUpdateTimer = 0;

  // Visual Effects & Pickup Particles
  private pickupRingGeom = new THREE.RingGeometry(0.35, 0.55, 16);
  private activeFX: Array<{ mesh: THREE.Mesh; life: number; maxLife: number }> = [];

  // Mobile Swipe Gesture Recognition
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private touchContainer: HTMLElement | null = null;

  // Animation & Time
  private clock = new THREE.Clock();
  private animTime = 0;
  private cameraShake = 0;
  private frameId: number | null = null;
  private isRunningLoop = false;

  // Callbacks to React UI
  public onScoreUpdate?: (score: GameScore) => void;
  public onPowerUpsUpdate?: (powerups: ActivePowerUp[]) => void;
  public onGameOver?: (finalScore: GameScore) => void;
  public onStateChange?: (state: GameState) => void;
  public onCheckpointReached?: (meters: number) => void;
  public onLevelProgressUpdate?: (progress: LevelProgressState) => void;
  public onLevelComplete?: (result: { levelNumber: number; coins: number; score: number }) => void;

  constructor(canvasContainer: HTMLElement, initialSkin: CharacterSkin) {
    // 1. Software WebGL Guard
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 2. High-performance renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = canvasContainer.clientWidth || window.innerWidth;
    const height = canvasContainer.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
    canvasContainer.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 320);

    // 4. Studio Environment Lighting
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Directional Sunlight
    this.dirLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    this.dirLight.position.set(25, 45, 20);
    this.dirLight.castShadow = !this.isSoftwareGl;
    if (this.dirLight.shadow) {
      this.dirLight.shadow.mapSize.width = 1024;
      this.dirLight.shadow.mapSize.height = 1024;
      this.dirLight.shadow.camera.near = 0.5;
      this.dirLight.shadow.camera.far = 120;
      const d = 16;
      this.dirLight.shadow.camera.left = -d;
      this.dirLight.shadow.camera.right = d;
      this.dirLight.shadow.camera.top = d;
      this.dirLight.shadow.camera.bottom = -d;
      this.dirLight.shadow.bias = -0.0005;
      this.dirLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.dirLight);

    // Sky/Ground ambient fill light
    this.hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x166534, 0.85);
    this.scene.add(this.hemiLight);

    // 5. Systems Initialization
    this.envBuilder = new EnvironmentBuilder();
    this.obstaclePool = new ObstaclePool();
    this.character = new CharacterModel(initialSkin);
    this.character.group.position.set(0, 0, 0);
    this.scene.add(this.character.group);

    // 6. Particle Systems
    this.setupRainParticles();
    this.setupLeafParticles();

    // Set initial cartoon theme
    this.updateAtmosphere('LUSH_FOREST');

    // 7. Initial Chunks
    this.resetWorld();

    // Setup input listeners
    this.bindInputs();
    this.setupSwipeControls(canvasContainer);

    // Start loop
    this.startLoop();
  }

  // Update Atmosphere, Fog, and Lighting for Cartoon Themes
  private updateAtmosphere(theme: EnvironmentTheme) {
    this.currentTheme = theme;
    if (theme === 'LUSH_FOREST') {
      this.scene.background = new THREE.Color(0x7dd3fc); // bright sunny blue sky
      this.scene.fog = new THREE.FogExp2(0xbbe8fc, 0.008); // soft atmospheric horizon
      this.dirLight.color.set(0xfff7ed); // warm sunlight
      this.dirLight.intensity = 2.2;
      this.hemiLight.color.set(0xe0f2fe);
      this.hemiLight.groundColor.set(0x15803d);
      if (this.rainParticles) this.rainParticles.visible = false;
      if (this.forestLeafParticles) this.forestLeafParticles.visible = true;
    } else if (theme === 'RIVER_CROSSING') {
      this.scene.background = new THREE.Color(0x7dd3fc);
      this.scene.fog = new THREE.FogExp2(0x7dd3fc, 0.011);
      this.dirLight.color.set(0xfffae0);
      this.dirLight.intensity = 2.2;
      this.hemiLight.color.set(0xbae6fd);
      this.hemiLight.groundColor.set(0x0e7490);
      if (this.rainParticles) this.rainParticles.visible = false;
      if (this.forestLeafParticles) this.forestLeafParticles.visible = true;
    } else if (theme === 'MONSOON_RAIN') {
      this.scene.background = new THREE.Color(0x475569);
      this.scene.fog = new THREE.FogExp2(0x475569, 0.018);
      this.dirLight.color.set(0x94a3b8);
      this.dirLight.intensity = 1.4;
      this.hemiLight.color.set(0x64748b);
      this.hemiLight.groundColor.set(0x1e293b);
      if (this.rainParticles) this.rainParticles.visible = true;
      if (this.forestLeafParticles) this.forestLeafParticles.visible = false;
    } else if (theme === 'MOUNTAIN_BRIDGE') {
      this.scene.background = new THREE.Color(0x38bdf8);
      this.scene.fog = new THREE.FogExp2(0x38bdf8, 0.01);
      this.dirLight.color.set(0xffffff);
      this.dirLight.intensity = 2.4;
      this.hemiLight.color.set(0xe0f2fe);
      this.hemiLight.groundColor.set(0x1e3a5f);
      if (this.rainParticles) this.rainParticles.visible = false;
      if (this.forestLeafParticles) this.forestLeafParticles.visible = false;
    } else {
      this.scene.background = new THREE.Color(0xfdba74);
      this.scene.fog = new THREE.FogExp2(0xfdba74, 0.012);
      this.dirLight.color.set(0xffedd5);
      this.dirLight.intensity = 2.0;
      this.hemiLight.color.set(0xfed7aa);
      this.hemiLight.groundColor.set(0x1e293b);
      if (this.rainParticles) this.rainParticles.visible = false;
      if (this.forestLeafParticles) this.forestLeafParticles.visible = false;
    }
  }

  private setupRainParticles() {
    const rainCount = 650;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 1] = Math.random() * 26;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 65;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.22,
      transparent: true,
      opacity: 0.75,
    });

    this.rainParticles = new THREE.Points(geom, mat);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
  }

  private setupLeafParticles() {
    const leafCount = 75;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(leafCount * 3);

    for (let i = 0; i < leafCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = 0.5 + Math.random() * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 45;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x86efac,
      size: 0.35,
      transparent: true,
      opacity: 0.85,
    });

    this.forestLeafParticles = new THREE.Points(geom, mat);
    this.forestLeafParticles.visible = true;
    this.scene.add(this.forestLeafParticles);
  }

  public setGraphicsQuality(quality: GraphicsQuality) {
    this.graphicsQuality = quality;
    if (quality === 'LOW') {
      this.renderer.setPixelRatio(1.0);
      this.renderer.shadowMap.enabled = false;
    } else if (quality === 'MEDIUM') {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      this.renderer.shadowMap.enabled = !this.isSoftwareGl;
      if (this.dirLight.shadow) {
        this.dirLight.shadow.mapSize.set(512, 512);
      }
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
      this.renderer.shadowMap.enabled = !this.isSoftwareGl;
      if (this.dirLight.shadow) {
        this.dirLight.shadow.mapSize.set(1024, 1024);
      }
    }
  }

  // ==========================================
  // INPUT HANDLING & STRICT NON-REVERSED CONTROLS
  // ==========================================
  // Direction: -1 = LEFT (towards -X), 1 = RIGHT (towards +X)
  public changeLane(direction: -1 | 1) {
    if (this.state !== 'PLAYING') return;

    const prevLane = this.targetLane;
    const nextLane = Math.max(-1, Math.min(1, this.targetLane + direction)) as -1 | 0 | 1;

    if (nextLane !== prevLane) {
      this.targetLane = nextLane;
      sounds.playLaneChange();

      if (this.gameMode === 'LEVEL') {
        this.levelProgress.laneChangesDone += 1;
        this.checkMissionStatus();
      }
    }
  }

  // JUMP PHYSICS (Strictly prevented while airborne to prevent infinite jump)
  public jump() {
    if (this.state !== 'PLAYING') return;
    if (this.isGrounded && this.movementState !== 'JUMPING' && this.movementState !== 'FALLING') {
      this.velocityY = JUMP_VELOCITY;
      this.isGrounded = false;
      this.isSliding = false;
      this.movementState = 'JUMPING';
      sounds.playJump();

      if (this.gameMode === 'LEVEL') {
        this.levelProgress.jumpsDone += 1;
        this.checkMissionStatus();
      }
    }
  }

  // SLIDE UNDER LOW BARRIERS
  public slide() {
    if (this.state !== 'PLAYING') return;
    if (!this.isGrounded) {
      // Mid-air fast descent
      this.velocityY = Math.min(this.velocityY, -16);
    } else {
      this.movementState = 'SLIDING';
    }
    this.isSliding = true;
    this.slideTimer = SLIDE_DURATION;
    sounds.playSlide();
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;

    if (this.state === 'TITLE') {
      if (e.code === 'Space' || e.code === 'Enter') {
        this.startGame();
      }
      return;
    }

    if (e.code === 'Escape' || e.code === 'KeyP') {
      this.togglePause();
      return;
    }

    if (this.state !== 'PLAYING') return;

    if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
      this.changeLane(-1);
    } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
      this.changeLane(1);
    } else if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
      this.jump();
    } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
      this.slide();
    }
  };

  private bindInputs() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  private handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.touchStartTime = performance.now();
    }
  };

  private handleTouchEnd = (e: TouchEvent) => {
    if (this.state !== 'PLAYING') return;
    if (e.changedTouches.length === 0) return;
    const dx = e.changedTouches[0].clientX - this.touchStartX;
    const dy = e.changedTouches[0].clientY - this.touchStartY;
    const dt = performance.now() - this.touchStartTime;

    if (dt > 600) return; // Ignore long holds
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (Math.max(absDx, absDy) < 25) return; // Ignore micro-taps

    if (absDx > absDy) {
      if (dx < -30) this.changeLane(-1);
      else if (dx > 30) this.changeLane(1);
    } else {
      if (dy < -30) this.jump();
      else if (dy > 30) this.slide();
    }
  };

  private setupSwipeControls(container: HTMLElement) {
    this.touchContainer = container;
    container.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    container.addEventListener('touchend', this.handleTouchEnd, { passive: true });
  }

  private spawnPickupFX(x: number, y: number, z: number, colorHex: number) {
    const mat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(this.pickupRingGeom, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.x = -Math.PI / 2;
    this.scene.add(mesh);
    this.activeFX.push({ mesh, life: 0, maxLife: 0.32 });
  }

  // ==========================================
  // GAME LIFECYCLE
  // ==========================================
  // 1. Endless Mode Launch
  public startGame() {
    this.gameMode = 'ENDLESS';
    this.currentLevelMission = null;
    this.hasRevivedThisRun = false;
    this.finishGateSpawned = false;
    this.wasOverGap = false;
    this.coinTrailsTracked.clear();

    this.levelProgress = {
      currentLevel: 1,
      isLevelMode: false,
      mission: null,
      coinsCollected: 0,
      jumpsDone: 0,
      laneChangesDone: 0,
      checkpointsPassed: 0,
      gapsCleared: 0,
      obstaclesPassed: 0,
      coinTrailsDone: 0,
      movingPlatformsCrossed: 0,
      bridgesCrossed: 0,
      collisionsCount: 0,
      isMissionComplete: false,
      finishGateReached: false,
      finishGateZ: 0,
    };

    this.resetWorld();
    this.state = 'PLAYING';
    this.onStateChange?.('PLAYING');
    sounds.startMusic();
    this.dispatchHUDUpdate();
  }

  // 2. Specific Level Mode Launch (Levels 1 to 50)
  public startLevel(mission: LevelMission) {
    this.gameMode = 'LEVEL';
    this.currentLevelMission = mission;
    this.hasRevivedThisRun = false;
    this.finishGateSpawned = false;
    this.wasOverGap = false;
    this.coinTrailsTracked.clear();

    this.levelProgress = {
      currentLevel: mission.levelNumber,
      isLevelMode: true,
      mission,
      coinsCollected: 0,
      jumpsDone: 0,
      laneChangesDone: 0,
      checkpointsPassed: 0,
      gapsCleared: 0,
      obstaclesPassed: 0,
      coinTrailsDone: 0,
      movingPlatformsCrossed: 0,
      bridgesCrossed: 0,
      collisionsCount: 0,
      timeRemaining: mission.timeLimit,
      isMissionComplete: false,
      finishGateReached: false,
      finishGateZ: -mission.targetDistance,
      remainingMessage: undefined,
    };

    this.difficulty = mission.difficulty;
    this.resetWorld();
    this.state = 'PLAYING';
    this.onStateChange?.('PLAYING');
    sounds.startMusic();
    this.dispatchHUDUpdate();
  }

  // 3. Revive Character (One per run, safe checkpoint/rooftop resume, invulnerability)
  public revive(): boolean {
    if (this.hasRevivedThisRun) return false;
    this.hasRevivedThisRun = true;

    // Calculate safe revival Z position
    const currentZ = this.character.group.position.z;
    let safeZ = Math.min(-6, currentZ + 18);
    if (this.lastCheckpointMeters > 0) {
      safeZ = -this.lastCheckpointMeters;
    }

    this.targetLane = 0;
    this.currentX = 0;
    this.playerY = 0;
    this.velocityY = 0;
    this.isGrounded = true;
    this.isSliding = false;
    this.slideTimer = 0;
    this.movementState = 'RUNNING';
    this.character.group.position.set(0, 0, safeZ);
    this.character.group.rotation.set(0, 0, 0);

    // 2.2 seconds invulnerability with flashing indicator
    this.isInvulnerable = true;
    this.invulnerableTimer = 2.2;
    this.hasPlayedFallSound = false;

    // Clear any obstacles in immediate 14m range so player is completely safe
    for (const chunk of this.chunks) {
      for (const obs of chunk.data.obstacles) {
        if (Math.abs(obs.z - safeZ) < 14) {
          obs.cleared = true;
          const mesh = chunk.obstacleMeshes.get(obs.id);
          if (mesh) mesh.visible = false;
        }
      }
    }

    this.camera.position.set(0, 3.8, safeZ + 7.5);
    this.camera.lookAt(0, 1.6, safeZ - 9.0);

    this.state = 'PLAYING';
    this.onStateChange?.('PLAYING');
    sounds.startMusic();
    sounds.playShieldBreak();
    this.dispatchHUDUpdate();
    return true;
  }

  // 4. Mission Evaluation Logic
  public checkMissionStatus() {
    if (this.gameMode !== 'LEVEL' || !this.currentLevelMission) return;
    const m = this.currentLevelMission;
    let complete = true;

    if (m.reqCoins && this.levelProgress.coinsCollected < m.reqCoins) complete = false;
    if (m.reqJumps && this.levelProgress.jumpsDone < m.reqJumps) complete = false;
    if (m.reqLaneChanges && this.levelProgress.laneChangesDone < m.reqLaneChanges) complete = false;
    if (m.reqCheckpoints && this.levelProgress.checkpointsPassed < m.reqCheckpoints) complete = false;
    if (m.reqGaps && this.levelProgress.gapsCleared < m.reqGaps) complete = false;
    if (m.reqObstaclesPassed && this.levelProgress.obstaclesPassed < m.reqObstaclesPassed) complete = false;
    if (m.reqCoinTrails && this.levelProgress.coinTrailsDone < m.reqCoinTrails) complete = false;
    if (m.reqMovingPlatforms && this.levelProgress.movingPlatformsCrossed < m.reqMovingPlatforms) complete = false;
    if (m.reqBridges && this.levelProgress.bridgesCrossed < m.reqBridges) complete = false;
    if (m.noCollisions && this.levelProgress.collisionsCount > 0) complete = false;
    if (m.timeLimit && (this.levelProgress.timeRemaining ?? 0) <= 0) complete = false;

    this.levelProgress.isMissionComplete = complete;
  }

  public getRemainingMissionText(): string {
    if (!this.currentLevelMission) return '';
    const m = this.currentLevelMission;
    const parts: string[] = [];

    if (m.reqCoins && this.levelProgress.coinsCollected < m.reqCoins) {
      parts.push(`${m.reqCoins - this.levelProgress.coinsCollected} more coin${m.reqCoins - this.levelProgress.coinsCollected > 1 ? 's' : ''}`);
    }
    if (m.reqJumps && this.levelProgress.jumpsDone < m.reqJumps) {
      parts.push(`${m.reqJumps - this.levelProgress.jumpsDone} more jump${m.reqJumps - this.levelProgress.jumpsDone > 1 ? 's' : ''}`);
    }
    if (m.reqLaneChanges && this.levelProgress.laneChangesDone < m.reqLaneChanges) {
      parts.push(`${m.reqLaneChanges - this.levelProgress.laneChangesDone} more lane change${m.reqLaneChanges - this.levelProgress.laneChangesDone > 1 ? 's' : ''}`);
    }
    if (m.reqCheckpoints && this.levelProgress.checkpointsPassed < m.reqCheckpoints) {
      parts.push(`${m.reqCheckpoints - this.levelProgress.checkpointsPassed} checkpoint${m.reqCheckpoints - this.levelProgress.checkpointsPassed > 1 ? 's' : ''}`);
    }
    if (m.reqGaps && this.levelProgress.gapsCleared < m.reqGaps) {
      parts.push(`${m.reqGaps - this.levelProgress.gapsCleared} gap leap${m.reqGaps - this.levelProgress.gapsCleared > 1 ? 's' : ''}`);
    }
    if (m.reqObstaclesPassed && this.levelProgress.obstaclesPassed < m.reqObstaclesPassed) {
      parts.push(`${m.reqObstaclesPassed - this.levelProgress.obstaclesPassed} more obstacle${m.reqObstaclesPassed - this.levelProgress.obstaclesPassed > 1 ? 's' : ''} to pass`);
    }
    if (m.reqCoinTrails && this.levelProgress.coinTrailsDone < m.reqCoinTrails) {
      parts.push(`${m.reqCoinTrails - this.levelProgress.coinTrailsDone} coin trail${m.reqCoinTrails - this.levelProgress.coinTrailsDone > 1 ? 's' : ''}`);
    }
    if (m.noCollisions && this.levelProgress.collisionsCount > 0) {
      parts.push('Clean run failed (collided with obstacle)');
    }

    if (parts.length > 0) {
      return `Mission not complete: Need ${parts.join(', ')}!`;
    }
    return '';
  }

  public togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.onStateChange?.('PAUSED');
      sounds.stopMusic();
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.onStateChange?.('PLAYING');
      sounds.startMusic();
    }
  }

  public restartGame() {
    if (this.gameMode === 'LEVEL' && this.currentLevelMission) {
      this.startLevel(this.currentLevelMission);
    } else {
      this.startGame();
    }
  }

  public returnToTitle() {
    this.gameMode = 'ENDLESS';
    this.currentLevelMission = null;
    this.levelProgress.isLevelMode = false;
    this.resetWorld();
    this.state = 'TITLE';
    this.onStateChange?.('TITLE');
    sounds.stopMusic();
  }

  public setSkin(skin: CharacterSkin) {
    this.character.applySkin(skin);
  }

  public setDifficulty(diff: Difficulty) {
    this.difficulty = diff;
    const setting = DIFFICULTY_SETTINGS[diff];
    const cap = diff === 'HARD' ? HARD_MAX_SPEED : NORMAL_MAX_SPEED;
    this.speed = Math.min(
      ABSOLUTE_HARD_SPEED_LIMIT,
      Math.max(MIN_SPEED, Math.min(cap, BASE_SPEED * setting.speedMultiplier))
    );
  }

  // GAP CHECK HELPER
  public checkIfOverGap(playerZ: number): boolean {
    for (const chunk of this.chunks) {
      if (chunk.data.gaps) {
        for (const gap of chunk.data.gaps) {
          // In world coordinates, z is negative; player travels toward -Z
          if (playerZ <= gap.zStart && playerZ >= gap.zEnd) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Reset World State
  private resetWorld() {
    for (const chunk of this.chunks) {
      this.scene.remove(chunk.mesh);
      this.scene.remove(chunk.sceneryMesh);
      for (const m of chunk.obstacleMeshes.values()) this.scene.remove(m);
      for (const m of chunk.collectibleMeshes.values()) this.scene.remove(m);
      this.envBuilder.cleanupMesh(chunk.sceneryMesh);
    }
    this.chunks = [];
    this.nextChunkZ = 8;
    this.chunkCounter = 0;

    // Reset player
    this.targetLane = 0;
    this.currentX = 0;
    this.playerY = 0;
    this.velocityY = 0;
    this.isGrounded = true;
    this.isSliding = false;
    this.slideTimer = 0;
    this.landingTimer = 0;
    this.movementState = 'RUNNING';
    this.isInvulnerable = false;
    this.invulnerableTimer = 0;
    this.hasPlayedFallSound = false;

    this.character.group.position.set(0, 0, 0);
    this.character.group.rotation.set(0, 0, 0);

    const diff = DIFFICULTY_SETTINGS[this.difficulty];
    const cap = this.difficulty === 'HARD' ? HARD_MAX_SPEED : NORMAL_MAX_SPEED;
    this.speed = Math.min(
      ABSOLUTE_HARD_SPEED_LIMIT,
      Math.max(MIN_SPEED, Math.min(cap, BASE_SPEED * diff.speedMultiplier))
    );
    this.distance = 0;
    this.coins = 0;
    this.gems = 0;
    this.score = 0;
    this.multiplier = 1;
    this.lastCheckpointMeters = 0;
    this.hudUpdateTimer = 0;
    this.activePowerUps.clear();
    this.cameraShake = 0;

    if (this.gameMode === 'LEVEL' && this.currentLevelMission) {
      this.updateAtmosphere(this.currentLevelMission.theme);
    } else {
      this.updateAtmosphere('LUSH_FOREST');
    }

    // Spawn initial chunks
    this.spawnChunk(true);
    for (let i = 1; i < VISIBLE_CHUNKS; i++) {
      this.spawnChunk(false);
    }
  }

  // ==========================================
  // PROCEDURAL ENDLESS CHUNK GENERATOR (WITH REAL GAPS)
  // ==========================================
  private spawnChunk(isStartingSafeChunk: boolean) {
    const chunkLength = CHUNK_LENGTH;
    const zStart = this.nextChunkZ;
    const zEnd = zStart - chunkLength;
    this.nextChunkZ = zEnd;

    // Determine Theme based on distance or active level mission
    let theme: EnvironmentTheme = 'LUSH_FOREST';
    const isLevelMode = this.gameMode === 'LEVEL' && this.currentLevelMission !== null;
    const mission = this.currentLevelMission;
    const dist = Math.abs(zStart);

    if (isLevelMode && mission) {
      theme = mission.theme;
    } else {
      if (dist < 260) {
        theme = 'LUSH_FOREST';
      } else if (dist < 560) {
        theme = 'RIVER_CROSSING';
      } else if (dist < 920) {
        theme = 'MONSOON_RAIN';
      } else if (dist < 1320) {
        theme = 'MOUNTAIN_BRIDGE';
      } else {
        const cycle = Math.floor(dist / 320) % 4;
        const themes: EnvironmentTheme[] = ['LUSH_FOREST', 'RIVER_CROSSING', 'MONSOON_RAIN', 'MOUNTAIN_BRIDGE'];
        theme = themes[cycle];
      }
    }

    if (theme !== this.currentTheme) {
      this.updateAtmosphere(theme);
    }

    const obstacles: ObstacleData[] = [];
    const collectibles: CollectibleData[] = [];
    const gaps: PlatformGap[] = [];

    // CHECKERED FINISH GATE (For Level Mode)
    const finishZ = isLevelMode && mission ? -mission.targetDistance : -999999;
    if (isLevelMode && !this.finishGateSpawned && zStart >= finishZ && zEnd <= finishZ) {
      this.finishGateSpawned = true;
      obstacles.push({
        id: ++this.chunkCounter,
        type: 'FINISH_GATE',
        lane: 0,
        z: finishZ,
        width: LANE_WIDTH * 3.4,
        height: 4.8,
        depth: 1.5,
      });

      // Celebration victory coins right after finish gate
      collectibles.push(
        { id: ++this.chunkCounter, type: 'COIN', lane: -1, z: finishZ - 4, y: 1.0 },
        { id: ++this.chunkCounter, type: 'COIN', lane: 0, z: finishZ - 4, y: 1.2 },
        { id: ++this.chunkCounter, type: 'COIN', lane: 1, z: finishZ - 4, y: 1.0 },
        { id: ++this.chunkCounter, type: 'GEM', lane: 0, z: finishZ - 8, y: 1.2 }
      );
    }

    // GAP GENERATION: Check if chunk has a bridge gap to leap across
    const isGapMission = isLevelMode && (mission?.reqGaps !== undefined || mission?.category === 'GAPS');
    const hasGap = !isStartingSafeChunk && dist > 50 && (isGapMission ? Math.random() < 0.6 : (dist > 70 && Math.random() < 0.35));
    let gapStart = 0;
    let gapEnd = 0;

    // Do not place gap directly overlapping the finish gate
    if (hasGap && (!isLevelMode || Math.abs(zStart - finishZ) > 22)) {
      const gapWidth = 6.8;
      const gapCenter = zStart - chunkLength * 0.55;
      gapStart = gapCenter + gapWidth / 2;
      gapEnd = gapCenter - gapWidth / 2;
      gaps.push({ zStart: gapStart, zEnd: gapEnd, width: gapWidth });

      // Arc of 5 golden coins floating across the gap to guide the leap
      collectibles.push(
        { id: ++this.chunkCounter, type: 'COIN', lane: 0, z: gapStart + 2.0, y: 0.8 },
        { id: ++this.chunkCounter, type: 'COIN', lane: 0, z: gapStart + 0.6, y: 1.6 },
        { id: ++this.chunkCounter, type: 'COIN', lane: 0, z: gapCenter, y: 2.3 },
        { id: ++this.chunkCounter, type: 'COIN', lane: 0, z: gapEnd - 0.6, y: 1.6 },
        { id: ++this.chunkCounter, type: 'COIN', lane: 0, z: gapEnd - 2.0, y: 0.8 },
        { id: ++this.chunkCounter, type: 'GEM', lane: 0, z: gapEnd - 4.5, y: 0.8 }
      );
    }

    // Checkpoint arch interval (every 80m for checkpoint missions, every 240m otherwise)
    const checkpointStep = isLevelMode && mission?.category === 'CHECKPOINTS' ? 80 : 240;
    const currentMeters = Math.floor(dist);
    if (currentMeters - this.lastCheckpointMeters >= checkpointStep && !isStartingSafeChunk && !hasGap) {
      if (!isLevelMode || Math.abs(zStart - 12 - finishZ) > 16) {
        this.lastCheckpointMeters = currentMeters;
        obstacles.push({
          id: ++this.chunkCounter,
          type: 'CHECKPOINT_ARCH',
          lane: 0,
          z: zStart - 12,
          width: LANE_WIDTH * 3,
          height: 3.8,
          depth: 0.8,
        });

        collectibles.push(
          { id: ++this.chunkCounter, type: 'COIN', lane: -1, z: zStart - 12, y: 1.0 },
          { id: ++this.chunkCounter, type: 'COIN', lane: 0, z: zStart - 12, y: 1.2 },
          { id: ++this.chunkCounter, type: 'COIN', lane: 1, z: zStart - 12, y: 1.0 }
        );
      }
    }

    // Level 8 Designated Coin Trails
    if (isLevelMode && mission?.category === 'COIN_TRAILS') {
      const trailIndex = Math.min(3, Math.floor(dist / 65) + 1);
      if (trailIndex >= 1 && trailIndex <= 3 && !hasGap) {
        const trailLane = (trailIndex % 3 - 1) as -1 | 0 | 1;
        const trailStartZ = zStart - 18;
        for (let i = 0; i < 6; i++) {
          collectibles.push({
            id: ++this.chunkCounter,
            type: 'COIN',
            lane: trailLane,
            z: trailStartZ - i * 3.2,
            y: 0.6,
            trailGroup: trailIndex,
          });
        }
      }
    }

    if (!isStartingSafeChunk) {
      // Spawn obstacles ensuring fair approach spacing (never blocking the gap zone)
      const diffMultiplier = DIFFICULTY_SETTINGS[this.difficulty].obstacleDensity;
      const numObstacleSets = diffMultiplier < 0.8 || hasGap ? 1 : 2;
      const sectionStep = chunkLength / (numObstacleSets + 1);

      for (let s = 1; s <= numObstacleSets; s++) {
        const obsZ = zStart - s * sectionStep;

        // Skip obstacle if it would interfere with approach to or landing from gap
        if (hasGap && obsZ < gapStart + 8 && obsZ > gapEnd - 8) {
          continue;
        }

        // Keep finish gate approach completely open and majestic
        if (isLevelMode && Math.abs(obsZ - finishZ) < 16) {
          continue;
        }

        const randPattern = Math.random();

        if (randPattern < 0.34) {
          // Low hurdle with a 5-coin jump arc over it
          const lane = (Math.floor(Math.random() * 3) - 1) as -1 | 0 | 1;
          obstacles.push({
            id: ++this.chunkCounter,
            type: 'BARRIER_LOW',
            lane,
            z: obsZ,
            width: LANE_WIDTH,
            height: 0.8,
            depth: 0.4,
          });

          // Guided 5-coin jump arc over the hurdle
          collectibles.push(
            { id: ++this.chunkCounter, type: 'COIN', lane, z: obsZ + 2.6, y: 0.6 },
            { id: ++this.chunkCounter, type: 'COIN', lane, z: obsZ + 1.3, y: 1.5 },
            { id: ++this.chunkCounter, type: 'COIN', lane, z: obsZ, y: 2.3 },
            { id: ++this.chunkCounter, type: 'COIN', lane, z: obsZ - 1.3, y: 1.5 },
            { id: ++this.chunkCounter, type: 'COIN', lane, z: obsZ - 2.6, y: 0.6 }
          );

          // Clear ground coins in an adjacent open lane
          const altLane = (lane === 0 ? (Math.random() > 0.5 ? 1 : -1) : 0) as -1 | 0 | 1;
          collectibles.push(
            { id: ++this.chunkCounter, type: 'COIN', lane: altLane, z: obsZ + 1.5, y: 0.6 },
            { id: ++this.chunkCounter, type: 'COIN', lane: altLane, z: obsZ - 1.5, y: 0.6 }
          );
        } else if (randPattern < 0.60) {
          // Overhead slide barrier with low slide coins underneath
          const lane = (Math.floor(Math.random() * 3) - 1) as -1 | 0 | 1;
          obstacles.push({
            id: ++this.chunkCounter,
            type: 'BARRIER_HIGH',
            lane,
            z: obsZ,
            width: LANE_WIDTH,
            height: 1.0,
            depth: 0.4,
          });

          collectibles.push(
            { id: ++this.chunkCounter, type: 'COIN', lane, z: obsZ + 2.0, y: 0.35 },
            { id: ++this.chunkCounter, type: 'COIN', lane, z: obsZ, y: 0.35 },
            { id: ++this.chunkCounter, type: 'COIN', lane, z: obsZ - 2.0, y: 0.35 }
          );
        } else if (randPattern < 0.84) {
          // Single lane block with diagonal coin trail guiding player to open lane
          const blockedLane = (Math.floor(Math.random() * 3) - 1) as -1 | 0 | 1;
          obstacles.push({
            id: ++this.chunkCounter,
            type: 'FALLEN_LOG',
            lane: blockedLane,
            z: obsZ,
            width: 1.6,
            height: 1.5,
            depth: 1.5,
          });

          const openLane = (blockedLane === 0 ? (Math.random() > 0.5 ? 1 : -1) : 0) as -1 | 0 | 1;
          collectibles.push(
            { id: ++this.chunkCounter, type: 'COIN', lane: blockedLane, z: obsZ + 4.5, y: 0.6 },
            { id: ++this.chunkCounter, type: 'COIN', lane: openLane, z: obsZ + 1.5, y: 0.6 },
            { id: ++this.chunkCounter, type: 'COIN', lane: openLane, z: obsZ - 1.5, y: 0.6 },
            { id: ++this.chunkCounter, type: 'COIN', lane: openLane, z: obsZ - 4.5, y: 0.6 }
          );
        } else {
          // Swinging log in center with side lanes wide open and coin trails
          obstacles.push({
            id: ++this.chunkCounter,
            type: 'SWINGING_LOG',
            lane: 0,
            z: obsZ,
            width: 1.8,
            height: 1.2,
            depth: 0.8,
          });

          const sideLane = Math.random() > 0.5 ? 1 : -1;
          collectibles.push(
            { id: ++this.chunkCounter, type: 'COIN', lane: sideLane, z: obsZ + 2.5, y: 0.6 },
            { id: ++this.chunkCounter, type: 'COIN', lane: sideLane, z: obsZ, y: 0.6 },
            { id: ++this.chunkCounter, type: 'COIN', lane: sideLane, z: obsZ - 2.5, y: 0.6 }
          );
        }
      }

      // Rare Power-up or Emerald Gem
      const powerupRoll = Math.random();
      const pLane = (Math.floor(Math.random() * 3) - 1) as -1 | 0 | 1;
      const pZ = zStart - chunkLength * 0.25;

      if (!hasGap || Math.abs(pZ - gapStart) > 8) {
        if (powerupRoll < 0.12) {
          collectibles.push({ id: ++this.chunkCounter, type: 'POWERUP_SHIELD', lane: pLane, z: pZ, y: 0.9 });
        } else if (powerupRoll < 0.24) {
          collectibles.push({ id: ++this.chunkCounter, type: 'POWERUP_MAGNET', lane: pLane, z: pZ, y: 0.9 });
        } else if (powerupRoll < 0.35) {
          collectibles.push({ id: ++this.chunkCounter, type: 'POWERUP_MULTIPLIER', lane: pLane, z: pZ, y: 0.9 });
        } else if (powerupRoll < 0.55) {
          collectibles.push({ id: ++this.chunkCounter, type: 'GEM', lane: pLane, z: pZ, y: 0.8 });
        }
      }
    }

    // Build 3D meshes with real physical gap openings
    const localGaps = gaps.map((g) => ({
      localStart: g.zStart - (zStart + zEnd) / 2,
      localEnd: g.zEnd - (zStart + zEnd) / 2,
    }));

    const pathMesh = this.envBuilder.createPathMesh(theme, chunkLength, localGaps);
    pathMesh.position.set(0, 0, (zStart + zEnd) / 2);
    this.scene.add(pathMesh);

    const sceneryMesh = this.envBuilder.populateScenery(theme, chunkLength, this.graphicsQuality);
    sceneryMesh.position.set(0, 0, (zStart + zEnd) / 2);
    this.scene.add(sceneryMesh);

    const obstacleMeshes = new Map<number, THREE.Group>();
    for (const obs of obstacles) {
      const mesh = this.obstaclePool.createObstacleMesh(obs, theme);
      this.scene.add(mesh);
      obstacleMeshes.set(obs.id, mesh);
    }

    const collectibleMeshes = new Map<number, THREE.Group>();
    for (const col of collectibles) {
      const mesh = this.obstaclePool.createCollectibleMesh(col);
      this.scene.add(mesh);
      collectibleMeshes.set(col.id, mesh);
    }

    const chunkData: ChunkSection = {
      id: ++this.chunkCounter,
      theme,
      zStart,
      zEnd,
      length: chunkLength,
      gaps,
      obstacles,
      collectibles,
    };

    this.chunks.push({
      data: chunkData,
      mesh: pathMesh,
      sceneryMesh,
      obstacleMeshes,
      collectibleMeshes,
    });
  }

  // Cleanup chunks behind player
  private cleanupChunks(playerZ: number) {
    while (this.chunks.length > 0 && this.chunks[0].data.zEnd > playerZ + 30) {
      const old = this.chunks.shift()!;
      this.scene.remove(old.mesh);
      this.scene.remove(old.sceneryMesh);
      for (const m of old.obstacleMeshes.values()) this.scene.remove(m);
      for (const m of old.collectibleMeshes.values()) this.scene.remove(m);
      this.envBuilder.cleanupMesh(old.sceneryMesh);
    }

    while (this.chunks.length < VISIBLE_CHUNKS) {
      this.spawnChunk(false);
    }
  }

  // Dispatch HUD State Update to React
  private dispatchHUDUpdate() {
    this.onScoreUpdate?.({
      distance: Math.floor(this.distance),
      coins: this.coins,
      gems: this.gems,
      score: Math.floor(this.score),
      multiplier: this.multiplier,
      speed: Math.round(this.speed * 10) / 10,
    });
    this.onPowerUpsUpdate?.(Array.from(this.activePowerUps.values()));
    if (this.gameMode === 'LEVEL') {
      this.onLevelProgressUpdate?.({ ...this.levelProgress });
    }
  }

  // ==========================================
  // TICK / 60FPS SIMULATION LOOP
  // ==========================================
  private startLoop() {
    if (this.isRunningLoop) return;
    this.isRunningLoop = true;
    this.clock.start();

    const tick = () => {
      if (!this.isRunningLoop) return;

      const rawDt = this.clock.getDelta();
      const dt = Math.min(rawDt, 0.05);

      if (this.state === 'PAUSED') {
        this.render();
        this.frameId = requestAnimationFrame(tick);
        return;
      }

      this.animTime += dt;
      this.envBuilder.updateAnimations(this.animTime, dt);

      if (this.state === 'PLAYING') {
        this.updateGame(dt);
      } else if (this.state === 'TITLE') {
        this.updateTitleScreen(dt);
      }

      this.render();

      this.frameId = requestAnimationFrame(tick);
    };

    this.frameId = requestAnimationFrame(tick);
  }

  // Title Screen Live Preview
  private updateTitleScreen(dt: number) {
    this.animTime += dt;
    this.character.animateIdle(this.animTime);
    this.character.group.position.set(0, 0, 0);

    // Hero faces forward towards the camera with a subtle natural idle sway
    this.character.group.rotation.set(0, Math.PI + Math.sin(this.animTime * 0.7) * 0.06, 0);

    // Centered camera framing: hero is positioned clearly between upper title and bottom dock
    // Head, snapback cap, jacket/shirt, dark pants, and sneakers are all clearly visible
    const camSwayX = Math.sin(this.animTime * 0.3) * 0.15;
    const camY = 1.25 + Math.sin(this.animTime * 0.4) * 0.03;
    const camRadius = 4.1;

    this.camera.position.set(camSwayX, camY, camRadius);
    this.camera.lookAt(0, 0.92, -1.2);

    // Subtle atmospheric falling leaves during title screen
    if (this.forestLeafParticles && this.forestLeafParticles.visible) {
      this.forestLeafParticles.position.set(0, 0, 0);
      const posAttr = this.forestLeafParticles.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) - 3.2 * dt;
        let x = posAttr.getX(i) + Math.sin(this.animTime * 2 + i) * 0.03;
        if (y < 0.2) y = 14;
        posAttr.setY(i, y);
        posAttr.setX(i, x);
      }
      posAttr.needsUpdate = true;
    }
  }

  // Main Running Gameplay Update
  private updateGame(dt: number) {
    // 1. Forward Speed & Controlled Acceleration
    // Default running speed: 25 game units per second
    // Normal running speed kept strictly between 20 and 30 game units per second
    // Absolute hard speed limit strictly below 100 game units per second enforced in movement code
    const diffMultiplier = DIFFICULTY_SETTINGS[this.difficulty].speedMultiplier;
    const distanceGain = (this.distance / 100) * ACCELERATION_RATE;
    const calculatedTarget = (BASE_SPEED + distanceGain) * diffMultiplier;

    // Normal difficulty upper cap is 30.0; Hardcore difficulty upper cap is 36.0 (well below 100)
    const upperSpeedCap = this.difficulty === 'HARD' ? HARD_MAX_SPEED : NORMAL_MAX_SPEED;
    const targetSpeed = Math.max(
      MIN_SPEED,
      Math.min(upperSpeedCap, Math.min(ABSOLUTE_HARD_SPEED_LIMIT, calculatedTarget))
    );

    // Smooth, gradual dampening ensures no sudden acceleration or jarring speed jolts
    this.speed = THREE.MathUtils.damp(this.speed, targetSpeed, 0.6, dt);

    // Strictly enforce speed bounds and the hard speed limit below 100 units/second
    this.speed = Math.min(ABSOLUTE_HARD_SPEED_LIMIT, Math.min(99.0, Math.max(MIN_SPEED, this.speed)));
    if (this.speed >= 100.0) {
      this.speed = 99.0;
    }

    const forwardStep = this.speed * dt;
    this.character.group.position.z -= forwardStep;
    this.distance += forwardStep;

    // 2. Smooth Lane Interpolation (Left: -1, Center: 0, Right: 1)
    const targetX = this.targetLane * LANE_WIDTH;
    this.currentX = THREE.MathUtils.damp(this.currentX, targetX, LANE_CHANGE_SPEED, dt);
    this.character.group.position.x = this.currentX;

    const laneDelta = targetX - this.currentX;
    this.character.group.rotation.z = -laneDelta * 0.12;
    this.character.group.rotation.y = laneDelta * 0.08;

    // 3. Advanced Jump, Gravity & Gap Detection Physics
    const overGap = this.checkIfOverGap(this.character.group.position.z);

    if (!this.isGrounded || overGap) {
      // Apply gravity continuously while airborne or over an open gap
      this.velocityY += GRAVITY * dt;
      this.playerY += this.velocityY * dt;

      if (this.velocityY > 0) {
        this.movementState = 'JUMPING';
      } else {
        this.movementState = 'FALLING';
      }

      // If falling below platform level, play descent sfx once
      if (this.playerY < -0.8 && !this.hasPlayedFallSound) {
        this.hasPlayedFallSound = true;
        sounds.playFall();
      }

      // Landing detection on solid platform
      if (!overGap && this.playerY <= 0) {
        this.playerY = 0;
        this.velocityY = 0;
        this.isGrounded = true;
        this.hasPlayedFallSound = false;
        this.movementState = 'LANDING';
        this.landingTimer = 0.12;
        sounds.playLand();

        if (this.wasOverGap && this.gameMode === 'LEVEL') {
          this.levelProgress.gapsCleared += 1;
          this.checkMissionStatus();
        }
      }
    } else {
      // On solid ground
      this.hasPlayedFallSound = false;
      if (this.landingTimer > 0) {
        this.landingTimer -= dt;
        if (this.landingTimer <= 0) {
          this.movementState = this.isSliding ? 'SLIDING' : 'RUNNING';
        }
      } else {
        this.movementState = this.isSliding ? 'SLIDING' : 'RUNNING';
      }
    }

    this.wasOverGap = overGap;

    // Time Trial Countdown
    if (this.gameMode === 'LEVEL' && this.levelProgress.timeRemaining !== undefined) {
      this.levelProgress.timeRemaining -= dt;
      if (this.levelProgress.timeRemaining <= 0) {
        this.levelProgress.timeRemaining = 0;
        this.movementState = 'HIT';
        this.triggerGameOver('OBSTACLE_HIT');
        return;
      }
    }

    // Gap Fall Wipeout Check
    if (this.playerY < -5.5) {
      this.movementState = 'GAMEOVER';
      this.triggerGameOver('FELL_IN_GAP');
      return;
    }

    this.character.group.position.y = this.playerY;

    // 4. Slide Timer
    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // 5. Invulnerability Timer
    if (this.isInvulnerable) {
      this.invulnerableTimer -= dt;
      this.character.group.visible = Math.floor(this.animTime * 18) % 2 === 0;
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
        this.character.group.visible = true;
      }
    }

    // 6. Character Procedural Animation based on Movement State
    if (this.movementState === 'SLIDING') {
      this.character.animateSlide(1 - this.slideTimer / SLIDE_DURATION);
    } else if (this.movementState === 'JUMPING') {
      this.character.animateJump(this.velocityY);
    } else if (this.movementState === 'FALLING') {
      if (this.playerY < -0.5) {
        this.character.animatePlummet(this.animTime);
      } else {
        this.character.animateFall(this.velocityY);
      }
    } else if (this.movementState === 'LANDING') {
      this.character.animateLanding(1 - this.landingTimer / 0.12);
    } else {
      // RUNNING (stride synchronized with forward speed)
      this.character.animateRun(this.animTime, this.speed / BASE_SPEED);
    }

    // 7. Power-ups Update
    const hasShield = this.activePowerUps.has('SHIELD');
    const hasMagnet = this.activePowerUps.has('MAGNET');
    const hasMultiplier = this.activePowerUps.has('MULTIPLIER');

    this.multiplier = hasMultiplier ? 2 : 1;
    this.character.updatePowerupVisuals(hasShield, hasMagnet, this.animTime);

    for (const [key, power] of Array.from(this.activePowerUps.entries())) {
      power.timeLeft -= dt;
      if (power.timeLeft <= 0) {
        this.activePowerUps.delete(key);
      }
    }

    // 8. Score accumulation from distance
    this.score += forwardStep * 1.5 * this.multiplier;

    // 9. Follow Player with Ambient Particles
    if (this.rainParticles && this.rainParticles.visible) {
      this.rainParticles.position.set(this.currentX, 0, this.character.group.position.z);
      const posAttr = this.rainParticles.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) - 48 * dt;
        if (y < 0) y = 26;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }

    if (this.forestLeafParticles && this.forestLeafParticles.visible) {
      this.forestLeafParticles.position.set(this.currentX, 0, this.character.group.position.z);
      const posAttr = this.forestLeafParticles.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) - 4 * dt;
        let x = posAttr.getX(i) + Math.sin(this.animTime * 2 + i) * 0.05;
        if (y < 0.2) y = 8;
        posAttr.setY(i, y);
        posAttr.setX(i, x);
      }
      posAttr.needsUpdate = true;
    }

    // 9b. Update Coin Pickup Particles / Expanding Rings
    for (let i = this.activeFX.length - 1; i >= 0; i--) {
      const fx = this.activeFX[i];
      fx.life += dt;
      const progress = fx.life / fx.maxLife;
      if (progress >= 1) {
        this.scene.remove(fx.mesh);
        (fx.mesh.material as THREE.Material).dispose();
        this.activeFX.splice(i, 1);
      } else {
        const s = 1.0 + progress * 2.4;
        fx.mesh.scale.set(s, s, s);
        fx.mesh.position.y += dt * 1.6;
        (fx.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.95;
      }
    }

    // 10. Obstacle & Collectible Interactions
    this.checkCollisions(dt, hasShield, hasMagnet);

    // 11. Chunk Lifecycle
    this.cleanupChunks(this.character.group.position.z);

    // 12. Camera Tracking with Smooth Damping (follows behind player along -Z)
    const targetCamX = this.currentX * 0.65;
    const targetCamY = Math.max(3.8, this.playerY + 3.8);
    const targetCamZ = this.character.group.position.z + 7.5;

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 10.0, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamY, 12.0, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 25.0, dt);

    if (this.cameraShake > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShake;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShake;
      this.cameraShake = Math.max(0, this.cameraShake - dt * 2.5);
    }

    this.camera.lookAt(
      this.currentX * 0.25,
      this.playerY * 0.5 + 1.6,
      this.character.group.position.z - 9.0
    );

    // 13. Throttled React HUD Update (10 FPS)
    this.hudUpdateTimer += dt;
    if (this.hudUpdateTimer >= 0.1) {
      this.hudUpdateTimer = 0;
      this.dispatchHUDUpdate();
    }
  }

  // COLLISION DETECTION & COLLECTIBLES
  private checkCollisions(dt: number, hasShield: boolean, hasMagnet: boolean) {
    const playerZ = this.character.group.position.z;
    const playerX = this.character.group.position.x;
    const playerY = this.playerY;

    const playerHalfWidth = 0.38;
    const playerTop = this.isSliding ? playerY + 0.85 : playerY + 1.85;
    const playerBottom = playerY;

    for (const chunk of this.chunks) {
      // Rotate collectibles
      for (const [id, mesh] of chunk.collectibleMeshes.entries()) {
        mesh.rotation.y += dt * 3.5;
        mesh.position.y = (mesh.userData.baseY || mesh.position.y) + Math.sin(this.animTime * 4 + id) * 0.08;
      }

      // Check collectibles
      for (const col of chunk.data.collectibles) {
        if (col.collected) continue;

        const mesh = chunk.collectibleMeshes.get(col.id);
        if (!mesh) continue;

        if (hasMagnet && col.type === 'COIN') {
          const distZ = Math.abs(col.z - playerZ);
          if (distZ < 15.0) {
            col.z = THREE.MathUtils.damp(col.z, playerZ, 8.0, dt);
            mesh.position.z = col.z;
            mesh.position.x = THREE.MathUtils.damp(mesh.position.x, playerX, 8.0, dt);
          }
        }

        const dz = Math.abs(col.z - playerZ);
        const colX = mesh.position.x;
        const dx = Math.abs(colX - playerX);

        if (dz < 1.4 && dx < 0.95 && Math.abs(mesh.position.y - (playerY + 0.9)) < 1.4) {
          col.collected = true;
          this.scene.remove(mesh);
          chunk.collectibleMeshes.delete(col.id);

          const colColor = col.type === 'GEM' ? 0x10b981 : 0xfacc15;
          this.spawnPickupFX(mesh.position.x, mesh.position.y, mesh.position.z, colColor);

          if (col.type === 'COIN') {
            this.coins += 1;
            this.score += 10 * this.multiplier;
            sounds.playCoin();
          } else if (col.type === 'GEM') {
            this.gems += 1;
            this.score += 50 * this.multiplier;
            sounds.playGem();
          } else if (col.type === 'POWERUP_SHIELD') {
            this.activePowerUps.set('SHIELD', { type: 'SHIELD', duration: 15, timeLeft: 15 });
            sounds.playPowerup();
          } else if (col.type === 'POWERUP_MAGNET') {
            this.activePowerUps.set('MAGNET', { type: 'MAGNET', duration: 12, timeLeft: 12 });
            sounds.playPowerup();
          } else if (col.type === 'POWERUP_MULTIPLIER') {
            this.activePowerUps.set('MULTIPLIER', { type: 'MULTIPLIER', duration: 10, timeLeft: 10 });
            sounds.playPowerup();
          }

          this.dispatchHUDUpdate();
        }
      }

      // Animate swinging logs
      for (const [id, mesh] of chunk.obstacleMeshes.entries()) {
        const pivot = mesh.getObjectByName('PendulumPivot');
        if (pivot) {
          pivot.rotation.z = Math.sin(this.animTime * 3.2 + id) * 0.85;
        }
      }

      // Check obstacles
      for (const obs of chunk.data.obstacles) {
        if (obs.cleared) continue;

        const obsMesh = chunk.obstacleMeshes.get(obs.id);
        const dz = Math.abs(obs.z - playerZ);

        // Checkpoint arch
        if (obs.type === 'CHECKPOINT_ARCH') {
          if (dz < 1.5 && playerZ < obs.z) {
            obs.cleared = true;
            this.score += 100 * this.multiplier;
            sounds.playPowerup();
            this.onCheckpointReached?.(Math.floor(this.distance));
            this.dispatchHUDUpdate();
          }
          continue;
        }

        if (dz < 1.3) {
          const obsX = obs.lane * LANE_WIDTH;
          const dx = Math.abs(obsX - playerX);

          let hasHit = false;

          if (obs.type === 'BARRIER_LOW') {
            if (dx < playerHalfWidth + obs.width * 0.45) {
              if (playerBottom < 0.78) {
                hasHit = true;
              }
            }
          } else if (obs.type === 'BARRIER_HIGH') {
            if (dx < playerHalfWidth + obs.width * 0.45) {
              if (playerTop > 0.95) {
                hasHit = true;
              }
            }
          } else if (obs.type === 'CRATE' || obs.type === 'FALLEN_LOG' || obs.type === 'WATER_TANK') {
            if (dx < playerHalfWidth + obs.width * 0.45 && playerBottom < 1.5) {
              hasHit = true;
            }
          } else if (obs.type === 'SWINGING_LOG' && obsMesh) {
            const pivot = obsMesh.getObjectByName('PendulumPivot');
            if (pivot) {
              const logSwingX = Math.sin(pivot.rotation.z) * 3.2;
              const logWorldX = obsX + logSwingX;
              if (Math.abs(logWorldX - playerX) < 1.1 && playerBottom < 1.5) {
                hasHit = true;
              }
            }
          }

          if (hasHit) {
            if (this.isInvulnerable) continue;

            if (hasShield) {
              this.activePowerUps.delete('SHIELD');
              this.isInvulnerable = true;
              this.invulnerableTimer = 1.4;
              this.cameraShake = 0.35;
              sounds.playShieldBreak();
              obs.cleared = true;
              this.dispatchHUDUpdate();
            } else {
              this.movementState = 'HIT';
              this.triggerGameOver('OBSTACLE_HIT');
              return;
            }
          }
        }
      }
    }
  }

  // GAME OVER SEQUENCE
  private triggerGameOver(cause: 'OBSTACLE_HIT' | 'FELL_IN_GAP' = 'OBSTACLE_HIT') {
    this.state = 'GAMEOVER';
    this.movementState = 'GAMEOVER';
    this.onStateChange?.('GAMEOVER');
    this.cameraShake = cause === 'FELL_IN_GAP' ? 0.3 : 0.6;
    if (cause === 'OBSTACLE_HIT') {
      sounds.playCrash();
    }
    sounds.stopMusic();

    this.onGameOver?.({
      distance: Math.floor(this.distance),
      coins: this.coins,
      gems: this.gems,
      score: Math.floor(this.score),
      multiplier: this.multiplier,
      speed: Math.round(this.speed * 10) / 10,
    });
  }

  // RENDER FRAME
  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  // RESIZE
  public handleResize(width: number, height: number) {
    if (!this.renderer || !this.camera) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // DISPOSE & CLEANUP
  public dispose() {
    this.isRunningLoop = false;
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    window.removeEventListener('keydown', this.handleKeyDown);

    if (this.touchContainer) {
      this.touchContainer.removeEventListener('touchstart', this.handleTouchStart);
      this.touchContainer.removeEventListener('touchend', this.handleTouchEnd);
      this.touchContainer = null;
    }

    for (const fx of this.activeFX) {
      this.scene.remove(fx.mesh);
      (fx.mesh.material as THREE.Material).dispose();
    }
    this.activeFX = [];
    this.pickupRingGeom.dispose();

    sounds.stopMusic();

    this.scene.clear();
    this.renderer.dispose();
  }
}
