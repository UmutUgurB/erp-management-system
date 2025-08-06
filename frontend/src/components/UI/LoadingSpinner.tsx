'use client';

import { motion } from 'framer-motion';
import { Loader2, Circle, CheckCircle, AlertCircle } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  type?: 'spinner' | 'dots' | 'pulse' | 'success' | 'error';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export default function LoadingSpinner({ 
  size = 'md', 
  type = 'spinner', 
  text,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClass = sizeClasses[size];

  const renderSpinner = () => {
    switch (type) {
      case 'spinner':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className={`${sizeClass} ${className}`}
          >
            <Loader2 className={`${sizeClass} text-indigo-600 dark:text-indigo-400`} />
          </motion.div>
        );

      case 'dots':
        return (
          <div className={`flex space-x-1 ${className}`}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.4,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className={`${size === 'sm' ? 'h-2 w-2' : size === 'lg' ? 'h-3 w-3' : 'h-2.5 w-2.5'} bg-indigo-600 dark:bg-indigo-400 rounded-full`}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className={`${sizeClass} ${className}`}
          >
            <Circle className={`${sizeClass} text-indigo-600 dark:text-indigo-400`} />
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className={`${sizeClass} ${className}`}
          >
            <CheckCircle className={`${sizeClass} text-green-600 dark:text-green-400`} />
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className={`${sizeClass} ${className}`}
          >
            <AlertCircle className={`${sizeClass} text-red-600 dark:text-red-400`} />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {renderSpinner()}
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-gray-600 dark:text-gray-400 text-center"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
} 