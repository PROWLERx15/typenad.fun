import React, { useState, useEffect, useRef } from 'react';

interface HeroProps {
    show: boolean;
    isTyping: boolean;
    position?: 'left' | 'right';
    heroNumber?: 1 | 2;
}

const Hero: React.FC<HeroProps> = ({ show, isTyping, position = 'left', heroNumber = 1 }) => {
    const [frame, setFrame] = useState(0);
    const [bottomPosition, setBottomPosition] = useState(-300);
    const [hasEntered, setHasEntered] = useState(false);
    const animationRef = useRef<NodeJS.Timeout | null>(null);
    const frameCountRef = useRef(0);

    useEffect(() => {
        if (show && !hasEntered) {
            setBottomPosition(-300);
            setFrame(0);

            const moveInterval = setInterval(() => {
                setBottomPosition((prev) => {
                    if (prev >= 15) {
                        clearInterval(moveInterval);
                        setHasEntered(true);
                        return 15;
                    }
                    return prev + 10;
                });
            }, 25);

            return () => clearInterval(moveInterval);
        } else if (!show) {
            setHasEntered(false);
            setBottomPosition(-300);
        }
    }, [show, hasEntered]);

    useEffect(() => {
        if (!isTyping || !hasEntered) return;

        if (animationRef.current) {
            clearTimeout(animationRef.current);
            animationRef.current = null;
        }

        frameCountRef.current = 0;
        setFrame(0);

        const animateFrame = () => {
            frameCountRef.current++;
            if (frameCountRef.current <= 3) {
                setFrame(frameCountRef.current);
                animationRef.current = setTimeout(animateFrame, 80);
            } else {
                setFrame(0);
                animationRef.current = null;
            }
        };

        animationRef.current = setTimeout(animateFrame, 80);

        return () => {
            if (animationRef.current) {
                clearTimeout(animationRef.current);
                animationRef.current = null;
            }
            setFrame(0);
        };
    }, [isTyping, hasEntered]);

    if (!show) return null;

    const frameX = (frame % 2) * 208;
    const frameY = Math.floor(frame / 2) * 303;

    const horizontalPosition = position === 'right' ? '75%' : '25%';
    const horizontalOffset = heroNumber === 2 ? 30 : 0;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: `${bottomPosition}px`,
                left: `calc(${horizontalPosition} + ${horizontalOffset}px)`,
                transform: 'translateX(-50%)',
                width: '150px',
                height: '218px',
                zIndex: 101,
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(/images/hero-${heroNumber}-sprite.png)`,
                    backgroundSize: '300px 436px',
                    backgroundPosition: `-${frameX * (150/208)}px -${frameY * (218/303)}px`,
                    imageRendering: 'pixelated',
                }}
            />
        </div>
    );
};

export default Hero;
