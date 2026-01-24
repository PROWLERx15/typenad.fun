# Implementation Plan

## Phase 1: Database Schema & Infrastructure ✅

- [x] 1. Fix database schema mismatches
  - Add missing columns to users table (best_score, best_wpm)
  - Add missing columns to game_scores table (misses, typos, gold_earned, duration_seconds, words_typed, is_staked, stake_amount, payout_amount)
  - Add missing columns to user_inventory table (item_type, equipped)
  - Create all necessary indexes for performance
  - Test schema changes on development database
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [x] 2. Create database migration script
  - Write SQL migration file with all schema changes
  - Include rollback script for safety
  - Add data validation queries
  - Document migration steps
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 3. Seed shop items data
  - Create shop items seed data script
  - Include powerups (double-points, triple-points, double-gold, triple-gold, slow-enemies, extra-life)
  - Include cosmetic hero items
  - Add metadata for each item
  - Execute seed script
  - _Requirements: 4.1, 4.2, 4.3_

## Phase 2: Frontend Metric Tracking ✅

- [x] 4. Enhance GameCanvas metric tracking
- [x] 4.1 Add game duration tracking
  - Initialize gameStartTimeRef on game start
  - Create calculateDuration function
  - Pass duration to GameOver components
  - _Requirements: 2.1, 2.6_

- [x] 4.2 Add accurate words typed counter
  - Create wordsTypedCountRef
  - Increment on each enemy kill
  - Pass wordsTyped to GameOver components
  - _Requirements: 2.2_

- [x] 4.3 Track gold earned accumulation
  - Create goldEarnedRef
  - Accumulate gold on enemy kills
  - Pass goldEarned to GameOver components
  - _Requirements: 2.5_

- [x] 4.4 Ensure typo and miss tracking for all modes
  - Verify totalTyposRef increments correctly
  - Verify totalMissesRef increments correctly
  - Pass counters to GameOver components
  - _Requirements: 2.3, 2.4_

- [x] 4.5 Pass all metrics to GameOver components
  - Update GameOver props interface
  - Update StakedGameOver props interface
  - Update DuelGameOver props interface
  - Pass: score, wpm, kills, waveReached, goldEarned, missCount, typoCount, duration, wordsTyped
  - _Requirements: 2.7_

## Phase 3: API Endpoints - Core Score Saving ✅

- [x] 5. Enhance /api/score/save endpoint
- [x] 5.1 Update request validation
  - Validate all new fields (misses, typos, duration, wordsTyped, goldEarned)
  - Add validation for staked game fields (isStaked, stakeAmount, payoutAmount)
  - Return detailed validation errors
  - _Requirements: 9.7_

- [x] 5.2 Implement complete score record insertion
  - Insert all fields to game_scores table
  - Handle staked game fields (nullable)
  - Return scoreId on success
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 5.3 Implement user stats update logic
  - Update total_games, total_kills, total_words_typed
  - Update best_score (max of current and new)
  - Update best_wpm (max of current and new)
  - Update gold balance (add goldEarned)
  - Update last_seen_at timestamp
  - _Requirements: 1.4, 8.2_

- [x] 5.4 Add error handling and logging
  - Log all score saves with context
  - Handle database errors gracefully
  - Return appropriate error responses
  - _Requirements: 9.6_

- [ ] 5.5 Write property test for complete score persistence
  - **Property 1: Complete game score persistence**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.5**

- [ ] 5.6 Write property test for user stats update
  - **Property 2: User statistics update consistency**
  - **Validates: Requirements 1.4**

## Phase 4: Frontend Score Saving Integration ✅

- [x] 6. Implement score saving in GameOver.tsx
- [x] 6.1 Add score save logic on component mount
  - Create saveScore async function
  - Call /api/score/save with all metrics
  - Handle success and error cases
  - Log save attempts
  - _Requirements: 1.1_

- [x] 6.2 Add optional achievement check trigger
  - Call /api/achievements/check after successful save
  - Handle achievement check errors gracefully
  - _Requirements: 5.2_

- [ ] 6.3 Write unit tests for GameOver score saving
  - Test score save API call
  - Test error handling
  - Mock API responses

- [x] 7. Implement score saving in StakedGameOver.tsx
- [x] 7.1 Add score save after settlement
  - Check settlementStatus === 'settled'
  - Prevent duplicate saves with scoreSaved state
  - Include isStaked, stakeAmount, payoutAmount
  - Call /api/score/save with all metrics
  - _Requirements: 1.2_

- [x] 7.2 Add error handling for staked game saves
  - Log errors with context
  - Don't block UI on save failure
  - _Requirements: 9.6_

