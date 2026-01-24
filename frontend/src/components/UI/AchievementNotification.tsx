'use client';

import React, { useEffect, useState } from 'react';

interface AchievementNotificationProps {
  achievement: {
    id: string;
    name: string;
    icon: string;
    goldReward: number;
  };
  onDismiss: () => void;
  index: number;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onDismiss,
  index,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Entrance animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);

    // Auto-dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  return (
    <div
      onClick={handleDismiss}
      style={{
        position: 'fixed',
        top: `${100 + index * 120}px`,
        right: isVisible && !isExiting ? '20px' : '-400px',
        width: '350px',
        background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 184, 255, 0.15))',
        border: '2px solid #00FF88',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        cursor: 'pointer',
        zIndex: 2000 + index,
        transition: 'right 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        boxShadow: '0 8px 32px rgba(0, 255, 136, 0.3)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Icon */}
      <div
        style={{
          fontSize: '48px',
          flexShrink: 0,
          animation: 'bounce 0.6s ease-in-out',
        }}
      >
        {achievement.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#00FF88',
            marginBottom: '8px',
            textTransform: 'uppercase',
          }}
        >
          Achievement Unlocked!
        </div>
        <div
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#FFFFFF',
            marginBottom: '8px',
            lineHeight: '1.4',
          }}
        >
          {achievement.name}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '11px',
            color: '#FFD700',
          }}
        >
          <img
            src="/images/gold-coin.png"
            alt="Gold"
            style={{ width: '20px', height: '20px' }}
          />
          <span>+{achievement.goldReward}</span>
        </div>
      </div>

      {/* Close button */}
      <div
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '16px',
          color: '#00FF88',
          opacity: 0.7,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
      >
        ✕
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};

export default AchievementNotification;
