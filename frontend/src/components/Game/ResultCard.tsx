'use client';

import React, { useState } from 'react';
import { formatUSDC } from '../../hooks/useUSDC';
import ResultStat from './ResultStat';
import TxLink from './TxLink';
import styles from './result-card.module.css';

interface ResultCardProps {
  score: number;
  wpm: number;
  missCount: number;
  typoCount: number;
  stakeAmount: bigint;
  bonusAmount: bigint;
  slashedAmount: bigint;
  finalPayout: bigint | null;
  txHash: string;
  status: 'idle' | 'signing' | 'settling' | 'settled' | 'error';
  error: string;
  isProfit: boolean;
  onRestart: () => void;
  onBackToMenu: () => void;
  onRetrySettle?: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({
  score,
  wpm,
  missCount,
  typoCount,
  stakeAmount,
  bonusAmount,
  slashedAmount,
  finalPayout,
  txHash,
  status,
  error,
  isProfit,
  onRestart,
  onBackToMenu,
  onRetrySettle,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyPayout = async () => {
    if (!finalPayout) return;

    try {
      const payoutText = formatUSDC(finalPayout);
      await navigator.clipboard.writeText(payoutText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const hasStake = stakeAmount > BigInt(0);
  const isZeroPayout = finalPayout !== null && finalPayout === BigInt(0);

  return (
    <div className={styles.overlay}>
      <div className={styles.resultCard}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.gameOverTitle}>
            💀 GAME OVER
          </h1>
          {status === 'settled' && (
            <p className={styles.playerSummary}>
              WPM: {wpm} • Score: {score.toLocaleString()}
            </p>
          )}
        </div>

        {/* Main Card Body */}
        <div className={styles.cardBody}>
          {/* Section A: Stake Summary */}
          {hasStake && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Payout Breakdown</h3>

              <div className={styles.payoutDetails}>
                <div className={styles.payoutRow}>
                  <span className={styles.payoutLabel}>Original Stake:</span>
                  <span className={styles.payoutValue}>{formatUSDC(stakeAmount)} USDC</span>
                </div>

                {bonusAmount > BigInt(0) && (
                  <div className={`${styles.payoutRow} ${styles.bonus}`}>
                    <span className={styles.payoutLabel}>Bonus (WPM):</span>
                    <span className={styles.payoutValue}>+{formatUSDC(bonusAmount)} USDC</span>
                  </div>
                )}

                {slashedAmount > BigInt(0) && (
                  <div className={`${styles.payoutRow} ${styles.penalty}`}>
                    <span className={styles.payoutLabel}>Slashed (Penalties):</span>
                    <span className={styles.payoutValue}>-{formatUSDC(slashedAmount)} USDC</span>
                  </div>
                )}

                <div className={styles.divider} />

                {status === 'settled' ? (
                  <div className={`${styles.payoutRow} ${styles.finalPayout}`}>
                    <span className={styles.payoutLabel}>Final Payout:</span>
                    <div className={styles.finalPayoutValue}>
                      <span className={isProfit ? styles.profit : styles.loss}>
                        {formatUSDC(finalPayout || BigInt(0))} USDC
                      </span>
                      {finalPayout !== null && finalPayout > BigInt(0) && (
                        <button
                          onClick={handleCopyPayout}
                          className={styles.copyButton}
                          title="Copy payout amount"
                          aria-label="Copy payout amount"
                        >
                          {copied ? '✓' : '📋'}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={`${styles.payoutRow} ${styles.finalPayout}`}>
                    <span className={styles.payoutLabel}>Final Payout:</span>
                    <span className={styles.loadingSpinner}>
                      <span className={styles.spinner}>⟳</span> Computing...
                    </span>
                  </div>
                )}

                {/* Warning for zero payout */}
                {status === 'settled' && isZeroPayout && (
                  <div className={styles.warningBox}>
                    <span className={styles.warningIcon}>⚠️</span>
                    <span className={styles.warningText}>
                      No payout — staked amount was fully slashed
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* No stake message */}
          {!hasStake && (
            <div className={styles.noStakeMessage}>
              <span className={styles.infoIcon}>ℹ️</span>
              <span>No stake for this run</span>
            </div>
          )}

          {/* Section B: Game Stats */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Game Statistics</h3>
            <div className={styles.statsGrid}>
              <ResultStat label="Score" value={score.toLocaleString()} />
              <ResultStat label="WPM" value={wpm.toString()} />
              <ResultStat label="Misses" value={missCount.toString()} />
              <ResultStat label="Typos" value={typoCount.toString()} />
            </div>
          </section>

          {/* Section C: Transaction / Receipt */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Transaction</h3>
            
            {status === 'signing' && (
              <div className={styles.statusMessage}>
                <span className={styles.spinner}>⟳</span>
                Getting signature from server...
              </div>
            )}

            {status === 'settling' && (
              <div className={styles.statusMessage}>
                <span className={styles.spinner}>⟳</span>
                Confirming transaction on chain...
              </div>
            )}

            {status === 'settled' && txHash && (
              <TxLink txHash={txHash} />
            )}

            {status === 'idle' && (
              <div className={styles.statusMessage}>
                Awaiting settlement...
              </div>
            )}

            {status === 'error' && (
              <div className={styles.errorBox}>
                <span className={styles.errorIcon}>❌</span>
                <span className={styles.errorText}>{error || 'Settlement failed'}</span>
                {onRetrySettle && (
                  <button onClick={onRetrySettle} className={styles.retryButton}>
                    Retry Settlement
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Section D: Action Buttons */}
          {(status === 'settled' || status === 'error') && (
            <div className={styles.actions}>
              <button onClick={onRestart} className={styles.primaryButton}>
                Play Again
              </button>
              <button onClick={onBackToMenu} className={styles.secondaryButton}>
                Back to Menu
              </button>
            </div>
          )}
        </div>

        {/* Footer Summary */}
        {hasStake && status === 'settled' && (
          <div className={styles.footer}>
            <span className={styles.footerText}>
              Staked: {formatUSDC(stakeAmount)} USDC • 
              Bonus: {formatUSDC(bonusAmount)} USDC • 
              Slashed: {formatUSDC(slashedAmount)} USDC
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;
