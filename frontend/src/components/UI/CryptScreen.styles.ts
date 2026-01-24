import { CSSProperties } from 'react';
import { COLORS, FONTS } from '../../styles/theme';

// Common values
const BACKGROUNDS = {
  dark: 'rgba(0,0,0,0.5)',
  darker: 'rgba(0,0,0,0.8)',
  light: 'rgba(255,255,255,0.05)',
  darkTransparent: 'rgba(0,0,0,0.3)',
} as const;

const BORDERS = {
  light: 'rgba(255,255,255,0.2)',
  medium: 'rgba(255,255,255,0.3)',
  gold: 'rgba(139, 92, 246, 0.3)',
  goldStrong: 'rgba(139, 92, 246, 0.5)',
} as const;

const TRANSITIONS = {
  default: 'all 0.2s ease',
} as const;

const BORDER_RADIUS = {
  small: '4px',
  medium: '8px',
  large: '12px',
  pill: '20px',
} as const;

// Match history grid layout
const MATCH_GRID_COLUMNS = '1fr 80px 80px 60px 80px';

export const styles = {
  screenContainer: {
    zIndex: 1001,
  } as CSSProperties,

  closeButtonPosition: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    marginTop: '10px',
    marginRight: '10px',
    zIndex: 1003,
  } as CSSProperties,

  contentContainer: {
    maxWidth: '900px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    padding: '20px',
  } as CSSProperties,

  container: {
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '30px',
    background: BACKGROUNDS.darker,
    border: `2px solid ${BORDERS.medium}`,
    borderRadius: BORDER_RADIUS.medium,
  } as CSSProperties,

  title: {
    fontFamily: FONTS.primary,
    fontSize: '28px',
    color: COLORS.primary,
    marginBottom: '30px',
    textAlign: 'center',
    textShadow: '2px 4px 8px #000',
  } as CSSProperties,

  section: {
    marginBottom: '30px',
    padding: '20px',
    background: BACKGROUNDS.light,
    border: `2px solid ${BORDERS.light}`,
    borderRadius: BORDER_RADIUS.medium,
  } as CSSProperties,

  sectionTitle: {
    fontFamily: FONTS.primary,
    fontSize: '16px',
    color: COLORS.primary,
    marginBottom: '20px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  } as CSSProperties,

  // Statistics Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
  } as CSSProperties,

  statCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    background: BACKGROUNDS.dark,
    border: `2px solid ${BORDERS.light}`,
    borderRadius: BORDER_RADIUS.medium,
  } as CSSProperties,

  statValue: {
    fontSize: '24px',
    color: COLORS.primary,
    fontFamily: FONTS.primary,
    textShadow: '2px 2px 4px #000',
    marginBottom: '8px',
  } as CSSProperties,

  statLabel: {
    fontSize: '10px',
    color: COLORS.gray,
    fontFamily: FONTS.primary,
    textTransform: 'uppercase',
    textAlign: 'center',
  } as CSSProperties,

  // Inventory Section
  inventoryGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'center',
  } as CSSProperties,

  inventoryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 15px',
    background: BACKGROUNDS.dark,
    border: `2px solid ${BORDERS.light}`,
    borderRadius: BORDER_RADIUS.medium,
  } as CSSProperties,

  inventoryName: {
    fontFamily: FONTS.primary,
    fontSize: '10px',
    color: COLORS.white,
  } as CSSProperties,

  inventoryQuantity: {
    fontFamily: FONTS.primary,
    fontSize: '12px',
    color: COLORS.primary,
    fontWeight: 'bold',
  } as CSSProperties,

  emptyState: {
    textAlign: 'center',
    padding: '40px',
    fontFamily: FONTS.primary,
    fontSize: '12px',
    color: COLORS.gray,
  } as CSSProperties,

  achievementsTitle: {
    fontFamily: FONTS.primary,
    fontSize: '24px',
    color: COLORS.primary,
    marginBottom: '10px',
    textAlign: 'center',
  } as CSSProperties,

  achievementsSubtitle: {
    fontFamily: FONTS.primary,
    fontSize: '12px',
    color: COLORS.gray,
    marginBottom: '30px',
    textAlign: 'center',
  } as CSSProperties,

  // Chain ID section
  chainIdContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '15px',
    background: BACKGROUNDS.dark,
    border: `1px solid ${BORDERS.light}`,
    borderRadius: BORDER_RADIUS.small,
  } as CSSProperties,

  chainIdLabel: {
    fontFamily: FONTS.primary,
    fontSize: '12px',
    color: COLORS.gray,
  } as CSSProperties,

  chainIdValue: {
    fontFamily: FONTS.mono,
    fontSize: '12px',
    color: COLORS.white,
    flex: 1,
    wordBreak: 'break-all',
  } as CSSProperties,

  // Achievements section
  achievementsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px',
    marginTop: '20px',
  } as CSSProperties,

  enemyCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '15px',
    background: BACKGROUNDS.dark,
    border: `2px solid ${BORDERS.light}`,
    borderRadius: BORDER_RADIUS.medium,
    transition: TRANSITIONS.default,
  } as CSSProperties,

  enemyCardUnlocked: {
    borderColor: COLORS.primary,
    background: 'rgba(139,92,246,0.1)',
  } as CSSProperties,

  enemyImageContainer: {
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px',
    position: 'relative',
    overflow: 'hidden',
  } as CSSProperties,

  lockIcon: {
    position: 'absolute',
    fontSize: '48px',
    opacity: 0.5,
  } as CSSProperties,

  enemyName: {
    fontFamily: FONTS.primary,
    fontSize: '10px',
    color: COLORS.white,
    marginBottom: '5px',
    textAlign: 'center',
  } as CSSProperties,

  enemyNameUnlocked: {
    color: COLORS.primary,
  } as CSSProperties,

  enemyStatus: {
    fontFamily: FONTS.primary,
    fontSize: '10px',
    color: COLORS.gray,
    textAlign: 'center',
  } as CSSProperties,

  // Quests section
  comingSoonContainer: {
    padding: '40px',
    textAlign: 'center',
    background: BACKGROUNDS.darkTransparent,
    border: `2px dashed ${BORDERS.light}`,
    borderRadius: BORDER_RADIUS.medium,
  } as CSSProperties,

  comingSoonText: {
    fontFamily: FONTS.primary,
    fontSize: '16px',
    lineHeight: '1.6',
    color: COLORS.gray,
    marginTop: '10px',
  } as CSSProperties,

  comingSoonIcon: {
    fontSize: '48px',
    marginBottom: '10px',
  } as CSSProperties,

  // Close button
  closeButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'rgba(255,0,0,0.2)',
    border: '2px solid rgba(255,0,0,0.5)',
    color: COLORS.red,
    fontFamily: FONTS.primary,
    fontSize: '14px',
    padding: '8px 15px',
    borderRadius: BORDER_RADIUS.small,
    cursor: 'pointer',
    transition: TRANSITIONS.default,
  } as CSSProperties,

  // Tab Navigation
  tabNav: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    borderBottom: `2px solid ${BORDERS.light}`,
    paddingBottom: '10px',
  } as CSSProperties,

  tabButton: (isActive: boolean) => ({
    background: isActive ? 'rgba(139,92,246,0.3)' : BACKGROUNDS.dark,
    border: isActive ? `2px solid ${COLORS.primary}` : `2px solid ${BORDERS.light}`,
    color: isActive ? COLORS.primary : COLORS.white,
    fontFamily: FONTS.primary,
    fontSize: '12px',
    lineHeight: '14px',
    padding: '10px 20px',
    borderRadius: BORDER_RADIUS.small,
    cursor: 'pointer',
    transition: TRANSITIONS.default,
  } as CSSProperties),

  // Coming Soon
  comingSoonSubtitle: {
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: COLORS.gray,
    marginBottom: '20px',
    textAlign: 'center',
  } as CSSProperties,

  // Achievement Sprite
  achievementSprite: (imagePath: string, bgX: number, bgY: number, spriteWidth: number, spriteHeight: number, isUnlocked: boolean) => ({
    width: spriteWidth / 3,
    height: spriteHeight / 2,
    backgroundImage: `url(${imagePath})`,
    backgroundPosition: `${bgX}px ${bgY}px`,
    backgroundSize: `${spriteWidth}px ${spriteHeight}px`,
    imageRendering: 'pixelated',
    transform: 'scale(0.18, 0.18)',
    position: 'absolute',
    left: '50%',
    top: '50%',
    transformOrigin: 'center center',
    translate: '-50% -50%',
    filter: isUnlocked ? 'none' : 'brightness(0)',
  } as CSSProperties),

  rewardsText: {
    fontFamily: FONTS.primary,
    fontSize: '12px',
    marginTop: '5px',
  } as CSSProperties,

  // Match History styles
  matchHistoryContainer: {
    marginTop: '10px',
  } as CSSProperties,

  matchHistoryHeader: {
    display: 'grid',
    gridTemplateColumns: MATCH_GRID_COLUMNS,
    padding: '12px 15px',
    borderBottom: `1px solid ${BORDERS.light}`,
    fontSize: '10px',
    color: COLORS.gray,
    fontFamily: FONTS.primary,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  } as CSSProperties,

  matchHistoryHeaderRight: {
    textAlign: 'right',
  } as CSSProperties,

  matchRow: (borderBottom: boolean): CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: MATCH_GRID_COLUMNS,
    padding: '12px 15px',
    borderBottom: borderBottom ? `1px solid ${BORDERS.light}` : 'none',
    fontSize: '12px',
    color: COLORS.white,
    fontFamily: FONTS.primary,
    alignItems: 'center',
  }),

  matchDate: {
    color: COLORS.gray,
    fontSize: '10px',
  } as CSSProperties,

  matchMode: {
    color: COLORS.primary,
    fontSize: '10px',
  } as CSSProperties,

  matchScore: {
    color: COLORS.white,
    fontSize: '12px',
    fontWeight: 'bold',
  } as CSSProperties,

  matchWpm: {
    color: COLORS.gray,
    fontSize: '11px',
  } as CSSProperties,

  matchGold: {
    color: '#FFD700',
    fontSize: '11px',
    textAlign: 'right',
  } as CSSProperties,

  matchOpponent: {
    fontSize: '12px',
    letterSpacing: '0.5px',
  } as CSSProperties,

  matchResult: (won: boolean): CSSProperties => ({
    color: won ? COLORS.success : COLORS.error,
    fontWeight: 'bold',
  }),
} as const;
