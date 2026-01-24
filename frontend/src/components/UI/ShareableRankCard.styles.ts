import { CSSProperties } from 'react';
import { COLORS, FONTS } from '../../styles/theme';

export const rankCardStyles = {
  wrapper: {
    perspective: '1500px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxHeight: '100vh',
  } as CSSProperties,

  card: {
    position: 'relative',
    width: '340px',
    background: 'linear-gradient(180deg, #1a0f2e 0%, #0d0618 100%)',
    border: '3px solid #3d2a5c',
    borderRadius: '12px',
    boxShadow: 
      '0 0 30px rgba(139, 92, 246, 0.25), ' +
      '0 10px 40px rgba(0, 0, 0, 0.6), ' +
      'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    transformStyle: 'preserve-3d',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    overflow: 'hidden',
  } as CSSProperties,

  cardHovered: {
    transform: 'scale(1.02)',
    boxShadow: 
      '0 0 50px rgba(139, 92, 246, 0.4), ' +
      '0 20px 60px rgba(0, 0, 0, 0.7), ' +
      'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
    borderColor: '#5a3d8a',
  } as CSSProperties,

  innerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
    pointerEvents: 'none',
    zIndex: 1,
  } as CSSProperties,

  innerFrame: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    right: '8px',
    bottom: '8px',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    borderRadius: '8px',
    pointerEvents: 'none',
    zIndex: 2,
  } as CSSProperties,

  content: {
    position: 'relative',
    padding: '20px',
    zIndex: 3,
  } as CSSProperties,

  // Header: Name (left) + Aura (right)
  header: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: '16px',
    padding: '0 2px',
  } as CSSProperties,

  firstName: {
    fontFamily: FONTS.primary,
    fontSize: '15px',
    color: '#d4c4f0',
    letterSpacing: '0.5px',
  } as CSSProperties,

  auraValue: {
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: '#a78bfa',
    letterSpacing: '0.5px',
  } as CSSProperties,

  // Image section with Monad logo
  imageSection: {
    position: 'relative',
    width: '100%',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '12px',
    padding: '16px 0',
  } as CSSProperties,

  logo: {
    width: '90px',
    height: '90px',
    objectFit: 'contain',
    borderRadius: '12px',
    filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.4))',
    flexShrink: 0,
  } as CSSProperties,

  logoDescription: {
    fontFamily: FONTS.mono,
    fontSize: '11px',
    color: 'rgba(180, 160, 210, 0.85)',
    lineHeight: '1.5',
    letterSpacing: '0.2px',
    flex: 1,
  } as CSSProperties,

  // Stats section (two rows like Attack/Defense)
  statsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '16px',
  } as CSSProperties,

  statRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    background: 'rgba(139, 92, 246, 0.06)',
    border: '1px solid rgba(139, 92, 246, 0.15)',
    borderRadius: '6px',
  } as CSSProperties,

  statLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } as CSSProperties,

  statIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
  } as CSSProperties,

  statLabel: {
    fontFamily: FONTS.primary,
    fontSize: '12px',
    color: '#d4c4f0',
    letterSpacing: '0.5px',
  } as CSSProperties,

  statValue: {
    fontFamily: FONTS.primary,
    fontSize: '18px',
    color: '#a78bfa',
    letterSpacing: '0.5px',
  } as CSSProperties,

  // Rank title box
  rankBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px',
    marginBottom: '10px',
    background: 'rgba(255, 107, 74, 0.08)',
    border: '1px solid rgba(255, 107, 74, 0.3)',
    borderRadius: '6px',
  } as CSSProperties,

  rankTitle: {
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: '#ff6b4a',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    fontWeight: 'normal',
  } as CSSProperties,

  // Footer branding at very bottom
  footerBranding: {
    fontFamily: FONTS.mono,
    fontSize: '8px',
    color: 'rgba(139, 92, 246, 0.4)',
    letterSpacing: '1px',
    textAlign: 'center',
    paddingTop: '10px',
    borderTop: '1px solid rgba(139, 92, 246, 0.1)',
  } as CSSProperties,

  actionsContainer: {
    display: 'flex',
    gap: '10px',
    marginTop: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  } as CSSProperties,

  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px 18px',
    background: 'rgba(139, 92, 246, 0.1)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    borderRadius: '6px',
    fontFamily: FONTS.primary,
    fontSize: '10px',
    lineHeight: '1.4',
    color: '#a78bfa',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    letterSpacing: '0.5px',
  } as CSSProperties,

  actionButtonHover: {
    background: 'rgba(139, 92, 246, 0.2)',
    borderColor: 'rgba(139, 92, 246, 0.5)',
    boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)',
    transform: 'translateY(-1px)',
  } as CSSProperties,

  actionButtonSuccess: {
    background: 'rgba(76, 175, 80, 0.2)',
    borderColor: 'rgba(76, 175, 80, 0.5)',
    color: '#4CAF50',
    boxShadow: '0 0 15px rgba(76, 175, 80, 0.2)',
  } as CSSProperties,

  cornerDecor: {
    position: 'absolute',
    width: '20px',
    height: '20px',
    borderColor: 'rgba(139, 92, 246, 0.25)',
    borderStyle: 'solid',
    zIndex: 5,
  } as CSSProperties,

  cornerTopLeft: {
    top: '14px',
    left: '14px',
    borderWidth: '2px 0 0 2px',
    borderRadius: '3px 0 0 0',
  } as CSSProperties,

  cornerTopRight: {
    top: '14px',
    right: '14px',
    borderWidth: '2px 2px 0 0',
    borderRadius: '0 3px 0 0',
  } as CSSProperties,

  cornerBottomLeft: {
    bottom: '14px',
    left: '14px',
    borderWidth: '0 0 2px 2px',
    borderRadius: '0 0 0 3px',
  } as CSSProperties,

  cornerBottomRight: {
    bottom: '14px',
    right: '14px',
    borderWidth: '0 2px 2px 0',
    borderRadius: '0 0 3px 0',
  } as CSSProperties,
};
