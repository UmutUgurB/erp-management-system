import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  AlertTriangle,
  Clock,
  User,
  Bell,
  Settings,
  Volume2,
  VolumeX,
  Play,
  Pause
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';

interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  position?: ToastPosition;
  actions?: ToastAction[];
  onClose?: () => void;
  onAction?: (action: ToastAction) => void;
  persistent?: boolean;
  priority?: 'low' | 'normal' | 'high';
  category?: string;
  timestamp?: Date;
  user?: string;
  showProgress?: boolean;
  autoClose?: boolean;
}

interface SmartToastSystemProps {
  position?: ToastPosition;
  maxToasts?: number;
  autoClose?: boolean;
  defaultDuration?: number;
  enableSound?: boolean;
  enableVibration?: boolean;
  className?: string;
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Clock
};

const toastColors = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-white',
  info: 'bg-blue-500 text-white',
  loading: 'bg-purple-500 text-white'
};

const toastBgColors = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-yellow-50 border-yellow-200',
  info: 'bg-blue-50 border-blue-200',
  loading: 'bg-purple-50 border-purple-200'
};

const toastTextColors = {
  success: 'text-green-800',
  error: 'text-red-800',
  warning: 'text-yellow-800',
  info: 'text-blue-800',
  loading: 'text-purple-800'
};

const positionClasses = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
};

const priorityOrder = {
  low: 1,
  normal: 2,
  high: 3
};

export const SmartToast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  position = 'top-right',
  actions = [],
  onClose,
  onAction,
  persistent = false,
  priority = 'normal',
  category,
  timestamp = new Date(),
  user,
  showProgress = true,
  autoClose = true
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const progressRef = useRef<NodeJS.Timeout>();
  const IconComponent = toastIcons[type];

  useEffect(() => {
    if (!persistent && autoClose && duration > 0) {
      const startTime = Date.now();
      const endTime = startTime + duration;

      const updateProgress = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        const newProgress = (remaining / duration) * 100;
        
        if (newProgress <= 0) {
          handleClose();
          return;
        }
        
        setProgress(newProgress);
        progressRef.current = setTimeout(updateProgress, 10);
      };

      if (!isPaused) {
        updateProgress();
      }

      return () => {
        if (progressRef.current) {
          clearTimeout(progressRef.current);
        }
      };
    }
  }, [duration, persistent, autoClose, isPaused]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  const handlePause = () => {
    setIsPaused(true);
    if (progressRef.current) {
      clearTimeout(progressRef.current);
    }
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleAction = (action: ToastAction) => {
    onAction?.(action);
    action.onClick();
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Şimdi';
    if (minutes < 60) return `${minutes} dk önce`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} saat önce`;
    
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            'relative w-80 bg-white rounded-lg shadow-lg border overflow-hidden',
            toastBgColors[type]
          )}
          onMouseEnter={handlePause}
          onMouseLeave={handleResume}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={cn('p-2 rounded-lg', toastColors[type])}>
                <IconComponent className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={cn('font-semibold text-sm', toastTextColors[type])}>
                    {title}
                  </h4>
                  
                  {priority === 'high' && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                      Yüksek
                    </span>
                  )}
                </div>
                
                {message && (
                  <p className={cn('text-sm', toastTextColors[type])}>
                    {message}
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Meta information */}
          {(category || user || timestamp) && (
            <div className="px-4 pb-3 border-t border-gray-200 pt-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  {category && (
                    <span className="px-2 py-1 bg-gray-100 rounded-full">
                      {category}
                    </span>
                  )}
                  
                  {user && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{user}</span>
                    </div>
                  )}
                </div>
                
                <span>{formatTimestamp(timestamp)}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          {actions.length > 0 && (
            <div className="px-4 pb-3 border-t border-gray-200 pt-3">
              <div className="flex items-center gap-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleAction(action)}
                    className={cn(
                      'px-3 py-1 text-xs rounded-md transition-colors',
                      action.variant === 'primary' && 'bg-blue-500 text-white hover:bg-blue-600',
                      action.variant === 'secondary' && 'bg-gray-500 text-white hover:bg-gray-600',
                      action.variant === 'danger' && 'bg-red-500 text-white hover:bg-red-600',
                      !action.variant && 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    )}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Progress bar */}
          {showProgress && !persistent && autoClose && duration > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
              <motion.div
                className={cn('h-full', toastColors[type])}
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const SmartToastSystem: React.FC<SmartToastSystemProps> = ({
  position = 'top-right',
  maxToasts = 5,
  autoClose = true,
  defaultDuration = 5000,
  enableSound = true,
  enableVibration = true,
  className
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastProps = {
      ...toast,
      id,
      duration: toast.duration ?? defaultDuration,
      autoClose: toast.autoClose ?? autoClose
    };

    setToasts(prev => {
      const updated = [newToast, ...prev]
        .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
        .slice(0, maxToasts);
      
      return updated;
    });

    // Play sound
    if (enableSound && !isMuted && toast.type !== 'loading') {
      playNotificationSound(toast.type);
    }

    // Vibrate
    if (enableVibration && !isPaused && toast.priority === 'high') {
      navigator.vibrate?.(200);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  const clearByCategory = (category: string) => {
    setToasts(prev => prev.filter(toast => toast.category !== category));
  };

  const playNotificationSound = (type: ToastType) => {
    // Create audio context for different notification sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different types
    const frequencies = {
      success: 800,
      error: 400,
      warning: 600,
      info: 700,
      loading: 500
    };

    oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const handleToastAction = (toast: ToastProps, action: ToastAction) => {
    action.onClick();
    if (action.variant === 'danger') {
      removeToast(toast.id);
    }
  };

  return (
    <div className={cn('fixed z-50', positionClasses[position], className)}>
      {/* Control panel */}
      <div className="mb-4 p-3 bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isMuted ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
            )}
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isPaused ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
            )}
            title={isPaused ? 'Devam Et' : 'Duraklat'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          
          <button
            onClick={clearAll}
            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            title="Tümünü Temizle"
          >
            <X className="w-4 h-4" />
          </button>
          
          <span className="text-sm text-gray-500">
            {toasts.length} bildirim
          </span>
        </div>
      </div>

      {/* Toasts */}
      <div className="space-y-3">
        {toasts.map((toast) => (
          <SmartToast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
            onAction={(action) => handleToastAction(toast, action)}
          />
        ))}
      </div>

      {/* Export methods */}
      {typeof window !== 'undefined' && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.showToast = ${addToast.toString()};
              window.clearToasts = ${clearAll.toString()};
              window.clearToastsByCategory = ${clearByCategory.toString()};
            `
          }}
        />
      )}
    </div>
  );
};

// Utility functions for easy toast creation
export const toast = {
  success: (title: string, message?: string, options?: Partial<ToastProps>) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type: 'success', title, message, ...options });
    }
  },
  error: (title: string, message?: string, options?: Partial<ToastProps>) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type: 'error', title, message, ...options });
    }
  },
  warning: (title: string, message?: string, options?: Partial<ToastProps>) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type: 'warning', title, message, ...options });
    }
  },
  info: (title: string, message?: string, options?: Partial<ToastProps>) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type: 'info', title, message, ...options });
    }
  },
  loading: (title: string, message?: string, options?: Partial<ToastProps>) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type: 'loading', title, message, persistent: true, ...options });
    }
  }
};
