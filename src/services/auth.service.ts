import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/firebase/firebase';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    if (!auth) throw new Error('Firebase Auth not initialized');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  async logout(): Promise<void> {
    if (!auth) throw new Error('Firebase Auth not initialized');
    await signOut(auth);
  },

  subscribeToAuthChanges(callback: (user: User | null) => void) {
    if (!auth) return () => {};
    return onAuthStateChanged(auth, callback);
  }
};
