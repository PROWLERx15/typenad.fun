import { CSSProperties } from 'react';
import { COLORS, FONTS } from '../../styles/theme';

export const questStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  } as CSSProperties,

  card: (completed: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px 20px',
    background: completed ? 'rgba(76, 175, 80, 0.15)' : 'rgba(0,0,0,0.5)',
    border: completed ? '2px solid rgba(76, 175, 80, 0.5)' : '2px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  } as CSSProperties),

  icon: {
    fontSize: '28px',
    minWidth: '40px',
    textAlign: 'center',
  } as CSSProperties,

  info: {
    flex: 1,
  } as CSSProperties,

  name: (completed: boolean) => ({
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: completed ? '#4CAF50' : COLORS.white,
    marginBottom: '4px',
  } as CSSProperties),

  description: {
    fontFamily: FONTS.primary,
    fontSize: '10px',
    color: COLORS.gray,
  } as CSSProperties,

  progress: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: '120px',
    justifyContent: 'flex-end',
  } as CSSProperties,

  progressBar: {
    width: '80px',
    height: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  } as CSSProperties,

  progressFill: (percent: number) => ({
    width: `${Math.min(100, percent)}%`,
    height: '100%',
    background: percent >= 100 ? '#4CAF50' : COLORS.primary,
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  } as CSSProperties),

  progressText: {
    fontFamily: FONTS.primary,
    fontSize: '10px',
    color: COLORS.gray,
    minWidth: '50px',
    textAlign: 'right',
  } as CSSProperties,

  status: (completed: boolean) => ({
    fontFamily: FONTS.primary,
    fontSize: '10px',
    color: completed ? '#4CAF50' : COLORS.gray,
    textTransform: 'uppercase',
  } as CSSProperties),

  categoryHeader: {
    fontFamily: FONTS.primary,
    fontSize: '16px',
    color: COLORS.primary,
    marginBottom: '15px',
    marginTop: '20px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    borderBottom: '1px solid rgba(139,92,246,0.3)',
    paddingBottom: '8px',
  } as CSSProperties,

  checkInSection: {
    marginBottom: '20px',
    padding: '20px',
    background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(0,0,0,0.3) 100%)',
    border: '2px solid rgba(139,92,246,0.3)',
    borderRadius: '12px',
    textAlign: 'center',
  } as CSSProperties,

  checkInButton: (canCheckIn: boolean) => ({
    padding: '12px 30px',
    background: canCheckIn ? 'rgba(139,92,246,0.3)' : 'rgba(100,100,100,0.3)',
    border: canCheckIn ? '2px solid rgba(139,92,246,0.6)' : '2px solid rgba(100,100,100,0.4)',
    borderRadius: '8px',
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: canCheckIn ? COLORS.primary : COLORS.gray,
    cursor: canCheckIn ? 'pointer' : 'not-allowed',
    transition: 'all 0.2s ease',
    marginBottom: '10px',
  } as CSSProperties),

  streakDisplay: {
    fontFamily: FONTS.primary,
    fontSize: '12px',
    color: COLORS.primary,
    marginTop: '10px',
  } as CSSProperties,

  streakNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
  } as CSSProperties,
};
