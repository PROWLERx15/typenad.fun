import React, { useEffect, useRef } from 'react';
import { useSoundSettings } from '../../hooks/useSoundSettings';

interface SoundManagerProps {
  gameState: 'start' | 'playing' | 'gameOver' | 'pvp' | 'leaderboard' | 'crypt' | 'settings' | 'solo' | 'multiplayer' | 'shop' | 'achievements' | 'profile';
}

const SoundManager: React.FC<SoundManagerProps> = ({ gameState }) => {
  const { musicMuted, musicVolume } = useSoundSettings();
  const startRef = useRef<HTMLAudioElement>(null);
  const inGame1Ref = useRef<HTMLAudioElement>(null);
  const inGame2Ref = useRef<HTMLAudioElement>(null);
  const endRef = useRef<HTMLAudioElement>(null);
  const currentTrackRef = useRef<string>('');

  useEffect(() => {
    const allRefs = [startRef, inGame1Ref, inGame2Ref, endRef];
    allRefs.forEach(ref => {
      if (ref.current) {
        ref.current.volume = musicVolume;
      }
    });
  }, [musicVolume]);

  useEffect(() => {
    const allRefs = [startRef, inGame1Ref, inGame2Ref, endRef];

    if (musicMuted) {
      allRefs.forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0;
        }
      });
      currentTrackRef.current = '';
      return;
    }

    let desiredTrack = '';
    let trackToPlay: HTMLAudioElement | null = null;

    if (gameState === 'start' || gameState === 'pvp' || gameState === 'leaderboard' || gameState === 'crypt' || gameState === 'settings' || gameState === 'solo' || gameState === 'multiplayer' || gameState === 'shop' || gameState === 'achievements' || gameState === 'profile') {
      desiredTrack = 'start';
      trackToPlay = startRef.current;
    } else if (gameState === 'playing') {
      desiredTrack = 'game';
      trackToPlay = inGame1Ref.current;
    } else if (gameState === 'gameOver') {
      desiredTrack = 'end';
      trackToPlay = endRef.current;
    }

    if (desiredTrack === currentTrackRef.current && trackToPlay && !trackToPlay.paused) {
      return;
    }

    allRefs.forEach(ref => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });

    if (trackToPlay) {
      currentTrackRef.current = desiredTrack;
      trackToPlay.loop = true;
      trackToPlay.play().catch(() => { });
    }
  }, [musicMuted, gameState]);

  return (
    <>
      <audio ref={startRef} src="/sounds/start.mp3" preload="auto" />
      <audio ref={inGame1Ref} src="/sounds/game-1.mp3" preload="auto" />
      <audio ref={inGame2Ref} src="/sounds/game-2.mp3" preload="auto" />
      <audio ref={endRef} src="/sounds/end.mp3" preload="auto" />
    </>
  );
};

export default SoundManager;
