import React from 'react';
import styles from './SoloModeScreen.module.css';

interface SoloModeScreenProps {
  onStory: () => void;
  onSurvival: () => void;
  onBack: () => void;
}

const SoloModeScreen: React.FC<SoloModeScreenProps> = ({ onStory, onSurvival, onBack }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <h1 className={styles.title}>Single Player Mode</h1>
        <p className={styles.description}>
          Choose your adventure
        </p>

        <div className={styles.modesContainer}>
          <div className={styles.modeCard}>
            <h2 className={styles.modeTitle}>Story</h2>
            <p className={styles.modeDescription}>
              Progress through waves.<br />
              Unlock achievements!
            </p>
            <button onClick={onStory} className={styles.modeButton}>
              Start Story
            </button>
          </div>

          <div className={styles.modeCard}>
            <h2 className={styles.modeTitle}>Survival</h2>
            <p className={styles.modeDescription}>
              Endless zombie waves.<br />
              How long can you last?
            </p>
            <button onClick={onSurvival} className={styles.modeButton}>
              Start Survival
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

export default SoloModeScreen;
