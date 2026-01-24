# Implementation Plan

- [x] 1. Create backend verifier wallet utility
  - Create `frontend/src/lib/verifierWallet.ts` with wallet client factory
  - Load VERIFIER_PRIVATE_KEY from environment
  - Create wallet client with Monad testnet configuration
  - Add error handling for missing private key
  - _Requirements: 1.2, 2.4_

- [x] 2. Implement settlement execution API endpoint
  - Create `frontend/src/app/api/execute-settlement/route.ts`
  - Accept duelId in request body
  - Fetch both player results from Supabase
  - Determine winner using existing logic from settle-duel API
  - Generate settlement signature
  - Create verifier wallet client
  - Execute settleDuel() contract call
  - Wait for transaction confirmation
  - Parse payout from DuelSettled event
  - Return settlement result with txHash
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.1 Add race condition handling to settlement execution
  - Check if duel is already settled on-chain before executing
  - Query blockchain for existing DuelSettled events
  - If already settled, return existing result
  - Handle DuelAlreadySettled contract error
  - Return consistent result for concurrent requests
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 2.2 Add error handling and retry logic to settlement execution
  - Implement exponential backoff retry (max 3 attempts)
  - Classify errors as temporary vs permanent
  - Log all errors with full context (duelId, error, stack, attempt)
  - Preserve duel results in database on error
  - Return appropriate error responses
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [x] 2.3 Add comprehensive logging to settlement execution
  - Log settlement start with duel details
  - Log transaction submission with txHash and gas limit
  - Log transaction confirmation with gas used
  - Log settlement completion with payout and duration
  - Log all errors with full context
  - _Requirements: 6.1, 6.2, 6.3_

- [ ]* 2.4 Write property test for settlement idempotency
  - **Property 1: Settlement Idempotency**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.5**
  - Generate random duel with results
  - Call execute-settlement API multiple times concurrently
  - Verify only one on-chain transaction occurs
  - Verify all calls return same winner and payout
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [ ]* 2.5 Write property test for winner determination consistency
  - **Property 2: Winner Determination Consistency**
  - **Validates: Requirements 2.2**
  - Generate random player scores (score, WPM, misses)
  - Determine winner using backend logic
  - Determine winner using contract tiebreaker rules
  - Verify both methods produce same winner
  - Test all tiebreaker scenarios
  - _Requirements: 2.2_

- [ ]* 2.6 Write property test for no player wallet interaction
  - **Property 3: No Player Wallet Interaction**
  - **Validates: Requirements 1.1, 1.2, 1.3**
  - Mock wallet approval tracking
  - Execute settlement for random duel
  - Verify zero wallet approval requests to player wallets
  - Verify transaction sender is verifier wallet
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 3. Implement settlement status API endpoint
  - Create `frontend/src/app/api/settlement-status/route.ts`
  - Accept duelId as query parameter
  - Check Supabase for both player results
  - Query blockchain for settlement status
  - Return status: pending/settling/settled/error
  - Include winner, payout, txHash if settled
  - Return bothPlayersFinished flag
  - _Requirements: 3.1, 3.2, 3.3, 4.4_

- [ ]* 3.1 Write property test for dual state query consistency
  - **Property 9: Dual State Query Consistency**
  - **Validates: Requirements 4.4**
  - Generate random duel states
  - Query settlement status
  - Verify both database and blockchain are queried
  - Verify blockchain state is authoritative on conflict
  - _Requirements: 4.4_

- [x] 4. Update DuelGameOver component to use backend settlement
  - Remove settleDuel call from useTypeNadContract hook usage
  - Remove handleSettle function that calls contract
  - Add call to /api/execute-settlement after both players finish
  - Implement polling mechanism for /api/settlement-status
  - Poll every 2 seconds until settled or error
  - Update UI states based on API responses
  - Display settlement progress to users
  - Show final results when settled
  - _Requirements: 1.1, 1.4, 1.5, 3.1, 3.2, 3.3, 3.5_

