import { useRooms } from '@/hooks/useRooms';
import { RoomCard } from '@/components/shared/RoomCard';
import { Section } from '@/components/shared/Section';
import { Container } from '@/components/shared/Container';
import { Heading, Paragraph } from '@/components/shared/Typography';
import { ScrollReveal, ScrollStagger } from '@/components/shared';

export function RoomsPage() {
  const { rooms, loading, error, refresh } = useRooms();

  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-warm-cream">
      {/* Decorative ambient blobs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-primary-forest/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-gold-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <Section variant="cream" className="!py-16">
        <Container className="space-y-12">
          {/* Header */}
          <div className="max-w-3xl space-y-4">
            <span className="font-button text-xs font-semibold uppercase tracking-widest text-gold-accent block animate-fadeIn">
              Choose Your Space
            </span>
            <Heading level={1} className="text-3xl md:text-5xl font-light text-dark-forest tracking-tight animate-fadeIn">
              Premium Co-Living Rooms
            </Heading>
            <Paragraph size="lg" className="text-text-secondary max-w-xl font-light leading-relaxed animate-fadeIn">
              Our residential suites are designed with organic textures, premium wood furniture, attached private bathrooms, and custom desks to optimize sleep, well-being, and work-from-home productivity.
            </Paragraph>
          </div>

          {/* Loading, Empty and Error States */}
          {loading && (
            <div className="py-24 text-center space-y-4 animate-pulse">
              <div className="w-12 h-12 border-4 border-gold-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-medium text-text-secondary">Loading rooms from secure storage...</p>
            </div>
          )}

          {error && (
            <div className="py-16 text-center max-w-md mx-auto space-y-4 bg-white p-8 rounded-[24px] border border-border/30 shadow-subtle">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto text-xl font-bold">!</div>
              <p className="text-sm text-text-primary font-medium">Failed to retrieve room details</p>
              <p className="text-xs text-text-secondary">{error.message}</p>
              <button
                onClick={refresh}
                className="bg-dark-forest text-warm-cream px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-primary-forest transition-colors cursor-pointer"
              >
                Retry Loading
              </button>
            </div>
          )}

          {!loading && !error && rooms.length === 0 && (
            <div className="py-24 text-center max-w-md mx-auto space-y-4 bg-white p-8 rounded-[24px] border border-border/30">
              <p className="text-sm text-text-secondary">No co-living rooms currently listed.</p>
            </div>
          )}

          {/* Room List Grid */}
          {!loading && !error && rooms.length > 0 && (
            <ScrollStagger className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
              {rooms.map((room) => (
                <ScrollReveal key={room.id} variant="slideUp">
                  <RoomCard room={room} />
                </ScrollReveal>
              ))}
            </ScrollStagger>
          )}
        </Container>
      </Section>
    </div>
  );
}
export default RoomsPage;
