import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/firebase/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setInitialized(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setInitialized(true);
    }, (error) => {
      console.error('Firebase Auth State Change Error:', error);
      setLoading(false);
      setInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, loading, initialized }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
export default FirebaseProvider;
