import { useRooms } from '@/hooks/useRooms';
import { RoomCard } from '@/components/shared/RoomCard';
import { Section, Container, Heading, Paragraph, ScrollReveal, ScrollStagger } from '@/components/shared';

export function RoomsPreview() {
  const { rooms, loading, error } = useRooms();

  // Filter only featured or first few rooms for the preview
  const previewRooms = rooms.filter(r => r.published).slice(0, 4);

  return (
    <Section
      id="rooms-preview"
      variant="light"
      spacing="same"
      className="bg-white"
    >
      <Container className="space-y-12 md:space-y-16">
        {/* Section Header */}
        <ScrollReveal variant="slideUp" className="max-w-2xl space-y-4">
          <span className="font-button text-xs font-semibold uppercase tracking-widest text-gold-accent block">
            {"Premium Sharing Options"}
          </span>
          <Heading level={2} className="text-dark-forest">
            Our Residential Suites
          </Heading>
          <Paragraph size="md">
            Discover thoughtfully designed living spaces that prioritize your comfort, privacy, and productivity.
          </Paragraph>
        </ScrollReveal>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center animate-pulse">
            <div className="w-10 h-10 border-2 border-gold-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-medium text-text-secondary uppercase tracking-widest">Finding the perfect space...</p>
          </div>
        )}

        {/* Room Types Grid */}
        {!loading && !error && previewRooms.length > 0 && (
          <ScrollStagger className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {previewRooms.map((room) => (
              <ScrollReveal key={room.id} variant="slideUp" className="h-full">
                <RoomCard room={room} />
              </ScrollReveal>
            ))}
          </ScrollStagger>
        )}

        {/* Fallback if no rooms found */}
        {!loading && !error && previewRooms.length === 0 && (
          <div className="text-center py-12 bg-stone/20 rounded-card border border-dashed border-border/40">
            <Paragraph className="text-text-secondary">Explore our upcoming room collections soon.</Paragraph>
          </div>
        )}
      </Container>
    </Section>
  );
}

export default RoomsPreview;
