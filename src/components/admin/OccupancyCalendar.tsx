import { useState, useEffect } from 'react';
import { availabilityService } from '@/services/availability.service';
import { BookingRequest, BlockedDate, Room } from '@/types';
import { Button, Card, Paragraph } from '@/components/shared';
import { Calendar, ShieldAlert, Trash2, ArrowRight } from 'lucide-react';
import { useToast } from '@/providers/ToastProvider';
import { useRooms } from '@/hooks/useRooms';
import { useBookings } from '@/hooks/useBookings';

export function OccupancyCalendar() {
  const { rooms, loading: roomsLoading } = useRooms();
  const { bookings, loading: bookingsLoading } = useBookings();
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(true);
  const { showToast } = useToast();

  // Block form state
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState<'Maintenance' | 'Private Use' | 'Cleaning' | 'VIP Reservation'>('Maintenance');
  const [notes, setNotes] = useState('');
  const [submittingBlock, setSubmittingBlock] = useState(false);

  // Generate next 30 days
  const getNext30Days = () => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const days = getNext30Days();

  useEffect(() => {
    if (rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  useEffect(() => {
    setLoadingBlocks(true);
    const unsubscribe = availabilityService.subscribeBlockedDates((data) => {
      setBlockedDates(data);
      setLoadingBlocks(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !startDate || !endDate) {
      showToast('Please select all required blocking fields.', 'error');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      showToast('End Date must be strictly after Start Date.', 'error');
      return;
    }

    setSubmittingBlock(true);
    try {
      const room = rooms.find(r => r.id === selectedRoomId);
      await availabilityService.addBlockedDate({
        roomId: selectedRoomId,
        roomTitle: room?.title || 'Unknown Room',
        startDate,
        endDate,
        reason,
        notes: notes || `Blocked for ${reason}`
      });

      showToast(`Dates whitelisted and locked for ${room?.title}!`, 'success');
      // Reset form
      setStartDate('');
      setEndDate('');
      setNotes('');
    } catch (err) {
      console.error(err);
      showToast('Failed to create calendar date block.', 'error');
    } finally {
      setSubmittingBlock(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (!confirm('Are you sure you want to remove this date block? Room will immediately return to public inventory.')) return;
    try {
      await availabilityService.deleteBlockedDate(id);
      showToast('Date block removed successfully.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Could not delete block.', 'error');
    }
  };

  // Helper to determine occupancy status of a room on a given day
  const getDayStatus = (roomId: string, date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];

    // Check if blocked by admin
    const block = blockedDates.find(b => {
      return b.roomId === roomId && b.startDate <= formattedDate && b.endDate >= formattedDate;
    });
    if (block) return { type: 'blocked', label: `Blocked: ${block.reason}`, detail: block };

    // Check if checked in, occupied, checked out, check in day, check out day
    const booking = bookings.find(b => {
      return b.status !== 'cancelled' && b.status !== 'rejected' && b.roomId === roomId && b.checkInDate <= formattedDate && b.checkOutDate >= formattedDate;
    });

    if (booking) {
      const isCheckIn = booking.checkInDate === formattedDate;
      const isCheckOut = booking.checkOutDate === formattedDate;

      if (isCheckIn) {
        return { type: 'checkin', label: `Check-In: ${booking.firstName}`, detail: booking };
      }
      if (isCheckOut) {
        return { type: 'checkout', label: `Check-Out: ${booking.firstName}`, detail: booking };
      }
      return { type: 'occupied', label: `Stay: ${booking.firstName}`, detail: booking };
    }

    return { type: 'available', label: 'Available', detail: null };
  };

  const loading = roomsLoading || bookingsLoading || loadingBlocks;

  if (loading && rooms.length === 0) {
    return (
      <Card className="p-8 text-center bg-white border border-stone/10 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-forest border-t-transparent rounded-full animate-spin mb-3" />
        <Paragraph className="text-text-secondary text-xs tracking-widest font-mono uppercase">Loading live occupancy matrices...</Paragraph>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Visual Live Grid Calendar */}
      <Card className="p-6 bg-white rounded-card border border-stone/10 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="text-gold-accent w-5 h-5 shrink-0" />
            <h2 className="text-xl font-heading font-light tracking-wide text-dark-forest">Stay Occupancy Timeline</h2>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-[10px] uppercase font-bold tracking-widest text-text-secondary/80 font-sans">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#EAF5F2] border border-[#BFDFD6]" />
              <span>Check-Ins</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FCF9F2] border border-[#EFE5D1]" />
              <span>Check-Outs</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#F5F5F3] border border-[#E8E8E4]" />
              <span>Occupied</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FAF4F2] border border-[#EFE1DD]" />
              <span>Blocked / Maintenance</span>
            </div>
          </div>
        </div>

        {/* Schedule grid table */}
        <div className="overflow-x-auto border border-stone/10 rounded-xl">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone/10">
                <th className="p-4 font-sans text-[10px] uppercase tracking-widest text-text-secondary font-bold min-w-[200px] sticky left-0 bg-stone-50 border-r border-stone/10 z-10">
                  Suite Category
                </th>
                {days.map((d, idx) => (
                  <th key={idx} className="p-3 text-center border-l border-stone/10 min-w-[55px]">
                    <div className="text-[10px] font-bold text-text-secondary/50 font-sans uppercase">
                      {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-sm font-semibold text-dark-forest font-mono mt-0.5">
                      {d.getDate()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} className="border-b border-stone/10 hover:bg-stone-50/20 transition-colors">
                  {/* Room Category Label (Sticky left) */}
                  <td className="p-4 font-semibold text-xs tracking-wide text-dark-forest sticky left-0 bg-white border-r border-stone/10 z-10 shadow-[4px_0_8px_rgba(0,0,0,0.01)]">
                    {room.title}
                  </td>
                  
                  {days.map((day, idx) => {
                    const stat = getDayStatus(room.id, day);
                    let cellClass = 'bg-[#FCFDFD] text-text-secondary/20 hover:bg-[#F5F8F8]';
                    let label = '—';
                    let tooltipLabel = 'Available Suite Slot';

                    if (stat.type === 'checkin') {
                      cellClass = 'bg-[#EAF5F2] border-y border-[#BFDFD6] hover:bg-[#DCF0EB] text-[#2C544B]';
                      label = 'IN';
                      tooltipLabel = stat.label;
                    } else if (stat.type === 'checkout') {
                      cellClass = 'bg-[#FCF9F2] border-y border-[#EFE5D1] hover:bg-[#FAF2DF] text-[#7A6233]';
                      label = 'OUT';
                      tooltipLabel = stat.label;
                    } else if (stat.type === 'occupied') {
                      cellClass = 'bg-[#F5F5F3] border-y border-[#E8E8E4] hover:bg-[#EAEAEA] text-[#555550]';
                      label = 'Stay';
                      tooltipLabel = stat.label;
                    } else if (stat.type === 'blocked') {
                      cellClass = 'bg-[#FAF4F2] border-y border-[#EFE1DD] hover:bg-[#F5ECE8] text-[#8F4A3F]';
                      label = 'LOCK';
                      tooltipLabel = stat.label;
                    }

                    return (
                      <td 
                        key={idx} 
                        className={`p-3 text-center border-l border-stone/10 text-[10px] font-bold tracking-wider font-sans transition-all duration-300 ${cellClass}`}
                        title={tooltipLabel}
                      >
                        <span className="select-none">{label}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADMIN DATE BLOCKER / ROOM BLOCKS LISTING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Blocking Form */}
        <Card className="p-6 bg-white rounded-card border border-stone/10 shadow-sm lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-stone/10 pb-3 mb-4">
              <ShieldAlert className="text-[#8F4A3F] w-4 h-4 shrink-0" />
              <h3 className="font-heading font-light tracking-wide text-md text-dark-forest">Lock Suite Inventory</h3>
            </div>

            <form onSubmit={handleAddBlock} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-text-secondary font-sans">Suite Type</label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full p-2.5 border border-stone/20 rounded-lg text-sm bg-white focus:ring-1 focus:ring-gold-accent outline-none"
                  required
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-text-secondary font-sans">From Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 border border-stone/20 rounded-lg text-xs outline-none focus:ring-1 focus:ring-gold-accent"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-text-secondary font-sans">To Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 border border-stone/20 rounded-lg text-xs outline-none focus:ring-1 focus:ring-gold-accent"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-text-secondary font-sans">Lock Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full p-2.5 border border-stone/20 rounded-lg text-sm bg-white focus:ring-1 focus:ring-gold-accent outline-none"
                  required
                >
                  <option value="Maintenance">Maintenance</option>
                  <option value="Private Use">Private Use</option>
                  <option value="Cleaning">Deep Cleaning</option>
                  <option value="VIP Reservation">VIP Stays</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-text-secondary font-sans">Admin Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Details of block..."
                  className="w-full p-2.5 border border-stone/20 rounded-lg text-xs resize-none outline-none focus:ring-1 focus:ring-gold-accent"
                />
              </div>

              <Button
                type="submit"
                className="w-full py-2.5 text-xs justify-center bg-dark-forest text-white"
                disabled={submittingBlock}
              >
                {submittingBlock ? 'Applying Lock...' : 'Apply Calendar Lock'}
              </Button>
            </form>
          </div>
        </Card>

        {/* Existing Active Blocks List */}
        <Card className="p-6 bg-white rounded-card border border-stone/10 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-stone/10 pb-3 mb-4">
            <h3 className="font-heading font-light tracking-wide text-md text-dark-forest">Active Date Locks ({blockedDates.length})</h3>
            <span className="text-[10px] font-bold text-text-secondary/50 uppercase tracking-widest font-sans">Manual Blocks</span>
          </div>

          <div className="overflow-y-auto max-h-[340px] space-y-3 pr-1">
            {blockedDates.length === 0 ? (
              <p className="text-center py-16 text-text-secondary/60 text-sm">No manual date locks configured. All public slots are open.</p>
            ) : blockedDates.map((block) => (
              <div 
                key={block.id}
                className="p-4 border border-stone/10 rounded-xl flex items-center justify-between gap-4 hover:border-stone/20 transition-all duration-300 bg-[#FAF8F5]/30 hover:bg-[#FAF8F5]/80"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs tracking-wide text-dark-forest truncate max-w-[200px]">{block.roomTitle}</span>
                    <span className="px-2 py-0.5 bg-[#8F4A3F]/10 text-[#8F4A3F] text-[9px] uppercase tracking-wider font-bold rounded-full font-sans shrink-0">{block.reason}</span>
                  </div>
                  <p className="text-xs text-text-secondary/70 font-mono flex items-center gap-1">
                    {new Date(block.startDate).toLocaleDateString()} <ArrowRight size={10} className="inline opacity-50" /> {new Date(block.endDate).toLocaleDateString()}
                  </p>
                  {block.notes && <p className="text-xs text-text-secondary italic font-medium truncate">"{block.notes}"</p>}
                </div>

                <button
                  onClick={() => handleDeleteBlock(block.id!)}
                  className="p-2 border border-stone/10 text-text-secondary/60 hover:text-red-600 hover:border-red-100 rounded-lg shrink-0 transition-colors"
                  title="Lift date block"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default OccupancyCalendar;
