import { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { motion } from 'motion/react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'cream' | 'transparent';
  spacing?: 'same' | 'transition';
  id?: string;
  animate?: boolean;
}

export function Section({
  children,
  className,
  variant = 'transparent',
  spacing = 'same',
  id,
  animate = true,
}: SectionProps) {
  const bgClasses = {
    light: 'bg-muted-bg text-text-primary',
    dark: 'bg-dark-forest text-warm-cream',
    cream: 'bg-warm-cream text-text-primary',
    transparent: 'bg-transparent text-text-primary',
  };

  const spacingClasses = {
    same: 'py-20 md:py-24', // 80px to 96px for responsive spacing
    transition: 'py-28 md:py-32', // 112px to 128px for background transitions
  };

  const Component = (animate ? motion.section : 'section') as any;

  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 45, scale: 0.98 },
        whileInView: { opacity: 1, y: 0, scale: 1 },
        viewport: { once: false, margin: '-10% 0px' },
        transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
      }
    : {};

  return (
    <Component
      id={id}
      className={cn(
        'relative w-full overflow-hidden',
        bgClasses[variant],
        spacingClasses[spacing],
        className
      )}
      {...motionProps}
    >
      {children}
    </Component>
  );
}
