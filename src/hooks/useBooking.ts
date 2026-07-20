import { useState } from 'react';
import { BookingRequest } from '@/types';
import { bookingService } from '@/services/booking.service';

export function useBooking() {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const submitEnquiry = async (request: Partial<BookingRequest> & Record<string, any>): Promise<string | null> => {
    setSubmitting(true);
    setSuccess(false);
    setError(null);
    try {
      const docId = await bookingService.submitBookingRequest(request);
      setSuccess(true);
      return docId;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to submit booking request'));
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const resetState = () => {
    setSuccess(false);
    setError(null);
  };

  return { submitEnquiry, submitting, success, error, resetState };
}
