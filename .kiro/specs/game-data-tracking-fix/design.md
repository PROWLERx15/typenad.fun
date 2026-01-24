# Design Document

## Overview

This design addresses critical data loss issues in the TypeNad game where gameplay metrics, user statistics, duel history, shop functionality, and achievements are not being properly tracked or persisted to the database. The system currently collects rich gameplay data during sessions but fails to save most of it, resulting in empty database tables and broken features.

The solution involves:
1. Fixing database schema mismatches
2. Implementing comprehensive metric tracking during gameplay
3. Creating robust API endpoints for data persistence
4. Integrating score saving into all game over flows
5. Recording duel match history after settlement
6. Implementing shop item seeding and management
7. Building an achievement system with condition checking
8. Enhancing leaderboard functionality with multiple categories

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                          │
├─────────────────────────────────────────────────────────────┤
│  GameCanvas.tsx                                              │
│  ├─ Metric Tracking (duration, words, typos, misses, gold)  │
│  ├─ Game State Management                                    │
│  └─ Data Collection                                          │
│                                                               │
│  GameOver Components                                         │
│  ├─ GameOver.tsx (story mode)                               │
│  ├─ StakedGameOver.tsx (staked mode)                        │
│  └─ DuelGameOver.tsx (duel mode)                            │
│      └─ Score Saving Integration                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       API Layer                              │
├─────────────────────────────────────────────────────────────┤
│  /api/score/save          - Save game scores & update stats │
│  /api/score/history       - Retrieve game history           │
│  /api/duel/record         - Record duel match history       │
│  /api/achievements/check  - Check & award achievements      │
│  /api/user/stats          - Get user statistics             │
│  /api/user/profile        - Get complete user profile       │
│  /api/leaderboard         - Get rankings (multiple types)   │
│  /api/shop/items          - Get available shop items        │
│  /api/shop/purchase       - Purchase items                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer (Supabase)                 │
├─────────────────────────────────────────────────────────────┤
│  users                    - User accounts & aggregate stats  │
│  game_scores              - Individual game session data     │
│  duel_matches             - Duel history & results           │
│  shop_items               - Available items for purchase     │
│  user_inventory           - Player-owned items               │
│  user_achievements        - Unlocked achievements            │
│  duel_results (temp)      - Temporary duel submission data   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Story Mode Game Flow
```
1. Player starts game
   └─> GameCanvas initializes tracking (startTime, counters)

2. During gameplay
   ├─> Track kills, words typed, typos, misses
   ├─> Calculate WPM continuously
   ├─> Accumulate gold earned
   └─> Track wave progression

3. Game ends
   ├─> Calculate duration
   ├─> Pass all metrics to GameOver.tsx
   └─> GameOver.tsx calls /api/score/save
       ├─> Save game_scores record
       ├─> Update user aggregate stats
       ├─> Credit gold to user balance
       └─> Trigger achievement check
```

#### Staked Game Flow
```
1. Player starts staked game
   └─> GameCanvas tracks all metrics + stake info

2. Game ends (survival timer expires)
   ├─> Pass metrics to StakedGameOver.tsx
   └─> Player submits score to blockchain

3. Settlement completes
   ├─> /api/execute-game-settlement processes
   ├─> StakedGameOver.tsx calls /api/score/save
   │   ├─> Include isStaked=true
   │   ├─> Include stakeAmount, payoutAmount
   │   └─> Save with gameMode='staked'
   └─> Trigger achievement check
```

#### Duel Game Flow
```
1. Both players complete duel
   ├─> Each submits score to duel_results table
   └─> Metrics tracked: score, wpm, misses, typos

2. Settlement triggered
   ├─> /api/execute-settlement determines winner
   ├─> Executes blockchain settlement
   ├─> Records to duel_matches table
   │   ├─> Both player scores
   │   ├─> Winner address
   │   ├─> Stake & payout amounts
   │   └─> Transaction hash
   └─> Cleans up duel_results

3. After settlement
   ├─> DuelGameOver.tsx calls /api/score/save for player
   │   ├─> Include gameMode='duel'
   │   └─> Include all metrics
   └─> Trigger achievement check
```

## Components and Interfaces

### Frontend Components

#### 1. GameCanvas.tsx (Enhanced)

