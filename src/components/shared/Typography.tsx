import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface HeadingProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4;
  className?: string;
  id?: string;
}

export function Heading({ children, level = 2, className, id }: HeadingProps) {
  const Tag = `h${level}` as const;
  
  const baseClasses = 'font-heading tracking-tight text-balance';
  
  const levels = {
    1: 'text-4xl md:text-5xl lg:text-6xl font-light text-dark-forest leading-tight',
    2: 'text-3xl md:text-4xl lg:text-5xl font-light text-dark-forest leading-snug',
    3: 'text-2xl md:text-3xl font-medium text-dark-forest leading-snug',
    4: 'text-xl md:text-2xl font-medium text-dark-forest leading-normal',
  };

  return (
    <Tag
      id={id}
      className={cn(baseClasses, levels[level], className)}
    >
      {children}
    </Tag>
  );
}

interface ParagraphProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
}

export function Paragraph({ children, className, size = 'md', id }: ParagraphProps) {
  const sizes = {
    sm: 'text-sm leading-relaxed text-text-secondary',
    md: 'text-base leading-relaxed text-text-secondary max-w-[75ch]',
    lg: 'text-lg md:text-xl leading-relaxed text-text-secondary max-w-[75ch]',
  };

  return (
    <p
      id={id}
      className={cn(sizes[size], className)}
    >
      {children}
    </p>
  );
}
