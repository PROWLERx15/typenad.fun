'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  createPublicClient,
  http,
  decodeEventLog,
  type WalletClient,
} from 'viem';
import { usePrivyWallet } from './usePrivyWallet';
import {
  TYPE_NAD_ABI,
  TYPE_NAD_CONTRACT_ADDRESS,
} from '../contracts/contract';
import { monadTestnet } from '../config/privy';
import type {
  GameSession,
  Duel,
  GameStartedEvent,
  DuelCreatedEvent,
} from '../types/contract';

// Re-export for convenience
export { TYPE_NAD_CONTRACT_ADDRESS };

// RPC URL with Alchemy fallback
const RPC_URL = process.env.NEXT_PUBLIC_MONAD_RPC_TESTNET || 'https://testnet-rpc.monad.xyz';

export function useTypeNadContract() {
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

  // ============= READ FUNCTIONS =============

  const getEntropyFee = useCallback(async (): Promise<bigint> => {
    try {
      const fee = await publicClient.readContract({
        address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
        abi: TYPE_NAD_ABI,
        functionName: 'getEntropyFee',
      });
      return fee as bigint;
    } catch (err) {
      console.error('Failed to fetch entropy fee:', err);
      // Return a default fee if the call fails (approximately 0.0001 MON in wei)
      // This is a reasonable fallback for testnet
      return BigInt('100000000000000'); // 0.0001 MON = 10^14 wei
    }
  }, [publicClient]);

  const getUSDCAddress = useCallback(async (): Promise<`0x${string}`> => {
    const usdcAddress = await publicClient.readContract({
      address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
      abi: TYPE_NAD_ABI,
      functionName: 'getUSDC',
    });
    return usdcAddress as `0x${string}`;
  }, [publicClient]);

  const getGameSession = useCallback(
    async (sequenceNumber: bigint): Promise<GameSession> => {
      const result = await publicClient.readContract({
        address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
        abi: TYPE_NAD_ABI,
        functionName: 'gameSessions',
        args: [sequenceNumber],
      });
      const [player, stake, randomSeed, active, fulfilled] = result as [
        `0x${string}`,
        bigint,
        bigint,
        boolean,
        boolean
      ];
      return { player, stake, randomSeed, active, fulfilled };
    },
    [publicClient]
  );

  const getDuel = useCallback(
    async (duelId: bigint): Promise<Duel> => {
      const result = await publicClient.readContract({
        address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
        abi: TYPE_NAD_ABI,
        functionName: 'duels',
        args: [duelId],
      });
      const [player1, player2, stake, randomSeed, active, fulfilled] =
        result as [
          `0x${string}`,
          `0x${string}`,
          bigint,
          bigint,
          boolean,
          boolean
        ];
      return { player1, player2, stake, randomSeed, active, fulfilled };
    },
    [publicClient]
  );

  const getPlayerActiveSession = useCallback(
    async (player: string): Promise<bigint> => {
      const result = await publicClient.readContract({
        address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
        abi: TYPE_NAD_ABI,
        functionName: 'playerActiveSession',
        args: [player as `0x${string}`],
      });
      return result as bigint;
    },
    [publicClient]
  );

  const getDuelCounter = useCallback(async (): Promise<bigint> => {
    const result = await publicClient.readContract({
      address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
      abi: TYPE_NAD_ABI,
      functionName: 'duelCounter',
    });
    return result as bigint;
  }, [publicClient]);

  // ============= WRITE FUNCTIONS =============

  const startGame = useCallback(
    async (
      stakeAmount: bigint
    ): Promise<{ hash: `0x${string}`; sequenceNumber: bigint }> => {
      setIsLoading(true);
      setError(null);
      try {
        const walletClient = await getWalletClient();
        const entropyFee = await getEntropyFee();

        // Add 5% buffer to entropy fee
        const feeWithBuffer = (entropyFee * 105n) / 100n;

        const hash = await walletClient.writeContract({
          address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
          abi: TYPE_NAD_ABI,
          functionName: 'startGame',
          args: [stakeAmount],
          value: feeWithBuffer,
          chain: monadTestnet,
          account: address as `0x${string}`,
        });

        // Wait for receipt and parse event
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Find GameStarted event
        let sequenceNumber: bigint = 0n;
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: TYPE_NAD_ABI,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === 'GameStarted') {
              const args = decoded.args as unknown as GameStartedEvent;
              sequenceNumber = args.sequenceNumber;
              break;
            }
          } catch {
            // Not our event, continue
          }
        }

        return { hash, sequenceNumber };
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getWalletClient, getEntropyFee, publicClient, address]
  );

  const settleGame = useCallback(
    async (
      sequenceNumber: bigint,
      misses: bigint,
      typos: bigint,
      bonusAmount: bigint,
      signature: `0x${string}`
    ): Promise<{ hash: `0x${string}`; payout: bigint }> => {
      setIsLoading(true);
      setError(null);
      try {
        const walletClient = await getWalletClient();

        const hash = await walletClient.writeContract({
          address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
          abi: TYPE_NAD_ABI,
          functionName: 'settleGame',
          args: [sequenceNumber, misses, typos, bonusAmount, signature],
          chain: monadTestnet,
          account: address as `0x${string}`,
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Parse payout from GameSettled event
        let payout: bigint = 0n;
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: TYPE_NAD_ABI,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === 'GameSettled') {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const args = decoded.args as any;
              payout = args.payout;
              break;
            }
          } catch {
            // Not our event
          }
        }

        return { hash, payout };
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getWalletClient, publicClient, address]
  );

  const createDuel = useCallback(
    async (
      stakeAmount: bigint
    ): Promise<{ hash: `0x${string}`; duelId: bigint }> => {
      setIsLoading(true);
      setError(null);
      try {
        const walletClient = await getWalletClient();

        const hash = await walletClient.writeContract({
          address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
          abi: TYPE_NAD_ABI,
          functionName: 'createDuel',
          args: [stakeAmount],
          chain: monadTestnet,
          account: address as `0x${string}`,
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Parse duelId from DuelCreated event
        let duelId: bigint = 0n;
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: TYPE_NAD_ABI,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === 'DuelCreated') {
              const args = decoded.args as unknown as DuelCreatedEvent;
              duelId = args.duelId;
              break;
            }
          } catch {
            // Not our event
          }
        }

        return { hash, duelId };
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getWalletClient, publicClient, address]
  );

  const joinDuel = useCallback(
    async (duelId: bigint): Promise<{ hash: `0x${string}` }> => {
      setIsLoading(true);
      setError(null);
      try {
        const walletClient = await getWalletClient();
        const entropyFee = await getEntropyFee();

        // Add 5% buffer
        const feeWithBuffer = (entropyFee * 105n) / 100n;

        const hash = await walletClient.writeContract({
          address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
          abi: TYPE_NAD_ABI,
          functionName: 'joinDuel',
          args: [duelId],
          value: feeWithBuffer,
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
    [getWalletClient, getEntropyFee, publicClient, address]
  );

  const settleDuel = useCallback(
    async (
      duelId: bigint,
      winner: `0x${string}`,
      signature: `0x${string}`
    ): Promise<{ hash: `0x${string}`; payout: bigint }> => {
      setIsLoading(true);
      setError(null);
      try {
        const walletClient = await getWalletClient();

        const hash = await walletClient.writeContract({
          address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
          abi: TYPE_NAD_ABI,
          functionName: 'settleDuel',
          args: [duelId, winner, signature],
          chain: monadTestnet,
          account: address as `0x${string}`,
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Parse payout from DuelSettled event
        let payout: bigint = 0n;
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: TYPE_NAD_ABI,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === 'DuelSettled') {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const args = decoded.args as any;
              payout = args.payout;
              break;
            }
          } catch {
            // Not our event
          }
        }

        return { hash, payout };
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getWalletClient, publicClient, address]
  );

  // ============= EVENT WATCHERS =============

  const watchGameSeedFulfilled = useCallback(
    (
      sequenceNumber: bigint,
      callback: (seed: bigint) => void
    ): (() => void) => {
      const unwatch = publicClient.watchContractEvent({
        address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
        abi: TYPE_NAD_ABI,
        eventName: 'GameSeedFulfilled',
        args: { sequenceNumber },
        onLogs: (logs) => {
          for (const log of logs) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const args = log.args as any;
            if (args.sequenceNumber === sequenceNumber) {
              callback(args.seed);
            }
          }
        },
      });
      return unwatch;
    },
    [publicClient]
  );

  const watchDuelSeedFulfilled = useCallback(
    (duelId: bigint, callback: (seed: bigint) => void): (() => void) => {
      const unwatch = publicClient.watchContractEvent({
        address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
        abi: TYPE_NAD_ABI,
        eventName: 'DuelSeedFulfilled',
        args: { duelId },
        onLogs: (logs) => {
          for (const log of logs) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const args = log.args as any;
            if (args.duelId === duelId) {
              callback(args.seed);
            }
          }
        },
      });
      return unwatch;
    },
    [publicClient]
  );

  const watchDuelCreated = useCallback(
    (callback: (event: DuelCreatedEvent) => void): (() => void) => {
      const unwatch = publicClient.watchContractEvent({
        address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
        abi: TYPE_NAD_ABI,
        eventName: 'DuelCreated',
        onLogs: (logs) => {
          for (const log of logs) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const args = log.args as any;
            callback({
              duelId: args.duelId,
              player1: args.player1,
              stake: args.stake,
            });
          }
        },
      });
      return unwatch;
    },
    [publicClient]
  );

  const watchDuelJoined = useCallback(
    (
      duelId: bigint,
      callback: (player2: `0x${string}`) => void
    ): (() => void) => {
      const unwatch = publicClient.watchContractEvent({
        address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
        abi: TYPE_NAD_ABI,
        eventName: 'DuelJoined',
        args: { duelId },
        onLogs: (logs) => {
          for (const log of logs) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const args = log.args as any;
            if (args.duelId === duelId) {
              callback(args.player2);
            }
          }
        },
      });
      return unwatch;
    },
    [publicClient]
  );

  // ============= HELPER: POLL FOR SEED =============

  const pollForGameSeed = useCallback(
    async (sequenceNumber: bigint, maxAttempts: number = 60): Promise<bigint> => {
      for (let i = 0; i < maxAttempts; i++) {
        const session = await getGameSession(sequenceNumber);
        if (session.fulfilled) {
          return session.randomSeed;
        }
        // Wait 1 second before next poll
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      throw new Error('Timeout waiting for game seed');
    },
    [getGameSession]
  );

  const pollForDuelSeed = useCallback(
    async (duelId: bigint, maxAttempts: number = 60): Promise<bigint> => {
      for (let i = 0; i < maxAttempts; i++) {
        const duel = await getDuel(duelId);
        if (duel.fulfilled) {
          return duel.randomSeed;
        }
        // Wait 1 second before next poll
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      throw new Error('Timeout waiting for duel seed');
    },
    [getDuel]
  );

  return {
    // Read functions
    getEntropyFee,
    getUSDCAddress,
    getGameSession,
    getDuel,
    getPlayerActiveSession,
    getDuelCounter,

    // Write functions
    startGame,
    settleGame,
    createDuel,
    joinDuel,
    settleDuel,

    // Event watchers
    watchGameSeedFulfilled,
    watchDuelSeedFulfilled,
    watchDuelCreated,
    watchDuelJoined,

    // Polling helpers
    pollForGameSeed,
    pollForDuelSeed,

    // State
    isLoading,
    error,
    publicClient,
  };
}
