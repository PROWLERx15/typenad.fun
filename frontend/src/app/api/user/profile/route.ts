import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAddress } from 'viem';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/user/profile
 * 
 * Get complete user profile with stats, recent games, and achievements
 * Query params:
 * - walletAddress: string (required)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress || !isAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Valid wallet address required' },
        { status: 400 }
      );
    }

    console.log('[user/profile] Fetching profile for:', walletAddress);

    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (userError || !user) {
      console.error('[user/profile] User not found:', userError);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch user stats (reuse logic from /api/user/stats)
    const [achievementsResult, duelWinsResult, duelLossesResult, rankResult, recentGamesResult] =
      await Promise.all([
        // Achievements
        supabase
          .from('user_achievements')
          .select('achievement_id, unlocked_at')
          .eq('user_id', user.id)
          .order('unlocked_at', { ascending: false }),

        // Duel wins
        supabase.from('duel_matches').select('id').eq('winner_address', walletAddress),

        // Duel losses
        supabase
          .from('duel_matches')
          .select('id')
          .or(`player1_address.eq.${walletAddress},player2_address.eq.${walletAddress}`)
          .neq('winner_address', walletAddress),

        // Leaderboard rank
        supabase
          .from('users')
          .select('wallet_address')
          .gt('best_score', user.best_score || 0)
          .order('best_score', { ascending: false }),

        // Recent games (last 10)
        supabase
          .from('game_scores')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

    const achievements = achievementsResult.data || [];
    const duelWins = duelWinsResult.data || [];
    const duelLosses = duelLossesResult.data || [];
    const rankData = rankResult.data || [];
    const recentGames = recentGamesResult.data || [];

    const leaderboardRank = rankData.length + 1;

    const stats = {
      totalGames: user.total_games || 0,
      totalKills: user.total_kills || 0,
      totalWordsTyped: user.total_words_typed || 0,
      bestScore: user.best_score || 0,
      bestWpm: user.best_wpm || 0,
      bestStreak: user.best_streak || 0,
      gold: user.gold || 0,
      achievementCount: achievements.length,
      duelWins: duelWins.length,
      duelLosses: duelLosses.length,
      leaderboardRank,
    };

    const profile = {
      user: {
        walletAddress: user.wallet_address,
        username: user.username || `Player ${user.wallet_address.slice(0, 6)}`,
        profilePicture: user.profile_picture || null,
        createdAt: user.created_at,
        lastSeenAt: user.last_seen_at,
      },
      stats,
      recentGames: recentGames.map((game) => ({
        id: game.id,
        score: game.score,
        waveReached: game.wave_reached,
        wpm: game.wpm,
        kills: game.kills,
        gameMode: game.game_mode,
        goldEarned: game.gold_earned,
        durationSeconds: game.duration_seconds,
        createdAt: game.created_at,
      })),
      achievements: achievements.map((a) => ({
        achievementId: a.achievement_id,
        unlockedAt: a.unlocked_at,
      })),
    };

    console.log('[user/profile] Profile fetched successfully');

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('[user/profile] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
