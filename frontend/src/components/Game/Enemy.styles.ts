import { CSSProperties } from 'react';
import { Enemy } from './types';

const SPRITE_WIDTH = 1024;
const SPRITE_HEIGHT = 1024;
const SPRITE_COLS = 3;
const SPRITE_ROWS = 2;
const ZOMBIE_WIDTH = SPRITE_WIDTH / SPRITE_COLS;
const ZOMBIE_HEIGHT = SPRITE_HEIGHT / SPRITE_ROWS;
const DISPLAY_WIDTH = Math.round(128/3);
const DISPLAY_HEIGHT = Math.round(192/3);

export const styles = {
  container: (zombie: Enemy): CSSProperties => ({
    userSelect: 'none',
    WebkitUserSelect: 'none',
    position: 'absolute',
    top: zombie.position,
    left: `${zombie.left}%`,
    width: DISPLAY_WIDTH,
    height: DISPLAY_HEIGHT + 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pointerEvents: 'none',
    background: 'none',
    border: 'none',
    boxSizing: 'border-box',
    overflow: 'visible',
    opacity: zombie.dying ? 0 : 1,
    transform: zombie.dying ? 'scale(2)' : 'scale(1)',
    filter: zombie.dying ? 'blur(5px)' : 'none',
    transition: zombie.dying ? 'all 0.8s ease-out' : 'none',
  }),

  healthBarContainer: (zombieType: string): CSSProperties => ({
    position: 'absolute',
    top: zombieType === 'deathrider' ? -75 : -14,
    width: DISPLAY_WIDTH,
    height: 8,
    background: '#444',
    borderRadius: 3,
    marginTop: 12,
    zIndex: 20,
  }),

  healthBarFill: (health: number): CSSProperties => ({
    width: `${health}%`,
    height: '100%',
    background: 'limegreen',
    borderRadius: 3,
    transition: 'width 0.2s',
  }),

  spriteContainer: {
    width: DISPLAY_WIDTH,
    height: DISPLAY_HEIGHT,
    position: 'relative',
    marginBottom: 2,
    overflow: 'visible',
  } as CSSProperties,

  sprite: (imagePath: string, bgX: number, bgY: number, scale: number, top: number, dying: boolean | undefined, flash: boolean): CSSProperties => ({
    width: ZOMBIE_WIDTH,
    height: ZOMBIE_HEIGHT,
    backgroundImage: `url(${imagePath})`,
    backgroundPosition: `${bgX}px ${bgY}px`,
    backgroundSize: `${SPRITE_WIDTH}px ${SPRITE_HEIGHT}px`,
    imageRendering: 'pixelated',
    transform: `scale(${scale}, ${scale})`,
    position: 'absolute',
    left: '50%',
    top: top,
    transformOrigin: 'top center',
    translate: '-50%',
    pointerEvents: 'none',
    filter: dying
      ? 'grayscale(1) brightness(0.3) contrast(1.2)'
      : flash
        ? 'brightness(1.5) saturate(2) hue-rotate(320deg)'
        : 'none',
    transition: dying ? 'filter 0.8s ease-out' : 'filter 0.1s',
  }),

  wordLabel: (isRemote: boolean | undefined, isTwoLine: boolean, baseOffset: number): CSSProperties => ({
    fontFamily: 'monospace',
    fontSize: 14,
    background: isRemote ? 'purple' : 'rgba(0,0,0,0.7)',
    color: '#fff',
    border: '2px solid red',
    borderRadius: 4,
    padding: '2px 8px',
    marginBottom: isTwoLine ? -30 : baseOffset,
    textAlign: 'center',
    pointerEvents: 'auto',
    minWidth: 36,
    lineHeight: 1.2,
    zIndex: 10,
  }),

  // Bomb-specific styles
  bombContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 200,
    height: 200,
    pointerEvents: 'none',
    zIndex: 100,
  } as CSSProperties,

  explosion: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 300,
    height: 300,
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    animation: 'explode 0.6s ease-out forwards',
    pointerEvents: 'none',
    zIndex: 100,
  } as CSSProperties,
} as const;

export const explosionKeyframes = `
  @keyframes explode {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 1;
      background: radial-gradient(circle,
        rgba(255, 255, 200, 1) 0%,
        rgba(255, 200, 0, 0.9) 20%,
        rgba(255, 100, 0, 0.7) 40%,
        rgba(200, 0, 0, 0.5) 60%,
        rgba(100, 0, 0, 0.2) 80%,
        transparent 100%
      );
      box-shadow:
        0 0 20px 10px rgba(255, 200, 0, 0.8),
        0 0 40px 20px rgba(255, 100, 0, 0.6),
        0 0 60px 30px rgba(200, 0, 0, 0.4);
    }
    50% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
      background: radial-gradient(circle,
        rgba(255, 255, 255, 1) 0%,
        rgba(255, 200, 0, 0.9) 15%,
        rgba(255, 100, 0, 0.8) 30%,
        rgba(200, 50, 0, 0.6) 50%,
        rgba(100, 0, 0, 0.3) 70%,
        transparent 100%
      );
      box-shadow:
        0 0 30px 15px rgba(255, 255, 0, 1),
        0 0 60px 30px rgba(255, 100, 0, 0.8),
        0 0 90px 45px rgba(200, 0, 0, 0.6);
    }
    100% {
      transform: translate(-50%, -50%) scale(1.5);
      opacity: 0;
      background: radial-gradient(circle,
        rgba(255, 100, 0, 0.3) 0%,
        rgba(200, 0, 0, 0.2) 30%,
        transparent 60%
      );
      box-shadow:
        0 0 40px 20px rgba(255, 100, 0, 0.3),
        0 0 80px 40px rgba(200, 0, 0, 0.2);
    }
  }
`;
