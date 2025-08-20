'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Heart, Zap, Star, Circle, Square, Triangle } from 'lucide-react';

interface AnimatedLoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'heartbeat' | 'bounce' | 'wave' | 'ripple' | 'custom';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'custom';
  customColor?: string;
  text?: string;
  showText?: boolean;
  className?: string;
}

const AnimatedLoading: React.FC<AnimatedLoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  color = 'primary',
  customColor,
  text = 'Yükleniyor...',
  showText = true,
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-8 h-8';
      case 'xl': return 'w-12 h-12';
      default: return 'w-6 h-6';
    }
  };

  const getColorClasses = () => {
    if (customColor) return customColor;
    
    switch (color) {
      case 'secondary': return 'text-gray-600 dark:text-gray-400';
      case 'success': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  const renderSpinner = () => (
    <motion.div
      className={`${getSizeClasses()} ${getColorClasses()}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <Loader2 className="w-full h-full" />
    </motion.div>
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`w-2 h-2 rounded-full ${getColorClasses().replace('text-', 'bg-')}`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <motion.div
      className={`${getSizeClasses()} rounded-full ${getColorClasses().replace('text-', 'bg-')}`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );

  const renderHeartbeat = () => (
    <motion.div
      className={`${getSizeClasses()} ${getColorClasses()}`}
      animate={{
        scale: [1, 1.3, 1],
        rotate: [0, 5, -5, 0]
      }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Heart className="w-full h-full" fill="currentColor" />
    </motion.div>
  );

  const renderBounce = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`w-2 h-2 rounded-full ${getColorClasses().replace('text-', 'bg-')}`}
          animate={{
            y: [0, -10, 0]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  const renderWave = () => (
    <div className="flex space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${getColorClasses().replace('text-', 'bg-')}`}
          animate={{
            height: [10, 20, 10]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  const renderRipple = () => (
    <div className="relative">
      <motion.div
        className={`${getSizeClasses()} rounded-full ${getColorClasses().replace('text-', 'bg-')}`}
        animate={{
          scale: [1, 2],
          opacity: [1, 0]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeOut"
        }}
      />
      <motion.div
        className={`absolute inset-0 ${getSizeClasses()} rounded-full ${getColorClasses().replace('text-', 'bg-')}`}
        animate={{
          scale: [1, 2],
          opacity: [1, 0]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: 0.5,
          ease: "easeOut"
        }}
      />
    </div>
  );

  const renderCustom = () => (
    <div className="flex space-x-2">
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Circle className={`w-4 h-4 ${getColorClasses()}`} />
      </motion.div>
      <motion.div
        animate={{
          rotate: [360, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Square className={`w-4 h-4 ${getColorClasses()}`} />
      </motion.div>
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Triangle className={`w-4 h-4 ${getColorClasses()}`} />
      </motion.div>
    </div>
  );

  const renderLoadingAnimation = () => {
    switch (variant) {
      case 'dots': return renderDots();
      case 'pulse': return renderPulse();
      case 'heartbeat': return renderHeartbeat();
      case 'bounce': return renderBounce();
      case 'wave': return renderWave();
      case 'ripple': return renderRipple();
      case 'custom': return renderCustom();
      default: return renderSpinner();
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {renderLoadingAnimation()}
      
      {showText && text && (
        <motion.p
          className={`text-sm ${getColorClasses()} text-center`}
          animate={{
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default AnimatedLoading;

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