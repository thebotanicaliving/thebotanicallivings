import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface ScrollRevealProps extends Omit<HTMLMotionProps<'div'>, 'children' | 'transition'> {
  children: ReactNode;
  className?: string;
  variant?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleUp';
  duration?: number;
  delay?: number;
  distance?: number;
  threshold?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className,
  variant = 'slideUp',
  duration = 1.0,
  delay = 0,
  distance = 15,
  threshold = 0.05,
  once = true, // default to true to keep scroll solid, premium, and avoid repetitive jittery "flying" elements
  ...props
}: ScrollRevealProps) {
  const getVariants = () => {
    switch (variant) {
      case 'fadeIn':
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        };
      case 'slideUp':
        return {
          hidden: { opacity: 0, y: distance },
          visible: { opacity: 1, y: 0 },
        };
      case 'slideDown':
        return {
          hidden: { opacity: 0, y: -distance },
          visible: { opacity: 1, y: 0 },
        };
      case 'slideLeft':
        return {
          hidden: { opacity: 0, x: distance },
          visible: { opacity: 1, x: 0 },
        };
      case 'slideRight':
        return {
          hidden: { opacity: 0, x: -distance },
          visible: { opacity: 1, x: 0 },
        };
      case 'scaleUp':
        return {
          hidden: { opacity: 0, scale: 0.98 },
          visible: { opacity: 1, scale: 1 },
        };
      default:
        return {
          hidden: { opacity: 0, y: distance },
          visible: { opacity: 1, y: 0 },
        };
    }
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      variants={getVariants()}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // premium custom cubic-bezier easeOutExpo curve
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface ScrollStaggerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delay?: number;
  once?: boolean;
  threshold?: number;
}

export function ScrollStagger({
  children,
  className,
  staggerDelay = 0.08,
  delay = 0,
  once = true, // default to true to match premium standard
  threshold = 0.05,
}: ScrollStaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
