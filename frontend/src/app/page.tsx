'use client';

import React, { useEffect } from 'react'; // 1. Added useEffect
import GameStateManager from '../components/GameStateManager';
import { Analytics } from '@vercel/analytics/react';
import { Providers } from './providers';
import ErrorBoundary from '../components/ErrorBoundary';
import sdk from '@farcaster/frame-sdk'; // 2. Added SDK import

export default function Home() {
    // 3. Add this effect to tell Farcaster your app is ready
    useEffect(() => {
        const load = async () => {
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