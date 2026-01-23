interface EnemyBase {
    id: number;
    word: string;
    position: number;
    left: number;
    health: number;
    spawnTime: number;
    speed: number;
    /** Indicates if spawned from remote PVP message */
    remote?: boolean;
    /** Indicates if the enemy is in dying/dissolving animation */
    dying?: boolean;
    /** Indicates if the enemy is exploding (used by asteroids) */
    exploding?: boolean;
}

export interface Scout extends EnemyBase {
    type: 'scout';
}

export interface Cruiser extends EnemyBase {
    type: 'cruiser';
}

export interface Drone extends EnemyBase {
    type: 'drone';
}

export interface Mothership extends EnemyBase {
    type: 'mothership';
    livesRemaining: number;
}

export interface Asteroid extends EnemyBase {
    type: 'asteroid';
    expiryTime: number;
}

export interface Mech extends EnemyBase {
    type: 'mech';
}

export interface Interceptor extends EnemyBase {
    type: 'interceptor';
}

export interface Dreadnought extends EnemyBase {
    type: 'dreadnought';
    livesRemaining: number;
}

export type Enemy = Scout | Cruiser | Drone | Mothership | Asteroid | Mech | Interceptor | Dreadnought;
