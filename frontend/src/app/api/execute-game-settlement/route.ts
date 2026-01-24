import { NextRequest, NextResponse } from 'next/server';
import { keccak256, encodePacked, isAddress, decodeEventLog } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { getVerifierWalletClient, getVerifierPublicClient } from '../../../lib/verifierWallet';
import { TYPE_NAD_ABI, TYPE_NAD_CONTRACT_ADDRESS } from '../../../contracts/contract';

/**
 * Check if a game session is already settled on-chain
 */
async function checkOnChainSettlement(sequenceNumber: bigint) {
  try {
    const publicClient = getVerifierPublicClient();

    // Check if session is still active
    const sessionState = await publicClient.readContract({
      address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
      abi: TYPE_NAD_ABI,
      functionName: 'gameSessions',
      args: [sequenceNumber],
    });

    const [player, stake, randomSeed, active] = sessionState as [
      `0x${string}`,
      bigint,
      bigint,
      boolean
    ];

    if (!active) {
      // Session is settled, fetch the settlement event
      const logs = await publicClient.getContractEvents({
        address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
        abi: TYPE_NAD_ABI,
        eventName: 'GameSettled',
        args: { sequenceNumber },
        fromBlock: 'earliest',
      });

      if (logs.length > 0) {
        const args = logs[0].args as any;
        return {
          settled: true,
          payout: args.payout.toString(),
          txHash: logs[0].transactionHash,
        };
      }
    }

    return { settled: false };
  } catch (error) {
    console.error('[execute-game-settlement] Error checking on-chain status:', error);
    return { settled: false };
  }
}

/**
 * Classify error as temporary (retriable) or permanent
 */
