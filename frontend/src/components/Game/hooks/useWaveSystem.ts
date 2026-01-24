import { useState, useEffect, useRef, useCallback } from 'react';

export type WaveState = 'preparing' | 'active' | 'complete' | 'betweenWaves';

interface WaveConfig {
    waveNumber: number;
    totalEnemies: number;
    enemyTypes: {
        scout: boolean;
        cruiser: boolean;
        drone: boolean;
        mothership: boolean;
        asteroid: boolean;
        mech: boolean;
        interceptor: boolean;
        dreadnought: boolean;
    };
    isSurvival: boolean;
    survivalDuration?: number;
    mothershipCount?: number;
    dreadnoughtCount?: number;
}

const WAVE_CONFIGS: WaveConfig[] = [
    {
        waveNumber: 1,
        totalEnemies: 30,
        enemyTypes: { scout: true, cruiser: false, drone: false, mothership: false, asteroid: false, mech: false, interceptor: false, dreadnought: false },
        isSurvival: false,
    },
    {
        waveNumber: 2,
        totalEnemies: 50,
        enemyTypes: { scout: false, cruiser: true, drone: false, mothership: false, asteroid: false, mech: false, interceptor: false, dreadnought: false },
        isSurvival: false,
    },
    {
        waveNumber: 3,
        totalEnemies: Infinity,
        enemyTypes: { scout: true, cruiser: true, drone: false, mothership: false, asteroid: true, mech: false, interceptor: false, dreadnought: false },
        isSurvival: true,
        survivalDuration: 45,
    },
    {
        waveNumber: 4,
        totalEnemies: 80,
        enemyTypes: { scout: false, cruiser: false, drone: false, mothership: false, asteroid: false, mech: true, interceptor: false, dreadnought: false },
        isSurvival: false,
    },
    {
        waveNumber: 5,
        totalEnemies: 90,
        enemyTypes: { scout: false, cruiser: false, drone: false, mothership: false, asteroid: false, mech: false, interceptor: true, dreadnought: false },
        isSurvival: false,
    },
    {
        waveNumber: 6,
        totalEnemies: Infinity,
        enemyTypes: { scout: false, cruiser: false, drone: false, mothership: false, asteroid: false, mech: true, interceptor: true, dreadnought: false },
        isSurvival: true,
        survivalDuration: 45,
    },
    {
        waveNumber: 7,
        totalEnemies: 100,
        enemyTypes: { scout: false, cruiser: false, drone: true, mothership: false, asteroid: false, mech: false, interceptor: false, dreadnought: false },
        isSurvival: false,
    },
    {
        waveNumber: 8,
        totalEnemies: 90,
        enemyTypes: { scout: false, cruiser: false, drone: false, mothership: true, asteroid: false, mech: false, interceptor: false, dreadnought: false },
        isSurvival: false,
    },
    {
        waveNumber: 9,
        totalEnemies: Infinity,
        enemyTypes: { scout: false, cruiser: false, drone: true, mothership: true, asteroid: true, mech: false, interceptor: false, dreadnought: true },
        isSurvival: true,
        survivalDuration: 60,
    },
];

// Staked mode uses a custom endless survival configuration
const STAKED_SURVIVAL_CONFIG: WaveConfig = {
    waveNumber: 1,
    totalEnemies: Infinity,
    enemyTypes: { scout: true, cruiser: true, drone: true, mothership: false, asteroid: true, mech: false, interceptor: false, dreadnought: false },
    isSurvival: true,
    survivalDuration: 60, // 1 minute time limit
};

