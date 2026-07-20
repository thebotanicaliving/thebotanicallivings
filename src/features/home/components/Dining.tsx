import { useHomepage } from '@/hooks/useHomepage';
import { Assets } from '@/constants/assets';
import { Section, Container, Image, Heading, Paragraph, Button, IconWrapper, ScrollReveal } from '@/components/shared';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function Dining() {
  const { config, loading } = useHomepage();
  
  
  // State for the three rotating images
  

  const [images, setImages] = useState([
    {
      id: 1,
      src: (config?.diningImageUrl || "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop"),
      alt: "Dining Hall Botanical Living - Gourmet Preparation",
      label: "Gourmet Preparation"
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=600&auto=format&fit=crop",
      alt: "Luxury Dining at Botanical Living - Chef Curated",
      label: "Chef Curated"
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop",
      alt: "Communal Dining Hall Botanical Living",
      label: "Communal Feasts"
    }
  ]);

  const handleSwap = (clickedIndex: number) => {
    setImages(prev => {
      const next = [...prev];
      const temp = next[0];
      next[0] = next[clickedIndex];
      next[clickedIndex] = temp;
      return next;
    });
  };

  return (
    <Section
      id="dining-experience"
      variant="light"
      spacing="same"
    >
      <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Side: Copy */}
        <ScrollReveal variant="slideRight" className="lg:col-span-6 space-y-6">
          <div className="space-y-4">
            <span className="font-button text-xs font-semibold uppercase tracking-widest text-gold-accent block animate-fade-in">
              {"Culinary Experience"}
            </span>
            <Heading level={2} className="text-dark-forest">
              {config?.diningTitle || ""}
            </Heading>
            <Paragraph size="md">
              {config?.diningDescription || ""}
            </Paragraph>
          </div>

          <ul className="space-y-4 pt-2">
            {(config?.diningHighlights || []).map((item, index) => (
              <li key={index} className="flex items-start space-x-3 text-text-primary">
                <span className="mt-1 text-gold-accent flex-shrink-0 bg-primary-forest/5 p-1 rounded-full">
                  <IconWrapper name="check" size={14} />
                </span>
                <span className="font-sans text-sm md:text-base font-medium text-text-primary">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <div className="pt-4">
            <Button
              variant="outline"
              className="text-xs uppercase tracking-widest font-semibold"
              onClick={() => {
                const target = document.getElementById('final-cta');
                if (target) target.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {"View Weekly Menu"}
            </Button>
          </div>
        </ScrollReveal>

        {/* Right Side: Editorial Food & Table Spread (Interactive Rotating Images) */}
        <ScrollReveal variant="slideLeft" delay={0.2} className="lg:col-span-6 grid grid-cols-12 gap-4 h-[400px] md:h-[500px]">
          {/* Primary Large Spot */}
          <div className="col-span-8 h-full relative overflow-hidden rounded-image shadow-md bg-stone/10">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={images[0].id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={(config?.diningImageUrl || images[0].src)}
                  alt={images[0].alt}
                  className="w-full h-full object-cover rounded-image"
                  containerClassName="w-full h-full"
                />
                {/* Elegant overlay badge */}
                <div className="absolute bottom-4 left-4 bg-dark-forest/80 backdrop-blur-md px-3 py-1.5 rounded-button text-warm-cream">
                  <span className="font-button text-[9px] font-semibold uppercase tracking-widest block">
                    Featured Space
                  </span>
                  <span className="font-sans text-xs font-medium text-stone/90">
                    {images[0].label}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Secondary Column: Two stacked smaller images */}
          <div className="col-span-4 flex flex-col justify-between h-full space-y-4">
            {/* Top Secondary Image */}
            <div 
              onClick={() => handleSwap(1)}
              className="relative h-[48%] w-full overflow-hidden rounded-image shadow-sm bg-stone/10 cursor-pointer group active:scale-95 transition-all duration-300 hover:shadow-md hover:border-gold-accent/40"
            >
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={images[1].id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="absolute inset-0 w-full h-full"
                >
                  <Image
                    src={images[1].src}
                    alt={images[1].alt}
                    className="w-full h-full object-cover rounded-image brightness-95 group-hover:brightness-100 transition-all duration-300"
                    containerClassName="w-full h-full"
                  />
                  {/* Subtle swap hint overlay */}
                  <div className="absolute inset-0 bg-dark-forest/10 group-hover:bg-dark-forest/0 transition-colors duration-300" />
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-warm-cream/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm border border-border/30">
                    <svg className="w-3 h-3 text-primary-forest" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7C4.547 9.547 4.5 10.768 4.5 12s.047 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.092-1.209.138-2.43.138-3.662z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 10.5l3 3 3-3" />
                    </svg>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Secondary Image */}
            <div 
              onClick={() => handleSwap(2)}
              className="relative h-[48%] w-full overflow-hidden rounded-image shadow-sm bg-stone/10 cursor-pointer group active:scale-95 transition-all duration-300 hover:shadow-md hover:border-gold-accent/40"
            >
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={images[2].id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="absolute inset-0 w-full h-full"
                >
                  <Image
                    src={images[2].src}
                    alt={images[2].alt}
                    className="w-full h-full object-cover rounded-image brightness-95 group-hover:brightness-100 transition-all duration-300"
                    containerClassName="w-full h-full"
                  />
                  {/* Subtle swap hint overlay */}
                  <div className="absolute inset-0 bg-dark-forest/10 group-hover:bg-dark-forest/0 transition-colors duration-300" />
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-warm-cream/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm border border-border/30">
                    <svg className="w-3 h-3 text-primary-forest" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7C4.547 9.547 4.5 10.768 4.5 12s.047 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.092-1.209.138-2.43.138-3.662z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 10.5l3 3 3-3" />
                    </svg>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
export default Dining;
