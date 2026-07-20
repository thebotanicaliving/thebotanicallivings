import { useState, useEffect } from 'react';
import { RoomAvailability } from '@/types';
import { roomService } from '@/services/room.service';

export function useAvailability(roomId: string | undefined) {
  const [availability, setAvailability] = useState<RoomAvailability | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = roomService.subscribeAvailability(roomId, (data) => {
      setAvailability(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  return { availability, loading, error };
}