**New State Variables:**
```typescript
const gameStartTimeRef = useRef<number>(Date.now());
const wordsTypedCountRef = useRef<number>(0);
const goldEarnedRef = useRef<number>(0);
```

**New Functions:**
```typescript
// Calculate game duration
const calculateDuration = (): number => {
  return Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
};

// Track word typed (on enemy kill)
const incrementWordsTyped = () => {
  wordsTypedCountRef.current += 1;
};

// Accumulate gold
const addGoldEarned = (amount: number) => {
  goldEarnedRef.current += amount;
};
```

**Enhanced Props Passed to GameOver:**
```typescript
<GameOver
  score={score}
  wpm={bestWpm}
  kills={killsThisSession.current}
  waveReached={waveSystem.currentWave}
  goldEarned={goldEarnedRef.current}
  missCount={totalMissesRef.current}
  typoCount={totalTyposRef.current}
  duration={calculateDuration()}
  wordsTyped={wordsTypedCountRef.current}
  onRestart={restartGame}
/>
```

#### 2. GameOver.tsx (Enhanced)

**Interface:**
```typescript
interface GameOverProps {
  score: number;
  wpm: number;
  kills: number;
  waveReached: number;
  goldEarned: number;
  missCount: number;
  typoCount: number;
  duration: number;
  wordsTyped: number;
  onRestart: () => void;
}
```

**Score Saving Logic:**
```typescript
useEffect(() => {
  const saveScore = async () => {
    if (!address) return;
    
    try {
      const response = await fetch('/api/score/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          score,
          waveReached,
          wpm,
          kills,
          gameMode: 'story',
          goldEarned,
          misses: missCount,
          typos: typoCount,
          duration,
          wordsTyped,
        }),
      });

      if (response.ok) {
        // Optionally trigger achievement check
        await fetch('/api/achievements/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: address }),
        });
      }
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };
  
  saveScore();
}, []);
```

#### 3. StakedGameOver.tsx (Enhanced)

**Additional Logic After Settlement:**
```typescript
useEffect(() => {
  if (settlementStatus === 'settled' && !scoreSaved) {
    const saveScore = async () => {
      try {
        await fetch('/api/score/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: address,
            score,
            waveReached,
            wpm,
            kills,
            gameMode: 'staked',
            goldEarned,
            misses: missCount,
            typos: typoCount,
            duration,
            wordsTyped,
            isStaked: true,
            stakeAmount: stakeAmount.toString(),
            payoutAmount: payoutAmount.toString(),
          }),
        });
        setScoreSaved(true);
      } catch (error) {
        console.error('Failed to save staked game score:', error);
      }
    };
    
    saveScore();
  }
}, [settlementStatus, scoreSaved]);
```

#### 4. DuelGameOver.tsx (Enhanced)

**Similar pattern to StakedGameOver:**
```typescript
useEffect(() => {
  if (settlementStatus === 'settled' && !scoreSaved) {
    const saveScore = async () => {
      try {
        await fetch('/api/score/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: address,
            score,
            wpm,
            kills,
            gameMode: 'duel',
            misses: missCount,
            typos: typoCount,
            duration,
            wordsTyped,
          }),
        });
        setScoreSaved(true);
      } catch (error) {
        console.error('Failed to save duel score:', error);
      }
    };
    
    saveScore();
  }
}, [settlementStatus, scoreSaved]);
```

### Backend API Endpoints

#### 1. /api/score/save (Enhanced)

**Request Body:**
```typescript
interface SaveScoreRequest {
  walletAddress: string;
  score: number;
  waveReached: number;
  wpm: number;
  kills: number;
  gameMode: 'story' | 'staked' | 'duel';
  goldEarned: number;
  misses: number;
  typos: number;
  duration: number;
  wordsTyped: number;
  isStaked?: boolean;
  stakeAmount?: string;
  payoutAmount?: string;
}
```

**Logic:**
1. Validate input parameters
2. Get or create user record
3. Insert game_scores record with ALL fields
4. Update user aggregate statistics:
   - total_games += 1
   - total_kills += kills
   - total_words_typed += wordsTyped
   - gold += goldEarned
   - best_score = max(best_score, score)
   - best_wpm = max(best_wpm, wpm)
   - best_streak (if applicable)
