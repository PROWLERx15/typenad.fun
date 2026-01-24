import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ACHIEVEMENTS } from '@/constants/achievements';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CheckAchievementsRequest {
  walletAddress: string;
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
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckAchievementsRequest = await request.json();
    const { walletAddress } = body;

    // Validate input
    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    console.log('[Achievements] Checking achievements for:', walletAddress);

    // Fetch user and their current stats
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (userError || !user) {
      console.error('[Achievements] User not found:', userError);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate duel wins and losses
    const { data: duelWinsData } = await supabase
      .from('duel_matches')
      .select('id')
      .eq('winner_address', walletAddress);

    const { data: duelLossesData } = await supabase
      .from('duel_matches')
      .select('id')
      .or(`player1_address.eq.${walletAddress},player2_address.eq.${walletAddress}`)
      .neq('winner_address', walletAddress);

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
    };

    console.log('[Achievements] User stats:', userStats);

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

    // Check all achievement conditions
    const newlyUnlocked: Array<{
      achievementId: string;
      name: string;
      goldReward: number;
    }> = [];

    let totalGoldAwarded = 0;

    for (const achievement of ACHIEVEMENTS) {
      // Skip if already unlocked
      if (unlockedIds.has(achievement.id)) {
        continue;
      }

      // Check if condition is met
      if (achievement.condition(userStats)) {
        console.log('[Achievements] New achievement unlocked:', achievement.id);

        // Insert achievement record (with conflict handling)
        const { error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_id: achievement.id,
          })
          .select()
          .single();

        // If insert succeeded (no duplicate), award gold
        if (!insertError) {
          newlyUnlocked.push({
            achievementId: achievement.id,
            name: achievement.name,
            goldReward: achievement.goldReward,
          });
          totalGoldAwarded += achievement.goldReward;
        } else if (insertError.code === '23505') {
          // Unique constraint violation - achievement already exists
          console.log('[Achievements] Achievement already exists (race condition):', achievement.id);
        } else {
          console.error('[Achievements] Error inserting achievement:', insertError);
        }
      }
    }

    // Award gold for all newly unlocked achievements in a single update
    if (totalGoldAwarded > 0) {
      const { error: goldError } = await supabase
        .from('users')
        .update({
          gold: user.gold + totalGoldAwarded,
        })
        .eq('id', user.id);

      if (goldError) {
        console.error('[Achievements] Error awarding gold:', goldError);
        // Don't fail the request, achievements are still recorded
      } else {
        console.log('[Achievements] Awarded', totalGoldAwarded, 'gold');
      }
    }

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

    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
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
