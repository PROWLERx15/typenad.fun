export const GOLD_REWARDS = {
  scout: 10,
  cruiser: 15,
  drone: 20,
  mech: 30,
  interceptor: 35,
  mothership: 50,
  asteroid: 5,
  dreadnought: 100,
} as const;

export type EnemyType = keyof typeof GOLD_REWARDS;

export const calculateGoldReward = (enemyType: EnemyType, wave: number): number => {
  const baseGold = GOLD_REWARDS[enemyType];
  const waveMultiplier = 1 + wave * 0.1;
  return Math.floor(baseGold * waveMultiplier);
};
