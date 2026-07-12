import React from 'react';
import { cn } from '@/utils/cn';

interface VideoPlayerProps {
  url: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  aspectRatio?: 'horizontal' | 'vertical' | 'auto';
  onLoadedData?: () => void;
  isPlaying?: boolean;
  poster?: string;
}

export function VideoPlayerComponent({ 
  url, 
  className, 
  autoPlay = true, 
  controls = false, 
  loop = true, 
  muted = true,
  aspectRatio = 'auto',
  onLoadedData,
  isPlaying = true,
  poster
}: VideoPlayerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const singleVideoRef = React.useRef<HTMLVideoElement>(null);
  const verticalBgRef = React.useRef<HTMLVideoElement>(null);
  const verticalFgRef = React.useRef<HTMLVideoElement>(null);
  const didTriggerLoaded = React.useRef(false);

  // Parse URL safely even if empty/null
  const urlString = (url || '').trim();
  let finalUrl = urlString;

  // Extract source URL if pasted inside iframe code
  if (finalUrl.includes('<iframe') && finalUrl.includes('src=')) {
    const srcMatch = finalUrl.match(/src="([^"]+)"/) || finalUrl.match(/src='([^']+)'/);
    if (srcMatch) {
      finalUrl = srcMatch[1];
    }
  }

  // Ensure absolute protocol
  if (finalUrl && !finalUrl.startsWith('http') && !finalUrl.startsWith('/') && !finalUrl.startsWith('blob:')) {
    finalUrl = 'https://' + finalUrl;
  }

  // Convert Pexels view URL to download/direct stream URL
  const pexelsMatch = finalUrl.match(/pexels\.com\/(?:[a-z]{2}-[a-z]{2}\/)?video\/(?:[a-zA-Z0-9_-]+-)?(\d+)/i) || 
                      finalUrl.match(/pexels\.com\/download\/video\/(\d+)/i);
  if (pexelsMatch) {
    finalUrl = `https://www.pexels.com/download/video/${pexelsMatch[1]}/`;
  }

  // Convert Google Drive view URL to direct stream/download URL
  let fileId = '';
  const driveMatch1 = finalUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  const driveMatch2 = finalUrl.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  const driveMatch3 = finalUrl.match(/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/);
  
  if (driveMatch1) {
    fileId = driveMatch1[1];
  } else if (driveMatch2) {
    fileId = driveMatch2[1];
  } else if (driveMatch3) {
    fileId = driveMatch3[1];
  }

  if (fileId) {
    finalUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  // Check if it's a vertical video (YouTube Shorts, containing vertical/portrait, or explicitly styled/requested)
  const isVerticalVideo = 
    aspectRatio === 'vertical' || 
    (aspectRatio === 'auto' && (
      finalUrl.includes('shorts') || 
      finalUrl.includes('vertical') || 
      finalUrl.includes('portrait') || 
      className?.includes('aspect-[9/16]') ||
      className?.includes('aspect-portrait')
    ));

  // Reset trigger state if URL changes
  React.useEffect(() => {
    didTriggerLoaded.current = false;
  }, [url]);

  const handleMediaLoaded = () => {
    if (didTriggerLoaded.current) return;
    didTriggerLoaded.current = true;
    if (onLoadedData) {
      onLoadedData();
    }
  };

  const [canStartPlayback, setCanStartPlayback] = React.useState(() => {
    if (typeof document === 'undefined') return true;
    return !document.documentElement.hasAttribute('data-preloading');
  });

  React.useEffect(() => {
    if (canStartPlayback) return;

    const handleLoaderFading = () => {
      // Delay slightly to allow the preloader's opacity transition to gain hardware momentum smoothly
      const t = setTimeout(() => {
        setCanStartPlayback(true);
      }, 150);
      return () => clearTimeout(t);
    };

    window.addEventListener('loader-fading-out', handleLoaderFading);
    window.addEventListener('loader-done', handleLoaderFading);

    // Safety fallback
    const fallback = setTimeout(() => {
      setCanStartPlayback(true);
    }, 4000);

    return () => {
      window.removeEventListener('loader-fading-out', handleLoaderFading);
      window.removeEventListener('loader-done', handleLoaderFading);
      clearTimeout(fallback);
    };
  }, [canStartPlayback]);

  // Programmatic control for standard landscape single video playback
  React.useEffect(() => {
    const video = singleVideoRef.current;
    if (!video) return;

    if (autoPlay && isPlaying && canStartPlayback) {
      video.play().catch(err => {
        console.log('[VideoPlayer] Autoplay prevented or failed:', err);
      });
    } else {
      video.pause();
    }
  }, [autoPlay, isPlaying, canStartPlayback, url]);

  // Programmatic control for vertical dual-video playback
  React.useEffect(() => {
    const bgVideo = verticalBgRef.current;
    const fgVideo = verticalFgRef.current;

    if (autoPlay && isPlaying && canStartPlayback) {
      if (bgVideo) bgVideo.play().catch(() => {});
      if (fgVideo) fgVideo.play().catch(() => {});
    } else {
      if (bgVideo) bgVideo.pause();
      if (fgVideo) fgVideo.pause();
    }
  }, [autoPlay, isPlaying, canStartPlayback, isVerticalVideo, url]);

  if (!url) return null;

  // YouTube standard iframe
  const ytMatch = finalUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})/);
  if (ytMatch) {
    const videoId = ytMatch[1];
    
    // If it's a vertical YouTube video (like Shorts), we use the cinematic dual-render
    if (isVerticalVideo) {
      const srcBackground = `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&loop=${loop ? 1 : 0}&controls=0&mute=1&playlist=${videoId}&playsinline=1`;
      const srcForeground = `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&loop=${loop ? 1 : 0}&controls=${controls ? 1 : 0}&mute=${muted ? 1 : 0}&playlist=${videoId}&playsinline=1`;
      return (
        <div key={finalUrl} className={cn("relative overflow-hidden w-full h-full bg-black flex items-center justify-center", className)}>
          {/* Ambient blurred background */}
          <div className="absolute inset-0 w-full h-full opacity-35 blur-2xl scale-125 pointer-events-none select-none">
            <iframe
              src={srcBackground}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              title="YouTube Vertical Background"
            />
          </div>
          {/* Main high-res clip */}
          <div className="relative z-10 h-full max-w-[420px] mx-auto aspect-[9/16] shadow-2xl border border-white/5 rounded-xl overflow-hidden">
            <iframe
              src={srcForeground}
              className={cn(
                "absolute inset-0 w-full h-full object-cover",
                !controls && "pointer-events-none"
              )}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube Vertical Foreground"
              onLoad={onLoadedData}
            />
          </div>
        </div>
      );
    }

    const src = `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&loop=${loop ? 1 : 0}&controls=${controls ? 1 : 0}&mute=${muted ? 1 : 0}&playlist=${videoId}&playsinline=1`;
    return (
      <div key={finalUrl} className={cn("relative overflow-hidden w-full h-full bg-black", className)}>
        <iframe
          src={src}
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
            !controls && "pointer-events-none"
          )}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube Video"
          onLoad={onLoadedData}
        />
      </div>
    );
  }

  // Vimeo standard iframe
  const vimeoMatch = finalUrl.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch) {
    const videoId = vimeoMatch[1];
    
    if (isVerticalVideo) {
      const srcBackground = `https://player.vimeo.com/video/${videoId}?autoplay=${autoPlay ? 1 : 0}&loop=${loop ? 1 : 0}&muted=1&controls=0&background=1`;
      const srcForeground = `https://player.vimeo.com/video/${videoId}?autoplay=${autoPlay ? 1 : 0}&loop=${loop ? 1 : 0}&muted=${muted ? 1 : 0}&controls=${controls ? 1 : 0}&background=${!controls ? 1 : 0}`;
      return (
        <div key={finalUrl} className={cn("relative overflow-hidden w-full h-full bg-black flex items-center justify-center", className)}>
          <div className="absolute inset-0 w-full h-full opacity-35 blur-2xl scale-125 pointer-events-none select-none">
            <iframe
              src={srcBackground}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              frameBorder="0"
              allow="autoplay; fullscreen"
              title="Vimeo Vertical Background"
            />
          </div>
          <div className="relative z-10 h-full max-w-[420px] mx-auto aspect-[9/16] shadow-2xl border border-white/5 rounded-xl overflow-hidden">
            <iframe
              src={srcForeground}
              className={cn(
                "absolute inset-0 w-full h-full object-cover",
                !controls && "pointer-events-none"
              )}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="Vimeo Vertical Foreground"
              onLoad={onLoadedData}
            />
          </div>
        </div>
      );
    }

    const src = `https://player.vimeo.com/video/${videoId}?autoplay=${autoPlay ? 1 : 0}&loop=${loop ? 1 : 0}&muted=${muted ? 1 : 0}&controls=${controls ? 1 : 0}&background=${!controls ? 1 : 0}`;
    return (
      <div key={finalUrl} className={cn("relative overflow-hidden w-full h-full bg-black", className)}>
        <iframe
          src={src}
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
            !controls && "pointer-events-none"
          )}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Vimeo Video"
          onLoad={onLoadedData}
        />
      </div>
    );
  }

  // Auto-detect image URL and fall back to img tag
  const isImage = /\.(jpg|jpeg|png|webp|gif|svg)/i.test(finalUrl) || finalUrl.includes('images.unsplash.com');
  if (isImage) {
    return (
      <img
        key={finalUrl}
        src={finalUrl}
        alt="Showcase media"
        className={cn("w-full h-full object-cover", className)}
        referrerPolicy="no-referrer"
        onLoad={handleMediaLoaded}
      />
    );
  }

  // Pure standard HTML5 vertical video
  if (isVerticalVideo) {
    return (
      <div ref={containerRef} key={finalUrl} className={cn("relative overflow-hidden w-full h-full bg-black flex items-center justify-center", className)}>
        {/* Cinematic Blurred Ambient Background */}
        <video
          ref={verticalBgRef}
          src={finalUrl}
          className="absolute inset-0 w-full h-full object-cover opacity-35 blur-2xl scale-125 pointer-events-none select-none"
          autoPlay={autoPlay && canStartPlayback}
          controls={false}
          loop={loop}
          muted={true}
          playsInline
          poster={poster}
          preload="auto"
        />
        {/* Crisp Native Portrait Video in Center */}
        <div className="relative z-10 h-full max-w-[420px] mx-auto aspect-[9/16] shadow-2xl border border-white/5 rounded-xl overflow-hidden">
          <video
            ref={verticalFgRef}
            src={finalUrl}
            className="w-full h-full object-cover"
            autoPlay={autoPlay && canStartPlayback}
            controls={controls}
            loop={loop}
            muted={muted}
            playsInline
            poster={poster}
            preload="auto"
            onPlaying={handleMediaLoaded}
            onCanPlayThrough={handleMediaLoaded}
            onLoadedData={handleMediaLoaded}
          />
        </div>
      </div>
    );
  }

  // Pure standard HTML5 landscape video
  return (
    <video
      ref={singleVideoRef}
      key={finalUrl}
      src={finalUrl}
      className={cn("w-full h-full object-cover", className)}
      autoPlay={autoPlay && canStartPlayback}
      controls={controls}
      loop={loop}
      muted={muted}
      playsInline
      poster={poster}
      preload="auto"
      onPlaying={handleMediaLoaded}
      onCanPlayThrough={handleMediaLoaded}
      onLoadedData={handleMediaLoaded}
    />
  );
}

export const VideoPlayer = React.memo(VideoPlayerComponent);
export default VideoPlayer;
