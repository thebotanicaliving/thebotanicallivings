import { useState, useEffect } from 'react';
import { useGallery } from '@/hooks/useGallery';
import { VideoPlayer } from '@/components/shared';
import { Section } from '@/components/shared/Section';
import { Container } from '@/components/shared/Container';
import { Heading, Paragraph } from '@/components/shared/Typography';
import { IconWrapper } from '@/components/shared/IconWrapper';

export function GalleryPage() {
  const { gallery: items, loading, error, refresh } = useGallery();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Categories list
  const categories = ['All', 'Rooms', 'Dining', 'Cafe', 'Common Areas', 'Facilities'];

  // Filter gallery items
  const filteredItems = items.filter((item) => {
    return selectedCategory === 'All' || item.category === selectedCategory;
  });

  // Get a beautiful cover thumbnail for videos in the grid to avoid heavy black frames
  const getVideoThumbnail = (title: string, category: string) => {
    const t = (title || category || '').toLowerCase();
    if (t.includes('courtyard')) {
      return 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=600&auto=format&fit=crop';
    }
    if (t.includes('greenhouse') || t.includes('garden')) {
      return 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=600&auto=format&fit=crop';
    }
    if (t.includes('kitchen') || t.includes('dining')) {
      return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop';
    }
    // High-quality botanical aesthetic default
    return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600&auto=format&fit=crop';
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0));
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredItems]);

  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-warm-cream pb-16">
      
      {/* Lightbox Overlay */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 text-white hover:text-gold-accent p-2 cursor-pointer focus:outline-none"
            aria-label="Close Lightbox"
          >
            <IconWrapper name="close" size={32} />
          </button>
          
          {/* Prev button */}
          <button
            onClick={() => setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1))}
            className="absolute left-4 md:left-8 text-white hover:text-gold-accent p-2 cursor-pointer focus:outline-none"
            aria-label="Previous Image"
          >
            <IconWrapper name="menu" className="rotate-90" size={28} />
          </button>

          {/* Lightbox media with dynamic reference details */}
          <div className="max-w-[90vw] max-h-[80vh] flex flex-col items-center gap-3">
            {filteredItems[lightboxIndex].type === 'video' ? (
              <VideoPlayer url={filteredItems[lightboxIndex].imageUrl} controls={false} className="max-w-full max-h-[72vh] object-contain rounded-lg shadow-2xl bg-black" />
            ) : (
              <img
                src={filteredItems[lightboxIndex].imageUrl}
                alt={filteredItems[lightboxIndex].title}
                className="max-w-full max-h-[72vh] object-contain rounded-lg shadow-2xl"
              />
            )}
            <div className="text-center text-white space-y-1">
              <p className="text-sm font-heading font-light tracking-wide">{filteredItems[lightboxIndex].title}</p>
              <p className="text-[10px] text-stone uppercase tracking-widest font-semibold font-button">
                {filteredItems[lightboxIndex].category}
              </p>
            </div>
          </div>

          {/* Next button */}
          <button
            onClick={() => setLightboxIndex((prev) => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0))}
            className="absolute right-4 md:right-8 text-white hover:text-gold-accent p-2 cursor-pointer focus:outline-none"
            aria-label="Next Image"
          >
            <IconWrapper name="menu" className="-rotate-90" size={28} />
          </button>
        </div>
      )}

      {/* Main Grid Page */}
      <Section variant="cream" className="!py-10 md:!py-16">
        <Container className="space-y-12">
          
          {/* Page Intro Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-button text-[10px] font-semibold uppercase tracking-widest text-gold-accent block animate-fadeIn">
              Serenity Captured
            </span>
            <Heading level={1} className="text-3xl md:text-5xl font-light text-dark-forest tracking-tight animate-fadeIn">
              Our Gallery Showcase
            </Heading>
            <Paragraph size="md" className="text-text-secondary max-w-lg mx-auto font-light leading-relaxed animate-fadeIn">
              A visually curated collection of our premium bedrooms, spacious common lounges, clean dining facilities, and lush plant-covered rooftop terrace café spaces.
            </Paragraph>
          </div>

          {/* Filters Pills bar */}
          <div className="flex flex-wrap gap-2.5 justify-center max-w-2xl mx-auto border-y border-border/20 py-5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border cursor-pointer transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-dark-forest border-dark-forest text-warm-cream shadow-sm'
                    : 'bg-white border-border/30 text-text-secondary hover:border-dark-forest/50 hover:text-dark-forest'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="py-24 text-center space-y-4 animate-pulse">
              <div className="w-10 h-10 border-4 border-gold-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-medium text-text-secondary">Rendering photo gallery...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="py-16 text-center max-w-md mx-auto space-y-4 bg-white p-8 rounded-[24px] border border-border/30">
              <p className="text-sm text-text-primary font-medium">Failed to retrieve media library</p>
              <p className="text-xs text-text-secondary">{error.message}</p>
              <button
                onClick={refresh}
                className="bg-dark-forest text-warm-cream px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-primary-forest transition-colors cursor-pointer"
              >
                Retry Loading
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredItems.length === 0 && (
            <p className="text-center text-text-secondary text-sm font-light py-12">
              No gallery photographs listed under this category.
            </p>
          )}

          {/* Photo Masonry Layout */}
          {!loading && !error && filteredItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-[1300px] mx-auto animate-fadeIn">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => setLightboxIndex(index)}
                  className="group relative aspect-[4/3] rounded-[16px] overflow-hidden border border-border/20 shadow-sm cursor-zoom-in bg-white"
                >
                  {item.type === 'video' ? (
                    <img
                      src={getVideoThumbnail(item.title, item.category)}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-104 brightness-[0.98] group-hover:brightness-90"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-104 brightness-[0.98] group-hover:brightness-90"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {/* Play icon overlay for video */}
                  {item.type === 'video' && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md w-7 h-7 rounded-full flex items-center justify-center shadow-sm z-10 pointer-events-none">
                      <svg className="w-3 h-3 text-primary-forest fill-current ml-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                  {/* Subtle info card overlay on Hover */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex flex-col justify-end">
                    <p className="text-white text-xs font-heading font-light tracking-wide">{item.title}</p>
                    <span className="text-[9px] text-gold-accent uppercase tracking-widest font-semibold font-button">
                      {item.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </Container>
      </Section>
    </div>
  );
}
export default GalleryPage;
