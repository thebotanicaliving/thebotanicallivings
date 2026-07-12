import { useRooms } from '@/hooks/useRooms';
import { Assets } from '@/constants/assets';
import { Section, Container, Card, Image, Heading, Paragraph, Button, ScrollReveal, ScrollStagger } from '@/components/shared';

export function RoomsPreview() {
  const { rooms } = useRooms();


  return (
    <Section
      id="rooms-preview"
      variant="light"
      spacing="same"
    >
      <Container className="space-y-12 md:space-y-16">
        {/* Section Header */}
        <ScrollReveal variant="slideUp" className="max-w-2xl space-y-4">
          <span className="font-button text-xs font-semibold uppercase tracking-widest text-gold-accent block">
            {"Premium Suites"}
          </span>
          <Heading level={2} className="text-dark-forest">
            {"Signature Accommodations"}
          </Heading>
          <Paragraph size="md">
            {"Discover our thoughtfully designed co-living spaces."}
          </Paragraph>
        </ScrollReveal>

        {/* Room Grid - 2 Premium Cards Centered */}
        <ScrollStagger className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {rooms.filter(r => r.published && r.featured).slice(0,2).map((room) => (
            <ScrollReveal key={room.id} variant="slideUp" className="h-full">
              <Card
                hover={true}
                border={true}
                className="flex flex-col h-full bg-white border-border/40 overflow-hidden p-0 rounded-card"
              >
                {/* Card Image */}
                <div className="relative h-64 md:h-72 overflow-hidden">
                  <Image
                    src={room.coverImage}
                    alt={room.title}
                    aspectRatio="landscape"
                    radius="none"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Specs tag top left */}
                  <div className="absolute top-4 left-4 bg-warm-cream/95 backdrop-blur-sm border border-border/30 px-3 py-1.5 rounded-full text-xs font-semibold text-dark-forest shadow-sm">
                    {room.title}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 md:p-8 flex flex-col justify-between flex-grow space-y-6">
                  <div className="space-y-3">
                    <Heading level={3} className="text-xl md:text-2xl font-light text-dark-forest">
                      {room.title}
                    </Heading>
                    <p className="font-sans text-sm text-text-secondary leading-relaxed min-h-[64px]">
                      {room.description}
                    </p>
                    
                    {/* Detailed features pill list */}
                    <div className="pt-2">
                      <span className="text-[10px] uppercase tracking-wider text-text-secondary font-button block mb-2">
                        Included Room Features
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-hidden">
                        {(room.amenities && room.amenities.length > 0
                          ? room.amenities
                          : (room.shortDescription ? room.shortDescription.split(',').map((s: string) => s.trim()) : [])
                        ).slice(0, 5).map((feat, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-sans font-medium bg-olive/10 text-olive border border-olive/10 tracking-wide"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border/40 my-2" />

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-text-secondary font-button">
                        Monthly Cost
                      </span>
                      <span className="font-sans text-sm font-bold text-gold-accent">
                        {`${room.price} ${room.priceSuffix || ""}`}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs uppercase tracking-widest px-4 font-semibold"
                      onClick={() => {
                        window.location.href = `/rooms/${room.slug}`;
                      }}
                    >
                      View Room
                    </Button>
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </ScrollStagger>
      </Container>
    </Section>
  );
}
export default RoomsPreview;
