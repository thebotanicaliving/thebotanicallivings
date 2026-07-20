import { cn } from '@/utils/cn';

interface MarqueeProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
}

export function Marquee({
  children,
  direction = 'left',
  speed = 40,
  pauseOnHover = true,
  className,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        'group flex overflow-hidden [--duration:40s] [--gap:1rem] [gap:var(--gap)]',
        className
      )}
      style={{ '--duration': `${speed}s` } as React.CSSProperties}
    >
      <div
        className={cn(
          'flex shrink-0 justify-around [gap:var(--gap)]',
          direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right',
          pauseOnHover && 'group-hover:[animation-play-state:paused]'
        )}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
