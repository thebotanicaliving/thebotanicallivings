import { useState, useEffect, useCallback } from 'react';
import { FAQItem } from '@/types';
import { faqService } from '@/services/faq.service';

export function useFAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFAQ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await faqService.getFAQItems();
      setFaqs(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch FAQ items'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFAQ();
  }, [fetchFAQ]);

  return { faqs, loading, error, refresh: fetchFAQ };
}
