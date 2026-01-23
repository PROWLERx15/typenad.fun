'use client';

import React from 'react';
import { FONT_IMPORT } from '../../styles/theme';
import { useSoundSettings } from '../../hooks/useSoundSettings';
import { usePrivyWallet, usePrivyDisconnect } from '../../hooks/usePrivyWallet';
import styles from './StartScreen.module.css';

interface StartScreenProps {
    onStart: () => void;
    onTimeAttack: () => void;
    onStory: () => void;
    onHowTo: () => void;
    onSolo: () => void;
    onMultiplayer: () => void;
    onLeaderboard: () => void;
    onShop: () => void;
    onCrypt: () => void;
    onSettings: () => void;
    disabled?: boolean;
    statusText?: string;
    chainId?: string;
    incomingMessage?: string;
    selectedPowerups: string[];
    onPowerupsChange: (powerups: string[]) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onTimeAttack, onStory, onHowTo, onSolo, onMultiplayer, onLeaderboard, onShop, onCrypt, onSettings, disabled, statusText, chainId, incomingMessage, selectedPowerups, onPowerupsChange }) => {
    const { sfxMuted, sfxVolume } = useSoundSettings();
    const { isConnected, address, login, ready, authenticated, walletError, clearWalletError, logout } = usePrivyWallet();
    const { disconnect } = usePrivyDisconnect();
    const mouseOverRef = React.useRef<HTMLAudioElement>(null);

    const isWalletReady = isConnected && address;

    React.useEffect(() => {
        if (mouseOverRef.current) {
            mouseOverRef.current.volume = sfxVolume;
        }
    }, [sfxVolume]);

    const handleMouseEnter = () => {
        const audio = mouseOverRef.current;
        if (audio && !sfxMuted) {
            audio.currentTime = 0;
            audio.play().catch(() => { });
        }
    };
    const handleMouseLeave = () => {
        const audio = mouseOverRef.current;
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    };

    return (
        <>
            <style>{FONT_IMPORT}</style>
            <audio ref={mouseOverRef} src="/sounds/mouse-over.mp3" preload="auto" />
            <div className={styles.container}>
                <div className={styles.topRightButtons}>
                    <button
                        onClick={onLeaderboard}
                        className={styles.topButton}
                    >
                        <img src="/images/leaderboard.png" alt="" className={styles.buttonIcon} />
                        Leaderboard
                    </button>
                    <button
                        onClick={onShop}
                        className={styles.topButton}
                        disabled={!isWalletReady}
                    >
                        <img src="/images/shop.png" alt="" className={styles.buttonIcon} />
                        Shop
                    </button>
                    <button
                        onClick={onCrypt}
                        className={styles.topButton}
                        disabled={!isWalletReady}
                    >
                        <img src="/images/crypt.png" alt="" className={styles.buttonIcon} />
                        Player Hub
                    </button>
                </div>

                <button
                    onClick={onSettings}
                    className={styles.bottomRightButton}
                >
                    <img src="/images/settings.png" alt="" className={styles.buttonIcon} />
                    Settings
                </button>

                <div className={styles.mainContent}>
                    <h1 className={styles.title}>typenad</h1>
                    {!isWalletReady ? (
                        <>
                            <p className={styles.welcomeText}>
                                The Cosmic Typing Arena Awaits.
                            </p>
                            <p className={styles.welcomeTextSecondary}>
                                Ready to type?
                            </p>
                            <div className={styles.modeButtonsContainer}>
                                <button
                                    onClick={login}
                                    className={styles.modeButton}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                >
                                    <img src="/images/google-icon.png" alt="" style={{ width: '20px', height: '20px' }} onError={(e) => e.currentTarget.style.display = 'none'} />
                                    Login with Google to Play
                                </button>
                            </div>
                        </>
                    ) : (authenticated && !address) ? (
                        <div className={styles.loadingContainer}>
                            <p className={styles.welcomeText}>Setting up secure channel...</p>
                            <div className={styles.spinner} />
                            {walletError && (
                                <div style={{
                                    marginTop: '20px',
                                    padding: '15px',
                                    backgroundColor: 'rgba(255, 68, 68, 0.1)',
                                    border: '2px solid #FF4444',
                                    borderRadius: '8px',
                                    maxWidth: '400px'
                                }}>
                                    <p style={{ color: '#FF4444', fontSize: '10px', marginBottom: '15px' }}>
                                        {walletError}
                                    </p>
                                    <button
                                        onClick={() => {
                                            clearWalletError();
                                            logout();
                                        }}
                                        className={styles.modeButton}
                                        style={{ fontSize: '10px', padding: '10px 20px' }}
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className={styles.gameModeLabel}>
                                Game Mode:
                            </div>
                            <div className={styles.modeButtonsContainer}>
                                <button
                                    onClick={onSolo}
                                    disabled={disabled}
                                    onMouseEnter={() => !disabled && handleMouseEnter()}
                                    onMouseLeave={handleMouseLeave}
                                    className={styles.modeButton}
                                >
                                    Single Player
                                </button>
                                <button
                                    onClick={onMultiplayer}
                                    disabled={disabled}
                                    onMouseEnter={() => !disabled && handleMouseEnter()}
                                    onMouseLeave={handleMouseLeave}
                                    className={styles.modeButton}
                                >
                                    Multiplayer
                                </button>
                            </div>
                        </>
                    )}
                    {isWalletReady && (
                        <div className={styles.howToContainer}>
                            <button onClick={onHowTo} className={styles.linkButton}>
                                How to Play
                            </button>

                            {address && (
                                <div className={styles.chainIdContainer}>
                                    Wallet: {address.slice(0, 6)}...{address.slice(-4)}
                                    <br />
                                    <button
                                        onClick={() => disconnect()}
                                        className={styles.walletActionButton}
                                    >
                                        Disconnect Wallet
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {/* Wallet Selection REMOVED */}
        </>
    );
};

export default StartScreen;
