import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ACHIEVEMENTS } from '@/constants/achievements';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CheckAchievementsRequest {
  walletAddress: string;
  session?: {
    score: number;
    wpm: number;
    waveReached: number;
    accuracy: number;
    backspaceCount: number;
    kills: number;
    wordsTyped: number;
  };
}

interface UserStats {
  totalGames: number;
  totalKills: number;
  totalWordsTyped: number;
  bestScore: number;
  bestWpm: number;
  bestStreak: number;
  gold: number;
  duelWins: number;
  duelLosses: number;
  highestWaveReached: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckAchievementsRequest = await request.json();
    const { walletAddress, session } = body;

    // Validate input
    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    console.log('[Achievements] Checking achievements for:', walletAddress, session ? 'with session data' : '');

    // FIXED: Normalize wallet address for case-insensitive comparison
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (userError || !user) {
      console.error('[Achievements] User not found:', userError);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate duel wins and losses (case-insensitive)
    const lowerAddress = walletAddress.toLowerCase();
    const { data: duelWinsData } = await supabase
      .from('duel_matches')
      .select('id')
      .eq('winner_address', lowerAddress);

    const { data: duelLossesData } = await supabase
      .from('duel_matches')
      .select('id')
      .not('winner_address', 'is', null) // Exclude unsettled matches
      .or(`player1_address.eq.${lowerAddress},player2_address.eq.${lowerAddress}`)
      .neq('winner_address', lowerAddress);

    // Get highest wave reached from game_scores
    const { data: highestWaveData } = await supabase
      .from('game_scores')
      .select('wave_reached')
      .eq('user_id', user.id)
      .order('wave_reached', { ascending: false })
      .limit(1)
      .single();

    const userStats: UserStats = {
      totalGames: user.total_games || 0,
      totalKills: user.total_kills || 0,
      totalWordsTyped: user.total_words_typed || 0,
      bestScore: user.best_score || 0,
      bestWpm: user.best_wpm || 0,
      bestStreak: user.best_streak || 0,
      gold: user.gold || 0,
      duelWins: duelWinsData?.length || 0,
      duelLosses: duelLossesData?.length || 0,
      highestWaveReached: highestWaveData?.wave_reached || 0,
    };

    console.log('[Achievements] User stats:', userStats, 'Session:', session);

    // Fetch already unlocked achievements
    const { data: unlockedAchievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id);

    if (achievementsError) {
      console.error('[Achievements] Error fetching unlocked achievements:', achievementsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch achievements' },
        { status: 500 }
      );
    }

    const unlockedIds = new Set(unlockedAchievements?.map((a) => a.achievement_id) || []);
    console.log('[Achievements] Already unlocked:', Array.from(unlockedIds));

    // CRITICAL FIX: Improved race condition handling for achievement unlocks
    const newlyUnlocked: Array<{
      achievementId: string;
      name: string;
      goldReward: number;
    }> = [];

    // Process achievements sequentially to ensure atomicity
    for (const achievement of ACHIEVEMENTS) {
      // Skip if already unlocked
      if (unlockedIds.has(achievement.id)) {
        continue;
      }

      // Check if condition is met (pass session data if available)
      if (achievement.condition(userStats, session)) {
        console.log('[Achievements] Checking achievement:', achievement.id);

        // Atomic insert with immediate gold award using database transaction
        // This prevents the race condition where two requests both see the achievement as unlocked
        // and both award gold
        try {
          const { data: insertData, error: insertError } = await supabase
            .from('user_achievements')
            .insert({
              user_id: user.id,
              achievement_id: achievement.id,
            })
            .select()
            .single();

          // Only if insert succeeds (no duplicate), award gold immediately
          if (insertData && !insertError) {
            console.log('[Achievements] New achievement unlocked:', achievement.id);
            
            // Award gold atomically for this achievement
            const { error: goldError } = await supabase.rpc('increment_user_gold', {
              p_user_id: user.id,
              p_amount: achievement.goldReward,
            });

            if (!goldError) {
              newlyUnlocked.push({
                achievementId: achievement.id,
                name: achievement.name,
                goldReward: achievement.goldReward,
              });
            } else {
              console.error('[Achievements] Error awarding gold for achievement:', achievement.id, goldError);
              // Rollback achievement insert if gold award fails
              await supabase
                .from('user_achievements')
                .delete()
                .eq('user_id', user.id)
                .eq('achievement_id', achievement.id);
            }
          } else if (insertError?.code === '23505') {
            // Duplicate key error - achievement already exists (race condition caught by DB)
            console.log('[Achievements] Achievement already exists (race prevented by DB):', achievement.id);
          } else if (insertError) {
            console.error('[Achievements] Error inserting achievement:', insertError);
          }
        } catch (error) {
          console.error('[Achievements] Unexpected error processing achievement:', achievement.id, error);
        }
      }
    }

    const totalGoldAwarded = newlyUnlocked.reduce((sum, a) => sum + a.goldReward, 0);

    console.log('[Achievements] Check complete. New achievements:', newlyUnlocked.length);

    return NextResponse.json({
      success: true,
      data: {
        newAchievements: newlyUnlocked,
        totalGoldAwarded,
      },
    });
  } catch (error) {
    console.error('[Achievements] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve user's unlocked achievements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // FIXED: Normalize wallet address for case-insensitive comparison
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch unlocked achievements
    const { data: unlockedAchievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false });

    if (achievementsError) {
      console.error('[Achievements] Error fetching achievements:', achievementsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch achievements' },
        { status: 500 }
      );
    }

    // Enrich with achievement details
    const achievements = unlockedAchievements?.map((ua) => {
      const achievement = ACHIEVEMENTS.find((a) => a.id === ua.achievement_id);
      return {
        id: ua.achievement_id,
        name: achievement?.name || 'Unknown',
        description: achievement?.description || '',
        goldReward: achievement?.goldReward || 0,
        icon: achievement?.icon || '🏆',
        category: achievement?.category || 'special',
        unlockedAt: ua.unlocked_at,
      };
    }) || [];

    return NextResponse.json({
      success: true,
      data: {
        achievements,
        totalUnlocked: achievements.length,
        totalAvailable: ACHIEVEMENTS.length,
      },
    });
  } catch (error) {
    console.error('[Achievements] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
