import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAddress } from 'viem';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/duel/submit
 * 
 * Submits a player's duel results for opponent synchronization
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { duelId, playerAddress, score, wpm, misses, typos } = body;

    // Validate required fields
    if (!duelId) {
      return NextResponse.json(
        { success: false, error: 'Duel ID required' },
        { status: 400 }
      );
    }

    if (!playerAddress || !isAddress(playerAddress)) {
      return NextResponse.json(
        { success: false, error: 'Valid player address required' },
        { status: 400 }
      );
    }

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { success: false, error: 'Valid score required' },
        { status: 400 }
      );
    }

    // Upsert duel result
    const { data, error } = await supabase
      .from('duel_results')
      .upsert({
        duel_id: duelId.toString(),
        player_address: playerAddress.toLowerCase(),
        score,
        wpm: wpm || 0,
        misses: misses || 0,
        typos: typos || 0,
        submitted_at: new Date().toISOString(),
      }, {
        onConflict: 'duel_id,player_address'
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`[duel/submit] Submitted results for duel ${duelId}, player ${playerAddress}: score=${score}`);

    return NextResponse.json({
      success: true,
      data: { resultId: data.id },
    });
  } catch (error) {
    console.error('[duel/submit] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/duel/submit
 * 
 * Gets duel results for a specific duel
 * Query params:
 * - duelId: string (required)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const duelId = searchParams.get('duelId');

    if (!duelId) {
      return NextResponse.json(
        { success: false, error: 'Duel ID required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('duel_results')
      .select('*')
      .eq('duel_id', duelId.toString());

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { results: data || [] },
    });
  } catch (error) {
    console.error('[duel/submit] GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/duel/submit
 * 
 * Cleans up duel results after settlement
 * Query params:
 * - duelId: string (required)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const duelId = searchParams.get('duelId');

    if (!duelId) {
      return NextResponse.json(
        { success: false, error: 'Duel ID required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('duel_results')
      .delete()
      .eq('duel_id', duelId.toString());

    if (error) throw error;

    console.log(`[duel/submit] Cleaned up results for duel ${duelId}`);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('[duel/submit] DELETE Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
