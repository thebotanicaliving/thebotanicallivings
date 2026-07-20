import { Hotel } from '@/constants/hotel';
import { Section, Container, Heading, Paragraph, IconWrapper, ScrollReveal, Marquee } from '@/components/shared';

export function AmenitiesPreview() {
  const amenities = Hotel.amenities || [];

  // Split amenities for multiple marquee rows if needed, or just one large one
  const firstRow = amenities.slice(0, Math.ceil(amenities.length / 2));
  const secondRow = amenities.slice(Math.ceil(amenities.length / 2));

  return (
    <Section
      id="amenities-preview"
      variant="cream"
      spacing="same"
      className="bg-[#F9F7F2] overflow-hidden"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Left Column: Context */}
          <ScrollReveal variant="slideUp" className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <span className="font-button text-[10px] font-bold uppercase tracking-[0.3em] text-gold-accent block">
                {"Hospitality Suite"}
              </span>
              <Heading level={2} className="text-4xl md:text-5xl lg:text-6xl text-dark-forest font-light leading-[1.1] tracking-tight">
                {"Bespoke Services"}
              </Heading>
              <Paragraph size="lg" className="text-text-secondary leading-relaxed font-light">
                {"We have anticipated every necessity of modern professional life, executing each with a level of precision that ensures total peace of mind."}
              </Paragraph>
            </div>

            <div className="pt-6 border-t border-dark-forest/5 flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold-accent/10 flex items-center justify-center text-gold-accent">
                  <IconWrapper name="Shield" size={14} />
                </div>
                <span className="text-[10px] font-bold text-dark-forest uppercase tracking-widest">24/7 Security</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold-accent/10 flex items-center justify-center text-gold-accent">
                  <IconWrapper name="Zap" size={14} />
                </div>
                <span className="text-[10px] font-bold text-dark-forest uppercase tracking-widest">Power Backup</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Right Column: Marquee of services */}
          <div className="lg:col-span-7 relative">
            {/* Gradient Mask for classy look */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#F9F7F2] to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#F9F7F2] to-transparent z-10" />

            <div className="space-y-8 py-4">
              <Marquee speed={30} direction="left" className="py-2">
                {firstRow.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-subtle border border-border/10 min-w-[240px] group hover:border-gold-accent/30 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-stone/30 flex items-center justify-center text-primary-forest group-hover:bg-gold-accent group-hover:text-white transition-all">
                      <IconWrapper name={item.icon as never} size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-dark-forest tracking-tight">{item.name}</h4>
                      <p className="text-[9px] text-text-secondary uppercase tracking-wider">Premium Service</p>
                    </div>
                  </div>
                ))}
              </Marquee>

              <Marquee speed={35} direction="right" className="py-2">
                {secondRow.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-subtle border border-border/10 min-w-[240px] group hover:border-gold-accent/30 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-stone/30 flex items-center justify-center text-primary-forest group-hover:bg-gold-accent group-hover:text-white transition-all">
                      <IconWrapper name={item.icon as never} size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-dark-forest tracking-tight">{item.name}</h4>
                      <p className="text-[9px] text-text-secondary uppercase tracking-wider">Premium Service</p>
                    </div>
                  </div>
                ))}
              </Marquee>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default AmenitiesPreview;
