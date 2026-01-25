import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAddress } from 'viem';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/user/update
 * 
 * Update user profile settings
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { walletAddress, username, email } = body;

        if (!walletAddress || !isAddress(walletAddress)) {
            return NextResponse.json(
                { success: false, error: 'Valid wallet address required' },
                { status: 400 }
            );
        }

        console.log('[user/update] Request for:', walletAddress, { username, email });

        // Validate username length
        if (username && (username.length < 3 || username.length > 20)) {
            return NextResponse.json(
                { success: false, error: 'Username must be between 3 and 20 characters' },
                { status: 400 }
            );
        }

        const updateData: Record<string, any> = {
            updated_at: new Date().toISOString()
        };

        if (username) updateData.username = username;
        if (email !== undefined) updateData.email = email;

        // Update user
        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('wallet_address', walletAddress)
            .select()
            .single();

        if (error) {
            console.error('[user/update] Update failed:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to update profile' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                user: data
            }
        });

    } catch (error) {
        console.error('[user/update] Unexpected error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
