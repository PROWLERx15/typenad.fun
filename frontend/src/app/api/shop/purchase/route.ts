import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAddress } from 'viem';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/shop/purchase
 * 
 * Purchases an item from the shop using gold
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, itemId } = body;

    // Validate wallet address
    if (!walletAddress || !isAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Valid wallet address required' },
        { status: 400 }
      );
    }

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Item ID required' },
        { status: 400 }
      );
    }

    const userAddress = walletAddress.toLowerCase();

    // Get item details
    const { data: item, error: itemError } = await supabase
      .from('shop_items')
      .select('*')
      .eq('id', itemId)
      .eq('available', true)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { success: false, error: 'Item not found or unavailable' },
        { status: 404 }
      );
    }

    // Get user's gold balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('gold_balance')
      .eq('wallet_address', userAddress)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has enough gold
    if (user.gold_balance < item.gold_price) {
      return NextResponse.json(
        { success: false, error: 'Insufficient gold', data: { needed: item.gold_price, have: user.gold_balance } },
        { status: 400 }
      );
    }

    // Check if user already owns this item (for non-consumables)
    if (item.category !== 'consumable') {
      const { data: existingItem } = await supabase
        .from('user_inventory')
        .select('id, quantity')
        .eq('wallet_address', userAddress)
        .eq('item_id', itemId)
        .single();

      if (existingItem) {
        return NextResponse.json(
          { success: false, error: 'You already own this item' },
          { status: 400 }
        );
      }
    }

    // Start transaction: deduct gold and add item to inventory
    // Deduct gold
    const { error: goldError } = await supabase
      .from('users')
      .update({ gold_balance: user.gold_balance - item.gold_price })
      .eq('wallet_address', userAddress);

    if (goldError) throw goldError;

    // Add item to inventory or increment quantity
    const { data: existingInventory } = await supabase
      .from('user_inventory')
      .select('id, quantity')
      .eq('wallet_address', userAddress)
      .eq('item_id', itemId)
      .single();

    if (existingInventory) {
      // Increment quantity for consumables
      const { error: updateError } = await supabase
        .from('user_inventory')
        .update({ quantity: existingInventory.quantity + 1 })
        .eq('id', existingInventory.id);

      if (updateError) throw updateError;
    } else {
      // Insert new inventory item
      const { error: insertError } = await supabase
        .from('user_inventory')
        .insert({
          wallet_address: userAddress,
          item_id: itemId,
          item_type: item.category,
          equipped: false,
          quantity: 1,
        });

      if (insertError) throw insertError;
    }

    console.log(`[shop/purchase] User ${userAddress} purchased ${item.name} for ${item.gold_price} gold`);

    return NextResponse.json({
      success: true,
      data: {
        item: {
          id: item.id,
          name: item.name,
          category: item.category,
        },
        newBalance: user.gold_balance - item.gold_price,
      },
    });
  } catch (error) {
    console.error('[shop/purchase] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
