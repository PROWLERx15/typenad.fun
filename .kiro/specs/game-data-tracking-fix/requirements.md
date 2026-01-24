# Requirements Document

## Introduction

This specification addresses critical data loss issues in the TypeNad game application where gameplay data, user statistics, duel history, shop functionality, and achievements are not being properly tracked or saved to the database. The system currently collects rich gameplay metrics during game sessions but fails to persist most of this data, resulting in empty or zero-valued database records, non-functional leaderboards, and broken game economy features.

## Glossary

- **Game System**: The TypeNad typing game application including frontend and backend components
- **Database**: The Supabase PostgreSQL database storing all game data
- **Game Session**: A single playthrough of the game from start to game over
- **Settlement**: The blockchain transaction process for staked games and duels
- **User Stats**: Aggregate statistics tracked per user (total kills, best score, best WPM, etc.)
- **Game Score**: Individual game session data including score, WPM, kills, misses, typos
- **Duel Match**: A competitive game between two players with stakes
- **Shop Item**: Purchasable in-game items using gold currency
- **Achievement**: Unlockable milestone based on gameplay accomplishments
- **Gold**: In-game currency earned through gameplay
- **WPM**: Words Per Minute typing speed metric
- **Wave**: Game progression level in story mode
- **Staked Game**: Solo game with cryptocurrency stake requiring settlement
- **Game Mode**: Type of game (story, staked, duel)

## Requirements

### Requirement 1

**User Story:** As a player, I want my game scores and statistics to be saved after every game, so that I can track my progress and see my performance history.

#### Acceptance Criteria

1. WHEN a player completes a story mode game THEN the Game System SHALL save the game score with all metrics to the database
2. WHEN a player completes a staked game and settlement succeeds THEN the Game System SHALL save the game score with stake information to the database
3. WHEN a player completes a duel and settlement succeeds THEN the Game System SHALL save the game score to the database
4. WHEN a game score is saved THEN the Game System SHALL update the user's aggregate statistics including total games, total kills, total words typed, best score, and best WPM
5. WHEN saving a game score THEN the Game System SHALL include score, WPM, kills, misses, typos, gold earned, duration, wave reached, and game mode

### Requirement 2

**User Story:** As a player, I want accurate tracking of all my gameplay metrics during a game session, so that my performance is correctly recorded.

#### Acceptance Criteria

1. WHEN a game session starts THEN the Game System SHALL initialize a timestamp to track game duration
2. WHEN a player types a word correctly and kills an enemy THEN the Game System SHALL increment the words typed counter
3. WHEN a player types incorrectly THEN the Game System SHALL increment the typo counter
4. WHEN a player misses an enemy THEN the Game System SHALL increment the miss counter
5. WHEN a player earns gold during gameplay THEN the Game System SHALL accumulate the gold earned amount
6. WHEN a game session ends THEN the Game System SHALL calculate the total duration in seconds
7. WHEN a game session ends THEN the Game System SHALL pass all tracked metrics to the game over component

### Requirement 3

**User Story:** As a player, I want my duel match history to be recorded after settlement, so that I can review my past competitive games.

#### Acceptance Criteria

1. WHEN a duel settlement completes successfully THEN the Game System SHALL record the match to the duel matches table
2. WHEN recording a duel match THEN the Game System SHALL include both player addresses, scores, WPM values, winner address, stake amount, payout amount, and transaction hash
3. WHEN recording a duel match THEN the Game System SHALL include the settlement timestamp
4. WHEN a duel match is recorded THEN the Game System SHALL maintain the data permanently for history tracking
5. WHEN duel results are cleaned up after settlement THEN the Game System SHALL ensure the match history was recorded first

### Requirement 4

**User Story:** As a player, I want to purchase items from the shop using my earned gold, so that I can enhance my gameplay experience.

#### Acceptance Criteria

1. WHEN the shop system initializes THEN the Game System SHALL populate the shop items table with available items
2. WHEN populating shop items THEN the Game System SHALL include powerups with names, descriptions, gold prices, categories, and metadata
3. WHEN populating shop items THEN the Game System SHALL include cosmetic hero items with appropriate pricing
4. WHEN a player purchases an item THEN the Game System SHALL deduct the gold price from the user's gold balance
5. WHEN a player purchases an item THEN the Game System SHALL add the item to the user's inventory or increment quantity if already owned
6. WHEN a player equips an item THEN the Game System SHALL update the equipped status in the user inventory table

