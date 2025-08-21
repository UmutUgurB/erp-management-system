import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  animated?: boolean;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#3B82F6',
  backgroundColor = '#E5E7EB',
  showPercentage = true,
  animated = true,
  className
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={animated ? { strokeDashoffset: circumference } : {}}
          animate={animated ? { strokeDashoffset } : {}}
          transition={animated ? { duration: 1, ease: "easeInOut" } : {}}
        />
      </svg>
      
      {/* Percentage text */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={animated ? { opacity: 0, scale: 0.8 } : {}}
            animate={animated ? { opacity: 1, scale: 1 } : {}}
            transition={animated ? { delay: 0.5, duration: 0.3 } : {}}
            className="text-center"
          >
            <div className="text-2xl font-bold text-gray-800">
              {Math.round(progress)}%
            </div>
            <div className="text-sm text-gray-500">Tamamlandı</div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Variant components
export const ProgressRingSmall: React.FC<Omit<ProgressRingProps, 'size' | 'strokeWidth'> & { size?: number }> = (props) => (
  <ProgressRing {...props} size={props.size || 80} strokeWidth={6} />
);

export const ProgressRingLarge: React.FC<Omit<ProgressRingProps, 'size' | 'strokeWidth'> & { size?: number }> = (props) => (
  <ProgressRing {...props} size={props.size || 160} strokeWidth={12} />
);

// Color presets
export const ProgressRingColors = {
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#F59E0B',
  red: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1',
  teal: '#14B8A6'
};
