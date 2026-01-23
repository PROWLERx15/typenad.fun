import { CSSProperties } from 'react';
import { COLORS, FONTS } from '../../styles/theme';

export const styles = {
  container: {
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '30px',
    background: 'rgba(0,0,0,0.8)',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '8px',
  } as CSSProperties,

  title: {
    fontFamily: FONTS.primary,
    fontSize: '24px',
    color: COLORS.primary,
    marginBottom: '20px',
    textAlign: 'center',
  } as CSSProperties,

  infoBox: {
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: COLORS.gray,
    marginBottom: '20px',
    textAlign: 'center',
    padding: '10px',
    background: 'rgba(139,92,246,0.1)',
    border: '2px solid rgba(139,92,246,0.3)',
    borderRadius: '4px',
  } as CSSProperties,

  authBoxAuthorized: {
    fontFamily: FONTS.primary,
    fontSize: '12px',
    color: COLORS.white,
    marginBottom: '20px',
    textAlign: 'center',
    padding: '10px',
    background: 'rgba(0,255,0,0.1)',
    border: '2px solid rgba(0,255,0,0.3)',
    borderRadius: '4px',
  } as CSSProperties,

  authBoxUnauthorized: {
    fontFamily: FONTS.primary,
    fontSize: '12px',
    color: COLORS.white,
    marginBottom: '20px',
    textAlign: 'center',
    padding: '10px',
    background: 'rgba(255,0,0,0.1)',
    border: '2px solid rgba(255,0,0,0.3)',
    borderRadius: '4px',
  } as CSSProperties,

  wordsSection: {
    marginBottom: '20px',
  } as CSSProperties,

  wordsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  } as CSSProperties,

  label: {
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: COLORS.white,
  } as CSSProperties,

  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: FONTS.mono,
    fontSize: '12px',
    color: COLORS.white,
    background: 'rgba(0,0,0,0.7)',
    border: '2px solid rgba(255,255,255,0.3)',
    padding: '10px',
    borderRadius: '4px',
    resize: 'vertical',
  } as CSSProperties,

  wordCount: {
    fontFamily: FONTS.primary,
    fontSize: '12px',
    color: COLORS.gray,
    marginTop: '5px',
  } as CSSProperties,

  buttonRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  } as CSSProperties,

  statusMessage: {
    padding: '15px',
    background: 'rgba(255,255,255,0.1)',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '4px',
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: COLORS.white,
    textAlign: 'center',
  } as CSSProperties,

  footerInfo: {
    marginTop: '20px',
    marginBottom: '30px',
    padding: '15px',
    background: 'rgba(139,92,246,0.1)',
    border: '2px solid rgba(139,92,246,0.3)',
    borderRadius: '4px',
    fontFamily: FONTS.primary,
    fontSize: '12px',
    color: COLORS.gray,
  } as CSSProperties,
} as const;
