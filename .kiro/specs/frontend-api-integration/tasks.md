# Implementation Plan: Frontend API Integration Completion

## Overview

This implementation plan focuses on completing the frontend-to-backend API integrations for the TypeNad game. The tasks are organized to build incrementally, starting with verification of existing integrations, then adding missing UI components, improving error handling, and finally adding comprehensive testing.

---

## Phase 1: Verification and Core Fixes

- [ ] 1. Verify and document current integration status
  - Review all API endpoints and their current usage
  - Document which components are using which APIs
  - Identify any direct Supabase queries that should use APIs instead
  - Create a status matrix of component-to-API mappings
  - _Requirements: All requirements (baseline understanding)_

- [ ] 2. Verify shop integration is working correctly
  - [ ] 2.1 Test shop items fetch from `/api/shop/items`
    - Verify items load from database
    - Verify fallback to hardcoded items works
    - Test with empty database
    - Test with network error
    - _Requirements: 1.1, 1.5_
  
  - [ ] 2.2 Test shop purchase flow
    - Test successful purchase with sufficient gold
    - Test purchase rejection with insufficient gold
    - Verify gold balance updates correctly
    - Verify inventory updates correctly
    - Test error handling for API failures
    - _Requirements: 1.2, 1.3, 1.4_
  
  - [ ] 2.3 Remove direct Supabase queries from ShopScreen
    - Replace inventory sync with `/api/user/inventory` endpoint
    - Ensure all data flows through APIs
    - _Requirements: 10.1, 10.2_

- [ ] 3. Verify game metrics tracking
  - [ ] 3.1 Verify duration tracking in GameCanvas
    - Check `gameStartTimeRef` initialization
    - Verify duration calculation on game end
    - Test with various game lengths
    - _Requirements: 7.1, 7.4_
  
  - [ ] 3.2 Verify kills and words typed tracking
    - Check `killsRef` increments on enemy kill
    - Check `wordsTypedRef` increments correctly
    - Verify they match (one word per enemy)
    - _Requirements: 7.2, 7.5_
  
  - [ ] 3.3 Verify wave tracking
    - Check `waveRef` updates on wave complete
    - Verify final wave number is passed to GameOver
    - _Requirements: 7.3, 7.5_
  
  - [ ] 3.4 Verify all metrics are passed to GameOver components
    - Check GameOver.tsx receives all metrics
    - Check StakedGameOver.tsx receives all metrics
    - Check DuelGameOver.tsx receives all metrics
    - Verify metrics are sent to `/api/score/save`
    - _Requirements: 7.5_

---

## Phase 2: Achievement Notifications

- [ ] 4. Create achievement notification system
  - [ ] 4.1 Create AchievementNotification component
    - Design toast-style notification UI
    - Implement auto-dismiss after 5 seconds
    - Add manual dismiss on click
    - Add entrance/exit animations
    - Display achievement icon, name, and gold reward
    - _Requirements: 5.1, 5.2, 5.4, 5.5_
  
  - [ ] 4.2 Create notification manager hook
    - Implement `useAchievementNotifications` hook
    - Manage notification queue
    - Handle stacking multiple notifications
    - Implement sequential display logic
    - _Requirements: 5.3_
  
  - [ ] 4.3 Integrate achievement checking in GameOver components
    - Add achievement check after score save in GameOver.tsx
    - Add achievement check in StakedGameOver.tsx
    - Add achievement check in DuelGameOver.tsx
    - Trigger notifications for new achievements
    - _Requirements: 5.1_
  
  - [ ] 4.4 Add achievement notification display to GameStateManager
    - Add notification state management
    - Render AchievementNotification components
    - Position notifications in top-right corner
    - _Requirements: 5.1, 5.2_

---

## Phase 3: Navigation and UI Improvements

- [ ] 5. Add navigation to achievements and profile screens
  - [ ] 5.1 Update StartScreen with navigation buttons
    - Add "Achievements" button
    - Add "Profile" button
    - Style buttons consistently
    - _Requirements: 6.1_
  
  - [ ] 5.2 Update GameStateManager with navigation handlers
    - Add `handleAchievements` function
    - Add `handleProfile` function
    - Add 'achievements' and 'profile' to gameState type
    - Wire up navigation handlers
    - _Requirements: 6.1, 6.4_
  
  - [ ] 5.3 Verify Escape key navigation works
    - Test Escape key on AchievementsScreen
    - Test Escape key on ProfileScreen
    - Ensure it returns to previous screen
    - _Requirements: 6.3, 6.5_
  
  - [ ] 5.4 Verify wallet state preservation during navigation
    - Test navigation while connected
    - Test navigation while disconnected
    - Verify wallet state doesn't change
    - _Requirements: 6.4_

---

## Phase 4: Error Handling and Loading States

