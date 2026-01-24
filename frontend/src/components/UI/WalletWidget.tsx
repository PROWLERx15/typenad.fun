'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import QRCode from 'react-qr-code';
import { createPublicClient, http, erc20Abi, formatUnits } from 'viem';
import { usePrivyWallet } from '../../hooks/usePrivyWallet';
import { monadTestnet } from '../../config/privy';
import { USDC_ADDRESS, USDC_DECIMALS } from '../../hooks/useUSDC';
import styles from './WalletWidget.module.css';

// RPC URL
const RPC_URL = process.env.MONAD_RPC_TESTNET || 'https://testnet-rpc.monad.xyz';

interface WalletWidgetProps {
    className?: string;
}

export const WalletWidget: React.FC<WalletWidgetProps> = ({ className }) => {
    const { address, isConnected } = usePrivyWallet();
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [monBalance, setMonBalance] = useState<string | null>(null);
    const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
    const [isLoadingBalances, setIsLoadingBalances] = useState(false);
    const [balanceError, setBalanceError] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Create public client for reads
    const publicClient = React.useMemo(
        () =>
            createPublicClient({
                chain: monadTestnet,
                transport: http(RPC_URL),
            }),
        []
    );

    // Fetch balances
    const fetchBalances = useCallback(async () => {
        if (!address) return;

        setIsLoadingBalances(true);
        setBalanceError(null);

        try {
            // Fetch native MON balance
            const nativeBalance = await publicClient.getBalance({
                address: address as `0x${string}`,
            });
            const formattedMon = formatUnits(nativeBalance, 18);
            // Format to 4 decimal places
            setMonBalance(parseFloat(formattedMon).toFixed(4));

            // Fetch USDC balance
            const usdcBal = await publicClient.readContract({
                address: USDC_ADDRESS,
                abi: erc20Abi,
                functionName: 'balanceOf',
                args: [address as `0x${string}`],
            });
            const formattedUsdc = formatUnits(usdcBal, USDC_DECIMALS);
            setUsdcBalance(parseFloat(formattedUsdc).toFixed(2));
        } catch (err) {
            console.error('Error fetching balances:', err);
            setBalanceError('Failed to fetch balances');
        } finally {
            setIsLoadingBalances(false);
        }
    }, [address, publicClient]);

    // Fetch balances when modal opens
    useEffect(() => {
        if (isOpen && address) {
            fetchBalances();
        }
    }, [isOpen, address, fetchBalances]);

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen]);

    // Copy to clipboard
    const handleCopy = async () => {
        if (!address) return;

        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = address;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isConnected || !address) {
        return null;
    }

    return (
        <div className={`${styles.walletWidgetContainer} ${className || ''}`}>
            <button
                className={styles.walletButton}
                onClick={() => setIsOpen(!isOpen)}
            >
                Wallet
            </button>

            {isOpen && (
                <div className={styles.modalOverlay}>
                    <div ref={modalRef} className={styles.modal}>
                        {/* Header */}
                        <div className={styles.modalHeader}>
                            <span className={styles.modalTitle}>Wallet</span>
                            <button
                                className={styles.closeButton}
                                onClick={() => setIsOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Address Section */}
                        <div className={styles.addressSection}>
                            <span className={styles.addressLabel}>Address</span>
                            <div className={styles.addressRow}>
                                <span className={styles.fullAddress}>{address}</span>
                                <button
                                    className={styles.clipboardIcon}
                                    onClick={handleCopy}
                                    title={copied ? 'Copied!' : 'Copy address'}
                                >
                                    {copied ? '✓' : '⎘'}
                                </button>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className={styles.qrSection}>
                            <span className={styles.qrLabel}>Receive Funds</span>
                            <div className={styles.qrContainer}>
                                <QRCode
                                    value={address}
                                    size={140}
                                    bgColor="#0a0a1a"
                                    fgColor="#8B5CF6"
                                    level="M"
                                />
                            </div>
                        </div>

                        {/* Balances */}
                        <div className={styles.balancesSection}>
                            <span className={styles.balancesLabel}>Balances</span>
                            {isLoadingBalances ? (
                                <div className={styles.loadingText}>Loading...</div>
                            ) : balanceError ? (
                                <div className={styles.errorText}>{balanceError}</div>
                            ) : (
                                <div className={styles.balancesList}>
                                    <div className={styles.balanceRow}>
                                        <span className={styles.tokenName}>MON</span>
                                        <span className={styles.tokenBalance}>
                                            {monBalance || '0.0000'}
                                        </span>
                                    </div>
                                    <div className={styles.balanceRow}>
                                        <span className={styles.tokenName}>USDC</span>
                                        <span className={styles.tokenBalance}>
                                            {usdcBalance || '0.00'}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <button
                                className={styles.refreshButton}
                                onClick={fetchBalances}
                                disabled={isLoadingBalances}
                            >
                                {isLoadingBalances ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletWidget;
