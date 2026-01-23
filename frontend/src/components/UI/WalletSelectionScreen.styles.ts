import { CSSProperties } from 'react';
import { COLORS, FONTS, BACKGROUND_STYLES } from '../../styles/theme';

export const styles = {
  overlayContainer: {
    ...BACKGROUND_STYLES.startScreenBackground,
    zIndex: 1002,
  } as CSSProperties,

  closeButton: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    marginTop: '10px',
    marginRight: '10px',
    zIndex: 1003,
  } as CSSProperties,

  container: {
    background: 'rgba(20, 20, 40, 0.95)',
    border: `2px solid ${COLORS.primary}`,
    borderRadius: '8px',
    padding: '40px',
    maxWidth: '600px',
    width: '90%',
    textAlign: 'center',
  } as CSSProperties,

  title: {
    fontFamily: FONTS.primary,
    fontSize: '24px',
    color: COLORS.primary,
    margin: '0 0 40px 0',
    textShadow: `0 0 10px ${COLORS.glow}`,
  } as CSSProperties,

  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  } as CSSProperties,

  option: {
    padding: '20px',
    border: `1px solid rgba(139, 92, 246, 0.3)`,
    borderRadius: '4px',
    background: 'rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  } as CSSProperties,

  optionTitle: {
    fontFamily: FONTS.primary,
    fontSize: '16px',
    color: COLORS.primary,
    margin: '0 0 10px 0',
  } as CSSProperties,

  optionDescription: {
    fontFamily: FONTS.primary,
    fontSize: '12px',
    color: '#ccc',
    margin: '0 0 20px 0',
    lineHeight: '1.6',
  } as CSSProperties,

  button: {
    fontFamily: FONTS.primary,
    fontSize: '14px',
    padding: '12px 24px',
    background: 'rgba(139, 92, 246, 0.2)',
    border: `2px solid rgba(139, 92, 246, 0.5)`,
    color: COLORS.primary,
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as CSSProperties,

  buttonHover: {
    background: 'rgba(139, 92, 246, 0.3)',
    borderColor: COLORS.primary,
  } as CSSProperties,

  divider: {
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: '#888',
    margin: '10px 0',
  } as CSSProperties,
} as const;
