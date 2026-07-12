import { useState, useEffect, useCallback } from 'react';
import { Room } from '@/types';
import { roomService } from '@/services/room.service';

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await roomService.getRooms();
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch rooms'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return { rooms, loading, error, refresh: fetchRooms };
}
