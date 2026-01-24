# Design Document

## Overview

This design implements a backend-driven duel settlement system that eliminates the need for player wallet approvals when receiving winnings. The settlement process is moved from the frontend (player wallet) to the backend (verifier wallet), providing a seamless user experience where players automatically receive their winnings after completing a duel.

The key architectural change is introducing a new backend API endpoint that executes the settlement transaction using the verifier wallet, while the frontend transitions to a polling-based status monitoring system.

## Architecture

### Current Architecture (Problematic)

```
Player 1 Finishes → Submit to Supabase
                                        ↓
Player 2 Finishes → Submit to Supabase → Frontend detects both finished
                                        ↓
                                Frontend calls settleDuel() via player's wallet
                                        ↓
                                ❌ Wallet approval popup (BAD UX)
                                        ↓
                                Transaction sent to blockchain
                                        ↓
                                Winner receives USDC
```

### New Architecture (Solution)

```
Player 1 Finishes → Submit to Supabase
                                        ↓
Player 2 Finishes → Submit to Supabase → Trigger backend settlement
                                        ↓
                                Backend API determines winner
                                        ↓
                                Backend generates signature
                                        ↓
                                Backend calls settleDuel() via verifier wallet
                                        ↓
                                ✅ No player interaction needed
                                        ↓
                                Transaction confirmed on blockchain
                                        ↓
                                Winner receives USDC automatically
                                        ↑
                                Frontend polls for status updates
```

## Components and Interfaces

### 1. Backend Settlement Service

**New API Endpoint:** `/api/execute-settlement`

**Purpose:** Execute the settlement transaction using the verifier wallet

**Request:**
```typescript
POST /api/execute-settlement
{
  duelId: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  txHash?: string;
  winner?: string;
  payout?: string;
  error?: string;
  alreadySettled?: boolean;
}
```

**Responsibilities:**
- Fetch duel results from Supabase
- Determine winner using existing logic
- Generate settlement signature
- Create wallet client from verifier private key
- Execute `settleDuel()` transaction on-chain
- Wait for transaction confirmation
- Return settlement details
- Handle race conditions and errors

### 2. Settlement Status API

**New API Endpoint:** `/api/settlement-status`

**Purpose:** Check the current status of a duel settlement

**Request:**
```typescript
GET /api/settlement-status?duelId=123
```

**Response:**
```typescript
{
  status: 'pending' | 'settling' | 'settled' | 'error';
  winner?: string;
  payout?: string;
  txHash?: string;
  error?: string;
  bothPlayersFinished: boolean;
}
```

**Responsibilities:**
- Check Supabase for both player results
- Query blockchain for settlement status
- Return current state to frontend

### 3. Automatic Settlement Trigger

**Implementation:** Supabase Database Trigger or Polling

**Option A - Database Trigger (Recommended):**
```sql
CREATE OR REPLACE FUNCTION trigger_settlement()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if both players have submitted results
  IF (SELECT COUNT(*) FROM duel_results WHERE duel_id = NEW.duel_id) = 2 THEN
    -- Call backend webhook to execute settlement
    PERFORM net.http_post(
      url := 'https://your-domain.com/api/execute-settlement',
      body := json_build_object('duelId', NEW.duel_id)::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_duel_result_insert
AFTER INSERT ON duel_results
FOR EACH ROW
EXECUTE FUNCTION trigger_settlement();
```

**Option B - Frontend Trigger (Simpler):**
- When second player submits results, frontend calls `/api/execute-settlement`
- Backend handles the actual settlement

### 4. Updated Frontend Component

**Modified:** `DuelGameOver.tsx`

**Changes:**
- Remove `settleDuel` call from `useTypeNadContract`
- Add polling mechanism to check settlement status
- Display settlement progress to user
- Handle settlement completion

**New Flow:**
```typescript
1. Submit own results to Supabase
2. Wait for opponent results (existing)
3. When both finished → Call /api/execute-settlement
4. Poll /api/settlement-status every 2 seconds
5. Display settlement progress
6. Show final results when settled
```

### 5. Verifier Wallet Client

**New Utility:** `lib/verifierWallet.ts`

**Purpose:** Create a wallet client for backend settlement transactions

