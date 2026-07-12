import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { getDirectMediaUrl } from '@/utils/media';

interface ProgressiveImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | 'wide' | 'auto';
  radius?: 'card' | 'image' | 'button' | 'none' | 'full';
  id?: string;
}

export function ProgressiveImage({
  src,
  alt,
  placeholderSrc,
  className,
  containerClassName,
  aspectRatio = 'auto',
  radius = 'image',
  id,
  ...props
}: ProgressiveImageProps) {
  const resolvedSrc = getDirectMediaUrl(src);
  const [isHighResLoaded, setIsHighResLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const highResRef = useRef<HTMLImageElement>(null);

  // Reset states if src changes
  useEffect(() => {
    setIsHighResLoaded(false);
  }, [src]);

  // If high-res image is already complete in browser cache, fire loaded state immediately
  useEffect(() => {
    if (highResRef.current && highResRef.current.complete) {
      setIsHighResLoaded(true);
    }
  }, [isInView, resolvedSrc]);

  // Helper to generate a low-res Unsplash placeholder if none is provided
  const getPlaceholder = (originalSrc: string): string => {
    if (placeholderSrc) return placeholderSrc;
    const directSrc = getDirectMediaUrl(originalSrc);
    if (directSrc && directSrc.includes('images.unsplash.com')) {
      // Create a tiny, highly compressed version of the Unsplash image
      return directSrc
        .replace(/q=\d+/, 'q=10')
        .replace(/w=\d+/, 'w=50')
        .replace(/&blur=\d+/, '') + '&blur=10';
    }
    // Fallback: use a beautiful warm neutral SVG background while waiting
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f7f5ef"/></svg>`;
  };

  const lowResSrc = getPlaceholder(resolvedSrc);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // Load once and stop observing
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before it enters the viewport
        threshold: 0.01,
      }
    );

    const currentEl = containerRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      observer.disconnect();
    };
  }, [src]);

  const aspectStyles = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    wide: 'aspect-[16/9]',
    auto: 'h-auto',
  };

  const radiusStyles = {
    card: 'rounded-card',
    image: 'rounded-image',
    button: 'rounded-button',
    none: 'rounded-none',
    full: 'rounded-full',
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-stone/20 transition-all duration-500',
        aspectStyles[aspectRatio],
        radiusStyles[radius],
        containerClassName
      )}
    >
      {/* 1. Low-res Blurred Placeholder */}
      <img
        src={lowResSrc}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-1000 ease-in-out',
          isHighResLoaded ? 'opacity-0' : 'opacity-100',
          'filter blur-[12px] scale-110 absolute inset-0'
        )}
        referrerPolicy="no-referrer"
      />

      {/* 2. High-res Image (Loaded only when in view) */}
      {isInView && (
        <img
          ref={highResRef}
          id={id}
          src={resolvedSrc}
          alt={alt}
          onLoad={() => setIsHighResLoaded(true)}
          referrerPolicy="no-referrer"
          className={cn(
            'w-full h-full object-cover transition-all duration-1000 ease-out absolute inset-0',
            isHighResLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-[4px]',
            className
          )}
          {...props}
        />
      )}
    </div>
  );
}

export default ProgressiveImage;
