import { CSSProperties } from 'react';

export const styles = {
  container: {
    display: 'flex',
    gap: '5px',
  } as CSSProperties,

  heart: {
    width: '20px',
    height: '20px',
    backgroundColor: 'red',
    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  } as CSSProperties,
} as const;
