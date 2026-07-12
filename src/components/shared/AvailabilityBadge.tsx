import { cn } from '@/utils/cn';
import { AvailabilityStatus } from '@/types';

interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
  availableRooms?: number;
  className?: string;
}

export function AvailabilityBadge({ status, availableRooms, className }: AvailabilityBadgeProps) {
  const getColors = () => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      case 'Limited':
        return 'bg-amber-50 text-amber-700 border-amber-200/50';
      case 'Sold Out':
        return 'bg-rose-50 text-rose-700 border-rose-200/50';
      default:
        return 'bg-stone/50 text-text-secondary border-border/30';
    }
  };

  const getLabel = () => {
    if (status === 'Available' && availableRooms && availableRooms > 0) {
      return `${availableRooms} Rooms Left`;
    }
    if (status === 'Limited' && availableRooms && availableRooms > 0) {
      return `Only ${availableRooms} Left`;
    }
    return status;
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm tracking-wide',
        getColors(),
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full animate-pulse',
          status === 'Available' ? 'bg-emerald-500' : status === 'Limited' ? 'bg-amber-500' : 'bg-rose-500'
        )}
      />
      {getLabel()}
    </span>
  );
}
export default AvailabilityBadge;
