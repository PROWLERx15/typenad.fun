import React from 'react';
import styles from './MultiplayerModeScreen.module.css';

interface MultiplayerModeScreenProps {
  onVersus: () => void;
  onBack: () => void;
}

const MultiplayerModeScreen: React.FC<MultiplayerModeScreenProps> = ({ onVersus, onBack }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <h1 className={styles.title}>Multiplayer Mode</h1>
        <p className={styles.description}>
          Challenge other players
        </p>

        <div className={styles.modesContainer}>
          <div className={styles.modeCard}>
            <h2 className={styles.modeTitle}>Versus</h2>
            <p className={styles.modeDescription}>
              Compete against other players.<br />
              Highest score wins!
            </p>
            <button onClick={onVersus} className={styles.modeButton}>
              Start Versus
            </button>
          </div>
        </div>

        <button onClick={onBack} className={styles.backButton}>
          Back
        </button>
      </div>
    </div>
  );
};

export default MultiplayerModeScreen;
