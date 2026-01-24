import { NextRequest, NextResponse } from 'next/server';
import { keccak256, encodePacked, isAddress, decodeEventLog } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { getVerifierWalletClient, getVerifierPublicClient } from '../../../lib/verifierWallet';
import { supabaseUntyped as supabase } from '../../../lib/supabaseClient';
import { TYPE_NAD_ABI, TYPE_NAD_CONTRACT_ADDRESS } from '../../../contracts/contract';

interface PlayerScore {
  address: string;
  score: number;
  misses: number;
  typos: number;
  wpm: number;
}

interface DuelResult {
  duel_id: string;
  player_address: string;
  score: number;
  wpm: number;
  misses: number;
  typos: number;
}

/**
 * Determine the winner of a duel based on game stats.
 * 
 * Priority:
 * 1. Higher score wins
 * 2. If tied, higher WPM wins
 * 3. If tied, fewer misses wins
 * 4. If still tied, player1 (creator) wins
 */
function determineWinner(player1: PlayerScore, player2: PlayerScore): string {
  // 1. Higher score wins
  if (player1.score !== player2.score) {
    return player1.score > player2.score ? player1.address : player2.address;
  }

  // 2. If scores equal, higher WPM wins
  if (player1.wpm !== player2.wpm) {
    return player1.wpm > player2.wpm ? player1.address : player2.address;
  }

  // 3. If WPM equal, fewer misses wins
  if (player1.misses !== player2.misses) {
    return player1.misses < player2.misses ? player1.address : player2.address;
  }

  // 4. Tiebreaker: player1 (creator) wins
  return player1.address;
}

/**
 * Check if a duel is already settled on-chain
 */
async function checkOnChainSettlement(duelId: bigint) {
  try {
    const publicClient = getVerifierPublicClient();
    
    // Check if duel is still active
    const duelState = await publicClient.readContract({
      address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
      abi: TYPE_NAD_ABI,
      functionName: 'duels',
      args: [duelId],
    });

    const [player1, player2, stake, randomSeed, active] = duelState as [
      `0x${string}`,
      `0x${string}`,
      bigint,
      bigint,
      boolean
    ];

    if (!active) {
      // Duel is settled, fetch the settlement event
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
          settled: true,
          winner: args.winner,
          payout: args.payout.toString(),
          txHash: logs[0].transactionHash,
        };
      }
    }

    return { settled: false };
  } catch (error) {
    console.error('[execute-settlement] Error checking on-chain status:', error);
    return { settled: false };
  }
}

/**
 * Classify error as temporary (retriable) or permanent
 */
