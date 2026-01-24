import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAddress } from 'viem';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/user/stats
 * 
 * Fetches user statistics
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

    // Fetch user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        wallet_address,
        username,
        email,
        profile_picture,
        gold,
        total_games,
        total_kills,
        total_words_typed,
        best_streak,
        best_score,
        best_wpm,
        created_at,
        last_seen_at
      `)
      .eq('wallet_address', walletAddress)
      .single();

    if (userError) {
      // User not found is OK - return empty stats
      if (userError.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          data: {
            exists: false,
            walletAddress,
            stats: {
              gold: 0,
              totalGames: 0,
              totalKills: 0,
              totalWordsTyped: 0,
              bestStreak: 0,
              bestScore: 0,
              bestWpm: 0,
            },
          },
        });
      }
      throw userError;
    }

    // Fetch recent scores
    const { data: recentScores } = await supabase
      .from('game_scores')
      .select('score, wpm, wave_reached, game_mode, kills, created_at')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Fetch inventory
    const { data: inventory } = await supabase
      .from('user_inventory')
      .select('item_id, quantity')
      .eq('user_id', userData.id);

    // Fetch achievements
    const { data: achievements } = await supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', userData.id);

    // Fetch duel history
    const { data: duelHistory } = await supabase
      .from('duel_matches')
      .select('*')
      .or(`player1_address.eq.${walletAddress},player2_address.eq.${walletAddress}`)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        exists: true,
        walletAddress: userData.wallet_address,
        username: userData.username,
        email: userData.email,
        profilePicture: userData.profile_picture,
        stats: {
          gold: userData.gold || 0,
          totalGames: userData.total_games || 0,
          totalKills: userData.total_kills || 0,
          totalWordsTyped: userData.total_words_typed || 0,
          bestStreak: userData.best_streak || 0,
          bestScore: userData.best_score || 0,
          bestWpm: userData.best_wpm || 0,
        },
        recentScores: recentScores || [],
        inventory: (inventory || []).reduce((acc: any, item: any) => {
          acc[item.item_id] = item.quantity;
          return acc;
        }, {}),
        achievements: achievements || [],
        duelHistory: duelHistory || [],
        createdAt: userData.created_at,
        lastSeenAt: userData.last_seen_at,
      },
    });
  } catch (error) {
    console.error('[user/stats] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/stats
 * 
 * Creates or updates user profile
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, username, email, googleId, profilePicture } = body;

    if (!walletAddress || !isAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Valid wallet address required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    let userId: string;

    if (existingUser) {
      // Update existing user
      const updateData: any = { last_seen_at: new Date().toISOString() };
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (googleId) updateData.google_id = googleId;
      if (profilePicture) updateData.profile_picture = profilePicture;

      await supabase
        .from('users')
        .update(updateData)
        .eq('id', existingUser.id);

      userId = existingUser.id;
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          wallet_address: walletAddress,
          username: username || `Player ${walletAddress.slice(0, 6)}`,
          email,
          google_id: googleId,
          profile_picture: profilePicture,
        })
        .select('id')
        .single();

      if (createError) throw createError;
      userId = newUser.id;
    }

    return NextResponse.json({
      success: true,
      data: { userId },
    });
  } catch (error) {
    console.error('[user/stats] POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
