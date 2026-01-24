import React, { useEffect } from 'react';
import { usePrivyWallet } from '../../hooks/usePrivyWallet';
import { styles } from './GameOver.styles';

interface GameOverProps {
  score: number;
  wpm: number;
  goldEarned?: number;
  kills?: number;
  missCount?: number;
  typoCount?: number;
  waveReached?: number;
  duration?: number;
  wordsTyped?: number;
  onRestart: () => void;
  onAchievementsChecked?: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ 
  score, 
  wpm, 
  goldEarned = 0, 
  kills = 0,
  missCount = 0,
  typoCount = 0,
  waveReached = 1,
  duration = 0,
  wordsTyped = 0,
  onRestart,
  onAchievementsChecked
}) => {
  const { address } = usePrivyWallet();

  // Save score to database on mount
  useEffect(() => {
    const saveScore = async () => {
      if (!address) {
        console.warn('[GameOver] No wallet address, skipping score save');
        return;
      }
      
      try {
        console.log('[GameOver] Saving score to database', {
          score,
          wpm,
          kills,
          goldEarned,
          waveReached,
        });

        const response = await fetch('/api/score/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: address,
            score,
            waveReached,
            wpm,
            kills,
            gameMode: 'story',
            goldEarned,
            misses: missCount,
            typos: typoCount,
            duration,
            wordsTyped: wordsTyped || kills,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('[GameOver] Failed to save score:', error);
        } else {
          const result = await response.json();
          console.log('[GameOver] Score saved successfully', result);
          
          // Check for achievements after successful score save
          if (onAchievementsChecked) {
            onAchievementsChecked();
          }
        }
      } catch (error) {
        console.error('[GameOver] Error saving score:', error);
      }
    };
    
    saveScore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
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