5. Update last_seen_at timestamp
6. Return success with scoreId

**Response:**
```typescript
interface SaveScoreResponse {
  success: boolean;
  data?: {
    scoreId: string;
    userId: string;
  };
  error?: string;
}
```

#### 2. /api/score/history (New)

**Purpose:** Retrieve user's game history with filtering

**Query Parameters:**
```typescript
interface HistoryQuery {
  walletAddress: string;
  gameMode?: 'story' | 'staked' | 'duel' | 'all';
  limit?: number; // default 20
  offset?: number; // default 0
  sortBy?: 'score' | 'wpm' | 'created_at'; // default 'created_at'
  sortOrder?: 'asc' | 'desc'; // default 'desc'
}
```

**Response:**
```typescript
interface HistoryResponse {
  success: boolean;
  data?: {
    scores: GameScore[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
  error?: string;
}
```

#### 3. /api/duel/record (New)

**Purpose:** Record duel match history after settlement

**Request Body:**
```typescript
interface RecordDuelRequest {
  duelId: string;
  player1Address: string;
  player2Address: string;
  winnerAddress: string;
  stakeAmount: string;
  payoutAmount: string;
  player1Score: number;
  player2Score: number;
  player1Wpm: number;
  player2Wpm: number;
  txHash: string;
}
```

**Logic:**
1. Validate all addresses
2. Validate duelId is unique (use upsert with conflict resolution)
3. Insert into duel_matches table
4. Return success

**Response:**
```typescript
interface RecordDuelResponse {
  success: boolean;
  data?: {
    matchId: string;
  };
  error?: string;
}
```

#### 4. /api/achievements/check (New)

**Purpose:** Check and award achievements for a user

**Request Body:**
```typescript
interface CheckAchievementsRequest {
  walletAddress: string;
}
```

**Logic:**
1. Fetch user's current statistics
2. Fetch user's already unlocked achievements
3. Check all achievement conditions
4. For each newly met condition:
   - Insert into user_achievements
   - Credit gold reward to user
5. Return list of newly unlocked achievements

**Response:**
```typescript
interface CheckAchievementsResponse {
  success: boolean;
  data?: {
    newAchievements: Array<{
      achievementId: string;
      name: string;
      goldReward: number;
    }>;
    totalGoldAwarded: number;
  };
  error?: string;
}
```

#### 5. /api/user/stats (New)

**Purpose:** Get user's aggregate statistics

**Query Parameters:**
```typescript
interface StatsQuery {
  walletAddress: string;
}
```

**Response:**
```typescript
interface StatsResponse {
  success: boolean;
  data?: {
    totalGames: number;
    totalKills: number;
    totalWordsTyped: number;
    bestScore: number;
    bestWpm: number;
    bestStreak: number;
    gold: number;
    achievementCount: number;
    duelWins: number;
    duelLosses: number;
    leaderboardRank: number | null;
  };
  error?: string;
}
```

#### 6. /api/user/profile (New)

**Purpose:** Get complete user profile with stats and recent games

**Query Parameters:**
```typescript
interface ProfileQuery {
  walletAddress: string;
}
```

**Response:**
```typescript
interface ProfileResponse {
  success: boolean;
  data?: {
    user: {
      walletAddress: string;
      username: string;
      profilePicture: string | null;
      createdAt: string;
    };
    stats: UserStats;
    recentGames: GameScore[];
    achievements: Achievement[];
  };
  error?: string;
}
```

#### 7. /api/leaderboard (Enhanced)

**New Query Parameters:**
```typescript
interface LeaderboardQuery {
  category?: 'best_score' | 'best_wpm' | 'total_kills' | 'duel_wins';
  timeRange?: 'all' | 'today' | 'week' | 'month';
  limit?: number;
  offset?: number;
}
```

**Enhanced Logic:**
1. Support multiple ranking categories
2. Filter by time range
3. Exclude users with zero/null values
4. Include user profile data
5. Calculate rank based on category

#### 8. /api/shop/seed (New)

**Purpose:** Initialize shop items (run once or on demand)

**Logic:**
1. Check if shop_items table is empty
2. Insert predefined shop items
3. Return count of items seeded

