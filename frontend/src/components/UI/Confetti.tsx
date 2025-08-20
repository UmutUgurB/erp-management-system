'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
}

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
  pieceCount?: number;
  colors?: string[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onComplete?: () => void;
}

const Confetti: React.FC<ConfettiProps> = ({
  isActive,
  duration = 3000,
  pieceCount = 50,
  colors = ['#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'],
  size = 'md',
  className = '',
  onComplete
}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-2 h-2';
      case 'lg': return 'w-4 h-4';
      default: return 'w-3 h-3';
    }
  };

  const generatePieces = useCallback(() => {
    const newPieces: ConfettiPiece[] = [];
    
    for (let i = 0; i < pieceCount; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5
      });
    }
    
    setPieces(newPieces);
  }, [pieceCount, colors]);

  const startAnimation = useCallback(() => {
    if (isActive && !isAnimating) {
      setIsAnimating(true);
      generatePieces();
      
      setTimeout(() => {
        setIsAnimating(false);
        setPieces([]);
        onComplete?.();
      }, duration);
    }
  }, [isActive, isAnimating, duration, generatePieces, onComplete]);

  useEffect(() => {
    if (isActive) {
      startAnimation();
    }
  }, [isActive, startAnimation]);

  const renderConfettiPiece = (piece: ConfettiPiece) => (
    <motion.div
      key={piece.id}
      className={`absolute ${getSizeClasses()} rounded-sm ${className}`}
      style={{
        left: `${piece.x}%`,
        backgroundColor: piece.color,
        zIndex: 1000
      }}
      initial={{
        y: piece.y,
        x: piece.x,
        rotation: piece.rotation,
        scale: 0,
        opacity: 0
      }}
      animate={{
        y: [piece.y, piece.y + 100 + Math.random() * 50],
        x: [piece.x, piece.x + (Math.random() - 0.5) * 40],
        rotation: [piece.rotation, piece.rotation + 360 + Math.random() * 180],
        scale: [0, piece.scale, piece.scale * 0.8],
        opacity: [0, 1, 0.8, 0]
      }}
      transition={{
        duration: duration / 1000,
        delay: piece.delay,
        ease: "easeOut"
      }}
    />
  );

  if (!isActive && !isAnimating) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {pieces.map(renderConfettiPiece)}
      </AnimatePresence>
    </div>
  );
};

export default Confetti;

// Specialized confetti components
export const SuccessConfetti: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <Confetti
    isActive={isActive}
    colors={['#22c55e', '#16a34a', '#15803d', '#166534']}
    pieceCount={30}
    duration={4000}
  />
);

export const CelebrationConfetti: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <Confetti
    isActive={isActive}
    colors={['#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']}
    pieceCount={80}
    duration={5000}
    size="lg"
  />
);

export const RainConfetti: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <Confetti
    isActive={isActive}
    colors={['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a']}
    pieceCount={100}
    duration={6000}
    size="sm"
  />
);

// Hook for easy confetti usage
export function useConfetti() {
  const [isActive, setIsActive] = useState(false);

  const trigger = (duration = 3000) => {
    setIsActive(true);
    setTimeout(() => setIsActive(false), duration);
  };

  return { isActive, trigger };
} 