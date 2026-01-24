'use client';

import { useState, useCallback, useMemo } from 'react';
import { createPublicClient, http, erc20Abi, type WalletClient } from 'viem';
import { usePrivyWallet } from './usePrivyWallet';
import { monadTestnet } from '../config/privy';
import { TYPE_NAD_CONTRACT_ADDRESS } from '../contracts/contract';

// USDC contract address on Monad Testnet
export const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x534b2f3A21130d7a60830c2Df862319e593943A3') as const;

// USDC has 6 decimals
export const USDC_DECIMALS = 6;

// RPC URL
const RPC_URL = process.env.NEXT_PUBLIC_MONAD_RPC_TESTNET || 'https://testnet-rpc.monad.xyz';

// Helper to format USDC amounts (6 decimals)
export function formatUSDC(amount: bigint): string {
  const whole = amount / BigInt(1_000_000);
  const fraction = amount % BigInt(1_000_000);
  if (fraction === BigInt(0)) {
    return whole.toString();
  }
  // Pad fraction to 6 digits and remove trailing zeros
  const fractionStr = fraction.toString().padStart(6, '0').replace(/0+$/, '');
  return `${whole}.${fractionStr}`;
}

// Helper to parse USDC amounts (6 decimals)
export function parseUSDC(amount: string | number): bigint {
  const str = typeof amount === 'number' ? amount.toString() : amount;
  const [whole, fraction = ''] = str.split('.');
  const paddedFraction = fraction.padEnd(6, '0').slice(0, 6);
  return BigInt(whole) * BigInt(1_000_000) + BigInt(paddedFraction);
}

export function useUSDC() {
  const { wallet, address } = usePrivyWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create public client for reads
  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: monadTestnet,
        transport: http(RPC_URL),
      }),
    []
  );

  // Get wallet client from Privy
  const getWalletClient = useCallback(async (): Promise<WalletClient> => {
    if (!wallet) {
      throw new Error('Wallet not connected');
    }
    const provider = await wallet.getEthereumProvider();
    const { createWalletClient, custom } = await import('viem');
    return createWalletClient({
      chain: monadTestnet,
      transport: custom(provider),
      account: address as `0x${string}`,
    });
  }, [wallet, address]);

  // Get USDC balance
  const getBalance = useCallback(
    async (account?: string): Promise<bigint> => {
      const target = (account || address) as `0x${string}`;
      if (!target) {
        throw new Error('No account provided');
      }

      try {
        console.log('Fetching USDC balance for:', target);
        console.log('USDC Address:', USDC_ADDRESS);
        console.log('RPC URL:', RPC_URL);

        const balance = await publicClient.readContract({
          address: USDC_ADDRESS,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [target],
        });

        console.log('USDC Balance fetched:', balance.toString());
        return balance;
      } catch (err) {
        console.error('Failed to fetch USDC balance:', err);
        throw err;
      }
    },
    [publicClient, address]
  );

  // Get formatted balance
  const getFormattedBalance = useCallback(
    async (account?: string): Promise<string> => {
      const balance = await getBalance(account);
      return formatUSDC(balance);
    },
    [getBalance]
  );

  // Get allowance for TypeNad contract
  const getAllowance = useCallback(
    async (account?: string, spender?: string): Promise<bigint> => {
      const owner = (account || address) as `0x${string}`;
      const spenderAddress = (spender ||
        TYPE_NAD_CONTRACT_ADDRESS) as `0x${string}`;

      if (!owner) {
        throw new Error('No account provided');
      }

      const allowance = await publicClient.readContract({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [owner, spenderAddress],
      });
      return allowance;
    },
    [publicClient, address]
  );

  // Check if approval is needed
  const needsApproval = useCallback(
    async (amount: bigint, account?: string): Promise<boolean> => {
      const allowance = await getAllowance(account);
      return allowance < amount;
    },
    [getAllowance]
  );

  // Approve USDC for TypeNad contract
  const approve = useCallback(
    async (
      amount: bigint,
      spender?: string
    ): Promise<{ hash: `0x${string}` }> => {
      setIsLoading(true);
      setError(null);
      try {
        const walletClient = await getWalletClient();
        const spenderAddress = (spender ||
          TYPE_NAD_CONTRACT_ADDRESS) as `0x${string}`;

        const hash = await walletClient.writeContract({
          address: USDC_ADDRESS,
          abi: erc20Abi,
          functionName: 'approve',
          args: [spenderAddress, amount],
          chain: monadTestnet,
          account: address as `0x${string}`,
        });

        await publicClient.waitForTransactionReceipt({ hash });

        return { hash };
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getWalletClient, publicClient, address]
  );

  // Approve max USDC (unlimited approval)
  const approveMax = useCallback(
    async (spender?: string): Promise<{ hash: `0x${string}` }> => {
      // Max uint256
      const maxAmount = BigInt(2) ** BigInt(256) - BigInt(1);
      return approve(maxAmount, spender);
    },
    [approve]
  );

  // Helper: Ensure approval before staking
  const ensureApproval = useCallback(
    async (
      amount: bigint
    ): Promise<{ approved: boolean; hash?: `0x${string}` }> => {
      const needs = await needsApproval(amount);
      if (!needs) {
        return { approved: true };
      }
      // Approve max for better UX (single approval)
      const { hash } = await approveMax();
      return { approved: true, hash };
    },
    [needsApproval, approveMax]
  );

  return {
    // Read functions
    getBalance,
    getFormattedBalance,
    getAllowance,
    needsApproval,

    // Write functions
    approve,
    approveMax,
    ensureApproval,

    // Helpers
    formatUSDC,
    parseUSDC,

    // Constants
    USDC_ADDRESS,
    USDC_DECIMALS,

    // State
    isLoading,
    error,
  };
}
