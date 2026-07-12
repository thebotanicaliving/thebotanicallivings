import { useEffect, useState } from 'react';
import { Assets } from '@/constants/assets';
import { useHomepage } from '@/hooks/useHomepage';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/shared/Button';
import { Heading, Paragraph } from '@/components/shared/Typography';
import { IconWrapper } from '@/components/shared/IconWrapper';

import { motion, AnimatePresence } from 'motion/react';

export function Hero() {
  const { config, loading } = useHomepage();
  const { settings } = useSettings();
  const [currentIdx, setCurrentIdx] = useState(0);

  const images = config.heroImages && config.heroImages.length > 0 
    ? config.heroImages 
    : [
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1920&auto=format&fit=crop'
      ];

  useEffect(() => {
    // Release the preloader instantly
    window.dispatchEvent(new CustomEvent('hero-video-loaded'));
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 30000); // 30-second cycle
    return () => clearInterval(interval);
  }, [images]);
  
  const scrollToNext = () => {
    const nextSection = document.getElementById('brand-story');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero-section"
      className="relative w-full h-screen overflow-hidden bg-dark-forest"
    >
      {/* Background Cinematic Images Carousel */}
      <div className="absolute inset-0 z-0 bg-dark-forest">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentIdx}
            src={images[currentIdx]}
            alt="Botanical Living Premium Sanctuary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        {/* Organic dark overlay - custom multi-stop premium gradient for smooth dark-forest transition to warm-cream */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(23, 53, 39, 0.2) 0%, rgba(23, 53, 39, 0.4) 20%, rgba(23, 53, 39, 0.6) 40%, rgba(23, 53, 39, 0.8) 60%, rgba(247, 245, 239, 0.2) 80%, rgba(247, 245, 239, 0.6) 90%, #f7f5ef 100%)'
          }}
        />
      </div>

      {/* Content Area */}
      <div className="relative z-10 w-full max-w-[1300px] mx-auto px-5 md:px-8 xl:px-12 flex flex-col items-center justify-end h-full pt-32 pb-14 sm:pb-24 md:pb-40 lg:pb-44">
        <div className="max-w-3xl space-y-4 sm:space-y-6 flex flex-col items-center text-center">

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Heading
              level={1}
              className="text-warm-cream font-light text-balance leading-tight text-center text-2xl sm:text-3xl md:text-5xl lg:text-6xl"
            >
              {config.heroTitle}
            </Heading>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Paragraph
              size="lg"
              className="text-stone/90 leading-relaxed font-sans font-light max-w-2xl text-center text-xs sm:text-sm md:text-lg lg:text-xl"
            >
              {config.heroSubtitle}
            </Paragraph>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="flex flex-wrap gap-3 pt-3 justify-center"
          >
            <Button
              variant="secondary"
              className="px-5 py-2.5 sm:px-8 sm:py-4 text-[10px] sm:text-xs font-semibold uppercase tracking-widest h-auto"
              onClick={() => {
                const target = document.getElementById('final-cta');
                if (target) target.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {config.heroPrimaryBtnText}
            </Button>
            <Button
              variant="outline"
              className="text-warm-cream border-warm-cream/30 hover:bg-warm-cream/10 px-5 py-2.5 sm:px-8 sm:py-4 text-[10px] sm:text-xs font-semibold uppercase tracking-widest h-auto"
              onClick={() => {
                const target = document.getElementById('rooms-preview');
                if (target) target.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {config.heroSecondaryBtnText}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Subtle Floating Scroll Indicator - elegantly styled for high contrast over warm-cream fade */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.5, 1], y: [0, 6, 0] }}
        transition={{ 
          opacity: { delay: 1, duration: 1 },
          y: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
        }}
        onClick={scrollToNext}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center space-y-1 text-primary-forest/80 hover:text-dark-forest cursor-pointer focus:outline-none transition-colors duration-300"
        aria-label="Scroll to next section"
      >
        <span className="font-button text-[9px] tracking-widest uppercase font-semibold">
          Scroll
        </span>
        <IconWrapper name="chevronDown" size={14} />
      </motion.button>
    </section>
  );
}
export default Hero;
