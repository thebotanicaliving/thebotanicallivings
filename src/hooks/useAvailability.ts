import { useState, useEffect, useCallback } from 'react';
import { RoomAvailability } from '@/types';
import { roomService } from '@/services/room.service';

export function useAvailability(roomId: string | undefined) {
  const [availability, setAvailability] = useState<RoomAvailability | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAvailability = useCallback(async () => {
    if (!roomId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await roomService.getRoomAvailability(roomId);
      setAvailability(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch availability for ${roomId}`));
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  return { availability, loading, error, retry: fetchAvailability };
}
