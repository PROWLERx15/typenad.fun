import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAddress } from 'viem';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/score/history
 * 
 * Get user's game history with filtering and pagination
 * Query params:
 * - walletAddress: string (required)
 * - gameMode: 'story' | 'staked' | 'duel' | 'all' (optional, default 'all')
 * - limit: number (optional, default 20, max 100)
 * - offset: number (optional, default 0)
 * - sortBy: 'score' | 'wpm' | 'created_at' (optional, default 'created_at')
 * - sortOrder: 'asc' | 'desc' (optional, default 'desc')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const gameMode = searchParams.get('gameMode') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Validate input
    if (!walletAddress || !isAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Valid wallet address required' },
        { status: 400 }
      );
    }

    if (!['score', 'wpm', 'created_at'].includes(sortBy)) {
      return NextResponse.json(
        { success: false, error: 'Invalid sortBy parameter' },
        { status: 400 }
      );
    }

    if (!['asc', 'desc'].includes(sortOrder)) {
      return NextResponse.json(
        { success: false, error: 'Invalid sortOrder parameter' },
        { status: 400 }
      );
    }

    console.log('[score/history] Fetching history for:', {
      walletAddress,
      gameMode,
      limit,
      offset,
      sortBy,
      sortOrder,
    });

    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    if (userError || !user) {
      console.error('[score/history] User not found:', userError);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Build query
    let query = supabase
      .from('game_scores')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Filter by game mode if specified
    if (gameMode !== 'all') {
      query = query.eq('game_mode', gameMode);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: scores, error: scoresError, count } = await query;

    if (scoresError) {
      console.error('[score/history] Error fetching scores:', scoresError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch game history' },
        { status: 500 }
      );
    }

    const hasMore = count ? offset + limit < count : false;

    console.log('[score/history] Fetched', scores?.length || 0, 'scores (total:', count, ')');

    return NextResponse.json({
      success: true,
      data: {
        scores: scores || [],
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore,
        },
      },
    });
  } catch (error) {
    console.error('[score/history] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
