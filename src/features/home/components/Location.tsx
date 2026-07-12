import { useHomepage } from '@/hooks/useHomepage';
import { Hotel } from '@/constants/hotel';
import { Section, Container, Heading, Paragraph, IconWrapper, Button } from '@/components/shared';

export function Location() {
  const { config, loading } = useHomepage();
  if (loading) return null;
  const launchDirections = () => {
    window.open(Hotel.location.googleMaps, '_blank');
  };

  return (
    <Section
      id="location-section"
      variant="cream"
      spacing="same"
    >
      <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Side: Copy and POIs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            <span className="font-button text-xs font-semibold uppercase tracking-widest text-gold-accent block">
              {"Location"}
            </span>
            <Heading level={2} className="text-dark-forest">
              {config.locationTitle}
            </Heading>
            <Paragraph size="md">
              {config.locationSubtitle}
            </Paragraph>
          </div>

          {/* Real Address Card */}
          <div className="flex items-start space-x-3 p-4 bg-white/40 rounded-card border border-border/40">
            <span className="text-primary-forest mt-0.5 flex-shrink-0">
              <IconWrapper name="address" size={20} />
            </span>
            <div>
              <h4 className="font-sans text-sm font-semibold text-dark-forest">The Residence Address</h4>
              <p className="font-sans text-sm text-text-secondary">{config.locationAddress}</p>
            </div>
          </div>

          {/* Mobile-Only Map: Prominently displayed right after the Address on smaller screens */}
          <div className="block lg:hidden h-[260px] xs:h-[300px] w-full relative rounded-image overflow-hidden shadow-subtle border border-border/50 bg-[#E5E0D5] mt-4">
            <iframe
              src="https://maps.google.com/maps?q=Botanical%20living,%20Botanical%20Garden%20Road,%20Sri%20Ram%20Nagar,%20Kondapur,%20Hyderabad,%20Telangana%20500084&t=&z=17&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Botanical Living exact Google Maps Location Mobile"
              className="w-full h-full"
            />
          </div>

          {/* Points of Interest list */}
          <div className="space-y-4 pt-4">
            <h4 className="font-button text-[10px] font-bold tracking-widest text-gold-accent uppercase">
              Nearby Conveniences
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
    { name: "Hitech City", distance: "2.5 km", time: "10 mins" },
    { name: "Sarat City Capital Mall", distance: "1.2 km", time: "5 mins" },
    { name: "Botanical Garden", distance: "0.5 km", time: "2 mins" },
    { name: "AIG Hospitals", distance: "3.0 km", time: "12 mins" },
  ].map((poi, i) => {
                // Dynamically assign luxury icons to match content
                let iconName: "map" | "zap" | "utensils" | "parking" | "star" = "star";
                const lowerName = poi.name.toLowerCase();
                if (lowerName.includes('garden')) iconName = "map";
                else if (lowerName.includes('tech') || lowerName.includes('hub')) iconName = "zap";
                else if (lowerName.includes('dining') || lowerName.includes('shop')) iconName = "utensils";
                else if (lowerName.includes('transport') || lowerName.includes('public')) iconName = "parking";

                return (
                  <div 
                    key={i} 
                    className="p-3.5 rounded-button bg-white border border-[#E5E0D5] hover:border-gold-accent/40 hover:shadow-subtle transition-all duration-300 flex items-center space-x-3 text-left"
                  >
                    <span className="text-gold-accent flex-shrink-0 bg-stone/20 p-2 rounded-full flex items-center justify-center">
                      <IconWrapper name={iconName} size={14} />
                    </span>
                    <div className="flex-grow min-w-0">
                      <span className="font-sans text-sm font-semibold text-dark-forest tracking-tight block truncate sm:normal-case">
                        {poi.name}
                      </span>
                      <span className="font-sans text-[10px] text-text-secondary font-medium tracking-wide block uppercase mt-0.5">
                        {poi.distance}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              iconRight={<IconWrapper name="arrowRight" size={16} />}
              className="uppercase tracking-widest text-xs font-semibold"
              onClick={launchDirections}
            >
              Get Directions
            </Button>
          </div>
        </div>

        {/* Right Side (Desktop Only): Beautiful, interactive exact Google Maps iframe */}
        <div className="hidden lg:block lg:col-span-7 h-[400px] md:h-[450px] relative rounded-image overflow-hidden shadow-subtle border border-border/50 bg-[#E5E0D5]">
          <iframe
            src="https://maps.google.com/maps?q=Botanical%20living,%20Botanical%20Garden%20Road,%20Sri%20Ram%20Nagar,%20Kondapur,%20Hyderabad,%20Telangana%20500084&t=&z=17&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Botanical Living exact Google Maps Location Desktop"
            className="w-full h-full"
          />
        </div>
      </Container>
    </Section>
  );
}
export default Location;
