'use client';

import React, { useEffect } from 'react';
import GameStateManager from '../components/GameStateManager';
import { Analytics } from '@vercel/analytics/react';
import { Providers } from './providers';
import ErrorBoundary from '../components/ErrorBoundary';
import sdk from '@farcaster/frame-sdk';
import { validateEnvironment } from '../lib/validateEnv';

export default function Home() {
    useEffect(() => {
        const load = async () => {
            // Validate environment variables
            try {
                validateEnvironment();
            } catch (error) {
                console.error('Environment validation failed:', error);
                // Continue anyway for development
            }
            
            // Tell Farcaster app is ready
            sdk.actions.ready();
        };
        load();
    }, []);

    return (
        <Providers>
            <div style={{
                backgroundImage: 'url(/images/background-2.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: '100vh',
                width: '100%'
            }}>
                <Analytics />
                <ErrorBoundary>
                    <GameStateManager />
                </ErrorBoundary>
            </div>
        </Providers>
    );
}