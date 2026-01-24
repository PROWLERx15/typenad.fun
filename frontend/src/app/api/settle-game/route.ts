import { NextRequest, NextResponse } from 'next/server';
import { keccak256, encodePacked, isAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

/**
 * POST /api/settle-game
 * 
 * Signs a single-player game settlement message.
 * The signature is used by the player to call settleGame() on the contract.
 * 
 * Message format (must match contract):
 * keccak256(abi.encodePacked(sequenceNumber, misses, typos, bonusAmount, playerAddress))
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
    const { sequenceNumber, misses, typos, bonusAmount, playerAddress } = body;

    // 3. Validate inputs
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

    // 4. Create message hash matching contract's expectation
    // Contract: keccak256(abi.encodePacked(sequenceNumber, misses, typos, bonusAmount, msg.sender))
    const messageHash = keccak256(
      encodePacked(
        ['uint64', 'uint256', 'uint256', 'uint256', 'address'],
        [
          BigInt(sequenceNumber),
          BigInt(misses),
          BigInt(typos),
          BigInt(bonusAmount || '0'),
          playerAddress as `0x${string}`,
        ]
      )
    );

    // 5. Sign with EIP-191 personal sign (toEthSignedMessageHash is handled by signMessage)
    const account = privateKeyToAccount(formattedPrivateKey);
    const signature = await account.signMessage({
      message: { raw: messageHash },
    });

    // 6. Log for audit (in production, use proper logging service)
    console.log('[settle-game] Signed settlement:', {
      sequenceNumber,
      misses,
      typos,
      bonusAmount: bonusAmount || '0',
      playerAddress,
      signerAddress: account.address,
    });

    // 7. Return signature
    return NextResponse.json({
      success: true,
      signature,
      params: {
        sequenceNumber,
        misses,
        typos,
        bonusAmount: bonusAmount || '0',
        playerAddress,
      },
    });
  } catch (error) {
    console.error('[settle-game] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
