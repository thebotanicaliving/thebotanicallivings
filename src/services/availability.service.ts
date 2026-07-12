import { collection, getDocs, query, where, addDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { BookingRequest, BlockedDate, PricingRules } from '@/types';

// Simple date parser / formatted helper
export function getDatesBetween(startDateStr: string, endDateStr: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const current = new Date(start);

  while (current < end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function isOverlapping(start1: string, end1: string, start2: string, end2: string): boolean {
  return new Date(start1) < new Date(end2) && new Date(start2) < new Date(end1);
}

export const availabilityService = {
  // Get all active bookings for a room (excluding cancelled/rejected)
  async getActiveBookings(roomId: string): Promise<BookingRequest[]> {
    if (!db) return [];
    try {
      const q = query(
        collection(db, 'bookingRequests'),
        where('roomId', '==', roomId)
      );
      const snap = await getDocs(q);
      const bookings: BookingRequest[] = [];
      snap.forEach(d => {
        const b = { id: d.id, ...d.data() } as BookingRequest;
        // Exclude cancelled or rejected bookings from blocking inventory
        if (b.status !== 'cancelled' && b.status !== 'rejected' && b.status !== 'refunded') {
          bookings.push(b);
        }
      });
      return bookings;
    } catch (e) {
      console.error('[AvailabilityService] getActiveBookings error:', e);
      return [];
    }
  },

  // Get all blocked dates for a room
  async getBlockedDates(roomId: string): Promise<BlockedDate[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, 'blockedDates'), where('roomId', '==', roomId));
      const snap = await getDocs(q);
      const blocks: BlockedDate[] = [];
      snap.forEach(d => {
        blocks.push({ id: d.id, ...d.data() } as BlockedDate);
      });
      return blocks;
    } catch (e) {
      console.error('[AvailabilityService] getBlockedDates error:', e);
      return [];
    }
  },

  // Get pricing rule for a room (or default 'global')
  async getPricingRules(roomId: string): Promise<PricingRules> {
    const defaultRules: PricingRules = {
      roomId,
      basePrice: 4500,
      weekendPrice: 5500,
      holidayPrice: 6500,
      extraAdultPrice: 1500,
      extraChildPrice: 7500 / 10, // 750
      discountPercent: 0,
      taxesPercent: 12,
      cleaningFee: 500,
      platformFee: 200,
      securityDeposit: 3000,
      advancePercent: 50, // 50% advance required
      minimumStay: 1,
      maximumStay: 30,
      cancellationWindow: 24,
      refundRules: 'Cancel before 24 hours of check-in for a full refund.'
    };

    if (!db) return defaultRules;
    try {
      // First try to find room-specific rules
      const q = query(collection(db, 'pricingRules'), where('roomId', '==', roomId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return { id: snap.docs[0].id, ...snap.docs[0].data() } as PricingRules;
      }

      // Try global rules
      const qGlobal = query(collection(db, 'pricingRules'), where('roomId', '==', 'global'));
      const snapGlobal = await getDocs(qGlobal);
      if (!snapGlobal.empty) {
        return { id: snapGlobal.docs[0].id, ...snapGlobal.docs[0].data(), roomId } as PricingRules;
      }

      return defaultRules;
    } catch (e) {
      console.error('[AvailabilityService] getPricingRules error:', e);
      return defaultRules;
    }
  },

  // Set pricing rule for a room
  async savePricingRules(rules: PricingRules): Promise<void> {
    if (!db) return;
    try {
      const docId = rules.id || rules.roomId || 'global';
      await setDoc(doc(db, 'pricingRules', docId), rules);
    } catch (e) {
      console.error('[AvailabilityService] savePricingRules error:', e);
    }
  },

  // Block dates for a room (admin)
  async addBlockedDate(block: Omit<BlockedDate, 'id' | 'createdAt'>): Promise<string> {
    if (!db) return '';
    try {
      const payload = {
        ...block,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'blockedDates'), payload);
      return docRef.id;
    } catch (e) {
      console.error('[AvailabilityService] addBlockedDate error:', e);
      throw e;
    }
  },

  // Remove block
  async deleteBlockedDate(id: string): Promise<void> {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'blockedDates', id));
    } catch (e) {
      console.error('[AvailabilityService] deleteBlockedDate error:', e);
    }
  },

  // Get all blocked dates for admin view
  async getAllBlockedDates(): Promise<BlockedDate[]> {
    if (!db) return [];
    try {
      const snap = await getDocs(collection(db, 'blockedDates'));
      const list: BlockedDate[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as BlockedDate);
      });
      return list;
    } catch (e) {
      console.error('[AvailabilityService] getAllBlockedDates error:', e);
      return [];
    }
  },

  // Check dynamic room inventory & availability for a given date range
  async checkRoomAvailability(
    roomId: string, 
    checkIn: string, 
    checkOut: string,
    totalRoomsConfigured = 5 // fall back to 5 total rooms per room type
  ): Promise<{
    available: boolean;
    remainingRooms: number;
    totalRooms: number;
    bookedCount: number;
    isBlockedByMaintenance: boolean;
    conflictingBlocks: BlockedDate[];
  }> {
    // 1. Fetch blocks
    const blocks = await this.getBlockedDates(roomId);
    const conflictingBlocks = blocks.filter(b => isOverlapping(b.startDate, b.endDate, checkIn, checkOut));
    
    if (conflictingBlocks.length > 0) {
      return {
        available: false,
        remainingRooms: 0,
        totalRooms: totalRoomsConfigured,
        bookedCount: 0,
        isBlockedByMaintenance: true,
        conflictingBlocks
      };
    }

    // 2. Fetch bookings
    const bookings = await this.getActiveBookings(roomId);
    
    // Calculate overlapping bookings per single day to find peak occupancy
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    let maxOverlappingBookings = 0;

    // Loop through each night of the stay
    const tempDate = new Date(checkInDate);
    while (tempDate < checkOutDate) {
      const currentDayStr = tempDate.toISOString().split('T')[0];
      
      // Count active bookings for this specific night
      const activeOnDay = bookings.filter(b => {
        return b.checkInDate <= currentDayStr && b.checkOutDate > currentDayStr;
      }).length;

      if (activeOnDay > maxOverlappingBookings) {
        maxOverlappingBookings = activeOnDay;
      }

      tempDate.setDate(tempDate.getDate() + 1);
    }

    const remainingRooms = Math.max(0, totalRoomsConfigured - maxOverlappingBookings);

    return {
      available: remainingRooms > 0,
      remainingRooms,
      totalRooms: totalRoomsConfigured,
      bookedCount: maxOverlappingBookings,
      isBlockedByMaintenance: false,
      conflictingBlocks: []
    };
  },

  // Live Price Calculation Engine (Strictly pulls from Firestore configuration)
  async calculateLivePrice(
    roomId: string,
    checkIn: string,
    checkOut: string,
    guestsCount: number,
    adultsCount: number,
    childrenCount: number
  ) {
    const rules = await this.getPricingRules(roomId);
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    
    let baseAmount = 0;
    let extraGuestsAmount = 0;
    
    // Loop through each night and apply weekend/holiday pricing
    const current = new Date(start);
    for (let i = 0; i < nights; i++) {
      const dayOfWeek = current.getDay(); // 0 is Sunday, 6 is Saturday
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday and Saturday night stay

      // We can define custom holidays or just check for weekends
      let rate = rules.basePrice;
      if (isWeekend) {
        rate = rules.weekendPrice || rules.basePrice;
      }
      baseAmount += rate;

      // Extra guest calculations (base capacity assumed 2 adults)
      const extraAdults = Math.max(0, adultsCount - 2);
      const extraChildren = childrenCount;
      extraGuestsAmount += (extraAdults * rules.extraAdultPrice) + (extraChildren * rules.extraChildPrice);

      current.setDate(current.getDate() + 1);
    }

    const rawSubtotal = baseAmount + extraGuestsAmount;
    const discountAmount = Math.round(rawSubtotal * (rules.discountPercent / 100));
    const subtotalAfterDiscount = rawSubtotal - discountAmount;

    const taxesAmount = Math.round(subtotalAfterDiscount * (rules.taxesPercent / 100));
    
    const grandTotal = subtotalAfterDiscount + taxesAmount + rules.cleaningFee + rules.platformFee + rules.securityDeposit;
    const advanceAmount = Math.round(grandTotal * (rules.advancePercent / 100));

    return {
      nights,
      basePricePerNight: rules.basePrice,
      baseAmount,
      extraGuestsAmount,
      discountPercent: rules.discountPercent,
      discountAmount,
      taxesPercent: rules.taxesPercent,
      taxesAmount,
      cleaningFee: rules.cleaningFee,
      platformFee: rules.platformFee,
      securityDeposit: rules.securityDeposit,
      grandTotal,
      advanceAmount,
      advancePercent: rules.advancePercent,
      rules
    };
  }
};
