'use client';

import React, { useState, useEffect } from 'react';
import styles from './PVPModeScreen.module.css';

interface PVPModeScreenProps {
  chainId: string;
  onClose: () => void;
  incomingMessage: string;
  incomingType: number;
  onStart: (friendChainId: string) => void;
  lastUsedFriendChainId?: string;
  onClearMessages?: () => void;
}

const PVPModeScreen: React.FC<PVPModeScreenProps> = ({ chainId, onClose, incomingMessage, incomingType, onStart, lastUsedFriendChainId, onClearMessages }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape, true);
    return () => document.removeEventListener('keydown', handleEscape, true);
  }, [onClose]);

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <button onClick={onClose} className={styles.closeButton}>Back</button>

        <h1 className={styles.title}>PVP Mode</h1>

        <p className={styles.description}>
          Multiplayer PVP mode is coming soon with Monad integration!
        </p>

        <p className={styles.opponentNote}>
          Challenge your friends to see who can type faster.
        </p>

        <div className={styles.buttonGroup}>
          <button onClick={onClose} className={styles.button}>
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default PVPModeScreen;
