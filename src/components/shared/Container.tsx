import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Container({ children, className, id }: ContainerProps) {
  return (
    <div
      id={id || 'app-container'}
      className={cn(
        'w-full max-w-[1300px] mx-auto px-5 md:px-8 xl:px-12',
        className
      )}
    >
      {children}
    </div>
  );
}
