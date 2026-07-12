import { useState, useEffect, useCallback } from 'react';
import { homepageService, HomepageConfig, defaultHomepageConfig } from '@/services/homepage.service';

export function useHomepage() {
  const [config, setConfig] = useState<HomepageConfig>(defaultHomepageConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const data = await homepageService.getHomepageConfig();
      setConfig(data);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = async (updates: Partial<HomepageConfig>) => {
    try {
      setLoading(true);
      await homepageService.updateHomepageConfig(updates);
      await fetchConfig();
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  return { config, loading, error, refresh: fetchConfig, updateConfig };
}
