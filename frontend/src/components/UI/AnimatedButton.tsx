'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  effect?: 'ripple' | 'scale' | 'slide' | 'glow' | 'bounce' | 'shake';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function AnimatedButton({
  children,
  variant = 'default',
  size = 'md',
  effect = 'scale',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  onClick
}: AnimatedButtonProps) {
  const baseClasses = 'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    default: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 focus:ring-gray-500',
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    error: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 focus:ring-gray-500'
  };

  const getEffectVariants = (): Variants => {
    switch (effect) {
      case 'ripple':
        return {
          hover: {
            scale: 1.02,
            transition: { duration: 0.2 }
          },
          tap: {
            scale: 0.98,
            transition: { duration: 0.1 }
          }
        };

      case 'scale':
        return {
          hover: {
            scale: 1.05,
            transition: { duration: 0.2 }
          },
          tap: {
            scale: 0.95,
            transition: { duration: 0.1 }
          }
        };

      case 'slide':
        return {
          hover: {
            x: 5,
            transition: { duration: 0.2 }
          },
          tap: {
            x: 0,
            transition: { duration: 0.1 }
          }
        };

      case 'glow':
        return {
          hover: {
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
            scale: 1.02,
            transition: { duration: 0.2 }
          },
          tap: {
            scale: 0.98,
            transition: { duration: 0.1 }
          }
        };

      case 'bounce':
        return {
          hover: {
            y: -2,
            transition: { 
              duration: 0.2,
              type: "spring",
              stiffness: 300
            }
          },
          tap: {
            y: 0,
            transition: { duration: 0.1 }
          }
        };

      case 'shake':
        return {
          hover: {
            x: [-2, 2, -2, 2, 0],
            transition: { duration: 0.3 }
          },
          tap: {
            scale: 0.98,
            transition: { duration: 0.1 }
          }
        };

      default:
        return {
          hover: { scale: 1.02 },
          tap: { scale: 0.98 }
        };
    }
  };

  const RippleEffect = () => (
    <motion.div
      className="absolute inset-0 rounded-lg bg-white/20"
      initial={{ scale: 0, opacity: 1 }}
      whileHover={{ scale: 1, opacity: 0 }}
      transition={{ duration: 0.6 }}
    />
  );

  return (
    <motion.button
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        className
      )}
      variants={getEffectVariants()}
      whileHover={disabled ? undefined : "hover"}
      whileTap={disabled ? undefined : "tap"}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {effect === 'ripple' && <RippleEffect />}
      
      <motion.div
        className="relative z-10 flex items-center space-x-2"
        animate={loading ? { opacity: [1, 0.5, 1] } : {}}
        transition={loading ? { duration: 1.5, repeat: Infinity } : {}}
      >
        {loading && (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        {children}
      </motion.div>
    </motion.button>
  );
} 