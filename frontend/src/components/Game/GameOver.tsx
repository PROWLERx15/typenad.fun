import React from 'react';
import { styles } from './GameOver.styles';

interface GameOverProps {
  score: number;
  wpm: number;
  goldEarned?: number;
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, wpm, goldEarned = 0, onRestart }) => {
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`}</style>
      <div style={styles.container}>
        <h1 style={styles.title}>Game Over</h1>
        <p style={styles.statText}>Score: {score}</p>
        <p style={styles.statText}>WPM: {wpm}</p>
        <p style={styles.goldText}>Gold Earned: {goldEarned}</p>
        <button onClick={onRestart} style={styles.button}>
          Try Again
        </button>
      </div>
    </>
  );
};

export default GameOver;
