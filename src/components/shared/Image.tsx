import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { getDirectMediaUrl } from '@/utils/media';

// Global cache to track already-loaded image URLs to prevent rendering-flicker on filter/tab changes
const loadedImagesGlobal = new Set<string>();

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | 'wide' | 'auto';
  radius?: 'card' | 'image' | 'button' | 'none' | 'full';
  id?: string;
  loading?: 'lazy' | 'eager';
}

export function Image({
  src,
  alt,
  className,
  containerClassName,
  aspectRatio = 'auto',
  radius = 'image',
  id,
  loading = 'lazy',
  ...props
}: ImageProps) {
  const resolvedSrc = getDirectMediaUrl(src);
  const [imgSrc, setImgSrc] = useState(resolvedSrc);
  const [isLoaded, setIsLoaded] = useState(() => {
    return loadedImagesGlobal.has(resolvedSrc);
  });
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const nextSrc = getDirectMediaUrl(src);
    if (nextSrc !== imgSrc) {
      setImgSrc(nextSrc);
      setIsLoaded(loadedImagesGlobal.has(nextSrc));
    }
  }, [src, imgSrc]);

  // Handle cached images that are already loaded when DOM is ready or src changes
  useEffect(() => {
    if (loadedImagesGlobal.has(imgSrc)) {
      setIsLoaded(true);
      return;
    }
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
      loadedImagesGlobal.add(imgSrc);
    }
  }, [imgSrc]);

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
      className={cn(
        'relative overflow-hidden bg-stone/30 transition-all duration-500',
        aspectStyles[aspectRatio],
        radiusStyles[radius],
        containerClassName
      )}
    >
      {/* Subtle loader skeleton */}
      {!isLoaded && imgSrc && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-stone/10 via-stone/20 to-stone/10" />
      )}
      {imgSrc && (
        <img
          ref={imgRef}
          id={id}
          src={imgSrc}
          alt={alt}
          loading={loading}
          referrerPolicy="no-referrer"
          onLoad={() => {
            setIsLoaded(true);
            loadedImagesGlobal.add(imgSrc);
          }}
          onError={() => {
            if (imgSrc !== 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1200&auto=format&fit=crop') {
              setImgSrc('https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1200&auto=format&fit=crop');
            } else {
              setIsLoaded(true); // Stop loading animation if even the fallback fails
            }
          }}
          className={cn(
            'w-full h-full object-cover transition-all duration-700 ease-out',
            isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-md',
            className
          )}
          {...props}
        />
      )}
    </div>
  );
}

export default Image;
