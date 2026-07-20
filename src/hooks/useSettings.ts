import { useState, useEffect, useCallback } from 'react';
import { settingsService, BusinessSettings, defaultSettings } from '@/services/settings.service';

export function useSettings() {
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = settingsService.subscribeSettings((data) => {
      setSettings(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateSettings = async (updates: Partial<BusinessSettings>) => {
    try {
      setLoading(true);
      await settingsService.updateSettings(updates);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, error, refresh: () => {}, updateSettings };
}
