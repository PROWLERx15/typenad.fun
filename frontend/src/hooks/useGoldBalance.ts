import { useState, useEffect, useCallback } from 'react';
import { usePrivyWallet } from './usePrivyWallet';
import { supabaseUntyped as supabase } from '../lib/supabaseClient';

export function useGoldBalance() {
    const { address, isConnected } = usePrivyWallet();
    const [gold, setGold] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load gold from database on mount or when address changes
    useEffect(() => {
        const loadGold = async () => {
            if (!address || !isConnected) {
                // Not connected - load from localStorage
                const localGold = localStorage.getItem('playerGold');
                setGold(localGold ? parseInt(localGold, 10) : 0);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                console.log('💰 Loading gold for address:', address);

                const { data, error: fetchError } = await supabase
                    .from('users')
                    .select('gold')
                    .eq('wallet_address', address)
                    .single();

                if (fetchError) {
                    // Check for "row not found" error (PGRST116)
                    if (fetchError.code === 'PGRST116') {
                        console.log('✨ New user detected (no gold record), initializing with 0 gold');
                        setGold(0);
                        localStorage.setItem('playerGold', '0');
                        // Optional: Create the user record here if desired, 
                        // but for now we just treat it as 0 gold without error.
                        return;
                    }
                    throw fetchError;
                }

                if (data) {
                    console.log('✅ Gold loaded from database:', data.gold);
                    setGold(data.gold);
                    localStorage.setItem('playerGold', data.gold.toString());
                }
            } catch (err: any) {
                console.error('❌ Failed to load gold:', err.message || err);

                // Detailed Supabase error logging
                if (err.details || err.hint) {
                    console.error('Supabase Error Details:', {
                        code: err.code,
                        message: err.message,
                        details: err.details,
                        hint: err.hint
                    });
                }

                setError(err instanceof Error ? err.message : 'Failed to load gold');

                // Fallback to localStorage
                const localGold = localStorage.getItem('playerGold');
                setGold(localGold ? parseInt(localGold, 10) : 0);
            } finally {
                setLoading(false);
            }
        };

        loadGold();
    }, [address, isConnected]);

    // Update gold both locally and in database
    const updateGold = useCallback(async (newGold: number) => {
        console.log('💰 Updating gold to:', newGold);

        // Immediate local update
        setGold(newGold);
        localStorage.setItem('playerGold', newGold.toString());

        // Async database update
        if (address && isConnected) {
            try {
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ gold: newGold })
                    .eq('wallet_address', address);

                if (updateError) throw updateError;

                console.log('✅ Gold synced to database');
            } catch (err) {
                console.error('❌ Failed to sync gold to database:', err);
                // Don't revert local change - it's saved in localStorage
            }
        }
    }, [address, isConnected]);

    // Add gold (convenience method)
    const addGold = useCallback(async (amount: number) => {
        const newGold = gold + amount;
        await updateGold(newGold);
    }, [gold, updateGold]);

    // Subtract gold (convenience method)
    const subtractGold = useCallback(async (amount: number) => {
        const newGold = Math.max(0, gold - amount);
        await updateGold(newGold);
    }, [gold, updateGold]);

    return {
        gold,
        loading,
        error,
        updateGold,
        addGold,
        subtractGold
    };
}
