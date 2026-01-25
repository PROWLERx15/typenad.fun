'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './SoloModeScreen.module.css';
import { useTypeNadContract } from '../../hooks/useTypeNadContract';
import { useSessionRecovery } from '../../hooks/useSessionRecovery';
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
        isLoading: contractLoading,
        error: contractError,
    } = useTypeNadContract();
    const {
        hasActiveSession,
        activeSessionId,
        sessionDetails,
        storedSession,
        isChecking,
        isCancelling,
        handleCancelSession,
        saveSession,
        clearSession,
        formatRefundInfo,
        getEstimatedRefund,
    } = useSessionRecovery();
    const {
        getBalance,
        ensureApproval,
        needsApproval,
        isLoading: usdcLoading,
        error: usdcError,
    } = useUSDC();

    const [showStakedModal, setShowStakedModal] = useState(false);
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [selectedStake, setSelectedStake] = useState<bigint>(STAKE_OPTIONS[0].value);
    const [customStake, setCustomStake] = useState('');
    const [useCustomStake, setUseCustomStake] = useState(false);
    const [usdcBalance, setUsdcBalance] = useState<bigint>(0n);
    const [approvalNeeded, setApprovalNeeded] = useState(false);
    const [status, setStatus] = useState<string>('');
    const [error, setError] = useState<string>('');

    // Show recovery modal if active session found
    useEffect(() => {
        if (hasActiveSession && showStakedModal && !showRecoveryModal) {
            setShowRecoveryModal(true);
        }
    }, [hasActiveSession, showStakedModal, showRecoveryModal]);

    // Fetch USDC balance
    useEffect(() => {
        if (isConnected && address && showStakedModal && !showRecoveryModal) {
            const fetchData = async () => {
                try {
                    console.log('=== Fetching staking modal data ===');
                    const balance = await getBalance();
                    setUsdcBalance(balance);

                    const stakeAmount = useCustomStake
                        ? parseUSDC(customStake || '0')
                        : selectedStake;
                    const needs = await needsApproval(stakeAmount);
                    setApprovalNeeded(needs);
                } catch (err) {
                    console.error('Failed to fetch data:', err);
                    setError('Failed to fetch wallet data. Please check your connection.');
                }
            };
            fetchData();
        }
    }, [isConnected, address, showStakedModal, showRecoveryModal, getBalance, needsApproval, selectedStake, customStake, useCustomStake]);

    // Update approval needed when stake changes
    useEffect(() => {
        if (showStakedModal && isConnected && !showRecoveryModal) {
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
    }, [selectedStake, customStake, useCustomStake, showStakedModal, showRecoveryModal, isConnected, needsApproval]);

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
            setStatus('Checking USDC approval...');
            const { approved, hash: approvalHash } = await ensureApproval(stakeAmount);
            if (approvalHash) {
                setStatus('Approval confirmed! Starting game...');
            } else if (approved) {
                setStatus('Starting game...');
            }

            // Start the game on-chain
            setStatus('Confirm transaction in wallet...');
            const { sequenceNumber, seed } = await startGame(stakeAmount);
            setStatus('Game started! Loading...');

            // Save session for recovery
            saveSession(sequenceNumber, stakeAmount, seed);

            // Trigger the staked game with seed from transaction
            setShowStakedModal(false);
            onStakedGame(sequenceNumber, stakeAmount, seed);
        } catch (err: any) {
            console.error('Failed to start staked game:', err);
            
            // Provide user-friendly error messages
            let errorMessage = 'Failed to start game';
            
            if (err.message?.includes('insufficient funds')) {
                errorMessage = 'Insufficient MON for gas fees. Please add MON to your wallet.';
            } else if (err.message?.includes('user rejected')) {
                errorMessage = 'Transaction rejected. Please try again.';
            } else if (err.message?.includes('allowance')) {
                errorMessage = 'USDC approval failed. Please try again.';
            } else if (err.message?.includes('balance')) {
                errorMessage = 'Insufficient USDC balance. Please add USDC to your wallet.';
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
            setStatus('');
        }
    };

    const handleCancelAndRefund = async () => {
        setStatus('Cancelling game...');
        setError('');

        const result = await handleCancelSession();

        if (result.success) {
            setStatus(`Refund of ${formatUSDC(result.refund)} USDC received!`);
            setShowRecoveryModal(false);
            // Now they can start a new game
        } else {
            setError(result.error || 'Failed to cancel session');
            setStatus('');
        }
    };

    const handleResumeGame = () => {
        if (activeSessionId && sessionDetails && storedSession) {
            // Resume with stored session data
            const sequenceNumber = BigInt(storedSession.sequenceNumber);
            const stake = BigInt(storedSession.stake);
            const seed = BigInt(storedSession.seed);

            setShowRecoveryModal(false);
            setShowStakedModal(false);
            onStakedGame(sequenceNumber, stake, seed);
        }
    };

    const isLoading = contractLoading || usdcLoading || isChecking || isCancelling;
    const estimatedRefund = getEstimatedRefund();

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
                            Start
                        </button>
                    </div>

                    <div className={`${styles.modeCard} ${styles.stakedCard}`}>
                        <h2 className={styles.modeTitle}>
                            Staked Mode
                        </h2>
                        <p className={styles.modeDescription}>
                            Stake USDC to play.
                            <br />
                            Win more, lose less!
                        </p>
                        <button
                            onClick={() => setShowStakedModal(true)}
                            className={styles.modeButton}
                            disabled={!isConnected}
                        >
                            {isConnected ? 'Start' : 'Connect Wallet'}
                        </button>
                    </div>

                    <div className={styles.modeCard}>
                        <h2 className={styles.modeTitle}>Survival</h2>
                        <p className={styles.modeDescription}>
                            Endless enemy waves.<br />
                            How long can you last?
                        </p>
                        <button onClick={onSurvival} className={styles.modeButton}>
                            Start
                        </button>
                    </div>
                </div>

                <button onClick={onBack} className={styles.backButton}>
                    Back
                </button>
            </div>

            {/* Session Recovery Modal */}
            {showRecoveryModal && hasActiveSession && (
                <div className={styles.modalOverlay} onClick={() => { }}>
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: '#1a1a2e',
                            border: '2px solid #ef4444',
                            borderRadius: '12px',
                            padding: '24px',
                            maxWidth: '400px',
                            width: '90%',
                        }}
                    >
                        <h2 style={{ color: '#ef4444', marginBottom: '16px', fontSize: '16px' }}>
                            ⚠️ Active Session Found
                        </h2>

                        <p style={{ color: '#ddd', fontSize: '12px', marginBottom: '16px', lineHeight: '1.6' }}>
                            You have an active staked game session that was not completed.
                            You must either resume or cancel it before starting a new game.
                        </p>

                        {/* Session Details */}
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#0f0f1a',
                            borderRadius: '8px',
                            marginBottom: '16px',
                        }}>
                            <div style={{ color: '#888', fontSize: '10px', marginBottom: '8px' }}>
                                Session Details:
                            </div>
                            <div style={{ color: '#fff', fontSize: '12px' }}>
                                Stake: {sessionDetails ? formatUSDC(sessionDetails.stake) : '...'} USDC
                            </div>
                            <div style={{ color: '#888', fontSize: '10px', marginTop: '4px' }}>
                                Session ID: #{activeSessionId?.toString()}
                            </div>
                        </div>

                        {/* Refund Info */}
                        {estimatedRefund && (
                            <div style={{
                                padding: '12px',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                            }}>
                                <div style={{ color: '#ef4444', fontSize: '10px', marginBottom: '4px' }}>
                                    If you cancel:
                                </div>
                                <div style={{ color: '#fff', fontSize: '12px' }}>
                                    Refund: {formatUSDC(estimatedRefund.refund)} USDC
                                </div>
                                <div style={{ color: '#888', fontSize: '10px' }}>
                                    Fee: {formatUSDC(estimatedRefund.fee)} USDC (5%)
                                </div>
                            </div>
                        )}

                        {/* Status/Error */}
                        {status && (
                            <div style={{ marginBottom: '12px', color: '#8B5CF6', fontSize: '11px', textAlign: 'center' }}>
                                {status}
                            </div>
                        )}
                        {error && (
                            <div style={{ marginBottom: '12px', color: '#ef4444', fontSize: '11px', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={handleCancelAndRefund}
                                disabled={isLoading}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    backgroundColor: isLoading ? '#555' : '#ef4444',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    fontSize: '11px',
                                    fontFamily: 'inherit',
                                }}
                            >
                                {isCancelling ? 'Cancelling...' : 'Cancel & Refund'}
                            </button>
                            {storedSession && (
                                <button
                                    onClick={handleResumeGame}
                                    disabled={isLoading}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        backgroundColor: isLoading ? '#555' : '#22c55e',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        fontSize: '11px',
                                        fontFamily: 'inherit',
                                    }}
                                >
                                    Resume Game
                                </button>
                            )}
                        </div>

                        {/* Back button */}
                        <button
                            onClick={() => {
                                setShowRecoveryModal(false);
                                setShowStakedModal(false);
                            }}
                            style={{
                                width: '100%',
                                marginTop: '12px',
                                padding: '10px',
                                backgroundColor: 'transparent',
                                color: '#888',
                                border: '1px solid #333',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                fontFamily: 'inherit',
                            }}
                        >
                            Back
                        </button>
                    </div>
                </div>
            )}

            {/* Staked Game Modal (only show if no recovery needed) */}
            {showStakedModal && !showRecoveryModal && (
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
                            Staked Game
                        </h2>

                        {isChecking ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                Checking for active sessions...
                            </div>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SoloModeScreen;