**Items to Seed:**
- Powerups: double-points, triple-points, double-gold, triple-gold, slow-enemies, extra-life
- Heroes: Various cosmetic options

## Data Models

### Database Schema Enhancements

#### users table (Enhanced)
```sql
CREATE TABLE public.users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  email TEXT,
  google_id TEXT,
  profile_picture TEXT,
  gold INTEGER DEFAULT 0 NOT NULL,
  total_games INTEGER DEFAULT 0 NOT NULL,
  total_kills INTEGER DEFAULT 0 NOT NULL,
  total_words_typed INTEGER DEFAULT 0 NOT NULL,
  best_streak INTEGER DEFAULT 0 NOT NULL,
  best_score INTEGER DEFAULT 0 NOT NULL,  -- ADDED
  best_wpm INTEGER DEFAULT 0 NOT NULL,    -- ADDED
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_best_score ON users(best_score DESC);
CREATE INDEX idx_users_best_wpm ON users(best_wpm DESC);
CREATE INDEX idx_users_total_kills ON users(total_kills DESC);
```

#### game_scores table (Enhanced)
```sql
CREATE TABLE public.game_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  score INTEGER DEFAULT 0 NOT NULL,
  wave_reached INTEGER DEFAULT 1 NOT NULL,
  wpm INTEGER DEFAULT 0 NOT NULL,
  game_mode TEXT DEFAULT 'story' NOT NULL,
  kills INTEGER DEFAULT 0 NOT NULL,
  misses INTEGER DEFAULT 0 NOT NULL,           -- ADDED
  typos INTEGER DEFAULT 0 NOT NULL,            -- ADDED
  gold_earned INTEGER DEFAULT 0 NOT NULL,      -- ADDED
  duration_seconds INTEGER DEFAULT 0 NOT NULL, -- ADDED
  words_typed INTEGER DEFAULT 0 NOT NULL,      -- ADDED
  is_staked BOOLEAN DEFAULT FALSE NOT NULL,    -- ADDED
  stake_amount BIGINT,                         -- ADDED
  payout_amount BIGINT,                        -- ADDED
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_game_scores_user ON game_scores(user_id);
CREATE INDEX idx_game_scores_mode ON game_scores(game_mode);
CREATE INDEX idx_game_scores_score ON game_scores(score DESC);
CREATE INDEX idx_game_scores_created ON game_scores(created_at DESC);
```

#### duel_matches table (Enhanced)
```sql
CREATE TABLE public.duel_matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  duel_id TEXT UNIQUE NOT NULL,
  player1_address TEXT NOT NULL,
  player2_address TEXT NOT NULL,
  winner_address TEXT NOT NULL,
  stake_amount BIGINT NOT NULL,
  payout_amount BIGINT NOT NULL,
  player1_score INTEGER NOT NULL,
  player2_score INTEGER NOT NULL,
  player1_wpm INTEGER NOT NULL,
  player2_wpm INTEGER NOT NULL,
  settled_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  tx_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_duel_matches_duel_id ON duel_matches(duel_id);
CREATE INDEX idx_duel_matches_player1 ON duel_matches(player1_address);
CREATE INDEX idx_duel_matches_player2 ON duel_matches(player2_address);
CREATE INDEX idx_duel_matches_winner ON duel_matches(winner_address);
CREATE INDEX idx_duel_matches_settled ON duel_matches(settled_at DESC);
```

#### shop_items table (Enhanced)
```sql
CREATE TABLE public.shop_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  gold_price INTEGER NOT NULL,
  category TEXT NOT NULL, -- 'powerup', 'hero', 'cosmetic'
  available BOOLEAN DEFAULT TRUE NOT NULL,
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_shop_items_category ON shop_items(category);
CREATE INDEX idx_shop_items_available ON shop_items(available);
```

#### user_inventory table (Enhanced)
```sql
CREATE TABLE public.user_inventory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL,      -- ADDED: 'powerup', 'hero', 'cosmetic'
  quantity INTEGER DEFAULT 0 NOT NULL,
  equipped BOOLEAN DEFAULT FALSE NOT NULL, -- ADDED
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, item_id)
);

CREATE INDEX idx_user_inventory_user ON user_inventory(user_id);
CREATE INDEX idx_user_inventory_equipped ON user_inventory(user_id, equipped);
```

