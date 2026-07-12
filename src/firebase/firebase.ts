import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { env } from '@/config/env';

// Read Firebase config from environment variables
const getFirebaseConfig = () => {
  const metaEnv = (import.meta as any).env || {};
  const getTrimmed = (key: string) => {
    const val = metaEnv[key];
    return typeof val === 'string' ? val.trim() : '';
  };
  return {
    apiKey: getTrimmed('NEXT_PUBLIC_FIREBASE_API_KEY') || getTrimmed('VITE_FIREBASE_API_KEY'),
    authDomain: getTrimmed('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN') || getTrimmed('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getTrimmed('NEXT_PUBLIC_FIREBASE_PROJECT_ID') || getTrimmed('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: getTrimmed('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET') || getTrimmed('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getTrimmed('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID') || getTrimmed('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getTrimmed('NEXT_PUBLIC_FIREBASE_APP_ID') || getTrimmed('VITE_FIREBASE_APP_ID'),
    measurementId: getTrimmed('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID') || getTrimmed('VITE_FIREBASE_MEASUREMENT_ID'),
  };
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

const firebaseConfig = getFirebaseConfig();

if (firebaseConfig.apiKey) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error('Firebase initialization error.', error);
  }
} else {
  console.log('Firebase configuration is not present. Operating in fallback mode.');
}

export { app, auth, db, storage };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default app;
