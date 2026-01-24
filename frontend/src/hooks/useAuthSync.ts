import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { usePrivyWallet } from './usePrivyWallet';
import { supabaseUntyped as supabase } from '../lib/supabaseClient';
import { ensureUserExists } from '../utils/supabaseHelpers';

export function useAuthSync() {
    const { authenticated, user } = usePrivy();
    const { address } = usePrivyWallet();
    const [syncing, setSyncing] = useState(false);
    const [synced, setSynced] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const syncUser = async () => {
            // Reset if user logs out
            if (!authenticated || !address) {
                setSynced(false);
                setError(null);
                return;
            }

            // Don't sync again if already synced for this address
            if (synced) return;

            // Check if this is a returning user (has data in localStorage)
            // If so, sync silently without showing loading screen
            const existingWalletAddress = typeof window !== 'undefined'
                ? localStorage.getItem('wallet_address')
                : null;
            const isReturningUser = existingWalletAddress === address;

            // Only show loading screen for first-time users
            // Returning users sync silently in the background
            if (!isReturningUser) {
                setSyncing(true);
            }
            setError(null);

            try {
                if (isReturningUser) {
                    console.log('🔄 Silently syncing returning user:', address);
                } else {
                    console.log('🔄 Starting auth sync for new user:', address);
                }

                // 1. Extract user data from Privy
                const email = user?.email?.address || user?.google?.email;
                const googleName = user?.google?.name;
                const googleId = user?.google?.subject;
                const profilePicture = (user?.google as any)?.picture;

                // Generate username from Google name or wallet address
                const username = googleName || `Player ${address.slice(0, 6)}`;

                console.log('📧 User data:', { email, username, googleId });

                // 2. Ensure user exists in database with Privy data
                const userId = await ensureUserExists(supabase, address, {
                    email,
                    username,
                    googleId,
                    profilePicture
                });

                if (!userId) {
                    throw new Error('Failed to create or fetch user');
                }

                console.log('✅ User synced with ID:', userId);

                // 3. Fetch user's complete data from database
                const { data: userData, error: fetchError } = await supabase
                    .from('users')
                    .select('id, gold, username, email, profile_picture')
                    .eq('wallet_address', address)
                    .single();

                if (fetchError) throw fetchError;

                if (userData) {
                    // 4. Sync to localStorage
                    localStorage.setItem('wallet_address', address);
                    localStorage.setItem('playerGold', (userData as any).gold.toString());

                    if ((userData as any).username) {
                        localStorage.setItem('display_name', (userData as any).username);
                    }

                    if ((userData as any).email) {
                        localStorage.setItem('user_email', (userData as any).email);
                    }

                    if ((userData as any).profile_picture) {
                        localStorage.setItem('profile_picture', (userData as any).profile_picture);
                    }

                    console.log('💾 Synced to localStorage:', {
                        address,
                        gold: (userData as any).gold,
                        username: (userData as any).username
                    });
                }

                setSynced(true);
            } catch (err) {
                console.error('❌ Auth sync failed:', err);
                setError(err instanceof Error ? err.message : 'Failed to sync user data');

                // Fallback: still save wallet address to localStorage
                if (address) {
                    localStorage.setItem('wallet_address', address);
                }
            } finally {
                setSyncing(false);
            }
        };

        syncUser();
    }, [authenticated, address, user, synced]);

    // Reset synced state when user changes
    useEffect(() => {
        if (!authenticated || !address) {
            setSynced(false);
        }
    }, [authenticated, address]);

    return { syncing, synced, error };
}
