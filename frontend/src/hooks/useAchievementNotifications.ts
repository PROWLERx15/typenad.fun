import { useState, useCallback } from 'react';

export interface AchievementNotification {
  id: string;
  achievementId: string;
  name: string;
  icon: string;
  goldReward: number;
  timestamp: number;
}

export const useAchievementNotifications = () => {
  const [notifications, setNotifications] = useState<AchievementNotification[]>([]);

  const addNotification = useCallback((achievement: {
    achievementId: string;
    name: string;
    goldReward: number;
  }) => {
    const notification: AchievementNotification = {
      id: `${achievement.achievementId}-${Date.now()}`,
      achievementId: achievement.achievementId,
      name: achievement.name,
      icon: getAchievementIcon(achievement.achievementId),
      goldReward: achievement.goldReward,
      timestamp: Date.now(),
    };

    setNotifications((prev) => [...prev, notification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
};

// Helper function to get achievement icon
function getAchievementIcon(achievementId: string): string {
  const iconMap: Record<string, string> = {
    'wave-1': '/images/badges/StarCadet_w1.png',
    'wave-3': '/images/badges/OrbitGuardian_w3.png',
    'wave-5': '/images/badges/DeepSpaceRanger_w5.png',
    'wave-9': '/images/badges/GalaticOverload_w9.png',
    'wpm-50': '/images/badges/LaserPrecision_50wpm.png',
    'wpm-70': '/images/badges/PlasmaBurst_70wpm.png',
    'wpm-90': '/images/badges/RailgunVelocity_90wpm.png',
    'wpm-130': '/images/badges/GodspeedSingularity_130+wpm.png',
    'perfect-accuracy': '/images/badges/100%accuracy.png',
    'zero-backspace': '/images/badges/zero_backspace.png',
  };

  return iconMap[achievementId] || '🏆';
}
