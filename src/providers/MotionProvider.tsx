import { ReactNode } from 'react';

export function MotionProvider({ children }: { children: ReactNode }) {
  // Simple provider for future lazy-loaded layout configuration
  return <>{children}</>;
}
