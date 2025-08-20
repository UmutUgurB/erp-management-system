'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'sunset' | 'ocean' | 'forest' | 'cosmic' | 'custom';
  animated?: boolean;
  speed?: 'slow' | 'normal' | 'fast';
  opacity?: number;
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  className = '',
  variant = 'default',
  animated = true,
  speed = 'normal',
  opacity = 1
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    if (animated) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (animated) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [animated]);

  const getGradientColors = () => {
    switch (variant) {
      case 'sunset':
        return {
          from: 'from-orange-400 via-pink-500 to-red-500',
          to: 'to-orange-400 via-pink-500 from-red-500'
        };
      case 'ocean':
        return {
          from: 'from-blue-400 via-cyan-500 to-teal-500',
          to: 'to-blue-400 via-cyan-500 from-teal-500'
        };
      case 'forest':
        return {
          from: 'from-green-400 via-emerald-500 to-teal-500',
          to: 'to-green-400 via-emerald-500 from-teal-500'
        };
      case 'cosmic':
        return {
          from: 'from-purple-400 via-pink-500 to-indigo-500',
          to: 'to-purple-400 via-pink-500 from-indigo-500'
        };
      case 'custom':
        return {
          from: 'from-violet-400 via-fuchsia-500 to-cyan-500',
          to: 'to-violet-400 via-fuchsia-500 from-cyan-500'
        };
      default:
        return {
          from: 'from-indigo-500 via-purple-500 to-pink-500',
          to: 'to-indigo-500 via-purple-500 from-pink-500'
        };
    }
  };

  const getAnimationSpeed = () => {
    switch (speed) {
      case 'slow': return 20;
      case 'fast': return 5;
      default: return 10;
    }
  };

  const colors = getGradientColors();
  const animationSpeed = getAnimationSpeed();

  return (
    <div className={`relative min-h-screen overflow-hidden ${className}`}>
      {/* Animated Background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${colors.from} ${colors.to}`}
        style={{ opacity }}
        animate={animated ? {
          background: [
            `linear-gradient(45deg, var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to))`,
            `linear-gradient(135deg, var(--tw-gradient-to), var(--tw-gradient-from), var(--tw-gradient-via))`,
            `linear-gradient(225deg, var(--tw-gradient-via), var(--tw-gradient-to), var(--tw-gradient-from))`,
            `linear-gradient(315deg, var(--tw-gradient-from), var(--tw-gradient-to), var(--tw-gradient-via))`
          ]
        } : {}}
        transition={{
          duration: animationSpeed,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Floating Elements */}
      {animated && (
        <>
          <motion.div
            className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: animationSpeed * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-40 right-32 w-24 h-24 bg-white/10 rounded-full blur-xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 0.8, 1]
            }}
            transition={{
              duration: animationSpeed * 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div
            className="absolute bottom-32 left-1/3 w-40 h-40 bg-white/5 rounded-full blur-2xl"
            animate={{
              x: [0, 120, 0],
              y: [0, -80, 0],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: animationSpeed * 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </>
      )}

      {/* Interactive Mouse Follow Effect */}
      {animated && (
        <motion.div
          className="absolute w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"
          animate={{
            x: mousePosition.x - 192,
            y: mousePosition.y - 192
          }}
          transition={{
            type: "spring",
            stiffness: 50,
            damping: 20
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Overlay Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
      </div>
    </div>
  );
};

export default GradientBackground;

// Specialized gradient components
export function HeroGradient({ children }: { children: React.ReactNode }) {
  return (
    <GradientBackground type="animated" className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center text-white">
        {children}
      </div>
    </GradientBackground>
  );
}

export function CardGradient({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative p-1 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6">
        {children}
      </div>
    </div>
  );
}

export function AnimatedGradientText({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={`bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent ${className}`}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "linear"
      }}
      style={{
        backgroundSize: '200% 200%'
      }}
    >
      {children}
    </motion.div>
  );
} 