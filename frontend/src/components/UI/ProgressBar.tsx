'use client';

import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient';
  showLabel?: boolean;
  showIcon?: boolean;
  animated?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = true,
  showIcon = false,
  animated = true,
  className = ''
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const labelSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'bg-green-500',
          text: 'text-green-600',
          icon: CheckCircle,
          iconColor: 'text-green-500'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          text: 'text-yellow-600',
          icon: AlertCircle,
          iconColor: 'text-yellow-500'
        };
      case 'danger':
        return {
          bg: 'bg-red-500',
          text: 'text-red-600',
          icon: AlertCircle,
          iconColor: 'text-red-500'
        };
      case 'gradient':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-purple-500',
          text: 'text-blue-600',
          icon: TrendingUp,
          iconColor: 'text-blue-500'
        };
      default:
        return {
          bg: 'bg-indigo-500',
          text: 'text-indigo-600',
          icon: Clock,
          iconColor: 'text-indigo-500'
        };
    }
  };

  const variantClasses = getVariantClasses();
  const Icon = variantClasses.icon;

  const getStatusText = () => {
    if (percentage >= 100) return 'Tamamlandı';
    if (percentage >= 75) return 'Neredeyse tamamlandı';
    if (percentage >= 50) return 'Yarıda';
    if (percentage >= 25) return 'Başlandı';
    return 'Bekliyor';
  };

  const getStatusColor = () => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    if (percentage >= 25) return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {showIcon && (
              <Icon className={`w-4 h-4 ${variantClasses.iconColor}`} />
            )}
            <span className={`${labelSizes[size]} font-medium ${variantClasses.text}`}>
              İlerleme: {Math.round(percentage)}%
            </span>
          </div>
          <span className={`${labelSizes[size]} ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${sizeClasses[size]} overflow-hidden`}>
        <motion.div
          className={`${sizeClasses[size]} rounded-full ${variantClasses.bg} relative`}
          initial={animated ? { width: 0 } : false}
          animate={animated ? { width: `${percentage}%` } : false}
          transition={animated ? { duration: 1, ease: "easeOut" } : {}}
          style={animated ? {} : { width: `${percentage}%` }}
        >
          {animated && variant === 'gradient' && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          )}
        </motion.div>
      </div>
      
      {showLabel && (
        <div className="flex items-center justify-between mt-1">
          <span className={`${labelSizes[size]} text-gray-500 dark:text-gray-400`}>
            {value} / {max}
          </span>
          <span className={`${labelSizes[size]} text-gray-500 dark:text-gray-400`}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}

// Specialized progress bar components
export function SuccessProgressBar(props: Omit<ProgressBarProps, 'variant'>) {
  return <ProgressBar {...props} variant="success" />;
}

export function WarningProgressBar(props: Omit<ProgressBarProps, 'variant'>) {
  return <ProgressBar {...props} variant="warning" />;
}

export function DangerProgressBar(props: Omit<ProgressBarProps, 'variant'>) {
  return <ProgressBar {...props} variant="danger" />;
}

export function GradientProgressBar(props: Omit<ProgressBarProps, 'variant'>) {
  return <ProgressBar {...props} variant="gradient" />;
}

// Circular progress bar
interface CircularProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  strokeWidth?: number;
  className?: string;
}

export function CircularProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = true,
  strokeWidth = 4,
  className = ''
}: CircularProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = size === 'sm' ? 20 : size === 'md' ? 30 : 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getVariantColor = () => {
    switch (variant) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'danger': return '#ef4444';
      default: return '#6366f1';
    }
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
          {/* Background circle */}
          <circle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            className="dark:stroke-gray-700"
          />
          {/* Progress circle */}
          <motion.circle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            fill="none"
            stroke={getVariantColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${textSizes[size]} font-semibold text-gray-700 dark:text-gray-300`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      
      {showLabel && (
        <div className="mt-2 text-center">
          <div className={`${textSizes[size]} font-medium text-gray-900 dark:text-gray-100`}>
            İlerleme
          </div>
          <div className={`${textSizes[size]} text-gray-500 dark:text-gray-400`}>
            {value} / {max}
          </div>
        </div>
      )}
    </div>
  );
} 