'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SoundSettings {
  sfxMuted: boolean;
  musicMuted: boolean;
  sfxVolume: number;
  musicVolume: number;
  toggleSfx: () => void;
  toggleMusic: () => void;
  setSfxVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
}

const SoundSettingsContext = createContext<SoundSettings | undefined>(undefined);

export const SoundSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sfxMuted, setSfxMuted] = useState<boolean>(false);
  const [musicMuted, setMusicMuted] = useState<boolean>(false);
  const [sfxVolume, setSfxVolumeState] = useState<number>(0.3);
  const [musicVolume, setMusicVolumeState] = useState<number>(0.5);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSfxMuted = localStorage.getItem('typenad_sfx_muted');
      const savedMusicMuted = localStorage.getItem('typenad_music_muted');
      const savedSfxVolume = localStorage.getItem('typenad_sfx_volume');
      const savedMusicVolume = localStorage.getItem('typenad_music_volume');

      if (savedSfxMuted) setSfxMuted(savedSfxMuted === 'true');
      if (savedMusicMuted) setMusicMuted(savedMusicMuted === 'true');
      if (savedSfxVolume) setSfxVolumeState(parseFloat(savedSfxVolume));
      if (savedMusicVolume) setMusicVolumeState(parseFloat(savedMusicVolume));

      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when values change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('typenad_sfx_muted', sfxMuted.toString());
    }
  }, [sfxMuted, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('typenad_music_muted', musicMuted.toString());
    }
  }, [musicMuted, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('typenad_sfx_volume', sfxVolume.toString());
    }
  }, [sfxVolume, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('typenad_music_volume', musicVolume.toString());
    }
  }, [musicVolume, isLoaded]);

  const toggleSfx = () => setSfxMuted(prev => !prev);
  const toggleMusic = () => setMusicMuted(prev => !prev);

  const setSfxVolume = (volume: number) => setSfxVolumeState(Math.max(0, Math.min(1, volume)));
  const setMusicVolume = (volume: number) => setMusicVolumeState(Math.max(0, Math.min(1, volume)));

  return (
    <SoundSettingsContext.Provider value={{ sfxMuted, musicMuted, sfxVolume, musicVolume, toggleSfx, toggleMusic, setSfxVolume, setMusicVolume }}>
      {children}
    </SoundSettingsContext.Provider>
  );
};

export const useSoundSettings = (): SoundSettings => {
  const context = useContext(SoundSettingsContext);
  if (!context) {
    throw new Error('useSoundSettings must be used within a SoundSettingsProvider');
  }
  return context;
};
