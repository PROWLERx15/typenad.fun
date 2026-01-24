'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { usePrivyWallet } from '../../hooks/usePrivyWallet';
import { useSoundSettings } from '../../hooks/useSoundSettings';
import useTimer from './hooks/useTimer';
import useEnemies from './hooks/useEnemies';
import useWaveSystem from './hooks/useWaveSystem';
import Enemy from './Enemy';
import Hero from './Hero';
import WaveComplete from '../UI/WaveComplete';
import WavePreparing from '../UI/WavePreparing';
import WaveVictory from '../UI/WaveVictory';
import { resetUsedWords, initializeWordLibrary } from './utils/wordUtils';
import { getEnemyTypeId } from '../../constants/enemyTypes';
import { calculateGoldReward, EnemyType } from '../../constants/goldSystem';
import { styles } from './GameCanvas.styles';

// Space-themed words for the game
const DEFAULT_WORDS = [
    // original
    'monad', 'cosmos', 'stellar', 'orbit', 'nebula', 'quantum', 'warp', 'plasma', 'photon', 'galaxy',
    'asteroid', 'comet', 'station', 'reactor', 'shields', 'laser', 'torpedo', 'hyperspace',
    'protocol', 'validator', 'staking', 'defi', 'web3', 'crypto', 'token', 'chain', 'block', 'hash',
    'decentralized', 'sector', 'beacon', 'signal', 'radar', 'pilot', 'engine', 'thrust', 'fuel', 'cargo',

    // web3 / blockchain
    'ethereum', 'solana', 'polygon', 'avalanche', 'arbitrum', 'optimism', 'zkrollup',
    'sidechain', 'mainnet', 'testnet', 'gas', 'fee', 'gwei', 'wei', 'nonce', 'signature',
    'privatekey', 'publickey', 'address', 'wallet', 'multisig', 'coldwallet', 'hotwallet',
    'ledger', 'trezor', 'metamask', 'phantom', 'keystore', 'mnemonic', 'seedphrase',

    'smartcontract', 'bytecode', 'opcode', 'compiler', 'solidity', 'vyper', 'rust', 'move',
    'cairo', 'foundry', 'hardhat', 'truffle', 'remix', 'ethers', 'viem', 'websocket', 'rpc',
    'jsonrpc', 'indexer', 'subgraph', 'thegraph', 'alchemy', 'infura',

    'merkle', 'patricia', 'tree', 'root', 'proof', 'zkproof', 'snark', 'stark', 'plonk',
    'circom', 'zkvm', 'rollup', 'sequencer', 'prover', 'verifier',

    'consensus', 'pow', 'pos', 'dpos', 'delegator', 'slashing', 'epoch', 'slot', 'finality', 'fork',
    'reorg', 'checkpoint', 'beaconchain',

    'dex', 'amm', 'liquidity', 'pool', 'yield', 'farming', 'unstaking', 'borrow', 'lend',
    'collateral', 'leverage', 'oracle', 'chainlink', 'pyth', 'band', 'liquidation',
    'impermanentloss', 'tvl', 'apy', 'apr', 'slippage', 'flashloan',

    'nft', 'metadata', 'mint', 'burn', 'airdrops', 'vesting',
    'whitelist', 'royalties', 'marketplace', 'opensea', 'blur', 'rarity', 'traits',

    'dao', 'governance', 'proposal', 'snapshot', 'voting', 'quorum', 'timelock', 'treasury',
    'gnosis', 'safe',

    'bridge', 'relayer', 'canonical', 'wrapped', 'pegged', 'crosschain', 'interoperability',
    'ccip', 'wormhole', 'layerzero', 'axelar',

    'security', 'audit', 'exploit', 'reentrancy', 'overflow', 'frontrun', 'mev', 'sandwich',
    'backrun', 'rugpull', 'phishing', 'spoofing', 'sybil', 'ddos', 'bugbounty',

    'tokenomics', 'inflation', 'deflation', 'supply', 'circulating', 'burnrate', 'emission',
    'distribution', 'allocation', 'governanceToken', 'utilityToken',

    'permissionless', 'trustless', 'censorshipresistant', 'immutability', 'sovereignty',
    'cryptography', 'ellipticcurve', 'bls', 'hashing', 'keccak',
    'sha256', 'ripemd', 'entropy', 'randomness',

    'restaking', 'eigenlayer', 'modular', 'monolithic', 'execution', 'settlement', 'availability',
    'blobspace', 'protoDanksharding',

    'accountabstraction', 'paymaster', 'bundler', 'entrypoint', 'sessionkey', 'socialrecovery',
    'zklogin', 'passkeys', 'biometrics',

    // common words
    'star', 'space', 'light', 'dark', 'fire', 'ice', 'wind', 'storm', 'cloud', 'sky',
    'moon', 'sun', 'nova', 'void', 'core', 'field', 'zone', 'base', 'unit', 'team',
    'power', 'speed', 'focus', 'force', 'shield', 'blade', 'spark', 'pulse', 'wave', 'shift',
    'boost', 'drive', 'flow', 'lock', 'path', 'node', 'link', 'grid', 'frame', 'loop',
    'point', 'score', 'rank', 'level', 'match', 'round', 'timer', 'start', 'pause', 'reset',
    'build', 'break', 'craft', 'trade', 'store', 'send', 'claim', 'earn', 'spend', 'hold',
    'open', 'close', 'enter', 'exit', 'join', 'leave', 'share', 'track', 'scan', 'ping',
    'sync', 'load', 'save', 'play', 'watch', 'learn', 'train', 'win', 'lose', 'draw'
];

