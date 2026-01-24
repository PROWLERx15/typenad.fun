import { NextRequest, NextResponse } from 'next/server';
import { getVerifierPublicClient } from '../../../lib/verifierWallet';
import { TYPE_NAD_ABI, TYPE_NAD_CONTRACT_ADDRESS } from '../../../contracts/contract';

/**
 * GET /api/game-settlement-status?sequenceNumber=123
 * 
 * Check the current status of a solo game settlement.
 * Queries the blockchain for game session status.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sequenceNumber = searchParams.get('sequenceNumber');

    // Validate sequence number
    if (!sequenceNumber || sequenceNumber === '0') {
      return NextResponse.json(
        { success: false, error: 'Invalid sequence number' },
        { status: 400 }
      );
    }

    const sequenceNumberBigInt = BigInt(sequenceNumber);

    // Query blockchain for game session status
    const publicClient = getVerifierPublicClient();
    
    try {
      // Check if session is still active
      const sessionState = await publicClient.readContract({
        address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
        abi: TYPE_NAD_ABI,
        functionName: 'gameSessions',
        args: [sequenceNumberBigInt],
      });

      const [player, stake, randomSeed, active] = sessionState as [
        `0x${string}`,
        bigint,
        bigint,
        boolean
      ];

      // If session is not active, it's settled
      if (!active) {
        // Fetch the settlement event for details
        const logs = await publicClient.getContractEvents({
          address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
          abi: TYPE_NAD_ABI,
          eventName: 'GameSettled',
          args: { sequenceNumber: sequenceNumberBigInt },
          fromBlock: 'earliest',
        });

        if (logs.length > 0) {
          const args = logs[0].args as any;
          return NextResponse.json({
            success: true,
            status: 'settled',
            payout: args.payout.toString(),
            txHash: logs[0].transactionHash,
            player: args.player,
          });
        }

        // Session is inactive but no event found (shouldn't happen)
        return NextResponse.json({
          success: true,
          status: 'settled',
        });
      }

      // Session is still active - game in progress or settlement pending
      return NextResponse.json({
        success: true,
        status: 'pending',
        player,
        stake: stake.toString(),
      });

    } catch (blockchainError: any) {
      console.error('[game-settlement-status] Blockchain error:', blockchainError);
      
      return NextResponse.json({
        success: true,
        status: 'error',
        error: 'Could not verify on-chain status',
      });
    }

  } catch (error: any) {
    console.error('[game-settlement-status] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
