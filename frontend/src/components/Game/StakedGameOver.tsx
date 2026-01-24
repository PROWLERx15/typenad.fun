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

  // Penalty constants
  const FREE_MISSES = BigInt(10);
  const FREE_TYPOS = BigInt(7);
  const PENALTY_AMOUNT = BigInt(100_000); // 0.1 USDC

  // Estimate payout (frontend estimation for display)
  const estimatePayout = () => {
    const PLATFORM_FEE_BPS = BigInt(1000); // 10%

    const penalizedMisses = BigInt(missCount) > FREE_MISSES ? BigInt(missCount) - FREE_MISSES : BigInt(0);
    const penalizedTypos = BigInt(typoCount) > FREE_TYPOS ? BigInt(typoCount) - FREE_TYPOS : BigInt(0);
    const totalPenalty = (penalizedMisses * PENALTY_AMOUNT) + (penalizedTypos * PENALTY_AMOUNT);
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
        // Check if it's a SessionNotActive error (already settled)
        if (data.error?.includes('SessionNotActive') || data.alreadySettled) {
          // Game was already settled, try to fetch the result
          const statusResponse = await fetch(`/api/game-settlement-status?sequenceNumber=${sequenceNumber.toString()}`);
          const statusData = await statusResponse.json();
          if (statusData.status === 'settled') {
            setPayout(BigInt(statusData.payout || '0'));
            setTxHash(statusData.txHash || '');
            setStatus('settled');
            return;
          }
        }
        throw new Error(data.error || 'Failed to trigger settlement');
      }

      const result = await response.json();

      if (result.success) {
        // Check if it was already settled
        if (result.alreadySettled) {
          console.log('[StakedGameOver] Game was already settled');
        }
        // Settlement executed successfully
        setPayout(BigInt(result.payout || '0'));
        setTxHash(result.txHash || '');
        setStatus('settled');
      } else {
        throw new Error(result.error || 'Settlement failed');
      }

    } catch (err: unknown) {
      console.error('[StakedGameOver] Settlement trigger failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to trigger settlement';

      // If it's a SessionNotActive error, the game is already settled
      if (errorMessage.includes('SessionNotActive')) {
        setError('Game already settled - payout was sent!');
      } else {
        setError(errorMessage);
      }
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
        } else if (data.status === 'error' && data.error && !data.error.includes('Could not verify on-chain status')) {
          // Only set error for definitive errors, not RPC timeouts
          clearInterval(pollInterval);
          setError(data.error || 'Settlement failed');
          setStatus('error');
        }
        // For 'pending' or RPC errors, keep polling
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

  // Calculate penalties for display
  const penalizedMisses = BigInt(missCount) > FREE_MISSES ? BigInt(missCount) - FREE_MISSES : BigInt(0);
  const penalizedTypos = BigInt(typoCount) > FREE_TYPOS ? BigInt(typoCount) - FREE_TYPOS : BigInt(0);
  const missDeduction = penalizedMisses * PENALTY_AMOUNT;
  const typoDeduction = penalizedTypos * PENALTY_AMOUNT;
  const totalSlashed = missDeduction + typoDeduction;

  return (
    <ResultCard
      score={score}
      wpm={wpm}
      missCount={missCount}
      typoCount={typoCount}
      stakeAmount={stakeAmount}
      bonusAmount={bonusAmount}
      missDeduction={missDeduction}
      typoDeduction={typoDeduction}
      totalSlashed={totalSlashed}
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
