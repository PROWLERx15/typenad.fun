## 🎮 Project Overview

**TypeNad** is a blockchain-integrated typing game built on **Monad** that combines competitive gaming with cryptocurrency stakes. Players test their typing speed and accuracy while managing game mechanics powered by smart contracts and on-chain randomness.

### Core Concept
- **Solo & Multiplayer typing gameplay** with real-time competition
- **Stake-based gaming** - Players can stake USDC for potential profits
- **Provably fair randomness** using Pyth Entropy
- **NFT-like achievements** and leaderboard rankings
- **Web3 wallet integration** via Privy for seamless onboarding

### Target Users
- Competitive typists seeking financial incentives
- Crypto enthusiasts interested in gaming
- Casual players enjoying arcade-style challenges

---

## ✨ Features

### Game Modes

#### 1. **Story Mode** (Free-to-Play)
- Progressive difficulty through numbered waves
- Enemy spawning increases per wave
- Achievements unlocked during gameplay
- Gold currency rewards for progression
- No financial risk

#### 2. **Survival Mode** (Free-to-Play)
- Endless enemy waves with increasing difficulty
- Score tracking for leaderboard placement
- Optional achievement collection
- Perfect for skill improvement

#### 3. **Staked Game Mode** (PvE with Stakes)
- **Deposit USDC** to initiate a provably fair game
- **Free misses buffer**: First 10 misses are cost-free
- **Penalty system**: Each miss after 10 costs 0.1 USDC
- **Bonus rewards**: Calculated based on WPM and accuracy
- **Platform fee**: 10% on net winnings
- On-chain settlement via smart contract
- Refund mechanism with 5% cancellation fee

#### 4. **Duel Mode** (PvP with Stakes)
- **Two-player competitive typing**
- Player 1 creates duel with stake
- Player 2 joins matching the stake
- Real-time gameplay in parallel
- Winner takes majority of pooled stakes
- Smart contract escrow and settlement

### Player Progression

#### Gold System
- Earned through gameplay in Story/Survival modes
- Used for cosmetic purchases in shop
- Displayed on player profiles
- Accumulated across all game modes

#### Achievement System
- **50+ achievements** tracking various milestones
- Examples: "First 100 WPM", "Perfect Accuracy", "Wave 50 Reached"
- Unlock notifications after game completion
- Contribute to player portfolio/profile

#### Leaderboard Tiers
- **Global rankings** by total score
- **Category filters**: Best WPM, Highest Wave, Best Accuracy
- **Time-based rankings**: All-time, Monthly, Weekly
- **Duel-specific stats**: Win/Loss records

#### Shop System
- Purchase cosmetic items using gold
- Limited inventory with rotating items
- Equip items to personalize gameplay
- Item effects are visual only (no gameplay advantage)

### Player Hub 
Comprehensive player profile featuring:
- **Statistics Dashboard**: Total games, kills, words typed, best scores
- **Match History**: Recent game results with detailed stats
- **Achievement Gallery**: Unlocked badges and milestones
- **Duel Records**: Win/loss history
- **Leaderboard Position**: Current rank and percentile

---

## 🛠 Tech Stack

### Frontend
```
Framework:        Next.js 14 (React 18)
Language:         TypeScript
Styling:          CSS Modules + Inline Styles
State Management: React Hooks
Web3 Integration: Privy SDK, Viem
Database Client:  Supabase
UI Components:    Custom React Components
```

### Backend
```
Runtime:          Node.js
Framework:        Next.js API Routes
Database:         PostgreSQL (via Supabase)
Authentication:   Privy + JWT
Web3:             Viem for contract interaction
```

### Smart Contracts
```
Language:         Solidity ^0.8.20
Network:          Monad Testnet
Randomness:       Pyth Entropy V2
Token Standard:   ERC-20 (USDC)
Architecture:     ReentrancyGuard + Ownability
```

### Infrastructure
```
Hosting:          Vercel (Frontend)
Database:         Supabase (PostgreSQL)
RPC Provider:     Monad Testnet RPC
Wallet:           Privy (Web3 Authentication)
Monad Addr:       0x5358064b20F0210FD1fe99f7453124E2C853149B
```

---

