import { useState, useEffect, useCallback } from 'react';
import { bookingService } from '@/services/booking.service';
import { BookingRequest } from '@/types';

export function useBookings() {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bookingService.getBookingRequests();
      setBookings(data);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, error, refresh: fetchBookings };
}

export function useBooking(id?: string) {
  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBooking = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await bookingService.getBookingRequests(); // Quick workaround, usually you'd have getBooking(id)
      const found = data.find(b => b.id === id);
      setBooking(found || null);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  return { booking, loading, error, refresh: fetchBooking };
}