- [ ] 7.3 Write unit tests for StakedGameOver score saving
  - Test settlement status check
  - Test duplicate save prevention
  - Mock settlement and API calls

- [x] 8. Implement score saving in DuelGameOver.tsx
- [x] 8.1 Add score save after settlement
  - Check settlementStatus === 'settled'
  - Prevent duplicate saves with scoreSaved state
  - Include gameMode='duel'
  - Call /api/score/save with all metrics
  - _Requirements: 1.3_

- [x] 8.2 Add error handling for duel game saves
  - Log errors with context
  - Don't block UI on save failure
  - _Requirements: 9.6_

- [ ] 8.3 Write unit tests for DuelGameOver score saving
  - Test settlement status check
  - Test duplicate save prevention
  - Mock settlement and API calls

## Phase 5: Duel Match History Recording ✅

- [x] 9. Create /api/duel/record endpoint
- [x] 9.1 Implement duel match recording API
  - Validate all input parameters (addresses, duelId, scores, etc.)
  - Insert record into duel_matches table
  - Use upsert with conflict resolution on duel_id
  - Return matchId on success
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 9.2 Add comprehensive error handling
  - Handle unique constraint violations
  - Log all recording attempts
  - Return appropriate error responses
  - _Requirements: 9.6_

- [ ] 9.3 Write property test for duel match completeness
  - **Property 4: Duel match history completeness**
  - **Validates: Requirements 3.1, 3.2, 3.3**

- [x] 10. Integrate duel recording into settlement
- [x] 10.1 Add recording call to /api/execute-settlement
  - Call /api/duel/record after successful settlement
  - Include all player data and settlement info
  - Execute before duel_results cleanup
  - Handle recording errors without failing settlement
  - _Requirements: 3.5_

- [x] 10.2 Add logging for duel recording
  - Log recording attempts
  - Log recording success/failure
  - Include duelId in all logs
  - _Requirements: 3.5_

- [ ] 10.3 Write property test for history persistence ordering
  - **Property 5: Duel history persistence ordering**
  - **Validates: Requirements 3.5**

- [ ] 10.4 Write integration test for complete duel flow
  - Create duel with two players
  - Submit scores
  - Trigger settlement
  - Verify match history recorded
  - Verify duel_results cleaned up

## Phase 6: Achievement System ✅

- [x] 11. Define achievement conditions
- [x] 11.1 Create achievements constants file
  - Define achievement IDs, names, descriptions
  - Define condition functions for each achievement
  - Define gold rewards
  - Include kill-based, WPM-based, games-played, and duel achievements
  - _Requirements: 5.1_

- [x] 11.2 Document achievement system
  - List all achievements
  - Explain condition logic
  - Document reward amounts
  - _Requirements: 5.1_

- [x] 12. Create /api/achievements/check endpoint
- [x] 12.1 Implement achievement checking logic
  - Fetch user's current statistics
  - Fetch user's already unlocked achievements
  - Check all achievement conditions
  - Identify newly met conditions
  - _Requirements: 5.2_

- [x] 12.2 Implement achievement awarding
  - Insert new achievements into user_achievements table
  - Credit gold rewards to user balance
  - Use transaction for atomicity
  - Return list of newly unlocked achievements
  - _Requirements: 5.3, 5.4_

- [x] 12.3 Implement duplicate prevention
  - Check existing achievements before awarding
  - Use unique constraint on (user_id, achievement_id)
  - Handle constraint violations gracefully
  - _Requirements: 5.5_

- [x] 12.4 Add error handling and logging
  - Log all achievement checks
  - Log newly unlocked achievements
  - Handle database errors
  - _Requirements: 9.6_

- [ ] 12.5 Write property test for achievement uniqueness
  - **Property 9: Achievement unlock uniqueness**
  - **Validates: Requirements 5.5**

- [ ] 12.6 Write property test for achievement gold reward
  - **Property 10: Achievement gold reward**
  - **Validates: Requirements 5.4**

## Phase 7: Shop System APIs ✅

- [x] 13. Create /api/shop/items endpoint
- [x] 13.1 Implement shop items retrieval
  - Query shop_items table
  - Filter by available=true
  - Support category filtering
  - Return items with all fields
  - _Requirements: 4.1_

- [x] 13.2 Add caching for shop items
  - Cache results for 5 minutes
  - Reduce database load
  - _Requirements: Performance_

- [ ] 13.3 Write unit tests for shop items endpoint
  - Test retrieval of all items
  - Test category filtering
  - Test available filtering

- [x] 14. Enhance /api/shop/purchase endpoint
- [x] 14.1 Verify purchase endpoint implementation
  - Check gold balance validation
  - Check item existence validation
  - Verify gold deduction logic
  - Verify inventory update logic
  - _Requirements: 4.4, 4.5_

