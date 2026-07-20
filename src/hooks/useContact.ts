import { useState } from 'react';
import { ContactRequest } from '@/types';
import { contactService } from '@/services/contact.service';

export function useContact() {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const submitContact = async (request: Omit<ContactRequest, 'status' | 'createdAt'>): Promise<string | null> => {
    setSubmitting(true);
    setSuccess(false);
    setError(null);
    try {
      const docId = await contactService.submitContactRequest(request);
      setSuccess(true);
      return docId;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to submit contact enquiry'));
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const resetState = () => {
    setSuccess(false);
    setError(null);
  };

  return { submitContact, submitting, success, error, resetState };
}
