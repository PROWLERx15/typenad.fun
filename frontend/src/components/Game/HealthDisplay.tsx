import React from 'react';
import { styles } from './HealthDisplay.styles';

interface HealthDisplayProps {
    health: number;
}

const HealthDisplay: React.FC<HealthDisplayProps> = ({ health }) => (
    <div style={styles.container}>
        {Array.from({ length: health }).map((_, index) => (
            <div key={index} style={styles.heart}></div>
        ))}
    </div>
);

export default HealthDisplay;
