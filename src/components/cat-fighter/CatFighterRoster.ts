import { FighterMeta, FighterId } from './types';

export const FIGHTERS: Record<FighterId, FighterMeta> = {
  ryu_paw: {
    id: 'ryu_paw',
    name: 'Ryu-Paw',
    subtitle: 'The Wandering Karate Tabby',
    breed: 'Japanese Short-hair Tabby',
    emoji: '🥋',
    quote: 'You must defeat my Dragon Scratch to stand a chance!',
    avatarGradient: 'from-amber-600 via-orange-500 to-yellow-400',
    furColor: '#e07a5f',
    accentColor: '#f4f1de',
    stripeColor: '#3d405b',
    headbandColor: '#e63946',
    stats: {
      power: 4,
      speed: 4,
      defense: 4,
      special: 4
    },
    specialMove: {
      name: 'Hadou-Paw (Energy Yarn Ball)',
      command: 'SPECIAL / L key',
      description: 'Hurls a spiraling blue plasma yarn ball across the stage.',
      type: 'projectile'
    },
    superArt: {
      name: 'Shoryu-Claw Triple Dragon',
      command: 'SUPER ART / U key',
      description: 'Flaming triple ascending dragon uppercut with devastating KO power.'
    }
  },
  chun_meow: {
    id: 'chun_meow',
    name: 'Chun-Meow',
    subtitle: 'Fastest Paws in the East',
    breed: 'Royal Siamese',
    emoji: '🎀',
    quote: 'My lightning paws are quicker than your whiskers!',
    avatarGradient: 'from-blue-600 via-cyan-500 to-teal-400',
    furColor: '#f1faee',
    accentColor: '#457b9d',
    stripeColor: '#1d3557',
    headbandColor: '#ffd166',
    stats: {
      power: 3,
      speed: 5,
      defense: 3,
      special: 5
    },
    specialMove: {
      name: 'Lightning Paws Barrage',
      command: 'SPECIAL / L key',
      description: 'Unleashes 50 rapid-fire scratching kicks in a blink of an eye.',
      type: 'barrage'
    },
    superArt: {
      name: 'Spinning Bird Pounce DX',
      command: 'SUPER ART / U key',
      description: 'Inverted helicopter spin-kick charging across the entire arena.'
    }
  },
  guile_claw: {
    id: 'guile_claw',
    name: 'Guile-Claw',
    subtitle: 'Air Force Maine Coon',
    breed: 'Fluffy Maine Coon',
    emoji: '🪖',
    quote: 'Go home and be a family kitten!',
    avatarGradient: 'from-emerald-600 via-teal-500 to-green-400',
    furColor: '#a8dadc',
    accentColor: '#2a9d8f',
    stripeColor: '#264653',
    headbandColor: '#e76f51',
    stats: {
      power: 4,
      speed: 3,
      defense: 5,
      special: 4
    },
    specialMove: {
      name: 'Sonic Scratch Boom',
      command: 'SPECIAL / L key',
      description: 'Slices the air to shoot a supersonic green shockwave crescent.',
      type: 'projectile'
    },
    superArt: {
      name: 'Flash Somersault Somersault',
      command: 'SUPER ART / U key',
      description: 'Backflip crescent blade that cuts through incoming attacks.'
    }
  },
  akuma_cat: {
    id: 'akuma_cat',
    name: 'Akuma-Cat',
    subtitle: 'Master of the Dark Hadou',
    breed: 'Midnight Shadow Stray',
    emoji: '👹',
    quote: 'I am the Supreme Master of the Midnight Scratch!',
    avatarGradient: 'from-purple-900 via-rose-900 to-red-600',
    furColor: '#18181b',
    accentColor: '#ef4444',
    stripeColor: '#7f1d1d',
    headbandColor: '#9333ea',
    stats: {
      power: 5,
      speed: 4,
      defense: 3,
      special: 5
    },
    specialMove: {
      name: 'Gou-Hadou Dark Orb',
      command: 'SPECIAL / L key',
      description: 'Shoots a purple shadow energy projectile that leaves burning flame residue.',
      type: 'projectile'
    },
    superArt: {
      name: 'Shun Goku Satsu (Raging Paw)',
      command: 'SUPER ART / U key',
      description: 'Glides across the floor in shadow, turns screen pitch black with 15 fatal claws!'
    }
  },
  blanka_cat: {
    id: 'blanka_cat',
    name: 'Blanka-Cat',
    subtitle: 'Amazonian Jungle Calico',
    breed: 'Feral Jungle Tiger-Cat',
    emoji: '⚡',
    quote: 'RAAAWR! Feel my 10,000-volt fur static!',
    avatarGradient: 'from-green-600 via-yellow-500 to-amber-600',
    furColor: '#10b981',
    accentColor: '#f59e0b',
    stripeColor: '#065f46',
    headbandColor: '#fbbf24',
    stats: {
      power: 5,
      speed: 4,
      defense: 4,
      special: 3
    },
    specialMove: {
      name: 'Electric Fur Shockwave',
      command: 'SPECIAL / L key',
      description: 'Charges static electricity in fur, emitting a high-voltage barrier dome.',
      type: 'shockwave'
    },
    superArt: {
      name: 'Rolling Lightning Cannonball',
      command: 'SUPER ART / U key',
      description: 'Curls into a ferocious electric ball bouncing and smashing through enemy defense.'
    }
  }
};

