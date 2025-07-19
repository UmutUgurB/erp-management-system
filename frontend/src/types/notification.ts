export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export type NotificationPosition = 
  | 'top-left'
  | 'top-center' 
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number; // milliseconds, 0 = persistent
  position?: NotificationPosition;
  dismissible?: boolean;
  actions?: NotificationAction[];
  icon?: React.ReactNode;
  timestamp: Date;
  persistent?: boolean;
  sound?: boolean;
  onDismiss?: () => void;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  
  // Quick methods
  success: (message: string, options?: Partial<Notification>) => string;
  error: (message: string, options?: Partial<Notification>) => string;
  warning: (message: string, options?: Partial<Notification>) => string;
  info: (message: string, options?: Partial<Notification>) => string;
  loading: (message: string, options?: Partial<Notification>) => string;
}

export interface NotificationSettings {
  defaultDuration: number;
  defaultPosition: NotificationPosition;
  maxNotifications: number;
  enableSounds: boolean;
  enableAnimations: boolean;
} 