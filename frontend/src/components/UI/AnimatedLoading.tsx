'use client';

import { motion } from 'framer-motion';

interface AnimatedLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function AnimatedLoading({ size = 'md', text }: AnimatedLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const containerClasses = {
    sm: 'space-x-2',
    md: 'space-x-3',
    lg: 'space-x-4'
  };

  return (
    <div className={`flex items-center ${containerClasses[size]}`}>
      <motion.div
        className={`${sizeClasses[size]} border-2 border-gray-300 dark:border-gray-600 border-t-indigo-600 dark:border-t-indigo-400 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      {text && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-sm text-gray-600 dark:text-gray-400"
        >
          {text}
        </motion.span>
      )}
    </div>
  );
}

// Pulse Loading
export function PulseLoading({ size = 'md', color = 'primary' }: AnimatedLoadingProps) {
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${sizeClasses[size]} ${colorClasses[color]} bg-current rounded-full`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// Dots Loading
export function DotsLoading({ text = 'Yükleniyor' }: { text?: string }) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 bg-gray-400 rounded-full"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
} 