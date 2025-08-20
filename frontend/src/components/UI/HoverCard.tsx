'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Info, ExternalLink, ArrowUpRight } from 'lucide-react';

interface HoverCardProps {
  children: React.ReactNode;
  content: React.ReactNode;
  title?: string;
  description?: string;
  variant?: 'default' | 'info' | 'link' | 'preview';
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  trigger?: 'hover' | 'click';
  showArrow?: boolean;
  maxWidth?: string;
}

const HoverCard: React.FC<HoverCardProps> = ({
  children,
  content,
  title,
  description,
  variant = 'default',
  position = 'top',
  delay = 0.2,
  className = '',
  trigger = 'hover',
  showArrow = true,
  maxWidth = 'max-w-sm'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsClicked(!isClicked);
      setIsVisible(!isVisible);
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default: // top
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowPosition = () => {
    switch (position) {
      case 'bottom':
        return 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full';
      case 'left':
        return 'top-1/2 right-0 transform translate-x-full -translate-y-1/2';
      case 'right':
        return 'top-1/2 left-0 transform -translate-x-full -translate-y-1/2';
      default: // top
        return 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
      case 'link':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
      case 'preview':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700';
      default:
        return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getVariantIcon = () => {
    switch (variant) {
      case 'info':
        return <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'link':
        return <ExternalLink className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'preview':
        return <ArrowUpRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Trigger Element */}
      <div className="cursor-pointer">
        {children}
      </div>

      {/* Hover Card */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`absolute z-50 ${getPositionClasses()} ${maxWidth} ${getVariantStyles()} rounded-lg border shadow-lg p-4`}
            initial={{ 
              opacity: 0, 
              scale: 0.95,
              y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0,
              x: position === 'left' ? 10 : position === 'right' ? -10 : 0
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: 0,
              x: 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.95,
              y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0,
              x: position === 'left' ? 10 : position === 'right' ? -10 : 0
            }}
            transition={{
              duration: 0.2,
              delay,
              ease: "easeOut"
            }}
          >
            {/* Arrow */}
            {showArrow && (
              <div className={`absolute ${getArrowPosition()}`}>
                <div className={`w-2 h-2 bg-white dark:bg-gray-800 border-l border-t transform rotate-45 ${getVariantStyles().split(' ')[0]}`} />
              </div>
            )}

            {/* Header */}
            {(title || variant !== 'default') && (
              <div className="flex items-center space-x-2 mb-3">
                {getVariantIcon()}
                {title && (
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {title}
                  </h3>
                )}
              </div>
            )}

            {/* Description */}
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {description}
              </p>
            )}

            {/* Content */}
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {content}
            </div>

            {/* Footer for link variant */}
            {variant === 'link' && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                <span className="text-xs text-green-600 dark:text-green-400">
                  Tıklayarak aç
                </span>
                <ChevronRight className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HoverCard;

// Specialized hover card components
export const InfoCard: React.FC<{
  children: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}> = ({ children, title, description, className }) => (
  <HoverCard
    title={title}
    description={description}
    variant="info"
    className={className}
  >
    {children}
  </HoverCard>
);

export const LinkCard: React.FC<{
  children: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}> = ({ children, title, description, className }) => (
  <HoverCard
    title={title}
    description={description}
    variant="link"
    className={className}
  >
    {children}
  </HoverCard>
);

export const PreviewCard: React.FC<{
  children: React.ReactNode;
  title: string;
  content: React.ReactNode;
  className?: string;
}> = ({ children, title, content, className }) => (
  <HoverCard
    title={title}
    content={content}
    variant="preview"
    className={className}
  >
    {children}
  </HoverCard>
); 