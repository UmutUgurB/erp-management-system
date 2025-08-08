'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GradientBackgroundProps {
  children: ReactNode;
  type?: 'static' | 'animated' | 'mesh' | 'particles';
  colors?: string[];
  className?: string;
}

export default function GradientBackground({
  children,
  type = 'static',
  colors = ['#6366f1', '#8b5cf6', '#ec4899'],
  className = ''
}: GradientBackgroundProps) {
  const getGradientStyle = () => {
    switch (type) {
      case 'animated':
        return (
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                `linear-gradient(45deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
                `linear-gradient(135deg, ${colors[1]}, ${colors[2]}, ${colors[0]})`,
                `linear-gradient(225deg, ${colors[2]}, ${colors[0]}, ${colors[1]})`,
                `linear-gradient(315deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        );

      case 'mesh':
        return (
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-tl from-blue-500 via-cyan-500 to-teal-500 opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500 via-orange-500 to-red-500 opacity-20" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-bl from-green-500 via-emerald-500 to-teal-500 opacity-20"
              animate={{
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        );

      case 'particles':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full opacity-20"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
                animate={{
                  y: [0, -100, 0],
                  x: [0, Math.random() * 50 - 25, 0],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.5, 1]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30" />
          </div>
        );

      default:
        return (
          <div 
            className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
            style={{
              background: `linear-gradient(135deg, ${colors.join(', ')})`
            }}
          />
        );
    }
  };

  return (
    <div className={`relative min-h-screen ${className}`}>
      {getGradientStyle()}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Specialized gradient components
export function HeroGradient({ children }: { children: ReactNode }) {
  return (
    <GradientBackground type="animated" className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center text-white">
        {children}
      </div>
    </GradientBackground>
  );
}

export function CardGradient({ children }: { children: ReactNode }) {
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
  children: ReactNode;
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