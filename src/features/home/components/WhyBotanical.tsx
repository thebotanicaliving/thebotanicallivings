import { Section, Container, Heading, Paragraph, IconWrapper, Card, ScrollReveal, ScrollStagger } from '@/components/shared';
import { Content } from '@/constants/content';

export function WhyBotanical() {
  const { whyBotanical } = Content;

  return (
    <Section
      id="why-botanical"
      variant="cream"
      spacing="same"
      className="border-b border-border/40"
    >
      <Container className="space-y-12 md:space-y-16">
        {/* Section Header */}
        <ScrollReveal variant="slideUp" className="max-w-2xl space-y-4">
          <span className="font-button text-xs font-semibold uppercase tracking-widest text-gold-accent block">
            {"Why Choose Us"}
          </span>
          <Heading level={2} className="text-dark-forest">
            {whyBotanical.title}
          </Heading>
          <Paragraph size="md">
            {"Experience a lifestyle defined by mindful spaces, organic luxury, and total peace of mind."}
          </Paragraph>
        </ScrollReveal>

        {/* Premium Features Grid */}
        <ScrollStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch max-w-6xl mx-auto">
          {whyBotanical.features.map((item, index) => (
            <ScrollReveal 
              key={index} 
              variant="slideUp" 
              className="h-full"
            >
              <Card
                hover={true}
                border={true}
                className="flex flex-col items-start p-6 md:p-8 bg-white border-border/40 hover:border-primary-forest/20 rounded-card transition-all duration-300 h-full group"
                animate={true}
              >
                {/* Icon Container */}
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary-forest/5 text-primary-forest flex items-center justify-center border border-primary-forest/10 shadow-sm mb-6 group-hover:bg-primary-forest group-hover:text-white transition-colors duration-500">
                  <IconWrapper name={item.icon as never} size={26} />
                </div>

                {/* Content */}
                <div className="space-y-3 flex-grow">
                  <h4 className="font-heading text-xl md:text-2xl font-semibold text-dark-forest tracking-tight">
                    {item.title}
                  </h4>
                  <p className="font-sans text-sm md:text-base text-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </ScrollStagger>
      </Container>
    </Section>
  );
}

export default WhyBotanical;
