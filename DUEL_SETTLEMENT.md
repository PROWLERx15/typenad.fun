# Duel Settlement System

## Overview

The duel settlement system has been redesigned to provide a seamless user experience where players automatically receive their winnings without needing to approve any transactions. Settlement is now handled by a backend service using the verifier wallet, eliminating wallet approval popups for players.

## Architecture

### Flow

1. **Game Completion**: Both players complete the duel and submit their results to Supabase
2. **Automatic Trigger**: When both results are submitted, the frontend triggers backend settlement
3. **Backend Execution**: The backend service:
   - Fetches both player results from database
   - Determines the winner using scoring rules
   - Generates a cryptographic signature
   - Executes the `settleDuel()` transaction using the verifier wallet
   - Waits for blockchain confirmation
4. **Status Updates**: Frontend polls for settlement status and displays results
5. **Payout**: Winner automatically receives USDC (no approval needed!)

### Key Components

- **`/api/execute-settlement`**: Executes settlement transaction using verifier wallet
- **`/api/settlement-status`**: Returns current settlement status for polling
- **`lib/verifierWallet.ts`**: Utility for creating verifier wallet client
- **`DuelGameOver.tsx`**: Updated to use backend settlement with polling

## Environment Variables

### Required

```bash
# Backend verifier wallet private key (pays gas for settlements)
VERIFIER_PRIVATE_KEY=0x...

# Monad testnet RPC endpoint
NEXT_PUBLIC_MONAD_RPC_TESTNET=https://testnet-rpc.monad.xyz
```

### Setup

1. Generate a new wallet or use an existing one for the verifier
2. Add the private key to `.env.local`
3. Fund the wallet with MON tokens for gas fees
4. Restart your development server

**Security Note**: Never commit the `.env.local` file or expose the private key in client-side code.

## API Endpoints

### POST /api/execute-settlement

Executes the duel settlement transaction using the backend verifier wallet.

**Request:**
```json
{
  "duelId": "123"
}
```

**Response:**
```json
{
  "success": true,
  "txHash": "0x...",
  "winner": "0x...",
  "payout": "1800000",
  "gasUsed": "150000"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "temporary": true
}
```

### GET /api/settlement-status?duelId=123

Check the current status of a duel settlement.

**Response:**
```json
{
  "success": true,
  "status": "settled",
  "winner": "0x...",
  "payout": "1800000",
  "txHash": "0x...",
  "bothPlayersFinished": true
}
```

**Status Values:**
- `pending`: Waiting for players to finish
- `settling`: Settlement transaction in progress
- `settled`: Settlement complete
- `error`: Settlement failed

## Winner Determination

Winners are determined using the following priority:

1. **Higher Score** wins
2. If tied, **Higher WPM** wins
3. If tied, **Fewer Misses** wins
4. If still tied, **Player 1 (creator)** wins

This logic is implemented consistently in both the backend API and frontend display.

## Error Handling

### Automatic Retry

The settlement system automatically retries failed transactions with exponential backoff:
- Maximum 3 attempts
- Backoff: 2s, 4s, 8s
- Only retries temporary errors (network issues, nonce conflicts, etc.)

### Race Condition Handling

If multiple settlement requests occur for the same duel:
- System checks if duel is already settled on-chain
- Returns existing settlement result
- Prevents duplicate transactions

### Error Classification

Errors are classified as:
- **Temporary**: Network issues, timeouts, nonce conflicts → Auto-retry
- **Permanent**: Invalid signature, insufficient funds → Manual intervention

## Monitoring

### Logs

All settlement attempts are logged with:
- Duel ID and player scores
- Transaction hash and gas used
- Winner and payout amount
- Duration and timestamp
- Any errors with full stack traces

### Log Format

```
[Settlement] Starting attempt { duelId, attempt, player1Score, player2Score, timestamp }
[Settlement] Transaction submitted { duelId, txHash, timestamp }
[Settlement] Transaction confirmed { duelId, txHash, gasUsed, status, timestamp }
[Settlement] Completed successfully { duelId, txHash, winner, payout, gasUsed, duration, timestamp }
```