#### user_achievements table (No changes needed)
```sql
CREATE TABLE public.user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
```

### TypeScript Interfaces

```typescript
// User model
interface User {
  id: string;
  walletAddress: string;
  username: string | null;
  email: string | null;
  googleId: string | null;
  profilePicture: string | null;
  gold: number;
  totalGames: number;
  totalKills: number;
  totalWordsTyped: number;
  bestStreak: number;
  bestScore: number;
  bestWpm: number;
  createdAt: string;
  lastSeenAt: string;
}

// Game score model
interface GameScore {
  id: string;
  userId: string;
  score: number;
  waveReached: number;
  wpm: number;
  gameMode: 'story' | 'staked' | 'duel';
  kills: number;
  misses: number;
  typos: number;
  goldEarned: number;
  durationSeconds: number;
  wordsTyped: number;
  isStaked: boolean;
  stakeAmount: string | null;
  payoutAmount: string | null;
  createdAt: string;
}

// Duel match model
interface DuelMatch {
  id: string;
  duelId: string;
  player1Address: string;
  player2Address: string;
  winnerAddress: string;
  stakeAmount: string;
  payoutAmount: string;
  player1Score: number;
  player2Score: number;
  player1Wpm: number;
  player2Wpm: number;
  settledAt: string;
  txHash: string;
  createdAt: string;
}

// Shop item model
interface ShopItem {
  id: string;
  name: string;
  description: string;
  goldPrice: number;
  category: 'powerup' | 'hero' | 'cosmetic';
  available: boolean;
  imageUrl: string | null;
  metadata: Record<string, any>;
  createdAt: string;
}

// User inventory model
interface UserInventoryItem {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'powerup' | 'hero' | 'cosmetic';
  quantity: number;
  equipped: boolean;
  updatedAt: string;
}

// Achievement model
interface Achievement {
  id: string;
  achievementId: string;
  name: string;
  description: string;
  condition: (stats: UserStats) => boolean;
  goldReward: number;
  icon: string;
}

// User achievement model
interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
}
```

## 
Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Complete game score persistence

*For any* completed game session (story, staked, or duel), saving the score should result in a database record containing all required metrics: score, WPM, kills, misses, typos, gold earned, duration, wave reached, and game mode.

**Validates: Requirements 1.1, 1.2, 1.3, 1.5**

### Property 2: User statistics update consistency

*For any* game score save operation, the user's aggregate statistics (total_games, total_kills, total_words_typed, best_score, best_wpm) should be updated to reflect the new game data, with best values being the maximum of previous and current values.

**Validates: Requirements 1.4**

### Property 3: Metric tracking completeness

*For any* game session, when the session ends, all tracked metrics (duration, words typed, typos, misses, gold earned) should be passed to the game over component without loss of data.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

### Property 4: Duel match history completeness

*For any* successfully settled duel, the duel_matches table should contain a record with both player addresses, scores, WPM values, winner address, stake amount, payout amount, transaction hash, and settlement timestamp.

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 5: Duel history persistence ordering

*For any* duel settlement, the match history record should be created in the duel_matches table before the temporary duel_results records are deleted.

**Validates: Requirements 3.5**

### Property 6: Shop item data completeness

*For any* shop item in the shop_items table, the record should include name, description, gold_price, category, and metadata fields with valid non-null values.

**Validates: Requirements 4.2**

### Property 7: Purchase gold deduction

*For any* successful item purchase, the user's gold balance should decrease by exactly the item's gold_price amount.

**Validates: Requirements 4.4, 8.3**

### Property 8: Purchase inventory update

*For any* item purchase, either a new inventory record should be created with quantity 1, or if the item already exists in the user's inventory, the quantity should be incremented by 1.

**Validates: Requirements 4.5**

### Property 9: Achievement unlock uniqueness (Idempotence)

*For any* achievement condition that is met, checking achievements multiple times should only create one user_achievements record and credit the gold reward exactly once.

**Validates: Requirements 5.5**

### Property 10: Achievement gold reward

*For any* newly unlocked achievement, the user's gold balance should increase by the achievement's gold_reward amount.

**Validates: Requirements 5.4, 8.4**

### Property 11: Leaderboard ranking correctness

