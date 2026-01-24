import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAddress } from 'viem';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface EquipRequest {
  walletAddress: string;
  itemId: string;
}

/**
 * POST /api/shop/equip
 * 
 * Equip an item from user's inventory
 */
export async function POST(request: NextRequest) {
  try {
    const body: EquipRequest = await request.json();
    const { walletAddress, itemId } = body;

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

    console.log('[shop/equip] Equip request:', { walletAddress, itemId });

    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    if (userError || !user) {
      console.error('[shop/equip] User not found:', userError);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user owns the item
    const { data: inventoryItem, error: inventoryError } = await supabase
      .from('user_inventory')
      .select('*, shop_items!inner(*)')
      .eq('user_id', user.id)
      .eq('item_id', itemId)
      .single();

    if (inventoryError || !inventoryItem) {
      console.error('[shop/equip] Item not in inventory:', inventoryError);
      return NextResponse.json(
        { success: false, error: 'Item not found in inventory' },
        { status: 404 }
      );
    }

    // Check if item quantity is > 0
    if (inventoryItem.quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'No items available to equip' },
        { status: 400 }
      );
    }

    const itemType = inventoryItem.item_type;

    // For hero and cosmetic items, unequip other items of the same type
    if (itemType === 'hero' || itemType === 'cosmetic') {
      const { error: unequipError } = await supabase
        .from('user_inventory')
        .update({ equipped: false })
        .eq('user_id', user.id)
        .eq('item_type', itemType)
        .neq('item_id', itemId);

      if (unequipError) {
        console.error('[shop/equip] Error unequipping other items:', unequipError);
        return NextResponse.json(
          { success: false, error: 'Failed to unequip other items' },
          { status: 500 }
        );
      }
    }

    // Equip the item
    const { error: equipError } = await supabase
      .from('user_inventory')
      .update({
        equipped: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inventoryItem.id);

    if (equipError) {
      console.error('[shop/equip] Error equipping item:', equipError);
      return NextResponse.json(
        { success: false, error: 'Failed to equip item' },
        { status: 500 }
      );
    }

    console.log('[shop/equip] Item equipped successfully:', itemId);

    return NextResponse.json({
      success: true,
      data: {
        itemId,
        itemType,
        equipped: true,
      },
    });
  } catch (error) {
    console.error('[shop/equip] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/shop/equip
 * 
 * Get user's equipped items
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

    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch equipped items
    const { data: equippedItems, error: inventoryError } = await supabase
      .from('user_inventory')
      .select('item_id, item_type, quantity, equipped')
      .eq('user_id', user.id)
      .eq('equipped', true);

    if (inventoryError) {
      console.error('[shop/equip] Error fetching equipped items:', inventoryError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch equipped items' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        equippedItems: equippedItems || [],
      },
    });
  } catch (error) {
    console.error('[shop/equip] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
