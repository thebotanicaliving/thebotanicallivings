import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { motion } from 'motion/react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  border?: boolean;
  id?: string;
  animate?: boolean;
}

export function Card({
  children,
  className,
  hover = true,
  border = true,
  id,
  animate = true,
  ...props
}: CardProps) {
  const Component = (animate ? motion.div : 'div') as any;
  
  const motionProps = animate
    ? {
        whileHover: hover ? { y: -6, transition: { duration: 0.3, ease: 'easeOut' } } : {},
      }
    : {};

  return (
    <Component
      id={id}
      className={cn(
        'bg-white rounded-card p-6 md:p-8 transition-shadow duration-300',
        border && 'border border-border/60',
        hover && 'hover:shadow-hover shadow-subtle',
        !hover && 'shadow-subtle',
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
}
export default Card;