- [ ] 6. Implement comprehensive error handling
  - [ ] 6.1 Create reusable error handling utility
    - Implement `handleApiCall` function with retry logic
    - Add exponential backoff
    - Add fallback support
    - Add error categorization
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 6.2 Create LoadingSpinner component
    - Design loading indicator UI
    - Support multiple sizes (small, medium, large)
    - Add optional loading message
    - _Requirements: 8.1_
  
  - [ ] 6.3 Add error handling to ShopScreen
    - Wrap API calls in error handler
    - Display user-friendly error messages
    - Add retry button for failed requests
    - _Requirements: 8.2, 8.3, 8.5_
  
  - [ ] 6.4 Add error handling to LeaderboardScreen
    - Wrap API calls in error handler
    - Display error messages
    - Maintain fallback to local storage
    - _Requirements: 8.2_
  
  - [ ] 6.5 Add error handling to AchievementsScreen
    - Wrap API calls in error handler
    - Display error messages
    - Add retry option
    - _Requirements: 8.2, 8.3_
  
  - [ ] 6.6 Add error handling to ProfileScreen
    - Wrap API calls in error handler
    - Display error messages
    - Add retry option
    - _Requirements: 8.2, 8.3_
  
  - [ ] 6.7 Verify offline mode banner displays
    - Test with network disconnected
    - Verify banner appears at top
    - Verify banner message is clear
    - _Requirements: 8.4_

---

## Phase 5: Data Consistency and Synchronization

- [ ] 7. Ensure data consistency between local storage and database
  - [ ] 7.1 Implement data synchronization utility
    - Create `syncToDatabase` function
    - Prioritize database as source of truth
    - Update local storage from database
    - Handle sync conflicts
    - _Requirements: 10.5_
  
  - [ ] 7.2 Add synchronization to shop purchases
    - Sync gold balance after purchase
    - Sync inventory after purchase
    - Verify both local and database are updated
    - _Requirements: 10.1, 10.2_
  
  - [ ] 7.3 Add synchronization to achievement unlocks
    - Sync achievement status immediately
    - Verify database records unlock
    - Update local cache
    - _Requirements: 10.3_
  
  - [ ] 7.4 Add synchronization to inventory changes
    - Sync inventory on equip/unequip
    - Sync inventory on consumption
    - Verify consistency
    - _Requirements: 10.4_

---

## Phase 6: Database Seeding and Verification

- [ ] 8. Verify shop items are seeded in database
  - [ ] 8.1 Check if seed migration has been run
    - Query shop_items table
    - Verify items exist
    - _Requirements: 9.1_
  
  - [ ] 8.2 Run seed migration if needed
    - Execute `002_seed_shop_items.sql`
    - Verify all items are created
    - Check prices and availability
    - _Requirements: 9.2, 9.3_
  
  - [ ] 8.3 Verify shop items have correct metadata
    - Check all required fields are populated
    - Verify image URLs are correct
    - Verify categories are set
    - _Requirements: 9.4_
  
  - [ ] 8.4 Test shop items API returns seeded data
    - Call `/api/shop/items`
    - Verify all seeded items are returned
    - Verify data structure is correct
    - _Requirements: 9.5_

---

## Phase 7: Property-Based Testing

- [ ] 9. Set up property-based testing infrastructure
  - Install fast-check library
  - Create test utilities for API mocking
  - Set up test configuration
  - _Requirements: All (testing foundation)_

- [ ]* 9.1 Write property test for shop purchase consistency
  - **Property 1: Shop Purchase Consistency**
  - **Validates: Requirements 1.2, 1.3, 10.1**
  - Generate random shop purchases
  - Verify gold decreases by exact price
  - Verify inventory increases by quantity
  - Test with 100+ random scenarios

- [ ]* 9.2 Write property test for leaderboard sorting
  - **Property 2: Leaderboard Category Consistency**
  - **Validates: Requirements 2.2, 2.3**
  - Generate random leaderboard data
  - Verify sorting by each category
  - Test with 100+ random datasets

- [ ]* 9.3 Write property test for achievement unlock idempotence
  - **Property 3: Achievement Unlock Idempotence**
  - **Validates: Requirements 3.2, 10.3**
  - Generate random achievement unlock scenarios
  - Verify achievement only unlocks once
  - Verify gold only awarded once
  - Test with 100+ random scenarios

- [ ]* 9.4 Write property test for profile data completeness
  - **Property 4: Profile Data Completeness**
  - **Validates: Requirements 4.2, 4.3, 4.4**
  - Generate random user profiles
  - Verify all required fields are present
  - Verify no null values for mandatory fields
  - Test with 100+ random profiles

- [ ]* 9.5 Write property test for achievement notification display
  - **Property 5: Achievement Notification Display**
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
  - Generate random achievement unlock sets
  - Verify each triggers exactly one notification
  - Verify notifications display for 5+ seconds
  - Test with 100+ random scenarios

- [ ]* 9.6 Write property test for navigation state preservation
  - **Property 6: Navigation State Preservation**
  - **Validates: Requirements 6.4**
  - Generate random navigation sequences
  - Verify wallet state unchanged
  - Test with 100+ random sequences

