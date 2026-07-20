import { useState, useEffect, useCallback } from 'react';
import { FAQItem } from '@/types';
import { faqService } from '@/services/faq.service';

export function useFAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = faqService.subscribeFAQ((data) => {
      setFaqs(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { faqs, loading, error, refresh: () => {} };
}
