export const QUEST_IDS = {
    FIRST_BLOOD: 1,
    SPEED_DEMON: 2,
    SURVIVOR: 3,
    DRONE_SWATTER: 4,
    WAVE_CRUSHER: 5,
    FLEET_DESTROYER: 6,
    SCORE_5000: 7,
    SCORE_7500: 8,
    SCORE_10000: 9,
    STREAK_7: 10,
    STREAK_30: 11,
    STREAK_50: 12,
    STREAK_90: 13,
} as const;

export type QuestId = typeof QUEST_IDS[keyof typeof QUEST_IDS];

export interface Quest {
    id: QuestId;
    name: string;
    description: string;
    category: 'achievement' | 'daily';
    icon: string;
    target?: number;
    progressKey?: 'totalKills' | 'droneKills' | 'highestScore' | 'highestWpm' | 'wavesCompleted' | 'checkInStreak';
}

export const QUESTS: Quest[] = [
    { id: QUEST_IDS.FIRST_BLOOD, name: 'First Contact', description: 'Destroy your first enemy', category: 'achievement', icon: '🛸', target: 1, progressKey: 'totalKills' },
    { id: QUEST_IDS.SPEED_DEMON, name: 'Speed Demon', description: 'Achieve 50+ WPM', category: 'achievement', icon: '⚡', target: 50, progressKey: 'highestWpm' },
    { id: QUEST_IDS.SURVIVOR, name: 'Survivor', description: 'Complete Sector Alpha without losing a shield', category: 'achievement', icon: '🛡️' },
    { id: QUEST_IDS.DRONE_SWATTER, name: 'Drone Swatter', description: 'Destroy 5 drones', category: 'achievement', icon: '🤖', target: 5, progressKey: 'droneKills' },
    { id: QUEST_IDS.WAVE_CRUSHER, name: 'Sector Commander', description: 'Complete all 9 sectors', category: 'achievement', icon: '🚀', target: 9, progressKey: 'wavesCompleted' },
    { id: QUEST_IDS.FLEET_DESTROYER, name: 'Fleet Destroyer', description: 'Destroy 1000 enemies', category: 'achievement', icon: '💥', target: 1000, progressKey: 'totalKills' },
    { id: QUEST_IDS.SCORE_5000, name: 'Rising Star', description: 'Score 5000 points', category: 'achievement', icon: '⭐', target: 5000, progressKey: 'highestScore' },
    { id: QUEST_IDS.SCORE_7500, name: 'Point Master', description: 'Score 7500 points', category: 'achievement', icon: '🌟', target: 7500, progressKey: 'highestScore' },
    { id: QUEST_IDS.SCORE_10000, name: 'Legend', description: 'Score 10000 points', category: 'achievement', icon: '👑', target: 10000, progressKey: 'highestScore' },
    { id: QUEST_IDS.STREAK_7, name: 'Week Warrior', description: '7-day check-in streak', category: 'daily', icon: '📅', target: 7, progressKey: 'checkInStreak' },
    { id: QUEST_IDS.STREAK_30, name: 'Monthly Master', description: '30-day check-in streak', category: 'daily', icon: '🗓️', target: 30, progressKey: 'checkInStreak' },
    { id: QUEST_IDS.STREAK_50, name: 'Dedicated Pilot', description: '50-day check-in streak', category: 'daily', icon: '🔥', target: 50, progressKey: 'checkInStreak' },
    { id: QUEST_IDS.STREAK_90, name: 'True Believer', description: '90-day check-in streak', category: 'daily', icon: '💎', target: 90, progressKey: 'checkInStreak' },
];

export const getAchievementQuests = () => QUESTS.filter(q => q.category === 'achievement');
export const getDailyQuests = () => QUESTS.filter(q => q.category === 'daily');
