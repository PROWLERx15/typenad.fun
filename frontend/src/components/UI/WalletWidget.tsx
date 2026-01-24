'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import QRCode from 'react-qr-code';
import { createPublicClient, createWalletClient, custom, http, erc20Abi, formatUnits, parseUnits, isAddress, type Hash } from 'viem';
import { usePrivyWallet } from '../../hooks/usePrivyWallet';
import { monadTestnet } from '../../config/privy';
import { USDC_ADDRESS, USDC_DECIMALS } from '../../hooks/useUSDC';
import styles from './WalletWidget.module.css';

// RPC URL
const RPC_URL = process.env.MONAD_RPC_TESTNET || 'https://testnet-rpc.monad.xyz';

type TabMode = 'receive' | 'send';
type TokenType = 'MON' | 'USDC';

interface WalletWidgetProps {
    className?: string;
}

export const WalletWidget: React.FC<WalletWidgetProps> = ({ className }) => {
    const { address, isConnected, wallet } = usePrivyWallet();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabMode>('receive');
    const [copied, setCopied] = useState(false);
    const [monBalance, setMonBalance] = useState<string | null>(null);
    const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
    const [isLoadingBalances, setIsLoadingBalances] = useState(false);
    const [balanceError, setBalanceError] = useState<string | null>(null);
    
    // Send form state
    const [recipientAddress, setRecipientAddress] = useState('');
    const [selectedToken, setSelectedToken] = useState<TokenType>('MON');
    const [amount, setAmount] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const [sendSuccess, setSendSuccess] = useState<string | null>(null);
    
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

    // Get wallet client for transactions
    const getWalletClient = useCallback(async () => {
        if (!wallet || !address) {
            throw new Error('Wallet not connected');
        }
        const provider = await wallet.getEthereumProvider();
        return createWalletClient({
            chain: monadTestnet,
            transport: custom(provider),
            account: address as `0x${string}`,
        });
    }, [wallet, address]);

    // Validate send form
    const validateSendForm = useCallback((): string | null => {
        if (!recipientAddress) {
            return 'Recipient address is required';
        }
        if (!isAddress(recipientAddress)) {
            return 'Invalid recipient address';
        }
        if (!amount || parseFloat(amount) <= 0) {
            return 'Amount must be greater than zero';
        }

        const amountNum = parseFloat(amount);
        const balance = selectedToken === 'MON' 
            ? parseFloat(monBalance || '0') 
            : parseFloat(usdcBalance || '0');

        if (amountNum > balance) {
            return `Insufficient ${selectedToken} balance`;
        }

        return null;
    }, [recipientAddress, amount, selectedToken, monBalance, usdcBalance]);

    // Send transaction
    const handleSend = useCallback(async () => {
        const validationError = validateSendForm();
        if (validationError) {
            setSendError(validationError);
            return;
        }

        setIsSending(true);
        setSendError(null);
        setSendSuccess(null);

        try {
            const walletClient = await getWalletClient();
            let txHash: Hash;

            if (selectedToken === 'MON') {
                // Send native MON
                const value = parseUnits(amount, 18);
                txHash = await walletClient.sendTransaction({
                    to: recipientAddress as `0x${string}`,
                    value,
                });
            } else {
                // Send USDC via ERC20 transfer
                const value = parseUnits(amount, USDC_DECIMALS);
                txHash = await walletClient.writeContract({
                    address: USDC_ADDRESS,
                    abi: erc20Abi,
                    functionName: 'transfer',
                    args: [recipientAddress as `0x${string}`, value],
                });
            }

            setSendSuccess(`Transaction sent: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`);
            
            // Reset form
            setRecipientAddress('');
            setAmount('');
            
            // Refresh balances after a delay
            setTimeout(() => {
                fetchBalances();
            }, 2000);

        } catch (err: any) {
            console.error('Send transaction error:', err);
            
            if (err.message?.includes('User rejected')) {
                setSendError('Transaction cancelled by user');
            } else if (err.message?.includes('insufficient funds')) {
                setSendError('Insufficient funds for gas');
            } else {
                setSendError(err.message || 'Transaction failed');
            }
        } finally {
            setIsSending(false);
        }
    }, [validateSendForm, getWalletClient, selectedToken, amount, recipientAddress, fetchBalances]);

    // Reset send form when switching tabs
    useEffect(() => {
        if (activeTab === 'receive') {
            setRecipientAddress('');
            setAmount('');
            setSendError(null);
            setSendSuccess(null);
        }
    }, [activeTab]);

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

                        {/* Tab Buttons */}
                        <div className={styles.tabContainer}>
                            <button
                                className={`${styles.tabButton} ${activeTab === 'receive' ? styles.tabButtonActive : ''}`}
                                onClick={() => setActiveTab('receive')}
                            >
                                Receive
                            </button>
                            <button
                                className={`${styles.tabButton} ${activeTab === 'send' ? styles.tabButtonActive : ''}`}
                                onClick={() => setActiveTab('send')}
                            >
                                Send
                            </button>
                        </div>

                        {/* Receive Tab Content */}
                        {activeTab === 'receive' && (
                            <>
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
                            </>
                        )}

                        {/* Send Tab Content */}
                        {activeTab === 'send' && (
                            <div className={styles.sendSection}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Recipient Address</label>
                                    <input
                                        type="text"
                                        className={styles.formInput}
                                        placeholder="0x..."
                                        value={recipientAddress}
                                        onChange={(e) => setRecipientAddress(e.target.value)}
                                        disabled={isSending}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Token</label>
                                    <select
                                        className={styles.formSelect}
                                        value={selectedToken}
                                        onChange={(e) => setSelectedToken(e.target.value as TokenType)}
                                        disabled={isSending}
                                    >
                                        <option value="MON">MON</option>
                                        <option value="USDC">USDC</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Amount</label>
                                    <input
                                        type="number"
                                        className={styles.formInput}
                                        placeholder="0.0"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        disabled={isSending}
                                        step="0.000001"
                                        min="0"
                                    />
                                    <div className={styles.balanceHint}>
                                        Available: {selectedToken === 'MON' ? monBalance || '0.0000' : usdcBalance || '0.00'} {selectedToken}
                                    </div>
                                </div>

                                {sendError && (
                                    <div className={styles.sendError}>{sendError}</div>
                                )}

                                {sendSuccess && (
                                    <div className={styles.sendSuccess}>{sendSuccess}</div>
                                )}

                                <button
                                    className={styles.sendButton}
                                    onClick={handleSend}
                                    disabled={isSending || !recipientAddress || !amount}
                                >
                                    {isSending ? 'Sending...' : 'Send'}
                                </button>
                            </div>
                        )}

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
