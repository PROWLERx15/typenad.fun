import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAddress } from 'viem';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/score/save
 * 
 * Saves a game score and updates user statistics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      walletAddress,
      score,
      waveReached,
      wpm,
      kills,
      gameMode,
      goldEarned,
      misses,
      typos,
      duration,
      isStaked,
      stakeAmount,
      payoutAmount,
      wordsTyped,
      bestStreak,
    } = body;

    // Validate required fields
    if (!walletAddress || !isAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Valid wallet address required' },
        { status: 400 }
      );
    }

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { success: false, error: 'Valid score required' },
        { status: 400 }
      );
    }

    // FIXED: Normalize wallet address for case-insensitive comparison
    let userId: string;
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, gold, total_games, total_kills, total_words_typed, best_score, best_wpm, best_streak')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            wallet_address: walletAddress.toLowerCase(),
            username: `Player ${walletAddress.slice(0, 6)}`,
            gold: goldEarned || 0,
            total_games: 1,
            total_kills: kills || 0,
            total_words_typed: wordsTyped || kills || 0,
            best_score: score,
            best_wpm: wpm || 0,
            best_streak: bestStreak || 0,
          })
          .select('id')
          .single();

        if (createError) throw createError;
        userId = newUser.id;
      } else {
        throw userError;
      }
    } else {
      userId = existingUser.id;

      // Update user stats
      const { error: updateError } = await supabase
        .from('users')
        .update({
          gold: (existingUser.gold || 0) + (goldEarned || 0),
          total_games: (existingUser.total_games || 0) + 1,
          total_kills: (existingUser.total_kills || 0) + (kills || 0),
          total_words_typed: (existingUser.total_words_typed || 0) + (wordsTyped || kills || 0),
          best_score: Math.max(existingUser.best_score || 0, score),
          best_wpm: Math.max(existingUser.best_wpm || 0, wpm || 0),
          best_streak: Math.max(existingUser.best_streak || 0, bestStreak || 0),
          last_seen_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) throw updateError;
    }

    // Insert score record
    const { data: scoreData, error: scoreError } = await supabase
      .from('game_scores')
      .insert({
        user_id: userId,
        score,
        wave_reached: waveReached || 1,
        wpm: wpm || 0,
        kills: kills || 0,
        game_mode: gameMode || 'story',
        gold_earned: goldEarned || 0,
        misses: misses || 0,
        typos: typos || 0,
        duration_seconds: duration || 0,
        words_typed: wordsTyped || kills || 0,
        is_staked: isStaked || false,
        stake_amount: stakeAmount ? BigInt(stakeAmount).toString() : null,
        payout_amount: payoutAmount ? BigInt(payoutAmount).toString() : null,
      })
      .select('id')
      .single();

    if (scoreError) throw scoreError;

    console.log(`[score/save] Saved score ${score} for ${walletAddress} (mode: ${gameMode})`);

    // Calculate accuracy for achievement checking
    const totalAttempts = (wordsTyped || kills || 0) + (typos || 0);
    const accuracy = totalAttempts > 0 ? ((wordsTyped || kills || 0) / totalAttempts) * 100 : 100;

    // FIXED: Use absolute URL for server-side fetch
    // Trigger achievement check with retry logic
    const maxRetries = 3;
    let achievementCheckSuccess = false;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    for (let attempt = 1; attempt <= maxRetries && !achievementCheckSuccess; attempt++) {
      try {
        const achievementResponse = await fetch(`${baseUrl}/api/achievements/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress,
            session: {
              score,
              wpm: wpm || 0,
              waveReached: waveReached || 1,
              accuracy,
              backspaceCount: misses || 0,
              kills: kills || 0,
              wordsTyped: wordsTyped || kills || 0,
            },
          }),
        });

        if (achievementResponse.ok) {
          const achievementData = await achievementResponse.json();
          console.log('[score/save] Achievement check completed:', achievementData);
          achievementCheckSuccess = true;
        } else {
          console.error(`[score/save] Achievement check failed (attempt ${attempt}/${maxRetries}):`, await achievementResponse.text());
          if (attempt < maxRetries) {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      } catch (error) {
        console.error(`[score/save] Achievement check error (attempt ${attempt}/${maxRetries}):`, error);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    if (!achievementCheckSuccess) {
      console.warn('[score/save] Achievement check failed after all retries - achievements may not be awarded');
    }

    return NextResponse.json({
      success: true,
      data: {
        scoreId: scoreData.id,
        userId,
      },
    });
  } catch (error) {
    console.error('[score/save] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/score/save
 * 
 * Gets user's score history
 * Query params:
 * - walletAddress: string (required)
 * - limit: number (default 20)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!walletAddress || !isAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Valid wallet address required' },
        { status: 400 }
      );
    }

    // Get user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          data: { scores: [] },
        });
      }
      throw userError;
    }

    // Get scores
    const { data: scores, error: scoresError } = await supabase
      .from('game_scores')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (scoresError) throw scoresError;

    return NextResponse.json({
      success: true,
      data: { scores: scores || [] },
    });
  } catch (error) {
    console.error('[score/save] GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