- [x] 4.1 Add error handling to DuelGameOver settlement flow
  - Display error messages from API
  - Add retry button for failed settlements
  - Handle timeout scenarios (60 second max wait)
  - Show appropriate messages for different error types
  - _Requirements: 3.4, 5.4_

- [ ]* 4.2 Write property test for automatic settlement trigger
  - **Property 4: Automatic Settlement Trigger**
  - **Validates: Requirements 2.1**
  - Generate random duel results
  - Submit both player results to database
  - Verify settlement is triggered automatically
  - Verify no manual intervention needed
  - _Requirements: 2.1_

- [x] 5. Add settlement cleanup to database
  - Update execute-settlement API to delete duel_results after settlement
  - Clean up results only after successful on-chain settlement
  - Preserve results if settlement fails
  - _Requirements: 5.5_

- [ ]* 5.1 Write property test for database preservation on error
  - **Property 14: Database Preservation on Error**
  - **Validates: Requirements 5.5**
  - Generate random duel results
  - Trigger settlement with forced error
  - Verify duel results remain in database
  - Verify results are unchanged
  - _Requirements: 5.5_

- [x] 6. Add environment variable validation
  - Check VERIFIER_PRIVATE_KEY exists on server startup
  - Validate private key format
  - Add helpful error messages if missing
  - Document required environment variables
  - _Requirements: 1.2_

- [ ]* 6.1 Write property test for signature validity
  - **Property 5: Signature Validity**
  - **Validates: Requirements 2.3**
  - Generate random duel IDs and winner addresses
  - Generate signature using backend logic
  - Recover signer address from signature
  - Verify recovered address matches verifier address
  - _Requirements: 2.3_

- [ ]* 6.2 Write property test for verifier wallet transaction origin
  - **Property 6: Verifier Wallet Transaction Origin**
  - **Validates: Requirements 2.4**
  - Execute settlement for random duel
  - Query transaction details from blockchain
  - Verify transaction sender is verifier wallet address
  - Verify sender is not any player wallet address
  - _Requirements: 2.4_

- [ ]* 6.3 Write property test for transaction hash logging
  - **Property 15: Transaction Hash Logging**
  - **Validates: Requirements 6.1**
  - Execute settlement for random duel
  - Check logs immediately after submission
  - Verify transaction hash is logged
  - Verify log contains duel ID and timestamp
  - _Requirements: 6.1_

- [ ]* 6.4 Write property test for gas usage logging
  - **Property 16: Gas Usage Logging**
  - **Validates: Requirements 6.2**
  - Execute settlement for random duel
  - Wait for confirmation
  - Check logs after confirmation
  - Verify gas used is logged
  - Verify log contains final status
  - _Requirements: 6.2_

- [x] 7. Update documentation
  - Document new settlement flow in README
  - Add API endpoint documentation
  - Document environment variables
  - Add troubleshooting guide
  - _Requirements: All_

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Test end-to-end settlement flow
  - Create test duel with two accounts
  - Complete duel with both accounts
  - Verify automatic settlement occurs
  - Verify no wallet approval popups
  - Verify winner receives correct USDC amount
  - Verify transaction hash is valid
  - Check logs for completeness
  - _Requirements: All_

- [ ]* 9.1 Write integration test for complete settlement flow
  - Create duel with test accounts
  - Submit results for both players
  - Trigger settlement via API
  - Verify winner receives correct payout
  - Verify no player wallet approvals
  - Verify transaction on blockchain
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 9.2 Write integration test for race condition handling
  - Create duel with test accounts
  - Trigger multiple simultaneous settlement requests
  - Verify only one on-chain transaction
  - Verify all requests return same result
  - Verify no errors occur
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 10. Final Checkpoint - Verify production readiness
  - Ensure all tests pass, ask the user if questions arise.
