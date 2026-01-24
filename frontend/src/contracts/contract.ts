export const TYPE_NAD_CONTRACT_ADDRESS = "0x5358064b20F0210FD1fe99f7453124E2C853149B";
export const TYPE_NAD_ABI = [
  {
    "type": "constructor",
    "inputs": [
      { "name": "_verifier", "type": "address", "internalType": "address" },
      { "name": "_usdc", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "CANCEL_FEE_BPS",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "FREE_MISSES",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "PENALTY_AMOUNT",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "PLATFORM_FEE_BPS",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "cancelDuel",
    "inputs": [
      { "name": "duelId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "cancelGame",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "createDuel",
    "inputs": [
      { "name": "stakeAmount", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      { "name": "duelId", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "duelCounter",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "duels",
    "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "outputs": [
      { "name": "player1", "type": "address", "internalType": "address" },
      { "name": "player2", "type": "address", "internalType": "address" },
      { "name": "stake", "type": "uint256", "internalType": "uint256" },
      { "name": "randomSeed", "type": "uint256", "internalType": "uint256" },
      { "name": "active", "type": "bool", "internalType": "bool" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "gameSessions",
    "inputs": [{ "name": "", "type": "uint64", "internalType": "uint64" }],
    "outputs": [
      { "name": "player", "type": "address", "internalType": "address" },
      { "name": "stake", "type": "uint256", "internalType": "uint256" },
      { "name": "randomSeed", "type": "uint256", "internalType": "uint256" },
      { "name": "active", "type": "bool", "internalType": "bool" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUSDC",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "joinDuel",
    "inputs": [
      { "name": "duelId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      { "name": "seed", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "playerActiveSession",
    "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "outputs": [{ "name": "", "type": "uint64", "internalType": "uint64" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setVerifier",
    "inputs": [
      { "name": "_verifier", "type": "address", "internalType": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "settleDuel",
    "inputs": [
      { "name": "duelId", "type": "uint256", "internalType": "uint256" },
      { "name": "winner", "type": "address", "internalType": "address" },
      { "name": "signature", "type": "bytes", "internalType": "bytes" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "settleGame",
    "inputs": [
      {
        "name": "sequenceNumber",
        "type": "uint64",
        "internalType": "uint64"
      },
      { "name": "misses", "type": "uint256", "internalType": "uint256" },
      { "name": "typos", "type": "uint256", "internalType": "uint256" },
      { "name": "bonusAmount", "type": "uint256", "internalType": "uint256" },
      { "name": "player", "type": "address", "internalType": "address" },
      { "name": "signature", "type": "bytes", "internalType": "bytes" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "startGame",
    "inputs": [
      { "name": "stakeAmount", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      {
        "name": "sequenceNumber",
        "type": "uint64",
        "internalType": "uint64"
      },
      { "name": "seed", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [
      { "name": "newOwner", "type": "address", "internalType": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "usdc",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "address", "internalType": "contract IERC20" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "verifier",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "withdrawFunds",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdrawMON",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "DuelCancelled",
    "inputs": [
      {
        "name": "duelId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "player1",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "refund",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "DuelCreated",
    "inputs": [
      {
        "name": "duelId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "player1",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "stake",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "DuelJoined",
    "inputs": [
      {
        "name": "duelId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "player2",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "seed",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "DuelSettled",
    "inputs": [
      {
        "name": "duelId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "winner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "payout",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "GameCancelled",
    "inputs": [
      {
        "name": "sequenceNumber",
        "type": "uint64",
        "indexed": true,
        "internalType": "uint64"
      },
      {
        "name": "player",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "refund",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "GameSettled",
    "inputs": [
      {
        "name": "sequenceNumber",
        "type": "uint64",
        "indexed": true,
        "internalType": "uint64"
      },
      {
        "name": "player",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "payout",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "misses",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "typos",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "GameStarted",
    "inputs": [
      {
        "name": "sequenceNumber",
        "type": "uint64",
        "indexed": true,
        "internalType": "uint64"
      },
      {
        "name": "player",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "stake",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "seed",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "CannotCancelStartedDuel",
    "inputs": [
      { "name": "duelId", "type": "uint256", "internalType": "uint256" }
    ]
  },
  {
    "type": "error",
    "name": "DuelAlreadySettled",
    "inputs": [
      { "name": "duelId", "type": "uint256", "internalType": "uint256" }
    ]
  },
  {
    "type": "error",
    "name": "DuelFull",
    "inputs": [
      { "name": "duelId", "type": "uint256", "internalType": "uint256" }
    ]
  },
  {
    "type": "error",
    "name": "DuelNotActive",
    "inputs": [
      { "name": "duelId", "type": "uint256", "internalType": "uint256" }
    ]
  },
  {
    "type": "error",
    "name": "DuelNotStarted",
    "inputs": [
      { "name": "duelId", "type": "uint256", "internalType": "uint256" }
    ]
  },
  { "type": "error", "name": "ECDSAInvalidSignature", "inputs": [] },
  {
    "type": "error",
    "name": "ECDSAInvalidSignatureLength",
    "inputs": [
      { "name": "length", "type": "uint256", "internalType": "uint256" }
    ]
  },
  {
    "type": "error",
    "name": "ECDSAInvalidSignatureS",
    "inputs": [{ "name": "s", "type": "bytes32", "internalType": "bytes32" }]
  },
  {
    "type": "error",
    "name": "GameAlreadyInProgress",
    "inputs": [
      { "name": "player", "type": "address", "internalType": "address" },
      { "name": "activeSession", "type": "uint64", "internalType": "uint64" }
    ]
  },
  {
    "type": "error",
    "name": "InvalidSignature",
    "inputs": [
      { "name": "recovered", "type": "address", "internalType": "address" },
      { "name": "expected", "type": "address", "internalType": "address" }
    ]
  },
  { "type": "error", "name": "NoFundsToWithdraw", "inputs": [] },
  {
    "type": "error",
    "name": "NotDuelCreator",
    "inputs": [
      { "name": "caller", "type": "address", "internalType": "address" },
      { "name": "creator", "type": "address", "internalType": "address" }
    ]
  },
  {
    "type": "error",
    "name": "NotPlayer",
    "inputs": [
      { "name": "caller", "type": "address", "internalType": "address" },
      { "name": "player", "type": "address", "internalType": "address" }
    ]
  },
  {
    "type": "error",
    "name": "OwnableInvalidOwner",
    "inputs": [
      { "name": "owner", "type": "address", "internalType": "address" }
    ]
  },
  {
    "type": "error",
    "name": "OwnableUnauthorizedAccount",
    "inputs": [
      { "name": "account", "type": "address", "internalType": "address" }
    ]
  },
  { "type": "error", "name": "ReentrancyGuardReentrantCall", "inputs": [] },
  {
    "type": "error",
    "name": "SafeERC20FailedOperation",
    "inputs": [
      { "name": "token", "type": "address", "internalType": "address" }
    ]
  },
  {
    "type": "error",
    "name": "SessionNotActive",
    "inputs": [
      { "name": "sequenceNumber", "type": "uint64", "internalType": "uint64" }
    ]
  },
  { "type": "error", "name": "StakeRequired", "inputs": [] },
  {
    "type": "error",
    "name": "TransferFailed",
    "inputs": [
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "amount", "type": "uint256", "internalType": "uint256" }
    ]
  },
  {
    "type": "error",
    "name": "WinnerNotParticipant",
    "inputs": [
      { "name": "duelId", "type": "uint256", "internalType": "uint256" },
      { "name": "winner", "type": "address", "internalType": "address" }
    ]
  }
] as const;