'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTypeNadContract } from '../../hooks/useTypeNadContract';
import { usePrivyWallet } from '../../hooks/usePrivyWallet';
import { supabaseUntyped as supabase } from '../../lib/supabaseClient';
import DuelResultCard from './DuelResultCard';

interface DuelGameOverProps {
  score: number;
  wpm: number;
  missCount: number;
  typoCount: number;
  duelId: bigint;
  stakeAmount: bigint;
  isCreator: boolean;
  opponentAddress?: string;
  kills?: number;
  waveReached?: number;
  duration?: number;
  wordsTyped?: number;
  goldEarned?: number;
  onRestart: () => void;
  onBackToMenu: () => void;
  onAchievementsChecked?: () => void;
}

interface DuelResult {
  duel_id: string;
  player_address: string;
  score: number;
  wpm: number;
  misses: number;
  typos: number;
}

const DuelGameOver: React.FC<DuelGameOverProps> = ({
  score,
  wpm,
  missCount,
  typoCount,
  duelId,
  stakeAmount,
  isCreator,
  opponentAddress: initialOpponentAddress,
  kills = 0,
  waveReached = 1,
  duration = 0,
  wordsTyped = 0,
  goldEarned = 0,
  onRestart,
  onBackToMenu,
  onAchievementsChecked,
}) => {
  const { address } = usePrivyWallet();
  const { getDuel } = useTypeNadContract();
  const [status, setStatus] = useState<'submitting' | 'waiting' | 'settling' | 'settled' | 'error'>('submitting');
  const [error, setError] = useState<string>('');
  const [payout, setPayout] = useState<bigint | null>(null);
  const [txHash, setTxHash] = useState<string>('');
  const [winner, setWinner] = useState<'you' | 'opponent' | null>(null);

  // Opponent data
  const [opponentAddress, setOpponentAddress] = useState<string | undefined>(initialOpponentAddress);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [opponentWpm, setOpponentWpm] = useState<number>(0);
  const [opponentMisses, setOpponentMisses] = useState<number>(0);
  const [opponentTypos, setOpponentTypos] = useState<number>(0);
  const [waitingForOpponent, setWaitingForOpponent] = useState(true);
  const [ownResultSubmitted, setOwnResultSubmitted] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);

  // Save score to database IMMEDIATELY (don't wait for settlement)
  useEffect(() => {
    const saveScore = async () => {
      if (!address || scoreSaved) {
        return;
      }
      
      try {
        console.log('[DuelGameOver] Saving score immediately (before settlement)', {
          score,
          wpm,
          missCount,
          typoCount,
        });

        const response = await fetch('/api/score/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: address,
            score,
            waveReached,
            wpm,
            kills,
            gameMode: 'duel',
            goldEarned,
            misses: missCount,
            typos: typoCount,
            duration,
            wordsTyped,
            isStaked: false,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('[DuelGameOver] Failed to save score:', error);
        } else {
          const result = await response.json();
          console.log('[DuelGameOver] Score saved successfully', result);
          setScoreSaved(true);
          
          // Check for achievements after successful score save
          if (onAchievementsChecked) {
            onAchievementsChecked();
          }
        }
      } catch (error) {
        console.error('[DuelGameOver] Error saving score:', error);
      }
    };
    
    saveScore();
  }, [address, scoreSaved, score, wpm, missCount, typoCount, waveReached, kills, goldEarned, duration, wordsTyped, onAchievementsChecked]);

  // OLD: This useEffect is now removed - we save immediately above
  // Save score to database after settlement completes
  // useEffect(() => {
  //   const saveScore = async () => {
  //     if (status !== 'settled' || !address || !winner) {
  //       return;
  //     }
  //     ...
  //   }
  // }, [status, address, winner, ...]);

  // Fetch opponent address from contract if not provided
  useEffect(() => {
    const fetchOpponentAddress = async () => {
      if (!opponentAddress && address) {
        try {
          const duel = await getDuel(duelId);
          const opponent = isCreator ? duel.player2 : duel.player1;
          setOpponentAddress(opponent);
        } catch (err) {
          console.error('Failed to fetch duel details:', err);
        }
      }
    };
    fetchOpponentAddress();
  }, [duelId, address, opponentAddress, getDuel, isCreator]);

  // Submit own results to Supabase
  useEffect(() => {
    if (!address || ownResultSubmitted) return;

    const submitOwnResults = async () => {
      try {
        setStatus('submitting');

        // Upsert own results
        const { error: upsertError } = await supabase
          .from('duel_results')
          .upsert({
            duel_id: duelId.toString(),
            player_address: address.toLowerCase(),
            score,
            wpm,
            misses: missCount,
            typos: typoCount,
          }, {
            onConflict: 'duel_id,player_address'
          });

        if (upsertError) {
          console.error('Failed to submit results:', upsertError);
          // Don't fail completely, opponent might still submit
        }

        setOwnResultSubmitted(true);
        setStatus('waiting');
      } catch (err) {
        console.error('Error submitting results:', err);
        setOwnResultSubmitted(true);
        setStatus('waiting');
      }
    };

    submitOwnResults();
  }, [address, duelId, score, wpm, missCount, typoCount, ownResultSubmitted]);

  const handleOpponentResults = useCallback((data: DuelResult) => {
    setOpponentScore(data.score);
    setOpponentWpm(data.wpm);
    setOpponentMisses(data.misses);
    setOpponentTypos(data.typos);
    setWaitingForOpponent(false);

    // Determine winner using same logic as API
    if (score > data.score) {
      setWinner('you');
    } else if (score < data.score) {
      setWinner('opponent');
    } else if (wpm > data.wpm) {
      setWinner('you');
    } else if (wpm < data.wpm) {
      setWinner('opponent');
    } else if (missCount < data.misses) {
      setWinner('you');
    } else if (missCount > data.misses) {
      setWinner('opponent');
    } else {
      // Tiebreaker: creator wins
      setWinner(isCreator ? 'you' : 'opponent');
    }
  }, [score, wpm, missCount, isCreator]);

  // Check for existing opponent results and subscribe to new ones
  useEffect(() => {
    if (!address || !opponentAddress) return;

    const duelIdStr = duelId.toString();
    const opponentAddrLower = opponentAddress.toLowerCase();

    // Check if opponent already submitted
    const checkExistingResults = async () => {
      const { data, error } = await supabase
        .from('duel_results')
        .select('*')
        .eq('duel_id', duelIdStr)
        .eq('player_address', opponentAddrLower)
        .single();

      if (data && !error) {
        handleOpponentResults(data as DuelResult);
      }
    };

    checkExistingResults();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`duel-${duelIdStr}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'duel_results',
          filter: `duel_id=eq.${duelIdStr}`,
        },
        (payload) => {
          const newData = payload.new as DuelResult;
          if (newData && newData.player_address.toLowerCase() === opponentAddrLower) {
            handleOpponentResults(newData);
          }
        }
      )
      .subscribe();

    // Timeout after 60 seconds - assume opponent forfeited
    const timeout = setTimeout(() => {
      if (waitingForOpponent) {
        console.log('Opponent timeout - assuming forfeit');
        setWaitingForOpponent(false);
        setWinner('you');
      }
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearTimeout(timeout);
    };
  }, [address, opponentAddress, duelId, waitingForOpponent, handleOpponentResults]);

  // Trigger backend settlement when both players finish
  useEffect(() => {
    if (winner && status === 'waiting') {
      triggerBackendSettlement();
    }
  }, [winner, status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll for settlement status
  useEffect(() => {
    if (status !== 'settling') return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/settlement-status?duelId=${duelId.toString()}`);
        if (!response.ok) {
          console.error('[DuelGameOver] Failed to fetch settlement status');
          return;
        }

        const data = await response.json();
        
        if (data.status === 'settled') {
          // Settlement complete!
          clearInterval(pollInterval);
          setPayout(BigInt(data.payout || '0'));
          setTxHash(data.txHash || '');
          setWinner(data.winner.toLowerCase() === address?.toLowerCase() ? 'you' : 'opponent');
          setStatus('settled');
        } else if (data.status === 'error') {
          clearInterval(pollInterval);
          setError(data.error || 'Settlement failed');
          setStatus('error');
        }
      } catch (err) {
        console.error('[DuelGameOver] Error polling settlement status:', err);
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
  }, [status, duelId, address]);

  const triggerBackendSettlement = async () => {
    if (!winner || !address) return;

    setStatus('settling');
    setError('');

    try {
      console.log('[DuelGameOver] Triggering backend settlement', {
        duelId: duelId.toString(),
      });

      // Call backend to execute settlement (backend pays gas, no wallet approval needed!)
      const response = await fetch('/api/execute-settlement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duelId: duelId.toString(),
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
        setWinner(result.winner.toLowerCase() === address.toLowerCase() ? 'you' : 'opponent');
        setStatus('settled');
      } else {
        throw new Error(result.error || 'Settlement failed');
      }

    } catch (err: unknown) {
      console.error('[DuelGameOver] Settlement trigger failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to trigger settlement');
      setStatus('error');
    }
  };

  const handleRetrySettlement = async () => {
    setError('');
    setStatus('settling');
    await triggerBackendSettlement();
  };

  const totalPot = stakeAmount * 2n;
  const isWinner = winner === 'you';
  
  // Determine profit/loss based on actual payout vs stake
  const isProfit = payout !== null && payout > stakeAmount;

  return (
    <DuelResultCard
      score={score}
      wpm={wpm}
      missCount={missCount}
      opponentScore={opponentScore}
      opponentWpm={opponentWpm}
      opponentMisses={opponentMisses}
      stakeAmount={stakeAmount}
      totalPot={totalPot}
      status={status}
      payout={payout}
      txHash={txHash}
      error={error}
      isWinner={isWinner}
      isProfit={isProfit}
      waitingForOpponent={waitingForOpponent}
      onRestart={onRestart}
      onBackToMenu={onBackToMenu}
      onRetrySettlement={handleRetrySettlement}
    />
  );
};

export default DuelGameOver;
