import { useState, useEffect } from 'react';
import { bookingService } from '@/services/booking.service';
import { BookingRequest } from '@/types';

export function useBookings() {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = bookingService.subscribeBookings((data) => {
      setBookings(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { bookings, loading, error };
}

export function useBooking(id?: string) {
  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = bookingService.subscribeBooking(id, (data) => {
      setBooking(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  return { booking, loading, error };
}
