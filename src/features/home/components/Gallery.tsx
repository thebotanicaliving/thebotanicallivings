import { Assets } from '@/constants/assets';
import { VideoPlayer } from '@/components/shared';
import { Section, Container, Heading, Paragraph, IconWrapper } from '@/components/shared';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { useGallery } from '@/hooks/useGallery';

export function Gallery() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const { gallery: items, loading } = useGallery();

  // Limit home gallery to exactly 8 cards
  const galleryItems = items && items.length > 0 ? items.slice(0, 8) : [];


  // Stagger container animation properties for desktop grid
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.215, 0.61, 0.355, 1] as const,
      },
    },
  };

  // Split gallery elements into 2 separate rows for mobile double marquee
  const row1 = galleryItems.slice(0, 4);
  const row2 = galleryItems.slice(4, 8);

  // Duplicate items 8 times to guarantee gapless scrolling on all device widths
  const duplicatedRow1 = row1.length > 0 ? [...row1, ...row1, ...row1, ...row1, ...row1, ...row1, ...row1, ...row1] : [];
  const duplicatedRow2 = row2.length > 0 ? [...row2, ...row2, ...row2, ...row2, ...row2, ...row2, ...row2, ...row2] : [];

  // Key event listeners for keyboard navigation in Lightbox
  useEffect(() => {
    if (activeItemIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveItemIndex(null);
      } else if (e.key === 'ArrowRight') {
        setActiveItemIndex((prev) => (prev !== null ? (prev + 1) % galleryItems.length : 0));
      } else if (e.key === 'ArrowLeft') {
        setActiveItemIndex((prev) => (prev !== null ? (prev - 1 + galleryItems.length) % galleryItems.length : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeItemIndex, galleryItems.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveItemIndex((prev) => (prev !== null ? (prev - 1 + galleryItems.length) % galleryItems.length : 0));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveItemIndex((prev) => (prev !== null ? (prev + 1) % galleryItems.length : 0));
  };

  return (
    <Section
      id="gallery-preview"
      variant="light"
      spacing="same"
    >
      <Container className="space-y-12">
        {/* Inline CSS styling for mobile infinite marquees */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marquee-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .animate-marquee-left {
            animation: marquee-left 35s linear infinite;
          }
          .animate-marquee-right {
            animation: marquee-right 35s linear infinite;
          }
        `}} />

        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <span className="font-button text-xs font-semibold uppercase tracking-widest text-gold-accent block">
            Visual Storytelling
          </span>
          <Heading level={2} className="text-dark-forest">
            Our gallery
          </Heading>
          <Paragraph size="md" className="mx-auto text-text-secondary leading-relaxed">
            Immerse yourself in the calming, organic luxury of Botanical Living. Browse our curated selection of high-end rooms, tranquil workspaces, and social gardens.
          </Paragraph>
        </div>

        {/* MOBILE SECTION: Double infinite scroll marquee */}
        <div className="block lg:hidden space-y-6 overflow-hidden py-4">
          {/* Row 1: Leftward scrolling */}
          <div className="relative w-full overflow-hidden select-none">
            <div className="flex space-x-4 w-max animate-marquee-left hover:[animation-play-state:paused] active:[animation-play-state:paused] pointer-events-auto">
              {duplicatedRow1.map((item, idx) => {
                const originalIdx = idx % Math.max(1, row1.length); // Map back to original gallery index (items 0-3)
                return (
                  <div
                    key={`r1-${idx}`}
                    onClick={() => setActiveItemIndex(originalIdx)}
                    className="w-48 aspect-[3/4] flex-shrink-0 relative overflow-hidden rounded-image bg-stone/20 shadow-subtle border border-border/40 cursor-pointer group"
                  >
                    {item.type === 'image' ? (
                       <img
                        src={item.imageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <VideoPlayer url={item.imageUrl} controls={false} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                    )}
                    {/* Overlay Title */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-dark-forest/90 via-dark-forest/30 to-transparent flex flex-col justify-end">
                      <span className="font-button text-[8px] font-bold tracking-widest text-gold-accent uppercase mb-0.5">
                        {item.type === 'video' ? 'Motion' : 'Sanctuary'}
                      </span>
                      <h4 className="font-heading text-xs text-warm-cream font-medium truncate">
                        {item.title}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 2: Rightward scrolling */}
          <div className="relative w-full overflow-hidden select-none">
            <div className="flex space-x-4 w-max animate-marquee-right hover:[animation-play-state:paused] active:[animation-play-state:paused] pointer-events-auto">
              {duplicatedRow2.map((item, idx) => {
                const originalIdx = row1.length + (idx % Math.max(1, row2.length)); // Map back to original gallery index (items 4-7)
                return (
                  <div
                    key={`r2-${idx}`}
                    onClick={() => setActiveItemIndex(originalIdx)}
                    className="w-48 aspect-[3/4] flex-shrink-0 relative overflow-hidden rounded-image bg-stone/20 shadow-subtle border border-border/40 cursor-pointer group"
                  >
                    {item.type === 'image' ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <VideoPlayer url={item.imageUrl} controls={false} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                    )}
                    {/* Overlay Title */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-dark-forest/90 via-dark-forest/30 to-transparent flex flex-col justify-end">
                      <span className="font-button text-[8px] font-bold tracking-widest text-gold-accent uppercase mb-0.5">
                        {item.type === 'video' ? 'Motion' : 'Sanctuary'}
                      </span>
                      <h4 className="font-heading text-xs text-warm-cream font-medium truncate">
                        {item.title}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* DESKTOP SECTION: Wave Staggered Grid Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-10% 0px' }}
          className="hidden lg:grid lg:grid-cols-4 gap-6 md:gap-8 pt-4"
        >
          {galleryItems.map((item, index) => {
            const isStaggeredY = index % 2 === 1; // Staggering columns for organic wave rhythm
            
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`relative group flex flex-col justify-between cursor-pointer ${
                  isStaggeredY ? 'lg:translate-y-8' : ''
                } transition-all duration-300`}
                onClick={() => setActiveItemIndex(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Media Container */}
                <div className="relative overflow-hidden rounded-image bg-stone/20 shadow-subtle border border-border/40 aspect-[3/4] transition-all duration-500 group-hover:shadow-lg">
                  {/* Subtle Shimmer Layer */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />

                  {item.type === 'image' ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <VideoPlayer url={item.imageUrl} controls={false} className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out" />
                  )}

                  {/* Dark Elegant Glassmorphism Info Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-dark-forest/90 via-dark-forest/40 to-transparent translate-y-1 group-hover:translate-y-0 opacity-80 group-hover:opacity-100 transition-all duration-550 ease-out flex flex-col justify-end">
                    <span className="font-button text-[9px] font-bold tracking-widest text-gold-accent uppercase mb-1">
                      {item.type === 'video' ? 'Motion Cinematic' : 'Botanical Sanctuary'}
                    </span>
                    <h3 className="font-heading text-sm text-warm-cream font-medium tracking-normal">
                      {item.title}
                    </h3>
                  </div>

                  {/* Play or zoom indicator badge */}
                  <div className="absolute top-4 right-4 bg-warm-cream/90 backdrop-blur-md w-8 h-8 rounded-full border border-border/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-sm z-10">
                    {item.type === 'video' ? (
                      <svg className="w-3.5 h-3.5 text-primary-forest fill-current ml-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-primary-forest stroke-current" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Spacer to absorb staggered translation offset on desktop */}
        <div className="hidden lg:block h-8" />
      </Container>

      {/* LUXURY FULL-SCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {activeItemIndex !== null && galleryItems[activeItemIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-dark-forest/98 backdrop-blur-md flex flex-col items-center justify-between p-4 md:p-8 select-none"
            onClick={() => setActiveItemIndex(null)}
          >
            {/* Header / Actions bar */}
            <div className="w-full max-w-5xl flex items-center justify-between pt-2">
              <div className="flex flex-col">
                <span className="font-button text-[9px] font-bold tracking-widest text-gold-accent uppercase">
                  {galleryItems[activeItemIndex].type === 'video' ? 'Playable Motion' : 'Gallery View'}
                </span>
                <span className="text-stone/60 font-mono text-[10px] mt-0.5">
                  {activeItemIndex + 1} / {galleryItems.length}
                </span>
              </div>
              <button
                onClick={() => setActiveItemIndex(null)}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-warm-cream hover:bg-white/10 hover:text-white transition-all duration-300 cursor-pointer"
                aria-label="Close Lightbox"
              >
                <IconWrapper name="close" size={16} />
              </button>
            </div>

            {/* Active Media Container with cycling buttons */}
            <div className="relative w-full max-w-4xl flex items-center justify-center py-4 flex-grow" onClick={(e) => e.stopPropagation()}>
              {/* Left Arrow */}
              <button
                onClick={handlePrev}
                className="absolute left-2 md:left-4 z-10 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-warm-cream hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                aria-label="Previous item"
              >
                <IconWrapper name="arrowLeft" size={18} />
              </button>

              {/* Media element itself with spring-loaded animation */}
              <motion.div
                key={activeItemIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full max-h-[60vh] md:max-h-[70vh] flex items-center justify-center overflow-hidden"
              >
                {galleryItems[activeItemIndex].type === 'image' ? (
                  <img
                    src={galleryItems[activeItemIndex].imageUrl}
                    alt={galleryItems[activeItemIndex].title}
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-full rounded-image object-contain shadow-2xl border border-white/10"
                  />
                ) : (
                  <VideoPlayer url={galleryItems[activeItemIndex].imageUrl} controls={false} className="max-w-full max-h-full rounded-image object-contain shadow-2xl border border-white/10 bg-black" />
                )}
              </motion.div>

              {/* Right Arrow */}
              <button
                onClick={handleNext}
                className="absolute right-2 md:right-4 z-10 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-warm-cream hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                aria-label="Next item"
              >
                <IconWrapper name="arrowRight" size={18} />
              </button>
            </div>

            {/* Footer Copy */}
            <div className="w-full max-w-2xl text-center pb-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-heading text-lg md:text-xl text-warm-cream font-medium tracking-wide">
                {galleryItems[activeItemIndex].title}
              </h3>
              <p className="text-xs text-stone/50 mt-1 font-sans italic">
                {galleryItems[activeItemIndex].type === 'video' ? 'Interactive HD cinematic loop • Playable with controls' : 'Signature Room & Common Space Interior'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
export default Gallery;
