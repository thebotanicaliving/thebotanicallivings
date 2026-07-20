import { useState, useEffect, useCallback } from 'react';
import { homepageService, HomepageConfig, defaultHomepageConfig } from '@/services/homepage.service';

export function useHomepage() {
  const [config, setConfig] = useState<HomepageConfig>(defaultHomepageConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = homepageService.subscribeHomepageConfig((data) => {
      setConfig(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateConfig = async (updates: Partial<HomepageConfig>) => {
    try {
      setLoading(true);
      await homepageService.updateHomepageConfig(updates);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { config, loading, error, refresh: () => {}, updateConfig };
}
