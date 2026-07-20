import { useState, useEffect, useCallback } from 'react';
import { HotelConfig } from '@/types';
import { hotelService } from '@/services/hotel.service';

export function useHotel() {
  const [config, setConfig] = useState<HotelConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = hotelService.subscribeHotelConfig((data) => {
      setConfig(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { config, loading, error };
}
