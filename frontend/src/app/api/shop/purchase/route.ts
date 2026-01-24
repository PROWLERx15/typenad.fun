import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAddress } from 'viem';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PurchaseRequest {
  walletAddress: string;
  itemId: string;
  quantity?: number;
}

/**
 * POST /api/shop/purchase
 * 
 * Purchase an item from the shop
 */
export async function POST(request: NextRequest) {
  try {
    const body: PurchaseRequest = await request.json();
    const { walletAddress, itemId, quantity = 1 } = body;

    // Validate input
    if (!walletAddress || !isAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Valid wallet address required' },
        { status: 400 }
      );
    }

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be at least 1' },
        { status: 400 }
      );
    }

    console.log('[shop/purchase] Purchase request:', { walletAddress, itemId, quantity });

    // Fetch item details
    const { data: item, error: itemError } = await supabase
      .from('shop_items')
      .select('*')
      .eq('id', itemId)
      .eq('available', true)
      .single();

    if (itemError || !item) {
      console.error('[shop/purchase] Item not found:', itemError);
      return NextResponse.json(
        { success: false, error: 'Item not found or unavailable' },
        { status: 404 }
      );
    }

    const totalCost = item.gold_price * quantity;

    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, gold')
      .eq('wallet_address', walletAddress)
      .single();

    if (userError || !user) {
      console.error('[shop/purchase] User not found:', userError);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has enough gold
    if (user.gold < totalCost) {
      console.log('[shop/purchase] Insufficient gold:', { has: user.gold, needs: totalCost });
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient gold',
          data: {
            currentGold: user.gold,
            requiredGold: totalCost,
            shortfall: totalCost - user.gold,
          },
        },
        { status: 400 }
      );
    }

    // Deduct gold from user
    const { error: goldError } = await supabase
      .from('users')
      .update({
        gold: user.gold - totalCost,
      })
      .eq('id', user.id);

    if (goldError) {
      console.error('[shop/purchase] Error deducting gold:', goldError);
      return NextResponse.json(
        { success: false, error: 'Failed to process payment' },
        { status: 500 }
      );
    }

    // Check if item already in inventory
    const { data: existingItem, error: inventoryCheckError } = await supabase
      .from('user_inventory')
      .select('*')
      .eq('user_id', user.id)
      .eq('item_id', itemId)
      .single();

    if (inventoryCheckError && inventoryCheckError.code !== 'PGRST116') {
      console.error('[shop/purchase] Error checking inventory:', inventoryCheckError);
      // Rollback gold deduction
      await supabase
        .from('users')
        .update({ gold: user.gold })
        .eq('id', user.id);

      return NextResponse.json(
        { success: false, error: 'Failed to update inventory' },
        { status: 500 }
      );
    }

    // Update or insert inventory
    if (existingItem) {
      // Increment quantity
      const { error: updateError } = await supabase
        .from('user_inventory')
        .update({
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingItem.id);

      if (updateError) {
        console.error('[shop/purchase] Error updating inventory:', updateError);
        // Rollback gold deduction
        await supabase
          .from('users')
          .update({ gold: user.gold })
          .eq('id', user.id);

        return NextResponse.json(
          { success: false, error: 'Failed to update inventory' },
          { status: 500 }
        );
      }
    } else {
      // Create new inventory entry
      const { error: insertError } = await supabase
        .from('user_inventory')
        .insert({
          user_id: user.id,
          item_id: itemId,
          item_type: item.category,
          quantity,
          equipped: false,
        });

      if (insertError) {
        console.error('[shop/purchase] Error inserting inventory:', insertError);
        // Rollback gold deduction
        await supabase
          .from('users')
          .update({ gold: user.gold })
          .eq('id', user.id);

        return NextResponse.json(
          { success: false, error: 'Failed to update inventory' },
          { status: 500 }
        );
      }
    }

    console.log('[shop/purchase] Purchase successful:', {
      itemId,
      quantity,
      totalCost,
      remainingGold: user.gold - totalCost,
    });

    return NextResponse.json({
      success: true,
      data: {
        itemId,
        itemName: item.name,
        quantity,
        totalCost,
        remainingGold: user.gold - totalCost,
      },
    });
  } catch (error) {
    console.error('[shop/purchase] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
