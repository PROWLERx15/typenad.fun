'use client';

import React, { useState, useEffect } from 'react';
import { usePrivyWallet } from '../../hooks/usePrivyWallet';
import ResultCard from './ResultCard';

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
  const [status, setStatus] = useState<'idle' | 'settling' | 'settled' | 'error'>('idle');
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

  // Trigger backend settlement
  const triggerBackendSettlement = async () => {
    setStatus('settling');
    setError('');

    try {
      console.log('[StakedGameOver] Triggering backend settlement', {
        sequenceNumber: sequenceNumber.toString(),
      });

      // Call backend to execute settlement (backend pays gas, no wallet approval needed!)
      const response = await fetch('/api/execute-game-settlement', {
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
        throw new Error(data.error || 'Failed to trigger settlement');
      }

      const result = await response.json();

      if (result.success) {
        // Settlement executed successfully
        setPayout(BigInt(result.payout || '0'));
        setTxHash(result.txHash || '');
        setStatus('settled');
      } else {
        throw new Error(result.error || 'Settlement failed');
      }

    } catch (err: unknown) {
      console.error('[StakedGameOver] Settlement trigger failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to trigger settlement');
      setStatus('error');
    }
  };

  // Poll for settlement status
  useEffect(() => {
    if (status !== 'settling') return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/game-settlement-status?sequenceNumber=${sequenceNumber.toString()}`);
        if (!response.ok) {
          console.error('[StakedGameOver] Failed to fetch settlement status');
          return;
        }

        const data = await response.json();
        
        if (data.status === 'settled') {
          // Settlement complete!
          clearInterval(pollInterval);
          setPayout(BigInt(data.payout || '0'));
          setTxHash(data.txHash || '');
          setStatus('settled');
        } else if (data.status === 'error') {
          clearInterval(pollInterval);
          setError(data.error || 'Settlement failed');
          setStatus('error');
        }
      } catch (err) {
        console.error('[StakedGameOver] Error polling settlement status:', err);
      }
    }, 2000); // Poll every 2 seconds

    // Timeout after 60 seconds
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      if (status === 'settling') {
        setError('Settlement timeout - please check transaction manually');
        setStatus('error');
      }
    }, 60000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [status, sequenceNumber]);

  const handleRetrySettlement = async () => {
    setError('');
    setStatus('settling');
    await triggerBackendSettlement();
  };

  // Auto-settle on mount
  useEffect(() => {
    triggerBackendSettlement();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const estimatedPayout = estimatePayout();
  const isProfit = estimatedPayout > stakeAmount;

  // Calculate slashed amount for display
  const FREE_MISSES = BigInt(10);
  const PENALTY_AMOUNT = BigInt(100_000); // 0.1 USDC
  const penalizedMisses = BigInt(missCount) > FREE_MISSES ? BigInt(missCount) - FREE_MISSES : BigInt(0);
  const slashedAmount = penalizedMisses * PENALTY_AMOUNT;

  return (
    <ResultCard
      score={score}
      wpm={wpm}
      missCount={missCount}
      typoCount={typoCount}
      stakeAmount={stakeAmount}
      bonusAmount={bonusAmount}
      slashedAmount={slashedAmount}
      finalPayout={payout}
      txHash={txHash}
      status={status}
      error={error}
      isProfit={isProfit}
      onRestart={onRestart}
      onBackToMenu={onBackToMenu}
      onRetrySettle={handleRetrySettlement}
    />
  );
};

export default StakedGameOver;
