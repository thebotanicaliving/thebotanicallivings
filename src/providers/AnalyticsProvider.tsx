import { ReactNode, useEffect } from 'react';

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Analytics is initialized silently
  }, []);
  return <>{children}</>;}

export default AnalyticsProvider;
