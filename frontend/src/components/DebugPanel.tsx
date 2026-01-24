'use client';

import React, { useEffect, useState } from 'react';
import { usePrivyWallet } from '../hooks/usePrivyWallet';
import { useUSDC } from '../hooks/useUSDC';
import { useTypeNadContract } from '../hooks/useTypeNadContract';

export const DebugPanel: React.FC = () => {
    const { address, isConnected } = usePrivyWallet();
    const { getBalance, USDC_ADDRESS } = useUSDC();
    const { getEntropyFee, publicClient } = useTypeNadContract();
    const [balance, setBalance] = useState<bigint>(0n);
    const [entropyFee, setEntropyFee] = useState<bigint>(0n);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (isConnected && address) {
            const fetchData = async () => {
                try {
                    const bal = await getBalance();
                    setBalance(bal);
                } catch (err: any) {
                    console.error('DebugPanel: Failed to fetch balance:', err);
                    setError(err.message || 'Failed to fetch balance');
                }

                try {
                    const fee = await getEntropyFee();
                    setEntropyFee(fee);
                } catch (err: any) {
                    console.error('DebugPanel: Failed to fetch entropy fee:', err);
                    // Don't set error for entropy fee - it's expected to fail sometimes
                    // Just use the default value from the catch in getEntropyFee
                    setEntropyFee(0n);
                }
            };
            fetchData();
        }
    }, [isConnected, address, getBalance, getEntropyFee]);

    if (!isConnected) {
        return null;
    }

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '10px',
                right: '10px',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '15px',
                borderRadius: '8px',
                fontSize: '11px',
                fontFamily: 'monospace',
                maxWidth: '300px',
                zIndex: 9999,
                border: '1px solid #8B5CF6',
            }}
        >
            <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#8B5CF6' }}>
                🔍 Debug Panel
            </div>
            <div style={{ marginBottom: '5px' }}>
                <strong>Wallet:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
            <div style={{ marginBottom: '5px' }}>
                <strong>USDC Addr:</strong> {USDC_ADDRESS}
            </div>
            <div style={{ marginBottom: '5px' }}>
                <strong>USDC Balance:</strong> {(Number(balance) / 1e6).toFixed(2)} USDC
            </div>
            <div style={{ marginBottom: '5px' }}>
                <strong>Balance (raw):</strong> {balance.toString()}
            </div>
            <div style={{ marginBottom: '5px' }}>
                <strong>Entropy Fee:</strong> {(Number(entropyFee) / 1e18).toFixed(6)} WAN
            </div>
            <div style={{ marginBottom: '5px' }}>
                <strong>RPC:</strong> {process.env.NEXT_PUBLIC_MONAD_RPC_TESTNET || 'fallback'}
            </div>
            {error && (
                <div style={{ marginTop: '10px', color: '#ef4444', fontSize: '10px' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}
        </div>
    );
};
