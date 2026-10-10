import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile } from '../types';

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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<UserProfile | null> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    const user = cred.user;
    if (!user) return null;

    const userRef = doc(db, 'users', user.uid);
    let existingData: Partial<UserProfile> = {};

    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        existingData = snap.data() as UserProfile;
      }
    } catch {
      // first time or network fallback
    }

    const profile: UserProfile = {
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'Learner',
      photoURL: user.photoURL || undefined,
      coins: existingData.coins ?? 120, // bonus starting coins
      streak: existingData.streak ?? 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      equippedOutfit: existingData.equippedOutfit || 'outfit_default',
      unlockedOutfits: existingData.unlockedOutfits || ['outfit_default'],
      createdAt: existingData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(userRef, profile, { merge: true });
    } catch (e) {
      console.warn('Could not sync user to Firestore:', e);
    }

    return profile;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

export async function logoutUser() {
  await fbSignOut(auth);
}
