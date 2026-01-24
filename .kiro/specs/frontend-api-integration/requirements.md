# Requirements Document: Frontend API Integration Completion

## Introduction

This specification addresses the completion of frontend-to-backend API integrations for the TypeNad game. While the backend APIs are fully implemented and functional, several frontend components are either not using the APIs correctly, missing UI elements to expose functionality, or have incomplete integrations. This spec focuses on ensuring all frontend components properly integrate with the existing backend infrastructure.

## Glossary

- **API Endpoint**: A backend HTTP route that provides data or functionality to the frontend
- **Frontend Component**: A React component that renders UI and handles user interactions
- **Integration**: The connection between a frontend component and its corresponding backend API
- **Shop Items**: Purchasable powerups and items stored in the database
- **Leaderboard**: Ranking system showing top players across various categories
- **Achievement System**: Reward system that tracks and unlocks player milestones
- **Profile Screen**: UI displaying comprehensive user statistics and history
- **Game Metrics**: Data tracked during gameplay (score, WPM, kills, duration, etc.)

## Requirements

### Requirement 1: Shop System Integration

**User Story:** As a player, I want the shop to load items from the database and process purchases through the API, so that my inventory is properly synchronized and validated.

#### Acceptance Criteria

1. WHEN the ShopScreen component mounts THEN the system SHALL fetch shop items from GET /api/shop/items
2. WHEN a player purchases an item THEN the system SHALL call POST /api/shop/purchase with wallet address, item ID, and quantity
3. WHEN a purchase succeeds THEN the system SHALL update the local gold balance with the value returned from the API
4. WHEN a purchase fails THEN the system SHALL display the error message returned from the API
5. WHEN the shop items API fails THEN the system SHALL fall back to hardcoded items as a safety measure

### Requirement 2: Leaderboard Enhancement

**User Story:** As a player, I want to view leaderboards across multiple categories and time ranges, so that I can see rankings for different achievements.

#### Acceptance Criteria

1. WHEN the LeaderboardScreen component mounts THEN the system SHALL fetch leaderboard data from GET /api/leaderboard
2. WHEN a player selects a category (Score, WPM, Kills, Duel Wins) THEN the system SHALL fetch leaderboard data for that category
3. WHEN a player selects a time range (All Time, Monthly, Weekly, Today) THEN the system SHALL fetch leaderboard data for that time range
4. WHEN leaderboard data is loading THEN the system SHALL display a loading indicator
5. WHEN the leaderboard API fails THEN the system SHALL display an error message and fall back to local storage data

### Requirement 3: Achievement Display Integration

**User Story:** As a player, I want to view my unlocked achievements and see which ones I haven't earned yet, so that I can track my progress and set goals.

#### Acceptance Criteria

1. WHEN the AchievementsScreen component mounts THEN the system SHALL fetch unlocked achievements from GET /api/achievements/check
2. WHEN displaying achievements THEN the system SHALL show both locked and unlocked achievements with visual distinction
3. WHEN an achievement is unlocked THEN the system SHALL display the achievement icon, name, description, and gold reward
4. WHEN an achievement is locked THEN the system SHALL display it in grayscale with a locked indicator
5. WHEN a player filters by category THEN the system SHALL display only achievements in that category

### Requirement 4: Profile Screen Integration

**User Story:** As a player, I want to view my comprehensive profile with statistics and match history, so that I can track my overall performance.

#### Acceptance Criteria

1. WHEN the ProfileScreen component mounts THEN the system SHALL fetch profile data from GET /api/user/profile
2. WHEN displaying profile data THEN the system SHALL show user stats (games, kills, words typed, best score, best WPM)
3. WHEN displaying profile data THEN the system SHALL show duel statistics (wins, losses, win rate)
4. WHEN displaying match history THEN the system SHALL show recent games with score, WPM, kills, and date
5. WHEN the profile API fails THEN the system SHALL display an error message

### Requirement 5: Achievement Unlock Notifications

**User Story:** As a player, I want to see notifications when I unlock achievements, so that I feel rewarded for my accomplishments.

#### Acceptance Criteria

1. WHEN a game ends and achievements are checked THEN the system SHALL display notifications for newly unlocked achievements
2. WHEN an achievement notification appears THEN the system SHALL show the achievement icon, name, and gold reward
3. WHEN multiple achievements are unlocked THEN the system SHALL display them sequentially or stacked
4. WHEN an achievement notification is displayed THEN the system SHALL auto-dismiss after 5 seconds
5. WHEN a player clicks an achievement notification THEN the system SHALL dismiss it immediately

### Requirement 6: Navigation Integration

**User Story:** As a player, I want to easily navigate between the profile, achievements, and other screens, so that I can access all features seamlessly.

#### Acceptance Criteria

1. WHEN viewing the CryptScreen THEN the system SHALL provide navigation to AchievementsScreen and ProfileScreen
2. WHEN viewing AchievementsScreen THEN the system SHALL provide a way to return to the previous screen
3. WHEN viewing ProfileScreen THEN the system SHALL provide a way to return to the previous screen
4. WHEN navigating between screens THEN the system SHALL preserve the user's wallet connection state
5. WHEN pressing Escape key on any screen THEN the system SHALL return to the previous screen

### Requirement 7: Game Metrics Tracking Verification

**User Story:** As a developer, I want to ensure all game metrics are properly tracked and passed to the backend, so that player statistics are accurate.

#### Acceptance Criteria

1. WHEN a game starts THEN the system SHALL initialize tracking for duration, kills, words typed, and wave number
2. WHEN an enemy is killed THEN the system SHALL increment the kills counter and words typed counter
3. WHEN a wave is completed THEN the system SHALL update the wave number
4. WHEN a game ends THEN the system SHALL calculate the total duration in seconds
5. WHEN game metrics are sent to the API THEN the system SHALL include all tracked metrics (score, WPM, kills, duration, words typed, wave reached)

### Requirement 8: Error Handling and Loading States

**User Story:** As a player, I want to see clear loading indicators and error messages, so that I understand what's happening when things go wrong.

#### Acceptance Criteria

1. WHEN an API request is in progress THEN the system SHALL display a loading indicator
2. WHEN an API request fails THEN the system SHALL display a user-friendly error message
3. WHEN an API request fails THEN the system SHALL provide a retry option where appropriate
4. WHEN network connectivity is lost THEN the system SHALL display an offline indicator
5. WHEN an API returns validation errors THEN the system SHALL display the specific error messages

### Requirement 9: Shop Item Database Seeding

**User Story:** As a system administrator, I want shop items to be seeded in the database, so that the shop has items available for purchase.

#### Acceptance Criteria

1. WHEN the database is initialized THEN the system SHALL execute the shop items seed migration
2. WHEN shop items are seeded THEN the system SHALL create entries for all powerup types
3. WHEN shop items are seeded THEN the system SHALL set appropriate prices and availability
4. WHEN shop items are seeded THEN the system SHALL include metadata for each item
5. WHEN querying shop items THEN the system SHALL return all available items with correct data

### Requirement 10: Data Consistency and Synchronization

**User Story:** As a player, I want my data to be consistent across local storage and the database, so that I don't lose progress or encounter conflicts.

#### Acceptance Criteria

1. WHEN a player makes a purchase THEN the system SHALL update both the database and local storage
2. WHEN a player's gold balance changes THEN the system SHALL synchronize the change to the database
3. WHEN a player unlocks an achievement THEN the system SHALL record it in the database immediately
4. WHEN a player's inventory changes THEN the system SHALL synchronize the change to the database
5. WHEN local storage and database are out of sync THEN the system SHALL prioritize database values as the source of truth
