/**
 * Environment Variable Validation
 * Validates required environment variables at startup
 */

export function validateEnvironment() {
  const required = {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    
    // Blockchain
    NEXT_PUBLIC_MONAD_RPC_TESTNET: process.env.NEXT_PUBLIC_MONAD_RPC_TESTNET,
    NEXT_PUBLIC_TYPE_NAD_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_TYPE_NAD_CONTRACT_ADDRESS,
    NEXT_PUBLIC_USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS,
    
    // Privy
    NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  };

  const serverRequired = {
    // Server-side only (check if running on server)
    VERIFIER_PRIVATE_KEY: process.env.VERIFIER_PRIVATE_KEY,
    VERIFIER_ADDRESS: process.env.VERIFIER_ADDRESS,
  };

  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required public variables
  Object.entries(required).forEach(([key, value]) => {
    if (!value) {
      missing.push(key);
    }
  });

  // Check server-side variables (only warn if missing)
  if (typeof window === 'undefined') {
    Object.entries(serverRequired).forEach(([key, value]) => {
      if (!value) {
        warnings.push(key);
      }
    });
  }

  if (missing.length > 0) {
    const error = `Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}`;
    console.error('❌ Environment Validation Failed:', error);
    throw new Error(error);
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Missing optional server environment variables:', warnings);
  }

  console.log('✅ Environment validation passed');
}

/**
 * Normalize wallet address to lowercase for consistent database queries
 */
export function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

/**
 * Validate and normalize wallet address
 */
export function validateAndNormalizeAddress(address: string | null | undefined): string {
  if (!address) {
    throw new Error('Wallet address is required');
  }
  return normalizeAddress(address);
}
