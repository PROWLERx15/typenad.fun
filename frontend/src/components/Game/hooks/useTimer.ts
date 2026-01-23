import { useState, useEffect, useRef } from 'react';

const useTimer = (initialTime: number, onGameOver: () => void, restartSignal?: boolean) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const onGameOverRef = useRef(onGameOver);

    // Keep the ref up to date
    useEffect(() => {
        onGameOverRef.current = onGameOver;
    }, [onGameOver]);

    // Reset timer when game restarts
    useEffect(() => {
        setTimeLeft(initialTime);
    }, [restartSignal, initialTime]);

    // Timer interval - runs independently
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [restartSignal]); 

    // Separate effect to handle game over
    useEffect(() => {
        if (timeLeft === 0) {
            onGameOverRef.current();
        }
    }, [timeLeft]);

    return { timeLeft };
};

export default useTimer;
