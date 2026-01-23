'use client';

import React from 'react';
import GameStateManager from '../components/GameStateManager';
import { Analytics } from '@vercel/analytics/react';
import { Providers } from './providers';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Home() {
    return (
        <Providers>
            <div style={{
                backgroundImage: 'url(/images/background_new.png)',
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
