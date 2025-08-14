'use client';

import { motion } from 'framer-motion';
import { Loader2, Zap, Star, Sparkles } from 'lucide-react';

interface AnimatedLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pulse' | 'bounce' | 'spin' | 'wave' | 'dots' | 'fancy';
  text?: string;
  className?: string;
}

export default function AnimatedLoading({ 
  size = 'md', 
  variant = 'default', 
  text,
  className = '' 
}: AnimatedLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const renderLoader = () => {
    switch (variant) {
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-1 bg-white dark:bg-gray-800 rounded-full"
              animate={{ scale: [1, 0.8, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        );

      case 'bounce':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-500 rounded-full`}
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        );

      case 'wave':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className={`${sizeClasses[size].split(' ')[1]} bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full`}
                animate={{ scaleY: [1, 2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        );

      case 'dots':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`${sizeClasses[size].split(' ')[1]} bg-gradient-to-r from-green-500 to-teal-500 rounded-full`}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        );

      case 'fancy':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-1 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 0.9, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Star className="w-1/2 h-1/2 text-yellow-500" />
            </motion.div>
          </div>
        );

      case 'spin':
      default:
        return (
          <motion.div
            className={`${sizeClasses[size]} border-2 border-gray-300 dark:border-gray-600 border-t-indigo-500 dark:border-t-indigo-400 rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {renderLoader()}
      
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <motion.p
            className={`${textSizes[size]} text-gray-600 dark:text-gray-400 flex items-center space-x-2`}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-3 h-3" />
            <span>{text}</span>
            <Zap className="w-3 h-3" />
          </motion.p>
        </motion.div>
      )}
    </div>
  );
}

// Specialized loading components
export function PulseLoader({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return <AnimatedLoading variant="pulse" size={size} className={className} />;
}

export function BounceLoader({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return <AnimatedLoading variant="bounce" size={size} className={className} />;
}

export function WaveLoader({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return <AnimatedLoading variant="wave" size={size} className={className} />;
}

export function DotsLoader({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return <AnimatedLoading variant="dots" size={size} className={className} />;
}

export function FancyLoader({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return <AnimatedLoading variant="fancy" size={size} className={className} />;
}

// Page loading component
export function PageLoader({ text = "Sayfa yükleniyor..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="text-center">
        <FancyLoader size="lg" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-xl font-semibold text-gray-900 dark:text-gray-100"
        >
          ERP Sistemi
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-2 text-gray-600 dark:text-gray-400"
        >
          {text}
        </motion.p>
      </div>
    </div>
  );
}

// Inline loading component
export function InlineLoader({ size = 'sm', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return <AnimatedLoading variant="spin" size={size} className={className} />;
} 