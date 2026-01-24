# Duel Settlement Testing Guide

## Prerequisites

Before testing, ensure:

1. **Environment Variables Set**:
   ```bash
   VERIFIER_PRIVATE_KEY=0x... # Your verifier wallet private key
   NEXT_PUBLIC_MONAD_RPC_TESTNET=https://testnet-rpc.monad.xyz
   ```

2. **Verifier Wallet Funded**: The verifier wallet needs MON tokens for gas fees
   - Get verifier address from logs or use `getVerifierAddress()` function
   - Fund with testnet MON tokens

3. **Two Test Accounts**: You'll need two separate wallets to test duels
   - Each needs USDC for staking
   - Each needs MON for creating/joining duels

## End-to-End Testing Checklist

### ✅ Test 1: Basic Settlement Flow

**Objective**: Verify automatic settlement without wallet approvals

**Steps**:
1. Open two browser windows (or use incognito for second account)
2. Connect Account A in window 1
3. Connect Account B in window 2
4. **Account A**: Create a duel with stake amount (e.g., 1 USDC)
   - Should see wallet approval for USDC transfer ✓
   - Should see wallet approval for transaction ✓
5. **Account B**: Join the duel
   - Should see wallet approval for USDC transfer ✓
   - Should see wallet approval for transaction ✓
6. **Both Accounts**: Play the game for 60 seconds
7. **Both Accounts**: Game ends, results submitted
   - Should see "Submitting..." status ✓
8. **First to Finish**: Should see "Waiting for Opponent..." ✓
9. **Second to Finish**: Both should see "Settlement in progress..." ✓
10. **Critical Check**: **NO WALLET APPROVAL POPUPS** during settlement ✓
11. **Both Accounts**: Should see settlement complete within 10 seconds ✓
12. **Winner**: Should see "You Win!" with payout amount ✓
13. **Loser**: Should see "You Lose!" ✓
14. **Winner**: Check USDC balance increased by payout amount ✓
15. **Both Accounts**: Click transaction link, verify on explorer ✓

**Expected Results**:
- No wallet approvals during settlement
- Winner receives ~90% of total pot (10% platform fee)
- Transaction visible on blockchain explorer
- Settlement completes in < 10 seconds

### ✅ Test 2: Race Condition Handling

**Objective**: Verify system handles concurrent settlement attempts

**Steps**:
1. Complete a duel with two accounts
2. Open browser console on both accounts
3. Manually trigger settlement from both accounts simultaneously:
   ```javascript
   fetch('/api/execute-settlement', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ duelId: 'YOUR_DUEL_ID' })
   }).then(r => r.json()).then(console.log)
   ```
4. Check that both requests succeed
5. Verify only ONE transaction on blockchain
6. Verify both responses return same winner and payout

**Expected Results**:
- Both API calls return success
- Only one on-chain transaction
- Consistent winner and payout in both responses
- No errors in server logs

### ✅ Test 3: Settlement Status Polling

**Objective**: Verify frontend correctly polls for status updates

**Steps**:
1. Complete a duel
2. Open browser DevTools Network tab
3. Watch for `/api/settlement-status` requests
4. Verify requests occur every ~2 seconds
5. Verify polling stops when settlement completes

**Expected Results**:
- Status API called every 2 seconds
- Polling stops after settlement
- UI updates reflect status changes

### ✅ Test 4: Error Handling

**Objective**: Verify error handling and retry functionality

**Steps**:
1. **Test Insufficient Gas**:
   - Drain verifier wallet MON balance
   - Complete a duel
   - Should see error message
   - Click "Retry Settlement"
   - Refund verifier wallet
   - Should succeed on retry

2. **Test Network Error**:
   - Disconnect internet briefly during settlement
   - Should see temporary error
   - Should auto-retry when connection restored

3. **Test Invalid Duel ID**:
   ```bash
   curl -X POST http://localhost:3000/api/execute-settlement \
     -H "Content-Type: application/json" \
     -d '{"duelId":"999999"}'
   ```
   - Should return error response

**Expected Results**:
- Clear error messages displayed
- Retry button works
- Automatic retry for temporary errors
- Permanent errors require manual intervention

### ✅ Test 5: Winner Determination

**Objective**: Verify correct winner determination logic

**Test Cases**:

| Player 1 Score | Player 2 Score | Player 1 WPM | Player 2 WPM | Player 1 Misses | Player 2 Misses | Expected Winner |
|----------------|----------------|--------------|--------------|-----------------|-----------------|-----------------|
| 1000           | 800            | 50           | 50           | 5               | 5               | Player 1 (higher score) |
| 1000           | 1000           | 60           | 50           | 5               | 5               | Player 1 (higher WPM) |
| 1000           | 1000           | 50           | 50           | 3               | 5               | Player 1 (fewer misses) |
| 1000           | 1000           | 50           | 50           | 5               | 5               | Player 1 (creator tiebreaker) |

**Steps**:
1. Play duels with different score combinations
2. Verify winner matches expected logic
3. Check server logs for winner determination

