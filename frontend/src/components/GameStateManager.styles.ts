import { CSSProperties } from 'react';
import { FONTS, COLORS, SHADOWS, BACKGROUND_STYLES } from '../styles/theme';

/**
 * GameStateManager Styles - Cosmic Arcade Theme
 */

export const styles = {
  gameContainer: (screenEffect: boolean): CSSProperties => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    animation: screenEffect ? 'shake 0.2s' : 'none',
    ...BACKGROUND_STYLES.gameBackground(),
  }),

  screenEffectOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 68, 68, 0.3)',
    pointerEvents: 'none',
    zIndex: 3000,
  } as CSSProperties,

  fullScreenOverlay: (): CSSProperties => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    ...BACKGROUND_STYLES.startScreenBackground,
    zIndex: 1002,
    pointerEvents: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }),

  closeButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 16px',
    fontSize: '12px',
    fontFamily: FONTS.primary,
    color: COLORS.primary,
    background: COLORS.glassBg,
    border: `2px solid ${COLORS.primary}`,
    borderRadius: '4px',
    outline: 'none',
    cursor: 'pointer',
    zIndex: 1003,
    transition: 'all 0.3s ease',
    boxShadow: SHADOWS.boxGlow,
  } as CSSProperties,

  startScreenContainer: (): CSSProperties => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    ...BACKGROUND_STYLES.startScreenBackground,
    zIndex: 1001,
  }),

  monadBranding: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: COLORS.gray,
    textAlign: 'center',
    opacity: 0.7,
  } as CSSProperties,

  monadBrandingText: {
    fontSize: '11px',
    fontFamily: FONTS.mono,
    letterSpacing: '1px',
  } as CSSProperties,

  monadLogo: {
    width: '100px',
    height: 'auto',
    marginTop: '6px',
    filter: 'brightness(0.9)',
  } as CSSProperties,

  canonsImage: {
    position: 'fixed',
    left: 0,
    bottom: 0,
    width: '100%',
    height: 'auto',
    zIndex: 1001,
    pointerEvents: 'none',
    imageRendering: 'pixelated',
    transform: 'translateY(100%)',
    animation: 'riseCanons 2s ease-out forwards',
  } as CSSProperties,

  pvpGameOverContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundImage: 'url("/images/gameover.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: FONTS.primary,
    color: COLORS.primary,
    textAlign: 'center',
    zIndex: 4000,
  } as CSSProperties,

  gameOverTitle: {
    fontSize: '48px',
    margin: '20px',
    textShadow: SHADOWS.textNeonStrong,
    letterSpacing: '4px',
  } as CSSProperties,

  gameOverScore: {
    fontSize: '24px',
    margin: '10px',
    textShadow: SHADOWS.textNeon,
  } as CSSProperties,

  gameOverWaiting: {
    fontSize: '20px',
    margin: '10px',
    color: COLORS.gray,
    fontFamily: FONTS.mono,
    opacity: 0.8,
  } as CSSProperties,

  rematchButton: {
    fontFamily: FONTS.primary,
    fontSize: '18px',
    color: COLORS.primary,
    background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.25) 0%, rgba(109, 40, 217, 0.25) 100%)',
    border: `2px solid ${COLORS.primary}`,
    borderRadius: '6px',
    padding: '14px 28px',
    cursor: 'pointer',
    outline: 'none',
    marginTop: '20px',
    transition: 'all 0.3s ease',
    boxShadow: SHADOWS.boxGlow,
    letterSpacing: '1px',
  } as CSSProperties,

  backButton: {
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: COLORS.secondary,
    background: 'transparent',
    border: `1px solid ${COLORS.secondary}`,
    borderRadius: '4px',
    padding: '10px 20px',
    cursor: 'pointer',
    outline: 'none',
    marginTop: '12px',
    transition: 'all 0.3s ease',
    opacity: 0.8,
  } as CSSProperties,

  pvpScreenContainer: (): CSSProperties => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    ...BACKGROUND_STYLES.startScreenBackground,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1002,
  }),

  brandingContainer: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 1002,
    pointerEvents: 'none',
  } as CSSProperties,
} as const;
