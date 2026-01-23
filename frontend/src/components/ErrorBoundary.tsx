'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { SCREEN_STYLES, BUTTON_STYLES, mergeStyles } from '../styles/theme';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={mergeStyles(
                    SCREEN_STYLES.fullScreen,
                    SCREEN_STYLES.centered,
                    SCREEN_STYLES.backgroundCover,
                    { backgroundColor: '#000', color: '#ff4444', flexDirection: 'column', gap: '20px', padding: '20px', textAlign: 'center' }
                )}>
                    <h1 style={{ fontSize: '24px', fontFamily: '"Press Start 2P", monospace' }}>SYSTEM FAILURE</h1>
                    <p style={{ fontFamily: 'monospace', maxWidth: '600px' }}>
                        A critical error has occurred in the flight control system.
                    </p>
                    <pre style={{
                        backgroundColor: '#1a1a1a',
                        padding: '10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        maxWidth: '80%',
                        overflow: 'auto',
                        border: '1px solid #333'
                    }}>
                        {this.state.error?.message}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        style={BUTTON_STYLES.medium}
                    >
                        Reboot System
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
