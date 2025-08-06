import { useState, useCallback } from 'react';
import { NotificationItem } from '@/components/UI/NotificationManager';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface UseNotificationsReturn {
  notifications: NotificationItem[];
  addNotification: (type: NotificationType, title: string, message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = useCallback((
    type: NotificationType, 
    title: string, 
    message: string, 
    duration: number = 5000
  ) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: NotificationItem = {
      id,
      type,
      title,
      message,
      duration,
    };

    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };
} 