*For any* leaderboard request with a specific category (best_score, best_wpm, total_kills), users should be ranked in descending order by that metric, with higher values receiving better ranks.

**Validates: Requirements 6.1, 6.3**

### Property 12: Leaderboard filtering

*For any* leaderboard request, the results should exclude all users where the ranking metric is zero or null.

**Validates: Requirements 6.2**

### Property 13: Leaderboard data completeness

*For any* leaderboard entry, the response should include wallet_address, username, and the value of the ranking metric.

**Validates: Requirements 6.4**

### Property 14: Gold balance accumulation

*For any* game score save operation, the user's gold balance should increase by the gold_earned amount from that game.

**Validates: Requirements 8.2**

### Property 15: API error handling

*For any* API endpoint that receives invalid input parameters, the response should have an HTTP status code in the 400 range and include an error message describing the validation failure.

**Validates: Requirements 9.6, 9.7**

### Property 16: User profile data completeness

*For any* user profile request, the response should include all aggregate statistics (total_games, total_kills, total_words_typed, best_score, best_wpm, best_streak), current gold balance, achievement count, duel win/loss counts, and leaderboard rank.

**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

## Error Handling

### Frontend Error Handling

**GameOver Components:**
- Gracefully handle score save failures
- Log errors to console for debugging
- Do not block user from restarting game
- Show optional error notification to user

**GameCanvas:**
- Handle metric tracking failures silently
- Ensure game continues even if tracking fails
- Log tracking errors for debugging

### Backend Error Handling

