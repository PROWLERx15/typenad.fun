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
  DuelJoinedEvent,
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
      const [player, stake, randomSeed, active] = result as [
        `0x${string}`,
        bigint,
        bigint,
        boolean
      ];
      return { player, stake, randomSeed, active };
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
      const [player1, player2, stake, randomSeed, active] =
        result as [
          `0x${string}`,
          `0x${string}`,
          bigint,
          bigint,
          boolean
        ];
      return { player1, player2, stake, randomSeed, active };
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
    ): Promise<{ hash: `0x${string}`; sequenceNumber: bigint; seed: bigint }> => {
      setIsLoading(true);
      setError(null);
      try {
        const walletClient = await getWalletClient();

        const hash = await walletClient.writeContract({
          address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
          abi: TYPE_NAD_ABI,
          functionName: 'startGame',
          args: [stakeAmount],
          chain: monadTestnet,
          account: address as `0x${string}`,
        });

        // Wait for receipt and parse event
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Find GameStarted event
        let sequenceNumber: bigint = 0n;
        let seed: bigint = 0n;
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
              seed = args.seed;
              break;
            }
          } catch {
            // Not our event, continue
          }
        }

        return { hash, sequenceNumber, seed };
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getWalletClient, publicClient, address]
  );

  const settleGame = useCallback(
    async (
      sequenceNumber: bigint,
      misses: bigint,
      typos: bigint,
      bonusAmount: bigint,
      player: `0x${string}`,
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
          args: [sequenceNumber, misses, typos, bonusAmount, player, signature],
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
    async (duelId: bigint): Promise<{ hash: `0x${string}`; seed: bigint }> => {
      setIsLoading(true);
      setError(null);
      try {
        const walletClient = await getWalletClient();

        const hash = await walletClient.writeContract({
          address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
          abi: TYPE_NAD_ABI,
          functionName: 'joinDuel',
          args: [duelId],
          chain: monadTestnet,
          account: address as `0x${string}`,
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Parse seed from DuelJoined event
        let seed: bigint = 0n;
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: TYPE_NAD_ABI,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === 'DuelJoined') {
              const args = decoded.args as unknown as DuelJoinedEvent;
              seed = args.seed;
              break;
            }
          } catch {
            // Not our event
          }
        }

        return { hash, seed };
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getWalletClient, publicClient, address]
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

  // Helper to fetch past settlement event (for race condition handling)
  const getDuelResult = useCallback(
    async (duelId: bigint): Promise<{ winner: `0x${string}`; payout: bigint } | null> => {
      try {
        const logs = await publicClient.getContractEvents({
          address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
          abi: TYPE_NAD_ABI,
          eventName: 'DuelSettled',
          args: { duelId },
          fromBlock: 'earliest',
        });

        if (logs.length > 0) {
          const args = logs[0].args as any;
          return {
            winner: args.winner,
            payout: args.payout,
          };
        }
        return null;
      } catch (err) {
        console.error('Failed to fetch duel result:', err);
        return null;
      }
    },
    [publicClient]
  );

  // ============= EVENT WATCHERS =============

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
      callback: (player2: `0x${string}`, seed: bigint) => void
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
              callback(args.player2, args.seed);
            }
          }
        },
      });
      return unwatch;
    },
    [publicClient]
  );

  // ============= CANCEL FUNCTIONS =============

  const getCancelFeeBps = useCallback(async (): Promise<bigint> => {
    const fee = await publicClient.readContract({
      address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
      abi: TYPE_NAD_ABI,
      functionName: 'CANCEL_FEE_BPS',
    });
    return fee as bigint;
  }, [publicClient]);

  const cancelGame = useCallback(
    async (): Promise<{ hash: `0x${string}`; refund: bigint }> => {
      setIsLoading(true);
      setError(null);
      try {
        const walletClient = await getWalletClient();

        const hash = await walletClient.writeContract({
          address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
          abi: TYPE_NAD_ABI,
          functionName: 'cancelGame',
          args: [],
          chain: monadTestnet,
          account: address as `0x${string}`,
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Parse refund from GameCancelled event
        let refund: bigint = 0n;
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: TYPE_NAD_ABI,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === 'GameCancelled') {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const args = decoded.args as any;
              refund = args.refund;
              break;
            }
          } catch {
            // Not our event
          }
        }

        return { hash, refund };
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getWalletClient, publicClient, address]
  );

  const cancelDuel = useCallback(
    async (duelId: bigint): Promise<{ hash: `0x${string}`; refund: bigint }> => {
      setIsLoading(true);
      setError(null);
      try {
        const walletClient = await getWalletClient();

        const hash = await walletClient.writeContract({
          address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
          abi: TYPE_NAD_ABI,
          functionName: 'cancelDuel',
          args: [duelId],
          chain: monadTestnet,
          account: address as `0x${string}`,
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Parse refund from DuelCancelled event
        let refund: bigint = 0n;
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: TYPE_NAD_ABI,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === 'DuelCancelled') {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const args = decoded.args as any;
              refund = args.refund;
              break;
            }
          } catch {
            // Not our event
          }
        }

        return { hash, refund };
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getWalletClient, publicClient, address]
  );

  return {
    // Read functions
    getUSDCAddress,
    getGameSession,
    getDuel,
    getPlayerActiveSession,
    getDuelCounter,
    getCancelFeeBps,
    getDuelResult,

    // Write functions
    startGame,
    settleGame,
    createDuel,
    joinDuel,
    settleDuel,
    cancelGame,
    cancelDuel,

    // Event watchers
    watchDuelCreated,
    watchDuelJoined,

    // State
    isLoading,
    error,
    publicClient,
  };
}

