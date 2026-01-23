import { CSSProperties } from 'react';
import { BACKGROUNDS, FONTS, COLORS } from '../../styles/theme';

export const styles = {
  overlayContainer: {
    background: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7))',
    zIndex: 1000,
  } as CSSProperties,

  cardContainer: {
    textAlign: 'center',
    padding: '50px',
    background: 'rgba(0,0,0,0.9)',
    border: '4px solid rgba(139,92,246,0.6)',
    borderRadius: '8px',
    maxWidth: '600px',
  } as CSSProperties,

  title: {
    fontFamily: FONTS.primary,
    fontSize: '32px',
    color: COLORS.primary,
    marginBottom: '20px',
    textShadow: '2px 4px 8px #000',
  } as CSSProperties,

  description: {
    fontFamily: FONTS.primary,
    fontSize: '16px',
    color: COLORS.white,
    marginTop: '20px',
    marginBottom: '30px',
    lineHeight: '1.8',
    opacity: 0.9,
  } as CSSProperties,

  button: {
    background: 'rgba(139,92,246,0.2)',
    border: '2px solid rgba(139,92,246,0.5)',
    color: COLORS.primary,
    fontFamily: FONTS.primary,
    fontSize: '16px',
    lineHeight: '16px',
    padding: '12px 24px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as CSSProperties,
} as const;
