import { CSSProperties } from 'react';
import { COLORS, FONTS } from '../../styles/theme';

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
} as const;

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

  title: {
    fontFamily: FONTS.primary,
    fontSize: '28px',
    color: COLORS.primary,
    marginBottom: '30px',
    textAlign: 'center',
    textShadow: '2px 4px 8px #000',
  } as CSSProperties,

  // Tab Navigation
  tabNav: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
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

  goldDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%)',
    border: `2px solid ${BORDERS.goldStrong}`,
    borderRadius: BORDER_RADIUS.medium,
    boxShadow: '0 0 15px rgba(139, 92, 246, 0.2)',
  } as CSSProperties,

  goldIcon: {
    width: '32px',
    height: '32px',
    imageRendering: 'pixelated',
  } as CSSProperties,

  goldAmount: {
    fontFamily: FONTS.primary,
    fontSize: '24px',
    color: '#8B5CF6',
    textShadow: '2px 4px 8px #000, 0 2px 0 #222',
  } as CSSProperties,

  goldLabel: {
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: '#FFA500',
    opacity: 0.9,
  } as CSSProperties,

  // Equipped Section
  equippedGrid: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  } as CSSProperties,

  equippedItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 15px',
    background: 'rgba(139, 92, 246, 0.2)',
    border: `2px solid ${COLORS.primary}`,
    borderRadius: BORDER_RADIUS.medium,
    position: 'relative',
  } as CSSProperties,

  equippedIcon: {
    width: '24px',
    height: '24px',
    imageRendering: 'pixelated',
  } as CSSProperties,

  equippedName: {
    fontFamily: FONTS.primary,
    fontSize: '10px',
    color: COLORS.white,
  } as CSSProperties,

  unequipButton: {
    background: 'rgba(255, 68, 68, 0.3)',
    border: '1px solid #FF4444',
    borderRadius: '4px',
    color: '#FF4444',
    fontSize: '12px',
    padding: '4px 8px',
    cursor: 'pointer',
    marginLeft: '5px',
  } as CSSProperties,

  equippedNote: {
    fontFamily: FONTS.primary,
    fontSize: '10px',
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: '15px',
    opacity: 0.7,
  } as CSSProperties,

  // Items Grid
  itemsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  } as CSSProperties,

  itemCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    background: BACKGROUNDS.dark,
    border: `2px solid ${BORDERS.light}`,
    borderRadius: BORDER_RADIUS.medium,
    transition: TRANSITIONS.default,
    position: 'relative',
  } as CSSProperties,

  itemCardEquipped: {
    borderColor: COLORS.primary,
    background: 'rgba(139, 92, 246, 0.1)',
    boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)',
  } as CSSProperties,

  ownedBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(0, 255, 136, 0.2)',
    border: '1px solid #00FF88',
    borderRadius: '4px',
    padding: '4px 8px',
    fontFamily: FONTS.primary,
    fontSize: '8px',
    color: '#00FF88',
  } as CSSProperties,

  quantityBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(139, 92, 246, 0.3)',
    border: `2px solid ${COLORS.primary}`,
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: FONTS.primary,
    fontSize: '12px',
    color: COLORS.white,
  } as CSSProperties,

  itemIcon: {
    fontSize: '64px',
    marginBottom: '15px',
  } as CSSProperties,

  itemIconImage: {
    width: '64px',
    height: 'auto',
    imageRendering: 'pixelated',
  } as CSSProperties,

  itemName: {
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: COLORS.primary,
    marginBottom: '10px',
    textAlign: 'center',
  } as CSSProperties,

  itemDescription: {
    fontFamily: FONTS.primary,
    fontSize: '10px',
    color: COLORS.gray,
    marginBottom: '15px',
    textAlign: 'center',
    lineHeight: '1.6',
  } as CSSProperties,

  itemPrice: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: '#8B5CF6',
    marginBottom: '15px',
  } as CSSProperties,

  priceIcon: {
    width: '20px',
    height: '20px',
    imageRendering: 'pixelated',
  } as CSSProperties,

  buyButton: {
    fontFamily: FONTS.primary,
    fontSize: '11px',
    padding: '10px 20px',
    background: 'rgba(139, 92, 246, 0.1)',
    border: `2px solid ${BORDERS.gold}`,
    borderRadius: BORDER_RADIUS.small,
    color: COLORS.primary,
    cursor: 'pointer',
    transition: TRANSITIONS.default,
    width: '100%',
  } as CSSProperties,

  buyButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as CSSProperties,

  buyButtonOwned: {
    background: 'rgba(0, 255, 0, 0.1)',
    border: '2px solid rgba(0, 255, 0, 0.3)',
    color: 'rgba(0, 255, 0, 0.8)',
    cursor: 'default',
  } as CSSProperties,

  equipButton: {
    fontFamily: FONTS.primary,
    fontSize: '11px',
    padding: '10px 20px',
    background: 'rgba(139, 92, 246, 0.1)',
    border: `2px solid ${COLORS.primary}`,
    borderRadius: BORDER_RADIUS.small,
    color: COLORS.primary,
    cursor: 'pointer',
    transition: TRANSITIONS.default,
    width: '100%',
  } as CSSProperties,

  equipButtonActive: {
    background: 'rgba(0, 255, 136, 0.2)',
    border: '2px solid #00FF88',
    color: '#00FF88',
  } as CSSProperties,

  emptyInventory: {
    textAlign: 'center',
    padding: '40px',
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: COLORS.gray,
  } as CSSProperties,

  comingSoonSubtitle: {
    fontFamily: FONTS.primary,
    fontSize: '14px',
    color: COLORS.gray,
    marginBottom: '20px',
    textAlign: 'center',
  } as CSSProperties,
} as const;
