import React from 'react';
import { COLORS, FONTS, mergeStyles } from '../../styles/theme';
import { styles } from './Leaderboard.styles';

interface LeaderboardEntry {
    chainId: string;
    score: number;
    wpm: number;
    displayName?: string | null;
}

interface LeaderboardProps {
    scores: LeaderboardEntry[];
    myChainId?: string;
    myWalletAddress?: string;
    loading?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ scores, myChainId, myWalletAddress, loading }) => {
    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingText}>
                    ⏳ Loading leaderboard...
                </div>
            </div>
        );
    }

    const getMedalEmoji = (rank: number) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            case 4: return '4️⃣';
            case 5: return '5️⃣';
            case 6: return '6️⃣';
            case 7: return '7️⃣';
            case 8: return '8️⃣';
            case 9: return '9️⃣';
            case 10: return '🔟';
            default: return `#${rank}`;
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <span style={styles.headerTitle}>
                    GLOBAL LEADERBOARD
                </span>
            </div>
            <div style={styles.columnHeaders}>
                <div>Rank</div>
                <div>Player</div>
                <div style={styles.columnHeaderRight}>Score</div>
                <div style={styles.columnHeaderRight}>WPM</div>
            </div>

            {/* Scores */}
            {scores.map((entry, index) => {
                const rank = index + 1;
                // Check if this entry is me - compare against both wallet address and chainId
                const isMe = !!(entry.chainId === myChainId ||
                    (myWalletAddress && entry.chainId === myWalletAddress));

                return (
                    <div
                        key={entry.chainId}
                        style={mergeStyles(
                            styles.rowBase,
                            isMe
                                ? styles.rowHighlight
                                : index % 2 === 0
                                    ? styles.rowEven
                                    : styles.rowOdd,
                            isMe ? styles.rowBorderLeft : styles.rowBorderTransparent
                        )}
                        onMouseEnter={(e) => {
                            if (!isMe) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isMe) {
                                e.currentTarget.style.background = index % 2 === 0
                                    ? 'rgba(0,0,0,0.3)'
                                    : 'rgba(0,0,0,0.5)';
                            }
                        }}
                    >
                        {/* Rank */}
                        <div style={styles.rankCell(rank, isMe)}>
                            {getMedalEmoji(rank)}
                        </div>

                        {/* Player Name */}
                        <div style={styles.playerCell(isMe)}>
                            <span>
                                {entry.displayName || `${entry.chainId.substring(0, 12)}...${entry.chainId.substring(entry.chainId.length - 8)}`}
                            </span>
                            {isMe && (
                                <span style={styles.youBadge}>
                                    YOU
                                </span>
                            )}
                        </div>

                        {/* Score */}
                        <div style={styles.scoreCell(isMe)}>
                            {entry.score.toLocaleString()}
                        </div>

                        {/* WPM */}
                        <div style={styles.wpmCell(isMe)}>
                            {entry.wpm > 0 ? entry.wpm : '-'}
                        </div>
                    </div>
                );
            })}

            {/* Placeholder rows for empty ranks */}
            {Array.from({ length: Math.max(0, 10 - scores.length) }).map((_, index) => {
                const rank = scores.length + index + 1;
                const displayIndex = scores.length + index;
                const isFirstEmpty = scores.length === 0 && index === 0;

                return (
                    <div
                        key={`placeholder-${rank}`}
                        style={mergeStyles(
                            styles.rowBase,
                            displayIndex % 2 === 0 ? styles.rowEven : styles.rowOdd,
                            styles.rowBorderTransparent,
                            { borderBottom: rank < 10 ? '1px solid rgba(255,255,255,0.1)' : 'none' }
                        )}
                    >
                        <div style={styles.rankCellPlaceholder}>
                            {getMedalEmoji(rank)}
                        </div>
                        <div style={isFirstEmpty ? styles.playerCellEncourage : styles.playerCellPlaceholder}>
                            {isFirstEmpty ? 'Play now to claim #1!' : '...'}
                        </div>
                        <div style={styles.scoreCellPlaceholder}>
                            -
                        </div>
                        <div style={styles.wpmCellPlaceholder}>
                            -
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Leaderboard;
