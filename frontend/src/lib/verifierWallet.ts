import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monadTestnet } from '../config/privy';

/**
 * Get a wallet client for the backend verifier wallet
 * This wallet is used to execute settlement transactions on behalf of the system
 * @returns Wallet client configured with verifier account
 * @throws Error if VERIFIER_PRIVATE_KEY is not configured
 */
export function getVerifierWalletClient() {
  const privateKey = process.env.VERIFIER_PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error('VERIFIER_PRIVATE_KEY not configured in environment variables');
  }

  // Ensure private key has 0x prefix
  const formattedPrivateKey = privateKey.startsWith('0x')
    ? (privateKey as `0x${string}`)
    : (`0x${privateKey}` as `0x${string}`);

  // Create account from private key
  const account = privateKeyToAccount(formattedPrivateKey);

  // Create wallet client
  const walletClient = createWalletClient({
    account,
    chain: monadTestnet,
    transport: http(process.env.NEXT_PUBLIC_MONAD_RPC_TESTNET || 'https://testnet-rpc.monad.xyz'),
  });

  return walletClient;
}

/**
 * Get a public client for reading blockchain state
 * @returns Public client configured for Monad testnet
 */
export function getVerifierPublicClient() {
  return createPublicClient({
    chain: monadTestnet,
    transport: http(process.env.NEXT_PUBLIC_MONAD_RPC_TESTNET || 'https://testnet-rpc.monad.xyz'),
  });
}

/**
 * Get the verifier wallet address
 * @returns The address of the verifier wallet
 * @throws Error if VERIFIER_PRIVATE_KEY is not configured
 */
export function getVerifierAddress(): `0x${string}` {
  const privateKey = process.env.VERIFIER_PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error('VERIFIER_PRIVATE_KEY not configured in environment variables');
  }

  const formattedPrivateKey = privateKey.startsWith('0x')
    ? (privateKey as `0x${string}`)
    : (`0x${privateKey}` as `0x${string}`);

  const account = privateKeyToAccount(formattedPrivateKey);
  return account.address;
}
