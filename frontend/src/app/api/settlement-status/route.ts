import { NextRequest, NextResponse } from 'next/server';
import { getVerifierPublicClient } from '../../../lib/verifierWallet';
import { supabaseUntyped as supabase } from '../../../lib/supabaseClient';
import { TYPE_NAD_ABI, TYPE_NAD_CONTRACT_ADDRESS } from '../../../contracts/contract';

/**
 * GET /api/settlement-status?duelId=123
 * 
 * Check the current status of a duel settlement.
 * Queries both the database (for player results) and blockchain (for settlement status).
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const duelId = searchParams.get('duelId');

    // Validate duel ID
    if (!duelId || duelId === '0') {
      return NextResponse.json(
        { success: false, error: 'Invalid duel ID' },
        { status: 400 }
      );
    }

    const duelIdBigInt = BigInt(duelId);

    // Check Supabase for both player results
    const { data: results, error: dbError } = await supabase
      .from('duel_results')
      .select('*')
      .eq('duel_id', duelId);

    if (dbError) {
      console.error('[settlement-status] Database error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch duel results' },
        { status: 500 }
      );
    }

    const bothPlayersFinished = results && results.length === 2;

    // Query blockchain for settlement status
    const publicClient = getVerifierPublicClient();
    
    try {
      // Check if duel is still active
      const duelState = await publicClient.readContract({
        address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
        abi: TYPE_NAD_ABI,
        functionName: 'duels',
        args: [duelIdBigInt],
      });

      const [player1, player2, stake, randomSeed, active] = duelState as [
        `0x${string}`,
        `0x${string}`,
        bigint,
        bigint,
        boolean
      ];

      // If duel is not active, it's settled
      if (!active) {
        // Fetch the settlement event for details
        const logs = await publicClient.getContractEvents({
          address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
          abi: TYPE_NAD_ABI,
          eventName: 'DuelSettled',
          args: { duelId: duelIdBigInt },
          fromBlock: 'earliest',
        });

        if (logs.length > 0) {
          const args = logs[0].args as any;
          return NextResponse.json({
            success: true,
            status: 'settled',
            winner: args.winner,
            payout: args.payout.toString(),
            txHash: logs[0].transactionHash,
            bothPlayersFinished,
          });
        }

        // Duel is inactive but no event found (shouldn't happen)
        return NextResponse.json({
          success: true,
          status: 'settled',
          bothPlayersFinished,
        });
      }

      // Duel is still active
      if (bothPlayersFinished) {
        // Both players finished, settlement should be in progress
        return NextResponse.json({
          success: true,
          status: 'settling',
          bothPlayersFinished: true,
        });
      } else {
        // Waiting for players to finish
        return NextResponse.json({
          success: true,
          status: 'pending',
          bothPlayersFinished: false,
        });
      }

    } catch (blockchainError: any) {
      console.error('[settlement-status] Blockchain error:', blockchainError);
      
      // If we can't query blockchain but have DB results, return what we know
      if (bothPlayersFinished) {
        return NextResponse.json({
          success: true,
          status: 'settling',
          bothPlayersFinished: true,
          error: 'Could not verify on-chain status',
        });
      }

      return NextResponse.json({
        success: true,
        status: 'pending',
        bothPlayersFinished: false,
        error: 'Could not verify on-chain status',
      });
    }

  } catch (error: any) {
    console.error('[settlement-status] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
