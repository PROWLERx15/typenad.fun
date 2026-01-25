'use client';

import React from 'react';
import { usePrivyWallet } from '../../hooks/usePrivyWallet';
import { SCREEN_STYLES, BACKGROUND_STYLES, BUTTON_STYLES, FONTS, mergeStyles } from '../../styles/theme';
import { styles } from './CryptScreen.styles';
import { ENEMY_TYPE_IDS } from '../../constants/enemyTypes';
import { getPlayerStats, getMatchHistory, getPowerupInventory, MatchHistoryEntry } from '../../constants/gameStats';
import ShareableRankCard from './ShareableRankCard';

interface CryptScreenProps {
    onClose: () => void;
    onGoToShop?: () => void;
}

type TabType = 'profile' | 'achievements' | 'matchHistory' | 'inventory';

interface Achievement {
    id: string;
    name: string;
    type: string;
    unlocked: boolean;
    imagePath: string;
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

const FRAME_COUNT = 6;
const SPRITE_COLS = 3;
const SPRITE_WIDTH = 1024;
const SPRITE_HEIGHT = 1024;
const ENEMY_WIDTH = SPRITE_WIDTH / SPRITE_COLS;
const ENEMY_HEIGHT = SPRITE_HEIGHT / 2;

const getRankTitle = (score: number): string => {
    if (score === 0) return 'Cadet';
    if (score < 50) return 'Ensign';
    if (score < 100) return 'Scout Pilot';
    if (score < 200) return 'Ace Pilot';
    if (score < 400) return 'Squadron Leader';
    if (score < 600) return 'Wing Commander';
    if (score < 1000) return 'Star Marshal';
    if (score < 1500) return 'Fleet Admiral';
    if (score < 2000) return 'Cosmic Legend';
    return 'Galactic Overlord';
};

const POWERUP_NAMES: Record<string, string> = {
    'double-gold': 'Double Credits',
    'triple-gold': 'Triple Credits',
    'double-points': 'Double Points',
    'triple-points': 'Triple Points',
    'extra-life': 'Extra Shield',
    'slow-enemies': 'Slow Motion',
};

const CryptScreen: React.FC<CryptScreenProps> = ({ onClose, onGoToShop }) => {
    const { address } = usePrivyWallet();
    const [activeTab, setActiveTab] = React.useState<TabType>('profile');
    const [hoveredAchievement, setHoveredAchievement] = React.useState<string | null>(null);
    const [frame, setFrame] = React.useState(0);
    const [killedTypes, setKilledTypes] = React.useState<number[]>([]);
    const [displayName, setDisplayName] = React.useState('');
    const [isEditingName, setIsEditingName] = React.useState(false);
    const [currentDisplayName, setCurrentDisplayName] = React.useState<string | null>(null);

    // Stats state
    const [stats, setStats] = React.useState(getPlayerStats());
    const [profile, setProfile] = React.useState<UserProfile | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [matchHistory, setMatchHistory] = React.useState<MatchHistoryEntry[]>([]);
    const [inventory, setInventory] = React.useState<Record<string, number>>({});
    const [saving, setSaving] = React.useState(false);

    const walletAddress = address || '';

    // Initial load from local storage
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedName = localStorage.getItem('display_name');
            setCurrentDisplayName(storedName);
            setDisplayName(storedName || '');

            const storedKills = localStorage.getItem('killed_types');
            setKilledTypes(storedKills ? JSON.parse(storedKills) : []);

            setStats(getPlayerStats());
            setMatchHistory(getMatchHistory());
            setInventory(getPowerupInventory());
        }
    }, []);

    // Fetch profile from API
    React.useEffect(() => {
        const fetchProfile = async () => {
            if (!address) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/user/profile?walletAddress=${address}`);
                const data = await response.json();

                if (response.ok && data.success && data.data) {
                    setProfile(data.data);

                    // Update display name
                    if (data.data.user?.username) {
                        setCurrentDisplayName(data.data.user.username);
                        setDisplayName(data.data.user.username);
                        localStorage.setItem('display_name', data.data.user.username);
                    }

                    // Update match history from recent games
                    if (data.data.recentGames && data.data.recentGames.length > 0) {
                        const history: MatchHistoryEntry[] = data.data.recentGames.map((game: any) => ({
                            id: game.id,
                            date: game.createdAt,
                            score: game.score,
                            wpm: game.wpm,
                            wave: game.waveReached || 0,
                            kills: game.kills || 0,
                            goldEarned: game.goldEarned || 0,
                            mode: game.gameMode || 'story',
                            powerupsUsed: []
                        }));
                        setMatchHistory(history);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [address]);

    // Fetch inventory from API
    React.useEffect(() => {
        const fetchInventory = async () => {
            if (!address) return;

            try {
                const inventoryResponse = await fetch(`/api/user/inventory?walletAddress=${address}`);
                const inventoryData = await inventoryResponse.json();

                if (inventoryData.success && inventoryData.data?.inventory) {
                    const newInventory: Record<string, number> = {};
                    inventoryData.data.inventory.forEach((item: any) => {
                        newInventory[item.item_id] = item.quantity;
                    });
                    setInventory(newInventory);
                }
            } catch (err) {
                console.error('Failed to fetch inventory:', err);
            }
        };

        fetchInventory();
    }, [address]);

    const handleSaveDisplayName = async () => {
        if (displayName.length >= 3 && displayName.length <= 20) {
            setSaving(true);
            localStorage.setItem('display_name', displayName);
            setCurrentDisplayName(displayName);

            if (address) {
                try {
                    const response = await fetch('/api/user/update', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            walletAddress: address,
                            username: displayName
                        })
                    });

                    const data = await response.json();
                    if (data.success) {
                        // Update local profile state
                        setProfile(prev => prev ? ({
                            ...prev,
                            user: {
                                ...prev.user,
                                username: displayName
                            }
                        }) : null);
                        setIsEditingName(false);
                    } else {
                        alert(data.error || 'Failed to update username');
                    }
                } catch (error) {
                    console.error('Failed to update username:', error);
                    alert('Failed to update username');
                }
            } else {
                setIsEditingName(false);
            }
            setSaving(false);
        }
    };

    React.useEffect(() => {
        if (!hoveredAchievement) {
            setFrame(0);
            return;
        }

        const interval = setInterval(() => {
            setFrame((prev) => (prev + 1) % FRAME_COUNT);
        }, 250);
        return () => clearInterval(interval);
    }, [hoveredAchievement]);

    const enemyAchievements: Achievement[] = React.useMemo(() => [
        { id: 'scout', name: 'Scout Hunter', type: 'scout', unlocked: killedTypes.includes(ENEMY_TYPE_IDS.scout), imagePath: '/images/scout.png' },
        { id: 'cruiser', name: 'Cruiser Destroyer', type: 'cruiser', unlocked: killedTypes.includes(ENEMY_TYPE_IDS.cruiser), imagePath: '/images/cruiser.png' },
        { id: 'drone', name: 'Drone Swatter', type: 'drone', unlocked: killedTypes.includes(ENEMY_TYPE_IDS.drone), imagePath: '/images/drone.png' },
        { id: 'mothership', name: 'Mothership Vanquisher', type: 'mothership', unlocked: killedTypes.includes(ENEMY_TYPE_IDS.mothership), imagePath: '/images/mothership.png' },
    ], [killedTypes]);

    React.useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getModeLabel = (mode: string): string => {
        switch (mode) {
            case 'story': return 'Story';
            case 'timeAttack': return 'Survival';
            case 'pvp': return 'PVP';
            case 'staked': return 'Staked';
            case 'duel': return 'Duel';
            default: return mode;
        }
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
            styles.screenContainer
        )}>
            <button onClick={onClose} style={mergeStyles(BUTTON_STYLES.small, styles.closeButtonPosition)}>
                Close
            </button>

            <div style={styles.contentContainer}>
                <h1 style={styles.title}>Player Hub</h1>

                <div style={styles.tabNav}>
                    <button onClick={() => setActiveTab('profile')} style={styles.tabButton(activeTab === 'profile')}>
                        Profile
                    </button>
                    <button onClick={() => setActiveTab('achievements')} style={styles.tabButton(activeTab === 'achievements')}>
                        Achievements
                    </button>
                    <button onClick={() => setActiveTab('matchHistory')} style={styles.tabButton(activeTab === 'matchHistory')}>
                        Match History
                    </button>
                    <button onClick={() => setActiveTab('inventory')} style={styles.tabButton(activeTab === 'inventory')}>
                        Inventory
                    </button>
                </div>

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
                ) : !address ? (
                    <div style={{
                        textAlign: 'center',
                        fontFamily: '"Press Start 2P", monospace',
                        fontSize: '14px',
                        color: '#888888',
                        marginTop: '50px',
                    }}>
                        Connect your wallet to view profile
                    </div>
                ) : (
                    <>
                        {activeTab === 'profile' && (
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
                                            {isEditingName ? (
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <input
                                                        type="text"
                                                        value={displayName}
                                                        onChange={(e) => setDisplayName(e.target.value)}
                                                        style={{
                                                            background: 'rgba(0,0,0,0.5)',
                                                            border: '1px solid #00FF88',
                                                            color: '#FFF',
                                                            fontFamily: '"Press Start 2P", monospace',
                                                            fontSize: '12px',
                                                            padding: '4px 8px',
                                                            width: '150px'
                                                        }}
                                                        maxLength={20}
                                                    />
                                                    <button
                                                        onClick={handleSaveDisplayName}
                                                        disabled={saving}
                                                        style={{
                                                            ...BUTTON_STYLES.small,
                                                            fontSize: '10px',
                                                            padding: '4px 8px',
                                                            minWidth: 'auto'
                                                        }}
                                                    >
                                                        {saving ? '...' : 'Save'}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setIsEditingName(false);
                                                            setDisplayName(currentDisplayName || '');
                                                        }}
                                                        style={{
                                                            ...BUTTON_STYLES.small,
                                                            fontSize: '10px',
                                                            padding: '4px 8px',
                                                            minWidth: 'auto',
                                                            background: '#FF4444'
                                                        }}
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span>
                                                        {profile?.user?.username || currentDisplayName || `Pilot ${truncateAddress(walletAddress)}`}
                                                    </span>
                                                    <button
                                                        onClick={() => setIsEditingName(true)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            fontSize: '12px',
                                                            opacity: 0.7
                                                        }}
                                                        title="Edit Username"
                                                    >
                                                        ✏️
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{
                                            fontFamily: 'monospace',
                                            fontSize: '12px',
                                            color: '#888888',
                                        }}>
                                            {truncateAddress(walletAddress)}
                                        </div>
                                        {profile?.user?.createdAt && (
                                            <div style={{
                                                fontFamily: 'monospace',
                                                fontSize: '10px',
                                                color: '#666666',
                                                marginTop: '4px',
                                            }}>
                                                Joined {new Date(profile.user.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </div>
                                        )}
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
                                                {(profile?.stats?.gold || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        {profile?.stats?.leaderboardRank && (
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

                                {/* Stats Grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                    gap: '15px',
                                    marginBottom: '30px',
                                }}>
                                    {[
                                        { label: 'Best Score', value: (profile?.stats?.bestScore || 0).toLocaleString(), icon: '🏆' },
                                        { label: 'Best WPM', value: profile?.stats?.bestWpm || 0, icon: '⚡' },
                                        { label: 'Total Games', value: profile?.stats?.totalGames || 0, icon: '🎮' },
                                        { label: 'Total Kills', value: (profile?.stats?.totalKills || 0).toLocaleString(), icon: '💀' },
                                        { label: 'Words Typed', value: (profile?.stats?.totalWordsTyped || 0).toLocaleString(), icon: '⌨️' },
                                        { label: 'Achievements', value: profile?.stats?.achievementCount || 0, icon: '🏅' },
                                        { label: 'Total Gold', value: (stats.totalGoldEarned || 0).toLocaleString(), icon: '💰' },
                                        { label: 'Best Streak', value: profile?.stats?.bestStreak || 0, icon: '🔥' },
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
                                            {profile?.stats?.duelWins || 0}
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
                                            {profile?.stats?.duelLosses || 0}
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
                                            {(profile?.stats?.duelWins || 0) + (profile?.stats?.duelLosses || 0) > 0
                                                ? Math.round(((profile?.stats?.duelWins || 0) / ((profile?.stats?.duelWins || 0) + (profile?.stats?.duelLosses || 0))) * 100)
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

                                {/* Shareable Rank Card */}
                                <div style={styles.section}>
                                    <h2 style={styles.sectionTitle}>Aura Card</h2>
                                    <ShareableRankCard
                                        score={profile?.stats?.bestScore || 0}
                                        wpm={profile?.stats?.bestWpm || 0}
                                        chainId={walletAddress}
                                        rankTitle={getRankTitle(profile?.stats?.bestScore || 0)}
                                        displayName={currentDisplayName}
                                    />
                                </div>
                            </>
                        )}

                        {activeTab === 'achievements' && (
                            <>
                                <h2 style={styles.achievementsTitle}>Medals</h2>
                                <div style={styles.achievementsSubtitle}>
                                    Unlock medals in Story Mode!
                                </div>
                                <div style={styles.section}>
                                    <h2 style={styles.sectionTitle}>Targets Destroyed</h2>
                                    <div style={styles.achievementsGrid}>
                                        {enemyAchievements.map((achievement: Achievement) => {
                                            const isHovered = hoveredAchievement === achievement.id;
                                            const currentFrame = isHovered ? frame : 0;
                                            const col = currentFrame % SPRITE_COLS;
                                            const row = Math.floor(currentFrame / SPRITE_COLS);
                                            const bgX = -col * ENEMY_WIDTH;
                                            const bgY = -row * ENEMY_HEIGHT;

                                            return (
                                                <div
                                                    key={achievement.id}
                                                    style={mergeStyles(
                                                        styles.enemyCard,
                                                        achievement.unlocked ? styles.enemyCardUnlocked : {}
                                                    )}
                                                    onMouseEnter={() => achievement.unlocked && setHoveredAchievement(achievement.id)}
                                                    onMouseLeave={() => achievement.unlocked && setHoveredAchievement(null)}
                                                >
                                                    <div style={styles.enemyImageContainer}>
                                                        <div style={styles.achievementSprite(achievement.imagePath, bgX, bgY, SPRITE_WIDTH, SPRITE_HEIGHT, achievement.unlocked)} />
                                                    </div>
                                                    {achievement.unlocked ? (
                                                        <div style={mergeStyles(styles.enemyName, styles.enemyNameUnlocked)}>
                                                            {achievement.name}
                                                        </div>
                                                    ) : (
                                                        <div style={styles.enemyStatus}>Classified</div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'matchHistory' && (
                            <div style={styles.section}>
                                <h2 style={styles.sectionTitle}>Match History</h2>
                                {matchHistory.length === 0 ? (
                                    <div style={styles.emptyState}>
                                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎮</div>
                                        No matches recorded yet. Play to create history!
                                    </div>
                                ) : (
                                    <div style={styles.matchHistoryContainer}>
                                        <div style={styles.matchHistoryHeader}>
                                            <span>Date</span>
                                            <span>Mode</span>
                                            <span>Score</span>
                                            <span>WPM</span>
                                            <span>Wave</span>
                                            <span>Kills</span>
                                            <span style={styles.matchHistoryHeaderRight}>Gold</span>
                                        </div>
                                        {matchHistory.slice(0, 20).map((match, index) => (
                                            <div key={match.id} style={styles.matchRow(index < matchHistory.length - 1)}>
                                                <span style={styles.matchDate}>{formatDate(match.date)}</span>
                                                <span style={styles.matchMode}>{getModeLabel(match.mode)}</span>
                                                <span style={styles.matchScore}>{match.score}</span>
                                                <span style={styles.matchWpm}>{match.wpm}</span>
                                                <span style={styles.matchWpm}>{match.wave}</span>
                                                <span style={styles.matchWpm}>{match.kills}</span>
                                                <span style={styles.matchGold}>+{match.goldEarned}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'inventory' && (
                            <div style={styles.section}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>Hangar Inventory</h2>
                                    {onGoToShop && (
                                        <button onClick={onGoToShop} style={mergeStyles(BUTTON_STYLES.small, { padding: '8px 16px' })}>
                                            Go to Supply
                                        </button>
                                    )}
                                </div>
                                {Object.keys(inventory).length === 0 ? (
                                    <div style={styles.emptyState}>
                                        Hangar empty. Visit Supply to requisition gear!
                                    </div>
                                ) : (
                                    <div style={styles.inventoryGrid}>
                                        {Object.entries(inventory).map(([id, quantity]) => (
                                            <div key={id} style={styles.inventoryItem}>
                                                <span style={styles.inventoryName}>{POWERUP_NAMES[id] || id}</span>
                                                <span style={styles.inventoryQuantity}>×{quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CryptScreen;
