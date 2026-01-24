'use client';

import React, { useState, useEffect } from 'react';
import { useTypeNadContract } from '../../hooks/useTypeNadContract';
import { usePrivyWallet } from '../../hooks/usePrivyWallet';
import { formatUSDC } from '../../hooks/useUSDC';
import { styles as gameOverStyles } from './GameOver.styles';

interface StakedGameOverProps {
  score: number;
  wpm: number;
  missCount: number;
  typoCount: number;
  sequenceNumber: bigint;
  stakeAmount: bigint;
  onRestart: () => void;
  onBackToMenu: () => void;
}

const StakedGameOver: React.FC<StakedGameOverProps> = ({
  score,
  wpm,
  missCount,
  typoCount,
  sequenceNumber,
  stakeAmount,
  onRestart,
  onBackToMenu,
}) => {
  const { address } = usePrivyWallet();
  const { settleGame } = useTypeNadContract();
  const [status, setStatus] = useState<'idle' | 'signing' | 'settling' | 'settled' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const [payout, setPayout] = useState<bigint | null>(null);
  const [txHash, setTxHash] = useState<string>('');

  // Calculate bonus amount based on WPM
  // Bonus is wpm * 1000 (0.001 USDC per WPM)
  const bonusAmount = BigInt(Math.floor(wpm * 1000));

  // Estimate payout (frontend estimation for display)
  const estimatePayout = () => {
    const FREE_MISSES = BigInt(10);
    const PENALTY_AMOUNT = BigInt(100_000); // 0.1 USDC
    const PLATFORM_FEE_BPS = BigInt(1000); // 10%

    const penalizedMisses = BigInt(missCount) > FREE_MISSES ? BigInt(missCount) - FREE_MISSES : BigInt(0);
    const totalPenalty = penalizedMisses * PENALTY_AMOUNT;
    const grossPayout = stakeAmount + bonusAmount > totalPenalty ? stakeAmount + bonusAmount - totalPenalty : BigInt(0);
    const platformFee = (grossPayout * PLATFORM_FEE_BPS) / BigInt(10000);
    const netPayout = grossPayout - platformFee;
    return netPayout;
  };

  const handleSettle = async () => {
    setStatus('signing');
    setError('');

    try {
      // Call backend to get signature
      const response = await fetch('/api/settle-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sequenceNumber: sequenceNumber.toString(),
          misses: missCount,
          typos: typoCount,
          bonusAmount: bonusAmount.toString(),
          playerAddress: address,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get signature');
      }

      const { signature } = await response.json();

      setStatus('settling');

      // Call contract to settle
      const result = await settleGame(
        sequenceNumber,
        BigInt(missCount),
        BigInt(typoCount),
        bonusAmount,
        signature as `0x${string}`
      );

      setPayout(result.payout);
      setTxHash(result.hash);
      setStatus('settled');
    } catch (err: unknown) {
      console.error('Settlement failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to settle game');
      setStatus('error');
    }
  };

  // Auto-settle on mount
  useEffect(() => {
    handleSettle();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const estimatedPayout = estimatePayout();
  const isProfit = estimatedPayout > stakeAmount;

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`}</style>
      <div style={gameOverStyles.container}>
        <h1 style={gameOverStyles.title}>
          {status === 'settled' ? (isProfit ? '🎉 Victory!' : '💀 Game Over') : 'Settling Game...'}
        </h1>

        {/* Game Stats */}
        <div style={{ marginBottom: '20px' }}>
          <p style={gameOverStyles.statText}>Score: {score}</p>
          <p style={gameOverStyles.statText}>WPM: {wpm}</p>
          <p style={gameOverStyles.statText}>Misses: {missCount}</p>
          <p style={gameOverStyles.statText}>Typos: {typoCount}</p>
        </div>

        {/* Staking Info */}
        <div
          style={{
            padding: '16px',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          <p style={{ ...gameOverStyles.statText, fontSize: '12px', color: '#888' }}>
            Staked: {formatUSDC(stakeAmount)} USDC
          </p>
          <p style={{ ...gameOverStyles.statText, fontSize: '12px', color: '#888' }}>
            Bonus (WPM): +{formatUSDC(bonusAmount)} USDC
          </p>
          {missCount > 10 && (
            <p style={{ ...gameOverStyles.statText, fontSize: '12px', color: '#ef4444' }}>
              Penalties ({missCount - 10} misses): -{formatUSDC(BigInt((missCount - 10) * 100_000))} USDC
            </p>
          )}
        </div>

        {/* Settlement Status */}
        {status === 'signing' && (
          <p style={{ color: '#8B5CF6', fontSize: '12px', marginBottom: '16px' }}>
            Getting signature from server...
          </p>
        )}

        {status === 'settling' && (
          <p style={{ color: '#8B5CF6', fontSize: '12px', marginBottom: '16px' }}>
            Confirming transaction on chain...
          </p>
        )}

        {status === 'settled' && (
          <>
            <p
              style={{
                color: isProfit ? '#22c55e' : '#ef4444',
                fontSize: '16px',
                marginBottom: '16px',
                fontWeight: 'bold',
              }}
            >
              Payout: {formatUSDC(payout || BigInt(0))} USDC
            </p>
            {txHash && (
              <a
                href={`https://testnet.monadexplorer.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#8B5CF6', fontSize: '10px', textDecoration: 'underline' }}
              >
                View Transaction ↗
              </a>
            )}
          </>
        )}

        {status === 'error' && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '8px' }}>{error}</p>
            <button
              onClick={handleSettle}
              style={{
                padding: '8px 16px',
                backgroundColor: '#8B5CF6',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px',
                fontFamily: '"Press Start 2P", monospace',
              }}
            >
              Retry Settlement
            </button>
          </div>
        )}

        {/* Actions */}
        {(status === 'settled' || status === 'error') && (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
            <button onClick={onRestart} style={gameOverStyles.button}>
              Play Again
            </button>
            <button
              onClick={onBackToMenu}
              style={{
                ...gameOverStyles.button,
                backgroundColor: 'transparent',
                border: '2px solid #8B5CF6',
              }}
            >
              Back to Menu
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default StakedGameOver;
