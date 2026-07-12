import { useState, useEffect, useCallback } from 'react';
import { settingsService, BusinessSettings, defaultSettings } from '@/services/settings.service';

export function useSettings() {
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (updates: Partial<BusinessSettings>) => {
    try {
      setLoading(true);
      await settingsService.updateSettings(updates);
      await fetchSettings();
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  return { settings, loading, error, refresh: fetchSettings, updateSettings };
}
