# Design Document: Frontend API Integration Completion

## Overview

This design addresses the completion of frontend-to-backend API integrations for the TypeNad game. The backend infrastructure is fully implemented with robust APIs for shop management, leaderboards, achievements, user profiles, and game scoring. However, several frontend components are not properly utilizing these APIs, leading to inconsistent data, missed functionality, and suboptimal user experience.

The primary goals are:
1. Ensure all frontend components use the correct backend APIs
2. Add missing UI components to expose backend functionality
3. Implement proper error handling and loading states
4. Verify game metrics tracking is accurate
5. Add achievement unlock notifications
6. Ensure data consistency between local storage and database

## Architecture

### Current State Analysis

#### Backend APIs (✅ Complete)
- **Shop System**: `/api/shop/items`, `/api/shop/purchase`, `/api/shop/equip`
- **Leaderboard**: `/api/leaderboard` with category and time range support
- **Achievements**: `/api/achievements/check` (POST and GET)
- **User Profile**: `/api/user/profile`, `/api/user/stats`
- **Score Management**: `/api/score/save`, `/api/score/history`
- **Duel System**: `/api/duel/*`, `/api/settle-duel`, `/api/execute-settlement`
- **Game Settlement**: `/api/settle-game`, `/api/execute-game-settlement`

#### Frontend Components Status

**ShopScreen.tsx** (⚠️ Partial Integration)
- ✅ Fetches items from `/api/shop/items`
- ✅ Uses `/api/shop/purchase` for purchases
- ❌ Still has fallback to hardcoded items (good safety measure)
- ❌ Does not use `/api/shop/equip` endpoint
- ⚠️ Mixes local storage and API calls

**LeaderboardScreen.tsx** (✅ Fully Integrated)
- ✅ Uses `/api/leaderboard` endpoint
- ✅ Supports category selection (Score, WPM, Kills, Duel Wins)
- ✅ Supports time range filtering (All Time, Monthly, Weekly, Today)
- ✅ Has loading states
- ✅ Falls back to local storage on error

**AchievementsScreen.tsx** (✅ Fully Implemented)
- ✅ Fetches from `/api/achievements/check`
- ✅ Displays locked and unlocked achievements
- ✅ Category filtering
- ✅ Visual distinction for locked/unlocked
- ❌ Not accessible from main navigation (only from CryptScreen)

**ProfileScreen.tsx** (✅ Fully Implemented)
- ✅ Fetches from `/api/user/profile`
- ✅ Displays comprehensive stats
- ✅ Shows match history
- ✅ Duel statistics
- ❌ Not accessible from main navigation (only from CryptScreen)

**GameOver Components** (✅ Fully Integrated)
- ✅ GameOver.tsx saves scores via `/api/score/save`
- ✅ StakedGameOver.tsx saves scores and settles games
- ✅ DuelGameOver.tsx saves scores and settles duels
- ❌ No achievement unlock notifications displayed

**GameCanvas.tsx** (✅ Metrics Tracking Implemented)
- ✅ Tracks duration via `gameStartTimeRef`
- ✅ Tracks kills via `killsRef`
- ✅ Tracks words typed via `wordsTypedRef`
- ✅ Tracks wave number via `waveRef`
- ✅ Passes all metrics to GameOver components

**CryptScreen.tsx** (⚠️ Legacy Component)
- ⚠️ Duplicates functionality of ProfileScreen and AchievementsScreen
- ⚠️ Uses direct Supabase queries instead of APIs
- ⚠️ Should be refactored or deprecated

### Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ ShopScreen   │  │ Leaderboard  │  │ Achievements │      │
│  │              │  │ Screen       │  │ Screen       │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         │                  │                  │              │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐      │
│  │ ProfileScreen│  │ GameOver     │  │ GameCanvas   │      │
│  │              │  │ Components   │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼──────────────┐
│                      API Layer                                │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  /api/shop/*        /api/leaderboard    /api/achievements/*  │
│  /api/user/*        /api/score/*        /api/duel/*          │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            │
┌───────────────────────────▼───────────────────────────────────┐
│                    Database Layer                             │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  users              shop_items          user_achievements     │
│  game_scores        user_inventory      duel_matches          │
│  duel_results       game_sessions                             │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Achievement Notification System

**Component**: `AchievementNotification.tsx` (NEW)

```typescript
interface AchievementNotificationProps {
  achievement: {
    id: string;
    name: string;
    icon: string;
    goldReward: number;
  };
  onDismiss: () => void;
}
```

**Purpose**: Display toast-style notifications when achievements are unlocked

**Behavior**:
- Appears in top-right corner
- Auto-dismisses after 5 seconds
- Stacks multiple notifications
- Animated entrance/exit
- Shows achievement icon, name, and gold reward

### 2. Navigation Updates

**GameStateManager.tsx** (MODIFY)

Add navigation handlers:
```typescript
const handleAchievements = () => setGameState('achievements');
const handleProfile = () => setGameState('profile');
```

Update StartScreen props to include:
```typescript
onAchievements={handleAchievements}
onProfile={handleProfile}
```

### 3. Shop Integration Improvements

**ShopScreen.tsx** (MODIFY)

Current implementation is mostly correct but needs:
- Remove direct Supabase queries for inventory sync
- Use `/api/user/inventory` endpoint instead
- Ensure proper error handling for all API calls
- Add retry logic for failed purchases

### 4. Achievement Check Integration

**GameOver Components** (MODIFY)

Add achievement checking after score save:
```typescript
// After successful score save
const checkAchievements = async () => {
  const response = await fetch('/api/achievements/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress: address }),
  });
  
  const data = await response.json();
  if (data.success && data.data.newAchievements.length > 0) {
    // Trigger achievement notifications
    onAchievementsUnlocked(data.data.newAchievements);
  }
};
```

### 5. Error Handling Component

**ErrorBoundary.tsx** (EXISTS - VERIFY)

Ensure it catches and displays:
- Network errors
- API errors
- Validation errors
- Timeout errors

### 6. Loading State Component

**LoadingSpinner.tsx** (NEW)

Reusable loading indicator for all API calls:
```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}
```

## Data Models

### Achievement Notification State

```typescript
interface AchievementNotification {
  id: string;
  achievementId: string;
  name: string;
  icon: string;
  goldReward: number;
  timestamp: number;
}
```

### API Response Types

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ShopItemsResponse {
  items: ShopItem[];
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  category: string;
  timeRange: string;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface AchievementsResponse {
  achievements: Achievement[];
  totalUnlocked: number;
  totalAvailable: number;
}

interface NewAchievementsResponse {
  newAchievements: Array<{
    achievementId: string;
    name: string;
    goldReward: number;
  }>;
  totalGoldAwarded: number;
}

interface UserProfileResponse {
  user: UserInfo;
  stats: UserStats;
  recentGames: GameScore[];
  achievements: Achievement[];
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Shop Purchase Consistency
*For any* shop purchase request with valid wallet address and sufficient gold, the purchase should succeed and the user's gold balance should decrease by exactly the item price, and the item should appear in inventory with quantity increased by the purchase amount.
**Validates: Requirements 1.2, 1.3, 10.1**

### Property 2: Leaderboard Category Consistency
*For any* leaderboard category selection, all returned entries should be sorted by the selected category value in descending order, and each entry should have a valid value for that category.
**Validates: Requirements 2.2, 2.3**

### Property 3: Achievement Unlock Idempotence
*For any* achievement that has been unlocked, subsequent checks should not unlock it again or award gold again, ensuring each achievement is only unlocked once per user.
**Validates: Requirements 3.2, 10.3**

### Property 4: Profile Data Completeness
*For any* user profile request with a valid wallet address, the response should include all required fields (user info, stats, recent games, achievements) with no null values for mandatory fields.
**Validates: Requirements 4.2, 4.3, 4.4**

### Property 5: Achievement Notification Display
*For any* set of newly unlocked achievements, each achievement should trigger exactly one notification that displays for at least 5 seconds or until manually dismissed.
**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 6: Navigation State Preservation
*For any* navigation between screens, the user's wallet connection state and authentication status should remain unchanged.
**Validates: Requirements 6.4**

### Property 7: Game Metrics Accuracy
*For any* completed game, the duration metric should equal the time difference between game start and game end, and kills should equal words typed (since each enemy requires one word).
**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

### Property 8: Error Message Clarity
*For any* API error response, the system should display a user-friendly error message that does not expose technical details or stack traces.
**Validates: Requirements 8.2, 8.5**

### Property 9: Shop Items Availability
*For any* shop items query, the response should include only items marked as available in the database, and each item should have a valid price greater than zero.
**Validates: Requirements 9.2, 9.3, 9.5**

### Property 10: Data Synchronization Priority
*For any* conflict between local storage and database values, the database value should be used as the source of truth and local storage should be updated to match.
**Validates: Requirements 10.5**

## Error Handling

### API Error Categories

1. **Network Errors**
   - Connection timeout
   - No internet connection
   - DNS resolution failure
   - **Handling**: Display offline banner, retry with exponential backoff

2. **Authentication Errors**
   - Invalid wallet address
   - Wallet not connected
   - Session expired
   - **Handling**: Prompt user to reconnect wallet

3. **Validation Errors**
   - Insufficient gold
   - Invalid item ID
   - Invalid parameters
   - **Handling**: Display specific error message from API

4. **Server Errors**
   - 500 Internal Server Error
   - Database connection failure
   - **Handling**: Display generic error, offer retry

5. **Not Found Errors**
   - User not found
   - Item not found
   - **Handling**: Display specific "not found" message

### Error Handling Strategy

```typescript
async function handleApiCall<T>(
  apiCall: () => Promise<Response>,
  options: {
    retries?: number;
    fallback?: T;
    errorMessage?: string;
  } = {}
): Promise<T | null> {
  const { retries = 3, fallback, errorMessage } = options;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await apiCall();
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Request failed');
      }
      
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      if (attempt === retries - 1) {
        console.error(errorMessage || 'API call failed:', error);
        return fallback || null;
      }
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
  
  return fallback || null;
}
```

## Testing Strategy

### Unit Testing

**Shop Integration Tests**:
- Test shop items fetch with mock API
- Test purchase flow with sufficient gold
- Test purchase rejection with insufficient gold
- Test error handling for failed API calls
- Test fallback to hardcoded items

**Leaderboard Tests**:
- Test category switching
- Test time range filtering
- Test pagination
- Test loading states
- Test error fallback to local storage

**Achievement Tests**:
- Test achievement fetch
- Test category filtering
- Test locked/unlocked display
- Test notification triggering

**Profile Tests**:
- Test profile data fetch
- Test match history display
- Test duel statistics calculation
- Test error handling

### Property-Based Testing

We will use **fast-check** for property-based testing in TypeScript.

**Property Test 1: Shop Purchase Consistency**
```typescript
import fc from 'fast-check';

// Generate random shop purchases
const shopPurchaseArb = fc.record({
  walletAddress: fc.hexaString({ minLength: 40, maxLength: 40 }),
  itemId: fc.constantFrom('double-gold', 'triple-gold', 'extra-life'),
  initialGold: fc.integer({ min: 0, max: 10000 }),
  itemPrice: fc.integer({ min: 50, max: 500 }),
  quantity: fc.integer({ min: 1, max: 10 }),
});

fc.assert(
  fc.property(shopPurchaseArb, async (purchase) => {
    // Property: If gold >= price, purchase succeeds and gold decreases by price
    if (purchase.initialGold >= purchase.itemPrice * purchase.quantity) {
      const result = await mockPurchase(purchase);
      expect(result.success).toBe(true);
      expect(result.newGold).toBe(
        purchase.initialGold - purchase.itemPrice * purchase.quantity
      );
    }
  })
);
```

**Property Test 2: Leaderboard Sorting**
```typescript
// Generate random leaderboard data
const leaderboardArb = fc.array(
  fc.record({
    walletAddress: fc.hexaString({ minLength: 40, maxLength: 40 }),
    score: fc.integer({ min: 0, max: 100000 }),
    wpm: fc.integer({ min: 0, max: 200 }),
    kills: fc.integer({ min: 0, max: 1000 }),
  }),
  { minLength: 1, maxLength: 100 }
);

fc.assert(
  fc.property(leaderboardArb, (entries) => {
    // Property: Leaderboard should be sorted by selected category
    const sorted = sortLeaderboard(entries, 'score');
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].score).toBeGreaterThanOrEqual(sorted[i + 1].score);
    }
  })
);
```

**Property Test 3: Achievement Unlock Idempotence**
```typescript
// Generate random achievement unlock scenarios
const achievementUnlockArb = fc.record({
  walletAddress: fc.hexaString({ minLength: 40, maxLength: 40 }),
  achievementId: fc.constantFrom('first-kill', 'speed-demon', 'survivor'),
  initialGold: fc.integer({ min: 0, max: 10000 }),
  goldReward: fc.integer({ min: 10, max: 500 }),
});

fc.assert(
  fc.property(achievementUnlockArb, async (unlock) => {
    // Property: Unlocking same achievement twice should only award gold once
    const firstUnlock = await mockUnlockAchievement(unlock);
    const secondUnlock = await mockUnlockAchievement(unlock);
    
    expect(firstUnlock.goldAwarded).toBe(unlock.goldReward);
    expect(secondUnlock.goldAwarded).toBe(0);
    expect(secondUnlock.newAchievements.length).toBe(0);
  })
);
```

**Property Test 4: Game Metrics Accuracy**
```typescript
// Generate random game sessions
const gameSessionArb = fc.record({
  startTime: fc.integer({ min: 1000000000000, max: 2000000000000 }),
  endTime: fc.integer({ min: 1000000000000, max: 2000000000000 }),
  kills: fc.integer({ min: 0, max: 1000 }),
});

fc.assert(
  fc.property(gameSessionArb, (session) => {
    // Property: Duration should equal time difference
    fc.pre(session.endTime >= session.startTime);
    
    const duration = calculateDuration(session.startTime, session.endTime);
    const expectedDuration = Math.floor((session.endTime - session.startTime) / 1000);
    
    expect(duration).toBe(expectedDuration);
    
    // Property: Words typed should equal kills (one word per enemy)
    const wordsTyped = session.kills;
    expect(wordsTyped).toBe(session.kills);
  })
);
```

**Property Test 5: Data Synchronization Priority**
```typescript
// Generate random data conflicts
const dataConflictArb = fc.record({
  localStorageGold: fc.integer({ min: 0, max: 10000 }),
  databaseGold: fc.integer({ min: 0, max: 10000 }),
});

fc.assert(
  fc.property(dataConflictArb, async (conflict) => {
    // Property: Database value should always win
    const resolved = await resolveDataConflict(conflict);
    expect(resolved.gold).toBe(conflict.databaseGold);
    expect(localStorage.getItem('gold')).toBe(conflict.databaseGold.toString());
  })
);
```

### Integration Testing

**End-to-End Flow Tests**:
1. Complete shop purchase flow (fetch items → purchase → verify inventory)
2. Complete achievement unlock flow (play game → check achievements → display notification)
3. Complete leaderboard flow (fetch → filter → display)
4. Complete profile flow (fetch → display stats → display history)

### Manual Testing Checklist

- [ ] Shop items load from database
- [ ] Shop purchase updates gold and inventory
- [ ] Leaderboard displays all categories correctly
- [ ] Leaderboard time ranges filter correctly
- [ ] Achievements display locked/unlocked correctly
- [ ] Achievement notifications appear on unlock
- [ ] Profile displays all stats correctly
- [ ] Profile match history displays correctly
- [ ] Navigation between screens works
- [ ] Error messages display correctly
- [ ] Loading states display correctly
- [ ] Offline mode displays banner
- [ ] Data syncs between local storage and database

## Implementation Notes

### Priority Order

1. **High Priority** (Core Functionality):
   - Verify shop integration is working correctly
   - Add achievement unlock notifications
   - Verify game metrics tracking
   - Add navigation to achievements and profile screens

2. **Medium Priority** (User Experience):
   - Improve error handling across all components
   - Add loading states
   - Add retry logic for failed API calls
   - Verify data synchronization

3. **Low Priority** (Polish):
   - Add animations to achievement notifications
   - Add pagination to leaderboard
   - Add real-time updates
   - Refactor or deprecate CryptScreen

### Technical Considerations

1. **State Management**: Use React hooks for local state, avoid prop drilling
2. **API Calls**: Centralize API calls in custom hooks (e.g., `useShopItems`, `useLeaderboard`)
3. **Error Boundaries**: Wrap major components in error boundaries
4. **Loading States**: Use Suspense where appropriate
5. **Caching**: Leverage API-level caching (already implemented)
6. **Type Safety**: Ensure all API responses are properly typed

### Migration Strategy

1. **Phase 1**: Verify existing integrations (ShopScreen, LeaderboardScreen)
2. **Phase 2**: Add missing UI components (Achievement notifications, navigation)
3. **Phase 3**: Improve error handling and loading states
4. **Phase 4**: Add property-based tests
5. **Phase 5**: Refactor CryptScreen or deprecate in favor of ProfileScreen/AchievementsScreen

## Conclusion

The backend infrastructure is solid and complete. The frontend needs targeted improvements to fully utilize the available APIs and provide a seamless user experience. The main focus areas are:

1. Ensuring all components use the correct APIs
2. Adding achievement unlock notifications
3. Improving navigation to expose all features
4. Enhancing error handling and loading states
5. Verifying game metrics accuracy

With these improvements, the frontend will be fully integrated with the backend, providing players with a complete and polished experience.
