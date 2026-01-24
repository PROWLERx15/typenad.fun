'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './PVPModeScreen.module.css';
import { useTypeNadContract } from '../../hooks/useTypeNadContract';
import { useUSDC, formatUSDC, parseUSDC } from '../../hooks/useUSDC';
import { usePrivyWallet } from '../../hooks/usePrivyWallet';

// Preset stake amounts
const STAKE_OPTIONS = [
  { label: '1 USDC', value: 1_000_000n },
  { label: '5 USDC', value: 5_000_000n },
  { label: '10 USDC', value: 10_000_000n },
  { label: '25 USDC', value: 25_000_000n },
];

interface DuelInfo {
  duelId: bigint;
  player1: `0x${string}`;
  player2: `0x${string}`;
  stake: bigint;
  randomSeed: bigint;
  active: boolean;
}

interface PVPModeScreenProps {
  chainId: string;
  onClose: () => void;
  incomingMessage: string;
  incomingType: number;
  onStart: (friendChainId: string) => void;
  onDuelStart: (duelId: bigint, stakeAmount: bigint, seed: bigint, isCreator: boolean) => void;
  lastUsedFriendChainId?: string;
  onClearMessages?: () => void;
}

const PVPModeScreen: React.FC<PVPModeScreenProps> = ({
  chainId,
  onClose,
  incomingMessage,
  incomingType,
  onStart,
  onDuelStart,
  lastUsedFriendChainId,
  onClearMessages,
}) => {
  const { address, isConnected } = usePrivyWallet();
  const {
    createDuel,
    joinDuel,
    getDuel,
    getDuelCounter,
    watchDuelCreated,
    watchDuelJoined,
    isLoading: contractLoading,
    error: contractError,
  } = useTypeNadContract();
  const {
    getBalance,
    ensureApproval,
    isLoading: usdcLoading,
    error: usdcError,
  } = useUSDC();

  const [view, setView] = useState<'lobby' | 'create' | 'join'>('lobby');
  const [selectedStake, setSelectedStake] = useState<bigint>(STAKE_OPTIONS[0].value);
  const [customStake, setCustomStake] = useState('');
  const [useCustomStake, setUseCustomStake] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<bigint>(0n);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [openDuels, setOpenDuels] = useState<DuelInfo[]>([]);
  const [joinDuelId, setJoinDuelId] = useState('');
  const [createdDuelId, setCreatedDuelId] = useState<bigint | null>(null);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);

  // Fetch balance and open duels
  useEffect(() => {
    if (isConnected && address) {
      const fetchData = async () => {
        try {
          const balance = await getBalance();
          setUsdcBalance(balance);
        } catch (err) {
          console.error('Failed to fetch data:', err);
        }
      };
      fetchData();

      // Fetch open duels (simplified - in production, use indexer)
      const fetchOpenDuels = async () => {
        try {
          const counter = await getDuelCounter();
          const duels: DuelInfo[] = [];
          // Check last 10 duels for open ones
          const start = counter > 10n ? counter - 10n : 1n;
          for (let i = start; i <= counter; i++) {
            const duel = await getDuel(i);
            if (duel.active && duel.player2 === '0x0000000000000000000000000000000000000000') {
              duels.push({
                duelId: i,
                ...duel,
              });
            }
          }
          setOpenDuels(duels);
        } catch (err) {
          console.error('Failed to fetch duels:', err);
        }
      };
      fetchOpenDuels();
    }
  }, [isConnected, address, getBalance, getDuel, getDuelCounter]);

  // Watch for new duels
  useEffect(() => {
    if (!isConnected) return;

    const unwatch = watchDuelCreated((event) => {
      // Add to open duels if not already there
      setOpenDuels((prev) => {
        if (prev.some((d) => d.duelId === event.duelId)) return prev;
        return [
          ...prev,
          {
            duelId: event.duelId,
            player1: event.player1,
            player2: '0x0000000000000000000000000000000000000000' as `0x${string}`,
            stake: event.stake,
            randomSeed: 0n,
            active: true,
          },
        ];
      });
    });

    return () => unwatch();
  }, [isConnected, watchDuelCreated]);

  // Watch for opponent joining created duel
  useEffect(() => {
    if (!createdDuelId || !waitingForOpponent) return;

    const unwatch = watchDuelJoined(createdDuelId, async (player2, seed) => {
      setStatus('Opponent joined! Starting duel...');
      setWaitingForOpponent(false);
      onDuelStart(createdDuelId, selectedStake, seed, true);
    });

    return () => unwatch();
  }, [createdDuelId, waitingForOpponent, onDuelStart, selectedStake, watchDuelJoined]);

  const getEffectiveStake = useCallback((): bigint => {
    if (useCustomStake && customStake) {
      return parseUSDC(customStake);
    }
    return selectedStake;
  }, [useCustomStake, customStake, selectedStake]);

  const handleCreateDuel = async () => {
    if (!isConnected) {
      setError('Please connect your wallet');
      return;
    }

    const stakeAmount = getEffectiveStake();
    if (stakeAmount === 0n) {
      setError('Please select a stake amount');
      return;
    }

    if (stakeAmount > usdcBalance) {
      setError('Insufficient USDC balance');
      return;
    }

    setError('');
    setStatus('Checking approval...');

    try {
      await ensureApproval(stakeAmount);
      setStatus('Creating duel...');

      const { duelId } = await createDuel(stakeAmount);
      setCreatedDuelId(duelId);
      setWaitingForOpponent(true);
      setStatus(`Duel #${duelId.toString()} created! Waiting for opponent...`);
    } catch (err: any) {
      console.error('Failed to create duel:', err);
      setError(err.message || 'Failed to create duel');
      setStatus('');
    }
  };

  const handleJoinDuel = async (duelId: bigint, stake: bigint) => {
    if (!isConnected) {
      setError('Please connect your wallet');
      return;
    }

    if (stake > usdcBalance) {
      setError('Insufficient USDC balance');
      return;
    }

    setError('');
    setStatus('Checking approval...');

    try {
      await ensureApproval(stake);
      setStatus('Joining duel...');

      const { seed } = await joinDuel(duelId);
      setStatus('Starting duel...');

      onDuelStart(duelId, stake, seed, false);
    } catch (err: any) {
      console.error('Failed to join duel:', err);
      setError(err.message || 'Failed to join duel');
      setStatus('');
    }
  };

  const handleJoinById = async () => {
    if (!joinDuelId) {
      setError('Please enter a duel ID');
      return;
    }

    try {
      const duelId = BigInt(joinDuelId);
      const duel = await getDuel(duelId);

      if (!duel.active) {
        setError('Duel is not active');
        return;
      }

      if (duel.player2 !== '0x0000000000000000000000000000000000000000') {
        setError('Duel already has an opponent');
        return;
      }

      await handleJoinDuel(duelId, duel.stake);
    } catch (err: any) {
      setError('Invalid duel ID or duel not found');
    }
  };

  const isLoading = contractLoading || usdcLoading;

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        if (view !== 'lobby') {
          setView('lobby');
          setStatus('');
          setError('');
          setWaitingForOpponent(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape, true);
    return () => document.removeEventListener('keydown', handleEscape, true);
  }, [onClose, view]);

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <button onClick={onClose} className={styles.closeButton}>
          Back
        </button>

        <h1 className={styles.title}>⚔️ PVP Duels</h1>

        {!isConnected ? (
          <p className={styles.description}>Connect your wallet to create or join duels!</p>
        ) : view === 'lobby' ? (
          <>
            {/* Balance Display */}
            <p className={styles.description}>
              Balance: <span style={{ color: '#22c55e' }}>{formatUSDC(usdcBalance)} USDC</span>
            </p>

            <div className={styles.buttonGroup}>
              <button
                onClick={() => setView('create')}
                className={styles.button}
                style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
              >
                Create Duel
              </button>
              <button
                onClick={() => setView('join')}
                className={styles.button}
                style={{ backgroundColor: '#22c55e', color: '#fff' }}
              >
                Join Duel
              </button>
            </div>

            {/* Open Duels List */}
            {openDuels.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>Open Duels:</h3>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {openDuels.map((duel) => (
                    <div
                      key={duel.duelId.toString()}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '6px',
                        marginBottom: '8px',
                      }}
                    >
                      <div style={{ fontSize: '11px', color: '#aaa' }}>
                        <div>Duel #{duel.duelId.toString()}</div>
                        <div style={{ color: '#888', fontSize: '10px' }}>
                          {duel.player1.slice(0, 6)}...{duel.player1.slice(-4)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#22c55e', fontSize: '12px' }}>{formatUSDC(duel.stake)} USDC</div>
                        <button
                          onClick={() => handleJoinDuel(duel.duelId, duel.stake)}
                          disabled={isLoading || duel.player1.toLowerCase() === address?.toLowerCase()}
                          style={{
                            marginTop: '4px',
                            padding: '4px 12px',
                            fontSize: '10px',
                            backgroundColor: duel.player1.toLowerCase() === address?.toLowerCase() ? '#555' : '#8B5CF6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: duel.player1.toLowerCase() === address?.toLowerCase() ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          {duel.player1.toLowerCase() === address?.toLowerCase() ? 'Your Duel' : 'Join'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : view === 'create' ? (
          <>
            <h2 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>Create a Duel</h2>

            {waitingForOpponent ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#8B5CF6', fontSize: '14px', marginBottom: '12px' }}>{status}</p>
                <p style={{ color: '#888', fontSize: '11px' }}>
                  Share Duel ID: <span style={{ color: '#fff' }}>#{createdDuelId?.toString()}</span>
                </p>
                <button
                  onClick={() => {
                    setWaitingForOpponent(false);
                    setCreatedDuelId(null);
                    setStatus('');
                    setView('lobby');
                  }}
                  className={styles.button}
                  style={{ marginTop: '20px' }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                {/* Stake Selection */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {STAKE_OPTIONS.map((option) => (
                      <button
                        key={option.label}
                        onClick={() => {
                          setSelectedStake(option.value);
                          setUseCustomStake(false);
                        }}
                        style={{
                          padding: '10px',
                          backgroundColor:
                            !useCustomStake && selectedStake === option.value ? '#8B5CF6' : 'rgba(139, 92, 246, 0.2)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontFamily: 'inherit',
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Stake */}
                <div style={{ marginBottom: '16px' }}>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="Custom USDC amount"
                    value={customStake}
                    onChange={(e) => {
                      setCustomStake(e.target.value);
                      setUseCustomStake(!!e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: 'rgba(139, 92, 246, 0.2)',
                      color: '#fff',
                      border: useCustomStake ? '2px solid #8B5CF6' : '2px solid transparent',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                {status && <p style={{ color: '#8B5CF6', fontSize: '11px', marginBottom: '12px' }}>{status}</p>}
                {error && <p style={{ color: '#ef4444', fontSize: '11px', marginBottom: '12px' }}>{error}</p>}

                <div className={styles.buttonGroup}>
                  <button onClick={() => setView('lobby')} className={styles.button}>
                    Back
                  </button>
                  <button
                    onClick={handleCreateDuel}
                    disabled={isLoading || getEffectiveStake() === 0n || getEffectiveStake() > usdcBalance}
                    className={styles.button}
                    style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
                  >
                    {isLoading ? 'Processing...' : 'Create Duel'}
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <h2 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>Join by Duel ID</h2>

            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Enter Duel ID"
                value={joinDuelId}
                onChange={(e) => setJoinDuelId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  color: '#fff',
                  border: '2px solid rgba(139, 92, 246, 0.5)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {status && <p style={{ color: '#8B5CF6', fontSize: '11px', marginBottom: '12px' }}>{status}</p>}
            {error && <p style={{ color: '#ef4444', fontSize: '11px', marginBottom: '12px' }}>{error}</p>}

            <div className={styles.buttonGroup}>
              <button onClick={() => setView('lobby')} className={styles.button}>
                Back
              </button>
              <button
                onClick={handleJoinById}
                disabled={isLoading || !joinDuelId}
                className={styles.button}
                style={{ backgroundColor: '#22c55e', color: '#fff' }}
              >
                {isLoading ? 'Processing...' : 'Join Duel'}
              </button>
            </div>
          </>
        )}

        <p className={styles.opponentNote} style={{ marginTop: '20px' }}>
          Winner takes 90% of the pot (10% platform fee)
        </p>
      </div>
    </div>
  );
};

export default PVPModeScreen;
