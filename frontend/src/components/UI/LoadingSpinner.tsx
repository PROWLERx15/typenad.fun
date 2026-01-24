'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message 
}) => {
  const sizeMap = {
    small: 24,
    medium: 48,
    large: 72,
  };

  const spinnerSize = sizeMap[size];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: `${spinnerSize}px`,
          height: `${spinnerSize}px`,
          border: '4px solid rgba(0, 255, 136, 0.2)',
          borderTop: '4px solid #00FF88',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      {message && (
        <div
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: size === 'small' ? '10px' : size === 'medium' ? '12px' : '14px',
            color: '#00FF88',
            textAlign: 'center',
            lineHeight: '1.5',
          }}
        >
          {message}
        </div>
      )}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
