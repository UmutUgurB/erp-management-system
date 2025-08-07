'use client';

import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ProgressBarProps {
  progress: number; // 0-100
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showIcon?: boolean;
  animated?: boolean;
  className?: string;
}

export default function ProgressBar({
  progress,
  variant = 'default',
  size = 'md',
  showLabel = true,
  showIcon = false,
  animated = true,
  className = ''
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const variantClasses = {
    default: 'bg-indigo-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
    gradient: 'bg-gradient-to-r from-indigo-600 to-purple-600'
  };

  const getStatusIcon = () => {
    if (clampedProgress === 100) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (clampedProgress >= 80) {
      return <Clock className="w-4 h-4 text-yellow-600" />;
    } else if (clampedProgress < 30) {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getStatusColor = () => {
    if (clampedProgress === 100) return 'text-green-600';
    if (clampedProgress >= 80) return 'text-yellow-600';
    if (clampedProgress < 30) return 'text-red-600';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {(showLabel || showIcon) && (
        <div className="flex items-center justify-between">
          {showLabel && (
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {clampedProgress}% tamamlandı
            </span>
          )}
          {showIcon && getStatusIcon()}
        </div>
      )}
      
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          className={`${variantClasses[variant]} h-full rounded-full transition-all duration-300`}
          initial={animated ? { width: 0 } : undefined}
          animate={animated ? { width: `${clampedProgress}%` } : undefined}
          transition={animated ? { duration: 0.8, ease: "easeOut" } : undefined}
          style={!animated ? { width: `${clampedProgress}%` } : undefined}
        >
          {animated && variant === 'gradient' && (
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
              animate={{
                background: [
                  "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)",
                  "linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%)",
                  "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
} 