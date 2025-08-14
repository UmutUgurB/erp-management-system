'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

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
  onComplete?: () => void;
}

export default function Confetti({ 
  isActive, 
  duration = 3000, 
  pieceCount = 50,
  colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'],
  onComplete 
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!isActive) {
      setPieces([]);
      return;
    }

    // Generate confetti pieces
    const newPieces: ConfettiPiece[] = Array.from({ length: pieceCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -20,
      rotation: Math.random() * 360,
      scale: Math.random() * 0.5 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5
    }));

    setPieces(newPieces);

    // Cleanup after animation
    const timer = setTimeout(() => {
      setPieces([]);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [isActive, pieceCount, colors, duration, onComplete]);

  if (!isActive || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: `${piece.x}%`,
            backgroundColor: piece.color,
            boxShadow: `0 0 6px ${piece.color}`,
          }}
          initial={{
            y: piece.y,
            x: piece.x,
            rotation: piece.rotation,
            scale: piece.scale,
            opacity: 1
          }}
          animate={{
            y: [piece.y, piece.y + 120],
            x: [piece.x, piece.x + (Math.random() - 0.5) * 40],
            rotation: [piece.rotation, piece.rotation + 360],
            scale: [piece.scale, piece.scale * 0.8],
            opacity: [1, 0]
          }}
          transition={{
            duration: duration / 1000,
            delay: piece.delay,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
}

// Specialized confetti components
export function SuccessConfetti({ isActive, onComplete }: { isActive: boolean; onComplete?: () => void }) {
  return (
    <Confetti
      isActive={isActive}
      colors={['#10b981', '#059669', '#34d399', '#6ee7b7']}
      pieceCount={60}
      duration={4000}
      onComplete={onComplete}
    />
  );
}

export function CelebrationConfetti({ isActive, onComplete }: { isActive: boolean; onComplete?: () => void }) {
  return (
    <Confetti
      isActive={isActive}
      colors={['#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']}
      pieceCount={80}
      duration={5000}
      onComplete={onComplete}
    />
  );
}

export function BirthdayConfetti({ isActive, onComplete }: { isActive: boolean; onComplete?: () => void }) {
  return (
    <Confetti
      isActive={isActive}
      colors={['#fbbf24', '#f59e0b', '#d97706', '#92400e', '#78350f']}
      pieceCount={100}
      duration={6000}
      onComplete={onComplete}
    />
  );
}

// Hook for easy confetti usage
export function useConfetti() {
  const [isActive, setIsActive] = useState(false);

  const trigger = (duration = 3000) => {
    setIsActive(true);
    setTimeout(() => setIsActive(false), duration);
  };

  return { isActive, trigger };
} 