## 🏗 Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  GameCanvas.tsx    │ SoloModeScreen.tsx  │  CryptScreen.tsx  │
│  (Gameplay Loop)   │ (Game Selection)    │  (Player Hub)     │
└──────────┬──────────────────────┬─────────────────┬──────────┘
           │                      │                 │
           ▼                      ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│              API Routes (Next.js Middleware)                 │
├─────────────────────────────────────────────────────────────┤
│  /api/score/save           /api/achievements/check           │
│  /api/settle-game          /api/duel/record                  │
│  /api/user/profile         /api/shop/purchase                │
│  /api/leaderboard          /api/execute-game-settlement      │
└──────────┬──────────────────────┬─────────────────┬──────────┘
           │                      │                 │
           ▼                      ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│            Database Layer (Supabase/PostgreSQL)              │
├─────────────────────────────────────────────────────────────┤
│  users │ game_scores │ achievements │ shop_items             │
│  duels │ leaderboard │ game_sessions                         │
└──────────┬──────────────────────┬─────────────────┬──────────┘
           │                      │                 │
           ▼                      ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│         Smart Contract Layer (Monad Testnet)                 │
├─────────────────────────────────────────────────────────────┤
│  TypeNad.sol                                                 │
│  ├─ startGame()        (Initiate stake)                      │
│  ├─ settleGame()       (Finalize with results)               │
│  ├─ createDuel()       (Create PvP match)                    │
│  ├─ joinDuel()         (Join existing duel)                  │
│  └─ settleDuel()       (Complete PvP settlement)             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow: Staked Game

```
1. Player Stakes USDC
   └─> useUSDC.ts ensures approval
   
2. Frontend calls startGame()
   └─> Smart Contract generates Entropy request
   
3. Pyth Entropy callback provides randomness
   └─> GameSession marked as fulfilled
   
4. Player completes game
   └─> GameOver component captures metrics
       (score, WPM, misses, typos, bonus)
   
5. Backend settles game
   └─> Validates signature
   └─> Calculates payout
   └─> Updates database
   └─> Executes contract settlement
   
6. Player receives refund/winnings
   └─> Transaction confirmed on-chain
```

---

## 🎯 Game Modes (Detailed)

### Story Mode Mechanics
- **Waves**: Incremental difficulty levels (1-9)
- **Enemy Spawning**: Increases per wave
- **Word Pool**: Curated word list for typing targets
- **Scoring**: Points per enemy = word length
- **Wave Progression**: Advance by defeating all enemies

### Staked Game Mechanics
- **Entry**: Player stakes USDC amount (1-25 USDC presets or custom)
- **Randomness**: Fair seed from Entropy contract
- **Gameplay**: 
  - 10 free misses included
  - Misses 11+ cost 0.1 USDC each
- **Calculation**:
  ```
  Base Payout = Stake + Bonus - Penalties - Fee
  
  Where:
    Bonus = (WPM / 100) * (Accuracy %) * Stake
    Penalties = (Misses - 10) * 0.1 USDC (if > 10)
    Fee = 10% of (Bonus - Penalties) if profitable
  ```
- **Settlement**: On-chain signature verification + payout execution

### Duel Mode Mechanics
1. **Creation**: Player 1 stakes USDC
2. **Joining**: Player 2 deposits matching amount (held in escrow)
3. **Gameplay**: Both play simultaneously (independent games)
4. **Scoring**: Highest WPM + accuracy wins
5. **Payout**:
   ```
   Total Pool = Stake × 2
   Winner Gets = (Total Pool × 0.9) - Refund Fee
   Loser Forfeits = Stake - Refund Option
   ```
6. **Recovery**: Pending matches can be cancelled with refund

---

### Testing Gameplay

1. **Connect Wallet**: Use Privy to connect via Google
2. **Play Story Mode**: Earn gold and unlock achievements
3. **Try Staked Game**: Deposit test USDC to compete against your own self
4. **Create Duel**: Challenge another player with stakes
5. **Check Profile**: View stats, achievements, and rankings


---

## 📊 Key Metrics & Analytics

### Player Statistics Tracked
- Total games played
- Total words typed
- Best WPM (Words Per Minute)
- Best accuracy percentage
- Total gold earned
- Wave progression
- Achievement completion rate
- Duel win/loss ratio
- Leaderboard position

### Financial Metrics
- Total USDC staked
- Total payouts distributed
- Platform fees collected
- Average game stake
- Bonus distribution statistics

---