**Expected Results**:
- Winner determined correctly in all cases
- Tiebreaker favors creator (Player 1)

### ✅ Test 6: Database Cleanup

**Objective**: Verify duel results are cleaned up after settlement

**Steps**:
1. Complete a duel
2. Before settlement, check database:
   ```sql
   SELECT * FROM duel_results WHERE duel_id = 'YOUR_DUEL_ID';
   ```
   - Should see 2 rows (both players)
3. Wait for settlement to complete
4. Check database again
   - Should see 0 rows (cleaned up)

**Expected Results**:
- Results present before settlement
- Results removed after successful settlement
- Results preserved if settlement fails

### ✅ Test 7: Transaction Verification

**Objective**: Verify on-chain settlement is correct

**Steps**:
1. Complete a duel and get transaction hash
2. Visit Monad testnet explorer: `https://testnet.monadexplorer.com/tx/{txHash}`
3. Verify:
   - Transaction status: Success ✓
   - From address: Verifier wallet address ✓
   - To address: TypeNad contract address ✓
   - Function called: `settleDuel` ✓
   - Event emitted: `DuelSettled` ✓
   - Event args: Correct duelId, winner, payout ✓
4. Check winner's wallet transactions
   - Should see USDC transfer from contract ✓

**Expected Results**:
- Transaction succeeded
- Sent from verifier wallet (not player)
- DuelSettled event with correct data
- Winner received USDC

## Manual API Testing

### Test Settlement Execution

```bash
# Execute settlement
curl -X POST http://localhost:3000/api/execute-settlement \
  -H "Content-Type: 'application/json" \
  -d '{"duelId":"123"}'

# Expected response:
{
  "success": true,
  "txHash": "0x...",
  "winner": "0x...",
  "payout": "1800000",
  "gasUsed": "150000"
}
```

### Test Settlement Status

```bash
# Check status
curl "http://localhost:3000/api/settlement-status?duelId=123"

# Expected response (pending):
{
  "success": true,
  "status": "pending",
  "bothPlayersFinished": false
}

# Expected response (settled):
{
  "success": true,
  "status": "settled",
  "winner": "0x...",
  "payout": "1800000",
  "txHash": "0x...",
  "bothPlayersFinished": true
}
```

## Common Issues and Solutions

### Issue: "VERIFIER_PRIVATE_KEY not configured"

**Solution**:
1. Add to `.env.local`:
   ```
   VERIFIER_PRIVATE_KEY=0x...
   ```
2. Restart dev server

### Issue: "Insufficient funds for gas"

**Solution**:
1. Get verifier wallet address from logs
2. Send MON tokens to verifier wallet
3. Retry settlement

### Issue: Settlement timeout

**Solution**:
1. Check RPC endpoint is responding
2. Check transaction on explorer
3. Try different RPC endpoint
4. Increase timeout in code

### Issue: Players still see wallet approval

**Solution**:
1. Clear browser cache
2. Verify using updated `DuelGameOver.tsx`
3. Check that `/api/execute-settlement` is being called
4. Ensure not calling `settleDuel` from `useTypeNadContract`

## Performance Benchmarks

### Target Metrics

- **Settlement Latency**: < 10 seconds from both players finishing
- **API Response Time**: < 2 seconds for execute-settlement
- **Status Check**: < 500ms for settlement-status
- **Gas Usage**: 150,000 - 200,000 gas per settlement

### Measuring Performance

1. **Settlement Latency**:
   - Note timestamp when second player finishes
   - Note timestamp when settlement completes
   - Calculate difference

2. **API Response Time**:
   - Check Network tab in DevTools
   - Look at timing for `/api/execute-settlement`

3. **Gas Usage**:
   - Check transaction on explorer
   - Look at "Gas Used" field

## Logging and Debugging

### Enable Verbose Logging

Check server console for detailed logs:

```
[Settlement] Starting attempt { duelId, attempt, player1Score, player2Score }
[Settlement] Winner determined { duelId, winner }
[Settlement] Signature generated { duelId, signerAddress }
[Settlement] Transaction submitted { duelId, txHash }
[Settlement] Transaction confirmed { duelId, txHash, gasUsed }
[Settlement] Completed successfully { duelId, winner, payout, duration }
```

### Debug Settlement Issues

1. Check server logs for errors
2. Verify both player results in database
3. Check verifier wallet balance
4. Test RPC endpoint connectivity
5. Verify contract address and ABI are correct

## Success Criteria

All tests pass when:

- ✅ No wallet approvals during settlement
- ✅ Winner receives correct payout automatically
- ✅ Settlement completes in < 10 seconds
- ✅ Race conditions handled gracefully
- ✅ Errors display clear messages
- ✅ Retry functionality works
- ✅ Database cleaned up after settlement
- ✅ Transaction verifiable on blockchain
- ✅ Gas paid by verifier wallet
- ✅ Logs show complete audit trail

## Next Steps After Testing

1. Monitor first production settlements
2. Set up alerts for verifier wallet balance
3. Track gas costs and optimize if needed
4. Gather user feedback on UX
5. Consider implementing WebSocket for real-time updates