```typescript
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monadTestnet } from '../config/privy';

export function getVerifierWalletClient() {
  const privateKey = process.env.VERIFIER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('VERIFIER_PRIVATE_KEY not configured');
  }
  
  const account = privateKeyToAccount(
    privateKey.startsWith('0x') ? privateKey as `0x${string}` : `0x${privateKey}` as `0x${string}`
  );
  
  return createWalletClient({
    account,
    chain: monadTestnet,
    transport: http(process.env.NEXT_PUBLIC_MONAD_RPC_TESTNET),
  });
}
```

## Data Models

### Duel Results Table (Existing)

```sql
CREATE TABLE duel_results (
  duel_id TEXT NOT NULL,
  player_address TEXT NOT NULL,
  score INTEGER NOT NULL,
  wpm INTEGER NOT NULL,
  misses INTEGER NOT NULL,
  typos INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (duel_id, player_address)
);
```

### Settlement Log Table (New - Optional)

```sql
CREATE TABLE settlement_logs (
  id SERIAL PRIMARY KEY,
  duel_id TEXT NOT NULL,
  winner TEXT NOT NULL,
  payout TEXT NOT NULL,
  tx_hash TEXT,
  status TEXT NOT NULL, -- 'pending', 'confirmed', 'failed'
  error TEXT,
  gas_used BIGINT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Settlement Idempotency

*For any* duel ID, calling the settlement process multiple times should result in exactly one on-chain settlement transaction, with subsequent calls returning the existing settlement result without error.

**Validates: Requirements 4.1, 4.2, 4.3, 4.5**

### Property 2: Winner Determination Consistency

*For any* pair of player results (score, WPM, misses), the winner determined by the backend must match the winner that would be determined by applying the contract's tiebreaker logic (score > WPM > misses > creator wins).

**Validates: Requirements 2.2**

### Property 3: No Player Wallet Interaction

*For any* duel settlement, monitoring wallet approval requests during the settlement process should show zero requests to either player's wallet, with all transactions originating from the verifier wallet.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 4: Automatic Settlement Trigger

*For any* duel where both players have submitted results to the database, the backend settlement process should be triggered automatically without manual intervention.

**Validates: Requirements 2.1**

### Property 5: Signature Validity

*For any* winner address and duel ID, the generated signature must be recoverable to the verifier address when validated using the same message format as the smart contract expects.

**Validates: Requirements 2.3**

### Property 6: Verifier Wallet Transaction Origin

*For any* settlement transaction submitted to the blockchain, the transaction sender address must match the verifier wallet address, not any player wallet address.

**Validates: Requirements 2.4**

### Property 7: Settlement Confirmation Wait

*For any* settlement transaction submitted, the backend must not return a success response until the transaction has been confirmed on the blockchain.

**Validates: Requirements 2.5**

### Property 8: Winner Payout Correctness

*For any* settled duel, the winner's USDC balance increase must equal the calculated payout (total pot minus platform fee), and this must occur without any transaction initiated by the winner's wallet.

**Validates: Requirements 1.3**

### Property 9: Dual State Query Consistency

*For any* duel ID when checking settlement status, the system must query both the database and blockchain, and if they disagree, the blockchain state must be considered authoritative.

**Validates: Requirements 4.4**

### Property 10: Race Condition Result Consistency

*For any* duel where multiple concurrent settlement attempts occur, all attempts must eventually return the same winner and payout values, matching the on-chain settlement result.

**Validates: Requirements 4.5**

### Property 11: Error Logging Completeness

*For any* settlement transaction failure, the system logs must contain the duel ID, error message, stack trace, attempt number, and timestamp.

**Validates: Requirements 5.1, 6.3**

### Property 12: Error Classification Accuracy

*For any* blockchain error, the system must correctly classify it as either temporary (retriable) or permanent (requires manual intervention) based on the error type.

**Validates: Requirements 5.2**

### Property 13: Automatic Retry on Temporary Failure

*For any* temporary failure during settlement, the system must automatically retry the settlement with exponential backoff, up to a maximum number of attempts.

**Validates: Requirements 5.3**

### Property 14: Database Preservation on Error

*For any* settlement error, the duel results in the database must remain intact and unchanged, allowing for manual review and retry.

**Validates: Requirements 5.5**

### Property 15: Transaction Hash Logging

*For any* settlement transaction submitted, the system must log the transaction hash immediately after submission, before waiting for confirmation.

**Validates: Requirements 6.1**

### Property 16: Gas Usage Logging

*For any* confirmed settlement transaction, the system must log the actual gas used by querying the transaction receipt.

**Validates: Requirements 6.2**

### Property 17: Transaction Hash Retrievability

*For any* settled duel, querying the settlement status or history must return a valid transaction hash that can be found on the blockchain explorer.

**Validates: Requirements 6.4**

### Property 18: Cumulative Gas Tracking

*For any* sequence of settlement transactions, the system must maintain an accurate cumulative total of gas spent across all settlements.

**Validates: Requirements 6.5**

## Error Handling

### Error Categories

1. **Blockchain Errors**
   - RPC connection failures → Retry with exponential backoff
   - Transaction reverted → Check if already settled, else log for manual review
   - Insufficient gas → Alert admin, increase gas limit
   - Nonce conflicts → Retry with updated nonce

2. **Database Errors**
   - Missing player results → Return error, wait for results
   - Connection failures → Retry with timeout
   - Constraint violations → Log and investigate

3. **Signature Errors**
   - Invalid private key → Fatal error, alert admin
   - Signature verification failure → Regenerate signature

4. **Race Conditions**
   - Duplicate settlement attempts → Check on-chain status, return existing result
   - Concurrent transactions → Use transaction queuing or locking

### Error Recovery Strategy

```typescript
async function executeSettlementWithRetry(duelId: bigint, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Check if already settled
      const onChainStatus = await checkOnChainSettlement(duelId);
      if (onChainStatus.settled) {
        return onChainStatus;
      }
      
      // Execute settlement
      const result = await executeSettlement(duelId);
      return result;
      
    } catch (error) {
      if (isRaceConditionError(error)) {
        // Fetch existing settlement
        return await fetchExistingSettlement(duelId);
      }
      
      if (attempt === maxRetries) {
        // Log for manual intervention
        await logSettlementFailure(duelId, error);
        throw error;
      }
      
      // Exponential backoff
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }
}
```

## Testing Strategy

### Unit Tests

1. **Winner Determination Logic**
   - Test all tiebreaker scenarios
   - Verify score > WPM > misses > creator priority
   - Test edge cases (equal scores, zero scores)

2. **Signature Generation**
   - Verify signature format matches contract expectations
   - Test with different duel IDs and winners
   - Validate signature recovery

3. **Error Handling**
   - Test retry logic with mocked failures
   - Verify race condition detection
   - Test timeout scenarios

### Property-Based Tests

1. **Property 1: Settlement Idempotency**
   - Generate random duel results
   - Call settlement multiple times
   - Verify only one transaction occurs

2. **Property 2: Winner Determination Consistency**
   - Generate random player scores
   - Compare backend winner with contract logic
   - Verify consistency across all inputs

3. **Property 3: Settlement Completeness**
   - Generate random duel scenarios
   - Execute settlement with various error conditions
   - Verify eventual completion or error state

4. **Property 4: No Player Wallet Interaction**
   - Monitor wallet approval requests during settlement
   - Verify zero player wallet calls
   - Confirm only verifier wallet is used

5. **Property 5: Settlement Status Accuracy**
   - Generate random duel states
   - Query status at different stages
   - Verify status matches actual state

6. **Property 6: Transaction Hash Traceability**
   - Execute settlements
   - Verify transaction hashes are valid
   - Confirm hashes can be found on blockchain

### Integration Tests

1. **End-to-End Settlement Flow**
   - Create duel with two test accounts
   - Submit results for both players
   - Trigger settlement
   - Verify winner receives correct payout
   - Confirm no player approvals required

2. **Race Condition Handling**
   - Trigger multiple simultaneous settlements
   - Verify only one succeeds
   - Confirm others return existing result

3. **Blockchain Interaction**
   - Test with real testnet transactions
   - Verify gas estimation
   - Confirm event emission

### Manual Testing Checklist

- [ ] Create duel and complete with two accounts
- [ ] Verify automatic settlement after both finish
- [ ] Check winner receives correct USDC amount
- [ ] Confirm no wallet popups during settlement
- [ ] Test with network delays
- [ ] Verify error messages display correctly
- [ ] Check transaction hash links work
- [ ] Test race condition with rapid submissions

## Security Considerations

1. **Private Key Protection**
   - Store VERIFIER_PRIVATE_KEY in environment variables only
   - Never expose in client-side code
   - Use secure key management in production

2. **API Endpoint Protection**
   - Rate limit settlement requests
   - Validate duel ID format
   - Check duel exists before processing

3. **Signature Validation**
   - Always verify signature on-chain
   - Use same message format as contract expects
   - Prevent signature replay attacks (duel ID in message)

4. **Gas Management**
   - Set reasonable gas limits
   - Monitor verifier wallet balance
   - Alert when balance is low

5. **Database Security**
   - Validate all player addresses
   - Prevent SQL injection
   - Use parameterized queries

## Performance Considerations

1. **Settlement Latency**
   - Target: < 10 seconds from both players finishing to settlement confirmation
   - Optimize RPC calls
   - Use fast RPC endpoints

2. **Polling Frequency**
   - Frontend polls every 2 seconds
   - Backend caches settlement status for 1 second
   - Use WebSocket for real-time updates (future enhancement)

3. **Concurrent Settlements**
   - Handle multiple duels settling simultaneously
   - Use transaction queuing if needed
   - Monitor nonce management

4. **Database Queries**
   - Index duel_id column
   - Optimize result lookups
   - Clean up old duel results periodically

## Deployment Plan

### Phase 1: Backend Implementation
1. Create `/api/execute-settlement` endpoint
2. Create `/api/settlement-status` endpoint
3. Implement verifier wallet client
4. Add error handling and logging
5. Test on testnet

### Phase 2: Frontend Updates
1. Remove `settleDuel` call from `DuelGameOver.tsx`
2. Add settlement status polling
3. Update UI to show settlement progress
4. Test end-to-end flow

### Phase 3: Database Setup
1. Add settlement_logs table (optional)
2. Create database trigger (if using Option A)
3. Set up monitoring

### Phase 4: Production Deployment
1. Deploy backend changes
2. Deploy frontend changes
3. Monitor first settlements
4. Verify gas costs and performance

## Monitoring and Observability

### Metrics to Track

1. **Settlement Success Rate**
   - Percentage of successful settlements
   - Average time to settlement
   - Failure reasons

2. **Gas Costs**
   - Average gas per settlement
   - Total gas spent per day
   - Verifier wallet balance

3. **Error Rates**
   - RPC failures
   - Database errors
   - Race conditions detected

4. **User Experience**
   - Time from game end to payout
   - Player complaints about approvals (should be zero)

### Logging Strategy

```typescript
// Log all settlement attempts
console.log('[Settlement] Starting', {
  duelId,
  player1Score,
  player2Score,
  winner,
  timestamp: new Date().toISOString()
});

// Log transaction submission
console.log('[Settlement] Transaction submitted', {
  duelId,
  txHash,
  gasLimit,
  timestamp: new Date().toISOString()
});

// Log completion
console.log('[Settlement] Completed', {
  duelId,
  txHash,
  gasUsed,
  payout,
  duration: endTime - startTime,
  timestamp: new Date().toISOString()
});

// Log errors
console.error('[Settlement] Failed', {
  duelId,
  error: error.message,
  stack: error.stack,
  attempt,
  timestamp: new Date().toISOString()
});
```

## Future Enhancements

1. **WebSocket Real-Time Updates**
   - Replace polling with WebSocket connections
   - Push settlement status to connected clients
   - Reduce server load

2. **Batch Settlements**
   - Settle multiple duels in one transaction
   - Reduce gas costs
   - Improve throughput

3. **Settlement Queue**
   - Queue settlements during high load
   - Process in order
   - Prevent nonce conflicts

4. **Automated Monitoring**
   - Alert on settlement failures
   - Auto-retry failed settlements
   - Dashboard for admin oversight

5. **Gas Optimization**
   - Analyze gas usage patterns
   - Optimize contract calls
   - Use gas price oracles for optimal timing