- [ ]* 9.7 Write property test for game metrics accuracy
  - **Property 7: Game Metrics Accuracy**
  - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
  - Generate random game sessions
  - Verify duration equals time difference
  - Verify kills equals words typed
  - Test with 100+ random sessions

- [ ]* 9.8 Write property test for error message clarity
  - **Property 8: Error Message Clarity**
  - **Validates: Requirements 8.2, 8.5**
  - Generate random API errors
  - Verify no technical details exposed
  - Verify messages are user-friendly
  - Test with 100+ random errors

- [ ]* 9.9 Write property test for shop items availability
  - **Property 9: Shop Items Availability**
  - **Validates: Requirements 9.2, 9.3, 9.5**
  - Generate random shop item queries
  - Verify only available items returned
  - Verify all prices > 0
  - Test with 100+ random queries

- [ ]* 9.10 Write property test for data synchronization priority
  - **Property 10: Data Synchronization Priority**
  - **Validates: Requirements 10.5**
  - Generate random data conflicts
  - Verify database value always wins
  - Verify local storage updated to match
  - Test with 100+ random conflicts

---

## Phase 8: Integration Testing and Manual Verification

- [ ]* 10. Write integration tests for complete flows
  - [ ]* 10.1 Test complete shop purchase flow
    - Fetch items → purchase → verify inventory
    - Test with multiple items
    - Test with insufficient gold
  
  - [ ]* 10.2 Test complete achievement unlock flow
    - Play game → check achievements → display notification
    - Test with multiple achievements
    - Test with already unlocked achievements
  
  - [ ]* 10.3 Test complete leaderboard flow
    - Fetch → filter by category → filter by time range
    - Test all category combinations
    - Test all time range combinations
  
  - [ ]* 10.4 Test complete profile flow
    - Fetch → display stats → display history
    - Test with various data states
    - Test with empty history

- [ ] 11. Manual testing and verification
  - [ ] 11.1 Test shop functionality end-to-end
    - Load shop items from database
    - Purchase items with sufficient gold
    - Verify gold deduction
    - Verify inventory update
    - Test error scenarios
  
  - [ ] 11.2 Test leaderboard functionality
    - View all categories
    - Switch time ranges
    - Verify sorting is correct
    - Test with no data
  
  - [ ] 11.3 Test achievement functionality
    - View locked achievements
    - Unlock achievements by playing
    - Verify notifications appear
    - Verify gold rewards
  
  - [ ] 11.4 Test profile functionality
    - View profile stats
    - View match history
    - View duel statistics
    - Test with various data states
  
  - [ ] 11.5 Test navigation
    - Navigate to all screens
    - Use Escape key to go back
    - Verify wallet state preserved
  
  - [ ] 11.6 Test error handling
    - Disconnect network
    - Verify offline banner
    - Verify error messages
    - Test retry functionality
  
  - [ ] 11.7 Test data synchronization
    - Make changes in multiple tabs
    - Verify data syncs correctly
    - Verify database is source of truth

---

## Phase 9: Polish and Optimization

- [ ]* 12. Add animations and polish
  - [ ]* 12.1 Add smooth transitions between screens
    - Fade in/out animations
    - Slide animations where appropriate
  
  - [ ]* 12.2 Add loading skeleton screens
    - Replace spinners with skeleton loaders
    - Improve perceived performance
  
  - [ ]* 12.3 Add success animations
    - Celebrate achievement unlocks
    - Celebrate successful purchases
    - Add confetti or particle effects

- [ ]* 13. Optimize performance
  - [ ]* 13.1 Implement request caching
    - Cache shop items
    - Cache leaderboard data
    - Cache profile data
  
  - [ ]* 13.2 Implement request deduplication
    - Prevent duplicate API calls
    - Use React Query or SWR
  
  - [ ]* 13.3 Optimize re-renders
    - Use React.memo where appropriate
    - Optimize useEffect dependencies

---

## Checkpoint

- [ ] 14. Final verification - Ensure all tests pass, ask the user if questions arise
  - Verify all unit tests pass
  - Verify all property tests pass
  - Verify all integration tests pass
  - Verify manual testing checklist complete
  - Verify no console errors
  - Verify no TypeScript errors
  - Get user approval before considering complete

---

## Notes

- **Priority**: Focus on Phase 1-7 first (core functionality and testing)
- **Optional**: Phase 8-9 are polish and optimization (marked with *)
- **Testing**: Property-based tests should run 100+ iterations each
- **Error Handling**: All API calls should have proper error handling
- **Loading States**: All async operations should show loading indicators
- **Data Consistency**: Database is always the source of truth

## Success Criteria

The implementation is complete when:
1. ✅ All shop operations use the correct APIs
2. ✅ Achievement notifications display on unlock
3. ✅ Navigation to achievements and profile works
4. ✅ All error scenarios are handled gracefully
5. ✅ All loading states are displayed
6. ✅ Game metrics are accurately tracked
7. ✅ Data syncs correctly between local storage and database
8. ✅ All property-based tests pass
9. ✅ Manual testing checklist is complete
10. ✅ User approves the implementation
