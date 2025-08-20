'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface RouteProgressProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'detailed';
  position?: 'top' | 'bottom';
  height?: number;
  color?: 'blue' | 'green' | 'purple' | 'gradient';
  showIcon?: boolean;
  autoHide?: boolean;
  hideDelay?: number;
}

const RouteProgress: React.FC<RouteProgressProps> = ({
  className = '',
  variant = 'default',
  position = 'top',
  height = 3,
  color = 'blue',
  showIcon = true,
  autoHide = true,
  hideDelay = 1000
}) => {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (pathname) {
      handleRouteChange();
    }
  }, [pathname]);

  const handleRouteChange = () => {
    setIsLoading(true);
    setStatus('loading');
    setProgress(0);

    // Simulate route loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 100);

    // Simulate route completion
    setTimeout(() => {
      setProgress(100);
      setStatus('success');
      setIsLoading(false);

      if (autoHide) {
        setTimeout(() => {
          setStatus('idle');
          setProgress(0);
        }, hideDelay);
      }
    }, 800);
  };

  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-500';
      case 'purple':
        return 'bg-purple-500';
      case 'gradient':
        return 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusIcon = () => {
    if (!showIcon) return null;

    switch (status) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-gray-100 dark:bg-gray-800';
      case 'detailed':
        return 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm';
      default:
        return 'bg-transparent';
    }
  };

  const getPositionClasses = () => {
    return position === 'top' ? 'top-0 left-0 right-0' : 'bottom-0 left-0 right-0';
  };

  if (status === 'idle' && !isLoading) return null;

  return (
    <div className={`fixed z-50 ${getPositionClasses()} ${getVariantStyles()} ${className}`}>
      <div className="relative">
        {/* Progress Bar */}
        <motion.div
          className={`h-${height} ${getColorClasses()}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />

        {/* Detailed Variant Content */}
        {variant === 'detailed' && (
          <div className="px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {status === 'loading' && 'Sayfa yükleniyor...'}
                  {status === 'success' && 'Sayfa yüklendi'}
                  {status === 'error' && 'Yükleme hatası'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  %{Math.round(progress)}
                </span>
                
                {status === 'success' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 300 }}
                    className="w-2 h-2 bg-green-500 rounded-full"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator for Default/Minimal */}
        {(variant === 'default' || variant === 'minimal') && showIcon && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <AnimatePresence>
              {status === 'loading' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteProgress;

// Specialized route progress components
export const TopRouteProgress: React.FC<{
  className?: string;
  variant?: 'default' | 'minimal' | 'detailed';
}> = (props) => (
  <RouteProgress position="top" {...props} />
);

export const BottomRouteProgress: React.FC<{
  className?: string;
  variant?: 'default' | 'minimal' | 'detailed';
}> = (props) => (
  <RouteProgress position="bottom" {...props} />
);

export const MinimalRouteProgress: React.FC<{
  className?: string;
  position?: 'top' | 'bottom';
}> = (props) => (
  <RouteProgress variant="minimal" {...props} />
);

export const DetailedRouteProgress: React.FC<{
  className?: string;
  position?: 'top' | 'bottom';
}> = (props) => (
  <RouteProgress variant="detailed" {...props} />
);


