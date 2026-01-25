'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { usePrivyWallet } from '../hooks/usePrivyWallet';
import { useAuthSync } from '../hooks/useAuthSync';
import { useGoldBalance } from '../hooks/useGoldBalance';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useAchievementNotifications } from '../hooks/useAchievementNotifications';
import { DebugPanel } from './DebugPanel';
import GameCanvas from './Game/GameCanvas';
import SoundManager from './Game/SoundManager';
import GameOver from './Game/GameOver';
import StakedGameOver from './Game/StakedGameOver';
import DuelGameOver from './Game/DuelGameOver';
import StartScreen from './UI/StartScreen';
import OnboardingScreen from './UI/OnboardingScreen';
import PVPModeScreen from './UI/PVPModeScreen';
import SoloModeScreen from './UI/SoloModeScreen';
import MultiplayerModeScreen from './UI/MultiplayerModeScreen';
import LeaderboardScreen from './UI/LeaderboardScreen';
import CryptScreen from './UI/CryptScreen';
import ShopScreen from './UI/ShopScreen';
import SettingsScreen from './UI/SettingsScreen';
import AchievementsScreen from './UI/AchievementsScreen';
import AchievementNotification from './UI/AchievementNotification';
import MigrationPrompt from './UI/MigrationPrompt';
import { BACKGROUND_STYLES } from '../styles/theme';
import { styles } from './GameStateManager.styles';
import { recordGameEnd, consumeEquippedPowerups, getEquippedPowerups } from '../constants/gameStats';
import { needsMigration } from '../utils/dataMigration';
import { ensureUserExists } from '../utils/supabaseHelpers';

