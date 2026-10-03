export type FighterId = 'ryu_paw' | 'chun_meow' | 'guile_claw' | 'akuma_cat' | 'blanka_cat';

export type GameMode = 'arcade' | 'versus_cpu' | 'versus_2p' | 'training';

export type AiDifficulty = 'easy' | 'medium' | 'hard' | 'turbo';

export type CombatAction =
  | 'idle'
  | 'walk_fwd'
  | 'walk_back'
  | 'jump'
  | 'crouch'
  | 'light_punch'
  | 'heavy_punch'
  | 'special'
  | 'super_art'
  | 'block'
  | 'hit'
  | 'knockdown'
  | 'victory'
  | 'defeat';

export interface FighterMeta {
  id: FighterId;
  name: string;
  subtitle: string;
  breed: string;
  emoji: string;
  quote: string;
  avatarGradient: string;
  furColor: string;
  accentColor: string;
  stripeColor: string;
  headbandColor?: string;
  stats: {
    power: number; // 1-5
    speed: number;
    defense: number;
    special: number;
  };
  specialMove: {
    name: string;
    command: string;
    description: string;
    type: 'projectile' | 'barrage' | 'uppercut' | 'shockwave';
  };
  superArt: {
    name: string;
    command: string;
    description: string;
  };
}

export interface Projectile {
  id: string;
  owner: 'p1' | 'p2';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  damage: number;
  active: boolean;
  type: 'yarn_hadou' | 'sonic_slash' | 'dark_hadou' | 'electric_spark';
}

export interface HitVfx {
  id: string;
  x: number;
  y: number;
  type: 'spark' | 'slash' | 'block' | 'super_flash' | 'dust';
  color: string;
  scale: number;
  life: number;
  maxLife: number;
  text?: string;
}

export interface KeyBindings {
  left: string;
  right: string;
  up: string;
  down: string;
  lightPunch: string;
  heavyPunch: string;
  special: string;
  superArt: string;
  block: string;
}

export interface MobileControlsConfig {
  buttonScale: number; // 0.8 to 1.3
  opacity: number; // 0.3 to 1.0
  layout: 'standard' | 'arc' | 'compact';
  haptics: boolean;
}
