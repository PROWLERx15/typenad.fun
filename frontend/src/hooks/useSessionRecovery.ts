'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePrivyWallet } from './usePrivyWallet';
import { useTypeNadContract } from './useTypeNadContract';
import { formatUSDC } from './useUSDC';
import type { GameSession } from '../types/contract';

// LocalStorage key for session persistence
const STAKED_SESSION_KEY = 'typemonad_staked_session';
const DUEL_SESSION_KEY = 'typemonad_duel_session';

interface StoredStakedSession {
    sequenceNumber: string;
    stake: string;
    seed: string;
    startedAt: number;
}

interface StoredDuelSession {
    duelId: string;
    stake: string;
    seed: string;
    isCreator: boolean;
    startedAt: number;
}

interface SessionRecoveryState {
    // Solo staked game
    hasActiveSession: boolean;
    activeSessionId: bigint | null;
    sessionDetails: GameSession | null;
    storedSession: StoredStakedSession | null;

    // Loading states
    isChecking: boolean;
    isCancelling: boolean;

    // Cancel fee info
    cancelFeeBps: bigint;
}

const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useSessionRecovery() {
    const { address, isConnected } = usePrivyWallet();
    const {
        getPlayerActiveSession,
        getGameSession,
        cancelGame,
        getCancelFeeBps,
        isLoading: contractLoading
    } = useTypeNadContract();

    const [state, setState] = useState<SessionRecoveryState>({
        hasActiveSession: false,
        activeSessionId: null,
        sessionDetails: null,
        storedSession: null,
        isChecking: false,
        isCancelling: false,
        cancelFeeBps: 500n, // Default 5%
    });

    // Load stored session from localStorage
    const loadStoredSession = useCallback((): StoredStakedSession | null => {
        if (typeof window === 'undefined') return null;
        try {
            const stored = localStorage.getItem(STAKED_SESSION_KEY);
            if (!stored) return null;

            const parsed = JSON.parse(stored) as StoredStakedSession;

            // Check if session is too old
            if (Date.now() - parsed.startedAt > SESSION_TIMEOUT_MS) {
                localStorage.removeItem(STAKED_SESSION_KEY);
                return null;
            }

            return parsed;
        } catch {
            return null;
        }
    }, []);

    // Save session to localStorage
    const saveSession = useCallback((
        sequenceNumber: bigint,
        stake: bigint,
        seed: bigint
    ) => {
        if (typeof window === 'undefined') return;
        const session: StoredStakedSession = {
            sequenceNumber: sequenceNumber.toString(),
            stake: stake.toString(),
            seed: seed.toString(),
            startedAt: Date.now(),
        };
        localStorage.setItem(STAKED_SESSION_KEY, JSON.stringify(session));
    }, []);

    // Clear session from localStorage
    const clearSession = useCallback(() => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(STAKED_SESSION_KEY);
        setState(prev => ({
            ...prev,
            hasActiveSession: false,
            activeSessionId: null,
            sessionDetails: null,
            storedSession: null,
        }));
    }, []);

    // Check for active session on-chain
    const checkActiveSession = useCallback(async () => {
        if (!address || !isConnected) return;

        setState(prev => ({ ...prev, isChecking: true }));

        try {
            // Check on-chain for active session
            const sessionId = await getPlayerActiveSession(address);

            if (sessionId > 0n) {
                // Fetch session details
                const session = await getGameSession(sessionId);

                if (session.active) {
                    // Get cancel fee
                    const feeBps = await getCancelFeeBps();

                    // Load stored session data
                    const stored = loadStoredSession();

                    setState(prev => ({
                        ...prev,
                        hasActiveSession: true,
                        activeSessionId: sessionId,
                        sessionDetails: session,
                        storedSession: stored,
                        cancelFeeBps: feeBps,
                        isChecking: false,
                    }));
                    return;
                }
            }

            // No active session
            setState(prev => ({
                ...prev,
                hasActiveSession: false,
                activeSessionId: null,
                sessionDetails: null,
                isChecking: false,
            }));
        } catch (error) {
            console.error('Failed to check active session:', error);
            setState(prev => ({ ...prev, isChecking: false }));
        }
    }, [address, isConnected, getPlayerActiveSession, getGameSession, getCancelFeeBps, loadStoredSession]);

    // Handle cancel session
    const handleCancelSession = useCallback(async (): Promise<{ success: boolean; refund: bigint; error?: string }> => {
        if (!state.hasActiveSession) {
            return { success: false, refund: 0n, error: 'No active session to cancel' };
        }

        setState(prev => ({ ...prev, isCancelling: true }));

        try {
            const { refund } = await cancelGame();
            clearSession();

            setState(prev => ({
                ...prev,
                hasActiveSession: false,
                activeSessionId: null,
                sessionDetails: null,
                isCancelling: false,
            }));

            return { success: true, refund };
        } catch (error: any) {
            setState(prev => ({ ...prev, isCancelling: false }));
            return {
                success: false,
                refund: 0n,
                error: error.message || 'Failed to cancel session'
            };
        }
    }, [state.hasActiveSession, cancelGame, clearSession]);

    // Calculate refund amount
    const getEstimatedRefund = useCallback((): { refund: bigint; fee: bigint } | null => {
        if (!state.sessionDetails) return null;

        const stake = state.sessionDetails.stake;
        const fee = (stake * state.cancelFeeBps) / 10000n;
        const refund = stake - fee;

        return { refund, fee };
    }, [state.sessionDetails, state.cancelFeeBps]);

    // Format refund for display
    const formatRefundInfo = useCallback((): string => {
        const estimated = getEstimatedRefund();
        if (!estimated) return '';

        return `You will receive ${formatUSDC(estimated.refund)} USDC (${formatUSDC(estimated.fee)} USDC cancellation fee)`;
    }, [getEstimatedRefund]);

    // Check session on wallet connect
    useEffect(() => {
        if (isConnected && address) {
            checkActiveSession();
        }
    }, [isConnected, address, checkActiveSession]);

    return {
        // State
        hasActiveSession: state.hasActiveSession,
        activeSessionId: state.activeSessionId,
        sessionDetails: state.sessionDetails,
        storedSession: state.storedSession,
        isChecking: state.isChecking,
        isCancelling: state.isCancelling || contractLoading,
        cancelFeeBps: state.cancelFeeBps,

        // Actions
        checkActiveSession,
        handleCancelSession,
        saveSession,
        clearSession,

        // Helpers
        getEstimatedRefund,
        formatRefundInfo,
    };
}

// Duel session helpers
export function saveDuelSession(
    duelId: bigint,
    stake: bigint,
    seed: bigint,
    isCreator: boolean
) {
    if (typeof window === 'undefined') return;
    const session: StoredDuelSession = {
        duelId: duelId.toString(),
        stake: stake.toString(),
        seed: seed.toString(),
        isCreator,
        startedAt: Date.now(),
    };
    localStorage.setItem(DUEL_SESSION_KEY, JSON.stringify(session));
}

export function loadDuelSession(): StoredDuelSession | null {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem(DUEL_SESSION_KEY);
        if (!stored) return null;

        const parsed = JSON.parse(stored) as StoredDuelSession;

        // Check if session is too old
        if (Date.now() - parsed.startedAt > SESSION_TIMEOUT_MS) {
            localStorage.removeItem(DUEL_SESSION_KEY);
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}

export function clearDuelSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(DUEL_SESSION_KEY);
}
