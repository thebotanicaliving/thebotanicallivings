import { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { FirebaseProvider } from './FirebaseProvider';
import { AuthProvider } from './AuthProvider';
import { ToastProvider } from './ToastProvider';
import { MotionProvider } from './MotionProvider';
import { AnalyticsProvider } from './AnalyticsProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <FirebaseProvider>
        <AuthProvider>
          <QueryProvider>
            <ToastProvider>
              <MotionProvider>
                <AnalyticsProvider>
                  {children}
                </AnalyticsProvider>
              </MotionProvider>
            </ToastProvider>
          </QueryProvider>
        </AuthProvider>
      </FirebaseProvider>
    </ThemeProvider>
  );
}

export default Providers;
