# Requirements Document

## Introduction

This specification addresses a critical UX issue in the duel settlement flow where players are incorrectly prompted for wallet approval when receiving their winnings. Currently, the settlement transaction is initiated from the player's wallet, causing unnecessary approval prompts. The solution is to move settlement execution to a backend service that uses the admin/verifier wallet, eliminating player interaction during payout.

## Glossary

- **Duel**: A PvP game mode where two players compete by staking USDC
- **Settlement**: The process of determining the winner and distributing the prize pool after a duel completes
- **Verifier Wallet**: The backend-controlled wallet that signs settlement messages and can execute transactions
- **Player Wallet**: The user's wallet used for staking USDC at the start of a duel
- **Frontend**: The Next.js application running in the user's browser
- **Backend API**: The Next.js API routes running on the server
- **Smart Contract**: The TypeNad2 Solidity contract deployed on Monad testnet
- **Settlement Transaction**: The blockchain transaction that calls `settleDuel()` on the smart contract

## Requirements

### Requirement 1

**User Story:** As a player, I want to receive my winnings automatically after a duel ends, so that I don't need to approve any transactions to claim my prize.

#### Acceptance Criteria

1. WHEN both players complete a duel THEN the system SHALL automatically settle the duel without requiring wallet approval from either player
2. WHEN the settlement transaction is executed THEN the system SHALL use the backend verifier wallet to pay gas fees
3. WHEN a player wins a duel THEN the system SHALL transfer USDC directly to the winner's wallet without player interaction
4. WHEN settlement is in progress THEN the frontend SHALL display the settlement status to both players
5. WHEN settlement completes THEN the frontend SHALL show the final results and payout amount to both players

### Requirement 2

**User Story:** As a backend service, I want to automatically detect when duels are ready for settlement, so that I can execute settlements without manual intervention.

#### Acceptance Criteria

1. WHEN both players submit their results to the database THEN the backend SHALL detect that the duel is ready for settlement
2. WHEN a duel is ready for settlement THEN the backend SHALL determine the winner using the established scoring rules
3. WHEN the winner is determined THEN the backend SHALL generate a cryptographic signature for the settlement
4. WHEN the signature is generated THEN the backend SHALL execute the settlement transaction using the verifier wallet
5. WHEN the settlement transaction is submitted THEN the backend SHALL wait for blockchain confirmation

### Requirement 3

**User Story:** As a player, I want to see real-time updates during settlement, so that I know the status of my winnings.

#### Acceptance Criteria

1. WHEN a player finishes a duel THEN the frontend SHALL display a waiting state until the opponent finishes
2. WHEN both players finish THEN the frontend SHALL display a "settling" status
3. WHEN the settlement transaction is confirmed THEN the frontend SHALL update to show the winner and payout
4. WHEN settlement fails THEN the frontend SHALL display an error message with retry options
5. WHEN checking settlement status THEN the frontend SHALL poll the backend API or listen to real-time updates

### Requirement 4

**User Story:** As a system administrator, I want settlement transactions to handle race conditions gracefully, so that duplicate settlements don't cause errors.

#### Acceptance Criteria

1. WHEN multiple settlement requests occur for the same duel THEN the system SHALL ensure only one settlement transaction succeeds
2. WHEN a settlement transaction is already in progress THEN subsequent settlement attempts SHALL detect the existing transaction
3. WHEN a duel is already settled on-chain THEN the system SHALL retrieve the existing settlement result
4. WHEN checking if a duel is settled THEN the system SHALL query both the database and blockchain state
5. WHEN a race condition is detected THEN the system SHALL return the correct settlement result without error

### Requirement 5

**User Story:** As a developer, I want comprehensive error handling for settlement failures, so that players receive appropriate feedback and can retry if needed.

#### Acceptance Criteria

1. WHEN a settlement transaction fails THEN the system SHALL log the error with full context
2. WHEN a blockchain error occurs THEN the system SHALL distinguish between temporary and permanent failures
3. WHEN a temporary failure occurs THEN the system SHALL automatically retry the settlement
4. WHEN a permanent failure occurs THEN the system SHALL notify the players and provide manual resolution options
5. WHEN settlement errors occur THEN the system SHALL preserve the duel results in the database for manual review

### Requirement 6

**User Story:** As a backend service, I want to monitor settlement transactions, so that I can ensure all duels are settled correctly and track gas costs.

#### Acceptance Criteria

1. WHEN a settlement transaction is submitted THEN the system SHALL log the transaction hash and duel details
2. WHEN a settlement transaction is confirmed THEN the system SHALL log the gas used and final status
3. WHEN settlement transactions fail THEN the system SHALL log the failure reason and error details
4. WHEN querying settlement history THEN the system SHALL provide transaction hashes for verification
5. WHEN monitoring gas costs THEN the system SHALL track cumulative gas spent on settlements
