/**
 * Achievement System
 * Defines all achievements, their conditions, and rewards
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  goldReward: number;
  icon: string;
  category: 'wpm' | 'games' | 'special';
}

export interface UserStats {
  totalGames: number;
  totalKills: number;
  totalWordsTyped: number;
  bestScore: number;
  bestWpm: number;
  bestStreak: number;
  gold: number;
  duelWins?: number;
  duelLosses?: number;
  highestWaveReached?: number;
}

export interface GameSession {
  score: number;
  wpm: number;
  waveReached: number;
  accuracy: number;
  backspaceCount: number;
  kills: number;
  wordsTyped: number;
}

/**
 * Achievement condition checker function type
 * Can check either cumulative stats or current game session
 */
export type AchievementCondition = (stats: UserStats, session?: GameSession) => boolean;

/**
 * All available achievements with their conditions
 * Using badge images from /images/badges/
 */
export const ACHIEVEMENTS: Array<Achievement & { condition: AchievementCondition }> = [
  // Wave-based achievements
  {
    id: 'wave-1',
    name: 'Star Cadet',
    description: 'Complete Wave 1',
    goldReward: 100,
    icon: '/images/badges/StarCadet_w1.png',
    category: 'games',
    condition: (stats, session) => {
      const waveReached = session?.waveReached ?? stats.highestWaveReached ?? 0;
      return waveReached >= 1;
    },
  },
  {
    id: 'wave-3',
    name: 'Orbit Guardian',
    description: 'Complete Wave 3',
    goldReward: 300,
    icon: '/images/badges/OrbitGuardian_w3.png',
    category: 'games',
    condition: (stats, session) => {
      const waveReached = session?.waveReached ?? stats.highestWaveReached ?? 0;
      return waveReached >= 3;
    },
  },
  {
    id: 'wave-5',
    name: 'Deep Space Ranger',
    description: 'Complete Wave 5',
    goldReward: 500,
    icon: '/images/badges/DeepSpaceRanger_w5.png',
    category: 'games',
    condition: (stats, session) => {
      const waveReached = session?.waveReached ?? stats.highestWaveReached ?? 0;
      return waveReached >= 5;
    },
  },
  {
    id: 'wave-9',
    name: 'Galactic Overload',
    description: 'Complete Wave 9',
    goldReward: 1000,
    icon: '/images/badges/GalaticOverload_w9.png',
    category: 'games',
    condition: (stats, session) => {
      const waveReached = session?.waveReached ?? stats.highestWaveReached ?? 0;
      return waveReached >= 9;
    },
  },

  // WPM-based achievements
  {
    id: 'wpm-50',
    name: 'Laser Precision',
    description: 'Reach 50 WPM',
    goldReward: 250,
    icon: '/images/badges/LaserPrecision_50wpm.png',
    category: 'wpm',
    condition: (stats, session) => {
      const wpm = session?.wpm ?? stats.bestWpm;
      return wpm >= 50;
    },
  },
  {
    id: 'wpm-70',
    name: 'Plasma Burst',
    description: 'Reach 70 WPM',
    goldReward: 500,
    icon: '/images/badges/PlasmaBurst_70wpm.png',
    category: 'wpm',
    condition: (stats, session) => {
      const wpm = session?.wpm ?? stats.bestWpm;
      return wpm >= 70;
    },
  },
  {
    id: 'wpm-90',
    name: 'Railgun Velocity',
    description: 'Reach 90 WPM',
    goldReward: 750,
    icon: '/images/badges/RailgunVelocity_90wpm.png',
    category: 'wpm',
    condition: (stats, session) => {
      const wpm = session?.wpm ?? stats.bestWpm;
      return wpm >= 90;
    },
  },
  {
    id: 'wpm-130',
    name: 'Godspeed Singularity',
    description: 'Reach 130+ WPM',
    goldReward: 2000,
    icon: '/images/badges/GodspeedSingularity_130+wpm.png',
    category: 'wpm',
    condition: (stats, session) => {
      const wpm = session?.wpm ?? stats.bestWpm;
      return wpm >= 130;
    },
  },

  // Special achievements
  {
    id: 'perfect-accuracy',
    name: '100% Accuracy',
    description: 'Complete a game with perfect accuracy',
    goldReward: 1500,
    icon: '/images/badges/100%accuracy.png',
    category: 'special',
    condition: (stats, session) => {
      if (!session) return false;
      return session.accuracy >= 100 && session.wordsTyped >= 10;
    },
  },
  {
    id: 'zero-backspace',
    name: 'Zero Backspace',
    description: 'Complete a game without using backspace',
    goldReward: 1000,
    icon: '/images/badges/zero_backspace.png',
    category: 'special',
    condition: (stats, session) => {
      if (!session) return false;
      return session.backspaceCount === 0 && session.wordsTyped >= 10;
    },
  },
];

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/**
 * Get all achievements in a category
 */
export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

/**
 * Check which achievements a user has unlocked based on their stats
 * Optionally pass current game session for per-game achievements
 */
export function checkAchievementConditions(stats: UserStats, session?: GameSession): string[] {
  return ACHIEVEMENTS.filter((achievement) => achievement.condition(stats, session)).map((a) => a.id);
}
