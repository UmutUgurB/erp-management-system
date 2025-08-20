'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ArrowUp } from 'lucide-react';

interface ScrollToTopProps {
  className?: string;
  variant?: 'default' | 'floating' | 'minimal';
  showProgress?: boolean;
  threshold?: number;
  smooth?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({
  className = '',
  variant = 'default',
  showProgress = true,
  threshold = 300,
  smooth = true,
  position = 'bottom-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / windowHeight) * 100;
      
      setScrollProgress(Math.min(progress, 100));
      setIsVisible(scrollTop > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    if (smooth) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo(0, 0);
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default: // bottom-right
        return 'bottom-4 right-4';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'floating':
        return 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl';
      case 'minimal':
        return 'bg-gray-900/90 dark:bg-white/90 text-white dark:text-gray-900';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'minimal':
        return <ArrowUp className="w-4 h-4" />;
      default:
        return <ChevronUp className="w-5 h-5" />;
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed z-50 ${getPositionClasses()} ${className}`}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="relative">
          {/* Progress Ring */}
          {showProgress && (
            <div className="absolute inset-0">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                  opacity="0.3"
                />
                <motion.circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - scrollProgress / 100)}`}
                  className="text-blue-500 dark:text-blue-400"
                  initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - scrollProgress / 100) }}
                  transition={{ duration: 0.3 }}
                />
              </svg>
            </div>
          )}

          {/* Button */}
          <motion.button
            onClick={scrollToTop}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${getVariantStyles()}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Sayfa başına dön"
          >
            {getIcon()}
          </motion.button>

          {/* Progress Text */}
          {showProgress && (
            <motion.div
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              %{Math.round(scrollProgress)}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScrollToTop;

// Specialized scroll to top components
export const FloatingScrollToTop: React.FC<{
  className?: string;
  showProgress?: boolean;
}> = (props) => (
  <ScrollToTop variant="floating" {...props} />
);

export const MinimalScrollToTop: React.FC<{
  className?: string;
  showProgress?: boolean;
}> = (props) => (
  <ScrollToTop variant="minimal" {...props} />
);

export const CenteredScrollToTop: React.FC<{
  className?: string;
  showProgress?: boolean;
}> = (props) => (
  <ScrollToTop position="bottom-center" {...props} />
);


