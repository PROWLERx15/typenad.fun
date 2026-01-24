'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTypeNadContract } from '../../hooks/useTypeNadContract';
import { usePrivyWallet } from '../../hooks/usePrivyWallet';
import { formatUSDC } from '../../hooks/useUSDC';
import { supabaseUntyped as supabase } from '../../lib/supabaseClient';
import { styles as gameOverStyles } from './GameOver.styles';

interface DuelGameOverProps {
  score: number;
  wpm: number;
  missCount: number;
  typoCount: number;
  duelId: bigint;
  stakeAmount: bigint;
  isCreator: boolean;
  opponentAddress?: string;
  onRestart: () => void;
  onBackToMenu: () => void;
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
  onRestart,
  onBackToMenu,
}) => {
  const { address } = usePrivyWallet();
  const { settleDuel, getDuel } = useTypeNadContract();
  const [status, setStatus] = useState<'submitting' | 'waiting' | 'signing' | 'settling' | 'settled' | 'error'>('submitting');
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

  // Auto-settle when winner is determined
  useEffect(() => {
    if (winner && status === 'waiting') {
      handleSettle();
    }
  }, [winner, status]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSettle = async () => {
    if (!winner || !address || !opponentAddress) return;

    setStatus('signing');
    setError('');

    try {
      // Prepare player data for API
      const myPlayerData = {
        address: address,
        score,
        misses: missCount,
        typos: typoCount,
        wpm,
      };

      const opponentPlayerData = {
        address: opponentAddress,
        score: opponentScore,
        misses: opponentMisses,
        typos: opponentTypos,
        wpm: opponentWpm,
      };

      // Player1 is always creator, player2 is joiner
      const player1Data = isCreator ? myPlayerData : opponentPlayerData;
      const player2Data = isCreator ? opponentPlayerData : myPlayerData;

      // Call backend to determine winner and get signature
      const response = await fetch('/api/settle-duel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duelId: duelId.toString(),
          player1: player1Data,
          player2: player2Data,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get signature');
      }

      const { signature, winner: winnerAddress } = await response.json();

      setStatus('settling');

      // Call contract to settle
      const result = await settleDuel(duelId, winnerAddress as `0x${string}`, signature as `0x${string}`);

      setPayout(result.payout);
      setTxHash(result.hash);
      setStatus('settled');

      // Clean up duel results from database
      await supabase
        .from('duel_results')
        .delete()
        .eq('duel_id', duelId.toString());

    } catch (err: unknown) {
      console.error('Duel settlement failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to settle duel');
      setStatus('error');
    }
  };

  const totalPot = stakeAmount * 2n;
  const isWinner = winner === 'you';

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`}</style>
      <div style={gameOverStyles.container}>
        <h1 style={gameOverStyles.title}>
          {status === 'submitting'
            ? '📤 Submitting...'
            : waitingForOpponent
            ? '⏳ Waiting for Opponent...'
            : status === 'settled'
            ? isWinner
              ? '🏆 You Win!'
              : '💀 You Lose!'
            : 'Settling Duel...'}
        </h1>

        {/* Score Comparison */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              padding: '16px',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '8px',
              border: isWinner ? '2px solid #22c55e' : '2px solid transparent',
            }}
          >
            <h3 style={{ color: '#22c55e', fontSize: '12px', marginBottom: '8px' }}>You</h3>
            <p style={{ ...gameOverStyles.statText, fontSize: '14px' }}>{score}</p>
            <p style={{ ...gameOverStyles.statText, fontSize: '10px', color: '#888' }}>{wpm} WPM</p>
            <p style={{ ...gameOverStyles.statText, fontSize: '10px', color: '#666' }}>Misses: {missCount}</p>
          </div>
          <div
            style={{
              padding: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              border: !isWinner && winner ? '2px solid #ef4444' : '2px solid transparent',
            }}
          >
            <h3 style={{ color: '#ef4444', fontSize: '12px', marginBottom: '8px' }}>Opponent</h3>
            {waitingForOpponent ? (
              <p style={{ ...gameOverStyles.statText, fontSize: '10px', color: '#888' }}>Waiting...</p>
            ) : (
              <>
                <p style={{ ...gameOverStyles.statText, fontSize: '14px' }}>{opponentScore}</p>
                <p style={{ ...gameOverStyles.statText, fontSize: '10px', color: '#888' }}>{opponentWpm} WPM</p>
                <p style={{ ...gameOverStyles.statText, fontSize: '10px', color: '#666' }}>Misses: {opponentMisses}</p>
              </>
            )}
          </div>
        </div>

        {/* Pot Info */}
        <div
          style={{
            padding: '12px',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          <p style={{ ...gameOverStyles.statText, fontSize: '12px', color: '#888' }}>
            Total Pot: {formatUSDC(totalPot)} USDC
          </p>
          <p style={{ ...gameOverStyles.statText, fontSize: '10px', color: '#666' }}>(10% platform fee on winnings)</p>
        </div>

        {/* Settlement Status */}
        {status === 'submitting' && (
          <p style={{ color: '#8B5CF6', fontSize: '12px', marginBottom: '16px' }}>
            Submitting your results...
          </p>
        )}

        {status === 'waiting' && waitingForOpponent && (
          <p style={{ color: '#8B5CF6', fontSize: '12px', marginBottom: '16px' }}>
            Waiting for opponent to finish...
          </p>
        )}

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
                color: isWinner ? '#22c55e' : '#ef4444',
                fontSize: '16px',
                marginBottom: '16px',
                fontWeight: 'bold',
              }}
            >
              {isWinner ? `You won ${formatUSDC(payout || 0n)} USDC!` : 'Better luck next time!'}
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
              New Duel
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

export default DuelGameOver;
