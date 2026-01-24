/* eslint-disable @typescript-eslint/no-explicit-any */
import { SupabaseClient } from '@supabase/supabase-js';

export interface UserCreationData {
    walletAddress: string;
    email?: string;
    username?: string;
    googleId?: string;
    profilePicture?: string;
}

export const ensureUserExists = async (
    supabase: SupabaseClient,
    walletAddress: string,
    userData?: Partial<UserCreationData>
): Promise<string | null> => {
    try {
        // 1. Check if user exists
        const { data } = await supabase
            .from('users')
            .select('id, gold, username, email')
            .eq('wallet_address', walletAddress)
            .single();

        const existingUser = data as { id: string; gold: number; username: string | null; email: string | null } | null;

        if (existingUser?.id) {
            // Update last_seen_at and any new data
            const updateData: Record<string, unknown> = {
                last_seen_at: new Date().toISOString()
            };

            // Update email if provided and not already set
            if (userData?.email && !existingUser.email) {
                updateData.email = userData.email;
            }

            // Update username if provided and not already set
            if (userData?.username && !existingUser.username) {
                updateData.username = userData.username;
            }

            await (supabase
                .from('users') as any)
                .update(updateData)
                .eq('id', existingUser.id);

            return existingUser.id;
        }

        // 2. Create new user with all available data
        const insertData: Record<string, unknown> = {
            wallet_address: walletAddress,
            username: userData?.username || `Player ${walletAddress.slice(0, 6)}`,
            gold: 0
        };

        if (userData?.email) insertData.email = userData.email;
        if (userData?.googleId) insertData.google_id = userData.googleId;
        if (userData?.profilePicture) insertData.profile_picture = userData.profilePicture;

        const { data: newUser, error: createError } = await (supabase
            .from('users') as any)
            .insert(insertData)
            .select('id')
            .single();

        if (createError) {
            // Handle race condition (if created in parallel)
            if (createError.code === '23505') { // Unique violation
                const { data: existing } = await supabase
                    .from('users')
                    .select('id')
                    .eq('wallet_address', walletAddress)
                    .single();
                return (existing as { id: string })?.id || null;
            }
            throw createError;
        }

        return (newUser as any)?.id || null;
    } catch (err) {
        console.error('Error ensuring user exists:', err);
        return null;
    }
};

/**
 * Sync powerup consumption to database
 * Called when powerups are consumed at game start
 */
export const syncPowerupConsumption = async (
    supabase: SupabaseClient,
    walletAddress: string,
    powerupIds: string[]
): Promise<void> => {
    if (powerupIds.length === 0) return;

    try {
        console.log('🎯 Syncing powerup consumption to database...', powerupIds);

        // Get user ID
        const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('wallet_address', walletAddress)
            .single();

        if (!userData) {
            console.warn('⚠️ User not found for powerup sync');
            return;
        }

        // Decrement each powerup
        for (const powerupId of powerupIds) {
            const { data: currentItem } = await supabase
                .from('user_inventory')
                .select('quantity')
                .eq('user_id', (userData as any).id)
                .eq('item_id', powerupId)
                .single();

            if (currentItem && (currentItem as any).quantity > 0) {
                const { error } = await (supabase
                    .from('user_inventory') as any)
                    .update({
                        quantity: (currentItem as any).quantity - 1,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', (userData as any).id)
                    .eq('item_id', powerupId);

                if (error) {
                    console.error(`❌ Failed to decrement ${powerupId}:`, error);
                } else {
                    console.log(`✅ Decremented ${powerupId} (${currentItem.quantity} → ${currentItem.quantity - 1})`);
                }
            } else {
                console.warn(`⚠️ Powerup ${powerupId} not found or quantity is 0`);
            }
        }

        console.log('✅ Powerup consumption synced to database');
    } catch (error) {
        console.error('❌ Failed to sync powerup consumption:', error);
    }
};
