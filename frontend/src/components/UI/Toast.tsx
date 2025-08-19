'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Bell,
  Star,
  Zap,
  AlertTriangle
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'celebration';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast
    };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      if (updated.length > maxToasts) {
        return updated.slice(0, maxToasts);
      }
      return updated;
    });

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          icon: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />,
          iconBg: 'bg-green-100 dark:bg-green-800/40'
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
          iconBg: 'bg-red-100 dark:bg-red-800/40'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
          iconBg: 'bg-yellow-100 dark:bg-yellow-800/40'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
          iconBg: 'bg-blue-100 dark:bg-blue-800/40'
        };
      case 'celebration':
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          border: 'border-purple-200 dark:border-purple-800',
          icon: <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
          iconBg: 'bg-purple-100 dark:bg-purple-800/40'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          icon: <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />,
          iconBg: 'bg-gray-100 dark:bg-gray-800/40'
        };
    }
  };

  const styles = getToastStyles();

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`max-w-sm w-full ${styles.bg} ${styles.border} border rounded-lg shadow-lg overflow-hidden`}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 p-2 rounded-full ${styles.iconBg}`}>
            {toast.icon || styles.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {toast.title}
                </p>
                {toast.message && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {toast.message}
                  </p>
                )}
              </div>
              
              <button
                onClick={() => onRemove(toast.id)}
                className="flex-shrink-0 ml-3 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {toast.action && (
              <div className="mt-3">
                <button
                  onClick={toast.action.onClick}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          className="h-1 bg-gray-200 dark:bg-gray-700"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  );
}

// Convenience functions for different toast types
export function useToastHelpers() {
  const { addToast } = useToast();

  return {
    success: (title: string, message?: string, options?: Partial<Toast>) => {
      addToast({ type: 'success', title, message, ...options });
    },
    error: (title: string, message?: string, options?: Partial<Toast>) => {
      addToast({ type: 'error', title, message, ...options });
    },
    warning: (title: string, message?: string, options?: Partial<Toast>) => {
      addToast({ type: 'warning', title, message, ...options });
    },
    info: (title: string, message?: string, options?: Partial<Toast>) => {
      addToast({ type: 'info', title, message, ...options });
    },
    celebration: (title: string, message?: string, options?: Partial<Toast>) => {
      addToast({ type: 'celebration', title, message, ...options });
    }
  };
}

// Specialized toast components
export function SuccessToast({ title, message, ...props }: Omit<Toast, 'type'>) {
  const { success } = useToastHelpers();
  return success(title, message, props);
}

export function ErrorToast({ title, message, ...props }: Omit<Toast, 'type'>) {
  const { error } = useToastHelpers();
  return error(title, message, props);
}

export function WarningToast({ title, message, ...props }: Omit<Toast, 'type'>) {
  const { warning } = useToastHelpers();
  return warning(title, message, props);
}

export function InfoToast({ title, message, ...props }: Omit<Toast, 'type'>) {
  const { info } = useToastHelpers();
  return info(title, message, props);
}

export function CelebrationToast({ title, message, ...props }: Omit<Toast, 'type'>) {
  const { celebration } = useToastHelpers();
  return celebration(title, message, props);
}
