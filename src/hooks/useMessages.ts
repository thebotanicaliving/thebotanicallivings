import { useState, useEffect, useCallback } from 'react';
import { contactService } from '@/services/contact.service';
import { ContactRequest } from '@/types';

export function useMessages() {
  const [messages, setMessages] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await contactService.getContactRequests();
      setMessages(data);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return { messages, loading, error, refresh: fetchMessages };
}
