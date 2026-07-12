import { useState, useEffect, useCallback } from 'react';
import { HotelConfig } from '@/types';
import { hotelService } from '@/services/hotel.service';

export function useHotel() {
  const [config, setConfig] = useState<HotelConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hotelService.getHotelConfig();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch hotel config'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { config, loading, error, retry: fetchConfig };
}
