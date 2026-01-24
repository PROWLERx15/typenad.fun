import { NextRequest, NextResponse } from 'next/server';
import { keccak256, encodePacked, isAddress, createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monadTestnet } from '../../../config/privy';
import { TYPE_NAD_ABI, TYPE_NAD_CONTRACT_ADDRESS } from '../../../contracts/contract';

interface PlayerScore {
  address: string;
  score: number;
  misses: number;
  typos: number;
  wpm: number;
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
 * POST /api/settle-duel
 * 
 * Determines the winner and settles the duel using the admin wallet (paying gas).
 * 
 * Message format for signature (must match contract):
 * keccak256(abi.encodePacked(duelId, winner, "DUEL_WINNER"))
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validate environment
    const privateKey = process.env.VERIFIER_PRIVATE_KEY;
    if (!privateKey) {
      console.error('VERIFIER_PRIVATE_KEY not configured');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Ensure private key has 0x prefix
    const formattedPrivateKey = privateKey.startsWith('0x')
      ? privateKey as `0x${string}`
      : `0x${privateKey}` as `0x${string}`;

    // 2. Parse request body
    const body = await request.json();
    const { duelId, player1, player2 } = body;

    // 3. Validate inputs
    if (!duelId || duelId === '0') {
      return NextResponse.json(
        { success: false, error: 'Invalid duel ID' },
        { status: 400 }
      );
    }

    if (!player1 || !isAddress(player1.address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid player1 data' },
        { status: 400 }
      );
    }

    if (!player2 || !isAddress(player2.address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid player2 data' },
        { status: 400 }
      );
    }

    // Validate score fields
    const validatePlayer = (p: PlayerScore, name: string) => {
      if (typeof p.score !== 'number' || p.score < 0) {
        throw new Error(`Invalid ${name} score`);
      }
      if (typeof p.misses !== 'number' || p.misses < 0) {
        throw new Error(`Invalid ${name} misses`);
      }
      if (typeof p.typos !== 'number' || p.typos < 0) {
        throw new Error(`Invalid ${name} typos`);
      }
      if (typeof p.wpm !== 'number' || p.wpm < 0) {
        throw new Error(`Invalid ${name} wpm`);
      }
    };

    try {
      validatePlayer(player1, 'player1');
      validatePlayer(player2, 'player2');
    } catch (validationError) {
      return NextResponse.json(
        { success: false, error: (validationError as Error).message },
        { status: 400 }
      );
    }

    // 4. Determine winner
    const winnerAddress = determineWinner(player1, player2);

    // 5. Create message hash matching contract's expectation
    // Contract: keccak256(abi.encodePacked(duelId, winner, "DUEL_WINNER"))
    const messageHash = keccak256(
      encodePacked(
        ['uint256', 'address', 'string'],
        [BigInt(duelId), winnerAddress as `0x${string}`, 'DUEL_WINNER']
      )
    );

    // 6. Sign with EIP-191 personal sign
    const account = privateKeyToAccount(formattedPrivateKey);
    const signature = await account.signMessage({
      message: { raw: messageHash },
    });

    // 7. Log for audit
    console.log('[settle-duel] Signed settlement:', {
      duelId,
      winner: winnerAddress,
      player1Score: player1.score,
      player2Score: player2.score,
      signerAddress: account.address,
    });

    // 8. Execute transaction on-chain via Admin Wallet
    const walletClient = createWalletClient({
      account,
      chain: monadTestnet,
      transport: http(process.env.NEXT_PUBLIC_MONAD_RPC_TESTNET || 'https://testnet-rpc.monad.xyz'),
    });

    const publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http(process.env.NEXT_PUBLIC_MONAD_RPC_TESTNET || 'https://testnet-rpc.monad.xyz'),
    });

    console.log('[settle-duel] sending transaction...');

    // Call settleDuel(uint256 duelId, address winner, bytes signature)
    const hash = await walletClient.writeContract({
      address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
      abi: TYPE_NAD_ABI,
      functionName: 'settleDuel',
      args: [BigInt(duelId), winnerAddress as `0x${string}`, signature],
    });

    console.log('[settle-duel] Transaction sent:', hash);

    // Optional: wait for confirmation if you want to be sure before returning
    // await publicClient.waitForTransactionReceipt({ hash });

    // 9. Return winner and txHash
    return NextResponse.json({
      success: true,
      winner: winnerAddress,
      txHash: hash,
      scores: { player1, player2 },
    });
  } catch (error) {
    console.error('[settle-duel] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
