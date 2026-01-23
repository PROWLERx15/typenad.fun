import React from 'react';
import { SCREEN_STYLES, BACKGROUNDS, FONTS, COLORS, mergeStyles } from '../../styles/theme';
import { styles } from './WaveComplete.styles';

interface WaveCompleteProps {
    waveNumber: number;
    nextWave?: number;
}

const WaveComplete: React.FC<WaveCompleteProps> = ({ waveNumber, nextWave }) => {
    return (
        <div style={mergeStyles(
            SCREEN_STYLES.fullScreen,
            SCREEN_STYLES.centered,
            SCREEN_STYLES.backgroundCover,
            styles.overlayContainer
        )}>
            <div style={styles.cardContainer}>
                <h1 style={styles.title}>
                    Wave {waveNumber} Complete!
                </h1>
                {nextWave && (
                    <div style={styles.nextWaveText}>
                        Preparing Wave {nextWave}...
                    </div>
                )}
            </div>
        </div>
    );
};

export default WaveComplete;
