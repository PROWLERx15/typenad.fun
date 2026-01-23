'use client';

import React from 'react';
import { BUTTON_STYLES, SCREEN_STYLES, mergeStyles } from '../../styles/theme';
import Leaderboard from './Leaderboard';
import { styles } from './LeaderboardScreen.styles';
import { supabase } from '../../lib/supabaseClient';

interface LeaderboardScreenProps {
    onClose: () => void;
    myChainId?: string;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onClose, myChainId }) => {
    const [scores, setScores] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [timeRange, setTimeRange] = React.useState<'all' | 'today' | 'week'>('all');

    const myWalletAddress = typeof window !== 'undefined'
        ? localStorage.getItem('wallet_address') || undefined
        : undefined;

    React.useEffect(() => {
        const fetchScores = async () => {
            setLoading(true);
            try {
                // Fetch top 50 scores
                let query = supabase
                    .from('game_scores')
                    .select(`
                        score, 
                        wpm, 
                        users (
                            username,
                            wallet_address
                        )
                    `)
                    .order('score', { ascending: false })
                    .limit(50);

                if (timeRange === 'today') {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    query = query.gte('created_at', today.toISOString());
                } else if (timeRange === 'week') {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    query = query.gte('created_at', weekAgo.toISOString());
                }

                const { data, error } = await query;

                if (error) throw error;

                if (data) {
                    const formattedScores = data.map((entry: any) => ({
                        chainId: entry.users?.wallet_address || 'Unknown',
                        score: entry.score,
                        wpm: entry.wpm,
                        displayName: entry.users?.username || `Pilot ${entry.users?.wallet_address?.slice(0, 6)}`,
                    }));
                    setScores(formattedScores);
                }
            } catch (err) {
                console.error('Error fetching leaderboard:', err);

                // Fallback to local storage if API fails or no data
                const localScore = typeof window !== 'undefined'
                    ? parseInt(localStorage.getItem('personal_best_score') || '0')
                    : 0;

                if (localScore > 0) {
                    setScores([{
                        chainId: myWalletAddress || 'local',
                        score: localScore,
                        wpm: typeof window !== 'undefined' ? parseInt(localStorage.getItem('personal_best_wpm') || '0') : 0,
                        displayName: typeof window !== 'undefined' ? localStorage.getItem('display_name') : 'You',
                    }]);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchScores();
    }, [myWalletAddress, timeRange]);

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
                            fontSize: '12px',
                            padding: '8px 12px'
                        }}
                    >
                        All Time
                    </button>
                    <button
                        onClick={() => setTimeRange('week')}
                        style={{
                            ...BUTTON_STYLES.small,
                            opacity: timeRange === 'week' ? 1 : 0.5,
                            fontSize: '12px',
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
                            fontSize: '12px',
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
