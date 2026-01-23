import { CSSProperties } from 'react';
import { BACKGROUNDS, FONTS, COLORS } from '../../styles/theme';

export const styles = {
  overlayContainer: {
    background: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7))',
    zIndex: 1000,
  } as CSSProperties,

  cardContainer: {
    textAlign: 'center',
    padding: '40px',
    background: 'rgba(0,0,0,0.8)',
    border: '4px solid rgba(139,92,246,0.6)',
    borderRadius: '8px',
    maxWidth: '500px',
  } as CSSProperties,

  title: {
    fontFamily: FONTS.primary,
    fontSize: '32px',
    color: COLORS.primary,
    marginBottom: '20px',
    textShadow: '2px 4px 8px #000',
  } as CSSProperties,

  nextWaveText: {
    fontFamily: FONTS.primary,
    fontSize: '16px',
    color: COLORS.white,
    marginTop: '20px',
    opacity: 0.9,
  } as CSSProperties,
} as const;
