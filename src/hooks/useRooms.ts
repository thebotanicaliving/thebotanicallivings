import { useState, useEffect } from 'react';
import { Room } from '@/types';
import { roomService } from '@/services/room.service';

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = roomService.subscribeRooms((data) => {
      setRooms(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { rooms, loading, error };
}
