import { useState, useEffect, useCallback } from 'react';
import { GalleryItem } from '@/types';
import { galleryService } from '@/services/gallery.service';

export function useGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = galleryService.subscribeGallery((data) => {
      setItems(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { gallery: items, loading, error, refresh: () => {} };
}
