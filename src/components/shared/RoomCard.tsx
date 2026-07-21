import { Link } from 'react-router-dom';

import { Room } from '@/types';
import { Card } from '@/components/shared/Card';
import { Image } from '@/components/shared/Image';
import { Heading } from '@/components/shared/Typography';
import { Button } from '@/components/shared/Button';
import { AvailabilityBadge } from '@/components/shared/AvailabilityBadge';
import { IconWrapper } from '@/components/shared/IconWrapper';

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  const availableSlots = Math.max(0, (room.maxCapacity || 0) - (room.currentResidents || 0));

  return (
    <Card
      hover={true}
      border={true}
      className="flex flex-col h-full bg-white border-border/40 overflow-hidden p-0 rounded-card"
    >
      {/* Card Image Wrapper */}
      <div className="relative h-64 md:h-72 overflow-hidden group">
        <Link to={`/rooms/${room.slug}`}>
          <Image
            src={room.coverImage}
            alt={`Premium Coliving Rooms in Kondapur - ${room.title}`}
            aspectRatio="landscape"
            radius="none"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>
        
        {/* Availability Badge Top Left */}
        <div className="absolute top-4 left-4 z-10">
          <div className={`px-3 py-1.5 rounded-full text-[10px] tracking-widest font-semibold uppercase flex items-center gap-1.5 ${availableSlots > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${availableSlots > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {availableSlots > 0 ? `${availableSlots} Slot${availableSlots !== 1 ? 's' : ''} Available` : 'Fully Occupied'}
            </div>
        </div>

        {/* Occupancy badge Top Right */}
        <div className="absolute top-4 right-4 bg-dark-forest/85 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] tracking-widest font-semibold text-warm-cream border border-warm-cream/10 flex items-center gap-1.5 uppercase">
          <IconWrapper name="bed" size={10} />
          {room.occupancy}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 md:p-8 flex flex-col justify-between flex-grow space-y-6">
        <div className="space-y-3">
          <Heading level={3} className="text-xl md:text-2xl font-light text-dark-forest">
            <Link to={`/rooms/${room.slug}`} className="hover:text-gold-accent transition-colors">
              {room.title}
            </Link>
          </Heading>
          
          <p className="font-sans text-sm text-text-secondary leading-relaxed min-h-[48px]">
            {(room.shortDescription || room.description).length > 140 ? `${(room.shortDescription || room.description).substring(0, 137)}...` : room.description}
          </p>

          {/* Key Amenities */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {room.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="bg-stone text-text-primary px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide border border-border/10"
              >
                {amenity}
              </span>
            ))}
            {room.amenities.length > 3 && (
              <span className="text-[10px] text-text-secondary font-medium px-1.5 py-1">
                +{room.amenities.length - 3} more
              </span>
            )}
          </div>

          {/* Inventory Count Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-text-secondary font-light pt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gold-accent shrink-0" />
            <span>
              <strong>{room.totalRooms || 6}</strong> {(room.occupancy === '1 Guest' || room.title.toLowerCase().includes('single')) ? 'Single' : 'Double'} Sharing Suites present in the hotel
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/40 my-1" />

        {/* Card Footer */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-text-secondary font-button">
              Pricing Details
            </span>
            <span className="font-sans text-base font-bold text-gold-accent">
              {(room.price || room.pricing) ? (
                `${room.price || room.pricing} ${room.priceSuffix || ""}`
              ) : (
                "Request Quote"
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/rooms/${room.slug}`}>
              <Button
                variant="outline"
                size="sm"
                className="text-[10px] uppercase tracking-widest px-3 py-1.5 font-semibold text-text-primary border-border/40 hover:bg-stone/30"
              >
                Details
              </Button>
            </Link>

            <Link to="/booking">
              <Button
                variant="primary"
                size="sm"
                className="text-[10px] uppercase tracking-widest px-3.5 py-1.5 font-semibold"
              >
                Book
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
export default RoomCard;
