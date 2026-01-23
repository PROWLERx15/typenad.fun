import { PrivyClientConfig } from '@privy-io/react-auth';

// Monad Testnet chain configuration
export const monadTestnet = {
    id: 10143,
    name: 'Monad Testnet',
    network: 'monad-testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'MONAD',
        symbol: 'MON',
    },
    rpcUrls: {
        default: { http: ['https://testnet-rpc.monad.xyz'] },
        public: { http: ['https://testnet-rpc.monad.xyz'] },
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
