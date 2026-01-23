'use client';

import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SoundSettingsProvider } from '../contexts/SoundSettingsContext';
import { privyConfig } from '../config/privy';

const queryClient = new QueryClient();

// Get Privy App ID and Client ID from environment
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
const PRIVY_CLIENT_ID = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID || '';

interface ProvidersProps {
    children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <PrivyProvider
            appId={PRIVY_APP_ID}
            clientId={PRIVY_CLIENT_ID}
            config={privyConfig}
        >
            <QueryClientProvider client={queryClient}>
                <SoundSettingsProvider>
                    {children}
                </SoundSettingsProvider>
            </QueryClientProvider>
        </PrivyProvider>
    );
}