- [x] 14.2 Add transaction logging
  - Log all purchase attempts
  - Log success/failure
  - Include user, item, and amount
  - _Requirements: Monitoring_

- [ ] 14.3 Write property test for purchase gold deduction
  - **Property 7: Purchase gold deduction**
  - **Validates: Requirements 4.4**

- [ ] 14.4 Write property test for purchase inventory update
  - **Property 8: Purchase inventory update**
  - **Validates: Requirements 4.5**

- [x] 15. Create /api/shop/equip endpoint
- [x] 15.1 Implement item equip functionality
  - Validate item exists in user inventory
  - Update equipped status to true
  - Unequip other items of same type (if applicable)
  - Return updated inventory
  - _Requirements: 4.6_

- [x] 15.2 Add error handling
  - Handle item not owned
  - Handle invalid item types
  - Return appropriate errors
  - _Requirements: 9.6_

- [ ] 15.3 Write unit tests for equip endpoint
  - Test equipping owned items
  - Test error cases
  - Test unequipping logic

## Phase 8: User Stats & Profile APIs ✅

- [x] 16. Create /api/user/stats endpoint
- [x] 16.1 Implement user stats retrieval
  - Query users table for aggregate stats
  - Calculate achievement count from user_achievements
  - Calculate duel wins/losses from duel_matches
  - Calculate leaderboard rank
  - Return complete stats object
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 16.2 Add caching for stats
  - Cache per user for 1 minute
  - Invalidate on score save
  - _Requirements: Performance_

- [ ] 16.3 Write property test for profile data completeness
  - **Property 16: User profile data completeness**
  - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

- [x] 17. Create /api/user/profile endpoint
- [x] 17.1 Implement complete profile retrieval
  - Get user data
  - Get user stats (call /api/user/stats logic)
  - Get recent games (last 10)
  - Get unlocked achievements
  - Return combined profile object
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 17.2 Add error handling
  - Handle user not found
  - Handle partial data failures
  - Return appropriate errors
  - _Requirements: 9.6_

- [ ] 17.3 Write unit tests for profile endpoint
  - Test complete profile retrieval
  - Test user not found case
  - Mock database queries

- [x] 18. Create /api/score/history endpoint
- [x] 18.1 Implement game history retrieval
  - Query game_scores for user
  - Support game mode filtering
  - Support sorting (score, wpm, created_at)
  - Support pagination (limit, offset)
  - Return scores with pagination info
  - _Requirements: 9.5_

- [x] 18.2 Add query optimization
  - Use indexes for filtering
  - Limit result set size
  - Add query performance logging
  - _Requirements: Performance_

- [ ] 18.3 Write unit tests for history endpoint
  - Test filtering by game mode
  - Test sorting options
  - Test pagination

## Phase 9: Enhanced Leaderboard ✅

- [x] 19. Enhance /api/leaderboard endpoint
- [x] 19.1 Add category support
  - Support best_score, best_wpm, total_kills, duel_wins categories
  - Query appropriate table/column based on category
  - Rank in descending order
  - _Requirements: 6.1, 6.3_

- [x] 19.2 Implement filtering logic
  - Exclude users with zero/null values for ranking metric
  - Support time range filtering (all, today, week, month)
  - _Requirements: 6.2_

- [x] 19.3 Ensure data completeness
  - Include wallet_address, username, ranking metric
  - Include profile_picture if available
  - Calculate rank based on position
  - _Requirements: 6.4_

- [x] 19.4 Implement pagination
  - Support limit and offset parameters
  - Return hasMore flag
  - Return total count
  - _Requirements: 6.5_

- [x] 19.5 Add caching
  - Cache leaderboard results for 5 minutes
  - Cache per category and time range
  - _Requirements: Performance_

- [ ] 19.6 Write property test for leaderboard ranking
  - **Property 11: Leaderboard ranking correctness**
  - **Validates: Requirements 6.1, 6.3**

- [ ] 19.7 Write property test for leaderboard filtering
  - **Property 12: Leaderboard filtering**
  - **Validates: Requirements 6.2**

- [ ] 19.8 Write property test for leaderboard data completeness
  - **Property 13: Leaderboard data completeness**
  - **Validates: Requirements 6.4**

## Phase 10: Testing & Validation

- [ ] 20. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 21. Create property-based test suite
- [ ] 21.1 Set up fast-check testing framework
  - Install fast-check package
  - Configure test runner
  - Create test utilities
  - _Requirements: Testing Strategy_

- [ ] 21.2 Implement remaining property tests
  - Property 3: Metric tracking completeness
  - Property 6: Shop item data completeness
  - Property 14: Gold balance accumulation
  - Property 15: API error handling
  - _Requirements: Testing Strategy_

