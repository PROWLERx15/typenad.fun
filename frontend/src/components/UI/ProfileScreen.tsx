'use client';

import React, { useState, useEffect } from 'react';
import { BUTTON_STYLES, SCREEN_STYLES, BACKGROUND_STYLES, mergeStyles } from '../../styles/theme';

interface ProfileScreenProps {
    onClose: () => void;
    walletAddress?: string;
}

interface UserProfile {
    user: {
        walletAddress: string;
        username: string | null;
        profilePicture: string | null;
        createdAt: string;
        lastSeenAt: string | null;
    };
    stats: {
        totalGames: number;
        totalKills: number;
        totalWordsTyped: number;
        bestScore: number;
        bestWpm: number;
        bestStreak: number;
        gold: number;
        achievementCount: number;
        duelWins: number;
        duelLosses: number;
        leaderboardRank: number | null;
    };
    recentGames: Array<{
        id: string;
        score: number;
        waveReached: number;
        wpm: number;
        kills: number;
        gameMode: string;
        goldEarned: number;
        durationSeconds: number;
        createdAt: string;
    }>;
    achievements: Array<{
        achievementId: string;
        unlockedAt: string;
    }>;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onClose, walletAddress }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'stats' | 'history' | 'duels'>('stats');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!walletAddress) {
                setLoading(false);
                setError('Wallet not connected');
                return;
            }

            try {
                const response = await fetch(`/api/user/profile?walletAddress=${walletAddress}`);
                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.error || 'Failed to fetch profile');
                }

                setProfile(data.data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                setError(err instanceof Error ? err.message : 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [walletAddress]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDuration = (seconds: number) => {
        if (!seconds) return '-';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div style={mergeStyles(
            SCREEN_STYLES.fullScreen,
            SCREEN_STYLES.centered,
            SCREEN_STYLES.backgroundCover,
            BACKGROUND_STYLES.startScreenBackground,
            {
                overflowY: 'auto',
                padding: '20px',
            }
        )}>
            <button
                onClick={onClose}
                style={mergeStyles(BUTTON_STYLES.small, {
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 1000,
                })}
            >
                Close
            </button>

            <div style={{
                maxWidth: '1000px',
                width: '100%',
                margin: '0 auto',
                padding: '20px',
            }}>
                <h1 style={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '28px',
                    color: '#00FF88',
                    textAlign: 'center',
                    marginBottom: '30px',
                    textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
                }}>
                    Pilot Profile
                </h1>

                {loading ? (
                    <div style={{
                        textAlign: 'center',
                        fontFamily: '"Press Start 2P", monospace',
                        fontSize: '14px',
                        color: '#00FF88',
                        marginTop: '50px',
                    }}>
                        Loading profile...
                    </div>
                ) : error ? (
                    <div style={{
                        textAlign: 'center',
                        fontFamily: '"Press Start 2P", monospace',
                        fontSize: '14px',
                        color: '#FF4444',
                        marginTop: '50px',
                    }}>
                        {error}
                    </div>
                ) : profile ? (
                    <>
                        {/* Profile Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            marginBottom: '30px',
                            background: 'rgba(0, 0, 0, 0.5)',
                            padding: '20px',
                            borderRadius: '12px',
                            border: '2px solid rgba(0, 255, 136, 0.3)',
                        }}>
                            {/* Avatar */}
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #00FF88, #00B8FF)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '32px',
                            }}>
                                👨‍🚀
                            </div>
                            <div>
                                <div style={{
                                    fontFamily: '"Press Start 2P", monospace',
                                    fontSize: '16px',
                                    color: '#FFFFFF',
                                    marginBottom: '8px',
                                }}>
                                    {profile.user.username || `Pilot ${truncateAddress(profile.user.walletAddress)}`}
                                </div>
                                <div style={{
                                    fontFamily: 'monospace',
                                    fontSize: '12px',
                                    color: '#888888',
                                }}>
                                    {truncateAddress(profile.user.walletAddress)}
                                </div>
                                <div style={{
                                    fontFamily: 'monospace',
                                    fontSize: '10px',
                                    color: '#666666',
                                    marginTop: '4px',
                                }}>
                                    Joined {formatDate(profile.user.createdAt)}
                                </div>
                            </div>
                            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}>
                                    <img src="/images/gold-coin.png" alt="Gold" style={{ width: '24px', height: '24px' }} />
                                    <span style={{
                                        fontFamily: '"Press Start 2P", monospace',
                                        fontSize: '16px',
                                        color: '#FFD700',
                                    }}>
                                        {profile.stats.gold.toLocaleString()}
                                    </span>
                                </div>
                                {profile.stats.leaderboardRank && (
                                    <div style={{
                                        fontFamily: '"Press Start 2P", monospace',
                                        fontSize: '10px',
                                        color: '#00FF88',
                                        marginTop: '8px',
                                    }}>
                                        Rank #{profile.stats.leaderboardRank}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats Overview Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '15px',
                            marginBottom: '30px',
                        }}>
                            {[
                                { label: 'Best Score', value: profile.stats.bestScore.toLocaleString(), icon: '🏆' },
                                { label: 'Best WPM', value: profile.stats.bestWpm, icon: '⚡' },
                                { label: 'Total Games', value: profile.stats.totalGames, icon: '🎮' },
                                { label: 'Total Kills', value: profile.stats.totalKills.toLocaleString(), icon: '💀' },
                                { label: 'Words Typed', value: profile.stats.totalWordsTyped.toLocaleString(), icon: '⌨️' },
                                { label: 'Achievements', value: profile.stats.achievementCount, icon: '🏅' },
                            ].map((stat) => (
                                <div key={stat.label} style={{
                                    background: 'rgba(0, 0, 0, 0.4)',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                                    <div style={{
                                        fontFamily: '"Press Start 2P", monospace',
                                        fontSize: '14px',
                                        color: '#00FF88',
                                        marginBottom: '4px',
                                    }}>
                                        {stat.value}
                                    </div>
                                    <div style={{
                                        fontFamily: '"Press Start 2P", monospace',
                                        fontSize: '8px',
                                        color: '#AAAAAA',
                                    }}>
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Duel Stats */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '30px',
                            marginBottom: '30px',
                            background: 'rgba(0, 0, 0, 0.4)',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontFamily: '"Press Start 2P", monospace',
                                    fontSize: '20px',
                                    color: '#00FF88',
                                }}>
                                    {profile.stats.duelWins}
                                </div>
                                <div style={{
                                    fontFamily: '"Press Start 2P", monospace',
                                    fontSize: '10px',
                                    color: '#AAAAAA',
                                }}>
                                    Duel Wins
                                </div>
                            </div>
                            <div style={{
                                width: '2px',
                                background: 'rgba(255, 255, 255, 0.2)',
                            }} />
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontFamily: '"Press Start 2P", monospace',
                                    fontSize: '20px',
                                    color: '#FF4444',
                                }}>
                                    {profile.stats.duelLosses}
                                </div>
                                <div style={{
                                    fontFamily: '"Press Start 2P", monospace',
                                    fontSize: '10px',
                                    color: '#AAAAAA',
                                }}>
                                    Duel Losses
                                </div>
                            </div>
                            <div style={{
                                width: '2px',
                                background: 'rgba(255, 255, 255, 0.2)',
                            }} />
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontFamily: '"Press Start 2P", monospace',
                                    fontSize: '20px',
                                    color: '#FFFFFF',
                                }}>
                                    {profile.stats.duelWins + profile.stats.duelLosses > 0
                                        ? Math.round((profile.stats.duelWins / (profile.stats.duelWins + profile.stats.duelLosses)) * 100)
                                        : 0}%
                                </div>
                                <div style={{
                                    fontFamily: '"Press Start 2P", monospace',
                                    fontSize: '10px',
                                    color: '#AAAAAA',
                                }}>
                                    Win Rate
                                </div>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '10px',
                            marginBottom: '20px',
                        }}>
                            {['stats', 'history'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as 'stats' | 'history')}
                                    style={{
                                        ...BUTTON_STYLES.small,
                                        opacity: activeTab === tab ? 1 : 0.5,
                                        fontSize: '11px',
                                        padding: '8px 16px',
                                        textTransform: 'capitalize',
                                    }}
                                >
                                    {tab === 'history' ? 'Match History' : 'Statistics'}
                                </button>
                            ))}
                        </div>

                        {/* Recent Games */}
                        {activeTab === 'history' && (
                            <div style={{
                                background: 'rgba(0, 0, 0, 0.4)',
                                padding: '20px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}>
                                <h2 style={{
                                    fontFamily: '"Press Start 2P", monospace',
                                    fontSize: '14px',
                                    color: '#00FF88',
                                    marginBottom: '20px',
                                    textAlign: 'center',
                                }}>
                                    Recent Games
                                </h2>
                                {profile.recentGames.length === 0 ? (
                                    <div style={{
                                        textAlign: 'center',
                                        fontFamily: '"Press Start 2P", monospace',
                                        fontSize: '12px',
                                        color: '#888888',
                                        padding: '30px',
                                    }}>
                                        No games played yet
                                    </div>
                                ) : (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px',
                                    }}>
                                        {profile.recentGames.map((game) => (
                                            <div key={game.id} style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                                                gap: '10px',
                                                padding: '12px',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '6px',
                                                alignItems: 'center',
                                            }}>
                                                <div style={{
                                                    fontFamily: '"Press Start 2P", monospace',
                                                    fontSize: '10px',
                                                    color: '#00FF88',
                                                    textTransform: 'uppercase',
                                                }}>
                                                    {game.gameMode}
                                                </div>
                                                <div style={{
                                                    fontFamily: '"Press Start 2P", monospace',
                                                    fontSize: '12px',
                                                    color: '#FFFFFF',
                                                }}>
                                                    {game.score.toLocaleString()} pts
                                                </div>
                                                <div style={{
                                                    fontFamily: '"Press Start 2P", monospace',
                                                    fontSize: '10px',
                                                    color: '#FFD700',
                                                }}>
                                                    {game.wpm} WPM
                                                </div>
                                                <div style={{
                                                    fontFamily: '"Press Start 2P", monospace',
                                                    fontSize: '10px',
                                                    color: '#FF6B6B',
                                                }}>
                                                    {game.kills} kills
                                                </div>
                                                <div style={{
                                                    fontFamily: '"Press Start 2P", monospace',
                                                    fontSize: '8px',
                                                    color: '#888888',
                                                    textAlign: 'right',
                                                }}>
                                                    {formatDate(game.createdAt)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Additional Stats Tab */}
                        {activeTab === 'stats' && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '20px',
                            }}>
                                <div style={{
                                    background: 'rgba(0, 0, 0, 0.4)',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                }}>
                                    <h3 style={{
                                        fontFamily: '"Press Start 2P", monospace',
                                        fontSize: '12px',
                                        color: '#00FF88',
                                        marginBottom: '15px',
                                    }}>
                                        Combat Stats
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#AAAAAA' }}>Total Kills</span>
                                            <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#FFFFFF' }}>{profile.stats.totalKills.toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#AAAAAA' }}>Best Streak</span>
                                            <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#FFFFFF' }}>{profile.stats.bestStreak}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#AAAAAA' }}>Avg Kills/Game</span>
                                            <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#FFFFFF' }}>
                                                {profile.stats.totalGames > 0 ? Math.round(profile.stats.totalKills / profile.stats.totalGames) : 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    background: 'rgba(0, 0, 0, 0.4)',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                }}>
                                    <h3 style={{
                                        fontFamily: '"Press Start 2P", monospace',
                                        fontSize: '12px',
                                        color: '#00FF88',
                                        marginBottom: '15px',
                                    }}>
                                        Typing Stats
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#AAAAAA' }}>Best WPM</span>
                                            <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#FFFFFF' }}>{profile.stats.bestWpm}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#AAAAAA' }}>Words Typed</span>
                                            <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#FFFFFF' }}>{profile.stats.totalWordsTyped.toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#AAAAAA' }}>Avg Words/Game</span>
                                            <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#FFFFFF' }}>
                                                {profile.stats.totalGames > 0 ? Math.round(profile.stats.totalWordsTyped / profile.stats.totalGames) : 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        fontFamily: '"Press Start 2P", monospace',
                        fontSize: '14px',
                        color: '#888888',
                        marginTop: '50px',
                    }}>
                        Connect your wallet to view profile
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileScreen;