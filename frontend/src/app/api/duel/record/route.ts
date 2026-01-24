import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAddress } from 'viem';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/duel/record
 * 
 * Records a completed duel match for history/leaderboard
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      duelId,
      player1Address,
      player2Address,
      winnerAddress,
      stakeAmount,
      payoutAmount,
      player1Score,
      player2Score,
      player1Wpm,
      player2Wpm,
      txHash,
    } = body;

    // Validate required fields
    if (!duelId) {
      return NextResponse.json(
        { success: false, error: 'Duel ID required' },
        { status: 400 }
      );
    }

    if (!player1Address || !isAddress(player1Address)) {
      return NextResponse.json(
        { success: false, error: 'Valid player1 address required' },
        { status: 400 }
      );
    }

    if (!player2Address || !isAddress(player2Address)) {
      return NextResponse.json(
        { success: false, error: 'Valid player2 address required' },
        { status: 400 }
      );
    }

    if (!winnerAddress || !isAddress(winnerAddress)) {
      return NextResponse.json(
        { success: false, error: 'Valid winner address required' },
        { status: 400 }
      );
    }

    // Upsert duel match record
    const { data, error } = await supabase
      .from('duel_matches')
      .upsert({
        duel_id: duelId.toString(),
        player1_address: player1Address.toLowerCase(),
        player2_address: player2Address.toLowerCase(),
        winner_address: winnerAddress.toLowerCase(),
        stake_amount: stakeAmount ? BigInt(stakeAmount).toString() : '0',
        payout_amount: payoutAmount ? BigInt(payoutAmount).toString() : '0',
        player1_score: player1Score || 0,
        player2_score: player2Score || 0,
        player1_wpm: player1Wpm || 0,
        player2_wpm: player2Wpm || 0,
        tx_hash: txHash || null,
        settled_at: new Date().toISOString(),
      }, {
        onConflict: 'duel_id'
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`[duel/record] Recorded duel ${duelId}: winner=${winnerAddress}`);

    return NextResponse.json({
      success: true,
      data: { matchId: data.id },
    });
  } catch (error) {
    console.error('[duel/record] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/duel/record
 * 
 * Gets duel match history
 * Query params:
 * - walletAddress: string (optional, filter by player)
 * - limit: number (default 20)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('duel_matches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (walletAddress && isAddress(walletAddress)) {
      const addr = walletAddress.toLowerCase();
      query = query.or(`player1_address.eq.${addr},player2_address.eq.${addr}`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { matches: data || [] },
    });
  } catch (error) {
    console.error('[duel/record] GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
