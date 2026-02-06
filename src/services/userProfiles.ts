import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth } from '@/firebase';
import { db } from '@/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: any; // Firestore Timestamp
  lastLoginAt: any; // Firestore Timestamp
  role?: 'user' | 'admin'; // For role-based access
}

/**
 * Create or update user profile document in Firestore
 * This should be called on signup and login
 */
export async function upsertUserProfile(userData: Partial<UserProfile>): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No authenticated user found');
  }

  const userProfile: UserProfile = {
    uid: currentUser.uid,
    email: currentUser.email || '',
    displayName: userData.displayName || currentUser.displayName || 'Anonymous',
    createdAt: userData.createdAt || serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    role: userData.role || 'user',
    ...userData,
  };

  try {
    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, userProfile, { merge: true });
    
    console.log('[USER-PROFILE] Upserted profile for user:', {
      uid: userProfile.uid,
      email: userProfile.email,
      displayName: userProfile.displayName,
      lastLoginAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[USER-PROFILE] Failed to upsert profile:', error);
    throw error;
  }
}

/**
 * Get user profile by UID
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('[USER-PROFILE] Failed to get profile:', error);
    throw error;
  }
}

/**
 * Update user's last login time
 */
export async function updateLastLogin(): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No authenticated user found');
  }

  try {
    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, {
      lastLoginAt: serverTimestamp()
    }, { merge: true });
    
    console.log('[USER-PROFILE] Updated last login for user:', currentUser.uid);
  } catch (error) {
    console.error('[USER-PROFILE] Failed to update last login:', error);
    // Don't throw error for last login update to avoid blocking login flow
  }
}
