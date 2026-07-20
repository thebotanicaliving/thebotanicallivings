import { useSettings } from '@/hooks/useSettings';
import { Section, Container, Heading, Paragraph, IconWrapper, ScrollReveal } from '@/components/shared';

export function FinalCta() {
    const { settings } = useSettings();
  return (
    <Section
      id="final-cta"
      variant="light"
      spacing="same"
      className="relative py-12 md:py-16"
    >
      <Container className="max-w-[1300px]">
        {/* Premium Banner Container */}
        <ScrollReveal variant="scaleUp" className="w-full">
          <div className="relative w-full overflow-hidden rounded-image shadow-subtle min-h-[380px] md:min-h-[440px] flex items-center">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600&auto=format&fit=crop"
                alt="Premium Eco-Luxury Botanical Living Suites"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Elegant deep forest green & dark gradient overlay for superior text contrast */}
              <div className="absolute inset-0 bg-gradient-to-r from-dark-forest/95 via-dark-forest/85 to-dark-forest/40 md:bg-gradient-to-r md:from-dark-forest/95 md:via-dark-forest/80 md:to-transparent" />
            </div>

            {/* Content Over Background */}
            <div className="relative z-10 w-full max-w-2xl px-6 py-12 md:p-16 text-left space-y-6 md:space-y-8">
              <div className="space-y-3">
                <span className="font-button text-[11px] font-semibold uppercase tracking-widest text-gold-accent block">
                  Priority Reservations
                </span>
                <Heading level={2} className="text-warm-cream font-light text-2xl md:text-4xl leading-tight">
                  Secure Your Space Today
                </Heading>
                <Paragraph size="md" className="text-stone/90 leading-relaxed font-light font-sans max-w-lg">
                  Premium co-living with limited availability in Kondapur. Connect with our reservations desk to check pricing and schedule your visit.
                </Paragraph>
              </div>

              {/* Response CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <a
                  href={`https://wa.me/${(settings?.whatsapp || "").replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center space-x-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-button text-xs font-bold tracking-widest uppercase rounded-button shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <IconWrapper 
                    name="whatsapp" 
                    className="text-white fill-current" 
                    size={18} 
                  />
                  <span>Chat on WhatsApp</span>
                </a>

                <a
                  href={`mailto:${(settings?.primaryEmail || "")}`}
                  className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-transparent border border-warm-cream/35 hover:bg-warm-cream/10 text-warm-cream font-button text-xs font-bold tracking-widest uppercase rounded-button transition-all duration-200 backdrop-blur-sm"
                >
                  <IconWrapper name="email" size={16} />
                  <span>Email Reservations</span>
                </a>
              </div>

              <p className="font-sans text-[10px] text-stone/50 italic">
                *Reception desk is operational 24/7. Response times on WhatsApp are typically under 10 minutes.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
export default FinalCta;
