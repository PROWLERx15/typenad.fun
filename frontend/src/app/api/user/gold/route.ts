import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAddress } from 'viem';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/user/gold
 * 
 * Fetches user's gold balance
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

    const { data, error } = await supabase
      .from('users')
      .select('gold')
      .eq('wallet_address', walletAddress)
      .single();

    if (error) {
      // User not found - return 0 gold
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          data: { gold: 0 },
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: { gold: data.gold || 0 },
    });
  } catch (error) {
    console.error('[user/gold] GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/gold
 * 
 * Updates user's gold balance
 * Body:
 * - walletAddress: string (required)
 * - action: 'add' | 'subtract' | 'set' (required)
 * - amount: number (required)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, action, amount } = body;

    if (!walletAddress || !isAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Valid wallet address required' },
        { status: 400 }
      );
    }

    if (!['add', 'subtract', 'set'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Action must be "add", "subtract", or "set"' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be a non-negative number' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, gold')
      .eq('wallet_address', walletAddress)
      .single();

    if (userError) {
      // Create user if not exists
      if (userError.code === 'PGRST116') {
        const newGold = action === 'subtract' ? 0 : amount;
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            wallet_address: walletAddress,
            username: `Player ${walletAddress.slice(0, 6)}`,
            gold: newGold,
          })
          .select('gold')
          .single();

        if (createError) throw createError;

        return NextResponse.json({
          success: true,
          data: { gold: newUser.gold },
        });
      }
      throw userError;
    }

    // Calculate new gold
    let newGold: number;
    const currentGold = userData.gold || 0;

    switch (action) {
      case 'add':
        newGold = currentGold + amount;
        break;
      case 'subtract':
        newGold = Math.max(0, currentGold - amount);
        break;
      case 'set':
        newGold = amount;
        break;
      default:
        newGold = currentGold;
    }

    // Update gold
    const { error: updateError } = await supabase
      .from('users')
      .update({ gold: newGold, last_seen_at: new Date().toISOString() })
      .eq('id', userData.id);

    if (updateError) throw updateError;

    console.log(`[user/gold] ${action} ${amount} gold for ${walletAddress}: ${currentGold} -> ${newGold}`);

    return NextResponse.json({
      success: true,
      data: { 
        gold: newGold,
        previousGold: currentGold,
        change: newGold - currentGold,
      },
    });
  } catch (error) {
    console.error('[user/gold] POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
