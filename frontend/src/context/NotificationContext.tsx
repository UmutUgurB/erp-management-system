'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Notification } from '@/components/UI/NotificationSystem';

interface NotificationState {
  notifications: Notification[];
  settings: {
    soundEnabled: boolean;
    autoClose: boolean;
    defaultDuration: number;
    maxNotifications: number;
  };
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp' | 'read'> }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'DISMISS_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<NotificationState['settings']> }
  | { type: 'LOAD_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'REMOVE_EXPIRED_NOTIFICATIONS' };

const initialState: NotificationState = {
  notifications: [],
  settings: {
    soundEnabled: true,
    autoClose: true,
    defaultDuration: 5000,
    maxNotifications: 100,
  },
};

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      const newNotification: Notification = {
        ...action.payload,
        id: uuidv4(),
        timestamp: new Date(),
        read: false,
      };
      
      const updatedNotifications = [newNotification, ...state.notifications];
      
      // Keep only the latest notifications up to maxNotifications
      const limitedNotifications = updatedNotifications.slice(0, state.settings.maxNotifications);
      
      return {
        ...state,
        notifications: limitedNotifications,
      };

    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
      };

    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        ),
      };

    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'LOAD_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
      };

    case 'REMOVE_EXPIRED_NOTIFICATIONS':
      const now = new Date();
      const validNotifications = state.notifications.filter(notification => {
        if (!notification.duration) return true;
        const expirationTime = new Date(notification.timestamp.getTime() + notification.duration);
        return now < expirationTime;
      });
      
      return {
        ...state,
        notifications: validNotifications,
      };

    default:
      return state;
  }
};

interface NotificationContextType {
  state: NotificationState;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updateSettings: (settings: Partial<NotificationState['settings']>) => void;
  getUnreadCount: () => number;
  playNotificationSound: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return {
    notifications: context.state.notifications,
    success: (title: string, message?: string) => context.addNotification({ type: 'success', title, message }),
    error: (title: string, message?: string) => context.addNotification({ type: 'error', title, message }),
    warning: (title: string, message?: string) => context.addNotification({ type: 'warning', title, message }),
    info: (title: string, message?: string) => context.addNotification({ type: 'info', title, message }),
    showNotification: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => 
      context.addNotification({ type, title, message }),
    removeNotification: context.dismissNotification,
    clearAll: context.clearAllNotifications
  };
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem('erp-notifications');
      const savedSettings = localStorage.getItem('erp-notification-settings');
      
      if (savedNotifications) {
        const parsedNotifications = JSON.parse(savedNotifications).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        dispatch({ type: 'LOAD_NOTIFICATIONS', payload: parsedNotifications });
      }
      
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        dispatch({ type: 'UPDATE_SETTINGS', payload: parsedSettings });
      }
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('erp-notifications', JSON.stringify(state.notifications));
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
    }
  }, [state.notifications]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('erp-notification-settings', JSON.stringify(state.settings));
    } catch (error) {
      console.error('Error saving notification settings to localStorage:', error);
    }
  }, [state.settings]);

  // Clean up expired notifications every minute
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'REMOVE_EXPIRED_NOTIFICATIONS' });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    
    // Auto-close notification if enabled
    if (state.settings.autoClose && notification.duration !== 0) {
      const duration = notification.duration || state.settings.defaultDuration;
      setTimeout(() => {
        dispatch({ type: 'DISMISS_NOTIFICATION', payload: notification.id || '' });
      }, duration);
    }
  }, [state.settings.autoClose, state.settings.defaultDuration]);

  const markAsRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  }, []);

  const dismissNotification = useCallback((id: string) => {
    dispatch({ type: 'DISMISS_NOTIFICATION', payload: id });
  }, []);

  const clearAllNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  }, []);

  const updateSettings = useCallback((settings: Partial<NotificationState['settings']>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  const getUnreadCount = useCallback(() => {
    return state.notifications.filter(notification => !notification.read).length;
  }, [state.notifications]);

  const playNotificationSound = useCallback(() => {
    if (!state.settings.soundEnabled) return;
    
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, [state.settings.soundEnabled]);

  // Convenience methods for common notification types
  const addSuccessNotification = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    addNotification({
      type: 'success',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  const addErrorNotification = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    addNotification({
      type: 'error',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  const addWarningNotification = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    addNotification({
      type: 'warning',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  const addInfoNotification = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    addNotification({
      type: 'info',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  const value: NotificationContextType = {
    state,
    addNotification,
    markAsRead,
    dismissNotification,
    clearAllNotifications,
    updateSettings,
    getUnreadCount,
    playNotificationSound,
    // Convenience methods
    addSuccessNotification,
    addErrorNotification,
    addWarningNotification,
    addInfoNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 