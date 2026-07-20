import { Hotel } from '@/constants/hotel';
import { Section, Container, Heading, Paragraph, IconWrapper, Button, ScrollReveal } from '@/components/shared';

export function Location() {
  const launchDirections = () => {
    window.open(Hotel.location.googleMaps, '_blank');
  };

  const nearbyPlaces = Hotel.location.nearbyPlaces || [];

  return (
    <Section
      id="location-section"
      variant="cream"
      spacing="same"
    >
      <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
        {/* Left Side: Copy and Nearby Places Grid */}
        <div className="lg:col-span-6 space-y-8">
          <ScrollReveal variant="slideUp" className="space-y-4">
            <span className="font-button text-xs font-semibold uppercase tracking-widest text-gold-accent block">
              {"Strategic Location"}
            </span>
            <Heading level={2} className="text-dark-forest">
              {"Stay at the Heart of Hyderabad's Tech Hub"}
            </Heading>
            <Paragraph size="md">
              {"Strategically located near Botanical Garden, Kondapur, we provide seamless connectivity to major business districts and lifestyle destinations."}
            </Paragraph>
          </ScrollReveal>

          {/* Real Address Card */}
          <ScrollReveal variant="slideUp" delay={0.1} className="flex items-start space-x-4 p-5 bg-white rounded-card border border-border/40 shadow-sm">
            <span className="text-primary-forest mt-0.5 flex-shrink-0 bg-primary-forest/5 p-2.5 rounded-xl">
              <IconWrapper name="address" size={24} />
            </span>
            <div>
              <h4 className="font-heading text-lg font-semibold text-dark-forest">The Residence Address</h4>
              <p className="font-sans text-sm text-text-secondary leading-relaxed mt-1">{Hotel.location.fullAddress}</p>
            </div>
          </ScrollReveal>

          {/* Nearby Places Grid */}
          <ScrollReveal variant="slideUp" delay={0.2} className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h4 className="font-button text-[11px] font-bold tracking-[0.2em] text-gold-accent uppercase">
                Nearby Prime Locations
              </h4>
              <span className="text-[10px] text-text-secondary/50 font-bold uppercase tracking-widest font-sans">Strategic Hubs</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {nearbyPlaces.map((poi, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-4 rounded-2xl bg-white border border-border/20 hover:border-gold-accent/40 hover:shadow-subtle transition-all duration-500 group cursor-default"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-stone/30 flex items-center justify-center text-dark-forest group-hover:bg-gold-accent group-hover:text-white transition-all duration-500">
                      <IconWrapper name="MapPin" size={16} />
                    </div>
                    <div>
                      <span className="font-sans text-sm font-semibold text-dark-forest tracking-tight block">
                        {poi.name}
                      </span>
                      <span className="text-[10px] text-text-secondary/60 font-medium uppercase tracking-wider block mt-0.5">
                        {`Destination • Kondapur`}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[11px] font-bold text-gold-accent block">
                      {poi.distance}
                    </span>
                    <span className="text-[8px] text-text-secondary/40 font-bold uppercase tracking-tighter block">Distance</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal variant="slideUp" delay={0.3} className="pt-4">
            <Button
              variant="outline"
              iconRight={<IconWrapper name="arrowRight" size={16} />}
              className="px-8 py-4 uppercase tracking-widest text-xs font-semibold"
              onClick={launchDirections}
            >
              Get Directions on Google Maps
            </Button>
          </ScrollReveal>
        </div>

        {/* Right Side: Beautiful, interactive exact Google Maps iframe */}
        <ScrollReveal variant="scaleUp" delay={0.2} className="lg:col-span-6 h-[400px] md:h-[600px] relative rounded-card overflow-hidden shadow-2xl border border-border/50 bg-[#E5E0D5] sticky top-32">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.0567059144405!2d78.34499379678954!3d17.456999799999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93349847e08b%3A0xede0da138d080875!2sBotanical%20living!5e0!3m2!1sen!2sus!4v1784562444379!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            title="Botanical Living exact Google Maps Location"
            className="w-full h-full grayscale-0 transition-all duration-700"
          />
        </ScrollReveal>
      </Container>
    </Section>
  );
}

export default Location;
