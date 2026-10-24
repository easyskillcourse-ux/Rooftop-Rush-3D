import { CharacterSkin, Difficulty } from '../types';

export const LANE_WIDTH = 2.4; // Distance between lanes along X
export const LANES = [-1, 0, 1] as const; // -1 = Left (-2.4), 0 = Center (0), 1 = Right (+2.4)

// SPEED BALANCING (Strictly calibrated: default 25.0, normal range 20–30, hard cap < 100)
export const BASE_SPEED = 25.0; // Default running speed set strictly to 25 game units per second
export const MIN_SPEED = 20.0; // Lower boundary of normal gameplay (20 units/s)
export const NORMAL_MAX_SPEED = 30.0; // Upper boundary of normal gameplay (30 units/s)
export const HARD_MAX_SPEED = 36.0; // Upper ceiling for Hardcore difficulty mode
export const MAX_SPEED = HARD_MAX_SPEED; // Alias for backward compatibility
export const ABSOLUTE_HARD_SPEED_LIMIT = 95.0; // Hard limit strictly below 100 game units/second enforced in movement code
export const ACCELERATION_RATE = 0.10; // Gradual, smooth acceleration per 100 meters without sudden speed jumps

// RESPONSIVE PHYSICS (Synchronized with 20-30 units/s forward velocity)
export const JUMP_VELOCITY = 12.6; // Yields a crisp, natural ~2.45 unit jump height
export const GRAVITY = -32.5; // Responsive gravity curve (~0.775s airtime, perfect 6.8m gap clearance)
export const SLIDE_DURATION = 0.70; // seconds
export const LANE_CHANGE_SPEED = 14.0; // Snappy, smooth lane shifts

// CHUNK & VISIBILITY (Optimized for performance)
export const CHUNK_LENGTH = 60.0;
export const VISIBLE_CHUNKS = 5; // Maintains 300m view distance with high frame rate

export const DIFFICULTY_SETTINGS: Record<
  Difficulty,
  { speedMultiplier: number; obstacleDensity: number; label: string }
> = {
  BEGINNER: { speedMultiplier: 0.88, obstacleDensity: 0.7, label: 'Beginner' }, // 22.0 -> 26.5 units/s (within 20-30)
  NORMAL: { speedMultiplier: 1.0, obstacleDensity: 0.95, label: 'Normal' }, // Exactly 25.0 base -> gradual max 30.0 units/s (within 20-30)
  HARD: { speedMultiplier: 1.12, obstacleDensity: 1.15, label: 'Hardcore' }, // 28.0 base -> gradual max 36.0 units/s (< 100)
};

export const INITIAL_SKINS: CharacterSkin[] = [
  {
    id: 'neon-runner',
    name: 'Teal Stryder',
    description: 'Iconic parkour jacket with energetic cyan and citrus solar trims.',
    cost: 0,
    unlocked: true,
    colors: {
      jacket: '#0284c7', // vibrant teal blue
      jacketAccent: '#f97316', // orange
      pants: '#1e293b', // slate navy
      shoes: '#38bdf8', // bright cyan
      backpack: '#ea580c', // vivid orange
      hair: '#334155', // dark slate
    },
  },
  {
    id: 'cyber-phantom',
    name: 'Shadow Phantom',
    description: 'Stealth nightrunner suit with neon magenta accents and high-grip kicks.',
    cost: 150,
    unlocked: false,
    colors: {
      jacket: '#4c1d95', // deep violet
      jacketAccent: '#f43f5e', // neon rose/crimson
      pants: '#09090b', // obsidian black
      shoes: '#fb7185', // glowing pink
      backpack: '#7c3aed', // electric purple
      hair: '#cbd5e1', // silver platinum
      visor: '#06b6d4',
    },
  },
  {
    id: 'solar-champion',
    name: 'Solar Champion',
    description: 'Legendary gold-crested running gear for master rooftop acrobats.',
    cost: 400,
    unlocked: false,
    colors: {
      jacket: '#eab308', // metallic gold
      jacketAccent: '#2563eb', // royal blue
      pants: '#1e1b4b', // midnight indigo
      shoes: '#facc15', // bright gold
      backpack: '#1d4ed8', // deep royal blue
      hair: '#78350f', // bronze brown
      visor: '#fbbf24',
    },
  },
];
