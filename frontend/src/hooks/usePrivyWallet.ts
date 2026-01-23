import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

/**
 * Privy wallet hook - provides same interface as wagmi useAccount
 * for minimal migration effort
 */
export function usePrivyWallet() {
    const { ready, authenticated, user, login, logout } = usePrivy();
    const { wallets } = useWallets();
    const [walletError, setWalletError] = useState<string | null>(null);

    // Get embedded wallet (created by Privy)
    const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');

    // Detect wallet creation timeout
    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (authenticated && !embeddedWallet) {
            // If wallet doesn't appear after 15 seconds, show error
            timeout = setTimeout(() => {
                setWalletError('Wallet creation timed out. Please try logging out and back in.');
                console.error('⏱️ Wallet creation timeout');
            }, 15000);
        } else if (embeddedWallet) {
            setWalletError(null);
        }

        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [authenticated, embeddedWallet]);

    return {
        // Compatibility with wagmi useAccount
        isConnected: authenticated && !!embeddedWallet,
        address: embeddedWallet?.address as `0x${string}` | undefined,

        // Privy-specific
        ready,
        authenticated,
        user,
        login,
        logout,

        // Wallet
        wallet: embeddedWallet,
        wallets,

        // Error handling
        walletError,
        clearWalletError: () => setWalletError(null),
    };
}

/**
 * Hook to get disconnect function - compatible with wagmi useDisconnect
 */
export function usePrivyDisconnect() {
    const { logout } = usePrivy();

    return {
        disconnect: logout,
    };
}