interface GameCanvasProps {
    onGameOver: () => void;
    onScoreUpdate: (points: number) => void;
    onEnemyReachBottom: () => void;
    onWpmUpdate?: (wpm: number) => void;
    onMissUpdate?: (misses: number) => void;
    onTypoUpdate?: (typos: number) => void;
    onReturnToStart?: () => void;
    onWaveComplete?: (waveNumber: number) => void;
    onQuestProgress?: (kills: number, droneKills: number) => void;
    onGoldEarned?: (amount: number) => void;
    goldEarned?: number;
    screenEffect: boolean;
    pvpMode: boolean;
    gameMode?: 'story' | 'timeAttack' | 'pvp' | 'staked' | 'duel';
    friendChainId?: string;
    remoteWord?: string;
    remoteType?: number | null;
    highScore?: number;
    selectedPowerups?: string[];
    onPowerupsChange?: (powerups: string[]) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver, onScoreUpdate, onEnemyReachBottom, onWpmUpdate, onMissUpdate, onTypoUpdate, onReturnToStart, onWaveComplete, onQuestProgress, onGoldEarned, goldEarned = 0, screenEffect, pvpMode, gameMode = 'story', friendChainId, remoteWord, remoteType, highScore, selectedPowerups = [], onPowerupsChange }) => {
    const { address } = usePrivyWallet();
    const { sfxMuted, sfxVolume } = useSoundSettings();
    const [playerInput, setPlayerInput] = useState('');
    const [targetedEnemyId, setTargetedEnemyId] = useState<number | null>(null);
    const [health, setHealth] = useState(10);
    const [score, setScore] = useState(0);
    const scoreRef = useRef(0);
    const [flashScore, setFlashScore] = useState(false);
    const [bestWpm, setBestWpm] = useState(0);
    const bestWpmRef = useRef(0);
    const [flashWpm, setFlashWpm] = useState(false);
    const [restartSignal, setRestartSignal] = useState(false);
    const [goldNotifications, setGoldNotifications] = useState<Array<{ id: number; amount: number }>>([]);
    const goldNotificationIdRef = useRef(0);
    const [scoreMultiplier, setScoreMultiplier] = useState(1);
    const [goldMultiplier, setGoldMultiplier] = useState(1);
    const [speedMultiplier, setSpeedMultiplier] = useState(1);
    const [showHero, setShowHero] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [opponentTyping, setOpponentTyping] = useState(false);
    const [ownedPowerups, setOwnedPowerups] = useState<string[]>([]);
    const [totalMisses, setTotalMisses] = useState(0);
    const [totalTypos, setTotalTypos] = useState(0);
    const totalMissesRef = useRef(0);
    const totalTyposRef = useRef(0);
    const hasStartedFirstWave = useRef(false);
    const [penaltyNotifications, setPenaltyNotifications] = useState<Array<{ id: number; amount: number }>>([]);
    const penaltyNotificationIdRef = useRef(0);

    // Sound refs
    const laserSoundRef = useRef<HTMLAudioElement | null>(null);
    const droneDieRef = useRef<HTMLAudioElement | null>(null);
    const cruiserDieRef = useRef<HTMLAudioElement | null>(null);
    const scoutDieRef = useRef<HTMLAudioElement | null>(null);
    const impactRef = useRef<HTMLAudioElement | null>(null);
    const explodeRef = useRef<HTMLAudioElement | null>(null);
    const mothershipDieRef = useRef<HTMLAudioElement | null>(null);
    const mechDieRef = useRef<HTMLAudioElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const spawnedRemoteWords = useRef<Set<string>>(new Set());
    const prevInputLengthRef = useRef<number>(0);
    const killsThisSession = useRef<number>(0);
    const droneKillsThisSession = useRef<number>(0);
    
    // NEW: Track game duration
    const gameStartTimeRef = useRef<number>(Date.now());
    
    // NEW: Track words typed accurately
    const wordsTypedCountRef = useRef<number>(0);
    
    // NEW: Track gold earned in this session
    const goldEarnedRef = useRef<number>(0);

    const waveSystem = useWaveSystem(restartSignal, pvpMode, gameMode);
    const { timeLeft } = useTimer(60, pvpMode ? onGameOver : () => { }, restartSignal);
    const timerColor = timeLeft > 40 ? 'lime' : timeLeft > 15 ? 'yellow' : 'red';

    const waveCallbacks = useMemo(() => ({
        canSpawnMore: waveSystem.canSpawnMore,
        getEnemyType: waveSystem.getEnemyType,
        getSpawnDelay: waveSystem.getSpawnDelay,
        notifyEnemySpawned: waveSystem.notifyEnemySpawned,
        notifyDeathriderSpawned: waveSystem.notifyDeathriderSpawned,
        isSurvival: waveSystem.waveConfig?.isSurvival || false,
        checkIfWaveComplete: waveSystem.checkIfWaveComplete,
    }), [
        waveSystem.canSpawnMore,
        waveSystem.getEnemyType,
        waveSystem.getSpawnDelay,
        waveSystem.notifyEnemySpawned,
        waveSystem.notifyDeathriderSpawned,
        waveSystem.waveConfig?.isSurvival,
        waveSystem.checkIfWaveComplete,
    ]);

    // Wrapper for enemy reach bottom that also tracks misses for staked games
    const handleEnemyReachBottomWithMiss = useCallback(() => {
        onEnemyReachBottom();
        // Track miss for staked/duel modes
        if (gameMode === 'staked' || gameMode === 'duel') {
            totalMissesRef.current += 1;
            setTotalMisses(totalMissesRef.current);
            onMissUpdate?.(totalMissesRef.current);
        }
    }, [onEnemyReachBottom, gameMode, onMissUpdate]);

    // Handler for penalty misses in staked mode (when health is already at 0)
    const handlePenaltyMiss = useCallback(() => {
        penaltyNotificationIdRef.current += 1;
        const id = penaltyNotificationIdRef.current;
        setPenaltyNotifications(prev => [...prev, { id, amount: 0.1 }]);

        // Remove notification after 2 seconds
        setTimeout(() => {
            setPenaltyNotifications(prev => prev.filter(n => n.id !== id));
        }, 2000);
    }, []);

    const { enemies, handleEnemyHit, spawnRemote, clearAllEnemies } = useEnemies(
        onGameOver,
        handleEnemyReachBottomWithMiss,
        setHealth,
        restartSignal,
        !pvpMode,
        waveSystem.waveState,
        waveCallbacks,
        scoreMultiplier,
        speedMultiplier,
        gameMode,
        handlePenaltyMiss
    );

    // Initialize word library with space-themed words
    useEffect(() => {
        const storedWords = typeof window !== 'undefined'
            ? localStorage.getItem('game_words')
            : null;
        const words = storedWords ? JSON.parse(storedWords) : DEFAULT_WORDS;
        initializeWordLibrary(words);
    }, []);

    // Load owned powerups from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('owned_powerups');
            setOwnedPowerups(stored ? JSON.parse(stored) : []);
        }
    }, [selectedPowerups]);

    // Apply power-up effects
    useEffect(() => {
        if (pvpMode) {
            setScoreMultiplier(1);
            setGoldMultiplier(1);
            setSpeedMultiplier(1);
            setHealth(3);
            return;
        }

        // Score multiplier
        if (selectedPowerups.includes('triple-points')) {
            setScoreMultiplier(3);
        } else if (selectedPowerups.includes('double-points')) {
            setScoreMultiplier(2);
        } else {
            setScoreMultiplier(1);
        }

        // Gold multiplier
        if (selectedPowerups.includes('triple-gold')) {
            setGoldMultiplier(3);
        } else if (selectedPowerups.includes('double-gold')) {
            setGoldMultiplier(2);
        } else {
            setGoldMultiplier(1);
        }

        // Speed multiplier (slow enemies)
        if (selectedPowerups.includes('slow-enemies')) {
            setSpeedMultiplier(0.5);
        } else {
            setSpeedMultiplier(1);
        }

        // Extra life
        if (selectedPowerups.includes('extra-life')) {
            setHealth(11);
        } else {
            setHealth(10);
        }
    }, [selectedPowerups, restartSignal, pvpMode]);

    useEffect(() => {
        if (laserSoundRef.current) {
            laserSoundRef.current.load();
            laserSoundRef.current.volume = sfxVolume;
        }
    }, [sfxVolume]);

    useEffect(() => {
        [droneDieRef, cruiserDieRef, scoutDieRef, impactRef, explodeRef, mothershipDieRef, mechDieRef].forEach(ref => {
            if (ref.current) {
                ref.current.volume = sfxVolume;
            }
        });
    }, [sfxVolume]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [restartSignal]);

    useEffect(() => {
        if (!pvpMode && waveSystem.waveState === 'betweenWaves') {
            if (waveSystem.waveConfig?.isSurvival) {
                clearAllEnemies();
            }
            setPlayerInput('');
            setTargetedEnemyId(null);
            prevInputLengthRef.current = 0;

            // For staked mode, trigger game over when survival timer ends (wave completes)
            if (gameMode === 'staked') {
                console.log('🎮 Staked survival timer ended - triggering game over for settlement');
                onGameOver();
                return;
            }

            onWaveComplete?.(waveSystem.currentWave);
            if (onQuestProgress && (killsThisSession.current > 0 || droneKillsThisSession.current > 0)) {
                onQuestProgress(killsThisSession.current, droneKillsThisSession.current);
                killsThisSession.current = 0;
                droneKillsThisSession.current = 0;
            }
        }
    }, [pvpMode, waveSystem.waveState, waveSystem.currentWave, onWaveComplete, onQuestProgress, clearAllEnemies, waveSystem.waveConfig?.isSurvival, gameMode, onGameOver]);

    // Auto-start wave for staked mode (no WavePreparing screen)
    useEffect(() => {
        if (gameMode === 'staked' && waveSystem.waveState === 'preparing') {
            console.log('🎮 Auto-starting staked survival wave');
            hasStartedFirstWave.current = true;
            waveSystem.startWave();
        }
    }, [gameMode, waveSystem.waveState, waveSystem.startWave]);

    useEffect(() => {
        if (waveSystem.waveState === 'active' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [waveSystem.waveState]);

    useEffect(() => {
        if (waveSystem.waveState === 'active' || pvpMode) {
            setShowHero(true);
        } else {
            setShowHero(false);
        }
    }, [waveSystem.waveState, pvpMode]);

    useEffect(() => {
        if (score > 0) {
            setFlashScore(true);
            const t = setTimeout(() => setFlashScore(false), 300);
            return () => clearTimeout(t);
        }
    }, [score]);

    useEffect(() => {
        if (bestWpm > 0) {
            setFlashWpm(true);
            const t = setTimeout(() => setFlashWpm(false), 300);
            return () => clearTimeout(t);
        }
    }, [bestWpm]);

    useEffect(() => {
        if (screenEffect && impactRef.current && !sfxMuted) {
            impactRef.current.currentTime = 0;
            impactRef.current.currentTime = 0;
            impactRef.current.play().catch(e => console.log('Audio autoplay prevented:', e));
        }
    }, [screenEffect, sfxMuted]);

    // PVP remote spawning
    useEffect(() => {
        if (pvpMode && remoteWord && (remoteType === 1 || remoteType === 2 || remoteType === 3)) {
            if (!spawnedRemoteWords.current.has(remoteWord)) {
                spawnedRemoteWords.current.add(remoteWord);
                const typeMap: Record<number, 'scout' | 'cruiser' | 'drone'> = { 1: 'scout', 2: 'cruiser', 3: 'drone' };
                spawnRemote(remoteWord, typeMap[remoteType]);
                setOpponentTyping(true);
                setTimeout(() => setOpponentTyping(false), 320);
            }
        }
    }, [pvpMode, remoteWord, remoteType, spawnRemote]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setPlayerInput('');
                setTargetedEnemyId(null);
                prevInputLengthRef.current = 0;
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawInput = e.target.value;
        // Sanitize input: remove HTML tags and limit length
        const input = rawInput.replace(/[<>]/g, '').slice(0, 50);
        const typing = input.length > prevInputLengthRef.current;

        if (typing) {
            setIsTyping(prev => !prev);

            // Track typos for staked/duel modes: a typo is when the new input doesn't match any enemy
            if ((gameMode === 'staked' || gameMode === 'duel') && input.length > 0) {
                const hasMatchingEnemy = enemies.some((e) => e.word.startsWith(input));
                if (!hasMatchingEnemy && prevInputLengthRef.current > 0) {
                    // Only count as typo if we were already targeting something
                    const prevMatched = enemies.some((e) => e.word.startsWith(playerInput));
                    if (prevMatched) {
                        totalTyposRef.current += 1;
                        setTotalTypos(totalTyposRef.current);
                        onTypoUpdate?.(totalTyposRef.current);
                    }
                }
            }
        }

        setPlayerInput(input);
        prevInputLengthRef.current = input.length;

        if (input.length > 0) {
            const matchingEnemy = enemies.find((e) => e.word.startsWith(input));
            setTargetedEnemyId(matchingEnemy ? matchingEnemy.id : null);
        } else {
            setTargetedEnemyId(null);
        }

        const killed = handleEnemyHit(
            input,
            () => {
                setPlayerInput('');
                setTargetedEnemyId(null);
                prevInputLengthRef.current = 0;
            },
            (points) => {
                setScore((prev) => {
                    const newScore = prev + points;
                    scoreRef.current = newScore;
                    return newScore;
                });
                onScoreUpdate(points);
            },
            (wpm: number) => {
                setBestWpm((prev) => {
                    const newWpm = Math.max(prev, wpm);
                    bestWpmRef.current = newWpm;
                    return newWpm;
                });
                if (onWpmUpdate) onWpmUpdate(wpm);
            }
        );

        if (isTyping && laserSoundRef.current && !sfxMuted) {
            laserSoundRef.current.currentTime = 0;
            laserSoundRef.current.play().catch(() => { });
        }

        if (killed && !killed.remote && onGoldEarned) {
            const baseGoldReward = calculateGoldReward(killed.type as EnemyType, waveSystem.currentWave);
            const goldReward = Math.floor(baseGoldReward * goldMultiplier);
            onGoldEarned(goldReward);
            
            // NEW: Accumulate gold earned in ref
            goldEarnedRef.current += goldReward;

            const goldNotifId = goldNotificationIdRef.current++;
            setGoldNotifications(prev => [...prev, { id: goldNotifId, amount: goldReward }]);
            setTimeout(() => {
                setGoldNotifications(prev => prev.filter(n => n.id !== goldNotifId));
            }, 1500);
        }

        if (killed && !killed.remote && !pvpMode) {
            killsThisSession.current += 1;
            // NEW: Increment words typed counter
            wordsTypedCountRef.current += 1;
            if (killed.type === 'drone') droneKillsThisSession.current += 1;
        }

        // Play death sounds based on enemy type
        if (!sfxMuted && killed) {
            if (killed.type === 'drone') droneDieRef.current?.play().catch(() => { });
            else if (killed.type === 'cruiser') cruiserDieRef.current?.play().catch(() => { });
            else if (killed.type === 'scout') scoutDieRef.current?.play().catch(() => { });
            else if (killed.type === 'asteroid') explodeRef.current?.play().catch(() => { });
            else if (killed.type === 'mothership') mothershipDieRef.current?.play().catch(() => { });
            else if (killed.type === 'mech') mechDieRef.current?.play().catch(() => { });
        }
    };

    const restartGame = () => {
        setPlayerInput('');
        setTargetedEnemyId(null);
        setHealth(selectedPowerups.includes('extra-life') ? 11 : 10);
        setScore(0);
        scoreRef.current = 0;
        setBestWpm(0);
        bestWpmRef.current = 0;
        // Reset miss/typo counters for staked games
        setTotalMisses(0);
        setTotalTypos(0);
        totalMissesRef.current = 0;
        totalTyposRef.current = 0;
        // NEW: Reset new tracking refs
        gameStartTimeRef.current = Date.now();
        wordsTypedCountRef.current = 0;
        goldEarnedRef.current = 0;
        resetUsedWords();
        setRestartSignal((prev) => !prev);
        prevInputLengthRef.current = 0;
        hasStartedFirstWave.current = false;

        if (inputRef.current) {
            inputRef.current.focus();
        }
    };
    
    // NEW: Helper function to calculate game duration
    const calculateDuration = (): number => {
        return Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    };
    
    // NEW: Helper function to get all game metrics
    const getGameMetrics = () => {
        return {
            score: scoreRef.current,
            wpm: bestWpmRef.current,
            kills: killsThisSession.current,
            waveReached: waveSystem.currentWave,
            goldEarned: goldEarnedRef.current,
            missCount: totalMissesRef.current,
            typoCount: totalTyposRef.current,
            duration: calculateDuration(),
            wordsTyped: wordsTypedCountRef.current,
        };
    };

    return (
        <div style={styles.gameContainer}>
            <div style={styles.shakeContainer(screenEffect)}>
                {screenEffect && (
                    <div style={styles.screenEffectOverlay} />
                )}
                {/* Sound effects - using existing files for now, can be updated with space sounds */}
                <audio ref={laserSoundRef} src="/sounds/gunshot.mp3" preload="auto"></audio>
                <audio ref={droneDieRef} src="/sounds/bat-die.mp3" preload="auto"></audio>
                <audio ref={cruiserDieRef} src="/sounds/mummy-die.mp3" preload="auto"></audio>
                <audio ref={scoutDieRef} src="/sounds/zombie-die.mp3" preload="auto"></audio>
                <audio ref={impactRef} src="/sounds/zomb-attack.mp3" preload="auto"></audio>
                <audio ref={explodeRef} src="/sounds/explode.mp3" preload="auto"></audio>
                <audio ref={mothershipDieRef} src="/sounds/horse-die.mp3" preload="auto"></audio>
                <audio ref={mechDieRef} src="/sounds/bone-die.mp3" preload="auto"></audio>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
                    @keyframes fadeInOut {
                        0% { opacity: 0; transform: translateX(-20px); }
                        10% { opacity: 1; transform: translateX(0); }
                        90% { opacity: 1; transform: translateX(0); }
                        100% { opacity: 0; transform: translateX(-20px); }
                    }
                    @keyframes floatUp {
                        0% { opacity: 1; transform: translateY(0); }
                        100% { opacity: 0; transform: translateY(-50px); }
                    }
                `}</style>
                <div style={styles.topBar}>
                    <div style={styles.statsContainer}>
                        {highScore !== undefined && highScore > 0 && (
                            <div style={styles.highScore}>
                                High Score: {highScore}
                            </div>
                        )}
                        <div style={styles.score(flashScore)}>
                            Score{scoreMultiplier > 1 && `(x${scoreMultiplier})`}: {score}
                        </div>
                        <div style={styles.wpm(flashWpm)}>
                            WPM: {bestWpm}
                        </div>
                        <div style={styles.goldContainer}>
                            {goldMultiplier === 1 ? (
                                <img src="/images/gold-coin.png" alt="Credits" style={styles.goldIcon} />
                            ) : goldMultiplier === 2 ? (
                                <div style={{ position: 'relative', width: '48px', height: '28px', marginRight: '4px' }}>
                                    <img src="/images/gold-coin.png" alt="Credits" style={{ position: 'absolute', top: '0', left: '4px', width: '24px', height: '24px', imageRendering: 'pixelated' }} />
                                    <img src="/images/gold-coin.png" alt="Credits" style={{ position: 'absolute', top: '0', left: '20px', width: '24px', height: '24px', imageRendering: 'pixelated' }} />
                                </div>
                            ) : (
                                <div style={{ position: 'relative', width: '60px', height: '28px', marginRight: '4px' }}>
                                    <img src="/images/gold-coin.png" alt="Credits" style={{ position: 'absolute', top: '0', left: '2px', width: '20px', height: '20px', imageRendering: 'pixelated' }} />
                                    <img src="/images/gold-coin.png" alt="Credits" style={{ position: 'absolute', top: '0', left: '20px', width: '20px', height: '20px', imageRendering: 'pixelated' }} />
                                    <img src="/images/gold-coin.png" alt="Credits" style={{ position: 'absolute', top: '0', left: '38px', width: '20px', height: '20px', imageRendering: 'pixelated' }} />
                                </div>
                            )}
                            <span style={styles.goldText}>{goldEarned}</span>
                        </div>
                        {goldNotifications.map((notification) => (
                            <div key={notification.id} style={styles.floatingGold}>
                                <span>+{notification.amount}</span>
                                <img src="/images/gold-coin.png" alt="Credits" style={styles.floatingGoldIcon} />
                            </div>
                        ))}
                        {/* Penalty notifications for staked mode */}
                        {penaltyNotifications.map((notification) => (
                            <div key={notification.id} style={{
                                position: 'absolute',
                                top: '60px',
                                right: '20px',
                                padding: '8px 16px',
                                background: 'rgba(255, 50, 50, 0.9)',
                                border: '2px solid #ff0000',
                                borderRadius: '8px',
                                color: '#fff',
                                fontFamily: '"Press Start 2P", monospace',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                animation: 'shake 0.5s ease-in-out, fadeOut 2s forwards',
                                boxShadow: '0 0 20px rgba(255, 0, 0, 0.5)',
                                zIndex: 1000,
                            }}>
                                -{notification.amount} USDC
                            </div>
                        ))}
                    </div>
                    {pvpMode && (
                        <>
                            <div style={styles.pvpModeLabel}>
                                PVP Mode
                            </div>
                            <div style={styles.pvpTimer(timerColor)}>
                                {timeLeft}s
                            </div>
                        </>
                    )}
                    {gameMode === 'staked' && waveSystem.waveState === 'active' && (
                        <>
                            <div style={styles.pvpModeLabel}>
                                ⚡ STAKED SURVIVAL
                            </div>
                            <div style={styles.pvpTimer(
                                waveSystem.survivalTimeLeft > 40 ? 'lime' :
                                    waveSystem.survivalTimeLeft > 15 ? 'yellow' : 'red'
                            )}>
                                {waveSystem.survivalTimeLeft}s
                            </div>
                        </>
                    )}
                    {!pvpMode && gameMode !== 'staked' && waveSystem.waveConfig?.isSurvival && waveSystem.waveState === 'active' && (
                        <div style={styles.pvpTimer(
                            waveSystem.survivalTimeLeft > 40 ? 'lime' :
                                waveSystem.survivalTimeLeft > 15 ? 'yellow' : 'red'
                        )}>
                            {waveSystem.survivalTimeLeft}s
                        </div>
                    )}
                    <div style={styles.rightContainer}>
                        <div style={styles.heartsContainer}>
                            {Array.from({ length: health }).map((_, index) => (
                                <img
                                    key={index}
                                    src="/images/heart.png"
                                    alt="Shield"
                                    style={styles.heartImage}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div style={styles.backgroundLayer(waveSystem.currentWave)}>
                    {enemies.map((enemy) => (
                        <Enemy
                            key={enemy.id}
                            enemy={enemy}
                            isAttacked={targetedEnemyId === enemy.id}
                        />
                    ))}
                </div>
                <div style={styles.canonsImage} />
                <Hero show={showHero} isTyping={isTyping} position="left" heroNumber={1} />
                {pvpMode && <Hero show={showHero} isTyping={opponentTyping} position="right" heroNumber={2} />}
            </div>
            <input
                ref={inputRef}
                type="text"
                value={playerInput}
                onChange={handleInputChange}
                placeholder="Type here..."
                disabled={!pvpMode && waveSystem.waveState === 'preparing'}
                style={styles.inputField(!pvpMode && waveSystem.waveState === 'preparing')}
            />
            {!pvpMode && gameMode !== 'staked' && (waveSystem.waveState === 'preparing' || waveSystem.waveState === 'active') && (
                <WavePreparing
                    waveNumber={waveSystem.currentWave}
                    isSurvival={waveSystem.waveConfig?.isSurvival}
                    survivalTimeLeft={waveSystem.survivalTimeLeft}
                    onReady={() => {
                        if (!hasStartedFirstWave.current) {
                            hasStartedFirstWave.current = true;
                        }
                        waveSystem.startWave();
                    }}
                    onReturnToStart={onReturnToStart}
                    selectedPowerups={selectedPowerups}
                    ownedPowerups={ownedPowerups}
                    onPowerupsChange={onPowerupsChange}
                    isFirstWave={!hasStartedFirstWave.current}
                />
            )}
            {!pvpMode && gameMode !== 'staked' && waveSystem.waveState === 'betweenWaves' && (
                <WaveComplete
                    waveNumber={waveSystem.currentWave}
                    nextWave={waveSystem.currentWave + 1}
                />
            )}
            {!pvpMode && gameMode !== 'staked' && waveSystem.waveState === 'complete' && waveSystem.currentWave === 9 && (
                <WaveVictory
                    onReturnHome={() => {
                        if (onReturnToStart) onReturnToStart();
                    }}
                />
            )}
        </div>
    );
};

export default GameCanvas;
