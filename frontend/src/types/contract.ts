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
  TYPE_NAD: (process.env.NEXT_PUBLIC_TYPE_NAD_CONTRACT_ADDRESS || '') as `0x${string}`,
  USDC: (process.env.NEXT_PUBLIC_USDC_ADDRESS || '') as `0x${string}`,
  ENTROPY: (process.env.NEXT_PUBLIC_ENTROPY_ADDRESS || '') as `0x${string}`,
  VERIFIER: (process.env.VERIFIER_ADDRESS || '') as `0x${string}`,
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
      http: [process.env.NEXT_PUBLIC_MONAD_RPC_TESTNET || 'https://testnet-rpc.monad.xyz'],
    },
    alchemy: {
      http: [process.env.NEXT_PUBLIC_MONAD_RPC_TESTNET || 'https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MonadScan',
      url: 'https://testnet.monadexplorer.com',
    },
  },
} as const;
