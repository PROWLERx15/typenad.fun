'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { usePrivyWallet } from '../hooks/usePrivyWallet';
import { useAuthSync } from '../hooks/useAuthSync';
import { useGoldBalance } from '../hooks/useGoldBalance';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import GameCanvas from './Game/GameCanvas';
import SoundManager from './Game/SoundManager';
import GameOver from './Game/GameOver';
import StartScreen from './UI/StartScreen';
import OnboardingScreen from './UI/OnboardingScreen';
import PVPModeScreen from './UI/PVPModeScreen';
import SoloModeScreen from './UI/SoloModeScreen';
import MultiplayerModeScreen from './UI/MultiplayerModeScreen';
import LeaderboardScreen from './UI/LeaderboardScreen';
import CryptScreen from './UI/CryptScreen';
import ShopScreen from './UI/ShopScreen';
import SettingsScreen from './UI/SettingsScreen';
import MigrationPrompt from './UI/MigrationPrompt';
import { BACKGROUND_STYLES } from '../styles/theme';
import { styles } from './GameStateManager.styles';
import { recordGameEnd, consumeEquippedPowerups, getEquippedPowerups } from '../constants/gameStats';
import { needsMigration } from '../utils/dataMigration';
import { ensureUserExists } from '../utils/supabaseHelpers';