const useWaveSystem = (restartSignal: boolean, pvpMode: boolean, gameMode: 'story' | 'timeAttack' | 'pvp' | 'staked' | 'duel' = 'story') => {
    const initialWave = gameMode === 'timeAttack' ? 9 : 1;
    const [currentWave, setCurrentWave] = useState(initialWave);
    const [waveState, setWaveState] = useState<WaveState>('preparing');
    const [enemiesSpawned, setEnemiesSpawned] = useState(0);
    const [survivalTimeLeft, setSurvivalTimeLeft] = useState(0);
    const [mothershipSpawned, setMothershipSpawned] = useState(0);

    const survivalTimerRef = useRef<NodeJS.Timeout | null>(null);
    const survivalTimeLeftRef = useRef(0);
    const isCompletingWaveRef = useRef(false);

    const getCurrentWaveConfig = (): WaveConfig | null => {
        // Staked mode uses custom endless survival config
        if (gameMode === 'staked') return STAKED_SURVIVAL_CONFIG;
        if (pvpMode) return WAVE_CONFIGS[5];
        return WAVE_CONFIGS[currentWave - 1] || null;
    };

    useEffect(() => {
        if (pvpMode) return;
        setCurrentWave(gameMode === 'timeAttack' ? 9 : 1);
        setWaveState('preparing');
        setEnemiesSpawned(0);
        setMothershipSpawned(0);
        isCompletingWaveRef.current = false;
    }, [restartSignal, pvpMode, gameMode]);

    const startWave = useCallback(() => {
        if (pvpMode) return;
        const config = getCurrentWaveConfig();
        if (!config) return;

        console.log('🚀 Starting wave:', currentWave);
        isCompletingWaveRef.current = false;
        setWaveState('active');
        setEnemiesSpawned(0);
        setMothershipSpawned(0);

        if (config.isSurvival && config.survivalDuration) {
            survivalTimeLeftRef.current = config.survivalDuration;
            setSurvivalTimeLeft(config.survivalDuration);
            survivalTimerRef.current = setInterval(() => {
                setSurvivalTimeLeft((prev) => {
                    const newValue = prev - 1;
                    survivalTimeLeftRef.current = newValue;
                    if (newValue <= 0) {
                        if (survivalTimerRef.current) {
                            clearInterval(survivalTimerRef.current);
                            survivalTimerRef.current = null;
                        }
                        setTimeout(() => {
                            completeWave();
                        }, 100);
                        return 0;
                    }
                    return newValue;
                });
            }, 1000);
        }
    }, [currentWave, pvpMode]);

    const completeWave = useCallback(() => {
        if (isCompletingWaveRef.current) {
            return;
        }

        isCompletingWaveRef.current = true;
        setWaveState('betweenWaves');

        if (survivalTimerRef.current) {
            clearInterval(survivalTimerRef.current);
            survivalTimerRef.current = null;
        }

        setTimeout(() => {
            if (currentWave < WAVE_CONFIGS.length) {
                setCurrentWave((prev) => prev + 1);
                setWaveState('preparing');
            } else {
                setWaveState('complete');
            }
        }, 3000);
    }, [currentWave]);

    const canSpawnMore = useCallback((): boolean => {
        const config = getCurrentWaveConfig();
        if (!config) return false;

        if (config.isSurvival) {
            const canSpawn = pvpMode || survivalTimeLeftRef.current > 0;
            console.log('⏰ Survival spawn check - timeLeft:', survivalTimeLeftRef.current, 'canSpawn:', canSpawn);
            return canSpawn;
        }

        const canSpawn = enemiesSpawned < config.totalEnemies;
        if (!canSpawn) {
            console.log('🛑 Spawn limit reached:', enemiesSpawned, '/', config.totalEnemies);
        }
        return canSpawn;
    }, [pvpMode, currentWave, enemiesSpawned]);

    const notifyEnemySpawned = useCallback(() => {
        setEnemiesSpawned(prev => {
            const newCount = prev + 1;
            console.log('🛸 Enemy spawned. Total spawned:', newCount);
            return newCount;
        });
    }, []);

    const notifyDeathriderSpawned = useCallback(() => {
        setMothershipSpawned(prev => prev + 1);
    }, []);

    const checkIfWaveComplete = useCallback((enemiesOnScreen: number) => {
        if (pvpMode || waveState !== 'active') return;

        const config = getCurrentWaveConfig();
        if (!config || config.isSurvival) return;

        console.log('🔍 Wave completion check:', {
            enemiesSpawned,
            totalEnemies: config.totalEnemies,
            enemiesOnScreen,
            shouldComplete: enemiesSpawned >= config.totalEnemies && enemiesOnScreen === 0
        });

        if (enemiesSpawned >= config.totalEnemies && enemiesOnScreen === 0) {
            console.log('✅ All enemies cleared!');
            completeWave();
        }
    }, [pvpMode, waveState, currentWave, enemiesSpawned, completeWave]);

    const getEnemyType = useCallback((): 'scout' | 'cruiser' | 'drone' | 'mothership' | 'asteroid' | 'mech' | 'interceptor' | 'dreadnought' => {
        const config = getCurrentWaveConfig();
        if (!config) return 'scout';

        // Wave 3: asteroid storm with scouts and cruisers
        if (currentWave === 3) {
            const rand = Math.random();
            if (rand < 0.05 && enemiesSpawned >= 5) return 'asteroid';
            if (rand < 0.525) return 'scout';
            return 'cruiser';
        }

        // Mothership spawn logic
        if (config.enemyTypes.mothership) {
            if (config.isSurvival) {
                if (Math.random() < 0.10) {
                    return 'mothership';
                }
            } else if (config.mothershipCount !== undefined) {
                if (mothershipSpawned < config.mothershipCount && Math.random() < 0.05) {
                    return 'mothership';
                }
            }
        }

        const availableTypes: Array<'scout' | 'cruiser' | 'drone' | 'asteroid' | 'mech' | 'interceptor' | 'dreadnought'> = [];
        if (config.enemyTypes.scout) availableTypes.push('scout');
        if (config.enemyTypes.cruiser) availableTypes.push('cruiser');
        if (config.enemyTypes.drone) availableTypes.push('drone');
        if (config.enemyTypes.asteroid && enemiesSpawned >= 5) availableTypes.push('asteroid');
        if (config.enemyTypes.mech) availableTypes.push('mech');
        if (config.enemyTypes.interceptor) availableTypes.push('interceptor');
        if (config.enemyTypes.dreadnought) availableTypes.push('dreadnought');

        if (availableTypes.length === 0) return 'scout';
        return availableTypes[Math.floor(Math.random() * availableTypes.length)];
    }, [currentWave, enemiesSpawned, mothershipSpawned]);

    const getSpawnDelay = useCallback((): number => {
        const config = getCurrentWaveConfig();
        if (config?.isSurvival && config.survivalDuration) {
            const progress = 1 - (survivalTimeLeftRef.current / config.survivalDuration);
            // For staked mode, start faster and get even faster
            const baseDelay = gameMode === 'staked' ? 1200 : 1500;
            const minDelay = gameMode === 'staked' ? 200 : 300;
            return (baseDelay - (baseDelay - minDelay) * progress) * Math.random() + 150;
        }
        return Math.random() * 1500 + 500;
    }, [currentWave, gameMode]);

    useEffect(() => {
        return () => {
            if (survivalTimerRef.current) clearInterval(survivalTimerRef.current);
        };
    }, []);

    return {
        currentWave,
        waveState,
        enemiesSpawned,
        survivalTimeLeft,
        waveConfig: getCurrentWaveConfig(),
        startWave,
        canSpawnMore,
        notifyEnemySpawned,
        notifyDeathriderSpawned,
        checkIfWaveComplete,
        getEnemyType,
        getSpawnDelay,
        isWaveMode: !pvpMode,
    };
};

export default useWaveSystem;