**API Endpoints:**
- Validate all input parameters before processing
- Return appropriate HTTP status codes:
  - 400: Bad Request (invalid input)
  - 404: Not Found (resource doesn't exist)
  - 500: Internal Server Error (unexpected errors)
- Include descriptive error messages in responses
- Log all errors with context for debugging

**Database Operations:**
- Use transactions for multi-step operations
- Handle unique constraint violations gracefully
- Retry transient database errors
- Log database errors with query context

**Settlement Integration:**
- Handle race conditions (duel already settled)
- Verify settlement success before recording history
- Do not fail settlement if history recording fails
- Log all settlement steps for audit trail

### Error Recovery Strategies

**Score Save Failures:**
1. Log error with full context
2. Continue game flow (don't block user)
3. Optionally retry in background
4. Alert monitoring system for persistent failures

**Achievement Check Failures:**
1. Log error but don't block score save
2. Achievement check can be retried later
3. User won't lose achievement eligibility

**Duel History Recording Failures:**
1. Log error with duel ID
2. Don't fail settlement transaction
3. History can be reconstructed from blockchain events
4. Alert monitoring for manual review

## Testing Strategy

### Unit Testing

**Frontend Components:**
- Test GameCanvas metric tracking logic
- Test GameOver score save integration
- Test error handling in components
- Mock API calls for isolated testing

**Backend APIs:**
- Test each endpoint with valid inputs
- Test validation logic with invalid inputs
- Test error responses
- Test database operations with mocked database

**Database Functions:**
- Test user stat update logic
- Test gold balance calculations
- Test achievement checking logic

### Property-Based Testing

**Testing Framework:** We will use **fast-check** for JavaScript/TypeScript property-based testing.

**Configuration:** Each property test should run a minimum of 100 iterations to ensure adequate coverage of the input space.

**Test Tagging:** Each property-based test must include a comment explicitly referencing the correctness property from this design document using the format:
```typescript
// Feature: game-data-tracking-fix, Property 1: Complete game score persistence
```

**Property Test Examples:**

**Property 1: Complete game score persistence**
```typescript
// Feature: game-data-tracking-fix, Property 1: Complete game score persistence
it('should save all game metrics to database', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        score: fc.integer({ min: 0, max: 999999 }),
        wpm: fc.integer({ min: 0, max: 300 }),
        kills: fc.integer({ min: 0, max: 1000 }),
        misses: fc.integer({ min: 0, max: 100 }),
        typos: fc.integer({ min: 0, max: 100 }),
        goldEarned: fc.integer({ min: 0, max: 10000 }),
        duration: fc.integer({ min: 1, max: 3600 }),
        waveReached: fc.integer({ min: 1, max: 9 }),
        gameMode: fc.constantFrom('story', 'staked', 'duel'),
      }),
      async (gameData) => {
        const response = await saveScore(testWalletAddress, gameData);
        expect(response.success).toBe(true);
        
        const savedScore = await getScore(response.data.scoreId);
        expect(savedScore.score).toBe(gameData.score);
        expect(savedScore.wpm).toBe(gameData.wpm);
        expect(savedScore.kills).toBe(gameData.kills);
        expect(savedScore.misses).toBe(gameData.misses);
        expect(savedScore.typos).toBe(gameData.typos);
        expect(savedScore.goldEarned).toBe(gameData.goldEarned);
        expect(savedScore.durationSeconds).toBe(gameData.duration);
        expect(savedScore.waveReached).toBe(gameData.waveReached);
        expect(savedScore.gameMode).toBe(gameData.gameMode);
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property 2: User statistics update consistency**
```typescript
// Feature: game-data-tracking-fix, Property 2: User statistics update consistency
it('should update user stats correctly after score save', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.array(
        fc.record({
          score: fc.integer({ min: 0, max: 999999 }),
          wpm: fc.integer({ min: 0, max: 300 }),
          kills: fc.integer({ min: 0, max: 1000 }),
          wordsTyped: fc.integer({ min: 0, max: 1000 }),
        }),
        { minLength: 1, maxLength: 10 }
      ),
      async (games) => {
        const testUser = await createTestUser();
        
        for (const game of games) {
          await saveScore(testUser.walletAddress, game);
        }
        
        const userStats = await getUserStats(testUser.walletAddress);
        
        expect(userStats.totalGames).toBe(games.length);
        expect(userStats.totalKills).toBe(games.reduce((sum, g) => sum + g.kills, 0));
        expect(userStats.totalWordsTyped).toBe(games.reduce((sum, g) => sum + g.wordsTyped, 0));
        expect(userStats.bestScore).toBe(Math.max(...games.map(g => g.score)));
        expect(userStats.bestWpm).toBe(Math.max(...games.map(g => g.wpm)));
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property 7: Purchase gold deduction**
```typescript
// Feature: game-data-tracking-fix, Property 7: Purchase gold deduction
it('should deduct item price from user gold on purchase', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.integer({ min: 100, max: 10000 }), // initial gold
      fc.integer({ min: 50, max: 500 }),    // item price
      async (initialGold, itemPrice) => {
        const testUser = await createTestUserWithGold(initialGold);
        const testItem = await createTestShopItem({ goldPrice: itemPrice });
        
        const beforeGold = await getUserGold(testUser.walletAddress);
        await purchaseItem(testUser.walletAddress, testItem.id);
        const afterGold = await getUserGold(testUser.walletAddress);
        
        expect(afterGold).toBe(beforeGold - itemPrice);
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property 9: Achievement unlock uniqueness**
```typescript
// Feature: game-data-tracking-fix, Property 9: Achievement unlock uniqueness
it('should only unlock achievement once despite multiple checks', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.integer({ min: 2, max: 10 }), // number of times to check
      async (checkCount) => {
        const testUser = await createTestUser();
        // Set user stats to meet achievement condition
        await setUserStats(testUser.walletAddress, { totalKills: 100 });
        
        const initialGold = await getUserGold(testUser.walletAddress);
        
        // Check achievements multiple times
        for (let i = 0; i < checkCount; i++) {
          await checkAchievements(testUser.walletAddress);
        }
        
        const achievements = await getUserAchievements(testUser.walletAddress);
        const killAchievement = achievements.find(a => a.achievementId === 'kill-100');
        
        expect(killAchievement).toBeDefined();
        
        const finalGold = await getUserGold(testUser.walletAddress);
        const expectedGold = initialGold + 100; // achievement reward
        
        expect(finalGold).toBe(expectedGold);
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property 11: Leaderboard ranking correctness**
```typescript
// Feature: game-data-tracking-fix, Property 11: Leaderboard ranking correctness
it('should rank users correctly by specified metric', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.array(
        fc.record({
          bestScore: fc.integer({ min: 0, max: 999999 }),
          bestWpm: fc.integer({ min: 0, max: 300 }),
          totalKills: fc.integer({ min: 0, max: 10000 }),
        }),
        { minLength: 5, maxLength: 20 }
      ),
      fc.constantFrom('best_score', 'best_wpm', 'total_kills'),
      async (userStats, category) => {
        // Create users with stats
        const users = await Promise.all(
          userStats.map(stats => createTestUserWithStats(stats))
        );
        
        const leaderboard = await getLeaderboard({ category });
        
        // Verify descending order
        for (let i = 0; i < leaderboard.length - 1; i++) {
          const current = leaderboard[i][category];
          const next = leaderboard[i + 1][category];
          expect(current).toBeGreaterThanOrEqual(next);
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing

**End-to-End Game Flow:**
1. Start game session
2. Play through game (simulated)
3. Trigger game over
4. Verify score saved to database
5. Verify user stats updated
6. Verify gold credited
7. Verify achievements checked

**Duel Settlement Flow:**
1. Create duel with two players
2. Both players submit scores
3. Trigger settlement
4. Verify duel_matches record created
5. Verify duel_results cleaned up
6. Verify both players' scores saved

**Shop Purchase Flow:**
1. Create user with gold
2. Purchase item
3. Verify gold deducted
4. Verify item in inventory
5. Equip item
6. Verify equipped status updated

### Manual Testing Checklist

- [ ] Play story mode game and verify score saves
- [ ] Play staked game and verify settlement + score save
- [ ] Play duel and verify match history recorded
- [ ] Purchase shop items and verify inventory updates
- [ ] Unlock achievements and verify gold rewards
- [ ] Check leaderboard shows correct rankings
- [ ] Verify user profile displays all stats correctly
- [ ] Test error scenarios (network failures, invalid inputs)

## Implementation Notes

### Database Migration Strategy

1. **Create migration script** for schema changes
2. **Test migration** on development database
3. **Backup production database** before migration
4. **Run migration** during low-traffic period
5. **Verify schema** after migration
6. **Seed shop items** after migration

### Deployment Sequence

1. Deploy database schema changes
2. Seed shop items
3. Deploy backend API changes
4. Deploy frontend changes
5. Monitor error logs
6. Verify data is being saved correctly

### Performance Considerations

**Database Indexes:**
- Add indexes on frequently queried columns
- Monitor query performance
- Optimize slow queries

**API Response Times:**
- Cache leaderboard results (5-minute TTL)
- Use database connection pooling
- Implement rate limiting

**Frontend Performance:**
- Debounce metric tracking updates
- Batch API calls where possible
- Handle API failures gracefully

### Monitoring and Observability

**Metrics to Track:**
- Score save success rate
- API response times
- Database query performance
- Error rates by endpoint
- Achievement unlock rate
- Shop purchase rate

**Logging:**
- Log all score saves with context
- Log all duel settlements
- Log all achievement unlocks
- Log all API errors with stack traces

**Alerts:**
- Alert on high error rates
- Alert on slow API responses
- Alert on database connection failures
- Alert on settlement failures

## Security Considerations

**Input Validation:**
- Validate all wallet addresses
- Validate numeric ranges (score, WPM, etc.)
- Sanitize string inputs
- Prevent SQL injection

**Authentication:**
- Verify wallet ownership for sensitive operations
- Use service role key for backend operations
- Implement rate limiting per wallet

**Data Integrity:**
- Use database transactions for multi-step operations
- Implement optimistic locking for concurrent updates
- Validate data consistency after operations

**Blockchain Integration:**
- Verify settlement signatures
- Check on-chain state before recording
- Handle race conditions gracefully
- Log all blockchain interactions

## Future Enhancements

**Analytics Dashboard:**
- Visualize player statistics
- Track game metrics over time
- Identify popular game modes
- Monitor economy balance

**Advanced Achievements:**
- Combo achievements (multiple conditions)
- Time-limited achievements
- Secret achievements
- Achievement tiers (bronze, silver, gold)

**Enhanced Leaderboards:**
- Friend leaderboards
- Guild/team leaderboards
- Weekly/monthly resets
- Seasonal rankings

**Shop Enhancements:**
- Limited-time items
- Item bundles
- Discount system
- Gift items to friends

**Social Features:**
- Player profiles
- Achievement showcases
- Match replays
- Share scores on social media
