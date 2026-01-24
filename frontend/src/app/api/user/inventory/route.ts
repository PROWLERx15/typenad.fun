import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAddress } from 'viem';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/user/inventory
 * 
 * Gets user's inventory
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
        data: { inventory: [] },
      });
    }

    const { data, error } = await supabase
      .from('user_inventory')
      .select(`
        *,
        shop_items (
          name,
          description,
          category,
          gold_price
        )
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { inventory: data || [] },
    });
  } catch (error) {
    console.error('[user/inventory] GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/inventory
 * 
 * Updates inventory item (equip/unequip, use consumable)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, inventoryId, action } = body;

    if (!walletAddress || !isAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Valid wallet address required' },
        { status: 400 }
      );
    }

    if (!inventoryId || !action) {
      return NextResponse.json(
        { success: false, error: 'Inventory ID and action required' },
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

    // Get the inventory item
    const { data: item, error: itemError } = await supabase
      .from('user_inventory')
      .select('*')
      .eq('id', inventoryId)
      .eq('user_id', user.id)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'equip': {
        // Unequip all items of the same type first
        await supabase
          .from('user_inventory')
          .update({ equipped: false })
          .eq('user_id', user.id)
          .eq('item_type', item.item_type || 'hero'); // Default fallback

        // Equip this item
        const { error } = await supabase
          .from('user_inventory')
          .update({ equipped: true, updated_at: new Date().toISOString() })
          .eq('id', inventoryId);

        if (error) throw error;
        break;
      }

      case 'unequip': {
        const { error } = await supabase
          .from('user_inventory')
          .update({ equipped: false, updated_at: new Date().toISOString() })
          .eq('id', inventoryId);

        if (error) throw error;
        break;
      }

      case 'use': {
        if (item.item_type !== 'consumable') {
          return NextResponse.json(
            { success: false, error: 'Only consumables can be used' },
            { status: 400 }
          );
        }

        if (item.quantity <= 1) {
          // Remove the item
          const { error } = await supabase
            .from('user_inventory')
            .delete()
            .eq('id', inventoryId);

          if (error) throw error;
        } else {
          // Decrement quantity
          const { error } = await supabase
            .from('user_inventory')
            .update({ quantity: item.quantity - 1, updated_at: new Date().toISOString() })
            .eq('id', inventoryId);

          if (error) throw error;
        }
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: equip, unequip, use' },
          { status: 400 }
        );
    }

    console.log(`[user/inventory] User ${userAddress} ${action} item ${inventoryId}`);

    return NextResponse.json({
      success: true,
      data: { action, inventoryId },
    });
  } catch (error) {
    console.error('[user/inventory] POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
