import { CSSProperties } from 'react';
import { BACKGROUND_STYLES, COLORS, SHADOWS, FONTS } from '../../styles/theme';

/**
 * GameCanvas Styles - Cosmic Arcade Theme
 * Deep Space + Monad Purple
 */

export const styles = {
  gameContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: COLORS.spaceBlack,
    zIndex: 100,
  } as CSSProperties,

  shakeContainer: (screenEffect: boolean): CSSProperties => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    animation: screenEffect ? 'shake 0.2s' : 'none',
    transformOrigin: 'top left',
  }),

  screenEffectOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 68, 68, 0.15)',
    pointerEvents: 'none',
    zIndex: 9999,
  } as CSSProperties,

  // ═══════════════════════════════════════════════════════════════════════════════
  // TOP BAR - HUD
  // ═══════════════════════════════════════════════════════════════════════════════

  topBar: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: '20px',
    paddingLeft: '15px',
    paddingRight: '15px',
  } as CSSProperties,

  statsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '12px 16px',
    gap: '8px',
    background: COLORS.glassBg,
    border: `1px solid ${COLORS.glassBorder}`,
    borderRadius: '8px',
    boxShadow: SHADOWS.panelGlow,
  } as CSSProperties,

  highScore: {
    fontFamily: FONTS.primary,
    fontSize: '10px',
    color: COLORS.glow,
    textShadow: SHADOWS.textNeon,
    opacity: 0.8,
    letterSpacing: '1px',
  } as CSSProperties,

  score: (flashScore: boolean): CSSProperties => ({
    fontFamily: FONTS.primary,
    fontSize: '16px',
    color: flashScore ? COLORS.success : COLORS.primary,
    textShadow: flashScore ? SHADOWS.textSuccess : SHADOWS.textNeon,
    transition: 'all 0.3s ease',
    letterSpacing: '1px',
  }),

  wpm: (flashWpm: boolean): CSSProperties => ({
    fontFamily: FONTS.primary,
    fontSize: '12px',
    color: flashWpm ? COLORS.success : COLORS.primary,
    textShadow: flashWpm ? SHADOWS.textSuccess : SHADOWS.textNeon,
    transition: 'all 0.3s ease',
    opacity: 0.85,
    letterSpacing: '1px',
  }),

  // ═══════════════════════════════════════════════════════════════════════════════
  // RIGHT CONTAINER
  // ═══════════════════════════════════════════════════════════════════════════════

  rightContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '10px',
    padding: '12px 16px',
    background: COLORS.glassBg,
    border: `1px solid ${COLORS.glassBorder}`,
    borderRadius: '8px',
    boxShadow: SHADOWS.panelGlow,
  } as CSSProperties,

  goldContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } as CSSProperties,

  goldIcon: {
    width: '28px',
    height: '28px',
    imageRendering: 'pixelated',
    filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))',
  } as CSSProperties,

  goldText: {
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: COLORS.gold,
    textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
  } as CSSProperties,

  floatingGold: {
    position: 'absolute',
    top: '95px',
    left: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: COLORS.gold,
    textShadow: '0 0 15px rgba(255, 215, 0, 0.7)',
    fontWeight: 'bold',
    animation: 'floatUp 1.5s ease-out forwards',
    pointerEvents: 'none',
    zIndex: 9999,
  } as CSSProperties,

  floatingGoldIcon: {
    width: '20px',
    height: '20px',
    imageRendering: 'pixelated',
  } as CSSProperties,

  // ═══════════════════════════════════════════════════════════════════════════════
  // PVP TIMER
  // ═══════════════════════════════════════════════════════════════════════════════

  pvpTimer: (timerColor: string): CSSProperties => ({
    position: 'absolute',
    top: '60px',
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
    fontFamily: FONTS.primary,
    fontSize: '32px',
    color: timerColor,
    textShadow: timerColor === COLORS.timerDanger
      ? SHADOWS.textError
      : timerColor === COLORS.timerWarning
        ? '0 0 15px rgba(255, 215, 0, 0.6)'
        : SHADOWS.textNeon,
  }),

  pvpModeLabel: {
    position: 'absolute',
    top: '25px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: COLORS.error,
    textShadow: SHADOWS.textError,
    letterSpacing: '2px',
    textTransform: 'uppercase',
  } as CSSProperties,

  // ═══════════════════════════════════════════════════════════════════════════════
  // HEARTS / HEALTH
  // ═══════════════════════════════════════════════════════════════════════════════

  heartsContainer: {
    display: 'flex',
    gap: '6px',
    marginTop: '-10px',
    marginRight: '10px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    maxWidth: '430px',
  } as CSSProperties,

  heartImage: {
    width: '36px',
    height: '36px',
    imageRendering: 'pixelated',
    filter: 'drop-shadow(0 0 6px rgba(255, 68, 68, 0.6))',
  } as CSSProperties,

  // ═══════════════════════════════════════════════════════════════════════════════
  // BACKGROUND
  // ═══════════════════════════════════════════════════════════════════════════════

  backgroundLayer: (wave?: number): CSSProperties => ({
    position: 'absolute',
    zIndex: 1,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    ...BACKGROUND_STYLES.gameBackground(wave),
  }),

  canonsImage: {
    position: 'fixed',
    left: 0,
    bottom: 0,
    width: '100%',
    height: '200px',
    zIndex: 100,
    pointerEvents: 'none',
    backgroundImage: 'url(/images/wall.png)',
    backgroundRepeat: 'repeat-x',
    backgroundPosition: 'bottom',
    backgroundSize: 'auto 100%',
    imageRendering: 'pixelated',
  } as CSSProperties,

  // ═══════════════════════════════════════════════════════════════════════════════
  // INPUT FIELD - COSMIC TERMINAL
  // ═══════════════════════════════════════════════════════════════════════════════

  inputField: (disabled: boolean): CSSProperties => ({
    position: 'absolute',
    bottom: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60vw',
    maxWidth: '600px',
    fontFamily: FONTS.mono,
    fontSize: '22px',
    padding: '14px 20px',
    background: 'rgba(10, 10, 26, 0.95)',
    border: `3px solid ${COLORS.primary}`,
    borderRadius: '6px',
    color: COLORS.primary,
    textAlign: 'center',
    outline: 'none',
    zIndex: 102,
    opacity: disabled ? 0.5 : 1,
    boxShadow: disabled
      ? 'inset 0 0 20px rgba(0, 0, 0, 0.5)'
      : `0 0 20px rgba(139, 92, 246, 0.4), inset 0 0 30px rgba(139, 92, 246, 0.1)`,
    transition: 'all 0.3s ease',
    letterSpacing: '2px',
  }),

  // ═══════════════════════════════════════════════════════════════════════════════
  // TRANSACTION NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  txNotificationContainer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    zIndex: 103,
    pointerEvents: 'none',
  } as CSSProperties,

  txNotification: {
    position: 'fixed',
    left: '20px',
    backgroundColor: COLORS.glassBg,
    border: `2px solid ${COLORS.primary}`,
    borderRadius: '8px',
    padding: '14px 18px',
    fontFamily: FONTS.primary,
    fontSize: '11px',
    color: COLORS.primary,
    maxWidth: '320px',
    lineHeight: '2',
    transition: 'all 0.3s ease-out',
    boxShadow: `0 0 25px rgba(139, 92, 246, 0.4)`,
  } as CSSProperties,

  // ═══════════════════════════════════════════════════════════════════════════════
  // TYPING AREA - WORD DISPLAY
  // ═══════════════════════════════════════════════════════════════════════════════

  wordDisplayContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: COLORS.glassBg,
    border: `2px solid ${COLORS.glassBorder}`,
    borderRadius: '12px',
    padding: '30px 50px',
    boxShadow: SHADOWS.panelGlow,
    backdropFilter: 'blur(10px)',
    zIndex: 50,
  } as CSSProperties,

  activeWord: {
    fontFamily: FONTS.primary,
    fontSize: '28px',
    color: COLORS.primary,
    textShadow: SHADOWS.textNeonStrong,
    letterSpacing: '4px',
    animation: 'neonPulse 1.5s ease-in-out infinite alternate',
  } as CSSProperties,

  correctChar: {
    color: COLORS.success,
    textShadow: SHADOWS.textSuccess,
  } as CSSProperties,

  incorrectChar: {
    color: COLORS.error,
    textShadow: SHADOWS.textError,
    animation: 'errorFlash 0.3s ease',
  } as CSSProperties,

  cursor: {
    display: 'inline-block',
    width: '3px',
    height: '28px',
    background: COLORS.glow,
    boxShadow: `0 0 10px ${COLORS.glow}, 0 0 20px ${COLORS.primary}`,
    animation: 'cursorBlink 0.8s ease-in-out infinite',
    marginLeft: '2px',
    verticalAlign: 'middle',
  } as CSSProperties,
} as const;

// Add cursor blink animation to CSS
export const additionalStyles = `
  @keyframes cursorBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;
