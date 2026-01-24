import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generateUniqueWord, resetUsedWords } from '../utils/wordUtils';
import { Enemy } from '../types';

type EnemyTypeName = 'scout' | 'cruiser' | 'drone' | 'mothership' | 'asteroid' | 'mech' | 'interceptor' | 'dreadnought';

interface WaveCallbacks {
    canSpawnMore: () => boolean;
    getEnemyType: () => EnemyTypeName;
    getSpawnDelay: () => number;
    notifyEnemySpawned: () => void;
    notifyDeathriderSpawned: () => void;
    isSurvival: boolean;
    checkIfWaveComplete: (enemiesOnScreen: number) => void;
}

const useEnemies = (
    onGameOver: () => void,
    onEnemyReachBottom: () => void,
    setHealth: React.Dispatch<React.SetStateAction<number>>,
    restartSignal: boolean,
    isWaveMode: boolean = false,
    waveState?: string,
    waveCallbacks?: WaveCallbacks,
    scoreMultiplier: number = 1,
    speedMultiplier: number = 1
) => {
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const enemyKillCountRef = useRef(0);
    const enemyIdCounterRef = useRef(0);

    const onGameOverRef = useRef(onGameOver);
    const onEnemyReachBottomRef = useRef(onEnemyReachBottom);
    const setHealthRef = useRef(setHealth);
    const waveCallbacksRef = useRef(waveCallbacks);

    useEffect(() => {
        onGameOverRef.current = onGameOver;
        onEnemyReachBottomRef.current = onEnemyReachBottom;
        setHealthRef.current = setHealth;
        waveCallbacksRef.current = waveCallbacks;
    }, [onGameOver, onEnemyReachBottom, setHealth, waveCallbacks]);

    const spawnEnemy = useCallback((forceType?: EnemyTypeName) => {
        const newWord = generateUniqueWord();
        if (newWord) {
            enemyIdCounterRef.current += 1;
            const enemyId = enemyIdCounterRef.current;
            const now = Date.now();
            const DISPLAY_WIDTH = Math.round(128 / 3);
            const PADDING = 60;
            let left, valid, tries = 0;

            let enemyType: EnemyTypeName;
            if (forceType) {
                enemyType = forceType;
            } else if (isWaveMode && waveCallbacksRef.current) {
                enemyType = waveCallbacksRef.current.getEnemyType();
            } else {
                // Fallback spawning for non-wave mode
                if (enemyKillCountRef.current < 3) {
                    enemyType = 'scout';
                } else {
                    const rand = Math.random();
                    if (rand < 0.15) {
                        enemyType = 'mothership';
                    } else if (rand < 0.4) {
                        enemyType = 'scout';
                    } else if (rand < 0.8) {
                        enemyType = 'cruiser';
                    } else {
                        enemyType = 'drone';
                    }

                    if (enemyKillCountRef.current >= 5 && Math.random() < 0.08) {
                        enemyType = 'asteroid';
                    }
                }
            }

            // Speed values for each enemy type
            // In survival mode, speeds are reduced by 30% for better playability
            const isSurvivalMode = waveCallbacksRef.current?.isSurvival || false;
            const survivalSpeedFactor = isSurvivalMode ? 0.7 : 1.0;

            const baseSpeed = enemyType === 'scout' ? 1
                : enemyType === 'cruiser' ? 2
                    : enemyType === 'drone' ? 4
                        : enemyType === 'mothership' ? 1.5
                            : enemyType === 'mech' ? 2
                                : enemyType === 'interceptor' ? 3
                                    : enemyType === 'dreadnought' ? 2
                                        : 0; // asteroid

            const speed = baseSpeed * speedMultiplier * survivalSpeedFactor;

            setEnemies((prev) => {
                // Only one asteroid on screen at a time
                if (enemyType === 'asteroid') {
                    const asteroidOnScreen = prev.some(e => e.type === 'asteroid');
                    if (asteroidOnScreen) {
                        return prev;
                    }
                }

                // Find valid spawn position
                do {
                    left = 10 + Math.random() * 80;
                    valid = true;
                    for (const e of prev) {
                        const dx = Math.abs(e.left - left);
                        if (dx * window.innerWidth / 100 < DISPLAY_WIDTH + PADDING) {
                            valid = false;
                            break;
                        }
                    }
                    tries++;
                } while (!valid && tries < 30);

                if (valid) {
                    if (isWaveMode && waveCallbacksRef.current) {
                        waveCallbacksRef.current.notifyEnemySpawned();
                        if (enemyType === 'mothership') {
                            waveCallbacksRef.current.notifyDeathriderSpawned();
                        }
                    }

                    // Asteroids spawn at random Y positions
                    const position = enemyType === 'asteroid'
                        ? Math.random() * (window.innerHeight * 0.7)
                        : 0;

                    const newEnemy: any = {
                        id: enemyId,
                        word: newWord,
                        position,
                        left,
                        health: 100,
                        spawnTime: now,
                        type: enemyType,
                        speed,
                    };

                    // Multi-hit enemies
                    if (enemyType === 'mothership') {
                        newEnemy.livesRemaining = 2;
                    }
                    if (enemyType === 'dreadnought') {
                        newEnemy.livesRemaining = 3;
                    }
                    // Asteroid explosion properties
                    if (enemyType === 'asteroid') {
                        newEnemy.expiryTime = now + 4000;
                        newEnemy.exploding = false;
                    }
                    return [
                        ...prev,
                        newEnemy,
                    ];
                }
                return prev;
            });
        }
    }, [isWaveMode, speedMultiplier]);

    // Reset on restart
    useEffect(() => {
        setEnemies([]);
        resetUsedWords();
        enemyKillCountRef.current = 0;
        enemyIdCounterRef.current = 0;
    }, [restartSignal]);

    // Spawning logic
    useEffect(() => {
        if (isWaveMode && waveCallbacksRef.current && waveState === 'active') {
            const timeoutIds: NodeJS.Timeout[] = [];

            // Initial burst spawn
            const initialSpawnCount = waveCallbacksRef.current.isSurvival
                ? Math.floor(Math.random() * 4) + 3
                : Math.floor(Math.random() * 3) + 4;
            for (let i = 0; i < initialSpawnCount; i++) {
                const delay = Math.random() * 1000 + (i * 150);
                const timeoutId = setTimeout(() => {
                    if (waveCallbacksRef.current?.canSpawnMore()) {
                        spawnEnemy();
                    }
                }, delay);
                timeoutIds.push(timeoutId);
            }

            // Regular spawn loop
            const scheduleNextSpawn = () => {
                const shouldSpawn = waveCallbacksRef.current?.canSpawnMore();
                if (shouldSpawn) {
                    spawnEnemy();
                    const delay = waveCallbacksRef.current?.getSpawnDelay() || 1000;
                    const timeoutId = setTimeout(scheduleNextSpawn, delay);
                    timeoutIds.push(timeoutId);
                } else {
                    console.log('⏹️ Spawning loop stopped');
                }
            };

            const initialBurstDelay = 1000 + (initialSpawnCount * 150) + 1000;
            const startRegularSpawn = setTimeout(() => {
                scheduleNextSpawn();
            }, initialBurstDelay);
            timeoutIds.push(startRegularSpawn);

            return () => {
                timeoutIds.forEach(id => clearTimeout(id));
            };
        } else if (!isWaveMode) {
            const spawnIntervalId = setInterval(() => {
                spawnEnemy();
            }, 2000);

            return () => clearInterval(spawnIntervalId);
        }
    }, [isWaveMode, waveState, spawnEnemy]);

    // Movement and collision detection
    useEffect(() => {
        const moveInterval = setInterval(() => {
            const now = Date.now();
            setEnemies((prev) => {
                const updated = prev
                    .map((e) => {
                        if (e.dying || e.exploding) return e;
                        return { ...e, position: e.position + e.speed };
                    })
                    .filter((e) => {
                        // Remove expired asteroids
                        if (e.type === 'asteroid' && 'expiryTime' in e && now >= e.expiryTime && !e.exploding) {
                            return false;
                        }

                        const threshold = window.innerHeight - 150;
                        if (e.position >= threshold) {
                            // Asteroids don't damage player
                            if (e.type === 'asteroid') {
                                return false;
                            }

                            if (e.dying) {
                                return true;
                            }

                            setHealthRef.current((prevHealth) => {
                                const newHealth = prevHealth - 1;
                                if (newHealth <= 0) {
                                    setTimeout(() => onGameOverRef.current(), 0);
                                }
                                return newHealth;
                            });
                            setTimeout(() => onEnemyReachBottomRef.current(), 0);
                            return false;
                        }
                        return true;
                    });

                if (isWaveMode && waveCallbacksRef.current && updated.length !== prev.length) {
                    setTimeout(() => waveCallbacksRef.current?.checkIfWaveComplete(updated.length), 0);
                }

                return updated;
            });
        }, 50);

        return () => clearInterval(moveInterval);
    }, [isWaveMode]);

    // Handle word completion and enemy destruction
    const handleEnemyHit = (input: string, resetInput: () => void, onScoreUpdate: (points: number) => void, onWpmUpdate?: (wpm: number) => void): Enemy | void => {
        const matchingEnemy = enemies.find((e) => e.word.startsWith(input));
        if (matchingEnemy) {
            const progress = (input.length / matchingEnemy.word.length) * 100;

            setEnemies((prev) =>
                prev.map((e) =>
                    e.id === matchingEnemy.id
                        ? { ...e, health: 100 - progress }
                        : e
                )
            );

            if (input === matchingEnemy.word) {
                // Multi-hit: Mothership (2 hits)
                if (matchingEnemy.type === 'mothership' && 'livesRemaining' in matchingEnemy && matchingEnemy.livesRemaining > 1) {
                    const newWord = generateUniqueWord();
                    if (newWord) {
                        const now = Date.now();
                        setEnemies((prev) => prev.map((e) =>
                            e.id === matchingEnemy.id
                                ? { ...e, word: newWord, health: 100, spawnTime: now, livesRemaining: matchingEnemy.livesRemaining - 1 }
                                : e
                        ));
                        resetInput();
                        return matchingEnemy;
                    }
                }

                // Multi-hit: Dreadnought (3 hits)
                if (matchingEnemy.type === 'dreadnought' && 'livesRemaining' in matchingEnemy && matchingEnemy.livesRemaining > 1) {
                    const newWord = generateUniqueWord();
                    if (newWord) {
                        const now = Date.now();
                        setEnemies((prev) => prev.map((e) =>
                            e.id === matchingEnemy.id
                                ? { ...e, word: newWord, health: 100, spawnTime: now, livesRemaining: matchingEnemy.livesRemaining - 1 }
                                : e
                        ));
                        resetInput();
                        return matchingEnemy;
                    }
                }

                // Asteroid explosion (AoE damage)
                if (matchingEnemy.type === 'asteroid') {
                    const EXPLOSION_RADIUS = 280;

                    let killedEnemyIds: number[] = [];
                    let totalKills = 0;

                    setEnemies((prev) => {
                        const currentAsteroid = prev.find(e => e.id === matchingEnemy.id);
                        if (!currentAsteroid) return prev;

                        const asteroidX = currentAsteroid.left;
                        const asteroidY = currentAsteroid.position;

                        const enemiesInRadius = prev.filter((e) => {
                            if (e.id === matchingEnemy.id || e.type === 'asteroid' || e.dying) return false;

                            const enemyX = e.left;
                            const enemyY = e.position;

                            const dx = (enemyX - asteroidX) * window.innerWidth / 100;
                            const dy = enemyY - asteroidY;
                            const distance = Math.sqrt(dx * dx + dy * dy);

                            return distance <= EXPLOSION_RADIUS;
                        });

                        killedEnemyIds = enemiesInRadius.map(e => e.id);
                        totalKills = enemiesInRadius.length;

                        return prev.map((e) => {
                            if (e.id === matchingEnemy.id) {
                                return { ...e, exploding: true };
                            }
                            if (killedEnemyIds.includes(e.id)) {
                                return { ...e, dying: true };
                            }
                            return e;
                        });
                    });

                    if (totalKills > 0) {
                        setTimeout(() => {
                            setEnemies((prev) => {
                                const updated = prev.filter((e) => !killedEnemyIds.includes(e.id));
                                if (isWaveMode && waveCallbacksRef.current) {
                                    setTimeout(() => waveCallbacksRef.current?.checkIfWaveComplete(updated.length), 0);
                                }
                                return updated;
                            });
                        }, 800);

                        const basePointsPerKill = 100;
                        const multiplier = 2;
                        const totalPoints = Math.round(totalKills * basePointsPerKill * multiplier * scoreMultiplier);

                        setTimeout(() => onScoreUpdate(totalPoints), 0);
                        enemyKillCountRef.current += totalKills;
                    }

                    setTimeout(() => {
                        setEnemies((prev) => {
                            const updated = prev.filter((e) => e.id !== matchingEnemy.id);
                            if (isWaveMode && waveCallbacksRef.current) {
                                setTimeout(() => waveCallbacksRef.current?.checkIfWaveComplete(updated.length), 0);
                            }
                            return updated;
                        });
                    }, 600);

                    resetInput();
                    return matchingEnemy;
                }

                // Normal enemy destruction
                const now = Date.now();
                const elapsedSec = (now - matchingEnemy.spawnTime) / 1000;
                const chars = matchingEnemy.word.length;
                const wpm = Math.round((chars * 60) / (5 * elapsedSec));

                // Points per enemy type
                const basePoints = matchingEnemy.type === 'scout'
                    ? 100
                    : matchingEnemy.type === 'cruiser'
                        ? 300
                        : matchingEnemy.type === 'drone'
                            ? 500
                            : matchingEnemy.type === 'mothership'
                                ? 1000
                                : matchingEnemy.type === 'mech'
                                    ? 400
                                    : matchingEnemy.type === 'interceptor'
                                        ? 500
                                        : matchingEnemy.type === 'dreadnought'
                                            ? 1500
                                            : 0;
                const points = Math.round((basePoints + wpm) * scoreMultiplier);

                setEnemies((prev) => prev.map((e) =>
                    e.id === matchingEnemy.id ? { ...e, dying: true } : e
                ));

                setTimeout(() => {
                    setEnemies((prev) => {
                        const updated = prev.filter((e) => e.id !== matchingEnemy.id);
                        if (isWaveMode && waveCallbacksRef.current) {
                            setTimeout(() => waveCallbacksRef.current?.checkIfWaveComplete(updated.length), 0);
                        }
                        return updated;
                    });
                }, 800);

                enemyKillCountRef.current += 1;
                setTimeout(() => onScoreUpdate(points), 0);
                if (onWpmUpdate) setTimeout(() => onWpmUpdate(wpm), 0);
                resetInput();
                return matchingEnemy;
            }
        }
    };

    // Spawn remote enemy (for PVP)
    const spawnRemote = (word: string, type: EnemyTypeName) => {
        enemyIdCounterRef.current += 1;
        const enemyId = enemyIdCounterRef.current;
        const now = Date.now();
        const left = 10 + Math.random() * 80;
        const speed = type === 'scout' ? 1
            : type === 'cruiser' ? 2
                : type === 'drone' ? 4
                    : type === 'mothership' ? 1.5
                        : type === 'mech' ? 2
                            : type === 'interceptor' ? 3
                                : type === 'dreadnought' ? 2
                                    : 0;

        const position = type === 'asteroid'
            ? Math.random() * (window.innerHeight * 0.7)
            : 0;

        const newEnemy: any = {
            id: enemyId,
            word,
            position,
            left,
            health: 100,
            spawnTime: now,
            type,
            speed,
            remote: true,
        };
        if (type === 'mothership') {
            newEnemy.livesRemaining = 2;
        }
        if (type === 'dreadnought') {
            newEnemy.livesRemaining = 3;
        }
        if (type === 'asteroid') {
            newEnemy.expiryTime = now + 4000;
            newEnemy.exploding = false;
        }
        setEnemies((prev) => [
            ...prev,
            newEnemy,
        ]);
    };

    const clearAllEnemies = useCallback(() => {
        setEnemies([]);
        resetUsedWords();
    }, []);

    return { enemies, handleEnemyHit, spawnRemote, clearAllEnemies };
};

export default useEnemies;
