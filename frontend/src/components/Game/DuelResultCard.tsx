'use client';

import React, { useState } from 'react';
import { formatUSDC } from '../../hooks/useUSDC';
import TxLink from './TxLink';
import styles from './result-card.module.css';

interface DuelResultCardProps {
  score: number;
  wpm: number;
  missCount: number;
  opponentScore: number;
  opponentWpm: number;
  opponentMisses: number;
  stakeAmount: bigint;
  totalPot: bigint;
  status: 'submitting' | 'waiting' | 'settling' | 'settled' | 'error';
  payout: bigint | null;
  txHash: string;
  error: string;
  isWinner: boolean;
  isProfit: boolean;
  waitingForOpponent: boolean;
  onRestart: () => void;
  onBackToMenu: () => void;
  onRetrySettlement?: () => void;
}

const DuelResultCard: React.FC<DuelResultCardProps> = ({
  score,
  wpm,
  missCount,
  opponentScore,
  opponentWpm,
  opponentMisses,
  stakeAmount,
  totalPot,
  status,
  payout,
  txHash,
  error,
  isWinner,
  isProfit,
  waitingForOpponent,
  onRestart,
  onBackToMenu,
  onRetrySettlement,
}) => {
  const [copiedPayout, setCopiedPayout] = useState(false);

  const handleCopyPayout = async () => {
    if (!payout) return;

    try {
      const payoutText = formatUSDC(payout);
      await navigator.clipboard.writeText(payoutText);
      setCopiedPayout(true);
      setTimeout(() => setCopiedPayout(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getTitle = () => {
    if (status === 'submitting') return '📤 Submitting...';
    if (waitingForOpponent) return '⏳ Waiting for Opponent...';
    if (status === 'settled') return isWinner ? '🏆 You Win!' : '💀 You Lose!';
    return 'Settling Duel...';
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.resultCard}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.gameOverTitle}>{getTitle()}</h1>
        </div>

        {/* Main Card Body */}
        <div className={styles.cardBody}>
          {/* Score Comparison */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Score Comparison</h3>

            <div className={styles.duelComparisonGrid}>
              {/* You */}
              <div className={`${styles.comparisonBox} ${isWinner ? styles.winner : ''}`}>
                <h4 className={styles.playerLabel}>You</h4>
                <div className={styles.comparisonStat}>
                  <span className={styles.comparisonValue}>{score}</span>
                  <span className={styles.comparisonLabel}>Score</span>
                </div>
                <div className={styles.comparisonStat}>
                  <span className={styles.comparisonValue}>{wpm}</span>
                  <span className={styles.comparisonLabel}>WPM</span>
                </div>
                <div className={styles.comparisonStat}>
                  <span className={styles.comparisonValue}>{missCount}</span>
                  <span className={styles.comparisonLabel}>Misses</span>
                </div>
              </div>

              {/* Opponent */}
              <div className={`${styles.comparisonBox} ${!isWinner && status === 'settled' ? styles.winner : ''}`}>
                <h4 className={styles.playerLabel}>Opponent</h4>
                {waitingForOpponent ? (
                  <div className={styles.waitingPlaceholder}>
                    <span className={styles.spinner}>⟳</span>
                    <span>Waiting...</span>
                  </div>
                ) : (
                  <>
                    <div className={styles.comparisonStat}>
                      <span className={styles.comparisonValue}>{opponentScore}</span>
                      <span className={styles.comparisonLabel}>Score</span>
                    </div>
                    <div className={styles.comparisonStat}>
                      <span className={styles.comparisonValue}>{opponentWpm}</span>
                      <span className={styles.comparisonLabel}>WPM</span>
                    </div>
                    <div className={styles.comparisonStat}>
                      <span className={styles.comparisonValue}>{opponentMisses}</span>
                      <span className={styles.comparisonLabel}>Misses</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Pot Info */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Pot Details</h3>
            <div className={styles.potInfo}>
              <div className={styles.potRow}>
                <span className={styles.potLabel}>Total Pot:</span>
                <span className={styles.potValue}>{formatUSDC(totalPot)} USDC</span>
              </div>
              <div className={styles.potSubtext}>
                (Each player staked {formatUSDC(stakeAmount)} USDC • 10% platform fee on winnings)
              </div>
            </div>
          </section>

          {/* Settlement Status */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Settlement</h3>

            {status === 'submitting' && (
              <div className={styles.statusMessage}>
                <span className={styles.spinner}>⟳</span>
                Submitting your results...
              </div>
            )}

            {status === 'waiting' && waitingForOpponent && (
              <div className={styles.statusMessage}>
                <span className={styles.spinner}>⟳</span>
                Waiting for opponent to finish...
              </div>
            )}

            {status === 'settling' && (
              <div className={styles.statusMessage}>
                <span className={styles.spinner}>⟳</span>
                Settlement in progress...
              </div>
            )}

            {status === 'settled' && (
              <>
                <div className={`${styles.payoutRow} ${styles.finalPayout}`}>
                  <span className={styles.payoutLabel}>
                    {isWinner ? 'You Won:' : 'Result:'}
                  </span>
                  <div className={styles.finalPayoutValue}>
                    <span className={isProfit ? styles.profit : styles.loss}>
                      {isWinner ? `+${formatUSDC(payout || BigInt(0))} USDC` : 'Better luck next time!'}
                    </span>
                    {isWinner && payout && payout > BigInt(0) && (
                      <button
                        onClick={handleCopyPayout}
                        className={styles.copyButton}
                        title="Copy winnings amount"
                        aria-label="Copy winnings amount"
                      >
                        {copiedPayout ? '✓' : '📋'}
                      </button>
                    )}
                  </div>
                </div>

                {txHash && (
                  <div style={{ marginTop: '16px' }}>
                    <TxLink txHash={txHash} />
                  </div>
                )}
              </>
            )}

            {status === 'error' && (
              <div className={styles.errorBox}>
                <span className={styles.errorIcon}>❌</span>
                <span className={styles.errorText}>{error || 'Settlement failed'}</span>
                {onRetrySettlement && (
                  <button onClick={onRetrySettlement} className={styles.retryButton}>
                    Retry Settlement
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Action Buttons */}
          {(status === 'settled' || status === 'error') && (
            <div className={styles.actions}>
              <button onClick={onRestart} className={styles.primaryButton}>
                New Duel
              </button>
              <button onClick={onBackToMenu} className={styles.secondaryButton}>
                Back to Menu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DuelResultCard;
