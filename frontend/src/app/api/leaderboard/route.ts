import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/leaderboard
 * 
 * Fetches the leaderboard with optional filters
 * Query params:
 * - limit: number (default 50)
 * - offset: number (default 0)
 * - timeRange: 'all' | 'today' | 'week' | 'month' (default 'all')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const timeRange = searchParams.get('timeRange') || 'all';

    // Validate inputs
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from('game_scores')
      .select(`
        score,
        wpm,
        wave_reached,
        game_mode,
        created_at,
        users (
          wallet_address,
          username,
          profile_picture
        )
      `)
      .order('score', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    // Apply time filter
    if (timeRange === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query = query.gte('created_at', today.toISOString());
    } else if (timeRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte('created_at', weekAgo.toISOString());
    } else if (timeRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.gte('created_at', monthAgo.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('[leaderboard] Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    // Format response
    const leaderboard = (data || []).map((entry: any, index: number) => ({
      rank: offset + index + 1,
      walletAddress: entry.users?.wallet_address || 'Unknown',
      username: entry.users?.username || `Player ${entry.users?.wallet_address?.slice(0, 6) || 'Unknown'}`,
      profilePicture: entry.users?.profile_picture,
      score: entry.score,
      wpm: entry.wpm,
      waveReached: entry.wave_reached,
      gameMode: entry.game_mode,
      createdAt: entry.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: leaderboard,
      pagination: {
        limit,
        offset,
        hasMore: leaderboard.length === limit,
      },
    });
  } catch (error) {
    console.error('[leaderboard] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