const GameStateManager: React.FC = () => {
    const isOnline = useOnlineStatus();
    const { user, ready: privyReady, authenticated } = usePrivy();
    const { address, isConnected, walletError, clearWalletError, logout } = usePrivyWallet();
    const { syncing, synced, error: syncError } = useAuthSync();
    const { gold, updateGold, addGold } = useGoldBalance();
    const { notifications, addNotification, removeNotification } = useAchievementNotifications();

    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver' | 'pvp' | 'solo' | 'multiplayer' | 'leaderboard' | 'shop' | 'crypt' | 'settings' | 'achievements'>('start');
    const [showOnboardingOverlay, setShowOnboardingOverlay] = useState(false);
    const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);
    const [score, setScore] = useState(0);
    const [goldEarned, setGoldEarned] = useState(0);
    const [screenEffect, setScreenEffect] = useState(false);
    const [gameId, setGameId] = useState<string>(() =>
        typeof window !== 'undefined' ? globalThis.crypto.randomUUID() : ''
    );
    const [bestWpm, setBestWpm] = useState<number>(0);
    const [gameMode, setGameMode] = useState<'story' | 'timeAttack' | 'pvp' | 'staked' | 'duel'>('story');

    const [incomingMessage, setIncomingMessage] = useState<string>('');
    const [incomingMessageType, setIncomingMessageType] = useState<number | null>(null);
    const [isPVPGame, setIsPVPGame] = useState<boolean>(false);
    const [friendChainId, setFriendChainId] = useState<string>('');
    const [friendScore, setFriendScore] = useState<number | null>(null);
    const [isRematch, setIsRematch] = useState<boolean>(false);
    const matchRecordedRef = useRef<boolean>(false);
    const [selectedPowerups, setSelectedPowerups] = useState<string[]>([]);

    // Staked game state
    const [stakedSequenceNumber, setStakedSequenceNumber] = useState<bigint | null>(null);
    const [stakedAmount, setStakedAmount] = useState<bigint>(0n);
    const [stakedSeed, setStakedSeed] = useState<bigint>(0n);
    const [duelId, setDuelId] = useState<bigint | null>(null);
    const [isDuelCreator, setIsDuelCreator] = useState<boolean>(false);
    const [missCount, setMissCount] = useState<number>(0);
    const [typoCount, setTypoCount] = useState<number>(0);
    const [backspaceCount, setBackspaceCount] = useState<number>(0);

    // NEW: Additional game metrics
    const [kills, setKills] = useState<number>(0);
    const [waveReached, setWaveReached] = useState<number>(1);
    const [duration, setDuration] = useState<number>(0);
    const [wordsTyped, setWordsTyped] = useState<number>(0);

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

        // Reset game tracking refs
        gameStartTimeRef.current = Date.now();
        killsRef.current = 0;
        wordsTypedRef.current = 0;
        waveRef.current = 1;
        durationRef.current = 0;

        // Get equipped powerups and consume them
        const equipped = getEquippedPowerups();
        if (equipped.length > 0) {
            const consumed = consumeEquippedPowerups();
            console.log('🎯 Consumed powerups:', consumed);
            setSelectedPowerups(consumed);

            // Sync consumption to database via secure API
            if (address) {
                try {
                    await fetch('/api/shop/consume', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            walletAddress: address,
                            items: consumed
                        })
                    });
                    console.log('✅ Powerup consumption synced via API');
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

    // Handler for starting a staked game from SoloModeScreen
    const handleStakedGame = (sequenceNumber: bigint, stakeAmount: bigint, seed: bigint) => {
        console.log('🎮 Starting staked game:', { sequenceNumber: sequenceNumber.toString(), stakeAmount: stakeAmount.toString(), seed: seed.toString() });
        setStakedSequenceNumber(sequenceNumber);
        setStakedAmount(stakeAmount);
        setStakedSeed(seed);
        setMissCount(0);
        setTypoCount(0);
        setBackspaceCount(0);
        setGameMode('staked');
        setIsPVPGame(false);
        setGameState('playing');
        setScore(0);
        setBestWpm(0);
        setGoldEarned(0);

        // Reset game tracking refs
        gameStartTimeRef.current = Date.now();
        killsRef.current = 0;
        wordsTypedRef.current = 0;
        waveRef.current = 1;
        durationRef.current = 0;
    };

    // Handler for starting a duel from PVPModeScreen
    const handleDuelStart = (duelIdParam: bigint, stakeAmount: bigint, seed: bigint, isCreator: boolean) => {
        console.log('🎮 Starting duel:', { duelId: duelIdParam.toString(), stakeAmount: stakeAmount.toString(), seed: seed.toString(), isCreator });
        setDuelId(duelIdParam);
        setStakedAmount(stakeAmount);
        setStakedSeed(seed);
        setIsDuelCreator(isCreator);
        setMissCount(0);
        setTypoCount(0);
        setBackspaceCount(0);
        setGameMode('duel');
        setIsPVPGame(true);
        setGameState('playing');
        setScore(0);
        setBestWpm(0);
        setGoldEarned(0);

        // Reset game tracking refs
        gameStartTimeRef.current = Date.now();
        killsRef.current = 0;
        wordsTypedRef.current = 0;
        waveRef.current = 1;
        durationRef.current = 0;
    };

    // Track kills for game stats
    const killsRef = useRef<number>(0);
    const wordsTypedRef = useRef<number>(0);
    const waveRef = useRef<number>(1);
    const durationRef = useRef<number>(0);
    const gameStartTimeRef = useRef<number>(Date.now());

    const handleGameOver = async () => {
        // Calculate duration
        durationRef.current = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);

        // Capture final metrics before state change
        setKills(killsRef.current);
        setWordsTyped(wordsTypedRef.current);
        setWaveReached(waveRef.current);
        setDuration(durationRef.current);

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
        durationRef.current = 0;
        setSelectedPowerups([]);

        // Note: Score saving is handled by GameOver/StakedGameOver/DuelGameOver components
        // via /api/score/save endpoint which includes all metrics (kills, duration, etc.)

        // Save scores to localStorage
        const savedHighScore = parseInt(localStorage.getItem('personal_best_score') || '0');
        const savedBestWpm = parseInt(localStorage.getItem('personal_best_wpm') || '0');

        if (score > savedHighScore) {
            localStorage.setItem('personal_best_score', score.toString());
        }
        if (bestWpm > savedBestWpm) {
            localStorage.setItem('personal_best_wpm', bestWpm.toString());
        }

        // Clear session storage on game over for staked games
        if (gameMode === 'staked' || gameMode === 'duel') {
            localStorage.removeItem('typemonad_staked_session');
            localStorage.removeItem('typemonad_duel_session');
        }
    };

    // Warn user before closing tab during staked game
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (gameState === 'playing' && (gameMode === 'staked' || gameMode === 'duel')) {
                e.preventDefault();
                // Modern browsers require returnValue to be set
                e.returnValue = 'You have an active staked game. If you leave, you may lose your stake. Are you sure?';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [gameState, gameMode]);

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
    const handleAchievements = () => setGameState('achievements');

    // Check for new achievements after game over
    const checkAchievements = async () => {
        if (!address) return;

        try {
            const response = await fetch('/api/achievements/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress: address }),
            });

            const data = await response.json();

            if (data.success && data.data?.newAchievements?.length > 0) {
                console.log('[GameStateManager] New achievements unlocked:', data.data.newAchievements);

                // Add notifications for each new achievement
                data.data.newAchievements.forEach((achievement: any) => {
                    addNotification(achievement);
                });

                // Update gold balance
                if (data.data.totalGoldAwarded > 0) {
                    addGold(data.data.totalGoldAwarded);
                }
            }
        } catch (error) {
            console.error('[GameStateManager] Failed to check achievements:', error);
        }
    };

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

    // Check if user has a previous session (to prevent flash of login screen on refresh)
    const hasPreviousSession = typeof window !== 'undefined'
        ? !!localStorage.getItem('wallet_address')
        : false;

    // Show minimal loading while Privy is initializing (prevents flash of login screen on refresh)
    if (!privyReady) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: '#0a0a0a',
                color: '#fff',
            }}>
                {/* Minimal loading state - no text to avoid flash */}
            </div>
        );
    }

    // If user has a previous session but isn't authenticated yet, Privy is still hydrating
    // Show loading state to prevent flash of login screen
    if (privyReady && hasPreviousSession && !authenticated) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: '#0a0a0a',
                color: '#fff',
            }}>
                {/* Minimal loading state while Privy hydrates session */}
            </div>
        );
    }

    // Show loading while syncing auth (only for first-time users)
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
                                    onAchievements={handleAchievements}
                                    disabled={!isConnected}
                                    statusText={statusTextToDisplay}
                                    chainId={address || ''}
                                    incomingMessage={incomingMessage}
                                    selectedPowerups={selectedPowerups}
                                    onPowerupsChange={setSelectedPowerups}
                                />
                                <div style={styles.monadBranding}>
                                    <div style={{
                                        fontSize: '11px',
                                        color: 'rgba(255,255,255,0.5)',
                                        fontFamily: "'Courier New', monospace",
                                        marginBottom: '8px',
                                        letterSpacing: '0.5px',
                                    }}>
                                    </div>
                                    <div style={{
                                        fontSize: '10px',
                                        color: 'rgba(255,255,255,0.4)',
                                        fontFamily: "'Courier New', monospace",
                                        marginBottom: '4px',
                                    }}>
                                        Powered by
                                    </div>
                                    <img
                                        src="/images/monad-logo.png"
                                        alt="Monad"
                                        style={{
                                            width: '120px',
                                            height: 'auto',
                                            filter: 'brightness(0.9)',
                                            opacity: 0.8,
                                        }}
                                    />
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
                            onMissUpdate={setMissCount}
                            onTypoUpdate={setTypoCount}
                            onBackspaceUpdate={setBackspaceCount}
                            onReturnToStart={handleReturnToStart}
                            onWaveComplete={async (waveNumber: number) => {
                                // Update wave ref
                                waveRef.current = waveNumber;

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
                                // Update kills and words typed refs
                                killsRef.current += kills;
                                wordsTypedRef.current += kills; // Words typed approximately equals kills
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
                    gameOver: gameMode === 'staked' && stakedSequenceNumber ? (
                        <StakedGameOver
                            score={score}
                            wpm={bestWpm}
                            missCount={missCount}
                            typoCount={typoCount}
                            sequenceNumber={stakedSequenceNumber}
                            stakeAmount={stakedAmount}
                            kills={kills}
                            waveReached={waveReached}
                            duration={duration}
                            wordsTyped={wordsTyped}
                            goldEarned={goldEarned}
                            onRestart={() => setGameState('solo')}
                            onBackToMenu={handleRestart}
                            onAchievementsChecked={checkAchievements}
                        />
                    ) : gameMode === 'duel' && duelId ? (
                        <DuelGameOver
                            score={score}
                            wpm={bestWpm}
                            missCount={missCount}
                            typoCount={typoCount}
                            duelId={duelId}
                            stakeAmount={stakedAmount}
                            isCreator={isDuelCreator}
                            kills={kills}
                            waveReached={waveReached}
                            duration={duration}
                            wordsTyped={wordsTyped}
                            goldEarned={goldEarned}
                            onRestart={() => setGameState('pvp')}
                            onBackToMenu={handleRestart}
                            onAchievementsChecked={checkAchievements}
                        />
                    ) : isPVPGame ? (
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
                        <GameOver
                            score={score}
                            wpm={bestWpm}
                            goldEarned={goldEarned}
                            kills={kills}
                            missCount={missCount}
                            typoCount={typoCount}
                            backspaceCount={backspaceCount}
                            waveReached={waveReached}
                            duration={duration}
                            wordsTyped={wordsTyped}
                            onRestart={handleRestart}
                            onAchievementsChecked={checkAchievements}
                        />
                    ),
                    pvp: (
                        <div style={styles.pvpScreenContainer()}>
                            <PVPModeScreen
                                chainId={address || ''}
                                onClose={() => setGameState('multiplayer')}
                                incomingMessage={incomingMessage}
                                incomingType={incomingMessageType ?? -1}
                                onStart={handleStartPVP}
                                onDuelStart={handleDuelStart}
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
                            onStakedGame={handleStakedGame}
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
                    achievements: (
                        <AchievementsScreen
                            onClose={() => setGameState('start')}
                            walletAddress={address}
                        />
                    ),
                };
                return screens[gameState];
            })()}

            {/* Achievement Notifications */}
            {notifications.map((notification, index) => (
                <AchievementNotification
                    key={notification.id}
                    achievement={notification}
                    onDismiss={() => removeNotification(notification.id)}
                    index={index}
                />
            ))}

            {/* Debug Panel - only visible when connected */}
            {/* {isConnected && <DebugPanel />} */}
        </>
    );
};

export default GameStateManager;