function isTemporaryError(error: any): boolean {
  const errorMessage = error.message || JSON.stringify(error);

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
 * Execute game settlement with retry logic
 */
async function executeSettlementWithRetry(
  sequenceNumber: bigint,
  misses: number,
  typos: number,
  bonusAmount: bigint,
  playerAddress: string,
  maxRetries = 3
) {
  const startTime = Date.now();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log('[GameSettlement] Starting attempt', {
        sequenceNumber: sequenceNumber.toString(),
        attempt,
        misses,
        typos,
        bonusAmount: bonusAmount.toString(),
        playerAddress,
        timestamp: new Date().toISOString(),
      });

      // Check if already settled
      const onChainStatus = await checkOnChainSettlement(sequenceNumber);
      if (onChainStatus.settled) {
        console.log('[GameSettlement] Already settled on-chain', {
          sequenceNumber: sequenceNumber.toString(),
          payout: onChainStatus.payout,
          txHash: onChainStatus.txHash,
        });
        return {
          success: true,
          alreadySettled: true,
          payout: onChainStatus.payout,
          txHash: onChainStatus.txHash,
        };
      }

      // Generate signature
      const messageHash = keccak256(
        encodePacked(
          ['uint64', 'uint256', 'uint256', 'uint256', 'address'],
          [
            sequenceNumber,
            BigInt(misses),
            BigInt(typos),
            bonusAmount,
            playerAddress as `0x${string}`,
          ]
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

      // Get contract verifier to compare
      const publicClient = getVerifierPublicClient();
      const contractVerifier = await publicClient.readContract({
        address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
        abi: TYPE_NAD_ABI,
        functionName: 'verifier',
      }) as `0x${string}`;

      console.log('[GameSettlement] Signature details', {
        sequenceNumber: sequenceNumber.toString(),
        signerAddress: account.address,
        contractVerifier,
        addressesMatch: account.address.toLowerCase() === contractVerifier.toLowerCase(),
        messageHash,
        signatureLength: signature.length,
      });

      if (account.address.toLowerCase() !== contractVerifier.toLowerCase()) {
        throw new Error(`Signer address mismatch: signer=${account.address}, contract verifier=${contractVerifier}`);
      }

      // Execute settlement transaction
      const walletClient = getVerifierWalletClient();
      // publicClient already defined above for verifier check

      console.log('[GameSettlement] Submitting transaction', {
        sequenceNumber: sequenceNumber.toString(),
        timestamp: new Date().toISOString(),
      });

      const hash = await walletClient.writeContract({
        address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
        abi: TYPE_NAD_ABI,
        functionName: 'settleGame',
        args: [sequenceNumber, BigInt(misses), BigInt(typos), bonusAmount, playerAddress as `0x${string}`, signature],
      });

      console.log('[GameSettlement] Transaction submitted', {
        sequenceNumber: sequenceNumber.toString(),
        txHash: hash,
        timestamp: new Date().toISOString(),
      });

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      console.log('[GameSettlement] Transaction confirmed', {
        sequenceNumber: sequenceNumber.toString(),
        txHash: hash,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status,
        timestamp: new Date().toISOString(),
      });

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

      console.log('[GameSettlement] Completed successfully', {
        sequenceNumber: sequenceNumber.toString(),
        txHash: hash,
        payout: payout.toString(),
        gasUsed: receipt.gasUsed.toString(),
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        txHash: hash,
        payout: payout.toString(),
        gasUsed: receipt.gasUsed.toString(),
      };

    } catch (error: any) {
      console.error('[GameSettlement] Attempt failed', {
        sequenceNumber: sequenceNumber.toString(),
        attempt,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });

      // Check if it's a race condition (already settled)
      const errorMessage = error.message || JSON.stringify(error);
      if (errorMessage.includes('SessionNotActive')) {
        console.log('[GameSettlement] Race condition detected, fetching existing result', {
          sequenceNumber: sequenceNumber.toString(),
        });

        const onChainStatus = await checkOnChainSettlement(sequenceNumber);
        if (onChainStatus.settled) {
          return {
            success: true,
            alreadySettled: true,
            payout: onChainStatus.payout,
            txHash: onChainStatus.txHash,
          };
        }
      }

      // If this is the last attempt or a permanent error, throw
      if (attempt === maxRetries || !isTemporaryError(error)) {
        console.error('[GameSettlement] Failed permanently', {
          sequenceNumber: sequenceNumber.toString(),
          error: error.message,
          stack: error.stack,
          attempts: attempt,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }

      // Exponential backoff
      const backoffMs = Math.pow(2, attempt) * 1000;
      console.log('[GameSettlement] Retrying after backoff', {
        sequenceNumber: sequenceNumber.toString(),
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
 * POST /api/execute-game-settlement
 * 
 * Executes the solo game settlement transaction using the backend verifier wallet.
 * This eliminates the need for player wallet approvals.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { sequenceNumber, misses, typos, bonusAmount, playerAddress } = body;

    // Validate inputs
    if (!sequenceNumber || sequenceNumber === '0') {
      return NextResponse.json(
        { success: false, error: 'Invalid sequence number' },
        { status: 400 }
      );
    }

    if (typeof misses !== 'number' || misses < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid misses value' },
        { status: 400 }
      );
    }

    if (typeof typos !== 'number' || typos < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid typos value' },
        { status: 400 }
      );
    }

    if (!playerAddress || !isAddress(playerAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid player address' },
        { status: 400 }
      );
    }

    const sequenceNumberBigInt = BigInt(sequenceNumber);
    const bonusAmountBigInt = BigInt(bonusAmount || '0');

    // Apply free typo limit (7 free typos before penalties)
    const FREE_TYPOS = 7;
    const penalizedTypos = Math.max(0, typos - FREE_TYPOS);

    console.log('[execute-game-settlement] Received request', {
      sequenceNumber,
      misses,
      typos,
      penalizedTypos,
      bonusAmount: bonusAmount || '0',
      playerAddress,
      timestamp: new Date().toISOString(),
    });

    // Execute settlement with retry logic (pass penalizedTypos to contract)
    const result = await executeSettlementWithRetry(
      sequenceNumberBigInt,
      misses,
      penalizedTypos,
      bonusAmountBigInt,
      playerAddress
    );

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[execute-game-settlement] Error:', error);
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