### Requirement 5

**User Story:** As a player, I want to unlock achievements based on my gameplay accomplishments, so that I feel rewarded for my progress.

#### Acceptance Criteria

1. WHEN the achievement system initializes THEN the Game System SHALL define achievement conditions for kills, WPM, games played, and duel wins
2. WHEN a game score is saved THEN the Game System SHALL check all achievement conditions against the user's updated statistics
3. WHEN an achievement condition is met for the first time THEN the Game System SHALL record the achievement unlock in the user achievements table
4. WHEN an achievement is unlocked THEN the Game System SHALL credit the gold reward to the user's gold balance
5. WHEN checking achievements THEN the Game System SHALL not award duplicate achievements already unlocked by the user

### Requirement 6

**User Story:** As a player, I want to see accurate leaderboards showing top players, so that I can compare my performance with others.

#### Acceptance Criteria

1. WHEN the leaderboard is requested THEN the Game System SHALL return users ranked by best score in descending order
2. WHEN the leaderboard is requested THEN the Game System SHALL exclude users with zero or null best scores
3. WHEN the leaderboard is requested with a category filter THEN the Game System SHALL rank users by the specified metric (best score, best WPM, total kills, duel wins)
4. WHEN the leaderboard is requested THEN the Game System SHALL include user wallet address, username, and the relevant ranking metric
5. WHEN the leaderboard is requested THEN the Game System SHALL support pagination with configurable page size

### Requirement 7

**User Story:** As a system administrator, I want the database schema to match the application requirements, so that all data can be stored correctly.

#### Acceptance Criteria

1. WHEN the database schema is deployed THEN the users table SHALL include columns for best score and best WPM
2. WHEN the database schema is deployed THEN the game scores table SHALL include columns for misses, typos, gold earned, duration seconds, is staked, stake amount, and payout amount
3. WHEN the database schema is deployed THEN the user inventory table SHALL include columns for item type and equipped status
4. WHEN the database schema is deployed THEN all tables SHALL have appropriate indexes for query performance
5. WHEN the database schema is deployed THEN all foreign key relationships SHALL be properly defined with cascade rules

### Requirement 8

**User Story:** As a player, I want my gold balance to be accurately tracked and updated, so that I can use my earnings in the shop.

#### Acceptance Criteria

1. WHEN a player earns gold during a game THEN the Game System SHALL accumulate the gold earned amount
2. WHEN a game score is saved THEN the Game System SHALL add the gold earned to the user's gold balance in the database
3. WHEN a player purchases a shop item THEN the Game System SHALL deduct the item price from the user's gold balance
4. WHEN a player unlocks an achievement THEN the Game System SHALL add the achievement reward to the user's gold balance
5. WHEN updating gold balance THEN the Game System SHALL use atomic database operations to prevent race conditions

### Requirement 9

**User Story:** As a developer, I want comprehensive API endpoints for all game data operations, so that the frontend can reliably save and retrieve data.

#### Acceptance Criteria

1. WHEN the API is deployed THEN the Game System SHALL provide an endpoint to save game scores with all metrics
2. WHEN the API is deployed THEN the Game System SHALL provide an endpoint to record duel match history
3. WHEN the API is deployed THEN the Game System SHALL provide an endpoint to check and award achievements
4. WHEN the API is deployed THEN the Game System SHALL provide an endpoint to retrieve user statistics
5. WHEN the API is deployed THEN the Game System SHALL provide an endpoint to retrieve game history with filtering and pagination
6. WHEN an API endpoint encounters an error THEN the Game System SHALL return appropriate HTTP status codes and error messages
7. WHEN an API endpoint processes a request THEN the Game System SHALL validate all input parameters before database operations

### Requirement 10

**User Story:** As a player, I want my user profile to display accurate statistics, so that I can see my overall performance.

#### Acceptance Criteria

1. WHEN a user profile is requested THEN the Game System SHALL return the user's total games, total kills, total words typed, best score, best WPM, and best streak
2. WHEN a user profile is requested THEN the Game System SHALL return the user's current gold balance
3. WHEN a user profile is requested THEN the Game System SHALL return the count of unlocked achievements
4. WHEN a user profile is requested THEN the Game System SHALL return the user's duel win count and duel loss count
5. WHEN a user profile is requested THEN the Game System SHALL calculate and return the user's leaderboard rank
