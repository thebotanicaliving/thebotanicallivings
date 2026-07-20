import { useHomepage } from '@/hooks/useHomepage';
import { Assets } from '@/constants/assets';
import { Section, Container, Image, Heading, Paragraph, Card, IconWrapper, ScrollReveal } from '@/components/shared';

export function Story() {
  const { config, loading } = useHomepage();
  if (loading) return null;
  return (
    <Section
      id="brand-story"
      variant="cream"
      spacing="transition"
      animate={false}
    >
      <Container className="grid md:mt-16 mt-12 grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Side: Editorial Image */}
        <ScrollReveal variant="slideRight" className="lg:col-span-5 order-2 lg:order-1">
          <Image
            src={config.storyImageUrl}
            alt="Luxury Room at Botanical Living co-living space Kondapur"
            aspectRatio="portrait"
            radius="image"
            className="shadow-subtle hover:scale-[1.01] transition-transform duration-500"
          />
        </ScrollReveal>

        {/* Right Side: Copy & Vision */}
        <ScrollReveal variant="slideLeft" delay={0.2} className="lg:col-span-7 order-1 lg:order-2 space-y-8">
          <div className="space-y-4">
            <span className="font-button text-xs font-semibold uppercase tracking-widest text-gold-accent block">
              {"Our Story"}
            </span>
            <Heading level={2} className="text-dark-forest">
              {config.storyTitle}
            </Heading>
            <h3 className="font-heading text-xl italic text-primary-forest font-light">
              {config.storySubtitle}
            </h3>
          </div>

          <div className="space-y-4 font-sans text-text-secondary text-base leading-relaxed">
            <Paragraph>{config.storyParagraph1}</Paragraph>
            <Paragraph>{config.storyParagraph2}</Paragraph>
          </div>

          {/* Mission & Vision Cards with Premium Monochromatic Icons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <Card
              hover={false}
              border={true}
              className="bg-muted-bg/50 border-border/40 p-6 space-y-4"
              animate={false}
            >
              <div className="flex items-center space-x-3">
                <IconWrapper name="compass" className="text-gold-accent shrink-0" size={20} />
                <h4 className="font-button text-xs font-bold uppercase tracking-widest text-primary-forest">
                  {"Our Mission"}
                </h4>
              </div>
              <p className="font-sans text-sm text-text-secondary leading-relaxed">
                {"To provide an unparalleled eco-luxury living experience that fosters growth, wellbeing, and community."}
              </p>
            </Card>

            <Card
              hover={false}
              border={true}
              className="bg-muted-bg/50 border-border/40 p-6 space-y-4"
              animate={false}
            >
              <div className="flex items-center space-x-3">
                <IconWrapper name="sparkles" className="text-gold-accent shrink-0" size={20} />
                <h4 className="font-button text-xs font-bold uppercase tracking-widest text-primary-forest">
                  {"Our Vision"}
                </h4>
              </div>
              <p className="font-sans text-sm text-text-secondary leading-relaxed">
                {"To set a new standard in premium co-living by seamlessly blending organic design with modern convenience."}
              </p>
            </Card>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
export default Story;
