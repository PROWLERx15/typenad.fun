import { CSSProperties } from 'react';
import { COLORS, FONTS } from '../../styles/theme';

export const styles = {
  container: {
    marginTop: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '8px',
    background: 'rgba(0,0,0,0.5)',
    overflow: 'hidden',
    minHeight: '700px',
  } as CSSProperties,

  loadingContainer: {
    marginTop: '20px',
    padding: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '8px',
    background: 'rgba(0,0,0,0.5)',
  } as CSSProperties,

  loadingText: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: '16px',
    fontFamily: FONTS.primary,
  } as CSSProperties,

  emptyContainer: {
    marginTop: '20px',
    padding: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '8px',
    background: 'rgba(0,0,0,0.5)',
  } as CSSProperties,

  emptyText: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: '16px',
    fontFamily: FONTS.primary,
  } as CSSProperties,

  header: {
    padding: '16px 20px',
    background: 'rgba(222,42,2,0.2)',
    borderBottom: '2px solid rgba(255,255,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  } as CSSProperties,

  headerEmoji: {
    fontSize: '24px',
  } as CSSProperties,

  headerTitle: {
    fontSize: '20px',
    fontFamily: FONTS.primary,
    color: COLORS.primary,
    letterSpacing: '1px',
  } as CSSProperties,

  columnHeaders: {
    display: 'grid',
    gridTemplateColumns: '80px 1fr 120px 100px',
    padding: '12px 20px',
    background: 'rgba(255,255,255,0.05)',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    fontSize: '12px',
    color: COLORS.gray,
    fontFamily: FONTS.primary,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  } as CSSProperties,

  columnHeaderRight: {
    textAlign: 'right',
  } as CSSProperties,

  // Row styles
  rowBase: {
    display: 'grid',
    gridTemplateColumns: '80px 1fr 120px 100px',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    transition: 'all 0.2s ease',
    cursor: 'default',
  } as CSSProperties,

  rowEven: {
    background: 'rgba(0,0,0,0.3)',
  } as CSSProperties,

  rowOdd: {
    background: 'rgba(0,0,0,0.5)',
  } as CSSProperties,

  rowHighlight: {
    background: 'rgba(139, 92, 246, 0.2)',
  } as CSSProperties,

  rowBorderLeft: {
    borderLeft: '4px solid rgb(255, 215, 0)',
  } as CSSProperties,

  rowBorderTransparent: {
    borderLeft: '4px solid transparent',
  } as CSSProperties,

  // Cell styles
  rankCell: (rank: number, isMe: boolean) => ({
    fontFamily: FONTS.primary,
    fontSize: rank <= 3 ? '20px' : '18px',
    color: isMe ? 'rgb(255, 215, 0)' : rank <= 10 ? COLORS.primary : COLORS.white,
    fontWeight: rank <= 10 ? 'bold' : 'normal',
  } as CSSProperties),

  rankCellPlaceholder: {
    fontFamily: FONTS.primary,
    fontSize: '18px',
    color: COLORS.gray,
    opacity: 0.5,
  } as CSSProperties,

  playerCell: (isMe: boolean) => ({
    fontFamily: FONTS.primary,
    fontSize: '12px',
    color: isMe ? 'rgb(255, 215, 0)' : COLORS.white,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    letterSpacing: '0.5px',
  } as CSSProperties),

  playerCellPlaceholder: {
    fontFamily: FONTS.primary,
    fontSize: '12px',
    color: COLORS.gray,
    opacity: 0.5,
    letterSpacing: '0.5px',
  } as CSSProperties,

  playerCellEncourage: {
    fontFamily: FONTS.primary,
    fontSize: '12px',
    color: COLORS.primary,
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
  } as CSSProperties,

  youBadge: {
    fontSize: '12px',
    padding: '4px 8px',
    background: 'rgba(139, 92, 246, 0.3)',
    border: '1px solid rgb(255, 215, 0)',
    borderRadius: '3px',
    color: 'rgb(255, 215, 0)',
    fontFamily: FONTS.primary,
  } as CSSProperties,

  scoreCell: (isMe: boolean) => ({
    fontFamily: FONTS.primary,
    fontSize: '16px',
    color: isMe ? 'rgb(255, 215, 0)' : COLORS.primary,
    textAlign: 'right',
    fontWeight: 'bold',
  } as CSSProperties),

  scoreCellPlaceholder: {
    fontFamily: FONTS.primary,
    fontSize: '16px',
    color: COLORS.gray,
    textAlign: 'right',
    opacity: 0.5,
  } as CSSProperties,

  wpmCell: (isMe: boolean) => ({
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: isMe ? 'rgb(255, 215, 0)' : COLORS.white,
    textAlign: 'right',
  } as CSSProperties),

  wpmCellPlaceholder: {
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: COLORS.gray,
    textAlign: 'right',
    opacity: 0.5,
  } as CSSProperties,
} as const;
