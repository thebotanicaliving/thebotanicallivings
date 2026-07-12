const lifestyleData = [
  { id: 'professionals', title: 'For the Focused Professional', description: 'After a demanding day at Hitech City, return to a sanctuary that prioritizes your rest. Enjoy high-speed internet, private workspaces, and an atmosphere of calm.', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop' },
  { id: 'students', title: 'For the Dedicated Scholar', description: 'With close proximity to HCU, our space offers the perfect environment for deep study. Quiet corners, nutritious meals, and a supportive community.', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop' }
];
import { Assets } from '@/constants/assets';
import { Section, Container, Image, Heading, Paragraph, ScrollReveal } from '@/components/shared';

export function Lifestyle() {
  return (
    <Section
      id="lifestyle-section"
      variant="cream"
      spacing="transition"
    >
      <Container className="space-y-16">
        {/* Section Header */}
        <ScrollReveal variant="slideUp" className="max-w-2xl mx-auto text-center space-y-4">
          <span className="font-button text-xs font-semibold uppercase tracking-widest text-gold-accent block">
            {"Community"}
          </span>
          <Heading level={2} className="text-dark-forest">
            {"Who Stays With Us"}
          </Heading>
          <Paragraph size="md" className="mx-auto">
            {"A diverse community of ambitious individuals seeking balance and focus."}
          </Paragraph>
        </ScrollReveal>

        {/* Editorial Collage / Overlapping Rows */}
        <div className="space-y-16">
          {lifestyleData.map((item, index) => {
            const isOdd = index % 2 !== 0;
            return (
              <ScrollReveal
                key={item.id}
                variant={isOdd ? 'slideRight' : 'slideLeft'}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center"
              >
                {/* Content */}
                <div
                  className={`lg:col-span-5 space-y-4 ${
                    isOdd ? 'lg:order-2 lg:col-start-8' : 'lg:order-1 lg:col-start-1'
                  }`}
                >
                  <span className="font-sans text-xs font-bold text-gold-accent tracking-widest block">
                    0{index + 1} / CONCEPT
                  </span>
                  <Heading level={3} className="text-2xl md:text-3xl font-light text-dark-forest">
                    {item.title}
                  </Heading>
                  <p className="font-sans text-sm md:text-base text-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Collage Image Frame */}
                <div
                  className={`lg:col-span-6 relative ${
                    isOdd ? 'lg:order-1 lg:col-start-1' : 'lg:order-2 lg:col-start-7'
                  }`}
                >
                  <div className="relative group">
                    <Image
                      src={item.image}
                      alt={item.title}
                      aspectRatio="landscape"
                      radius="image"
                      className="w-full h-full object-cover shadow-sm group-hover:scale-[1.01] transition-transform duration-500"
                    />
                    {/* Floating elegant description box */}
                    <div className="absolute -bottom-6 -right-6 hidden sm:block bg-warm-cream p-6 rounded-card border border-border/40 shadow-subtle max-w-xs">
                      <p className="font-heading text-base italic text-primary-forest leading-relaxed">
                        "Curated co-living designed to provide professional focus and personal peace."
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
export default Lifestyle;
