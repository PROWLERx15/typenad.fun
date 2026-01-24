'use client';

import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { usePrivyWallet } from '../../hooks/usePrivyWallet';
import { SCREEN_STYLES, BACKGROUND_STYLES, BUTTON_STYLES, FONTS, mergeStyles } from '../../styles/theme';
import { styles } from './CryptScreen.styles';
import { ENEMY_TYPE_IDS } from '../../constants/enemyTypes';
import { getPlayerStats, getMatchHistory, getPowerupInventory, MatchHistoryEntry } from '../../constants/gameStats';
import ShareableRankCard from './ShareableRankCard';
import { supabase } from '../../lib/supabaseClient';
import { ensureUserExists } from '../../utils/supabaseHelpers';

interface CryptScreenProps {
    onClose: () => void;
    onGoToShop?: () => void;
}

type TabType = 'achievements' | 'matchHistory' | 'profile';

interface Achievement {
    id: string;
    name: string;
    type: string;
    unlocked: boolean;
    imagePath: string;
}

const FRAME_COUNT = 6;
const SPRITE_COLS = 3;
// const SPRITE_ROWS = 2; // Unused
const SPRITE_WIDTH = 1024;
const SPRITE_HEIGHT = 1024;
const ENEMY_WIDTH = SPRITE_WIDTH / SPRITE_COLS;
const ENEMY_HEIGHT = SPRITE_HEIGHT / 2; // Assuming 2 rows based on previous code

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
    const { user } = usePrivy();
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
    const [onlineStats, setOnlineStats] = React.useState<{ totalGames: number; totalKills: number; totalGold: number } | null>(null);
    const [matchHistory, setMatchHistory] = React.useState<MatchHistoryEntry[]>([]);
    const [inventory, setInventory] = React.useState<Record<string, number>>({});

    // Score state
    const [myScore, setMyScore] = React.useState(0);
    const [myWpm, setMyWpm] = React.useState(0);

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

            const cachedScore = parseInt(localStorage.getItem('personal_best_score') || '0');
            const cachedWpm = parseInt(localStorage.getItem('personal_best_wpm') || '0');
            setMyScore(cachedScore);
            setMyWpm(cachedWpm);
        }
    }, []);

    // Sync from Supabase
    React.useEffect(() => {
        const syncFromSupabase = async () => {
            if (!address) return;

            try {
                const { data: userData } = await supabase
                    .from('users')
                    .select('id, username, gold, total_games, total_kills, total_words_typed')
                    .eq('wallet_address', address)
                    .single();

                const user = userData as any;

                if (user) {
                    if (user.username) {
                        setCurrentDisplayName(user.username);
                        setDisplayName(user.username);
                        localStorage.setItem('display_name', user.username);
                    }

                    // Update stats from database (source of truth)
                    if (user.total_games !== undefined) {
                        const dbStats = {
                            totalGames: user.total_games || 0,
                            totalKills: user.total_kills || 0,
                            totalGoldEarned: stats.totalGoldEarned, // Keep local for now
                            bestStreak: stats.bestStreak,
                            totalWordsTyped: user.total_words_typed || 0
                        };
                        setOnlineStats({
                            totalGames: user.total_games || 0,
                            totalKills: user.total_kills || 0,
                            totalGold: user.gold || 0
                        });
                    }

                    // Fetch aggregated stats from game_scores
                    const { data: scoresData } = await supabase
                        .from('game_scores')
                        .select('score, wpm, kills, wave_reached, created_at')
                        .eq('user_id', user.id);

                    const scores = scoresData as any[];

                    if (scores && scores.length > 0) {
                        const bestScore = Math.max(...scores.map(s => s.score));
                        const bestWpm = Math.max(...scores.map(s => s.wpm));

                        if (bestScore > myScore) setMyScore(bestScore);
                        if (bestWpm > myWpm) setMyWpm(bestWpm);

                        // Update match history
                        const history: MatchHistoryEntry[] = scores
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .slice(0, 20)
                            .map(s => ({
                                id: Math.random().toString(),
                                date: s.created_at,
                                score: s.score,
                                wpm: s.wpm,
                                wave: s.wave_reached || 0,
                                kills: s.kills || 0,
                                goldEarned: 0,
                                mode: 'story',
                                powerupsUsed: []
                            }));
                        setMatchHistory(history);
                    }

                    // Fetch Inventory
                    const { data: inventoryData } = await supabase
                        .from('user_inventory')
                        .select('item_id, quantity')
                        .eq('user_id', user.id);

                    const items = inventoryData as any[];

                    if (items) {
                        const newInventory: Record<string, number> = {};
                        items.forEach(item => {
                            newInventory[item.item_id] = item.quantity;
                        });
                        setInventory(newInventory);
                    }
                }
            } catch (err) {
                console.error('Failed to sync Crypt data:', err);
            }
        };

        syncFromSupabase();
    }, [address]);

    const handleSaveDisplayName = async () => {
        if (displayName.length >= 3 && displayName.length <= 20) {
            localStorage.setItem('display_name', displayName);
            setCurrentDisplayName(displayName);
            setIsEditingName(false);

            if (address) {
                const email = user?.email?.address || user?.google?.email;
                const googleId = user?.google?.subject;

                const userId = await ensureUserExists(supabase, address, {
                    email,
                    username: displayName,
                    googleId
                } as any);

                if (userId) {
                    await (supabase.from('users') as any).update({ username: displayName }).eq('id', userId);
                }
            }
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
            default: return mode;
        }
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
                <h1 style={styles.title}>Pilot Profile</h1>

                <div style={styles.tabNav}>
                    <button onClick={() => setActiveTab('profile')} style={styles.tabButton(activeTab === 'profile')}>
                        Profile
                    </button>
                    <button onClick={() => setActiveTab('achievements')} style={styles.tabButton(activeTab === 'achievements')}>
                        Achievements
                    </button>
                    <button onClick={() => setActiveTab('matchHistory')} style={styles.tabButton(activeTab === 'matchHistory')}>
                        Log
                    </button>
                </div>

                {activeTab === 'profile' && (
                    <>
                        {/* Display Name Section */}
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>Callsign</h2>
                            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {!isEditingName ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ color: '#fff', fontSize: '18px', fontFamily: FONTS.primary }}>
                                            {currentDisplayName || 'No callsign set'}
                                        </div>
                                        <button
                                            onClick={() => setIsEditingName(true)}
                                            style={mergeStyles(BUTTON_STYLES.small, { padding: '8px 16px' })}
                                        >
                                            {currentDisplayName ? 'Edit' : 'Set Name'}
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="Enter callsign"
                                            maxLength={20}
                                            style={{
                                                padding: '10px',
                                                fontSize: '16px',
                                                width: '300px',
                                                backgroundColor: '#1a1a1a',
                                                border: '2px solid #444',
                                                borderRadius: '4px',
                                                color: '#fff',
                                            }}
                                        />
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                            <button onClick={handleSaveDisplayName} style={mergeStyles(BUTTON_STYLES.small, { padding: '8px 16px' })}>
                                                Save
                                            </button>
                                            <button onClick={() => setIsEditingName(false)} style={mergeStyles(BUTTON_STYLES.small, { padding: '8px 16px' })}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Statistics Section */}
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>Service Record</h2>
                            <div style={styles.statsGrid}>
                                <div style={styles.statCard}>
                                    <div style={styles.statValue}>{onlineStats?.totalGames || stats.totalGames}</div>
                                    <div style={styles.statLabel}>Missions Flown</div>
                                </div>
                                <div style={styles.statCard}>
                                    <div style={styles.statValue}>{onlineStats?.totalKills || stats.totalKills}</div>
                                    <div style={styles.statLabel}>Enemies Destroyed</div>
                                </div>
                                <div style={styles.statCard}>
                                    <div style={styles.statValue}>{stats.totalGoldEarned}</div>
                                    <div style={styles.statLabel}>Total Credits Earned</div>
                                </div>
                                <div style={styles.statCard}>
                                    <div style={styles.statValue}>{myScore}</div>
                                    <div style={styles.statLabel}>Best Score</div>
                                </div>
                                <div style={styles.statCard}>
                                    <div style={styles.statValue}>{myWpm}</div>
                                    <div style={styles.statLabel}>Best WPM</div>
                                </div>
                                <div style={styles.statCard}>
                                    <div style={styles.statValue}>{stats.totalWordsTyped}</div>
                                    <div style={styles.statLabel}>Commands Typed</div>
                                </div>
                            </div>
                        </div>

                        {/* Inventory Section */}
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

                        {/* Shareable Rank Card */}
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>Service ID Card</h2>
                            <ShareableRankCard
                                score={myScore}
                                wpm={myWpm}
                                chainId={walletAddress}
                                rankTitle={getRankTitle(myScore)}
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
                        <h2 style={styles.sectionTitle}>Mission Logs</h2>
                        {matchHistory.length === 0 ? (
                            <div style={styles.emptyState}>
                                <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎮</div>
                                No missions logged. Sortie to create history.
                            </div>
                        ) : (
                            <div style={styles.matchHistoryContainer}>
                                <div style={styles.matchHistoryHeader}>
                                    <span>Date</span>
                                    <span>Mode</span>
                                    <span>Score</span>
                                    <span>WPM</span>
                                    <span style={styles.matchHistoryHeaderRight}>Credits</span>
                                </div>
                                {matchHistory.slice(0, 20).map((match, index) => (
                                    <div key={match.id} style={styles.matchRow(index < matchHistory.length - 1)}>
                                        <span style={styles.matchDate}>{formatDate(match.date)}</span>
                                        <span style={styles.matchMode}>{getModeLabel(match.mode)}</span>
                                        <span style={styles.matchScore}>{match.score}</span>
                                        <span style={styles.matchWpm}>{match.wpm}</span>
                                        <span style={styles.matchGold}>+{match.goldEarned}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CryptScreen;
