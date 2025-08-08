'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: ReactNode;
  content: string | ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error';
  delay?: number;
  className?: string;
  showArrow?: boolean;
}

export default function Tooltip({
  children,
  content,
  position = 'top',
  variant = 'default',
  delay = 0.5,
  className = '',
  showArrow = true
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const variantStyles = {
    default: 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900',
    info: 'bg-blue-600 text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-600 text-white',
    error: 'bg-red-600 text-white'
  };

  const positionStyles = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowStyles = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-900 dark:border-t-gray-100',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-900 dark:border-b-gray-100',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-900 dark:border-l-gray-100',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-900 dark:border-r-gray-100'
  };

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay * 1000);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let x = 0;
      let y = 0;

      switch (position) {
        case 'top':
          x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          y = triggerRect.top - tooltipRect.height - 8;
          break;
        case 'bottom':
          x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          y = triggerRect.bottom + 8;
          break;
        case 'left':
          x = triggerRect.left - tooltipRect.width - 8;
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          break;
        case 'right':
          x = triggerRect.right + 8;
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          break;
      }

      setCoords({ x, y });
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={triggerRef}
      className={cn('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute z-50 px-3 py-2 text-sm font-medium rounded-lg shadow-lg whitespace-nowrap',
              variantStyles[variant],
              positionStyles[position]
            )}
            style={{
              left: coords.x,
              top: coords.y
            }}
          >
            {content}
            {showArrow && (
              <div
                className={cn(
                  'absolute w-0 h-0 border-4 border-transparent',
                  arrowStyles[position]
                )}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Specialized tooltip components
export function InfoTooltip({ 
  children, 
  content, 
  className = '' 
}: { 
  children: ReactNode;
  content: string;
  className?: string;
}) {
  return (
    <Tooltip content={content} variant="info" className={className}>
      {children}
    </Tooltip>
  );
}

export function SuccessTooltip({ 
  children, 
  content, 
  className = '' 
}: { 
  children: ReactNode;
  content: string;
  className?: string;
}) {
  return (
    <Tooltip content={content} variant="success" className={className}>
      {children}
    </Tooltip>
  );
}

export function WarningTooltip({ 
  children, 
  content, 
  className = '' 
}: { 
  children: ReactNode;
  content: string;
  className?: string;
}) {
  return (
    <Tooltip content={content} variant="warning" className={className}>
      {children}
    </Tooltip>
  );
}

export function ErrorTooltip({ 
  children, 
  content, 
  className = '' 
}: { 
  children: ReactNode;
  content: string;
  className?: string;
}) {
  return (
    <Tooltip content={content} variant="error" className={className}>
      {children}
    </Tooltip>
  );
} 