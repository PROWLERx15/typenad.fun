import React, { useEffect, useState } from 'react';
import { Enemy as EnemyType, Asteroid } from './types';
import { styles, explosionKeyframes } from './Enemy.styles';
import { getEnemyConfig } from '../../constants/enemyTypes';

interface EnemyProps {
    enemy: EnemyType;
    isAttacked: boolean;
}

const FRAME_COUNT = 6;
const SPRITE_COLS = 3;
const SPRITE_ROWS = 2;
const SPRITE_WIDTH = 1024;
const SPRITE_HEIGHT = 1024;
const ENEMY_WIDTH = SPRITE_WIDTH / SPRITE_COLS;
const ENEMY_HEIGHT = SPRITE_HEIGHT / SPRITE_ROWS;
const DISPLAY_WIDTH = Math.round(128 / 3);
const DISPLAY_HEIGHT = Math.round(192 / 3);

const Enemy: React.FC<EnemyProps> = ({ enemy, isAttacked }) => {
    const [frame, setFrame] = useState(0);
    const [flash, setFlash] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setFrame((prev) => (prev + 1) % FRAME_COUNT);
        }, 250);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isAttacked) {
            setFlash(true);
            const timer = setTimeout(() => setFlash(false), 100);
            return () => clearTimeout(timer);
        } else {
            setFlash(false);
        }
    }, [enemy.health, isAttacked]);

    const col = frame % SPRITE_COLS;
    const row = Math.floor(frame / SPRITE_COLS);
    const bgX = -col * (SPRITE_WIDTH / SPRITE_COLS);
    const bgY = -row * (SPRITE_HEIGHT / SPRITE_ROWS);

    const config = getEnemyConfig(enemy.type);

    const isAsteroid = enemy.type === 'asteroid';
    const isExploding = isAsteroid && 'exploding' in enemy && enemy.exploding;

    // Map enemy types to sprite images (using placeholder sprite path)
    // For now, all enemy types will use a generic sprite until assets are added
    const getSpriteImage = () => {
        if (enemy.type === 'mothership' && 'livesRemaining' in enemy && enemy.livesRemaining === 1) {
            return `/images/mothership-damaged.png`;
        }
        return `/images/${enemy.type}.png`;
    };

    return (
        <>
            <style>{explosionKeyframes}</style>
            <div style={styles.container(enemy)}>

                {!isAsteroid && isAttacked && !enemy.dying && (
                    <div style={styles.healthBarContainer(enemy.type)}>
                        <div style={styles.healthBarFill(enemy.health)} />
                    </div>
                )}
                {!isExploding && (
                    <div style={styles.spriteContainer}>
                        <div style={styles.sprite(
                            getSpriteImage(),
                            bgX,
                            bgY,
                            config.scale,
                            config.topOffset,
                            enemy.dying,
                            flash
                        )} />
                    </div>
                )}
                {!enemy.dying && !isExploding && (() => {
                    const isTwoLine = enemy.word.includes(' ') || enemy.word.length > 9;
                    return (
                        <div style={styles.wordLabel(enemy.remote, isTwoLine, config.wordLabelOffset)}>
                            {enemy.word}
                        </div>
                    );
                })()}

                {isExploding && (
                    <div style={styles.explosion} />
                )}

            </div>
        </>
    );
};

export default Enemy;
