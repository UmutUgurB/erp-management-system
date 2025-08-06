'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose?: (id: string) => void;
}

const notificationConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50 border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-600',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50 border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-600',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50 border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-600',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-600',
  },
};

export default function Notification({ id, type, title, message, duration = 5000, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const config = notificationConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(id), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(id), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          className={`relative max-w-sm w-full ${config.bgColor} border rounded-lg shadow-lg p-4`}
        >
          <div className="flex items-start space-x-3">
            <Icon className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-medium ${config.textColor}`}>
                {title}
              </h4>
              <p className={`text-sm ${config.textColor} opacity-90 mt-1`}>
                {message}
              </p>
            </div>
            <button
              onClick={handleClose}
              className={`flex-shrink-0 ${config.textColor} hover:opacity-70 transition-opacity`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Progress bar */}
          {duration > 0 && (
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
              className={`absolute bottom-0 left-0 h-1 ${config.iconColor.replace('text-', 'bg-')} rounded-b-lg`}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 