- [ ] 21.3 Run all property tests
  - Execute with 100+ iterations each
  - Verify all properties pass
  - Fix any failures

- [ ] 22. Create integration test suite
- [ ] 22.1 Write end-to-end game flow test
  - Simulate complete game session
  - Verify score save
  - Verify stats update
  - Verify gold credit
  - Verify achievement check
  - _Requirements: Testing Strategy_

- [ ] 22.2 Write shop purchase flow test
  - Create user with gold
  - Purchase item
  - Verify gold deduction
  - Verify inventory update
  - Equip item
  - Verify equipped status
  - _Requirements: Testing Strategy_

- [ ] 22.3 Write leaderboard integration test
  - Create multiple users with scores
  - Query leaderboard
  - Verify ranking order
  - Verify filtering
  - _Requirements: Testing Strategy_

- [ ] 23. Manual testing
- [ ] 23.1 Test story mode game flow
  - Play complete game
  - Verify score saves
  - Check database records
  - Verify stats updated
  - _Requirements: Manual Testing_

- [ ] 23.2 Test staked game flow
  - Play staked game
  - Complete settlement
  - Verify score saves with stake info
  - Check database records
  - _Requirements: Manual Testing_

- [ ] 23.3 Test duel game flow
  - Create and play duel
  - Complete settlement
  - Verify match history recorded
  - Verify both players' scores saved
  - _Requirements: Manual Testing_

- [ ] 23.4 Test shop functionality
  - Browse shop items
  - Purchase items
  - Equip items
  - Verify inventory updates
  - _Requirements: Manual Testing_

- [ ] 23.5 Test achievement system
  - Meet achievement conditions
  - Verify achievements unlock
  - Verify gold rewards
  - Check no duplicates
  - _Requirements: Manual Testing_

- [ ] 23.6 Test leaderboard
  - View different categories
  - Test time range filters
  - Verify rankings correct
  - Test pagination
  - _Requirements: Manual Testing_

## Phase 11: Deployment & Monitoring

- [ ] 24. Prepare deployment
- [ ] 24.1 Create deployment checklist
  - List all migration steps
  - List all verification steps
  - Document rollback procedure
  - _Requirements: Deployment_

- [ ] 24.2 Backup production database
  - Create full database backup
  - Verify backup integrity
  - Store backup securely
  - _Requirements: Deployment_

- [ ] 24.3 Test migration on staging
  - Run migration on staging database
  - Verify schema changes
  - Test all endpoints
  - _Requirements: Deployment_

- [ ] 25. Execute deployment
- [ ] 25.1 Run database migration
  - Execute migration script
  - Verify schema changes
  - Run seed scripts
  - _Requirements: 7.1, 7.2, 7.3, 4.1_

- [ ] 25.2 Deploy backend changes
  - Deploy API endpoint changes
  - Verify endpoints responding
  - Check error logs
  - _Requirements: Deployment_

- [ ] 25.3 Deploy frontend changes
  - Deploy frontend updates
  - Verify score saving works
  - Check browser console for errors
  - _Requirements: Deployment_

- [ ] 26. Post-deployment verification
- [ ] 26.1 Verify data is being saved
  - Play test games
  - Check database for new records
  - Verify all fields populated
  - _Requirements: Verification_

- [ ] 26.2 Monitor error logs
  - Check API error logs
  - Check frontend console errors
  - Address any issues immediately
  - _Requirements: Monitoring_

- [ ] 26.3 Verify leaderboard updates
  - Check leaderboard shows new scores
  - Verify rankings correct
  - Test different categories
  - _Requirements: Verification_

- [ ] 27. Set up monitoring
- [ ] 27.1 Configure monitoring alerts
  - Set up error rate alerts
  - Set up API response time alerts
  - Set up database performance alerts
  - _Requirements: Monitoring_

- [ ] 27.2 Create monitoring dashboard
  - Track score save success rate
  - Track API response times
  - Track achievement unlock rate
  - Track shop purchase rate
  - _Requirements: Monitoring_

## Phase 12: Documentation & Cleanup

- [ ] 28. Update documentation
- [ ] 28.1 Document new API endpoints
  - Write API documentation
  - Include request/response examples
  - Document error codes
  - _Requirements: Documentation_

- [ ] 28.2 Update README
  - Document new features
  - Update setup instructions
  - Add troubleshooting section
  - _Requirements: Documentation_

- [ ] 28.3 Create user guide
  - Explain achievement system
  - Explain shop system
  - Explain leaderboard categories
  - _Requirements: Documentation_

- [ ] 29. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
