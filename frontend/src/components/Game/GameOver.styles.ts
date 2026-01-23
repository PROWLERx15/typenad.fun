import { CSSProperties } from 'react';
import { FONTS, COLORS, SHADOWS } from '../../styles/theme';

/**
 * GameOver Styles - Cosmic Arcade Theme
 * Results screen with neon animations and arcade energy
 */

export const styles = {
  container: {
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

  // Glass overlay for better readability
  overlay: {
    background: 'rgba(10, 10, 26, 0.85)',
    backdropFilter: 'blur(10px)',
    padding: '50px 80px',
    borderRadius: '16px',
    border: `2px solid ${COLORS.glassBorder}`,
    boxShadow: `0 0 50px rgba(139, 92, 246, 0.3), inset 0 0 40px rgba(139, 92, 246, 0.1)`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    animation: 'fadeIn 0.5s ease-out',
  } as CSSProperties,

  // GAME OVER title - arcade style
  title: {
    fontFamily: FONTS.primary,
    fontSize: 'clamp(36px, 6vw, 56px)',
    color: COLORS.primary,
    margin: '0 0 10px 0',
    letterSpacing: '4px',
    textTransform: 'uppercase',
    textShadow: SHADOWS.textNeonStrong,
    animation: 'neonPulse 2s ease-in-out infinite alternate',
  } as CSSProperties,

  // Glowing divider
  divider: {
    width: '200px',
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${COLORS.primary}, transparent)`,
    boxShadow: `0 0 15px ${COLORS.primary}`,
    margin: '10px 0 20px 0',
  } as CSSProperties,

  // Stats container
  statsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    animation: 'fadeIn 0.6s ease-out 0.2s both',
  } as CSSProperties,

  statText: {
    fontFamily: FONTS.primary,
    fontSize: '18px',
    color: COLORS.primary,
    margin: '6px 0',
    textShadow: SHADOWS.textNeon,
    letterSpacing: '2px',
  } as CSSProperties,

  statLabel: {
    fontFamily: FONTS.mono,
    fontSize: '12px',
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: '2px',
    opacity: 0.7,
    marginBottom: '4px',
  } as CSSProperties,

  statValue: {
    fontFamily: FONTS.primary,
    fontSize: '24px',
    color: COLORS.primary,
    textShadow: SHADOWS.textNeonStrong,
  } as CSSProperties,

  goldText: {
    fontFamily: FONTS.primary,
    fontSize: '20px',
    margin: '10px 0',
    color: COLORS.gold,
    textShadow: '0 0 15px rgba(255, 215, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  } as CSSProperties,

  goldIcon: {
    width: '28px',
    height: '28px',
    imageRendering: 'pixelated',
    filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.7))',
  } as CSSProperties,

  // Button container
  buttonContainer: {
    display: 'flex',
    gap: '16px',
    marginTop: '20px',
    animation: 'fadeIn 0.6s ease-out 0.4s both',
  } as CSSProperties,

  // Primary button - neon CTA
  button: {
    fontFamily: FONTS.primary,
    fontSize: '16px',
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

  buttonHover: {
    transform: 'translateY(-3px)',
    boxShadow: SHADOWS.boxGlowHover,
    borderColor: COLORS.secondary,
    color: COLORS.secondary,
  } as CSSProperties,

  // Secondary button
  buttonSecondary: {
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: COLORS.secondary,
    background: 'transparent',
    border: `1px solid ${COLORS.secondary}`,
    borderRadius: '4px',
    padding: '12px 24px',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.3s ease',
    opacity: 0.8,
  } as CSSProperties,

  // New high score badge
  newHighScore: {
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: COLORS.gold,
    textShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
    background: 'rgba(255, 215, 0, 0.15)',
    border: `1px solid ${COLORS.gold}`,
    borderRadius: '4px',
    padding: '8px 16px',
    letterSpacing: '2px',
    animation: 'neonPulse 1.5s ease-in-out infinite alternate',
    marginBottom: '10px',
  } as CSSProperties,
} as const;

// Animation CSS (add to global or component)
export const gameOverAnimations = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes neonPulse {
    0% {
      text-shadow: 0 0 5px rgba(139, 92, 246, 0.6), 0 0 15px rgba(139, 92, 246, 0.4);
    }
    100% {
      text-shadow: 0 0 15px rgba(139, 92, 246, 0.9), 0 0 40px rgba(139, 92, 246, 0.6), 0 0 60px rgba(192, 132, 252, 0.4);
    }
  }
`;
