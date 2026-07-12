import { useState, useEffect } from 'react';
import { useRooms } from '@/hooks/useRooms';
import { useBookings } from '@/hooks/useBookings';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { availabilityService } from '@/services/availability.service';
import { BookingRequest, BlockedDate, Room } from '@/types';
import { Button, Card } from '@/components/shared';
import { 
  Calendar as CalendarIcon, 
  Grid3X3, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  CalendarDays, 
  DollarSign, 
  FileText,
  Clock,
  CheckCircle,
  X,
  Info,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/providers/ToastProvider';
import { OccupancyCalendar } from '@/components/admin/OccupancyCalendar';

export function AvailabilityPage() {
  const { rooms, loading: roomsLoading } = useRooms();
  const { bookings, loading: bookingsLoading, refresh: refreshBookings } = useBookings();
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(true);
  const [activeTab, setActiveTab] = useState<'month' | 'timeline'>('month');
  const { showToast } = useToast();

  // Selected state for monthly view
  const today = new Date();
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());

  // Block modal & detail drawer state
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState<'Maintenance' | 'Private Use' | 'Cleaning' | 'VIP Reservation'>('Maintenance');
  const [blockNotes, setBlockNotes] = useState('');
  const [submittingBlock, setSubmittingBlock] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<BlockedDate | null>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchBlockedDates = async () => {
    if (!db) return;
    setLoadingBlocks(true);
    try {
      const snap = await getDocs(collection(db, 'blockedDates'));
      const list: BlockedDate[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as BlockedDate);
      });
      setBlockedDates(list);
    } catch (err) {
      console.error('Error fetching blocked dates:', err);
    } finally {
      setLoadingBlocks(false);
    }
  };

  useEffect(() => {
    fetchBlockedDates();
  }, []);

  // Set default room selection once loaded
  useEffect(() => {
    if (rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun, 6 = Sat

  const calendarDays: { dayNum: number; dateStr: string; isPadding: boolean }[] = [];

  // Padding cells for previous month days
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push({ dayNum: 0, dateStr: '', isPadding: true });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    calendarDays.push({ dayNum: day, dateStr, isPadding: false });
  }

  // Helper to match status for a single day of selected room
  const getDayStatusDetails = (dateStr: string) => {
    if (!selectedRoomId) return { type: 'available', item: null };

    // 1. Check blocked dates
    const block = blockedDates.find(b => {
      return b.roomId === selectedRoomId && b.startDate <= dateStr && b.endDate >= dateStr;
    });
    if (block) return { type: 'blocked', item: block };

    // 2. Check bookings (status must not be cancelled, rejected, refunded)
    const booking = bookings.find(b => {
      if (b.roomId !== selectedRoomId) return false;
      if (b.status === 'cancelled' || b.status === 'rejected' || b.status === 'refunded') return false;
      return b.checkInDate <= dateStr && b.checkOutDate > dateStr; // standard hotel booking check-out day is not occupied for next stay
    });

    if (booking) return { type: 'booked', item: booking };

    // 3. Fallback check for exact-day checkout/checkin indicator
    const transitionBooking = bookings.find(b => {
      if (b.roomId !== selectedRoomId) return false;
      if (b.status === 'cancelled' || b.status === 'rejected' || b.status === 'refunded') return false;
      return b.checkOutDate === dateStr;
    });
    if (transitionBooking) return { type: 'checkout-day', item: transitionBooking };

    return { type: 'available', item: null };
  };

  const handleCellClick = (day: { dayNum: number; dateStr: string; isPadding: boolean }) => {
    if (day.isPadding) return;
    const statusInfo = getDayStatusDetails(day.dateStr);

    if (statusInfo.type === 'booked' || statusInfo.type === 'checkout-day') {
      setSelectedBooking(statusInfo.item as BookingRequest);
      setSelectedBlock(null);
    } else if (statusInfo.type === 'blocked') {
      setSelectedBlock(statusInfo.item as BlockedDate);
      setSelectedBooking(null);
    } else {
      // Open quick block creator
      setSelectedDateStr(day.dateStr);
      setBlockNotes('');
      setShowBlockModal(true);
    }
  };

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !selectedRoomId || !selectedDateStr) return;

    setSubmittingBlock(true);
    try {
      const room = rooms.find(r => r.id === selectedRoomId);
      await availabilityService.addBlockedDate({
        roomId: selectedRoomId,
        roomTitle: room?.title || 'Selected Room',
        startDate: selectedDateStr,
        endDate: selectedDateStr, // single day block
        reason: blockReason,
        notes: blockNotes || `Blocked for ${blockReason}`
      });

      showToast(`Successfully blocked ${selectedDateStr} for guest availability.`, 'success');
      setShowBlockModal(false);
      await fetchBlockedDates();
    } catch (err) {
      console.error(err);
      showToast('Could not save calendar date block.', 'error');
    } finally {
      setSubmittingBlock(false);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm('Are you sure you want to lift this manual inventory block?')) return;
    try {
      await availabilityService.deleteBlockedDate(blockId);
      showToast('Inventory block successfully removed.', 'success');
      setSelectedBlock(null);
      await fetchBlockedDates();
    } catch (err) {
      console.error(err);
      showToast('Could not lift block.', 'error');
    }
  };

  const activeRoom = rooms.find(r => r.id === selectedRoomId);

  if (roomsLoading || bookingsLoading) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-2 border-forest border-t-transparent rounded-full animate-spin" />
        <p className="text-text-secondary text-xs tracking-widest font-mono uppercase">Calculating Room Inventory Schedules...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1300px] mx-auto space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone/10 pb-6">
        <div>
          <h1 className="text-3xl font-heading font-light tracking-wide text-dark-forest flex items-center gap-2.5">
            <CalendarIcon className="text-gold-accent w-7 h-7" /> Room Inventory Schedule
          </h1>
          <p className="text-xs tracking-wider uppercase text-text-secondary/60 font-mono mt-1">
            Real-time reservations visual control & custom physical locks
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200/60 self-start md:self-center">
          <button
            onClick={() => setActiveTab('month')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all outline-none ${activeTab === 'month' ? 'bg-white shadow-sm text-dark-forest font-bold' : 'text-stone-500 hover:text-dark-forest'}`}
          >
            <Grid3X3 size={14} /> Month Grid
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all outline-none ${activeTab === 'timeline' ? 'bg-white shadow-sm text-dark-forest font-bold' : 'text-stone-500 hover:text-dark-forest'}`}
          >
            <CalendarDays size={14} /> 30-Day Timeline
          </button>
        </div>
      </div>

      {activeTab === 'timeline' ? (
        <OccupancyCalendar />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Month Calendar (Spans 3 columns) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Calendar Controls & Filters */}
            <div className="p-5 bg-white rounded-card border border-stone/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Room Selection */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-xs font-sans tracking-widest uppercase text-text-secondary font-bold shrink-0">Suite Type:</span>
                <select
                  value={selectedRoomId}
                  onChange={(e) => {
                    setSelectedRoomId(e.target.value);
                    setSelectedBooking(null);
                    setSelectedBlock(null);
                  }}
                  className="w-full md:w-auto px-3 py-2 border border-stone/20 rounded-lg text-sm bg-stone-50/50 text-dark-forest font-medium outline-none focus:ring-1 focus:ring-gold-accent focus:border-gold-accent"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>

              {/* Month Navigator */}
              <div className="flex items-center space-x-5">
                <button 
                  onClick={handlePrevMonth}
                  className="p-2 border border-stone/20 rounded-full hover:bg-stone-50 text-dark-forest hover:text-gold-accent transition-all duration-300 outline-none"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="text-lg font-heading tracking-wide text-dark-forest min-w-[150px] text-center font-light">
                  {months[currentMonth]} {currentYear}
                </div>
                <button 
                  onClick={handleNextMonth}
                  className="p-2 border border-stone/20 rounded-full hover:bg-stone-50 text-dark-forest hover:text-gold-accent transition-all duration-300 outline-none"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Quick Legend */}
              <div className="flex flex-wrap gap-4 text-[10px] uppercase font-bold tracking-widest text-text-secondary/80 font-sans">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EAF5F2] border border-[#BFDFD6]" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FAF4F2] border border-[#EFE1DD]" />
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FDFCF9] border border-[#F4EFEB]" />
                  <span>Locked</span>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6 bg-white rounded-card border border-stone/10 shadow-sm overflow-hidden">
              <div className="grid grid-cols-7 gap-3 text-center border-b border-stone/10 pb-4 mb-4">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d, i) => (
                  <div key={i} className="text-[10px] font-sans tracking-widest uppercase text-text-secondary font-bold">
                    <span className="hidden sm:inline">{d}</span>
                    <span className="sm:hidden">{d.slice(0, 3)}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-3">
                {calendarDays.map((day, index) => {
                  if (day.isPadding) {
                    return (
                      <div 
                        key={`padding-${index}`} 
                        className="aspect-square bg-stone-50/25 rounded-xl border border-stone-100/50"
                      />
                    );
                  }

                  const statusDetails = getDayStatusDetails(day.dateStr);
                  let cellBg = 'bg-[#FCFDFD] border-[#E8EFF1] text-[#2C4D54] hover:bg-[#F5F8F8] hover:border-[#BFDFD6]';
                  let statusMarker = 'bg-emerald-500/85';
                  let infoLabel = 'Available';
                  let labelColor = 'text-[#3E707A]';

                  if (statusDetails.type === 'booked') {
                    cellBg = 'bg-[#FAF4F2] border-[#EFE1DD] text-[#8F4A3F] hover:bg-[#F5ECE8] cursor-pointer';
                    statusMarker = 'bg-[#8F4A3F]';
                    const guestName = (statusDetails.item as BookingRequest).firstName || 'Reserved';
                    infoLabel = guestName;
                    labelColor = 'text-[#8F4A3F]';
                  } else if (statusDetails.type === 'blocked') {
                    cellBg = 'bg-[#FDFCF9] border-[#F4EFEB] text-[#8C7A58] hover:bg-[#F9F5EE] cursor-pointer';
                    statusMarker = 'bg-[#8C7A58]';
                    infoLabel = (statusDetails.item as BlockedDate).reason;
                    labelColor = 'text-[#8C7A58]';
                  } else if (statusDetails.type === 'checkout-day') {
                    cellBg = 'bg-[#F3F6FA] border-[#E2EAF4] text-[#4A6B94] hover:bg-[#E9F0F8] cursor-pointer';
                    statusMarker = 'bg-[#4A6B94]';
                    infoLabel = 'CO: ' + ((statusDetails.item as BookingRequest).firstName || 'Guest');
                    labelColor = 'text-[#4A6B94]';
                  }

                  return (
                    <div
                      key={`day-${day.dayNum}`}
                      onClick={() => handleCellClick(day)}
                      className={`aspect-square rounded-xl border p-3 flex flex-col justify-between transition-all duration-300 cursor-pointer ${cellBg} relative group`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-semibold">{day.dayNum}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusMarker}`} />
                      </div>

                      <div className={`text-[10px] font-medium tracking-wide truncate ${labelColor}`}>
                        {infoLabel}
                      </div>

                      <div className="text-[9px] font-bold text-text-secondary/50 font-mono flex justify-between items-center">
                        <span>{statusDetails.type === 'available' ? 'Open' : ''}</span>
                        <span className="text-[10px] text-dark-forest">
                          {statusDetails.type === 'available' && activeRoom?.price ? `₹${activeRoom.price}` : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dynamic Sidebar Inspector (Spans 1 column) */}
          <div className="lg:col-span-1">
            {/* Inspector Card */}
            <div className="p-6 bg-white rounded-card border border-stone/10 shadow-sm min-h-[500px] flex flex-col justify-between sticky top-24">
              <div className="space-y-6">
                <h3 className="font-heading font-light text-xl text-dark-forest border-b border-stone/10 pb-3 flex items-center gap-2">
                  <Info size={18} className="text-gold-accent shrink-0" /> Detail Inspector
                </h3>

                {!selectedBooking && !selectedBlock && (
                  <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                    <CalendarIcon className="text-stone-300 mb-3 shrink-0" size={36} />
                    <p className="text-xs text-text-secondary/70 leading-relaxed font-semibold">
                      Select any occupied, checked-out, or locked slot on the grid calendar to inspect exact details.
                    </p>
                  </div>
                )}

                {/* Booking Details Display */}
                {selectedBooking && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="bg-[#FAF4F2] border border-[#EFE1DD] p-4 rounded-xl relative">
                      <button 
                        onClick={() => setSelectedBooking(null)} 
                        className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                      <span className="px-2 py-0.5 bg-[#8F4A3F]/10 text-[#8F4A3F] text-[9px] tracking-widest font-bold rounded-full font-sans">
                        GUEST RESERVATION
                      </span>
                      <h4 className="font-heading text-lg text-[#8F4A3F] mt-2 font-medium">
                        {selectedBooking.firstName} {selectedBooking.lastName}
                      </h4>
                      <p className="text-[10px] text-text-secondary/50 font-mono mt-0.5">Reference: {selectedBooking.bookingRef || selectedBooking.id?.slice(0,8)}</p>
                    </div>

                    <div className="space-y-4 text-xs text-text-primary">
                      <div className="flex items-center gap-2.5">
                        <Mail size={14} className="text-text-secondary/60 shrink-0" />
                        <span className="truncate font-medium">{selectedBooking.email}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Phone size={14} className="text-text-secondary/60 shrink-0" />
                        <span className="font-medium">{selectedBooking.phone}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CalendarDays size={14} className="text-text-secondary/60 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-dark-forest">Stay Dates</p>
                          <p className="text-text-secondary text-[11px] mt-0.5 font-mono">
                            {selectedBooking.checkInDate} <ArrowRight size={10} className="inline mx-1" /> {selectedBooking.checkOutDate}
                          </p>
                          <p className="text-[10px] text-text-secondary/60 mt-0.5">({selectedBooking.numberOfNights || selectedBooking.duration || 'N/A'} Nights duration)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <User size={14} className="text-text-secondary/60 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-dark-forest">Guests Configuration</p>
                          <p className="text-text-secondary text-[11px] mt-0.5">
                            {selectedBooking.guestsCount || 1} Total ({selectedBooking.adultsCount || 1} Adults, {selectedBooking.childrenCount || 0} Children)
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2.5 pt-3 border-t border-stone/10 font-mono text-dark-forest">
                        <DollarSign size={14} className="text-emerald-700 shrink-0" />
                        <span>
                          <strong>Grand Total:</strong> ₹{selectedBooking.grandTotal || 'Paid'}
                        </span>
                      </div>
                    </div>

                    {selectedBooking.notes && (
                      <div className="p-3 bg-[#FAF8F5] border border-stone/10 rounded-xl text-[11px] text-text-secondary italic">
                        "{selectedBooking.notes}"
                      </div>
                    )}
                  </div>
                )}

                {/* Block Details Display */}
                {selectedBlock && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="bg-[#FDFCF9] border border-[#F4EFEB] p-4 rounded-xl relative">
                      <button 
                        onClick={() => setSelectedBlock(null)} 
                        className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                      <span className="px-2 py-0.5 bg-[#8C7A58]/10 text-[#8C7A58] text-[9px] tracking-widest font-bold rounded-full font-sans">
                        MAINTENANCE LOCK
                      </span>
                      <h4 className="font-heading text-lg text-[#8C7A58] mt-2 font-medium">{selectedBlock.reason}</h4>
                      <p className="text-[10px] text-text-secondary/50 font-mono mt-0.5">{selectedBlock.roomTitle}</p>
                    </div>

                    <div className="space-y-3 text-xs text-text-primary">
                      <div className="flex items-start gap-2.5">
                        <CalendarDays size={14} className="text-text-secondary/60 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-dark-forest">Blocked Interval</p>
                          <p className="text-text-secondary text-[11px] font-mono mt-0.5">
                            {selectedBlock.startDate} <ArrowRight size={10} className="inline mx-1" /> {selectedBlock.endDate}
                          </p>
                        </div>
                      </div>
                      {selectedBlock.notes && (
                        <div className="p-3 bg-[#FAF8F5] border border-stone/10 rounded-xl text-[11px] text-text-secondary italic">
                          "{selectedBlock.notes}"
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-stone/10">
                      <Button 
                        onClick={() => handleDeleteBlock(selectedBlock.id!)}
                        className="w-full justify-center text-xs py-2.5 bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        <Trash2 size={13} className="mr-1.5" /> Lift Date Block
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-[10px] text-center text-text-secondary/40 font-mono border-t border-stone/10 pt-4 mt-6">
                Botanical Living Inventory Desk
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK BLOCK CREATOR MODAL */}
      {showBlockModal && selectedDateStr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-card w-full max-w-sm border border-stone/10 shadow-xl overflow-hidden relative animate-slideUp">
            <div className="bg-dark-forest text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-heading font-light text-lg tracking-wide">Register Date Lock</h3>
                <p className="text-[10px] tracking-wider uppercase text-white/60 font-mono mt-0.5">Lock Room Inventory Slot</p>
              </div>
              <button 
                onClick={() => setShowBlockModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="p-6 space-y-4">
              <p className="text-xs text-text-secondary leading-relaxed">
                Apply manual inventory reservation lock for <strong className="font-mono text-dark-forest">{selectedDateStr}</strong> on room type: <strong className="text-dark-forest font-semibold">{activeRoom?.title}</strong>.
              </p>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-text-secondary font-sans">Lock Reason</label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value as any)}
                  className="w-full p-2.5 border border-stone/20 rounded-lg text-sm bg-white focus:ring-1 focus:ring-gold-accent outline-none"
                >
                  <option value="Maintenance">Maintenance</option>
                  <option value="Private Use">Private Use</option>
                  <option value="Cleaning">Deep Cleaning</option>
                  <option value="VIP Reservation">VIP Stays</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-text-secondary font-sans">Admin Notes</label>
                <textarea
                  value={blockNotes}
                  onChange={(e) => setBlockNotes(e.target.value)}
                  rows={2}
                  placeholder="Details of block..."
                  className="w-full p-2.5 border border-stone/20 rounded-lg text-xs resize-none focus:ring-1 focus:ring-gold-accent outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-stone/10">
                <Button 
                  type="button" 
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 justify-center py-2 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submittingBlock}
                  className="flex-1 justify-center py-2 text-xs bg-dark-forest text-white"
                >
                  {submittingBlock ? 'Saving...' : 'Apply Lock'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AvailabilityPage;
