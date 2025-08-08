'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface PopoverProps {
  children: ReactNode;
  content: ReactNode;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'click' | 'hover';
  className?: string;
  showArrow?: boolean;
  closeOnClickOutside?: boolean;
}

export default function Popover({
  children,
  content,
  title,
  position = 'bottom',
  trigger = 'click',
  className = '',
  showArrow = true,
  closeOnClickOutside = true
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const positionStyles = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowStyles = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-200 dark:border-t-gray-700',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-200 dark:border-b-gray-700',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-200 dark:border-l-gray-700',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-200 dark:border-r-gray-700'
  };

  const handleTrigger = () => {
    if (trigger === 'click') {
      setIsOpen(!isOpen);
      if (!isOpen) {
        updatePosition();
      }
    }
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(true);
        updatePosition();
      }, 200);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 300);
    }
  };

  const updatePosition = () => {
    if (triggerRef.current && popoverRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();
      
      let x = 0;
      let y = 0;

      switch (position) {
        case 'top':
          x = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
          y = triggerRect.top - popoverRect.height - 8;
          break;
        case 'bottom':
          x = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
          y = triggerRect.bottom + 8;
          break;
        case 'left':
          x = triggerRect.left - popoverRect.width - 8;
          y = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
          break;
        case 'right':
          x = triggerRect.right + 8;
          y = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
          break;
      }

      setCoords({ x, y });
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      closeOnClickOutside &&
      triggerRef.current &&
      popoverRef.current &&
      !triggerRef.current.contains(event.target as Node) &&
      !popoverRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen]);

  return (
    <div
      ref={triggerRef}
      className={cn('relative inline-block', className)}
      onClick={trigger === 'click' ? handleTrigger : undefined}
      onMouseEnter={trigger === 'hover' ? handleMouseEnter : undefined}
      onMouseLeave={trigger === 'hover' ? handleMouseLeave : undefined}
    >
      {children}
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700',
              positionStyles[position]
            )}
            style={{
              left: coords.x,
              top: coords.y
            }}
          >
            {showArrow && (
              <div
                className={cn(
                  'absolute w-0 h-0 border-4 border-transparent',
                  arrowStyles[position]
                )}
              />
            )}
            
            {title && (
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {title}
                </h3>
                {trigger === 'click' && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
            
            <div className="p-4">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Specialized popover components
export function InfoPopover({ 
  children, 
  content, 
  title = 'Bilgi',
  className = '' 
}: { 
  children: ReactNode;
  content: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <Popover content={content} title={title} className={className}>
      {children}
    </Popover>
  );
}

export function MenuPopover({ 
  children, 
  items, 
  className = '' 
}: { 
  children: ReactNode;
  items: Array<{ label: string; onClick: () => void; icon?: any }>;
  className?: string;
}) {
  return (
    <Popover
      content={
        <div className="space-y-1">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      }
      className={className}
    >
      {children}
    </Popover>
  );
}

export function DropdownPopover({ 
  children, 
  items, 
  title,
  className = '' 
}: { 
  children: ReactNode;
  items: Array<{ label: string; onClick: () => void; icon?: any }>;
  title?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      content={
        <div className="space-y-1">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      }
      title={title}
      className={className}
    >
      <div className="flex items-center space-x-1 cursor-pointer">
        {children}
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>
    </Popover>
  );
} 