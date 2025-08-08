'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HoverCardProps {
  children: ReactNode;
  effect?: 'lift' | 'glow' | 'scale' | 'rotate' | 'slide' | 'tilt';
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export default function HoverCard({
  children,
  effect = 'lift',
  className = '',
  onClick,
  interactive = true
}: HoverCardProps) {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300';
  
  const getEffectVariants = () => {
    switch (effect) {
      case 'lift':
        return {
          hover: {
            y: -8,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            transition: { duration: 0.3, ease: "easeOut" }
          }
        };

      case 'glow':
        return {
          hover: {
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)',
            scale: 1.02,
            transition: { duration: 0.3 }
          }
        };

      case 'scale':
        return {
          hover: {
            scale: 1.05,
            transition: { duration: 0.3 }
          }
        };

      case 'rotate':
        return {
          hover: {
            rotateY: 5,
            rotateX: 5,
            transition: { duration: 0.3 }
          }
        };

      case 'slide':
        return {
          hover: {
            x: 10,
            transition: { duration: 0.3 }
          }
        };

      case 'tilt':
        return {
          hover: {
            rotateZ: 2,
            scale: 1.02,
            transition: { duration: 0.3 }
          }
        };

      default:
        return {
          hover: {
            y: -4,
            transition: { duration: 0.3 }
          }
        };
    }
  };

  const CardContent = () => (
    <motion.div
      className={cn(baseClasses, className)}
      variants={getEffectVariants()}
      whileHover={interactive ? "hover" : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      onClick={onClick}
      style={interactive ? { cursor: onClick ? 'pointer' : 'default' } : {}}
    >
      {children}
    </motion.div>
  );

  if (effect === 'tilt') {
    return (
      <motion.div
        className="perspective-1000"
        whileHover={interactive ? { rotateY: 5, rotateX: 5 } : undefined}
        transition={{ duration: 0.3 }}
      >
        <CardContent />
      </motion.div>
    );
  }

  return <CardContent />;
}

// Specialized card components
export function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  className = '' 
}: {
  title: string;
  value: string;
  change?: number;
  icon?: any;
  className?: string;
}) {
  return (
    <HoverCard effect="lift" className={className}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            {change !== undefined && (
              <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change}%
              </p>
            )}
          </div>
          {Icon && (
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
              <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          )}
        </div>
      </div>
    </HoverCard>
  );
}

export function FeatureCard({ 
  title, 
  description, 
  icon: Icon, 
  className = '' 
}: {
  title: string;
  description: string;
  icon?: any;
  className?: string;
}) {
  return (
    <HoverCard effect="glow" className={className}>
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {Icon && (
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
          </div>
        </div>
      </div>
    </HoverCard>
  );
}

export function ActionCard({ 
  title, 
  description, 
  action, 
  className = '' 
}: {
  title: string;
  description: string;
  action: ReactNode;
  className?: string;
}) {
  return (
    <HoverCard effect="scale" className={className}>
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        <div className="flex justify-end">
          {action}
        </div>
      </div>
    </HoverCard>
  );
} 