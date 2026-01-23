/**
 * Centralized enemy type constants
 * Maps enemy type names to numeric IDs (for future Monad chain storage)
 * 
 * SPACE THEME:
 * - scout: Basic enemy ship (was zombie)
 * - cruiser: Medium warship (was mummy)
 * - drone: Fast swarmer (was bat)
 * - mothership: 2-hit boss (was deathrider)
 * - asteroid: AoE explosion (was bomb)
 * - mech: Heavy robot (was frankenstein)
 * - interceptor: Fast attacker (was werewolf)
 * - dreadnought: 3-hit final boss (was dracula)
 */

export const ENEMY_TYPE_IDS = {
    scout: 1,
    cruiser: 2,
    drone: 3,
    mothership: 4,
    asteroid: 5,
    mech: 6,
    interceptor: 7,
    dreadnought: 8,
} as const;

export type EnemyTypeName = keyof typeof ENEMY_TYPE_IDS;

/**
 * Enemy type visual configuration
 */
interface EnemyTypeConfig {
    scale: number;
    topOffset: number;
    wordLabelOffset: number;
    speed: number;
}

export const ENEMY_TYPE_CONFIG: Record<EnemyTypeName, EnemyTypeConfig> = {
    scout: {
        scale: 0.15,
        topOffset: -8,
        wordLabelOffset: -4,
        speed: 1,
    },
    cruiser: {
        scale: 0.16,
        topOffset: -10,
        wordLabelOffset: -4,
        speed: 2,
    },
    drone: {
        scale: 0.16,
        topOffset: -12,
        wordLabelOffset: -4,
        speed: 4,
    },
    mothership: {
        scale: 0.264,
        topOffset: -60,
        wordLabelOffset: 0,
        speed: 1.5,
    },
    asteroid: {
        scale: 0.12,
        topOffset: 10,
        wordLabelOffset: -4,
        speed: 0,
    },
    mech: {
        scale: 0.16,
        topOffset: -10,
        wordLabelOffset: -4,
        speed: 2,
    },
    interceptor: {
        scale: 0.16,
        topOffset: -10,
        wordLabelOffset: -4,
        speed: 3,
    },
    dreadnought: {
        scale: 0.16,
        topOffset: -10,
        wordLabelOffset: -4,
        speed: 2,
    },
};

/**
 * Convert enemy type name to numeric ID for storage
 */
export function getEnemyTypeId(type: EnemyTypeName): number {
    return ENEMY_TYPE_IDS[type];
}

/**
 * Get enemy type configuration
 */
export function getEnemyConfig(type: EnemyTypeName): EnemyTypeConfig {
    return ENEMY_TYPE_CONFIG[type];
}

/**
 * Convert numeric ID back to enemy type name
 */
export function getEnemyTypeName(id: number): EnemyTypeName | null {
    const entry = Object.entries(ENEMY_TYPE_IDS).find(([_, value]) => value === id);
    return entry ? entry[0] as EnemyTypeName : null;
}
