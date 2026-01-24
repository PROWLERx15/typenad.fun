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
    'first-kill': '🎯',
    'killer-10': '💀',
    'killer-50': '☠️',
    'killer-100': '👹',
    'killer-500': '👺',
    'killer-1000': '🔥',
    'speed-demon-50': '⚡',
    'speed-demon-75': '⚡⚡',
    'speed-demon-100': '⚡⚡⚡',
    'speed-demon-125': '🚀',
    'speed-demon-150': '🚀🚀',
    'survivor-5': '🛡️',
    'survivor-10': '🛡️🛡️',
    'survivor-20': '🏰',
    'veteran-10': '🎖️',
    'veteran-50': '🎖️🎖️',
    'veteran-100': '🏅',
    'veteran-500': '🏆',
    'duel-winner': '⚔️',
    'duel-champion-5': '⚔️⚔️',
    'duel-champion-10': '👑',
    'duel-master-25': '👑👑',
    'perfectionist': '💎',
    'word-master-1000': '📝',
    'word-master-5000': '📚',
    'word-master-10000': '📖',
    'gold-rush-1000': '💰',
    'gold-rush-5000': '💰💰',
    'gold-rush-10000': '💎💎',
  };

  return iconMap[achievementId] || '🏆';
}