export const STAGES = [
  {
    id: 'tokyo_alley',
    name: 'Tokyo Neon Fish Market',
    location: 'Shinjuku Back Alley, Tokyo',
    skyGradient: ['#0f172a', '#1e1b4b', '#311042'],
    groundColor: '#1e293b',
    propsEmoji: ['🏮', '🐟', '🍶', '🍜', '🍱'],
    bgCats: ['🐱', '🐈', '😺']
  },
  {
    id: 'dojo_iron_paw',
    name: 'Dojo of the Iron Paw',
    location: 'Mount Fuji Foothills, Japan',
    skyGradient: ['#450a0a', '#7f1d1d', '#b91c1c'],
    groundColor: '#78350f',
    propsEmoji: ['⛩️', '🌸', '🎋', '🥋', '🪵'],
    bgCats: ['🥋', '🐱‍👤', '😺']
  },
  {
    id: 'ny_rooftop',
    name: 'Brooklyn Rooftop Alley',
    location: 'New York City Skyline',
    skyGradient: ['#0c4a6e', '#0369a1', '#0284c7'],
    groundColor: '#334155',
    propsEmoji: ['🏙️', '🪣', '🍕', '🗽', '📦'],
    bgCats: ['😼', '🐱', '🐈‍⬛']
  },
  {
    id: 'amazon_jungle',
    name: 'Amazon Rainforest Falls',
    location: 'Ancient Cat Temple Ruins',
    skyGradient: ['#064e3b', '#047857', '#059669'],
    groundColor: '#14532d',
    propsEmoji: ['🌴', '🌺', '🗿', '🍌', '🦜'],
    bgCats: ['🐯', '🐆', '🦁']
  }
];

export const DEFAULT_P1_KEYS = {
  left: 'KeyA',
  right: 'KeyD',
  up: 'KeyW',
  down: 'KeyS',
  lightPunch: 'KeyJ',
  heavyPunch: 'KeyK',
  special: 'KeyL',
  superArt: 'KeyU',
  block: 'KeyI'
};

export const DEFAULT_P2_KEYS = {
  left: 'ArrowLeft',
  right: 'ArrowRight',
  up: 'ArrowUp',
  down: 'ArrowDown',
  lightPunch: 'Numpad4',
  heavyPunch: 'Numpad5',
  special: 'Numpad6',
  superArt: 'Numpad8',
  block: 'Numpad0'
};
