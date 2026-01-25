'use client';

import React, { useState, useEffect } from 'react';
import { BUTTON_STYLES, SCREEN_STYLES, BACKGROUND_STYLES, mergeStyles } from '../../styles/theme';
import { ACHIEVEMENTS, Achievement } from '../../constants/achievements';

interface AchievementsScreenProps {
    onClose: () => void;
    walletAddress?: string;
}

interface UnlockedAchievement {
    achievementId: string;
    unlockedAt: string;
}

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ onClose, walletAddress }) => {
    const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'wpm' | 'games' | 'special'>('all');

    useEffect(() => {
        const fetchAchievements = async () => {
            if (!walletAddress) {
                setLoading(false);
                return;
            }

            try {
                console.log('[AchievementsScreen] Fetching achievements for:', walletAddress);
                const response = await fetch(`/api/achievements/check?walletAddress=${walletAddress}`);
                const data = await response.json();

                console.log('[AchievementsScreen] API response:', data);

                if (data.success && data.data?.achievements) {
                    // Map the achievements to the format we need
                    const mapped = data.data.achievements.map((a: any) => ({
                        achievementId: a.id || a.achievement_id || a.achievementId,
                        unlockedAt: a.unlockedAt || a.unlocked_at
                    }));
                    console.log('[AchievementsScreen] Mapped achievements:', mapped);
                    setUnlockedAchievements(mapped);
                }
            } catch (error) {
                console.error('[AchievementsScreen] Failed to fetch achievements:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAchievements();
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

    const isUnlocked = (achievementId: string): boolean => {
        console.log('[AchievementsScreen] Checking if unlocked:', achievementId, 'in', unlockedAchievements);
        return unlockedAchievements.some(a => a.achievementId === achievementId);
    };

    const filteredAchievements = selectedCategory === 'all'
        ? ACHIEVEMENTS
        : ACHIEVEMENTS.filter(a => a.category === selectedCategory);

    const unlockedCount = ACHIEVEMENTS.filter(a => isUnlocked(a.id)).length;
    const totalCount = ACHIEVEMENTS.length;

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
                maxWidth: '1200px',
                width: '100%',
                margin: '0 auto',
                padding: '20px',
            }}>
                <h1 style={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '32px',
                    color: '#00FF88',
                    textAlign: 'center',
                    marginBottom: '10px',
                    textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
                }}>
                    Achievements
                </h1>

                <div style={{
                    textAlign: 'center',
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '14px',
                    color: '#FFFFFF',
                    marginBottom: '30px',
                }}>
                    {unlockedCount} / {totalCount} Unlocked
                </div>

                {/* Category Filter */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '10px',
                    marginBottom: '30px',
                    flexWrap: 'wrap',
                }}>
                    {['all', 'wpm', 'games', 'special'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat as any)}
                            style={{
                                ...BUTTON_STYLES.small,
                                opacity: selectedCategory === cat ? 1 : 0.5,
                                fontSize: '11px',
                                padding: '8px 12px',
                                textTransform: 'capitalize',
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{
                        textAlign: 'center',
                        fontFamily: '"Press Start 2P", monospace',
                        fontSize: '14px',
                        color: '#00FF88',
                        marginTop: '50px',
                    }}>
                        Loading...
                    </div>
                ) : !walletAddress ? (
                    <div style={{
                        textAlign: 'center',
                        fontFamily: '"Press Start 2P", monospace',
                        fontSize: '14px',
                        color: '#FF4444',
                        marginTop: '50px',
                    }}>
                        Connect wallet to view achievements
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '20px',
                    }}>
                        {filteredAchievements.map((achievement) => {
                            const unlocked = isUnlocked(achievement.id);
                            return (
                                <div
                                    key={achievement.id}
                                    style={{
                                        background: unlocked
                                            ? 'rgba(0, 255, 136, 0.1)'
                                            : 'rgba(255, 255, 255, 0.05)',
                                        border: unlocked
                                            ? '2px solid #00FF88'
                                            : '2px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        position: 'relative',
                                        opacity: unlocked ? 1 : 0.6,
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    {/* Icon */}
                                    <div style={{
                                        fontSize: '48px',
                                        textAlign: 'center',
                                        marginBottom: '15px',
                                        filter: unlocked ? 'none' : 'grayscale(100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        {achievement.icon.startsWith('/images/') ? (
                                            <img 
                                                src={achievement.icon} 
                                                alt={achievement.name}
                                                style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    objectFit: 'contain',
                                                }}
                                            />
                                        ) : (
                                            achievement.icon
                                        )}
                                    </div>

                                    {/* Name */}
                                    <div style={{
                                        fontFamily: '"Press Start 2P", monospace',
                                        fontSize: '14px',
                                        color: unlocked ? '#00FF88' : '#FFFFFF',
                                        textAlign: 'center',
                                        marginBottom: '10px',
                                        lineHeight: '1.5',
                                    }}>
                                        {achievement.name}
                                    </div>

                                    {/* Description */}
                                    <div style={{
                                        fontFamily: '"Press Start 2P", monospace',
                                        fontSize: '10px',
                                        color: '#CCCCCC',
                                        textAlign: 'center',
                                        marginBottom: '15px',
                                        lineHeight: '1.5',
                                    }}>
                                        {achievement.description}
                                    </div>

                                    {/* Reward */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        fontFamily: '"Press Start 2P", monospace',
                                        fontSize: '12px',
                                        color: '#FFD700',
                                    }}>
                                        <img
                                            src="/images/gold-coin.png"
                                            alt="Gold"
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                        <span>{achievement.goldReward}</span>
                                    </div>

                                    {/* Unlocked Badge */}
                                    {unlocked && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            background: '#00FF88',
                                            color: '#000000',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontFamily: '"Press Start 2P", monospace',
                                            fontSize: '8px',
                                        }}>
                                            ✓ UNLOCKED
                                        </div>
                                    )}

                                    {/* Locked Badge */}
                                    {!unlocked && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            color: '#FFFFFF',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontFamily: '"Press Start 2P", monospace',
                                            fontSize: '8px',
                                        }}>
                                            🔒 LOCKED
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AchievementsScreen;
