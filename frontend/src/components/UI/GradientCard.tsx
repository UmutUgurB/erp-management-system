import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GradientCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'custom';
  customGradient?: string;
  hover?: boolean;
  onClick?: () => void;
}

const gradients = {
  blue: 'from-blue-500 via-blue-600 to-blue-700',
  purple: 'from-purple-500 via-purple-600 to-purple-700',
  green: 'from-green-500 via-green-600 to-green-700',
  orange: 'from-orange-500 via-orange-600 to-orange-700',
  pink: 'from-pink-500 via-pink-600 to-pink-700',
  custom: ''
};

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  className,
  gradient = 'blue',
  customGradient,
  hover = true,
  onClick
}) => {
  const gradientClass = customGradient || gradients[gradient];
  
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl p-6 text-white shadow-2xl',
        hover && 'cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-3xl',
        className
      )}
      whileHover={hover ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`} />
      
      {/* Overlay pattern */}
      <div className="absolute inset-0 bg-black/10" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine" />
    </motion.div>
  );
};

// Shine animation keyframes
const shineAnimation = `
  @keyframes shine {
    100% {
      transform: translateX(100%);
    }
  }
`;

// Add to global CSS or create a style tag
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shineAnimation;
  document.head.appendChild(style);
}
