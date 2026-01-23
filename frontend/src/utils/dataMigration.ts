import { supabase } from '../lib/supabaseClient';
import { 
    getPlayerStats, 
    getMatchHistory, 
    getPowerupInventory,
    STORAGE_KEYS 
} from '../constants/gameStats';

interface LocalData {
    walletAddress: string;
    username: string | null;
    gold: number;
    stats: {
        totalGames: number;
        totalKills: number;
        totalGoldEarned: number;
        bestStreak: number;
        totalWordsTyped: number;
        personalBestScore: number;
        personalBestWpm: number;
    };
    inventory: Record<string, number>;
    matchHistory: any[];
    killedTypes: number[];
}

/**
 * Collect all local data from localStorage
 */
export function collectLocalData(walletAddress: string): LocalData {
    if (typeof window === 'undefined') {
        throw new Error('Can only run in browser');
    }

    const stats = getPlayerStats();
    const inventory = getPowerupInventory();
    const matchHistory = getMatchHistory();
    
    return {
        walletAddress,
        username: localStorage.getItem(STORAGE_KEYS.DISPLAY_NAME),
        gold: parseInt(localStorage.getItem(STORAGE_KEYS.PLAYER_GOLD) || '0'),
        stats: {
            totalGames: stats.totalGames,
            totalKills: stats.totalKills,
            totalGoldEarned: stats.totalGoldEarned,
            bestStreak: stats.bestStreak,
            totalWordsTyped: stats.totalWordsTyped,
            personalBestScore: parseInt(localStorage.getItem(STORAGE_KEYS.PERSONAL_BEST_SCORE) || '0'),
            personalBestWpm: parseInt(localStorage.getItem(STORAGE_KEYS.PERSONAL_BEST_WPM) || '0'),
        },
        inventory,
        matchHistory,
        killedTypes: JSON.parse(localStorage.getItem(STORAGE_KEYS.KILLED_TYPES) || '[]'),
    };
}

/**
 * Migrate local data to Supabase
 */
export async function migrateToSupabase(walletAddress: string): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        console.log('🔄 Starting migration for:', walletAddress);
        
        // Collect local data
        const localData = collectLocalData(walletAddress);
        
        // 1. Create or get user
        let userId: string;
        const { data: existingUser } = await supabase
            .from('users')
            .select('id, gold')
            .eq('wallet_address', walletAddress)
            .single();

        if (existingUser) {
            userId = existingUser.id;
            console.log('✅ User exists:', userId);
            
            // Update user data (merge gold - take higher value)
            const mergedGold = Math.max(existingUser.gold || 0, localData.gold);
            await supabase
                .from('users')
                .update({
                    username: localData.username || `Player ${walletAddress.slice(0, 6)}`,
                    gold: mergedGold,
                    last_seen_at: new Date().toISOString(),
                })
                .eq('id', userId);
            
            console.log('✅ User updated with gold:', mergedGold);
        } else {
            // Create new user
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                    wallet_address: walletAddress,
                    username: localData.username || `Player ${walletAddress.slice(0, 6)}`,
                    gold: localData.gold,
                })
                .select('id')
                .single();

            if (createError || !newUser) {
                throw new Error(`Failed to create user: ${createError?.message}`);
            }

            userId = newUser.id;
            console.log('✅ User created:', userId);
        }

        // 2. Migrate inventory
        for (const [itemId, quantity] of Object.entries(localData.inventory)) {
            if (quantity > 0) {
                const { data: existingItem } = await supabase
                    .from('user_inventory')
                    .select('quantity')
                    .eq('user_id', userId)
                    .eq('item_id', itemId)
                    .single();

                if (existingItem) {
                    // Add to existing quantity
                    await supabase
                        .from('user_inventory')
                        .update({
                            quantity: existingItem.quantity + quantity,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('user_id', userId)
                        .eq('item_id', itemId);
                } else {
                    // Create new inventory item
                    await supabase
                        .from('user_inventory')
                        .insert({
                            user_id: userId,
                            item_id: itemId,
                            quantity,
                        });
                }
            }
        }
        console.log('✅ Inventory migrated');

        // 3. Migrate match history (last 20 games)
        const recentMatches = localData.matchHistory.slice(0, 20);
        for (const match of recentMatches) {
            // Check if match already exists (by date and score)
            const { data: existingMatch } = await supabase
                .from('game_scores')
                .select('id')
                .eq('user_id', userId)
                .eq('score', match.score)
                .eq('created_at', match.date)
                .single();

            if (!existingMatch) {
                await supabase
                    .from('game_scores')
                    .insert({
                        user_id: userId,
                        score: match.score,
                        wave_reached: match.wave || 1,
                        wpm: match.wpm,
                        game_mode: match.mode,
                        kills: match.kills || 0,
                        created_at: match.date,
                    });
            }
        }
        console.log('✅ Match history migrated');

        // 4. Migrate achievements (killed enemy types)
        for (const enemyTypeId of localData.killedTypes) {
            const achievementId = `enemy_type_${enemyTypeId}`;
            
            const { data: existingAchievement } = await supabase
                .from('user_achievements')
                .select('id')
                .eq('user_id', userId)
                .eq('achievement_id', achievementId)
                .single();

            if (!existingAchievement) {
                await supabase
                    .from('user_achievements')
                    .insert({
                        user_id: userId,
                        achievement_id: achievementId,
                    });
            }
        }
        console.log('✅ Achievements migrated');

        // 5. Mark migration as complete
        localStorage.setItem('migration_completed', 'true');
        localStorage.setItem('migration_date', new Date().toISOString());
        
        console.log('🎉 Migration completed successfully!');
        return { success: true };

    } catch (error) {
        console.error('❌ Migration failed:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        };
    }
}

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
    if (typeof window === 'undefined') return false;
    
    const migrationCompleted = localStorage.getItem('migration_completed');
    const migrationSkipped = localStorage.getItem('migration_skipped');
    const hasLocalData = localStorage.getItem(STORAGE_KEYS.TOTAL_GAMES) !== null;
    
    return !migrationCompleted && !migrationSkipped && hasLocalData;
}

/**
 * Clear local data after successful migration (optional - use with caution)
 */
export function clearLocalData() {
    if (typeof window === 'undefined') return;
    
    const keysToKeep = [
        'migration_completed',
        'migration_date',
        'migration_skipped',
        'seenOnboarding',
    ];
    
    Object.values(STORAGE_KEYS).forEach(key => {
        if (!keysToKeep.includes(key)) {
            localStorage.removeItem(key);
        }
    });
    
    console.log('🧹 Local data cleared');
}
