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

  contentContainer: {
    maxWidth: '800px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    padding: '20px',
  } as CSSProperties,

  errorContainer: {
    padding: '20px',
    background: 'rgba(255,0,0,0.2)',
    border: '2px solid red',
    borderRadius: '8px',
    color: COLORS.white,
    fontFamily: FONTS.primary,
    fontSize: '12.5px',
    marginBottom: '20px',
  } as CSSProperties,
} as const;
 