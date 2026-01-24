import { PrivyClientConfig } from '@privy-io/react-auth';
import { type Chain } from 'viem';

// Monad Testnet chain configuration (viem compatible)
export const monadTestnet: Chain = {
    id: 10143,
    name: 'Monad Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'MONAD',
        symbol: 'MON',
    },
    rpcUrls: {
        default: { http: ['https://testnet-rpc.monad.xyz'] },
    },
    blockExplorers: {
        default: { name: 'MonadScan', url: 'https://testnet.monadexplorer.com' },
    },
};

export const privyConfig: PrivyClientConfig = {
    // Appearance - Monad Purple theme
    appearance: {
        theme: 'dark',
        accentColor: '#8B5CF6', // Monad purple
        logo: '/images/typenad.png',
        showWalletLoginFirst: false,
    },

    // Login methods - Google only for zero friction
    loginMethods: ['google', 'email'],

    // Embedded wallet config - auto-create on login
    embeddedWallets: {
        ethereum: {
            createOnLogin: 'users-without-wallets',
        },
    },

    // Default to Monad testnet
    defaultChain: monadTestnet,
    supportedChains: [monadTestnet],
};
