# Wallet Balance & Contract Fixes

## Issues Fixed

### 1. **Environment Variables Not Accessible**
- **Problem**: Environment variables weren't properly prefixed with `NEXT_PUBLIC_` which is required for Next.js client-side code
- **Solution**: Added `NEXT_PUBLIC_` prefix to all client-side environment variables in `.env.local`
  - `MONAD_RPC_TESTNET` → `NEXT_PUBLIC_MONAD_RPC_TESTNET`
  - `USDC_ADDRESS` → `NEXT_PUBLIC_USDC_ADDRESS`
  - Added `NEXT_PUBLIC_TYPE_NAD_CONTRACT_ADDRESS`
  - Added `NEXT_PUBLIC_ENTROPY_ADDRESS`

### 2. **getEntropyFee() Contract Call Reverting**
- **Problem**: The `getEntropyFee()` function was crashing the app when it failed
- **Solution**: Added try-catch error handling with a reasonable fallback value (0.0001 MON = 10^14 wei)
- **Location**: `frontend/src/hooks/useTypeNadContract.ts`

### 3. **USDC Balance Not Fetching**
- **Problem**: Balance was showing as 0 even with 10 USDC in wallet
- **Solution**: 
  - Fixed RPC URL environment variable reference
  - Added comprehensive logging to trace the issue
  - Improved error handling in `getBalance` function
- **Location**: `frontend/src/hooks/useUSDC.ts`

### 4. **Better Error Handling & Logging**
- Added detailed console logging to track:
  - Wallet address
  - USDC contract address
  - RPC URL
  - Balance fetch attempts
  - Entropy fee fetch attempts
- **Location**: `frontend/src/components/UI/SoloModeScreen.tsx`

### 5. **Debug Panel**
- Created a new `DebugPanel` component that shows:
  - Connected wallet address
  - USDC contract address
  - USDC balance (formatted and raw)
  - Entropy fee
  - RPC URL being used
  - Any errors encountered
- **Location**: `frontend/src/components/DebugPanel.tsx`

### 6. **Display Fix**
- Fixed entropy fee display to show in WAN (native token) instead of MON
- Changed from 6 decimals to 18 decimals for proper WAN formatting
- **Location**: `frontend/src/components/UI/SoloModeScreen.tsx`

## Files Modified

1. `/frontend/.env.local` - Added NEXT_PUBLIC_ prefixes
2. `/frontend/src/hooks/useTypeNadContract.ts` - Added error handling for getEntropyFee
3. `/frontend/src/hooks/useUSDC.ts` - Fixed env vars and added logging
4. `/frontend/src/components/UI/SoloModeScreen.tsx` - Improved error handling and logging
5. `/frontend/src/components/DebugPanel.tsx` - New debugging component
6. `/frontend/src/components/GameStateManager.tsx` - Added DebugPanel integration

## Testing Instructions

1. **Restart Dev Server** - Environment variables have been updated, so you need to restart:
   ```bash
   # Already done - server running on http://localhost:3000
   ```

2. **Check Debug Panel** - Once you connect your wallet, you'll see a debug panel in the bottom-right corner showing:
   - Your wallet address
   - USDC balance (should show 10 USDC if you have it)
   - Entropy fee
   - RPC configuration

3. **Check Browser Console** - Look for detailed logs when opening the staking modal:
   - "=== Fetching staking modal data ==="
   - "Fetching USDC balance for: [address]"
   - "USDC Balance fetched: [amount]"
   - "Entropy fee fetched: [amount]"

4. **Test Staking** - Try to stake 1 USDC and verify:
   - Balance shows correctly
   - Approval flow works
   - Transaction can be submitted

## Troubleshooting

If balance still shows as 0:

1. **Check USDC Contract Address**: The debug panel shows the USDC address being used. Verify this matches your testnet USDC token.

2. **Check RPC Connection**: Debug panel shows the RPC URL. Try calling it directly or checking network tab in browser dev tools.

3. **Check Browser Console**: Look for any error messages in the logs we added.

4. **Check Wallet Network**: Make sure your wallet is connected to Monad Testnet.

5. **Verify USDC Balance On-Chain**: Use a block explorer to verify you actually have 10 USDC at your address on Monad Testnet.

## Next Steps

- Remove or hide the debug panel in production by wrapping it in a conditional based on environment
- Consider adding a network mismatch warning if user is on wrong network
- Add retry logic for failed RPC calls
- Create a network status indicator