### Error Logs

```
[Settlement] Attempt failed { duelId, attempt, error, stack, timestamp }
[Settlement] Failed permanently { duelId, error, stack, attempts, timestamp }
```

## Troubleshooting

### Settlement Not Triggering

**Symptoms**: Both players finish but settlement doesn't start

**Possible Causes**:
1. Database connection issue
2. Missing player results in database
3. Frontend not calling `/api/execute-settlement`

**Solutions**:
- Check browser console for errors
- Verify both results in `duel_results` table
- Manually call `/api/execute-settlement` with duelId

### Settlement Fails

**Symptoms**: Settlement status shows error

**Possible Causes**:
1. Verifier wallet has insufficient MON for gas
2. RPC endpoint is down or rate-limited
3. Duel already settled (race condition)
4. Invalid signature

**Solutions**:
- Check verifier wallet balance
- Try different RPC endpoint
- Check blockchain explorer for existing settlement
- Verify VERIFIER_PRIVATE_KEY is correct

### Players See Wallet Approval Popup

**Symptoms**: Players are prompted to approve transaction

**Possible Causes**:
1. Old code still calling `settleDuel` from player wallet
2. Wrong API endpoint being called

**Solutions**:
- Ensure you're using updated `DuelGameOver.tsx`
- Verify `/api/execute-settlement` is being called, not `/api/settle-duel`
- Check that `settleDuel` from `useTypeNadContract` is not being used

### Settlement Timeout

**Symptoms**: Settlement status stuck on "settling" for > 60 seconds

**Possible Causes**:
1. Transaction stuck in mempool
2. RPC endpoint not responding
3. Very high gas prices

**Solutions**:
- Check transaction on blockchain explorer
- Try different RPC endpoint
- Increase gas limit in settlement code
- Manually verify settlement status

## Testing

### Manual Testing

1. Create a duel with two test accounts
2. Complete the duel with both accounts
3. Verify no wallet approval popups appear
4. Check winner receives correct USDC amount
5. Verify transaction hash is valid on explorer

### Checking Settlement Status

```bash
# Check if duel is settled
curl "http://localhost:3000/api/settlement-status?duelId=123"

# Trigger settlement manually
curl -X POST http://localhost:3000/api/execute-settlement \
  -H "Content-Type: application/json" \
  -d '{"duelId":"123"}'
```

### Verifying On-Chain

1. Get transaction hash from settlement response
2. Visit: `https://testnet.monadexplorer.com/tx/{txHash}`
3. Verify:
   - Transaction succeeded
   - `DuelSettled` event was emitted
   - Winner received correct payout
   - Gas was paid by verifier wallet

## Gas Costs

### Typical Settlement

- Gas Used: ~150,000 - 200,000 gas
- Cost: Depends on MON gas price
- Paid by: Verifier wallet (not players!)

### Monitoring Gas

Check verifier wallet balance regularly:
```bash
# Get verifier address from logs or code
# Check balance on Monad explorer
```

Set up alerts when balance is low to ensure uninterrupted service.

## Security Considerations

1. **Private Key Protection**
   - Store VERIFIER_PRIVATE_KEY only in environment variables
   - Never commit to version control
   - Use secure key management in production

2. **API Rate Limiting**
   - Implement rate limiting on settlement endpoints
   - Prevent abuse and spam

3. **Signature Validation**
   - All signatures verified on-chain
   - Prevents unauthorized settlements

4. **Database Security**
   - Validate all player addresses
   - Use parameterized queries
   - Prevent SQL injection

## Future Enhancements

1. **WebSocket Updates**: Replace polling with real-time WebSocket connections
2. **Batch Settlements**: Settle multiple duels in one transaction to save gas
3. **Settlement Queue**: Queue settlements during high load
4. **Automated Monitoring**: Alert on settlement failures, auto-retry
5. **Gas Optimization**: Analyze patterns and optimize gas usage
