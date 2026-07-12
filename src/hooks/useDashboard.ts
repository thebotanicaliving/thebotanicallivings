import { useState, useEffect, useCallback } from 'react';
import { dashboardService, DashboardStats, RecentActivity } from '@/services/dashboard.service';

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, recentData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivity()
      ]);
      setStats(statsData);
      setRecent(recentData);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, recent, loading, error, refresh: fetchData };
}
