'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Notification } from '@/types/notification';
import { useNotification } from '@/context/NotificationContext';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
  Clock,
} from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { removeNotification } = useNotification();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const itemRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef({ startX: 0, dragging: false });

  // Animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Progress bar for auto-dismiss
  useEffect(() => {
    if (notification.duration > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (notification.duration / 100));
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [notification.duration]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      removeNotification(notification.id);
    }, 300);
  };

  // Drag to dismiss (horizontal)
  useEffect(() => {
    const el = itemRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      dragState.current = { startX: e.clientX, dragging: true };
      el.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragState.current.dragging) return;
      const dx = e.clientX - dragState.current.startX;
      el.style.transform = `translateX(${dx}px)`;
      el.style.opacity = String(Math.max(0, 1 - Math.abs(dx) / 200));
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!dragState.current.dragging) return;
      const dx = e.clientX - dragState.current.startX;
      dragState.current.dragging = false;
      el.releasePointerCapture(e.pointerId);
      if (Math.abs(dx) > 120) {
        handleDismiss();
      } else {
        el.style.transform = '';
        el.style.opacity = '';
      }
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
    };
  }, []);

  const getIcon = () => {
    const iconProps = { className: "h-5 w-5" };
    
    if (notification.icon) {
      return notification.icon;
    }

    switch (notification.type) {
      case 'success':
        return <CheckCircle {...iconProps} className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle {...iconProps} className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info {...iconProps} className="h-5 w-5 text-blue-500" />;
      case 'loading':
        return <Loader2 {...iconProps} className="h-5 w-5 text-gray-500 animate-spin" />;
      default:
        return <Info {...iconProps} className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStyles = () => {
    const baseStyles = "relative overflow-hidden rounded-xl p-4 shadow-lg border-l-4 bg-white/80 dark:bg-gray-800/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border border-white/60 dark:border-white/10";
    
    switch (notification.type) {
      case 'success':
        return `${baseStyles} border-l-green-500`;
      case 'error':
        return `${baseStyles} border-l-red-500`;
      case 'warning':
        return `${baseStyles} border-l-yellow-500`;
      case 'info':
        return `${baseStyles} border-l-blue-500`;
      case 'loading':
        return `${baseStyles} border-l-gray-500`;
      default:
        return `${baseStyles} border-l-gray-400`;
    }
  };

  const getProgressBarColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      case 'loading':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getActionButtonStyles = (style?: 'primary' | 'secondary' | 'danger') => {
    const baseStyles = "px-3 py-1 text-xs font-medium rounded-md transition-colors";
    
    switch (style) {
      case 'primary':
        return `${baseStyles} bg-indigo-600 text-white hover:bg-indigo-700`;
      case 'danger':
        return `${baseStyles} bg-red-600 text-white hover:bg-red-700`;
      case 'secondary':
      default:
        return `${baseStyles} bg-gray-200 text-gray-800 hover:bg-gray-300`;
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      }`}
      ref={itemRef}
    >
      <div className={getStyles()}>
        {/* Progress bar */}
        {notification.duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div
              className={`h-full transition-all duration-100 ease-linear ${getProgressBarColor()}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className="flex-shrink-0 pt-0.5">
            {getIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {notification.title && (
              <p className="text-sm font-medium text-gray-900 mb-1">
                {notification.title}
              </p>
            )}
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-5">
              {notification.message}
            </p>

            {/* Actions */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="mt-3 flex space-x-2">
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={getActionButtonStyles(action.style)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Timestamp */}
            <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3 mr-1" />
              <span>{notification.timestamp.toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</span>
            </div>
          </div>

          {/* Dismiss button */}
          {notification.dismissible && (
            <div className="flex-shrink-0">
              <button
                onClick={handleDismiss}
                className="inline-flex rounded-md p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition-colors"
                aria-label="Bildirimi kapat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 