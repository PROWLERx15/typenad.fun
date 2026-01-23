import { CSSProperties } from 'react';
import { COLORS, FONTS } from '../../styles/theme';

const WAVES_WITH_BANNERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

const hasWaveBanner = (waveNumber?: number): boolean => {
  return waveNumber !== undefined && WAVES_WITH_BANNERS.includes(waveNumber as any);
};

const getWaveBannerImage = (waveNumber?: number): string => {
  // Survival waves (3, 6, 9) use wave_attack.png
  if (waveNumber === 3 || waveNumber === 6 || waveNumber === 9) {
    return '/images/wave_attack.png';
  }
  return `/images/wave_${waveNumber}.png`;
};

export const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  } as CSSProperties,

  container: (isAnimating: boolean, hasStarted: boolean): CSSProperties => ({
    position: 'fixed',
    top: isAnimating ? '0px' : '50%',
    left: '50%',
    transform: isAnimating ? 'translate(-50%, 0) scale(0.7)' : 'translate(-50%, -50%) scale(1)',
    zIndex: 1000,
    pointerEvents: hasStarted ? 'none' : 'auto',
    animation: isAnimating ? 'slideToTop 0.5s ease-out forwards' : 'none',
    transition: 'none',
  }),

  card: (isAnimating: boolean, waveNumber?: number): CSSProperties => ({
    textAlign: 'center',
    padding: isAnimating ? '20px 30px' : '40px 60px',
    background: isAnimating ? 'transparent' : 'rgba(0,0,0,0.9)',
    border: isAnimating ? 'none' : '4px solid rgba(139,92,246,0.6)',
    borderRadius: '12px',
    transition: 'all 0.5s ease-out',
    minWidth: '500px',
    maxWidth: '700px',
    position: 'relative',
    overflow: 'hidden',
    ...(hasWaveBanner(waveNumber) && !isAnimating ? {
      backgroundImage: `url(${getWaveBannerImage(waveNumber)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    } : {}),
  }),

  overlay: (isAnimating: boolean, waveNumber?: number): CSSProperties => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    borderRadius: '12px',
    zIndex: 0,
    display: (hasWaveBanner(waveNumber) && !isAnimating) ? 'block' : 'none',
  }),

  content: {
    position: 'relative',
    zIndex: 1,
  } as CSSProperties,

  title: (isAnimating: boolean, isSurvival: boolean): CSSProperties => ({
    fontFamily: FONTS.primary,
    fontSize: isAnimating ? '28px' : '42px',
    color: isSurvival ? '#C084FC' : COLORS.primary,
    marginTop: 0,
    marginRight: 0,
    marginBottom: isAnimating ? '0' : '10px',
    marginLeft: 0,
    textShadow: '2px 4px 8px #000',
  }),

  description: (hasStarted: boolean): CSSProperties => ({
    fontFamily: FONTS.primary,
    fontSize: '16px',
    color: COLORS.white,
    marginTop: '20px',
    marginBottom: '30px',
    opacity: 0.9,
    lineHeight: '1.6',
    animation: hasStarted ? 'fadeOut 0.3s ease-out forwards' : 'none',
  }),

  startButton: {
    background: 'rgba(139,92,246,0.2)',
    border: '2px solid rgba(139,92,246,0.5)',
    color: COLORS.primary,
    fontFamily: FONTS.primary,
    fontSize: '20px',
    lineHeight: '20px',
    padding: '15px 50px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    pointerEvents: 'auto' as const,
  } as CSSProperties,

  exitButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(255,0,0,0.2)',
    border: '2px solid rgba(255,0,0,0.5)',
    color: '#ff0000',
    padding: '8px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
  } as CSSProperties,

  confirmDialog: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px',
  } as CSSProperties,

  confirmText: {
    fontFamily: FONTS.primary,
    fontSize: '16px',
    color: COLORS.white,
    margin: 0,
    textShadow: '2px 2px 4px #000',
  } as CSSProperties,

  confirmButtons: {
    display: 'flex',
    gap: '20px',
  } as CSSProperties,

  confirmButton: {
    background: 'rgba(255,0,0,0.2)',
    border: '2px solid rgba(255,0,0,0.5)',
    color: '#ff0000',
    fontFamily: FONTS.primary,
    fontSize: '16px',
    lineHeight: '16px',
    padding: '12px 30px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '100px',
  } as CSSProperties,

  survivalTimer: (survivalTimeLeft: number): CSSProperties => ({
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: survivalTimeLeft <= 15 ? '#C084FC' : COLORS.white,
    textShadow: '2px 4px 8px #000',
    opacity: 0.9,
    marginTop: '8px',
  }),

  powerupsSection: {
    marginTop: '20px',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  } as CSSProperties,

  powerupsTitle: {
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: COLORS.primary,
    textShadow: '1px 2px 4px #000',
    letterSpacing: '1px',
  } as CSSProperties,

  powerupsGrid: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  } as CSSProperties,

  powerupCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '100px',
    border: '2px solid transparent',
  } as CSSProperties,

  powerupCardActive: {
    background: 'rgba(139, 92, 246, 0.2)',
    border: '2px solid rgba(139, 92, 246, 0.8)',
    boxShadow: '0 0 10px rgba(139, 92, 246, 0.4)',
  } as CSSProperties,

  powerupCardInactive: {
    background: 'rgba(128, 128, 128, 0.5)',
    border: '2px solid rgba(128, 128, 128, 1.0)',
    opacity: 0.7,
  } as CSSProperties,

  powerupIconContainer: {
    width: '60px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  } as CSSProperties,

  powerupIcon: {
    width: '32px',
    height: '32px',
    objectFit: 'contain',
  } as CSSProperties,

  powerupName: {
    fontFamily: FONTS.primary,
    fontSize: '11px',
    color: COLORS.white,
    textAlign: 'center',
    textShadow: '1px 1px 2px #000',
    whiteSpace: 'nowrap',
  } as CSSProperties,
} as const;

export const keyframes = `
  @keyframes slideToTop {
    from {
      top: 50%;
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
    to {
      top: 0px;
      transform: translate(-50%, 0) scale(0.7);
      opacity: 1;
    }
  }
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;
