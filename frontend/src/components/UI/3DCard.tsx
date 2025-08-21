import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  background?: string;
  border?: string;
  shadow?: string;
  hoverScale?: number;
  rotateIntensity?: number;
  childrenClassName?: string;
}

export const Card3D: React.FC<Card3DProps> = ({
  children,
  className,
  background = 'bg-white',
  border = 'border border-gray-200',
  shadow = 'shadow-lg',
  hoverScale = 1.05,
  rotateIntensity = 15,
  childrenClassName
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useTransform(y, [0, 1], [rotateIntensity, -rotateIntensity]);
  const rotateY = useTransform(x, [0, 1], [-rotateIntensity, rotateIntensity]);

  const springConfig = { damping: 20, stiffness: 300 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const xPct = mouseX / width;
    const yPct = mouseY / height;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      className={cn(
        'relative cursor-pointer perspective-1000',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      <motion.div
        className={cn(
          'w-full h-full transition-all duration-300 ease-out',
          background,
          border,
          shadow,
          childrenClassName
        )}
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          scale: isHovered ? hoverScale : 1,
        }}
        whileHover={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Variant components
export const Card3DGlass: React.FC<Omit<Card3DProps, 'background' | 'border' | 'shadow'> & { 
  background?: string;
  border?: string;
  shadow?: string;
}> = (props) => (
  <Card3D
    {...props}
    background={props.background || 'bg-white/20 backdrop-blur-md'}
    border={props.border || 'border border-white/30'}
    shadow={props.shadow || 'shadow-2xl'}
  />
);

export const Card3DGradient: React.FC<Omit<Card3DProps, 'background'> & { 
  gradient?: string;
}> = ({ gradient = 'from-blue-500 to-purple-600', ...props }) => (
  <Card3D
    {...props}
    background={`bg-gradient-to-br ${gradient}`}
    border="border-0"
    shadow="shadow-2xl"
  />
);
