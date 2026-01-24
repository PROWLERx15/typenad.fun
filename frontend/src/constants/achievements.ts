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
  category: 'kills' | 'wpm' | 'games' | 'duel' | 'special';
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
}

/**
 * Achievement condition checker function type
 */
export type AchievementCondition = (stats: UserStats) => boolean;

/**
 * All available achievements with their conditions
 */
export const ACHIEVEMENTS: Array<Achievement & { condition: AchievementCondition }> = [
  // Kill-based achievements
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Defeat your first enemy',
    goldReward: 50,
    icon: '⚔️',
    category: 'kills',
    condition: (stats) => stats.totalKills >= 1,
  },
  {
    id: 'kill-10',
    name: 'Novice Slayer',
    description: 'Defeat 10 enemies',
    goldReward: 100,
    icon: '🗡️',
    category: 'kills',
    condition: (stats) => stats.totalKills >= 10,
  },
  {
    id: 'kill-50',
    name: 'Skilled Warrior',
    description: 'Defeat 50 enemies',
    goldReward: 250,
    icon: '⚔️',
    category: 'kills',
    condition: (stats) => stats.totalKills >= 50,
  },
  {
    id: 'kill-100',
    name: 'Veteran Fighter',
    description: 'Defeat 100 enemies',
    goldReward: 500,
    icon: '🛡️',
    category: 'kills',
    condition: (stats) => stats.totalKills >= 100,
  },
  {
    id: 'kill-500',
    name: 'Elite Slayer',
    description: 'Defeat 500 enemies',
    goldReward: 1000,
    icon: '👑',
    category: 'kills',
    condition: (stats) => stats.totalKills >= 500,
  },
  {
    id: 'kill-1000',
    name: 'Legendary Warrior',
    description: 'Defeat 1000 enemies',
    goldReward: 2500,
    icon: '⭐',
    category: 'kills',
    condition: (stats) => stats.totalKills >= 1000,
  },

  // WPM-based achievements
  {
    id: 'wpm-30',
    name: 'Speed Typer',
    description: 'Reach 30 WPM',
    goldReward: 100,
    icon: '⚡',
    category: 'wpm',
    condition: (stats) => stats.bestWpm >= 30,
  },
  {
    id: 'wpm-50',
    name: 'Fast Fingers',
    description: 'Reach 50 WPM',
    goldReward: 250,
    icon: '💨',
    category: 'wpm',
    condition: (stats) => stats.bestWpm >= 50,
  },
  {
    id: 'wpm-75',
    name: 'Lightning Typer',
    description: 'Reach 75 WPM',
    goldReward: 500,
    icon: '⚡',
    category: 'wpm',
    condition: (stats) => stats.bestWpm >= 75,
  },
  {
    id: 'wpm-100',
    name: 'Typing Master',
    description: 'Reach 100 WPM',
    goldReward: 1000,
    icon: '🔥',
    category: 'wpm',
    condition: (stats) => stats.bestWpm >= 100,
  },
  {
    id: 'wpm-150',
    name: 'Typing Legend',
    description: 'Reach 150 WPM',
    goldReward: 2500,
    icon: '🌟',
    category: 'wpm',
    condition: (stats) => stats.bestWpm >= 150,
  },

  // Games played achievements
  {
    id: 'games-1',
    name: 'First Steps',
    description: 'Complete your first game',
    goldReward: 50,
    icon: '🎮',
    category: 'games',
    condition: (stats) => stats.totalGames >= 1,
  },
  {
    id: 'games-10',
    name: 'Dedicated Player',
    description: 'Complete 10 games',
    goldReward: 200,
    icon: '🎯',
    category: 'games',
    condition: (stats) => stats.totalGames >= 10,
  },
  {
    id: 'games-50',
    name: 'Committed Gamer',
    description: 'Complete 50 games',
    goldReward: 500,
    icon: '🏆',
    category: 'games',
    condition: (stats) => stats.totalGames >= 50,
  },
  {
    id: 'games-100',
    name: 'Hardcore Player',
    description: 'Complete 100 games',
    goldReward: 1000,
    icon: '💎',
    category: 'games',
    condition: (stats) => stats.totalGames >= 100,
  },

  // Duel achievements
  {
    id: 'duel-first-win',
    name: 'Duel Victor',
    description: 'Win your first duel',
    goldReward: 200,
    icon: '🥇',
    category: 'duel',
    condition: (stats) => (stats.duelWins ?? 0) >= 1,
  },
  {
    id: 'duel-5-wins',
    name: 'Duel Champion',
    description: 'Win 5 duels',
    goldReward: 500,
    icon: '🏅',
    category: 'duel',
    condition: (stats) => (stats.duelWins ?? 0) >= 5,
  },
  {
    id: 'duel-10-wins',
    name: 'Duel Master',
    description: 'Win 10 duels',
    goldReward: 1000,
    icon: '👑',
    category: 'duel',
    condition: (stats) => (stats.duelWins ?? 0) >= 10,
  },
  {
    id: 'duel-25-wins',
    name: 'Duel Legend',
    description: 'Win 25 duels',
    goldReward: 2500,
    icon: '⭐',
    category: 'duel',
    condition: (stats) => (stats.duelWins ?? 0) >= 25,
  },

  // Special achievements
  {
    id: 'high-score-1000',
    name: 'Score Milestone',
    description: 'Reach a score of 1000',
    goldReward: 300,
    icon: '📈',
    category: 'special',
    condition: (stats) => stats.bestScore >= 1000,
  },
  {
    id: 'high-score-5000',
    name: 'Score Champion',
    description: 'Reach a score of 5000',
    goldReward: 750,
    icon: '🎯',
    category: 'special',
    condition: (stats) => stats.bestScore >= 5000,
  },
  {
    id: 'high-score-10000',
    name: 'Score Legend',
    description: 'Reach a score of 10000',
    goldReward: 1500,
    icon: '🌟',
    category: 'special',
    condition: (stats) => stats.bestScore >= 10000,
  },
  {
    id: 'word-master-1000',
    name: 'Word Master',
    description: 'Type 1000 words',
    goldReward: 300,
    icon: '📝',
    category: 'special',
    condition: (stats) => stats.totalWordsTyped >= 1000,
  },
  {
    id: 'word-master-5000',
    name: 'Word Champion',
    description: 'Type 5000 words',
    goldReward: 750,
    icon: '✍️',
    category: 'special',
    condition: (stats) => stats.totalWordsTyped >= 5000,
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
 */
export function checkAchievementConditions(stats: UserStats): string[] {
  return ACHIEVEMENTS.filter((achievement) => achievement.condition(stats)).map((a) => a.id);
}
