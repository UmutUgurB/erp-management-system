'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  Notification, 
  NotificationContextType, 
  NotificationSettings,
  NotificationType 
} from '@/types/notification';

const defaultSettings: NotificationSettings = {
  defaultDuration: 5000,
  defaultPosition: 'top-right',
  maxNotifications: 5,
  enableSounds: false,
  enableAnimations: true,
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
  settings?: Partial<NotificationSettings>;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children, 
  settings: customSettings 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings] = useState<NotificationSettings>({ 
    ...defaultSettings, 
    ...customSettings 
  });

  // Generate unique ID
  const generateId = () => `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Play notification sound
  const playSound = useCallback((type: NotificationType) => {
    if (!settings.enableSounds) return;
    
    try {
      // Create audio context for different notification sounds
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different notification types
      const frequencies = {
        success: 800,
        error: 300,
        warning: 600,
        info: 500,
        loading: 400,
      };
      
      oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Fallback for browsers that don't support Web Audio API
      console.warn('Notification sounds not supported in this browser');
    }
  }, [settings.enableSounds]);

  // Add notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration ?? settings.defaultDuration,
      position: notification.position ?? settings.defaultPosition,
      dismissible: notification.dismissible ?? true,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Limit max notifications
      return updated.slice(0, settings.maxNotifications);
    });

    // Play sound
    if (notification.sound !== false) {
      playSound(notification.type);
    }

    // Auto dismiss
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, [settings, playSound]);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification?.onDismiss) {
        notification.onDismiss();
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Update notification
  const updateNotification = useCallback((id: string, updates: Partial<Notification>) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, ...updates }
          : notification
      )
    );
  }, []);

  // Quick methods
  const success = useCallback((message: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'success', message, ...options });
  }, [addNotification]);

  const error = useCallback((message: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'error', message, duration: 7000, ...options });
  }, [addNotification]);

  const warning = useCallback((message: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'warning', message, duration: 6000, ...options });
  }, [addNotification]);

  const info = useCallback((message: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'info', message, ...options });
  }, [addNotification]);

  const loading = useCallback((message: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'loading', message, duration: 0, ...options });
  }, [addNotification]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setNotifications([]);
    };
  }, []);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    updateNotification,
    success,
    error,
    warning,
    info,
    loading,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 