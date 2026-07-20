import { Section, Container, Image, Heading, Paragraph, ScrollReveal, Button, IconWrapper } from '@/components/shared';
import { useHomepage } from '@/hooks/useHomepage';
import { motion } from 'motion/react';

export function BotanicalCafe() {
  const { config, loading } = useHomepage();

  if (loading) return null;

  const title = config?.cafeTitle || "The Signature Botanical Café";
  const description = config?.cafeDescription || "Our signature rooftop space designed for deep focus and better conversations.";
  const highlights = config?.cafeHighlights || ["Rooftop Café", "Great Food", "Great Views", "Better Conversations", "Work Friendly", "Evening Ambience"];
  const imageUrl = config?.cafeImageUrl || "https://images.unsplash.com/photo-1559925393-8be0ec41b504?q=80&w=1200&auto=format&fit=crop";

  return (
    <Section
      id="botanical-cafe"
      variant="dark"
      spacing="same"
      className="bg-dark-forest relative overflow-hidden"
    >
      {/* Decorative background accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-forest/5 -skew-x-12 translate-x-1/2 pointer-events-none" />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content Side */}
          <div className="space-y-8 order-2 lg:order-1">
            <ScrollReveal variant="slideUp" className="space-y-4">
              <span className="font-button text-xs font-semibold uppercase tracking-widest text-gold-accent block">
                {"The Signature Space"}
              </span>
              <Heading level={2} className="text-warm-cream">
                {title}
              </Heading>
              <Paragraph size="lg" className="text-stone/80 max-w-xl">
                {description}
              </Paragraph>
              <Paragraph size="md" className="text-gold-accent font-medium italic">
                {"Great Food. Great Views. Better Conversations."}
              </Paragraph>
            </ScrollReveal>

            <ScrollReveal variant="slideUp" delay={0.2} className="grid grid-cols-2 gap-y-4 gap-x-8">
              {highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-warm-cream/90 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold-accent group-hover:scale-150 transition-transform duration-300" />
                  <span className="font-sans text-sm md:text-base font-medium">{highlight}</span>
                </div>
              ))}
            </ScrollReveal>

            <ScrollReveal variant="slideUp" delay={0.3} className="pt-4">
              <Button 
                variant="secondary"
                className="px-8 py-4"
                onClick={() => {
                   const target = document.getElementById('gallery');
                   if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {"View Gallery"}
              </Button>
            </ScrollReveal>
          </div>

          {/* Image Side */}
          <div className="relative order-1 lg:order-2">
            <ScrollReveal variant="scaleUp" className="relative z-10 aspect-[4/5] md:aspect-[16/10] lg:aspect-[4/5] rounded-card overflow-hidden shadow-2xl border border-white/5">
              <Image 
                src={imageUrl}
                alt="Botanical Cafe Kondapur rooftop experience"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                containerClassName="w-full h-full"
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-forest/60 via-transparent to-transparent pointer-events-none" />
            </ScrollReveal>

            {/* Decorative organic elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 border-t border-r border-gold-accent/20 rounded-tr-3xl -z-10" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 border-b border-l border-gold-accent/20 rounded-bl-3xl -z-10" />
            
            {/* Small floating badge */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="absolute -bottom-4 -right-4 md:bottom-8 md:-right-8 bg-warm-cream p-6 rounded-2xl shadow-xl z-20 max-w-[180px] hidden sm:block"
            >
              <IconWrapper name="coffee" className="text-gold-accent mb-2" size={24} />
              <p className="text-dark-forest font-heading font-semibold text-sm leading-tight">
                {"Best Rooftop Views in Kondapur"}
              </p>
            </motion.div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default BotanicalCafe;
