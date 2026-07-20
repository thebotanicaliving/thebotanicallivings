import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useRoom } from '@/hooks/useRoom';
import { useRooms } from '@/hooks/useRooms';
import { useAvailability } from '@/hooks/useAvailability';
import { useSettings } from '@/hooks/useSettings';
import { Section } from '@/components/shared/Section';
import { Container } from '@/components/shared/Container';
import { Heading, Paragraph } from '@/components/shared/Typography';
import { Button } from '@/components/shared/Button';
import { AvailabilityBadge } from '@/components/shared/AvailabilityBadge';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { getDirectMediaUrl } from '@/utils/media';

import { IconWrapper } from '@/components/shared/IconWrapper';

export function RoomDetailsPage() {
    const { settings } = useSettings();
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { room, loading, error } = useRoom(slug);
  const { rooms } = useRooms();
  const { availability } = useAvailability(room?.id);
  const [activeImage, setActiveImage] = useState<string>('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const enquiryFormRef = useRef<HTMLDivElement>(null);

  // Sync active cover image when room loads or changes
  useEffect(() => {
    if (room) {
      setActiveImage(room.coverImage);
    }
  }, [room]);

  // Handle auto-scroll to booking form if "?enquire=true" query param is present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('enquire') === 'true' && enquiryFormRef.current) {
      setTimeout(() => {
        enquiryFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [location, room]);

  const scrollToEnquiry = () => {
    if (enquiryFormRef.current) {
      enquiryFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getWhatsAppEnquiryLink = () => {
    if (!room) return '#';
    const cleanPhone = (settings?.whatsapp || "").replace(/[^0-9]/g, '');
    const message = `Hello Botanical Living,

I am interested in the ${room.title}.

Could you please let me know its availability and pricing for next month?

Thank you.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center bg-warm-cream space-y-4">
        <div className="w-12 h-12 border-4 border-gold-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-text-secondary">Retrieving suite specifications...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center bg-warm-cream p-5">
        <div className="bg-white p-8 rounded-[24px] border border-border/30 max-w-md text-center space-y-4 shadow-subtle">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto text-lg font-bold">!</div>
          <Heading level={3} className="text-lg font-medium text-dark-forest">Suite Specification Not Found</Heading>
          <Paragraph size="sm" className="text-text-secondary">We could not load specifications for this co-living room. It might be archived or temporarily unavailable.</Paragraph>
          <Link to="/rooms">
            <Button variant="primary" className="mt-2 text-xs uppercase tracking-widest py-2 px-5">Back to Rooms</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Related rooms (excluding current room)
  const relatedRooms = rooms.filter((r) => r.slug !== room.slug).slice(0, 2);

  return (
    <div className="pt-14 md:pt-16 min-h-screen bg-warm-cream pb-24 relative">
      <Breadcrumb 
        items={[
          { label: 'Suites & Rooms', href: '/rooms' },
          { label: room.title }
        ]} 
        className="py-3.5 bg-warm-cream/50 border-b border-stone/10"
      />

      {/* Lightbox for Gallery */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 text-white hover:text-gold-accent p-2 cursor-pointer focus:outline-none"
            aria-label="Close Lightbox"
          >
            <IconWrapper name="close" size={32} />
          </button>
          
          <button
            onClick={() => setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : room.gallery.length - 1))}
            className="absolute left-4 md:left-8 text-white hover:text-gold-accent p-2 cursor-pointer focus:outline-none"
            aria-label="Previous Image"
          >
            <IconWrapper name="menu" className="rotate-90" size={28} />
          </button>

          <img
            src={getDirectMediaUrl(room.gallery[lightboxIndex])}
            alt={`Gallery ${lightboxIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl transition-transform duration-300"
          />

          <button
            onClick={() => setLightboxIndex((prev) => (prev !== null && prev < room.gallery.length - 1 ? prev + 1 : 0))}
            className="absolute right-4 md:right-8 text-white hover:text-gold-accent p-2 cursor-pointer focus:outline-none"
            aria-label="Next Image"
          >
            <IconWrapper name="menu" className="-rotate-90" size={28} />
          </button>
        </div>
      )}

      {/* Hero Header Area */}
      <div className="relative h-[45vh] md:h-[60vh] overflow-hidden bg-black">
        <img
          src={getDirectMediaUrl(room.coverImage)}
          alt={room.title}
          className="w-full h-full object-cover opacity-80 brightness-75 scale-100 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-forest/90 via-dark-forest/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 py-8 md:py-12">
          <Container className="max-w-[1300px]">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Link to="/rooms" className="text-warm-cream/70 hover:text-gold-accent text-xs tracking-widest uppercase font-semibold flex items-center gap-1">
                  <IconWrapper name="arrowLeft" size={12} />
                  Rooms
                </Link>
                <span className="text-warm-cream/40 text-xs">•</span>
                {availability && (
                  <AvailabilityBadge status={availability.status} availableRooms={availability.availableRooms} />
                )}
              </div>
              <Heading level={1} className="text-2xl md:text-5xl font-light text-warm-cream tracking-tight max-w-4xl">
                {room.title}
              </Heading>
              <div className="flex flex-wrap items-center gap-4 text-warm-cream/80 text-xs md:text-sm font-light pt-1">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5 uppercase tracking-wider text-[10px] font-semibold">
                  <IconWrapper name="bed" size={11} />
                  {room.occupancy === 1 ? 'Single Sharing' : 'Double Sharing'}
                </span>
                <span className="text-gold-accent font-semibold tracking-wider bg-gold-accent/10 px-3 py-1 rounded-full border border-gold-accent/20">
                  {room.pricing}
                </span>
              </div>
            </div>
          </Container>
        </div>
      </div>

      {/* Main Grid Content */}
      <Section variant="cream" className="!py-12 md:!py-16">
        <Container className="max-w-[1300px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Details & Gallery */}
            <div className="lg:col-span-8 space-y-10 md:space-y-12">
              
              {/* Media Gallery Grid */}
              <div className="space-y-3">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] border border-border/30 bg-white">
                  <img
                    src={getDirectMediaUrl(activeImage)}
                    alt={room.title}
                    className="w-full h-full object-cover cursor-zoom-in hover:brightness-95 transition-all duration-300"
                    onClick={() => {
                      const idx = room.gallery.indexOf(activeImage);
                      setLightboxIndex(idx >= 0 ? idx : 0);
                    }}
                  />
                </div>
                
                {/* Thumbnails */}
                <div className="grid grid-cols-4 gap-3">
                  {room.gallery.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(image)}
                      className={`relative aspect-[4/3] rounded-xl overflow-hidden border bg-white cursor-pointer transition-all duration-200 ${
                        activeImage === image ? 'border-gold-accent ring-2 ring-gold-accent/15 scale-[0.98]' : 'border-border/30 hover:opacity-90'
                      }`}
                    >
                      <img src={getDirectMediaUrl(image) || undefined} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Overview */}
              <div className="space-y-4">
                <Heading level={2} className="text-2xl font-light text-dark-forest">
                  Suite Overview
                </Heading>
                <Paragraph size="md" className="text-text-secondary leading-relaxed font-light">
                  {room.description}
                </Paragraph>
              </div>

              {/* Amenities Grid */}
              <div className="space-y-5 border-t border-border/30 pt-8">
                <Heading level={3} className="text-lg uppercase tracking-wider text-dark-forest font-semibold">
                  Suite Features & Comforts
                </Heading>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {room.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-border/20 shadow-sm">
                      <div className="p-2 bg-warm-cream rounded-lg text-gold-accent flex-shrink-0">
                        <IconWrapper name="sparkles" size={16} />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium text-dark-forest block">{amenity}</span>
                        <span className="text-[11px] text-text-secondary font-light">Premium, carefully inspected</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Included Services */}
              <div className="space-y-5 border-t border-border/30 pt-8">
                <Heading level={3} className="text-lg uppercase tracking-wider text-dark-forest font-semibold">
                  Bespoke Hospitality Services Included
                </Heading>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {room.services.map((service, index) => (
                    <div key={index} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-border/20 shadow-sm">
                      <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg flex-shrink-0">
                        <IconWrapper name="sparkles" size={16} />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium text-dark-forest block">{service}</span>
                        <span className="text-[11px] text-text-secondary font-light">Zero additional charges</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Sticky Booking / Enquiry Panel */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              
              {/* Sticky Card Desk */}
              <div ref={enquiryFormRef} className="bg-white border border-border/30 rounded-[28px] p-6 md:p-8 shadow-subtle space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-text-secondary font-button font-semibold block">
                    Starting Rent Rate
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl md:text-3xl font-bold text-gold-accent">
                      {room.pricing}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary font-light pt-1">
                    Includes food, laundry, high-speed Wi-Fi, daily deep-cleaning, housekeeping, security & uninterrupted backup.
                  </p>
                </div>

                <div className="border-t border-border/20" />

                {/* Booking Form Integration */}
                <div className="space-y-4">
                  <h4 className="font-heading text-lg font-light text-dark-forest">
                    Ready to reserve this space?
                  </h4>
                  <Link to="/booking">
                    <Button variant="primary" className="w-full justify-center text-xs tracking-widest uppercase py-3 font-semibold shadow-md rounded-button transition-all duration-300 hover:scale-[1.005]">
                      Book this Room
                    </Button>
                  </Link>
                </div>

                <div className="border-t border-border/20 pt-4 text-center space-y-3">
                  <span className="text-[10px] uppercase tracking-wider text-text-secondary font-button font-semibold block">
                    Need Direct Assistance?
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Call Direct */}
                    <a href={`tel:${(settings?.phone || "").replace(/\s+/g, '')}`}>
                      <Button variant="outline" className="w-full text-[10px] tracking-widest uppercase py-2.5 font-bold gap-1.5 justify-center border-border/35 text-text-primary">
                        Call Direct
                      </Button>
                    </a>

                    {/* WhatsApp CTA */}
                    <a href={getWhatsAppEnquiryLink()} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full text-[10px] tracking-widest uppercase py-2.5 font-bold gap-1.5 justify-center text-emerald-800 border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50">
                        WhatsApp
                        <IconWrapper name="whatsapp" className="text-emerald-600" size={13} />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* Live Location / Connectivity Anchor */}
              <div className="bg-dark-forest text-warm-cream rounded-[24px] p-6 border border-white/5 shadow-subtle space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-xl text-gold-accent">
                    <IconWrapper name="compass" size={18} />
                  </div>
                  <div>
                    <h5 className="font-heading text-sm font-medium tracking-wide">
                      Prime Location
                    </h5>
                    <p className="text-xs text-stone font-light">
                      Kondapur, Hyderabad
                    </p>
                  </div>
                </div>
                <p className="text-xs text-stone font-light leading-relaxed">
                  Located directly on Botanical Garden Road, just 5 minutes away from Hitech City and HCU, and walking distance to the park.
                </p>
                <a href={(settings?.googleMapsShare || "")} target="_blank" rel="noopener noreferrer" className="text-xs text-gold-accent font-semibold tracking-wide hover:underline flex items-center gap-1.5">
                  Open Google Maps
                  <IconWrapper name="sparkles" size={11} />
                </a>
              </div>

            </div>

          </div>

          {/* Related / Other Rooms Section */}
          {relatedRooms.length > 0 && (
            <div className="border-t border-border/30 pt-16 mt-16 space-y-8">
              <div className="max-w-2xl space-y-2">
                <span className="font-button text-[10px] font-semibold uppercase tracking-widest text-gold-accent block">
                  Compare Spaces
                </span>
                <Heading level={2} className="text-2xl md:text-3xl font-light text-dark-forest">
                  Our Other Premium Accommodations
                </Heading>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {relatedRooms.map((otherRoom) => {
                  return (
                    <div key={otherRoom.id} className="bg-white border border-border/30 rounded-card overflow-hidden flex flex-col md:flex-row h-full">
                      <div className="md:w-2/5 relative h-48 md:h-full min-h-[160px]">
                        <img src={getDirectMediaUrl(otherRoom.coverImage) || undefined} alt={otherRoom.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-5 md:w-3/5 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <h4 className="font-heading text-base font-medium text-dark-forest">
                            {otherRoom.title}
                          </h4>
                          <p className="text-xs text-text-secondary leading-relaxed font-light line-clamp-3">
                            {otherRoom.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between border-t border-border/10 pt-3">
                          <span className="font-sans text-xs font-bold text-gold-accent">
                            {otherRoom.pricing}
                          </span>
                          <Link to={`/rooms/${otherRoom.slug}`}>
                            <Button variant="outline" size="sm" className="text-[9px] uppercase tracking-widest py-1 px-3">
                              View Suite
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </Container>
      </Section>

      {/* Bottom Sticky CTA for Mobile (hides on desktop) */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-t border-border/30 p-3 flex items-center justify-between lg:hidden shadow-lg animate-slideUp">
        <div className="flex flex-col pl-2">
          <span className="text-[9px] uppercase tracking-wider text-text-secondary font-button font-semibold">
            {room.title}
          </span>
          <span className="font-sans text-sm font-bold text-gold-accent">
            {room.pricing}
          </span>
        </div>
        
        <div className="flex gap-2">
          <a href={getWhatsAppEnquiryLink()} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="text-[10px] tracking-widest uppercase font-bold py-2 px-3 border-emerald-200 text-emerald-800 bg-emerald-50">
              <IconWrapper name="whatsapp" className="text-emerald-600" size={14} />
            </Button>
          </a>
          
          <Button onClick={scrollToEnquiry} variant="primary" className="text-[10px] tracking-widest uppercase font-semibold py-2 px-4 shadow-sm">
            Enquire Now
          </Button>
        </div>
      </div>
    </div>
  );
}
export default RoomDetailsPage;
