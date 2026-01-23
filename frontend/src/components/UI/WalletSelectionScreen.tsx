'use client';

import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { usePrivyWallet } from '../../hooks/usePrivyWallet';
import { BUTTON_STYLES, SCREEN_STYLES, mergeStyles } from '../../styles/theme';
import { styles } from './WalletSelectionScreen.styles';

interface WalletSelectionScreenProps {
  onClose: () => void;
  onWalletConnected?: () => void;
}

const WalletSelectionScreen: React.FC<WalletSelectionScreenProps> = ({
  onClose,
  onWalletConnected
}) => {
  const { login, ready, authenticated } = usePrivy();
  const { isConnected, address } = usePrivyWallet();
  const [isLoading, setIsLoading] = React.useState(false);
  const [googleHover, setGoogleHover] = React.useState(false);

  // Handle Google login click
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  // After Privy auth, setup wallet
  React.useEffect(() => {
    if (authenticated && isConnected && address) {
      localStorage.setItem('wallet_address', address);
      onWalletConnected?.();
      onClose();
    }
  }, [authenticated, isConnected, address, onWalletConnected, onClose]);

  // Escape to close
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape, true);
    return () => document.removeEventListener('keydown', handleEscape, true);
  }, [onClose, isLoading]);

  return (
    <div style={mergeStyles(
      SCREEN_STYLES.fullScreen,
      SCREEN_STYLES.centered,
      SCREEN_STYLES.backgroundCover,
      styles.overlayContainer
    )}>
      {!isLoading && (
        <button
          onClick={onClose}
          style={mergeStyles(BUTTON_STYLES.small, styles.closeButton)}
        >
          Close
        </button>
      )}

      <div style={styles.container}>
        {isLoading ? (
          <>
            <h2 style={styles.title}>Setting Up Your Account...</h2>
            <p style={styles.optionDescription}>
              Please wait while we create your wallet
            </p>
          </>
        ) : (
          <>
            <h2 style={styles.title}>Welcome to TypeDuel Pro</h2>
            <p style={styles.optionDescription}>
              Sign in with Google to start playing
            </p>

            <div style={styles.options}>
              <div style={styles.option}>
                <button
                  onClick={handleGoogleLogin}
                  disabled={!ready}
                  style={{
                    ...styles.button,
                    ...(googleHover ? styles.buttonHover : {}),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 24px',
                  }}
                  onMouseEnter={() => setGoogleHover(true)}
                  onMouseLeave={() => setGoogleHover(false)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              </div>
            </div>

            <p style={{ ...styles.optionDescription, fontSize: '10px', marginTop: '20px' }}>
              Your Monad wallet will be created automatically
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default WalletSelectionScreen;
