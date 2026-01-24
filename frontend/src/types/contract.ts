/**
 * TypeNad Contract Type Definitions
 */

// Contract structs
export interface GameSession {
  player: `0x${string}`;
  stake: bigint;
  randomSeed: bigint;
  active: boolean;
  fulfilled: boolean;
}

export interface Duel {
  player1: `0x${string}`;
  player2: `0x${string}`;
  stake: bigint;
  randomSeed: bigint;
  active: boolean;
  fulfilled: boolean;
}

// Event types
export interface GameStartedEvent {
  sequenceNumber: bigint;
  player: `0x${string}`;
  stake: bigint;
}

export interface GameSeedFulfilledEvent {
  sequenceNumber: bigint;
  seed: bigint;
}

export interface GameSettledEvent {
  sequenceNumber: bigint;
  player: `0x${string}`;
  payout: bigint;
  misses: bigint;
  typos: bigint;
}

export interface DuelCreatedEvent {
  duelId: bigint;
  player1: `0x${string}`;
  stake: bigint;
}

export interface DuelJoinedEvent {
  duelId: bigint;
  player2: `0x${string}`;
}

export interface DuelSeedFulfilledEvent {
  duelId: bigint;
  seed: bigint;
}

export interface DuelSettledEvent {
  duelId: bigint;
  winner: `0x${string}`;
  payout: bigint;
}

// API types
export interface SettleGameRequest {
  sequenceNumber: string;
  misses: number;
  typos: number;
  bonusAmount: string;
  playerAddress: string;
}

export interface SettleGameResponse {
  success: boolean;
  signature?: `0x${string}`;
  error?: string;
  params?: SettleGameRequest;
}

export interface PlayerScore {
  address: string;
  score: number;
  misses: number;
  typos: number;
  wpm: number;
}

export interface SettleDuelRequest {
  duelId: string;
  player1: PlayerScore;
  player2: PlayerScore;
}

export interface SettleDuelResponse {
  success: boolean;
  winner?: string;
  signature?: `0x${string}`;
  error?: string;
  scores?: {
    player1: PlayerScore;
    player2: PlayerScore;
  };
}

// Game stats for tracking during gameplay
export interface StakedGameStats {
  score: number;
  misses: number;
  typos: number;
  wpm: number;
  wave: number;
  kills: number;
}

// Staked game state
export interface StakedGameState {
  isStaked: boolean;
  sequenceNumber: bigint | null;
  stake: bigint | null;
  randomSeed: bigint | null;
  seedFulfilled: boolean;
}

// Duel state
export interface DuelGameState {
  duelId: bigint | null;
  opponentAddress: `0x${string}` | null;
  stake: bigint | null;
  randomSeed: bigint | null;
  seedFulfilled: boolean;
  isPlayer1: boolean;
}

// Contract constants
export const CONTRACT_CONSTANTS = {
  PENALTY_AMOUNT: BigInt(100_000), // 0.1 USDC (6 decimals)
  FREE_MISSES: BigInt(10),
  PLATFORM_FEE_BPS: BigInt(1000), // 10%
  USDC_DECIMALS: 6,
} as const;

// Stake amount options (in USDC, human readable)
export const STAKE_OPTIONS = [1, 5, 10, 25] as const;
export type StakeOption = (typeof STAKE_OPTIONS)[number];

// Contract addresses from environment
export const CONTRACTS = {
  TYPE_NAD: '0xe2d8cDF98F611Df9D87861130B4C19Da45b4b455' as const,
  USDC: '0x534b2f3A21130d7a60830c2Df862319e593943A3' as const,
  ENTROPY: '0x36825bf3Fbdf5a29E2d5148bfe7Dcf7B5639e320' as const,
  VERIFIER: '0xd190944633a34CF679669FA2fA6204cfff4038B6' as const,
} as const;

// Chain configuration
export const MONAD_TESTNET = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    name: 'MONAD',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
    alchemy: {
      http: ['https://monad-testnet.g.alchemy.com/v2/LfKXerIDAvp3ToDzzjfD8'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MonadScan',
      url: 'https://testnet.monadexplorer.com',
    },
  },
} as const;
