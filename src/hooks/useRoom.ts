import { useState, useEffect, useCallback } from 'react';
import { Room } from '@/types';
import { roomService } from '@/services/room.service';

export function useRoom(slug: string | undefined) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRoom = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await roomService.getRoomBySlug(slug);
      setRoom(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch room: ${slug}`));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  return { room, loading, error, retry: fetchRoom };
}
