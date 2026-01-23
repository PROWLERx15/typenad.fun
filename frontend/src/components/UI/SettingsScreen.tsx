import React, { useRef, useEffect } from 'react';
import { useSoundSettings } from '../../hooks/useSoundSettings';
import { BUTTON_STYLES, SCREEN_STYLES, mergeStyles, BACKGROUND_STYLES } from '../../styles/theme';
import styles from './SettingsScreen.module.css';

interface SettingsScreenProps {
  onClose: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const { sfxMuted, musicMuted, sfxVolume, musicVolume, toggleSfx, toggleMusic, setSfxVolume, setMusicVolume } = useSoundSettings();
  const gunSoundRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape, true);
    return () => {
      document.removeEventListener('keydown', handleEscape, true);
    };
  }, [onClose]);

  useEffect(() => {
    if (gunSoundRef.current) {
      gunSoundRef.current.volume = sfxVolume;
    }
  }, [sfxVolume]);


  const handleSfxVolumeChange = (value: number) => {
    const newVolume = value / 100;
    setSfxVolume(newVolume);
  };

  const handleMusicVolumeChange = (value: number) => {
    const newVolume = value / 100;
    setMusicVolume(newVolume);
  };

  const handleTestSfx = () => {
    if (!sfxMuted && gunSoundRef.current) {
      gunSoundRef.current.currentTime = 0;
      gunSoundRef.current.play().catch(() => {});
    }
  };

  return (
    <div style={mergeStyles(
      SCREEN_STYLES.fullScreen,
      SCREEN_STYLES.centered,
      SCREEN_STYLES.backgroundCover,
      BACKGROUND_STYLES.startScreenBackground
    )} className={styles.overlayContainer}>
      <audio ref={gunSoundRef} src="/sounds/gunshot.mp3" preload="auto" />

      <button
        onClick={onClose}
        style={BUTTON_STYLES.small}
        className={styles.closeButton}
      >
        Close
      </button>

      <div className={styles.contentContainer}>
        <h1 className={styles.title}>Settings</h1>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Sound Effects</h2>

          <div className={styles.controlRow}>
            <label className={styles.label}>
              <input
                type="checkbox"
                checked={!sfxMuted}
                onChange={toggleSfx}
                className={styles.checkbox}
              />
              <span className={styles.checkboxLabel}>Enable SFX</span>
            </label>
          </div>

          <div className={styles.controlRow}>
            <label className={styles.label}>
              Volume: {Math.round(sfxVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={sfxVolume * 100}
              onChange={(e) => handleSfxVolumeChange(parseInt(e.target.value))}
              className={styles.slider}
              disabled={sfxMuted}
            />
            <button
              onClick={handleTestSfx}
              className={styles.testButton}
              disabled={sfxMuted}
            >
              Test SFX
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Music</h2>

          <div className={styles.controlRow}>
            <label className={styles.label}>
              <input
                type="checkbox"
                checked={!musicMuted}
                onChange={toggleMusic}
                className={styles.checkbox}
              />
              <span className={styles.checkboxLabel}>Enable Music</span>
            </label>
          </div>

          <div className={styles.controlRow}>
            <label className={styles.label}>
              Volume: {Math.round(musicVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={musicVolume * 100}
              onChange={(e) => handleMusicVolumeChange(parseInt(e.target.value))}
              className={styles.slider}
              disabled={musicMuted}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
