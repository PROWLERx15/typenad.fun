import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAddress } from 'viem';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/user/achievements
 * 
 * Gets user's achievements
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

    // Get user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (!user) {
      return NextResponse.json({
        success: true,
        data: { achievements: [] },
      });
    }

    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { achievements: data || [] },
    });
  } catch (error) {
    console.error('[user/achievements] GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/achievements
 * 
 * Unlocks an achievement for a user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, achievementId } = body;

    if (!walletAddress || !isAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Valid wallet address required' },
        { status: 400 }
      );
    }

    if (!achievementId) {
      return NextResponse.json(
        { success: false, error: 'Achievement ID required' },
        { status: 400 }
      );
    }

    const userAddress = walletAddress.toLowerCase();

    // Get user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', userAddress)
      .single();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already unlocked
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', user.id)
      .eq('achievement_id', achievementId)
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        data: { alreadyUnlocked: true },
      });
    }

    // Unlock the achievement
    const { error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: user.id,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString(),
      });

    if (error) throw error;

    console.log(`[user/achievements] User ${userAddress} unlocked achievement ${achievementId}`);

    return NextResponse.json({
      success: true,
      data: { unlocked: true, achievementId },
    });
  } catch (error) {
    console.error('[user/achievements] POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
