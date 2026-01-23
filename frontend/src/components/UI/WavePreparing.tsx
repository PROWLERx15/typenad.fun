'use client';

import React from 'react';
import { usePrivyWallet } from '../../hooks/usePrivyWallet';
import { COLORS } from '../../styles/theme';
import { styles, keyframes } from './WavePreparing.styles';

interface WavePreparingProps {
    waveNumber: number;
    isSurvival?: boolean;
    survivalTimeLeft?: number;
    onReady: () => void;
    onReturnToStart?: () => void;
    selectedPowerups?: string[];
    ownedPowerups?: string[];
    onPowerupsChange?: (powerups: string[]) => void;
    isFirstWave?: boolean;
}

interface PowerupInfo {
    id: string;
    name: string;
    icon: string;
}

const POWERUPS: PowerupInfo[] = [
    { id: 'double-gold', name: 'Double Credits', icon: '/images/gold-coin.png' },
    { id: 'triple-gold', name: 'Triple Credits', icon: '/images/gold-coin.png' },
    { id: 'double-points', name: 'Double Points', icon: '/images/double-points.png' },
    { id: 'triple-points', name: 'Triple Points', icon: '/images/triple-points.png' },
    { id: 'extra-life', name: 'Extra Shield', icon: '/images/heart.png' },
    { id: 'slow-enemies', name: 'Slow Motion', icon: '/images/slow-enemies.png' },
];

const WAVE_DATA = {
    1: { title: "Sector Alpha", description: "Scout patrol detected. Clear the sector." },
    2: { title: "Cruiser Fleet", description: "Enemy cruisers inbound. Defend the station." },
    3: { title: "Asteroid Storm", description: "Survive the asteroid field for 45 seconds." },
    4: { title: "Mech Invasion", description: "Hostile mechs breaching perimeter." },
    5: { title: "Interceptor Blitz", description: "Fast interceptors incoming. Stay sharp." },
    6: { title: "Maximum Alert", description: "Chaos protocol. Survive 45 seconds." },
    7: { title: "Drone Swarm", description: "Swarm of drones detected. Rapid fire!" },
    8: { title: "Mothership Assault", description: "The mothership has arrived. Final defense." },
    9: { title: "Dreadnought", description: "Face the Dreadnought. Survive 60 seconds." }
} as const;

const WavePreparing: React.FC<WavePreparingProps> = ({ waveNumber, isSurvival, survivalTimeLeft, onReady, onReturnToStart, selectedPowerups = [], ownedPowerups = [], onPowerupsChange, isFirstWave = false }) => {
    const { address } = usePrivyWallet();
    const [isAnimating, setIsAnimating] = React.useState(false);
    const [hasStarted, setHasStarted] = React.useState(false);
    const [showExitConfirm, setShowExitConfirm] = React.useState(false);
    const onReadyRef = React.useRef(onReady);

    React.useEffect(() => {
        onReadyRef.current = onReady;
    }, [onReady]);

    React.useEffect(() => {
        setIsAnimating(false);
        setHasStarted(false);
    }, [waveNumber]);

    const handleFightClick = async () => {
        // Note: Powerup consumption is now handled in GameStateManager._startGame()
        // via consumeEquippedPowerups() which properly manages inventory quantities

        setHasStarted(true);
        setIsAnimating(true);

        setTimeout(() => {
            onReadyRef.current();
        }, 500);
    };

    React.useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'Enter' && !isAnimating && !hasStarted) {
                handleFightClick();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isAnimating, hasStarted]);

    const waveInfo = WAVE_DATA[waveNumber as keyof typeof WAVE_DATA];

    return (
        <>
            <style>{keyframes}</style>
            {!isAnimating && <div style={styles.backdrop} />}
            <div style={styles.container(isAnimating, hasStarted)}>
                <div style={styles.card(isAnimating, waveNumber)}>
                    <div style={styles.overlay(isAnimating, waveNumber)} />
                    {!isAnimating && onReturnToStart && !showExitConfirm && (
                        <button
                            onClick={() => setShowExitConfirm(true)}
                            style={styles.exitButton}
                            title="Exit to main menu"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </button>
                    )}
                    <div style={styles.content}>
                        <h1 style={styles.title(isAnimating, isSurvival ?? false)}>
                            {isAnimating ? (
                                isSurvival ? 'SURVIVAL' : `Wave ${waveNumber}`
                            ) : (
                                isSurvival ? 'Survival' : (waveInfo?.title || `Wave ${waveNumber}`)
                            )}
                        </h1>

                        {!isAnimating && waveInfo && (
                            <div style={styles.description(hasStarted)}>
                                {waveInfo.description}
                            </div>
                        )}

                        {!isAnimating && !showExitConfirm && isFirstWave && ownedPowerups && ownedPowerups.length > 0 && (
                            <div style={styles.powerupsSection}>
                                <div style={styles.powerupsTitle}>Use Power-Ups:</div>
                                <div style={styles.powerupsGrid}>
                                    {POWERUPS.filter(p => ownedPowerups.includes(p.id)).map((powerup) => {
                                        const isActive = selectedPowerups.includes(powerup.id);

                                        return (
                                            <div
                                                key={powerup.id}
                                                style={{
                                                    ...styles.powerupCard,
                                                    ...(isActive ? styles.powerupCardActive : styles.powerupCardInactive)
                                                }}
                                                onClick={() => {
                                                    if (onPowerupsChange) {
                                                        if (isActive) {
                                                            onPowerupsChange(selectedPowerups.filter(id => id !== powerup.id));
                                                        } else {
                                                            const CONFLICTING_POWERUPS: Record<string, string[]> = {
                                                                'double-gold': ['triple-gold'],
                                                                'triple-gold': ['double-gold'],
                                                                'double-points': ['triple-points'],
                                                                'triple-points': ['double-points'],
                                                            };
                                                            const conflicts = CONFLICTING_POWERUPS[powerup.id] || [];
                                                            const newPowerups = selectedPowerups.filter(id => !conflicts.includes(id));
                                                            onPowerupsChange([...newPowerups, powerup.id]);
                                                        }
                                                    }
                                                }}
                                            >
                                                <div style={styles.powerupIconContainer}>
                                                    <img src={powerup.icon} alt={powerup.name} style={styles.powerupIcon} />
                                                </div>
                                                <div style={styles.powerupName}>{powerup.name}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {!isAnimating && !showExitConfirm && (
                            <button onClick={handleFightClick} style={styles.startButton}>
                                START
                            </button>
                        )}

                        {showExitConfirm && (
                            <div style={styles.confirmDialog}>
                                <p style={styles.confirmText}>Are you sure you want to exit?</p>
                                <div style={styles.confirmButtons}>
                                    <button
                                        onClick={() => {
                                            setShowExitConfirm(false);
                                            onReturnToStart?.();
                                        }}
                                        style={styles.confirmButton}
                                    >
                                        YES
                                    </button>
                                    <button onClick={() => setShowExitConfirm(false)} style={styles.confirmButton}>
                                        NO
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default WavePreparing;
