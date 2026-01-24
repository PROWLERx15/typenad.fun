import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monadTestnet } from '../../../config/privy';
import { TYPE_NAD_ABI, TYPE_NAD_CONTRACT_ADDRESS } from '../../../contracts/contract';

/**
 * GET /api/debug-verifier
 * 
 * Debug endpoint to verify the verifier configuration.
 * Checks if VERIFIER_PRIVATE_KEY produces the correct address.
 */
export async function GET(request: NextRequest) {
    try {
        const privateKey = process.env.VERIFIER_PRIVATE_KEY;

        if (!privateKey) {
            return NextResponse.json({
                success: false,
                error: 'VERIFIER_PRIVATE_KEY not configured',
            });
        }

        // Get address from private key
        const formattedPrivateKey = privateKey.startsWith('0x')
            ? (privateKey as `0x${string}`)
            : (`0x${privateKey}` as `0x${string}`);

        const account = privateKeyToAccount(formattedPrivateKey);
        const signerAddress = account.address;

        // Get verifier address from contract
        const publicClient = createPublicClient({
            chain: monadTestnet,
            transport: http(process.env.NEXT_PUBLIC_MONAD_RPC_TESTNET || 'https://testnet-rpc.monad.xyz'),
        });

        const contractVerifier = await publicClient.readContract({
            address: TYPE_NAD_CONTRACT_ADDRESS as `0x${string}`,
            abi: TYPE_NAD_ABI,
            functionName: 'verifier',
        }) as `0x${string}`;

        const addressesMatch = signerAddress.toLowerCase() === contractVerifier.toLowerCase();

        return NextResponse.json({
            success: true,
            signerAddress,
            contractVerifier,
            contractAddress: TYPE_NAD_CONTRACT_ADDRESS,
            addressesMatch,
            message: addressesMatch
                ? '✅ Verifier addresses match!'
                : '❌ MISMATCH: Private key produces different address than contract verifier',
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
        }, { status: 500 });
    }
}
