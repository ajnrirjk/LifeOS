export type MiniGameId = 
  | 'pilgrim_go'
  | 'flappy_dove'
  | 'babel_stack'
  | 'demon_buster'
  | 'eden_snake'
  | 'scripture_matrix'
  | 'slingshot_target'
  | 'samson_smash';

export interface MiniGameMeta {
  id: MiniGameId;
  title: string;
  tagline: string;
  emoji: string;
  badgeColor: string;
  accentGradient: string;
  genre: string;
  difficulty: 'Easy' | 'Medium' | 'Challenging' | 'High Reflex';
  instructions: string[];
}

export interface ArcadeLeaderboardEntry {
  gameId: MiniGameId;
  playerName: string;
  score: number;
  date: string;
}

export interface ArcadeStats {
  totalTokens: number;
  highScores: Record<MiniGameId, number>;
  gamesPlayed: Record<MiniGameId, number>;
  unlockedSkins: string[];
  activeSkin: string;
}
