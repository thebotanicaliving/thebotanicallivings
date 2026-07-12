import { useHomepage } from '@/hooks/useHomepage';
import { Section, Container, Heading, Paragraph, IconWrapper, Card, ScrollReveal, ScrollStagger } from '@/components/shared';

export function AmenitiesPreview() {
  const { config } = useHomepage();
  const services = config.services || [];

  return (
    <Section
      id="amenities-preview"
      variant="cream"
      spacing="same"
    >
      <Container className="space-y-12 md:space-y-16">
        {/* Section Header */}
        <ScrollReveal variant="slideUp" className="max-w-2xl space-y-4">
          <span className="font-button text-xs font-semibold uppercase tracking-widest text-gold-accent block">
            {"Included Services"}
          </span>
          <Heading level={2} className="text-dark-forest">
            {"Premium Living Experience"}
          </Heading>
          <Paragraph size="md">
            {"Every necessity anticipated and flawlessly executed."}
          </Paragraph>
        </ScrollReveal>

        {services.length > 0 ? (
          /* Premium Amenities Grid */
          <ScrollStagger className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch max-w-5xl mx-auto">
            {services.map((item, index) => {
              const isLastOdd = index === services.length - 1 && services.length % 2 !== 0;
              return (
                <ScrollReveal 
                  key={item.id || index} 
                  variant="slideUp" 
                  className={`h-full ${isLastOdd ? 'md:col-span-2 md:max-w-2xl md:mx-auto w-full' : ''}`}
                >
                  <Card
                    hover={true}
                    border={true}
                    className="flex items-start space-x-5 p-6 md:p-8 bg-white border-border/40 hover:border-primary-forest/20 rounded-card transition-all duration-300 h-full"
                    animate={true}
                  >
                    {/* Left Column: Icon Container */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary-forest/5 text-primary-forest flex items-center justify-center border border-primary-forest/10 shadow-sm">
                      <IconWrapper name={item.icon as never} size={22} className="text-primary-forest" />
                    </div>

                    {/* Right Column: Content */}
                    <div className="space-y-2 flex-grow">
                      <h4 className="font-heading text-lg md:text-xl font-semibold text-dark-forest tracking-tight">
                        {item.title}
                      </h4>
                      <p className="font-sans text-sm text-text-secondary leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </Card>
                </ScrollReveal>
              );
            })}
          </ScrollStagger>
        ) : (
          <div className="text-center text-stone-500 font-mono text-xs py-8">
            No services configured.
          </div>
        )}
      </Container>
    </Section>
  );
}

export default AmenitiesPreview;
