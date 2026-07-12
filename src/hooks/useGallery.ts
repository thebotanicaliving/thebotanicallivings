import { useState, useEffect, useCallback } from 'react';
import { GalleryItem } from '@/types';
import { galleryService } from '@/services/gallery.service';

export function useGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await galleryService.getGalleryItems();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch gallery items'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  return { gallery: items, loading, error, refresh: fetchGallery };
}
