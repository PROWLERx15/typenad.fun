'use client';

import React from 'react';
import { BUTTON_STYLES, SCREEN_STYLES, mergeStyles } from '../../styles/theme';
import Leaderboard from './Leaderboard';
import { styles } from './LeaderboardScreen.styles';
import { supabaseUntyped as supabase } from '../../lib/supabaseClient';

interface LeaderboardScreenProps {
    onClose: () => void;
    myChainId?: string;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onClose, myChainId }) => {
    const [scores, setScores] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [timeRange, setTimeRange] = React.useState<'all' | 'today' | 'week' | 'month'>('all');
    const [category, setCategory] = React.useState<'best_score' | 'best_wpm' | 'total_kills' | 'duel_wins'>('best_score');

    const myWalletAddress = typeof window !== 'undefined'
        ? localStorage.getItem('wallet_address') || undefined
        : undefined;

    React.useEffect(() => {
        const fetchScores = async () => {
            setLoading(true);
            try {
                // Use enhanced leaderboard API
                const response = await fetch(
                    `/api/leaderboard?category=${category}&timeRange=${timeRange}&limit=50`
                );
                
                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.error || 'Failed to fetch leaderboard');
                }

                if (data.data?.leaderboard) {
                    const formattedScores = data.data.leaderboard.map((entry: any) => ({
                        chainId: entry.walletAddress || 'Unknown',
                        score: entry.value,
                        wpm: entry.bestWpm || 0,
                        displayName: entry.username || `Pilot ${entry.walletAddress?.slice(0, 6)}`,
                        rank: entry.rank,
                    }));
                    setScores(formattedScores);
                }
            } catch (err) {
                console.error('Error fetching leaderboard:', err);

                // Fallback to local storage if API fails
                const localScore = typeof window !== 'undefined'
                    ? parseInt(localStorage.getItem('personal_best_score') || '0')
                    : 0;

                if (localScore > 0) {
                    setScores([{
                        chainId: myWalletAddress || 'local',
                        score: localScore,
                        wpm: typeof window !== 'undefined' ? parseInt(localStorage.getItem('personal_best_wpm') || '0') : 0,
                        displayName: typeof window !== 'undefined' ? localStorage.getItem('display_name') : 'You',
                        rank: 1,
                    }]);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchScores();
    }, [myWalletAddress, timeRange, category]);

    React.useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape, true);
        return () => document.removeEventListener('keydown', handleEscape, true);
    }, [onClose]);

    return (
        <div style={mergeStyles(
            SCREEN_STYLES.fullScreen,
            SCREEN_STYLES.centered,
            SCREEN_STYLES.backgroundCover,
            styles.overlayContainer
        )}>
            <button
                onClick={onClose}
                style={mergeStyles(BUTTON_STYLES.small, styles.closeButton)}
            >
                Close
            </button>

            <div style={styles.contentContainer}>
                {/* Category Selector */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '10px',
                    marginBottom: '15px',
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={() => setCategory('best_score')}
                        style={{
                            ...BUTTON_STYLES.small,
                            opacity: category === 'best_score' ? 1 : 0.5,
                            fontSize: '11px',
                            padding: '8px 12px'
                        }}
                    >
                        Score
                    </button>
                    <button
                        onClick={() => setCategory('best_wpm')}
                        style={{
                            ...BUTTON_STYLES.small,
                            opacity: category === 'best_wpm' ? 1 : 0.5,
                            fontSize: '11px',
                            padding: '8px 12px'
                        }}
                    >
                        WPM
                    </button>
                    <button
                        onClick={() => setCategory('total_kills')}
                        style={{
                            ...BUTTON_STYLES.small,
                            opacity: category === 'total_kills' ? 1 : 0.5,
                            fontSize: '11px',
                            padding: '8px 12px'
                        }}
                    >
                        Kills
                    </button>
                    <button
                        onClick={() => setCategory('duel_wins')}
                        style={{
                            ...BUTTON_STYLES.small,
                            opacity: category === 'duel_wins' ? 1 : 0.5,
                            fontSize: '11px',
                            padding: '8px 12px'
                        }}
                    >
                        Duel Wins
                    </button>
                </div>

                {/* Time Range Selector */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '10px',
                    marginBottom: '20px'
                }}>
                    <button
                        onClick={() => setTimeRange('all')}
                        style={{
                            ...BUTTON_STYLES.small,
                            opacity: timeRange === 'all' ? 1 : 0.5,
                            fontSize: '11px',
                            padding: '8px 12px'
                        }}
                    >
                        All Time
                    </button>
                    <button
                        onClick={() => setTimeRange('month')}
                        style={{
                            ...BUTTON_STYLES.small,
                            opacity: timeRange === 'month' ? 1 : 0.5,
                            fontSize: '11px',
                            padding: '8px 12px'
                        }}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setTimeRange('week')}
                        style={{
                            ...BUTTON_STYLES.small,
                            opacity: timeRange === 'week' ? 1 : 0.5,
                            fontSize: '11px',
                            padding: '8px 12px'
                        }}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => setTimeRange('today')}
                        style={{
                            ...BUTTON_STYLES.small,
                            opacity: timeRange === 'today' ? 1 : 0.5,
                            fontSize: '11px',
                            padding: '8px 12px'
                        }}
                    >
                        Today
                    </button>
                </div>

                <div style={styles.contentContainer}>
                    <Leaderboard
                        scores={scores}
                        myChainId={myChainId}
                        myWalletAddress={myWalletAddress}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default LeaderboardScreen;
