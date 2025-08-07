'use client';

import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  type?: 'card' | 'table' | 'list' | 'form' | 'chart' | 'custom';
  rows?: number;
  className?: string;
  children?: React.ReactNode;
}

export default function SkeletonLoader({ 
  type = 'card', 
  rows = 3, 
  className = '',
  children 
}: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm ${className}`}>
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center space-x-3">
                <motion.div
                  className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <div className="space-y-2 flex-1">
                  <motion.div
                    className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  />
                </div>
              </div>
              
              {/* Content */}
              <div className="space-y-3">
                {Array.from({ length: rows }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-3 bg-gray-200 dark:bg-gray-700 rounded"
                    style={{ width: `${Math.random() * 40 + 60}%` }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      delay: i * 0.1 
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}>
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                    style={{ width: `${Math.random() * 30 + 20}%` }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      delay: i * 0.1 
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Table Rows */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    {Array.from({ length: 4 }).map((_, colIndex) => (
                      <motion.div
                        key={colIndex}
                        className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                        style={{ width: `${Math.random() * 30 + 20}%` }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity, 
                          delay: (rowIndex * 4 + colIndex) * 0.05 
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'list':
        return (
          <div className={`space-y-3 ${className}`}>
            {Array.from({ length: rows }).map((_, i) => (
              <motion.div
                key={i}
                className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: i * 0.1 
                }}
              >
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
                <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
              </motion.div>
            ))}
          </div>
        );

      case 'form':
        return (
          <div className={`space-y-6 ${className}`}>
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="space-y-2">
                <motion.div
                  className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    delay: i * 0.1 
                  }}
                />
                <motion.div
                  className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    delay: i * 0.1 + 0.2 
                  }}
                />
              </div>
            ))}
          </div>
        );

      case 'chart':
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${className}`}>
            <div className="space-y-4">
              {/* Chart Header */}
              <div className="flex items-center justify-between">
                <motion.div
                  className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                />
              </div>
              
              {/* Chart Area */}
              <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg relative overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute bottom-0 bg-gray-200 dark:bg-gray-600 rounded-t"
                    style={{
                      left: `${(i * 20) + 10}%`,
                      width: '8%',
                      height: `${Math.random() * 60 + 20}%`
                    }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: i * 0.2 
                    }}
                  />
                ))}
              </div>
              
              {/* Chart Legend */}
              <div className="flex items-center space-x-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <motion.div
                      className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        delay: i * 0.1 
                      }}
                    />
                    <motion.div
                      className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        delay: i * 0.1 + 0.1 
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'custom':
        return children || null;

      default:
        return null;
    }
  };

  return renderSkeleton();
} 