import React, { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimalPlaces?: number;
  formatNumber?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-6xl'
};

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2,
  delay = 0,
  className,
  prefix = '',
  suffix = '',
  decimalPlaces = 0,
  formatNumber = true,
  color = 'text-gray-900',
  size = 'md',
  showIcon = false,
  icon,
  iconPosition = 'left'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  const count = useMotionValue(0);
  const rounded = useMotionValue(0);

  const springCount = useSpring(count, {
    duration: duration * 1000,
    delay: delay * 1000,
    ease: 'easeOut'
  });

  const springRounded = useSpring(rounded, {
    duration: duration * 1000,
    delay: delay * 1000,
    ease: 'easeOut'
  });

  useEffect(() => {
    if (isInView) {
      count.set(value);
      rounded.set(value);
    }
  }, [isInView, value, count, rounded]);

  const formatValue = (val: number) => {
    if (formatNumber) {
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M';
      } else if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K';
      }
    }
    return val.toFixed(decimalPlaces);
  };

  const renderIcon = () => {
    if (!showIcon || !icon) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + duration * 0.5, duration: 0.5 }}
        className="inline-block"
      >
        {icon}
      </motion.div>
    );
  };

  return (
    <div ref={ref} className={cn('flex items-center gap-2', className)}>
      {showIcon && iconPosition === 'left' && renderIcon()}
      
      <motion.div className={cn('font-bold', color, sizeClasses[size])}>
        {prefix}
        <motion.span>
          {springCount.get() === 0 ? '0' : 
           springCount.get().toFixed(decimalPlaces)}
        </motion.span>
        {suffix}
      </motion.div>
      
      {showIcon && iconPosition === 'right' && renderIcon()}
    </div>
  );
};

// Specialized counter components
export const CurrencyCounter: React.FC<Omit<AnimatedCounterProps, 'prefix' | 'suffix' | 'formatNumber'> & {
  currency?: string;
  locale?: string;
}> = ({ currency = '₺', locale = 'tr-TR', ...props }) => (
  <AnimatedCounter
    {...props}
    prefix={currency}
    formatNumber={true}
    decimalPlaces={2}
  />
);

export const PercentageCounter: React.FC<Omit<AnimatedCounterProps, 'suffix' | 'decimalPlaces'> & {
  showPlusSign?: boolean;
}> = ({ showPlusSign = true, ...props }) => (
  <AnimatedCounter
    {...props}
    prefix={showPlusSign && props.value > 0 ? '+' : ''}
    suffix="%"
    decimalPlaces={1}
  />
);

export const TimeCounter: React.FC<Omit<AnimatedCounterProps, 'suffix' | 'formatNumber'> & {
  unit?: 'seconds' | 'minutes' | 'hours' | 'days';
}> = ({ unit = 'seconds', ...props }) => {
  const unitMap = {
    seconds: 's',
    minutes: 'm',
    hours: 'h',
    days: 'd'
  };
  
  return (
    <AnimatedCounter
      {...props}
      suffix={unitMap[unit]}
      formatNumber={false}
    />
  );
};