function isTemporaryError(error: any): boolean {
  const errorMessage = error.message || JSON.stringify(error);
  
  // Temporary errors that should be retried
  const temporaryPatterns = [
    'network',
    'timeout',
    'connection',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'rate limit',
    'nonce',
  ];

  return temporaryPatterns.some(pattern => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute settlement with retry logic
 */
async function executeSettlementWithRetry(
  duelId: bigint,
  player1: PlayerScore,
  player2: PlayerScore,
  maxRetries = 3
) {
  const startTime = Date.now();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log('[Settlement] Starting attempt', {
        duelId: duelId.toString(),
        attempt,
        player1Score: player1.score,
        player2Score: player2.score,
        timestamp: new Date().toISOString(),
      });

      // Check if already settled
      const onChainStatus = await checkOnChainSettlement(duelId);
      if (onChainStatus.settled) {
        console.log('[Settlement] Already settled on-chain', {
          duelId: duelId.toString(),
          winner: onChainStatus.winner,
          payout: onChainStatus.payout,
          txHash: onChainStatus.txHash,
        });
        return {
          success: true,
          alreadySettled: true,
          winner: onChainStatus.winner,
          payout: onChainStatus.payout,
          txHash: onChainStatus.txHash,
        };
      }

      // Determine winner
      const winnerAddress = determineWinner(player1, player2);

      console.log('[Settlement] Winner determined', {
        duelId: duelId.toString(),
        winner: winnerAddress,
        player1Score: player1.score,
        player2Score: player2.score,
      });

      // Generate signature
      const messageHash = keccak256(
        encodePacked(
          ['uint256', 'address', 'string'],
          [duelId, winnerAddress as `0x${string}`, 'DUEL_WINNER']
        )
      );

      const privateKey = process.env.VERIFIER_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('VERIFIER_PRIVATE_KEY not configured');
      }

      const formattedPrivateKey = privateKey.startsWith('0x')
        ? (privateKey as `0x${string}`)
        : (`0x${privateKey}` as `0x${string}`);

      const account = privateKeyToAccount(formattedPrivateKey);
      const signature = await account.signMessage({
        message: { raw: messageHash },
      });

      console.log('[Settlement] Signature generated', {
        duelId: duelId.toString(),
        signerAddress: account.address,
      });

      // Execute settlement transaction
      const walletClient = getVerifierWalletClient();
      const publicClient = getVerifierPublicClient();

      console.log('[Settlement] Submitting transaction', {
        duelId: duelId.toString(),
        winner: winnerAddress,
        timestamp: new Date().toISOString(),
      });

      const hash = await walletClient.writeContract({
        address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
        abi: TYPE_NAD_ABI,
        functionName: 'settleDuel',
        args: [duelId, winnerAddress as `0x${string}`, signature],
      });

      console.log('[Settlement] Transaction submitted', {
        duelId: duelId.toString(),
        txHash: hash,
        timestamp: new Date().toISOString(),
      });

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      console.log('[Settlement] Transaction confirmed', {
        duelId: duelId.toString(),
        txHash: hash,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status,
        timestamp: new Date().toISOString(),
      });

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
            const args = decoded.args as any;
            payout = args.payout;
            break;
          }
        } catch {
          // Not our event
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log('[Settlement] Completed successfully', {
        duelId: duelId.toString(),
        txHash: hash,
        winner: winnerAddress,
        payout: payout.toString(),
        gasUsed: receipt.gasUsed.toString(),
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        txHash: hash,
        winner: winnerAddress,
        payout: payout.toString(),
        gasUsed: receipt.gasUsed.toString(),
      };

    } catch (error: any) {
      console.error('[Settlement] Attempt failed', {
        duelId: duelId.toString(),
        attempt,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });

      // Check if it's a race condition (already settled)
      const errorMessage = error.message || JSON.stringify(error);
      if (errorMessage.includes('DuelAlreadySettled') || errorMessage.includes('DuelNotActive')) {
        console.log('[Settlement] Race condition detected, fetching existing result', {
          duelId: duelId.toString(),
        });
        
        const onChainStatus = await checkOnChainSettlement(duelId);
        if (onChainStatus.settled) {
          return {
            success: true,
            alreadySettled: true,
            winner: onChainStatus.winner,
            payout: onChainStatus.payout,
            txHash: onChainStatus.txHash,
          };
        }
      }

      // If this is the last attempt or a permanent error, throw
      if (attempt === maxRetries || !isTemporaryError(error)) {
        console.error('[Settlement] Failed permanently', {
          duelId: duelId.toString(),
          error: error.message,
          stack: error.stack,
          attempts: attempt,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }

      // Exponential backoff
      const backoffMs = Math.pow(2, attempt) * 1000;
      console.log('[Settlement] Retrying after backoff', {
        duelId: duelId.toString(),
        attempt,
        nextAttempt: attempt + 1,
        backoffMs,
      });
      await sleep(backoffMs);
    }
  }

  throw new Error('Settlement failed after maximum retries');
}

/**
 * POST /api/execute-settlement
 * 
 * Executes the duel settlement transaction using the backend verifier wallet.
 * This eliminates the need for player wallet approvals.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { duelId } = body;

    // Validate duel ID
    if (!duelId || duelId === '0') {
      return NextResponse.json(
        { success: false, error: 'Invalid duel ID' },
        { status: 400 }
      );
    }

    const duelIdBigInt = BigInt(duelId);

    console.log('[execute-settlement] Received request', {
      duelId,
      timestamp: new Date().toISOString(),
    });

    // Fetch both player results from Supabase
    const { data: results, error: dbError } = await supabase
      .from('duel_results')
      .select('*')
      .eq('duel_id', duelId);

    if (dbError) {
      console.error('[execute-settlement] Database error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch duel results' },
        { status: 500 }
      );
    }

    if (!results || results.length !== 2) {
      return NextResponse.json(
        { success: false, error: 'Both players must finish before settlement' },
        { status: 400 }
      );
    }

    // Get duel info from contract to determine player1 and player2
    const publicClient = getVerifierPublicClient();
    const duelState = await publicClient.readContract({
      address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
      abi: TYPE_NAD_ABI,
      functionName: 'duels',
      args: [duelIdBigInt],
    });

    const [player1Address, player2Address] = duelState as [`0x${string}`, `0x${string}`, bigint, bigint, boolean];

    // Map results to player1 and player2
    const player1Result = results.find(
      (r: DuelResult) => r.player_address.toLowerCase() === player1Address.toLowerCase()
    );
    const player2Result = results.find(
      (r: DuelResult) => r.player_address.toLowerCase() === player2Address.toLowerCase()
    );

    if (!player1Result || !player2Result) {
      return NextResponse.json(
        { success: false, error: 'Could not match results to players' },
        { status: 400 }
      );
    }

    const player1: PlayerScore = {
      address: player1Address,
      score: player1Result.score,
      misses: player1Result.misses,
      typos: player1Result.typos,
      wpm: player1Result.wpm,
    };

    const player2: PlayerScore = {
      address: player2Address,
      score: player2Result.score,
      misses: player2Result.misses,
      typos: player2Result.typos,
      wpm: player2Result.wpm,
    };

    // Execute settlement with retry logic
    const result = await executeSettlementWithRetry(duelIdBigInt, player1, player2);

    // Clean up duel results from database after successful settlement
    if (result.success && !result.alreadySettled) {
      await supabase
        .from('duel_results')
        .delete()
        .eq('duel_id', duelId);
      
      console.log('[execute-settlement] Cleaned up duel results from database', {
        duelId,
      });
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[execute-settlement] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error',
        temporary: isTemporaryError(error),
      },
      { status: 500 }
    );
  }
}
