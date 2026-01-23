import React, { useState, useEffect, useRef } from 'react';
import styles from './OnboardingScreen.module.css';
import { useSoundSettings } from '../../hooks/useSoundSettings';

interface OnboardingScreenProps {
  onStart: () => void;
  onClose?: () => void;
  disabled?: boolean;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onStart, onClose, disabled }) => {
  const { sfxMuted, sfxVolume } = useSoundSettings();
  const [showNudge, setShowNudge] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const targetWord = 'gmicrochains';
  const completed = inputValue.toLowerCase() === targetWord;
  const gunSoundRef = useRef<HTMLAudioElement | null>(null);
  const prevInputLengthRef = useRef<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => setShowNudge(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const audio = gunSoundRef.current;
    if (audio) {
      audio.load();
      audio.volume = sfxVolume;
    }
  }, [sfxVolume]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setInputValue('');
        prevInputLengthRef.current = 0;
      }
    };

    document.addEventListener('keydown', handleEscape, true);
    return () => document.removeEventListener('keydown', handleEscape, true);
  }, [onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const isTyping = val.length > prevInputLengthRef.current;

    setInputValue(val);
    prevInputLengthRef.current = val.length;

    if (isTyping && !sfxMuted) {
      const audio = gunSoundRef.current;
      if (audio) {
        audio.currentTime = 0;
        void audio.play().catch(() => {});
      }
    }
  };

  const matchedLength = (() => {
    let m = 0;
    for (let i = 0; i < inputValue.length && i < targetWord.length; i++) {
      if (inputValue[i].toLowerCase() === targetWord[i]) m++;
      else break;
    }
    return m;
  })();

  return (
    <div className={styles.onboardingScreen}>
      <h1 className={styles.title}>How to Play</h1>
      <ul className={styles.instructions}>
        <li>Type the word at each zombie to eliminate it.</li>
        <li>Faster typing == higher score.</li>
        <li>You have 3 lives. Zombies reaching your base cost you a life.</li>
        <li>Press ESC to clear the word and start over.</li>
      </ul>
      <p className={styles.tryTyping}>
        Try typing below!
      </p>
      <div className={styles.demoZombie}>
        <div className={styles.healthBar}>
          <div className={styles.healthBarFill} style={{
            width: `${((targetWord.length - matchedLength) / targetWord.length) * 100}%`,
          }} />
        </div>
        <div className={styles.zombieEmoji}>🧟‍♂️</div>
        <div className={styles.wordLabel}>
          {targetWord}
        </div>
      </div>
      <audio ref={gunSoundRef} src="/sounds/gunshot.mp3" preload="auto" />
      <input
        type="text"
        placeholder={targetWord}
        value={inputValue}
        autoFocus
        onChange={handleInputChange}
        className={styles.input}
      />
      {completed && (
        <button
          onClick={() => {
            setInputValue('');
            prevInputLengthRef.current = 0;
          }}
          className={styles.button}
        >
          Reset
        </button>
      )}
    </div>
  );
};

export default OnboardingScreen;
