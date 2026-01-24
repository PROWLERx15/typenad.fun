'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './SoloModeScreen.module.css';
import { useTypeNadContract } from '../../hooks/useTypeNadContract';
import { useUSDC, formatUSDC, parseUSDC } from '../../hooks/useUSDC';
import { usePrivyWallet } from '../../hooks/usePrivyWallet';

// Preset stake amounts in USDC (6 decimals)
const STAKE_OPTIONS = [
  { label: '1 USDC', value: 1_000_000n },
  { label: '5 USDC', value: 5_000_000n },
  { label: '10 USDC', value: 10_000_000n },
  { label: '25 USDC', value: 25_000_000n },
];

interface SoloModeScreenProps {
  onStory: () => void;
  onSurvival: () => void;
  onStakedGame: (sequenceNumber: bigint, stakeAmount: bigint, seed: bigint) => void;
  onBack: () => void;
}

const SoloModeScreen: React.FC<SoloModeScreenProps> = ({
  onStory,
  onSurvival,
  onStakedGame,
  onBack,
}) => {
  const { address, isConnected } = usePrivyWallet();
  const {
    startGame,
    getEntropyFee,
    pollForGameSeed,
    isLoading: contractLoading,
    error: contractError,
  } = useTypeNadContract();
  const {
    getBalance,
    ensureApproval,
    needsApproval,
    isLoading: usdcLoading,
    error: usdcError,
  } = useUSDC();

  const [showStakedModal, setShowStakedModal] = useState(false);
  const [selectedStake, setSelectedStake] = useState<bigint>(STAKE_OPTIONS[0].value);
  const [customStake, setCustomStake] = useState('');
  const [useCustomStake, setUseCustomStake] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<bigint>(0n);
  const [entropyFee, setEntropyFee] = useState<bigint>(0n);
  const [approvalNeeded, setApprovalNeeded] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Fetch USDC balance and entropy fee
  useEffect(() => {
    if (isConnected && address && showStakedModal) {
      const fetchData = async () => {
        try {
          const [balance, fee] = await Promise.all([
            getBalance(),
            getEntropyFee(),
          ]);
          setUsdcBalance(balance);
          setEntropyFee(fee);

          const stakeAmount = useCustomStake
            ? parseUSDC(customStake || '0')
            : selectedStake;
          const needs = await needsApproval(stakeAmount);
          setApprovalNeeded(needs);
        } catch (err) {
          console.error('Failed to fetch data:', err);
        }
      };
      fetchData();
    }
  }, [isConnected, address, showStakedModal, getBalance, getEntropyFee, needsApproval, selectedStake, customStake, useCustomStake]);

  // Update approval needed when stake changes
  useEffect(() => {
    if (showStakedModal && isConnected) {
      const checkApproval = async () => {
        const stakeAmount = useCustomStake
          ? parseUSDC(customStake || '0')
          : selectedStake;
        if (stakeAmount > 0n) {
          const needs = await needsApproval(stakeAmount);
          setApprovalNeeded(needs);
        }
      };
      checkApproval();
    }
  }, [selectedStake, customStake, useCustomStake, showStakedModal, isConnected, needsApproval]);

  const getEffectiveStake = useCallback((): bigint => {
    if (useCustomStake && customStake) {
      return parseUSDC(customStake);
    }
    return selectedStake;
  }, [useCustomStake, customStake, selectedStake]);

  const handleStartStakedGame = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
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
      // Ensure USDC is approved
      const { approved, hash: approvalHash } = await ensureApproval(stakeAmount);
      if (approvalHash) {
        setStatus('Approval confirmed! Starting game...');
      } else if (approved) {
        setStatus('Starting game...');
      }

      // Start the game on-chain
      setStatus('Confirm transaction in wallet...');
      const { hash, sequenceNumber } = await startGame(stakeAmount);
      setStatus('Transaction sent! Waiting for VRF seed...');

      // Poll for the seed
      const seed = await pollForGameSeed(sequenceNumber, 120); // 2 min timeout
      setStatus('Seed received! Starting game...');

      // Trigger the staked game
      setShowStakedModal(false);
      onStakedGame(sequenceNumber, stakeAmount, seed);
    } catch (err: any) {
      console.error('Failed to start staked game:', err);
      setError(err.message || 'Failed to start game');
      setStatus('');
    }
  };

  const isLoading = contractLoading || usdcLoading;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <h1 className={styles.title}>Single Player Mode</h1>
        <p className={styles.description}>Choose your adventure</p>

        <div className={styles.modesContainer}>
          <div className={styles.modeCard}>
            <h2 className={styles.modeTitle}>Story</h2>
            <p className={styles.modeDescription}>
              Progress through waves.
              <br />
              Unlock achievements!
            </p>
            <button onClick={onStory} className={styles.modeButton}>
              Start Story
            </button>
          </div>

          <div className={styles.modeCard}>
            <h2 className={styles.modeTitle}>Survival</h2>
            <p className={styles.modeDescription}>
              Endless zombie waves.
              <br />
              How long can you last?
            </p>
            <button onClick={onSurvival} className={styles.modeButton}>
              Start Survival
            </button>
          </div>

          <div className={styles.modeCard} style={{ borderColor: '#8B5CF6' }}>
            <h2 className={styles.modeTitle} style={{ color: '#8B5CF6' }}>
              💰 Staked Mode
            </h2>
            <p className={styles.modeDescription}>
              Stake USDC to play.
              <br />
              Win more, lose less!
            </p>
            <button
              onClick={() => setShowStakedModal(true)}
              className={styles.modeButton}
              style={{ backgroundColor: '#8B5CF6' }}
              disabled={!isConnected}
            >
              {isConnected ? 'Play for USDC' : 'Connect Wallet'}
            </button>
          </div>
        </div>

        <button onClick={onBack} className={styles.backButton}>
          Back
        </button>
      </div>

      {/* Staked Game Modal */}
      {showStakedModal && (
        <div className={styles.modalOverlay} onClick={() => setShowStakedModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#1a1a2e',
              border: '2px solid #8B5CF6',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
            }}
          >
            <h2 style={{ color: '#8B5CF6', marginBottom: '16px', fontSize: '18px' }}>
              💰 Staked Game
            </h2>

            {/* Balance Display */}
            <div style={{ marginBottom: '16px', color: '#aaa', fontSize: '12px' }}>
              Your Balance: <span style={{ color: '#22c55e' }}>{formatUSDC(usdcBalance)} USDC</span>
            </div>

            {/* Stake Selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#fff', fontSize: '12px', marginBottom: '8px', display: 'block' }}>
                Select Stake Amount:
              </label>
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
                      backgroundColor: !useCustomStake && selectedStake === option.value ? '#8B5CF6' : '#2a2a4e',
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

            {/* Custom Stake Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#fff', fontSize: '12px', marginBottom: '8px', display: 'block' }}>
                Or enter custom amount:
              </label>
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
                  backgroundColor: '#2a2a4e',
                  color: '#fff',
                  border: useCustomStake ? '2px solid #8B5CF6' : '2px solid transparent',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Fee Display */}
            <div style={{ marginBottom: '16px', color: '#888', fontSize: '10px' }}>
              <div>Entropy Fee: ~{formatUSDC(entropyFee)} MON</div>
              <div style={{ marginTop: '4px', color: '#666' }}>
                (VRF fee for provably fair random seed)
              </div>
            </div>

            {/* Status/Error */}
            {status && (
              <div style={{ marginBottom: '12px', color: '#8B5CF6', fontSize: '11px', textAlign: 'center' }}>
                {status}
              </div>
            )}
            {(error || contractError || usdcError) && (
              <div style={{ marginBottom: '12px', color: '#ef4444', fontSize: '11px', textAlign: 'center' }}>
                {error || contractError?.message || usdcError?.message}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowStakedModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#333',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleStartStakedGame}
                disabled={isLoading || getEffectiveStake() === 0n || getEffectiveStake() > usdcBalance}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: isLoading ? '#555' : '#8B5CF6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                }}
              >
                {isLoading
                  ? 'Processing...'
                  : approvalNeeded
                  ? 'Approve & Start'
                  : 'Start Game'}
              </button>
            </div>

            {/* Game Rules */}
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#0f0f1a',
                borderRadius: '6px',
                fontSize: '10px',
                color: '#888',
              }}
            >
              <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>How it works:</div>
              <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: '1.6' }}>
                <li>Stake USDC to start a provably fair game</li>
                <li>First 10 misses are free</li>
                <li>Each miss after costs 0.1 USDC penalty</li>
                <li>Bonus rewards based on WPM and accuracy</li>
                <li>10% platform fee on winnings</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoloModeScreen;
