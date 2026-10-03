export type CatAction = 'sleep' | 'eat' | 'drink' | 'dance' | 'loaf' | 'idle';

export type SanctuaryBackground = 'living_room' | 'garden' | 'cat_cafe' | 'tatami' | 'cosmic';

export interface CatBreed {
  id: string;
  name: string;
  origin: string;
  description: string;
  personality: string;
  favoriteSnack: string;
  meowStyle: string; // Description of vocalization
  meowOnomatopoeia: string; // The sound text, e.g. "Mreee-ooww!"
  powerLevel?: number; // Cute Neko Atsume stat
  bodyColor: string;
  secondaryColor?: string;
  stripeColor?: string;
  bellyColor: string;
  eyeColor: string;
  earInnerColor: string;
  noseColor: string;
  earType: 'pointy' | 'folded' | 'large' | 'tufted';
  tailType?: 'fluffy' | 'standard' | 'plume' | 'thin';
  faceStyle?: 'standard' | 'flat' | 'wrinkled' | 'chubby';
  pattern: 'solid' | 'tabby' | 'calico' | 'points' | 'bicolor' | 'spots' | 'fluffy';
  furStyle: 'short' | 'fluffy' | 'hairless';
}

export interface CatCostume {
  id: string;
  name: string;
  emoji: string;
  category: 'hat' | 'full' | 'glasses' | 'royal' | 'food';
  tagline: string;
  description: string;
}

export interface MiniCat {
  id: string;
  name: string;
  breedId: string;
  x: number; // percentage (5 to 90)
  y: number; // percentage (15 to 80)
  action: CatAction;
  costumeId: string;
  scale: number;
  facingLeft: boolean;
  happiness: number;
  isDragging?: boolean;
  thoughtBubble?: string;
  hunger: number; // 0 to 100
  thirst: number; // 0 to 100
  energy: number; // 0 to 100
}

export interface SanctuaryToy {
  id: string;
  type: 'cat_tree' | 'cardboard_box' | 'cushion' | 'snack_bowl' | 'sushi_plate' | 'water_bowl' | 'yarn';
  name: string;
  emoji: string;
  x: number;
  y: number;
}

export interface NekoShopGoodie {
  id: string;
  name: string;
  japaneseName: string;
  emoji: string;
  costSilver: number;
  costGold?: number;
  category: 'food' | 'toy' | 'furniture';
  description: string;
  actionTrigger?: CatAction;
}
