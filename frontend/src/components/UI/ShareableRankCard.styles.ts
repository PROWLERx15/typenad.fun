import { CSSProperties } from 'react';
import { COLORS, FONTS } from '../../styles/theme';

export const rankCardStyles = {
  wrapper: {
    perspective: '1000px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  } as CSSProperties,

  card: {
    position: 'relative',
    width: '320px',
    padding: '24px',
    background: 'linear-gradient(145deg, rgba(30, 0, 0, 0.95) 0%, rgba(60, 10, 10, 0.9) 50%, rgba(20, 0, 0, 0.95) 100%)',
    border: '3px solid',
    borderImage: 'linear-gradient(135deg, #8B5CF6 0%, #8B4513 50%, #8B5CF6 100%) 1',
    borderRadius: '0px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(139, 92, 246, 0.1)',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.1s ease-out, box-shadow 0.3s ease',
    cursor: 'pointer',
  } as CSSProperties,

  cardHovered: {
    boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(139, 92, 246, 0.2)',
  } as CSSProperties,

  innerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.1) 0%, transparent 60%)',
    pointerEvents: 'none',
  } as CSSProperties,

  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '2px solid rgba(139, 92, 246, 0.3)',
  } as CSSProperties,

  logo: {
    width: '64px',
    height: '64px',
    objectFit: 'contain',
    imageRendering: 'pixelated',
  } as CSSProperties,

  gameTitle: {
    fontFamily: FONTS.primary,
    fontSize: '16px',
    color: COLORS.primary,
    letterSpacing: '2px',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
  } as CSSProperties,

  rankBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 16px',
    margin: '0 auto 20px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(139, 0, 0, 0.5) 50%, transparent 100%)',
    border: '1px solid rgba(139, 92, 246, 0.4)',
    fontFamily: FONTS.primary,
    fontSize: '10px',
    color: COLORS.primary,
    letterSpacing: '1px',
    textTransform: 'uppercase',
  } as CSSProperties,

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px',
  } as CSSProperties,

  statBox: {
    textAlign: 'center',
    padding: '15px',
    background: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  } as CSSProperties,

  statLabel: {
    fontFamily: FONTS.primary,
    fontSize: '8px',
    color: COLORS.gray,
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  } as CSSProperties,

  statValue: {
    fontFamily: FONTS.primary,
    fontSize: '20px',
    color: COLORS.primary,
    textShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
  } as CSSProperties,

  chainId: {
    fontFamily: FONTS.mono,
    fontSize: '8px',
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: '15px',
    opacity: 0.7,
  } as CSSProperties,

  displayName: {
    fontFamily: FONTS.primary,
    fontSize: '16px',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: '15px',
    letterSpacing: '1px',
    textShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
  } as CSSProperties,

  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    paddingTop: '15px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  } as CSSProperties,

  footerText: {
    fontFamily: FONTS.primary,
    fontSize: '8px',
    color: COLORS.gray,
    letterSpacing: '1px',
  } as CSSProperties,

  lineraLogo: {
    height: '12px',
    opacity: 0.7,
  } as CSSProperties,

  // Action buttons
  actionsContainer: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
    justifyContent: 'center',
  } as CSSProperties,

  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px 16px',
    background: 'rgba(139, 92, 246, 0.1)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    fontFamily: FONTS.primary,
    fontSize: '10px',
    lineHeight: '1.4',
    color: COLORS.primary,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  } as CSSProperties,

  actionButtonHover: {
    background: 'rgba(139, 92, 246, 0.2)',
    borderColor: 'rgba(139, 92, 246, 0.6)',
  } as CSSProperties,

  actionButtonSuccess: {
    background: 'rgba(76, 175, 80, 0.2)',
    borderColor: 'rgba(76, 175, 80, 0.6)',
    color: '#4CAF50',
  } as CSSProperties,

  // Decorative elements
  cornerDecor: {
    position: 'absolute',
    width: '20px',
    height: '20px',
    borderColor: 'rgba(139, 92, 246, 0.5)',
    borderStyle: 'solid',
  } as CSSProperties,

  cornerTopLeft: {
    top: '8px',
    left: '8px',
    borderWidth: '2px 0 0 2px',
  } as CSSProperties,

  cornerTopRight: {
    top: '8px',
    right: '8px',
    borderWidth: '2px 2px 0 0',
  } as CSSProperties,

  cornerBottomLeft: {
    bottom: '8px',
    left: '8px',
    borderWidth: '0 0 2px 2px',
  } as CSSProperties,

  cornerBottomRight: {
    bottom: '8px',
    right: '8px',
    borderWidth: '0 2px 2px 0',
  } as CSSProperties,
};
