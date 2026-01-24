import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cache for leaderboard results (5 minutes TTL)
const leaderboardCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

type LeaderboardCategory = 'best_score' | 'best_wpm' | 'total_kills' | 'duel_wins';
type TimeRange = 'all' | 'today' | 'week' | 'month';

/**
 * GET /api/leaderboard
 * 
 * Get leaderboard rankings with multiple categories and filtering
 * Query params:
 * - category: 'best_score' | 'best_wpm' | 'total_kills' | 'duel_wins' (optional, default 'best_score')
 * - timeRange: 'all' | 'today' | 'week' | 'month' (optional, default 'all')
 * - limit: number (optional, default 50, max 100)
 * - offset: number (optional, default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get('category') || 'best_score') as LeaderboardCategory;
    const timeRange = (searchParams.get('timeRange') || 'all') as TimeRange;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate category
    if (!['best_score', 'best_wpm', 'total_kills', 'duel_wins'].includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category parameter' },
        { status: 400 }
      );
    }

    // Validate time range
    if (!['all', 'today', 'week', 'month'].includes(timeRange)) {
      return NextResponse.json(
        { success: false, error: 'Invalid timeRange parameter' },
        { status: 400 }
      );
    }

    console.log('[leaderboard] Fetching leaderboard:', { category, timeRange, limit, offset });

    // Check cache
    const cacheKey = `${category}-${timeRange}-${limit}-${offset}`;
    const cached = leaderboardCache.get(cacheKey);
    const now = Date.now();
    if (cached && now - cached.timestamp < CACHE_TTL) {
      console.log('[leaderboard] Returning cached results');
      return NextResponse.json({
        success: true,
        data: cached.data,
      });
    }

    // Handle duel_wins category separately (requires join with duel_matches)
    if (category === 'duel_wins') {
      return await getDuelWinsLeaderboard(timeRange, limit, offset, cacheKey);
    }

    // Build query for user-based categories
    let query = supabase
      .from('users')
      .select('wallet_address, username, profile_picture, ' + category, { count: 'exact' })
      .gt(category, 0)
      .order(category, { ascending: false });

    // Apply time range filtering (based on last_seen_at for user stats)
    if (timeRange !== 'all') {
      const cutoffDate = getTimeRangeCutoff(timeRange);
      query = query.gte('last_seen_at', cutoffDate.toISOString());
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: users, error: usersError, count } = await query;

    if (usersError) {
      console.error('[leaderboard] Error fetching leaderboard:', usersError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    const hasMore = count ? offset + limit < count : false;

    // Format results with rank
    const leaderboard = ((users || []) as any[]).map((user, index) => ({
      rank: offset + index + 1,
      walletAddress: user.wallet_address,
      username: user.username || `Player ${user.wallet_address.slice(0, 6)}`,
      profilePicture: user.profile_picture || null,
      value: user[category],
    }));

    const result = {
      leaderboard,
      category,
      timeRange,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore,
      },
    };

    // Update cache
    leaderboardCache.set(cacheKey, { data: result, timestamp: now });

    console.log('[leaderboard] Fetched', leaderboard.length, 'entries (total:', count, ')');

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[leaderboard] Unexpected error:', error);
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
 * Get duel wins leaderboard (requires aggregation from duel_matches)
 */
async function getDuelWinsLeaderboard(
  timeRange: TimeRange,
  limit: number,
  offset: number,
  cacheKey: string
) {
  try {
    // Build query for duel wins
    let query = supabase
      .from('duel_matches')
      .select('winner_address, settled_at');

    // Apply time range filtering
    if (timeRange !== 'all') {
      const cutoffDate = getTimeRangeCutoff(timeRange);
      query = query.gte('settled_at', cutoffDate.toISOString());
    }

    const { data: matches, error: matchesError } = await query;

    if (matchesError) {
      console.error('[leaderboard] Error fetching duel matches:', matchesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch duel leaderboard' },
        { status: 500 }
      );
    }

    // Aggregate wins by address
    const winCounts = new Map<string, number>();
    matches?.forEach((match) => {
      const count = winCounts.get(match.winner_address) || 0;
      winCounts.set(match.winner_address, count + 1);
    });

    // Sort by win count
    const sortedAddresses = Array.from(winCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(offset, offset + limit);

    // Fetch user details for top winners
    const addresses = sortedAddresses.map(([address]) => address);
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('wallet_address, username, profile_picture')
      .in('wallet_address', addresses);

    if (usersError) {
      console.error('[leaderboard] Error fetching user details:', usersError);
    }

    // Create user map for quick lookup
    const userMap = new Map(users?.map((u) => [u.wallet_address, u]) || []);

    // Format results
    const leaderboard = sortedAddresses.map(([address, wins], index) => {
      const user = userMap.get(address);
      return {
        rank: offset + index + 1,
        walletAddress: address,
        username: user?.username || `Player ${address.slice(0, 6)}`,
        profilePicture: user?.profile_picture || null,
        value: wins,
      };
    });

    const result = {
      leaderboard,
      category: 'duel_wins',
      timeRange,
      pagination: {
        total: winCounts.size,
        limit,
        offset,
        hasMore: offset + limit < winCounts.size,
      },
    };

    // Update cache
    leaderboardCache.set(cacheKey, { data: result, timestamp: Date.now() });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[leaderboard] Error in duel wins leaderboard:', error);
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
 * Get cutoff date for time range filtering
 */
function getTimeRangeCutoff(timeRange: TimeRange): Date {
  const now = new Date();
  switch (timeRange) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week':
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return weekAgo;
    case 'month':
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return monthAgo;
    default:
      return new Date(0); // Beginning of time
  }
}
