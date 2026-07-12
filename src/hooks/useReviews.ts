import { useState, useEffect, useCallback } from 'react';
import { ReviewItem } from '@/types';
import { reviewsService } from '@/services/reviews.service';

export function useReviews() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reviewsService.getReviews();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch reviews'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews: items, loading, error, refresh: fetchReviews };
}
