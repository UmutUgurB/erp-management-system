'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function RouteProgress() {
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastPathRef.current === null) {
      lastPathRef.current = pathname;
      return;
    }
    if (lastPathRef.current !== pathname) {
      lastPathRef.current = pathname;
      setIsActive(true);
      setProgress(10);

      // Simulate incremental progress until completion
      timerRef.current = window.setInterval(() => {
        setProgress((p) => {
          if (p >= 95) return p;
          // Slow down as it approaches 95
          const delta = Math.max(1, 10 - Math.floor(p / 10));
          return Math.min(95, p + delta);
        });
      }, 120);

      // Complete after short delay
      const completeTimeout = window.setTimeout(() => {
        setProgress(100);
        window.setTimeout(() => setIsActive(false), 250);
      }, 600);

      return () => {
        if (timerRef.current) window.clearInterval(timerRef.current);
        window.clearTimeout(completeTimeout);
      };
    }
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="route-progress"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[60]"
        >
          <div className="h-0.5 bg-transparent">
            <motion.div
              className="h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.15 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


