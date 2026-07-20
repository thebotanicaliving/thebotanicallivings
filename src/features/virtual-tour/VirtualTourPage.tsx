import { Section } from '@/components/shared/Section';
import { Container } from '@/components/shared/Container';
import { Heading, Paragraph } from '@/components/shared/Typography';
import { Button } from '@/components/shared/Button';
import { IconWrapper } from '@/components/shared/IconWrapper';
import { useSettings } from '@/hooks/useSettings';
import { VideoPlayer } from '@/components/shared/VideoPlayer';

export function VirtualTourPage() {
  const { settings } = useSettings();
  
  const tourUrl = settings?.virtualTour || "https://www.pexels.com/download/video/27807339/";

  const renderTourContent = () => {
    return (
      <VideoPlayer 
        url={tourUrl} 
        className="absolute inset-0 w-full h-full object-cover animate-fadeIn"
      />
    );
  };

  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-warm-cream pb-16">
      <Section variant="cream" className="!py-10 md:!py-16">
        <Container className="space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-button text-[10px] font-semibold uppercase tracking-widest text-gold-accent block animate-fadeIn">
              Immersive Spatial Walkthrough
            </span>
            <Heading level={1} className="text-3xl md:text-5xl font-light text-dark-forest tracking-tight animate-fadeIn">
              360° Virtual Tour
            </Heading>
            <Paragraph size="md" className="text-text-secondary max-w-lg mx-auto font-light leading-relaxed animate-fadeIn">
              Experience the beautiful architecture of Botanical Living from anywhere in the world. Walk through our luxury rooms and terrace gardens in immersive high-fidelity 360°.
            </Paragraph>
          </div>

          {/* Interactive Cinematic 360 Experience Display */}
          <div className="max-w-5xl mx-auto relative rounded-[32px] overflow-hidden border border-border/40 shadow-hover bg-black aspect-[16/9] group animate-fadeIn">
            {/* Embedded 360 Video Loop, Image, or Tour Iframe */}
            {renderTourContent()}

            {/* Premium Aesthetic Overlay card with guidelines */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-forest/90 via-dark-forest/10 to-transparent pointer-events-none" />
            
            <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
              <div className="space-y-2 max-w-md">
                <span className="bg-gold-accent text-dark-forest text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-sm">
                  Active Virtual Sandbox
                </span>
                <h3 className="font-heading text-xl md:text-2xl font-light text-warm-cream">
                  Botanical Living At Your Fingertips
                </h3>
                <p className="text-xs text-stone font-light leading-relaxed">
                  Click and drag to scan, look around, and zoom. Discover the high-ceiling premium lounge, study tables, attached kitchens, and serene biophilic courtyard.
                </p>
              </div>

              <div className="flex gap-3 pointer-events-auto">
                <a href="https://maps.app.goo.gl/A5sof44phwiS8qSw5" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="text-[10px] tracking-widest uppercase font-bold py-2.5 px-4 text-warm-cream border-white/20 hover:bg-white/10">
                    Open Google Earth
                  </Button>
                </a>
                
                <a href="https://wa.me/919966471719?text=Hello%20Botanical%20Living,%20I'm%20interested%20in%20arranging%20a%20live%20video%20call%20or%20physical%20visit%20to%20see%20your%20rooms." target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" className="text-[10px] tracking-widest uppercase font-semibold py-2.5 px-5 flex items-center gap-2">
                    Request Live Walkthrough
                    <IconWrapper name="whatsapp" className="fill-current" size={14} />
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Quick instructions details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-4">
            <div className="bg-white border border-border/20 p-6 rounded-2xl space-y-2.5 shadow-sm text-center">
              <div className="mx-auto w-10 h-10 bg-warm-cream text-gold-accent rounded-full flex items-center justify-center">
                <IconWrapper name="sparkles" size={18} />
              </div>
              <h4 className="font-heading text-base font-medium text-dark-forest">Biophilic Spaces</h4>
              <p className="text-xs text-text-secondary font-light leading-relaxed">
                Observe the elegant integration of hanging green vines, rich mahogany furniture, and natural warm lighting.
              </p>
            </div>

            <div className="bg-white border border-border/20 p-6 rounded-2xl space-y-2.5 shadow-sm text-center">
              <div className="mx-auto w-10 h-10 bg-warm-cream text-gold-accent rounded-full flex items-center justify-center">
                <IconWrapper name="bed" size={18} />
              </div>
              <h4 className="font-heading text-base font-medium text-dark-forest">Private Suite Comforts</h4>
              <p className="text-xs text-text-secondary font-light leading-relaxed">
                Zoom into individual study tables, orthopedic mattresses, wide closets, and independent air conditioners.
              </p>
            </div>

            <div className="bg-white border border-border/20 p-6 rounded-2xl space-y-2.5 shadow-sm text-center">
              <div className="mx-auto w-10 h-10 bg-warm-cream text-gold-accent rounded-full flex items-center justify-center">
                <IconWrapper name="whatsapp" size={18} />
              </div>
              <h4 className="font-heading text-base font-medium text-dark-forest">Virtual Guided Tours</h4>
              <p className="text-xs text-text-secondary font-light leading-relaxed">
                Send a quick text on WhatsApp to schedule a real-time live WhatsApp/FaceTime video tour with our coordinator.
              </p>
            </div>
          </div>

        </Container>
      </Section>
    </div>
  );
}
export default VirtualTourPage;
