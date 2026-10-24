export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'LEVEL_COMPLETE';

export type GameMode = 'ENDLESS' | 'LEVEL';

export type PlayerMovementState =
  | 'RUNNING'
  | 'JUMPING'
  | 'FALLING'
  | 'LANDING'
  | 'SLIDING'
  | 'HIT'
  | 'GAMEOVER';

export type EnvironmentTheme =
  | 'LUSH_FOREST'
  | 'RIVER_CROSSING'
  | 'MONSOON_RAIN'
  | 'MOUNTAIN_BRIDGE'
  | 'SUNSET_CITY';

export type Difficulty = 'BEGINNER' | 'NORMAL' | 'HARD';

export type GraphicsQuality = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CharacterSkin {
  id: string;
  name: string;
  description: string;
  cost: number;
  unlocked: boolean;
  colors: {
    jacket: string;
    jacketAccent: string;
    pants: string;
    shoes: string;
    backpack: string;
    hair: string;
    visor?: string;
  };
}

export type PowerUpType = 'SHIELD' | 'MAGNET' | 'MULTIPLIER';

export interface ActivePowerUp {
  type: PowerUpType;
  duration: number; // total duration in seconds
  timeLeft: number; // remaining in seconds
}

export interface ObstacleData {
  id: number;
  type:
    | 'BARRIER_LOW'
    | 'BARRIER_HIGH'
    | 'CRATE'
    | 'WATER_TANK'
    | 'SWINGING_LOG'
    | 'CHECKPOINT_ARCH'
    | 'FALLEN_LOG'
    | 'TOTEM_SPIKE'
    | 'FINISH_GATE';
  lane: -1 | 0 | 1;
  z: number;
  width: number;
  height: number;
  depth: number;
  cleared?: boolean;
}

export interface CollectibleData {
  id: number;
  type: 'COIN' | 'GEM' | 'POWERUP_SHIELD' | 'POWERUP_MAGNET' | 'POWERUP_MULTIPLIER';
  lane: -1 | 0 | 1;
  z: number;
  y: number;
  collected?: boolean;
  trailGroup?: number; // for designated coin trails
}

export interface PlatformGap {
  zStart: number;
  zEnd: number;
  width: number;
}

export interface ChunkSection {
  id: number;
  theme: EnvironmentTheme;
  zStart: number;
  zEnd: number;
  length: number;
  isBridge?: boolean;
  isMovingPlatform?: boolean;
  gaps?: PlatformGap[];
  obstacles: ObstacleData[];
  collectibles: CollectibleData[];
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  difficulty: Difficulty;
  graphicsQuality: GraphicsQuality;
  vibration: boolean;
}

export interface GameScore {
  distance: number;
  coins: number;
  gems: number;
  score: number;
  multiplier: number;
  speed?: number; // Live calibrated running speed in game units per second
}

// ==========================================
// LEVEL & MISSION SYSTEM TYPES
// ==========================================
export type MissionCategory =
  | 'COINS'
  | 'JUMPS'
  | 'LANE_CHANGES'
  | 'CHECKPOINTS'
  | 'SAFE_RUN'
  | 'COIN_TRAILS'
  | 'GAPS'
  | 'OBSTACLES_PASSED'
  | 'MOVING_PLATFORMS'
  | 'BRIDGES'
  | 'SPEED_TRIAL'
  | 'COMBO';

export interface LevelMission {
  levelNumber: number;
  title: string;
  category: MissionCategory;
  objectiveDesc: string;
  targetDistance: number; // in meters where checkered finish gate is placed
  theme: EnvironmentTheme;
  difficulty: Difficulty;
  timeLimit?: number; // in seconds for SPEED_TRIAL
  reqCoins?: number;
  reqJumps?: number;
  reqLaneChanges?: number;
  reqCheckpoints?: number;
  reqGaps?: number;
  reqObstaclesPassed?: number;
  reqCoinTrails?: number;
  reqMovingPlatforms?: number;
  reqBridges?: number;
  noCollisions?: boolean;
}

export interface LevelProgressState {
  currentLevel: number;
  isLevelMode: boolean;
  mission: LevelMission | null;
  coinsCollected: number;
  jumpsDone: number;
  laneChangesDone: number;
  checkpointsPassed: number;
  gapsCleared: number;
  obstaclesPassed: number;
  coinTrailsDone: number;
  movingPlatformsCrossed: number;
  bridgesCrossed: number;
  collisionsCount: number;
  timeRemaining?: number;
  isMissionComplete: boolean;
  finishGateReached: boolean;
  finishGateZ: number;
  remainingMessage?: string;
}
