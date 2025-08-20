'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface PageTransitionProps {
  children: React.ReactNode;
  isLoading?: boolean;
  status?: 'loading' | 'success' | 'error' | 'idle';
  message?: string;
  variant?: 'fade' | 'slide' | 'scale' | 'flip' | 'custom';
  duration?: number;
  className?: string;
  showProgress?: boolean;
  onTransitionComplete?: () => void;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  isLoading = false,
  status = 'idle',
  message = 'Sayfa yükleniyor...',
  variant = 'fade',
  duration = 0.3,
  className = '',
  showProgress = false,
  onTransitionComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setIsTransitioning(true);
      setProgress(0);
      
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setProgress(100);
      setTimeout(() => {
        setIsTransitioning(false);
        onTransitionComplete?.();
      }, 500);
    }
  }, [isLoading, onTransitionComplete]);

  const getTransitionVariants = () => {
    switch (variant) {
      case 'slide':
        return {
          initial: { x: '100%', opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: '-100%', opacity: 0 }
        };
      case 'scale':
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 1.2, opacity: 0 }
        };
      case 'flip':
        return {
          initial: { rotateY: 90, opacity: 0 },
          animate: { rotateY: 0, opacity: 1 },
          exit: { rotateY: -90, opacity: 0 }
        };
      case 'custom':
        return {
          initial: { y: 50, opacity: 0, rotateX: 15 },
          animate: { y: 0, opacity: 1, rotateX: 0 },
          exit: { y: -50, opacity: 0, rotateX: -15 }
        };
      default: // fade
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />;
      case 'loading':
        return <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'loading':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Loading Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-center space-y-6">
              {/* Status Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
              >
                {getStatusIcon()}
              </motion.div>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-lg font-medium ${getStatusColor()}`}
              >
                {message}
              </motion.p>

              {/* Progress Bar */}
              {showProgress && (
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.3 }}
                  className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </motion.div>
              )}

              {/* Progress Text */}
              {showProgress && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-gray-500 dark:text-gray-400"
                >
                  %{Math.round(progress)} tamamlandı
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isTransitioning ? 'loading' : 'content'}
          variants={getTransitionVariants()}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration,
            ease: "easeInOut"
          }}
          onAnimationComplete={() => {
            if (!isTransitioning) {
              onTransitionComplete?.();
            }
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PageTransition;

// Specialized transition components
export const FadeTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <PageTransition variant="fade" className={className}>
    {children}
  </PageTransition>
);

export const SlideTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <PageTransition variant="slide" className={className}>
    {children}
  </PageTransition>
);

export const ScaleTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <PageTransition variant="scale" className={className}>
    {children}
  </PageTransition>
);

export const FlipTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <PageTransition variant="flip" className={className}>
    {children}
  </PageTransition>
);

export const CustomTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <PageTransition variant="custom" className={className}>
    {children}
  </PageTransition>
); 