import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { BookingRequest } from '@/types';

export const bookingService = {
  async submitBookingRequest(request: Partial<BookingRequest> & Record<string, any>): Promise<string> {
    const fullRequest: any = {
      ...request,
      status: request.status || 'pending',
      createdAt: request.createdAt || new Date().toISOString()
    };

    const localRequests = JSON.parse(localStorage.getItem('botanical_booking_requests') || '[]');
    const localId = 'local_' + Math.random().toString(36).substr(2, 9);
    localRequests.push({ id: localId, ...fullRequest });
    localStorage.setItem('botanical_booking_requests', JSON.stringify(localRequests));

    if (!db) {
      console.log('[BookingService] Firebase not initialized. Stored locally.');
      return localId;
    }

    const path = 'bookingRequests';
    try {
      const docRef = await addDoc(collection(db, path), fullRequest);
      console.log('[BookingService] Booking request submitted to Firestore. Doc ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.warn('[BookingService] Failed to submit to Firestore due to permission or connection issues. Saved locally and proceeding.', error);
      return localId;
    }
  },

  async getBookingRequests(): Promise<BookingRequest[]> {
    if (!db) {
      return JSON.parse(localStorage.getItem('botanical_booking_requests') || '[]');
    }
    try {
      const q = query(collection(db, 'bookingRequests'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const list: BookingRequest[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as BookingRequest);
      });
      return list;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return JSON.parse(localStorage.getItem('botanical_booking_requests') || '[]');
    }
  },

  async updateBookingStatus(
    id: string, 
    status: BookingRequest['status']
  ): Promise<void> {
    if (!db) throw new Error('Firebase not initialized');
    
    // Update booking status
    await updateDoc(doc(db, 'bookingRequests', id), { 
      status,
      updatedAt: new Date().toISOString()
    });

    try {
      // Fetch some details to write history
      const { getDoc } = await import('firebase/firestore');
      const bSnap = await getDoc(doc(db, 'bookingRequests', id));
      if (bSnap.exists()) {
        const b = bSnap.data() as BookingRequest;
        const ref = b.bookingRef || `ID-${id.slice(0, 8)}`;
        
        // Add audit history log
        const historyRef = doc(collection(db, 'bookingHistory'));
        await setDoc(historyRef, {
          bookingId: id,
          bookingRef: ref,
          action: `Status updated to ${status}`,
          performedBy: 'admin',
          notes: `Administrative status transition to ${status.toUpperCase()} performed successfully.`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('Could not write booking status transition history log', err);
    }
  },

  async updateBookingNotes(id: string, notes: string): Promise<void> {
    if (!db) throw new Error('Firebase not initialized');
    await updateDoc(doc(db, 'bookingRequests', id), { notes });
  },

  async deleteBooking(id: string): Promise<void> {
    if (!db) throw new Error('Firebase not initialized');
    await deleteDoc(doc(db, 'bookingRequests', id));
  }
};