const GameStateManager: React.FC = () => {
    const isOnline = useOnlineStatus();
    const { user } = usePrivy();
    const { address, isConnected, walletError, clearWalletError, logout } = usePrivyWallet();
    const { syncing, synced, error: syncError } = useAuthSync();
    const { gold, updateGold, addGold } = useGoldBalance();

    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver' | 'pvp' | 'solo' | 'multiplayer' | 'leaderboard' | 'shop' | 'crypt' | 'settings'>('start');
    const [showOnboardingOverlay, setShowOnboardingOverlay] = useState(false);
    const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);
    const [score, setScore] = useState(0);
    const [goldEarned, setGoldEarned] = useState(0);
    const [screenEffect, setScreenEffect] = useState(false);
    const [gameId, setGameId] = useState<string>(() =>
        typeof window !== 'undefined' ? globalThis.crypto.randomUUID() : ''
    );
    const [bestWpm, setBestWpm] = useState<number>(0);
    const [gameMode, setGameMode] = useState<'story' | 'timeAttack' | 'pvp'>('story');

    const [incomingMessage, setIncomingMessage] = useState<string>('');
    const [incomingMessageType, setIncomingMessageType] = useState<number | null>(null);
    const [isPVPGame, setIsPVPGame] = useState<boolean>(false);
    const [friendChainId, setFriendChainId] = useState<string>('');
    const [friendScore, setFriendScore] = useState<number | null>(null);
    const [isRematch, setIsRematch] = useState<boolean>(false);
    const matchRecordedRef = useRef<boolean>(false);
    const [selectedPowerups, setSelectedPowerups] = useState<string[]>([]);

    // Get high score from localStorage
    const highScore = typeof window !== 'undefined'
        ? parseInt(localStorage.getItem('personal_best_score') || '0')
        : 0;

    const _startGame = async (mode: 'story' | 'timeAttack' | 'pvp', friendId?: string) => {
        console.log('🎮 _startGame called with mode:', mode);
        matchRecordedRef.current = false;
        setFriendScore(null);
        setGameMode(mode);
        setIsPVPGame(mode === 'pvp');
        setFriendChainId(friendId || '');

        // Get equipped powerups and consume them
        const equipped = getEquippedPowerups();
        if (equipped.length > 0) {
            const consumed = consumeEquippedPowerups();
            console.log('🎯 Consumed powerups:', consumed);
            setSelectedPowerups(consumed);

            // Sync consumption to database
            if (address) {
                try {
                    const { supabase } = await import('../lib/supabaseClient');
                    const { syncPowerupConsumption } = await import('../utils/supabaseHelpers');
                    await syncPowerupConsumption(supabase, address, consumed);
                } catch (error) {
                    console.error('Failed to sync powerup consumption:', error);
                }
            }
        } else {
            setSelectedPowerups([]);
        }

        setGameState('playing');
        setScore(0);
        setBestWpm(0);
        setGoldEarned(0);
    };

    const handleStart = () => _startGame('story');
    const handleTimeAttack = () => _startGame('timeAttack');
    const handleStory = () => _startGame('story');
    const handleStartPVP = (friendId: string) => _startGame('pvp', friendId);

    // Track kills for game stats
    const killsRef = useRef<number>(0);
    const wordsTypedRef = useRef<number>(0);
    const waveRef = useRef<number>(1);

    const handleGameOver = async () => {
        setGameState('gameOver');

        // Record game stats with wallet address for database sync
        await recordGameEnd(
            gameMode,
            score,
            bestWpm,
            waveRef.current,
            killsRef.current,
            goldEarned,
            wordsTypedRef.current,
            selectedPowerups,
            isPVPGame ? (friendScore !== null && score > friendScore) : undefined,
            address // Pass wallet address for database sync
        );

        // Reset refs for next game
        killsRef.current = 0;
        wordsTypedRef.current = 0;
        waveRef.current = 1;
        setSelectedPowerups([]);

        // Save to Supabase (individual score record)
        if (address) {
            saveScoreToSupabase(address, score, waveRef.current, bestWpm, gameMode, killsRef.current);
        }

        // Save scores to localStorage
        const savedHighScore = parseInt(localStorage.getItem('personal_best_score') || '0');
        const savedBestWpm = parseInt(localStorage.getItem('personal_best_wpm') || '0');

        if (score > savedHighScore) {
            localStorage.setItem('personal_best_score', score.toString());
        }
        if (bestWpm > savedBestWpm) {
            localStorage.setItem('personal_best_wpm', bestWpm.toString());
        }
    };

    const saveScoreToSupabase = async (walletAddress: string, score: number, wave: number, wpm: number, mode: string, kills: number) => {
        try {
            const { supabase } = await import('../lib/supabaseClient');

            // Get user data from Privy
            const email = (user?.email?.address || user?.google?.email) || undefined;
            const username = user?.google?.name || undefined;
            const googleId = user?.google?.subject || undefined;

            // 1. Ensure user exists with Privy data
            const userId = await ensureUserExists(supabase, walletAddress, {
                email,
                username,
                googleId
            });

            // 2. Insert score
            if (userId) {
                const { error: scoreError } = await (supabase
                    .from('game_scores') as any)
                    .insert({
                        user_id: userId,
                        score,
                        wave_reached: wave,
                        wpm,
                        game_mode: mode,
                        kills
                    });

                if (scoreError) console.error('Error saving score:', scoreError);
            }
        } catch (err) {
            console.error('Failed to save score to Supabase:', err);
        }
    };

    const handleRestart = () => {
        const newGameId = globalThis.crypto.randomUUID();
        setGameId(newGameId);
        setScore(0);
        setFriendScore(null);
        setBestWpm(0);
        setSelectedPowerups([]);
        setGameState('start');
    };

    const handleReturnToStart = () => {
        const newGameId = globalThis.crypto.randomUUID();
        setGameId(newGameId);
        setScore(0);
        setFriendScore(null);
        setBestWpm(0);
        setSelectedPowerups([]);
        setGameState('start');
    };

    const handlePVPRematch = () => {
        setIsRematch(true);
        setGameState('pvp');
        setScore(0);
        setBestWpm(0);
        setFriendScore(null);
    };

    const triggerScreenEffect = () => {
        setScreenEffect(true);
        setTimeout(() => setScreenEffect(false), 200);
    };

    const handleGoldEarned = async (amount: number) => {
        setGoldEarned((prev) => prev + amount);
        await addGold(amount);
    };

    const handlePVPMode = () => {
        setIsRematch(false);
        setGameState('pvp');
    };

    const handleSolo = () => setGameState('solo');
    const handleMultiplayer = () => setGameState('multiplayer');
    const handleVersusMode = () => {
        setIsRematch(false);
        setGameState('pvp');
    };
    const handleLeaderboard = () => setGameState('leaderboard');
    const handleShop = () => setGameState('shop');
    const handleCrypt = () => setGameState('crypt');
    const handleSettings = () => setGameState('settings');

    const handleOnboardingStart = () => {
        localStorage.setItem('seenOnboarding', 'true');
        setShowOnboardingOverlay(false);
        handleStory();
    };

    const handleHowTo = () => {
        setShowOnboardingOverlay(true);
    };

    // Check for migration on wallet connection
    useEffect(() => {
        if (address && needsMigration()) {
            setShowMigrationPrompt(true);
        }
    }, [address]);

    // Status based on wallet connection
    const statusTextToDisplay = isConnected ? 'Solo Game' : 'Connect Wallet to Play';

    // Show loading while syncing auth
    if (isConnected && syncing) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: '#0a0a0a',
                color: '#fff',
                fontFamily: '"Press Start 2P", monospace',
            }}>
                <div style={{
                    fontSize: '16px',
                    marginBottom: '20px',
                    color: '#8B5CF6'
                }}>
                    Syncing Your Account...
                </div>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #333',
                    borderTop: '4px solid #8B5CF6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // Show error if sync failed
    if (syncError) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: '#0a0a0a',
                color: '#fff',
                fontFamily: '"Press Start 2P", monospace',
                padding: '20px',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '14px',
                    marginBottom: '20px',
                    color: '#FF4444'
                }}>
                    ⚠️ Sync Failed
                </div>
                <div style={{
                    fontSize: '10px',
                    marginBottom: '30px',
                    color: '#999',
                    maxWidth: '400px'
                }}>
                    {syncError}
                </div>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '12px 24px',
                        fontSize: '12px',
                        backgroundColor: '#8B5CF6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontFamily: '"Press Start 2P", monospace',
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <>
            {showMigrationPrompt && (
                <MigrationPrompt
                    onComplete={() => {
                        setShowMigrationPrompt(false);
                        // Gold will be automatically refreshed by useGoldBalance hook
                    }}
                />
            )}
            <SoundManager gameState={gameState} />
            <div style={{
                ...styles.gameContainer(screenEffect),
                ...(gameState === 'start' ? BACKGROUND_STYLES.startScreenBackground : {})
            }}>
                {screenEffect && (
                    <div style={styles.screenEffectOverlay} />
                )}
                <style>
                    {`
                @keyframes shake {
                    0% { transform: translate(0, 0); }
                    25% { transform: translate(-5px, 5px); }
                    50% { transform: translate(5px, -5px); }
                    75% { transform: translate(-5px, -5px); }
                    100% { transform: translate(0, 0); }
                }
                `}
                </style>
            </div>
            {showOnboardingOverlay && (
                <div style={styles.fullScreenOverlay()}>
                    <button onClick={() => {
                        localStorage.setItem('seenOnboarding', 'true');
                        setShowOnboardingOverlay(false);
                    }} style={styles.closeButton}>Close</button>
                    <OnboardingScreen
                        onStart={handleOnboardingStart}
                        onClose={() => {
                            localStorage.setItem('seenOnboarding', 'true');
                            setShowOnboardingOverlay(false);
                        }}
                        disabled={!isConnected}
                    />
                </div>
            )}
            {/* Offline Banner */}
            {!isOnline && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: '#FF4444',
                    color: 'white',
                    textAlign: 'center',
                    padding: '8px',
                    fontSize: '12px',
                    zIndex: 9999,
                    fontFamily: '"Press Start 2P", monospace',
                }}>
                    ⚠️ OFFLINE MODE - SYNC DISABLED
                </div>
            )}

            {/* Render current screen via lookup */}
            {(() => {
                const screens = {
                    start: (
                        <>
                            <div style={styles.startScreenContainer()}>
                                <StartScreen
                                    onStart={handleStart}
                                    onTimeAttack={handleTimeAttack}
                                    onStory={handleStory}
                                    onHowTo={handleHowTo}
                                    onSolo={handleSolo}
                                    onMultiplayer={handleMultiplayer}
                                    onLeaderboard={handleLeaderboard}
                                    onShop={handleShop}
                                    onCrypt={handleCrypt}
                                    onSettings={handleSettings}
                                    disabled={!isConnected}
                                    statusText={statusTextToDisplay}
                                    chainId={address || ''}
                                    incomingMessage={incomingMessage}
                                    selectedPowerups={selectedPowerups}
                                    onPowerupsChange={setSelectedPowerups}
                                />
                                <div style={styles.lineaBranding}>
                                    <div style={{
                                        fontSize: '11px',
                                        color: 'rgba(255,255,255,0.5)',
                                        fontFamily: "'Courier New', monospace",
                                        marginBottom: '8px',
                                        letterSpacing: '0.5px',
                                    }}>
                                        v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
                                    </div>
                                    <div style={{
                                        fontSize: '10px',
                                        color: 'rgba(255,255,255,0.4)',
                                        fontFamily: "'Courier New', monospace",
                                        marginBottom: '4px',
                                    }}>
                                        Powered by Monad
                                    </div>
                                </div>
                            </div>
                        </>
                    ),
                    playing: (
                        <GameCanvas
                            onGameOver={handleGameOver}
                            onScoreUpdate={async (points: number) => {
                                setScore((prev) => prev + points);
                            }}
                            onEnemyReachBottom={triggerScreenEffect}
                            onWpmUpdate={(wpm) => setBestWpm(prev => Math.max(prev, wpm))}
                            onReturnToStart={handleReturnToStart}
                            onWaveComplete={async (waveNumber: number) => {
                                // Save progress locally
                                const savedHighScore = parseInt(localStorage.getItem('personal_best_score') || '0');
                                const savedBestWpm = parseInt(localStorage.getItem('personal_best_wpm') || '0');

                                if (score > savedHighScore) {
                                    localStorage.setItem('personal_best_score', score.toString());
                                }
                                if (bestWpm > savedBestWpm) {
                                    localStorage.setItem('personal_best_wpm', bestWpm.toString());
                                }
                            }}
                            onQuestProgress={async (kills: number, batKills: number) => {
                                console.log('Quest progress:', { kills, batKills });
                            }}
                            screenEffect={screenEffect}
                            pvpMode={isPVPGame}
                            gameMode={gameMode}
                            friendChainId={friendChainId}
                            remoteWord={incomingMessage}
                            remoteType={incomingMessageType}
                            highScore={highScore}
                            onGoldEarned={handleGoldEarned}
                            goldEarned={goldEarned}
                            selectedPowerups={selectedPowerups}
                            onPowerupsChange={setSelectedPowerups}
                        />
                    ),
                    gameOver: isPVPGame ? (
                        <div style={styles.pvpGameOverContainer}>
                            {friendScore === null ? (
                                <>
                                    <h1 style={styles.gameOverTitle}>Game Over</h1>
                                    <p style={styles.gameOverScore}>Your Score: {score}</p>
                                    <p style={styles.gameOverWaiting}>Waiting for opponent...</p>
                                </>
                            ) : (
                                <>
                                    <h1 style={styles.gameOverTitle}>
                                        {friendScore > score ? 'You Lose!' : 'You Win!'}
                                    </h1>
                                    <p style={styles.gameOverScore}>Your Score: {score}</p>
                                </>
                            )}
                            <button onClick={handlePVPRematch} style={styles.rematchButton}>
                                Rematch
                            </button>
                            <button onClick={() => setGameState('start')} style={styles.backButton}>
                                Back to Home
                            </button>
                        </div>
                    ) : (
                        <GameOver score={score} wpm={bestWpm} goldEarned={goldEarned} onRestart={handleRestart} />
                    ),
                    pvp: (
                        <div style={styles.pvpScreenContainer()}>
                            <PVPModeScreen
                                chainId={address || ''}
                                onClose={() => setGameState('multiplayer')}
                                incomingMessage={incomingMessage}
                                incomingType={incomingMessageType ?? -1}
                                onStart={handleStartPVP}
                                lastUsedFriendChainId={isRematch ? friendChainId : ''}
                                onClearMessages={() => {
                                    setIncomingMessage('');
                                    setIncomingMessageType(null);
                                }}
                            />
                        </div>
                    ),
                    solo: (
                        <SoloModeScreen
                            onStory={handleStory}
                            onSurvival={handleTimeAttack}
                            onBack={() => setGameState('start')}
                        />
                    ),
                    multiplayer: (
                        <MultiplayerModeScreen
                            onVersus={handleVersusMode}
                            onBack={() => setGameState('start')}
                        />
                    ),
                    leaderboard: (
                        <LeaderboardScreen
                            onClose={() => setGameState('start')}
                            myChainId={address}
                        />
                    ),
                    shop: (
                        <ShopScreen
                            onClose={() => setGameState('start')}
                            totalGold={gold}
                            onPurchaseSuccess={() => {
                                // Gold will be automatically refreshed by useGoldBalance hook
                            }}
                            chainId={address}
                        />
                    ),
                    crypt: (
                        <CryptScreen
                            onClose={() => setGameState('start')}
                            onGoToShop={() => setGameState('shop')}
                        />
                    ),
                    settings: (
                        <SettingsScreen
                            onClose={() => setGameState('start')}
                            onLogout={() => {
                                logout();
                                setGameState('start');
                            }}
                        />
                    ),
                };
                return screens[gameState];
            })()}
        </>
    );
};

export default GameStateManager;
