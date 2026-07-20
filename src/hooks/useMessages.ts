import { useState, useEffect } from 'react';
import { contactService } from '@/services/contact.service';
import { ContactRequest } from '@/types';

export function useMessages() {
  const [messages, setMessages] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = contactService.subscribeContactRequests((data) => {
      setMessages(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { messages, loading, error };
}
