/**
 * Validate required environment variables on server startup
 * This should be called early in the application lifecycle
 */
export function validateServerEnvironment() {
  const requiredEnvVars = [
    'VERIFIER_PRIVATE_KEY',
    'NEXT_PUBLIC_MONAD_RPC_TESTNET',
  ];

  const missing: string[] = [];
  const invalid: string[] = [];

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    
    if (!value) {
      missing.push(envVar);
      continue;
    }

    // Validate VERIFIER_PRIVATE_KEY format
    if (envVar === 'VERIFIER_PRIVATE_KEY') {
      const privateKey = value.startsWith('0x') ? value : `0x${value}`;
      if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
        invalid.push(`${envVar} (must be a 64-character hex string)`);
      }
    }

    // Validate RPC URL format
    if (envVar === 'NEXT_PUBLIC_MONAD_RPC_TESTNET') {
      try {
        new URL(value);
      } catch {
        invalid.push(`${envVar} (must be a valid URL)`);
      }
    }
  }

  if (missing.length > 0 || invalid.length > 0) {
    const errorMessages: string[] = [];
    
    if (missing.length > 0) {
      errorMessages.push(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    if (invalid.length > 0) {
      errorMessages.push(`Invalid environment variables: ${invalid.join(', ')}`);
    }

    const fullError = [
      '❌ Environment Variable Validation Failed',
      '',
      ...errorMessages,
      '',
      'Please ensure all required environment variables are set in your .env.local file:',
      '',
      'VERIFIER_PRIVATE_KEY=0x... (64-character hex private key)',
      'NEXT_PUBLIC_MONAD_RPC_TESTNET=https://... (RPC endpoint URL)',
      '',
    ].join('\n');

    console.error(fullError);
    throw new Error('Environment validation failed. Check console for details.');
  }

  console.log('✅ Environment variables validated successfully');
}

/**
 * Get helpful error message for missing VERIFIER_PRIVATE_KEY
 */
export function getVerifierKeyErrorMessage(): string {
  return [
    'VERIFIER_PRIVATE_KEY is not configured.',
    '',
    'This private key is required for the backend to execute settlement transactions.',
    'The verifier wallet pays gas fees so players don\'t need to approve transactions.',
    '',
    'To fix this:',
    '1. Generate a new wallet or use an existing one',
    '2. Add the private key to your .env.local file:',
    '   VERIFIER_PRIVATE_KEY=0x...',
    '3. Fund the wallet with MON tokens for gas fees',
    '4. Restart your development server',
    '',
  ].join('\n');
}
