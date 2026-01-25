import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAddress } from 'viem';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/shop/consume
 * 
 * Securely consume powerups from user inventory
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { walletAddress, items } = body;

        if (!walletAddress || !isAddress(walletAddress)) {
            return NextResponse.json(
                { success: false, error: 'Valid wallet address required' },
                { status: 400 }
            );
        }

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No items to consume' },
                { status: 400 }
            );
        }

        console.log('[shop/consume] Consuming items for:', walletAddress, items);

        // Get user ID
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

        const consumed: string[] = [];
        const errors: string[] = [];

        // Process each item
        for (const itemId of items) {
            // Fetch current quantity
            const { data: currentItem } = await supabase
                .from('user_inventory')
                .select('id, quantity')
                .eq('user_id', user.id)
                .eq('item_id', itemId)
                .single();

            if (currentItem && currentItem.quantity > 0) {
                // Decrement
                const { error: updateError } = await supabase
                    .from('user_inventory')
                    .update({
                        quantity: currentItem.quantity - 1,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', currentItem.id);

                if (updateError) {
                    console.error(`[shop/consume] Failed to decrement ${itemId}:`, updateError);
                    errors.push(itemId);
                } else {
                    consumed.push(itemId);
                }
            } else {
                console.warn(`[shop/consume] Item ${itemId} not found or out of stock`);
                errors.push(itemId);
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                consumed,
                errors
            }
        });

    } catch (error) {
        console.error('[shop/consume] Unexpected error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
