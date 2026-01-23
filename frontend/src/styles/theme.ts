import { CSSProperties } from 'react';

/**
 * TypeMonad - Cosmic Arcade Theme
 * Deep Space + Monad Purple
 * Consolidated colors, fonts, effects, and component styles
 */

// ═══════════════════════════════════════════════════════════════════════════════
// COLORS - Monad Purple Color System (NON-NEGOTIABLE)
// ═══════════════════════════════════════════════════════════════════════════════

export const COLORS = {
  // Monad Purple (PRIMARY brand color)
  primary: '#8B5CF6',          // Monad Purple - main brand color
  secondary: '#A78BFA',        // Lighter purple (hover states)
  tertiary: '#6D28D9',         // Darker purple (shadows)
  glow: '#C084FC',             // Glowing effects / neon

  // Backgrounds (VERY DARK)
  spaceBlack: '#0a0a0a',       // Pure black base
  spaceDark: '#0f0f1a',        // Main background
  spaceDeep: '#1a1a2e',        // Panels/cards
  spaceGrid: '#16213e',        // Subtle elements

  // Glass Effect Colors
  glassBg: 'rgba(10, 10, 26, 0.8)',
  glassBorder: 'rgba(139, 92, 246, 0.3)',
  glassGlow: 'rgba(139, 92, 246, 0.15)',

  // Accent colors
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  white: '#FFFFFF',
  black: '#0a0a0a',
  red: '#FF4444',              // Damage red
  cyan: '#00D9FF',             // Secondary accent (use SPARINGLY)
  magenta: '#C084FC',          // Laser pink / critical hits
  gray: '#B4B4B4',             // Primary text secondary
  darkGray: '#1a1a2e',
  transparent: 'transparent',

  // Semantic colors
  success: '#00FF88',          // Success green
  error: '#FF4444',            // Damage red
  gold: '#FFD700',             // Gold for coins/highlights

  // Timer colors
  timerGood: '#00FF88',
  timerWarning: '#FFD700',
  timerDanger: '#FF4444',
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// FONTS
// ═══════════════════════════════════════════════════════════════════════════════

export const FONTS = {
  primary: '"Press Start 2P", monospace',    // Headings / arcade text
  mono: '"JetBrains Mono", monospace',       // Body / terminal text
  fallback: 'Courier New, monospace',
} as const;

export const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=JetBrains+Mono:wght@400;500;700&display=swap');`;

// ═══════════════════════════════════════════════════════════════════════════════
// SHADOWS & GLOWS - Depth Effects
// ═══════════════════════════════════════════════════════════════════════════════

export const SHADOWS = {
  // Text shadows
  textNeon: `0 0 10px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)`,
  textNeonStrong: `0 0 10px rgba(139, 92, 246, 0.8), 0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.3), 0 0 80px rgba(192, 132, 252, 0.2)`,
  textDark: '2px 4px 8px #000, 0 2px 0 #222',
  textSuccess: `0 0 10px rgba(0, 255, 136, 0.5)`,
  textError: `0 0 10px rgba(255, 68, 68, 0.5)`,

  // Box shadows
  boxGlow: `0 0 10px rgba(139, 92, 246, 0.3), inset 0 0 20px rgba(139, 92, 246, 0.1)`,
  boxGlowHover: `0 0 25px rgba(139, 92, 246, 0.6), 0 0 50px rgba(139, 92, 246, 0.3), inset 0 0 30px rgba(139, 92, 246, 0.2)`,
  boxGlowActive: `0 0 10px rgba(139, 92, 246, 0.4), inset 0 0 40px rgba(139, 92, 246, 0.3)`,
  panelGlow: `0 0 20px rgba(139, 92, 246, 0.1), inset 0 0 30px rgba(139, 92, 246, 0.05)`,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// GLASS PANEL STYLES
// ═══════════════════════════════════════════════════════════════════════════════

export const GLASS_STYLES = {
  panel: {
    background: COLORS.glassBg,
    border: `1px solid ${COLORS.glassBorder}`,
    borderRadius: '8px',
    boxShadow: SHADOWS.panelGlow,
    backdropFilter: 'blur(10px)',
  } as CSSProperties,

  panelDark: {
    background: 'rgba(10, 10, 26, 0.95)',
    border: `2px solid ${COLORS.primary}`,
    borderRadius: '8px',
    boxShadow: SHADOWS.boxGlow,
  } as CSSProperties,

  input: {
    background: 'rgba(10, 10, 26, 0.9)',
    border: `2px solid ${COLORS.primary}`,
    borderRadius: '4px',
    boxShadow: `0 0 10px rgba(139, 92, 246, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.5)`,
  } as CSSProperties,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// BUTTON STYLES - Cosmic Arcade
// ═══════════════════════════════════════════════════════════════════════════════

export const BUTTON_STYLES = {
  base: {
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: COLORS.primary,
    background: COLORS.glassBg,
    border: `2px solid ${COLORS.primary}`,
    borderRadius: '4px',
    padding: '12px 24px',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: SHADOWS.boxGlow,
  } as CSSProperties,

  small: {
    fontFamily: FONTS.primary,
    fontSize: '11px',
    color: COLORS.primary,
    background: COLORS.glassBg,
    border: `1px solid ${COLORS.primary}`,
    borderRadius: '4px',
    padding: '8px 12px',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: SHADOWS.boxGlow,
  } as CSSProperties,

  medium: {
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: COLORS.primary,
    background: COLORS.glassBg,
    border: `2px solid ${COLORS.primary}`,
    borderRadius: '4px',
    padding: '14px 28px',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: SHADOWS.boxGlow,
  } as CSSProperties,

  large: {
    fontFamily: FONTS.primary,
    fontSize: '18px',
    color: COLORS.primary,
    background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.3) 0%, rgba(109, 40, 217, 0.3) 100%)',
    border: `2px solid ${COLORS.secondary}`,
    borderRadius: '4px',
    padding: '16px 32px',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: SHADOWS.boxGlow,
  } as CSSProperties,

  link: {
    fontFamily: FONTS.primary,
    background: COLORS.transparent,
    border: 'none',
    color: COLORS.primary,
    textDecoration: 'underline',
    fontSize: '12px',
    cursor: 'pointer',
    textShadow: SHADOWS.textNeon,
    transition: 'all 0.3s ease',
  } as CSSProperties,

  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as CSSProperties,

  // Hover state (apply via JS/CSS)
  hover: {
    transform: 'translateY(-2px)',
    boxShadow: SHADOWS.boxGlowHover,
    borderColor: COLORS.secondary,
    color: COLORS.secondary,
  } as CSSProperties,

  // Active state
  active: {
    transform: 'translateY(0)',
    boxShadow: SHADOWS.boxGlowActive,
  } as CSSProperties,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATIONS (CSS keyframes as strings)
// ═══════════════════════════════════════════════════════════════════════════════

export const ANIMATIONS = {
  neonPulse: `
    @keyframes neonPulse {
      0% {
        text-shadow: 0 0 5px rgba(139, 92, 246, 0.5), 0 0 10px rgba(139, 92, 246, 0.3), 0 0 20px rgba(139, 92, 246, 0.2);
      }
      100% {
        text-shadow: 0 0 10px rgba(139, 92, 246, 0.8), 0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.3), 0 0 80px rgba(192, 132, 252, 0.2);
      }
    }
  `,

  buttonGlow: `
    @keyframes buttonGlow {
      0% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.3), inset 0 0 10px rgba(139, 92, 246, 0.1); }
      100% { box-shadow: 0 0 15px rgba(139, 92, 246, 0.5), inset 0 0 20px rgba(139, 92, 246, 0.15); }
    }
  `,

  shake: `
    @keyframes shake {
      0% { transform: translate(0, 0); }
      25% { transform: translate(-5px, 5px); }
      50% { transform: translate(5px, -5px); }
      75% { transform: translate(-5px, -5px); }
      100% { transform: translate(0, 0); }
    }
  `,

  floatUp: `
    @keyframes floatUp {
      0% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-50px); }
    }
  `,

  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,

  successFlash: `
    @keyframes successFlash {
      0% { color: #00FF88; text-shadow: 0 0 10px #00FF88; }
      100% { color: inherit; text-shadow: none; }
    }
  `,

  errorFlash: `
    @keyframes errorFlash {
      0%, 20% { color: #FF4444; text-shadow: 0 0 15px #FF4444; }
      40% { color: inherit; }
      60% { color: #FF4444; }
      100% { color: inherit; }
    }
  `,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// BACKGROUNDS
// ═══════════════════════════════════════════════════════════════════════════════

export const BACKGROUNDS = {
  main: `url("/images/background.png")`,
  wave2: `url("/images/background-2.png")`,
  wave4: `url("/images/background-4.png")`,
  wave5: `url("/images/background-5.png")`,
  wave7: `url("/images/background-7.png")`,
  wave8: `url("/images/background-8.png")`,
  startScreen: `url("/images/background_new.png")`,
  gameOver: `url("/images/gameover.png")`,
} as const;

export const BACKGROUND_STYLES = {
  gameBackground: (wave?: number) => {
    let backgroundImage: string = BACKGROUNDS.main;
    if (wave === 2 || wave === 3) {
      backgroundImage = BACKGROUNDS.wave2;
    } else if (wave === 4) {
      backgroundImage = BACKGROUNDS.wave4;
    } else if (wave === 5 || wave === 6) {
      backgroundImage = BACKGROUNDS.wave5;
    } else if (wave === 7) {
      backgroundImage = BACKGROUNDS.wave7;
    } else if (wave === 8 || wave === 9) {
      backgroundImage = BACKGROUNDS.wave8;
    }
    return {
      backgroundImage,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
    } as CSSProperties;
  },

  startScreenBackground: {
    backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), ${BACKGROUNDS.startScreen}`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  } as CSSProperties,

  cosmicBackground: {
    background: `
      radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(109, 40, 217, 0.1) 0%, transparent 40%),
      linear-gradient(180deg, #0a0a0a 0%, #0f0f1a 50%, #1a1a2e 100%)
    `,
  } as CSSProperties,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN STYLES
// ═══════════════════════════════════════════════════════════════════════════════

export const SCREEN_STYLES = {
  fullScreen: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
  } as CSSProperties,

  centered: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  } as CSSProperties,

  backgroundCover: {
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  } as CSSProperties,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// TEXT STYLES
// ═══════════════════════════════════════════════════════════════════════════════

export const TEXT_STYLES = {
  title: {
    fontFamily: FONTS.primary,
    fontSize: '48px',
    color: COLORS.primary,
    textShadow: SHADOWS.textNeon,
    letterSpacing: '4px',
  } as CSSProperties,

  titleGlow: {
    fontFamily: FONTS.primary,
    fontSize: '48px',
    color: COLORS.primary,
    textShadow: SHADOWS.textNeonStrong,
    letterSpacing: '4px',
    animation: 'neonPulse 2s ease-in-out infinite alternate',
  } as CSSProperties,

  heading: {
    fontFamily: FONTS.primary,
    fontSize: '32px',
    textShadow: SHADOWS.textNeon,
    textAlign: 'center',
    color: COLORS.primary,
  } as CSSProperties,

  body: {
    fontFamily: FONTS.mono,
    fontSize: '14px',
    color: COLORS.white,
  } as CSSProperties,

  small: {
    fontFamily: FONTS.mono,
    fontSize: '12px',
    color: COLORS.gray,
  } as CSSProperties,

  muted: {
    fontFamily: FONTS.mono,
    fontSize: '12px',
    color: 'rgba(180, 180, 180, 0.7)',
    textShadow: '0 0 5px rgba(139, 92, 246, 0.2)',
  } as CSSProperties,

  arcade: {
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: COLORS.primary,
    textShadow: SHADOWS.textNeon,
    letterSpacing: '1px',
  } as CSSProperties,

  success: {
    color: COLORS.success,
    textShadow: SHADOWS.textSuccess,
  } as CSSProperties,

  error: {
    color: COLORS.error,
    textShadow: SHADOWS.textError,
  } as CSSProperties,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// HUD STYLES - Arcade Terminal
// ═══════════════════════════════════════════════════════════════════════════════

export const HUD_STYLES = {
  container: {
    fontFamily: FONTS.primary,
    fontSize: '12px',
    color: COLORS.primary,
    textShadow: SHADOWS.textNeon,
  } as CSSProperties,

  stat: {
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: COLORS.primary,
    textShadow: SHADOWS.textDark,
  } as CSSProperties,

  statLabel: {
    fontFamily: FONTS.mono,
    fontSize: '10px',
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    opacity: 0.7,
  } as CSSProperties,

  statValue: {
    fontFamily: FONTS.primary,
    fontSize: '18px',
    color: COLORS.primary,
    textShadow: SHADOWS.textNeon,
  } as CSSProperties,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

export const mergeStyles = (...styles: (CSSProperties | undefined)[]): CSSProperties => {
  return Object.assign({}, ...styles.filter(Boolean));
};
