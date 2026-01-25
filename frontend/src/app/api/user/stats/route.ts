import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAddress } from 'viem';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cache for user stats (1 minute TTL)
const statsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

/**
 * GET /api/user/stats
 * 
 * Get user's aggregate statistics
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

    // Check cache
    const cached = statsCache.get(walletAddress);
    const now = Date.now();
    if (cached && now - cached.timestamp < CACHE_TTL) {
      console.log('[user/stats] Returning cached stats for:', walletAddress);
      return NextResponse.json({
        success: true,
        data: cached.data,
      });
    }

    console.log('[user/stats] Fetching stats for:', walletAddress);

    // FIXED: Normalize wallet address for case-insensitive comparison
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (userError || !user) {
      console.error('[user/stats] User not found:', userError);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate achievement count
    const { data: achievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', user.id);

    if (achievementsError) {
      console.error('[user/stats] Error fetching achievements:', achievementsError);
    }

    // Calculate duel wins
    const { data: duelWins, error: winsError } = await supabase
      .from('duel_matches')
      .select('id')
      .eq('winner_address', walletAddress);

    if (winsError) {
      console.error('[user/stats] Error fetching duel wins:', winsError);
    }

    // Calculate duel losses (case-insensitive, exclude unsettled matches)
    const lowerAddress = walletAddress.toLowerCase();
    const { data: duelLosses, error: lossesError } = await supabase
      .from('duel_matches')
      .select('id')
      .not('winner_address', 'is', null) // Exclude unsettled matches
      .or(`player1_address.eq.${lowerAddress},player2_address.eq.${lowerAddress}`)
      .neq('winner_address', lowerAddress); // Case-insensitive comparison

    if (lossesError) {
      console.error('[user/stats] Error fetching duel losses:', lossesError);
    }

    // Calculate leaderboard rank (based on best_score)
    const { data: rankData, error: rankError } = await supabase
      .from('users')
      .select('wallet_address')
      .gt('best_score', user.best_score || 0)
      .order('best_score', { ascending: false });

    let leaderboardRank: number | null = null;
    if (!rankError && rankData) {
      leaderboardRank = rankData.length + 1;
    }

    const stats = {
      totalGames: user.total_games || 0,
      totalKills: user.total_kills || 0,
      totalWordsTyped: user.total_words_typed || 0,
      bestScore: user.best_score || 0,
      bestWpm: user.best_wpm || 0,
      bestStreak: user.best_streak || 0,
      gold: user.gold || 0,
      achievementCount: achievements?.length || 0,
      duelWins: duelWins?.length || 0,
      duelLosses: duelLosses?.length || 0,
      leaderboardRank,
    };

    // Update cache
    statsCache.set(walletAddress, { data: stats, timestamp: now });

    console.log('[user/stats] Stats fetched successfully');

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('[user/stats] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Invalidate cache for a user (called after score save)
 */
export function invalidateStatsCache(walletAddress: string) {
  statsCache.delete(walletAddress);
}
