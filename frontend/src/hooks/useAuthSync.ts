import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { usePrivyWallet } from './usePrivyWallet';
import { supabase } from '../lib/supabaseClient';
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

            setSyncing(true);
            setError(null);

            try {
                console.log('🔄 Starting auth sync for address:', address);

                // 1. Extract user data from Privy
                const email = user?.email?.address || user?.google?.email;
                const googleName = user?.google?.name;
                const googleId = user?.google?.subject;
                const profilePicture = user?.google?.picture;

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
                    localStorage.setItem('playerGold', userData.gold.toString());
                    
                    if (userData.username) {
                        localStorage.setItem('display_name', userData.username);
                    }

                    if (userData.email) {
                        localStorage.setItem('user_email', userData.email);
                    }

                    if (userData.profile_picture) {
                        localStorage.setItem('profile_picture', userData.profile_picture);
                    }

                    console.log('💾 Synced to localStorage:', {
                        address,
                        gold: userData.gold,
                        username: userData.username
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
