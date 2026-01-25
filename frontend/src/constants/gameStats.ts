/**
 * Game Statistics and Match History Storage
 * Manages localStorage for player stats and game history
 */

// LocalStorage Keys
export const STORAGE_KEYS = {
    // Statistics
    TOTAL_GAMES: 'total_games_played',
    TOTAL_KILLS: 'total_kills',
    TOTAL_GOLD_EARNED: 'total_gold_earned',
    BEST_STREAK: 'best_streak',
    TOTAL_WORDS_TYPED: 'total_words_typed',

    // Match History
    MATCH_HISTORY: 'match_history',

    // Inventory (stored as object with quantities)
    POWERUP_INVENTORY: 'powerup_inventory',
    EQUIPPED_POWERUPS: 'equipped_powerups',

    // Existing keys (for reference)
    PLAYER_GOLD: 'playerGold',
    PERSONAL_BEST_SCORE: 'personal_best_score',
    PERSONAL_BEST_WPM: 'personal_best_wpm',
    DISPLAY_NAME: 'display_name',
    KILLED_TYPES: 'killed_types',
} as const;

// Match History Entry
export interface MatchHistoryEntry {
    id: string;
    date: string;
    mode: 'story' | 'timeAttack' | 'pvp';
    score: number;
    wpm: number;
    wave: number;
    kills: number;
    goldEarned: number;
    powerupsUsed: string[];
    won?: boolean; // For PVP
}

// Powerup Inventory (quantity-based)
export interface PowerupInventory {
    [powerupId: string]: number;
}

// Player Statistics
export interface PlayerStats {
    totalGames: number;
    totalKills: number;
    totalGoldEarned: number;
    bestStreak: number;
    totalWordsTyped: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATISTICS FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const getPlayerStats = (): PlayerStats => {
    if (typeof window === 'undefined') {
        return { totalGames: 0, totalKills: 0, totalGoldEarned: 0, bestStreak: 0, totalWordsTyped: 0 };
    }

    return {
        totalGames: parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_GAMES) || '0'),
        totalKills: parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_KILLS) || '0'),
        totalGoldEarned: parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_GOLD_EARNED) || '0'),
        bestStreak: parseInt(localStorage.getItem(STORAGE_KEYS.BEST_STREAK) || '0'),
        totalWordsTyped: parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_WORDS_TYPED) || '0'),
    };
};

export const incrementStat = (key: string, amount: number = 1): void => {
    if (typeof window === 'undefined') return;
    const current = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (current + amount).toString());
};

export const updateBestStreak = (streak: number): void => {
    if (typeof window === 'undefined') return;
    const current = parseInt(localStorage.getItem(STORAGE_KEYS.BEST_STREAK) || '0');
    if (streak > current) {
        localStorage.setItem(STORAGE_KEYS.BEST_STREAK, streak.toString());
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MATCH HISTORY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_MATCH_HISTORY = 50;

export const getMatchHistory = (): MatchHistoryEntry[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY);
    return stored ? JSON.parse(stored) : [];
};

export const addMatchToHistory = (match: Omit<MatchHistoryEntry, 'id' | 'date'>): void => {
    if (typeof window === 'undefined') return;

    const history = getMatchHistory();
    const newEntry: MatchHistoryEntry = {
        ...match,
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
    };

    // Add to beginning and limit size
    history.unshift(newEntry);
    if (history.length > MAX_MATCH_HISTORY) {
        history.pop();
    }

    localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(history));
};

// ═══════════════════════════════════════════════════════════════════════════════
// POWERUP INVENTORY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const getPowerupInventory = (): PowerupInventory => {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem(STORAGE_KEYS.POWERUP_INVENTORY);
    return stored ? JSON.parse(stored) : {};
};

export const addPowerupToInventory = (powerupId: string, quantity: number = 1): void => {
    if (typeof window === 'undefined') return;
    const inventory = getPowerupInventory();
    inventory[powerupId] = (inventory[powerupId] || 0) + quantity;
    localStorage.setItem(STORAGE_KEYS.POWERUP_INVENTORY, JSON.stringify(inventory));
};

export const removePowerupFromInventory = (powerupId: string, quantity: number = 1): boolean => {
    if (typeof window === 'undefined') return false;
    const inventory = getPowerupInventory();
    if ((inventory[powerupId] || 0) < quantity) return false;

    inventory[powerupId] -= quantity;
    if (inventory[powerupId] <= 0) {
        delete inventory[powerupId];
    }
    localStorage.setItem(STORAGE_KEYS.POWERUP_INVENTORY, JSON.stringify(inventory));
    return true;
};

export const getEquippedPowerups = (): string[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.EQUIPPED_POWERUPS);
    return stored ? JSON.parse(stored) : [];
};

export const setEquippedPowerups = (powerups: string[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.EQUIPPED_POWERUPS, JSON.stringify(powerups));
};

export const consumeEquippedPowerups = (): string[] => {
    if (typeof window === 'undefined') return [];
    const equipped = getEquippedPowerups();

    // Remove each equipped powerup from inventory
    equipped.forEach(powerupId => {
        removePowerupFromInventory(powerupId, 1);
    });

    // Clear equipped list
    setEquippedPowerups([]);

    return equipped;
};

// ═══════════════════════════════════════════════════════════════════════════════
// GAME END HELPER - Call this when a game ends
// ═══════════════════════════════════════════════════════════════════════════════

export const recordGameEnd = async (
    mode: 'story' | 'timeAttack' | 'pvp' | 'staked' | 'duel',
    score: number,
    wpm: number,
    wave: number,
    kills: number,
    goldEarned: number,
    wordsTyped: number,
    powerupsUsed: string[],
    won?: boolean,
    walletAddress?: string
): Promise<void> => {
    // Update localStorage statistics (immediate)
    incrementStat(STORAGE_KEYS.TOTAL_GAMES);
    incrementStat(STORAGE_KEYS.TOTAL_KILLS, kills);
    incrementStat(STORAGE_KEYS.TOTAL_GOLD_EARNED, goldEarned);
    incrementStat(STORAGE_KEYS.TOTAL_WORDS_TYPED, wordsTyped);

    // Add to match history
    addMatchToHistory({
        mode: mode === 'staked' || mode === 'duel' ? 'story' : mode,
        score,
        wpm,
        wave,
        kills,
        goldEarned,
        powerupsUsed,
        won,
    });

    // Sync to database if wallet connected
    if (walletAddress) {
        try {
            console.log('📊 Syncing game stats to database via API...');

            const response = await fetch('/api/score/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    walletAddress,
                    score,
                    wpm,
                    waveReached: wave,
                    kills,
                    gameMode: mode,
                    goldEarned,
                    wordsTyped,
                    // Default values for fields not tracked in this context yet
                    misses: 0,
                    typos: 0,
                    duration: 0
                }),
            });

            const data = await response.json();

            if (data.success) {
                console.log('✅ Game stats synced successfully:', data);
            } else {
                console.error('❌ Failed to sync game stats:', data.error);
            }
        } catch (err) {
            console.error('❌ Failed to sync stats to database:', err);
        }
    }
};
