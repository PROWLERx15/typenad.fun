import React from 'react';
import { SCREEN_STYLES, BACKGROUNDS, BUTTON_STYLES, FONTS, COLORS, mergeStyles } from '../../styles/theme';
import { styles } from './WaveVictory.styles';

interface WaveVictoryProps {
    onReturnHome: () => void;
}

const WaveVictory: React.FC<WaveVictoryProps> = ({ onReturnHome }) => {
    const mouseOverRef = React.useRef<HTMLAudioElement>(null);

    const handleMouseEnter = () => {
        const audio = mouseOverRef.current;
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => { });
        }
    };

    const handleMouseLeave = () => {
        const audio = mouseOverRef.current;
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    };

    return (
        <>
            <audio ref={mouseOverRef} src="/sounds/mouse-over.mp3" preload="auto" />
            <div style={mergeStyles(
                SCREEN_STYLES.fullScreen,
                SCREEN_STYLES.centered,
                SCREEN_STYLES.backgroundCover,
                styles.overlayContainer
            )}>
                <div style={styles.cardContainer}>
                    <h1 style={styles.title}>
                        You Survived... For Now
                    </h1>
                    <div style={styles.description}>
                        The horde has been pushed back, but the dead never rest.
                        <br />
                        More waves are rising from the crypt...
                    </div>
                    <button
                        onClick={onReturnHome}
                        onMouseEnter={(e) => {
                            handleMouseEnter();
                            e.currentTarget.style.background = 'rgba(255,215,0,0.3)';
                            e.currentTarget.style.borderColor = COLORS.primary;
                        }}
                        onMouseLeave={(e) => {
                            handleMouseLeave();
                            e.currentTarget.style.background = 'rgba(255,215,0,0.2)';
                            e.currentTarget.style.borderColor = 'rgba(255,215,0,0.5)';
                        }}
                        style={styles.button}
                    >
                        Return to Safety
                    </button>
                </div>
            </div>
        </>
    );
};

export default WaveVictory;
