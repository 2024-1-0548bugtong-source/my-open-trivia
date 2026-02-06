"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth } from "@/firebase";
import { upsertUserProfile, updateLastLogin } from "@/services/userProfiles";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nickname: string) => Promise<void>;
  getDisplayName: () => string;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // Create/update user profile when user logs in
      if (currentUser) {
        try {
          await upsertUserProfile({
            displayName: currentUser.displayName || 'Anonymous',
            email: currentUser.email || '',
          });
          
          // Update last login time
          await updateLastLogin();
        } catch (error) {
          console.error('[AUTH] Failed to upsert user profile:', error);
          // Don't block login flow if profile creation fails
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, nickname: string) => {
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Set displayName immediately after account creation
      await updateProfile(userCredential.user, {
        displayName: nickname.trim()
      });
      
      // Force refresh to get updated user object with displayName
      await userCredential.user.reload();
      
      // Create user profile document
      await upsertUserProfile({
        displayName: nickname.trim(),
        email: email,
        createdAt: new Date(), // Will be converted to serverTimestamp
      });
      
      // Manually trigger state update to reflect displayName immediately
      setUser(auth.currentUser);
    } catch (error) {
      console.error("Sign up failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear old localStorage nickname from legacy system
      if (typeof window !== 'undefined') {
        localStorage.removeItem('my-open-trivia.nickname');
      }
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const getDisplayName = (): string => {
    if (!user) return "Guest";
    // Use displayName (nickname) only - never show email for privacy
    return user.displayName?.trim() || "Player";
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser(auth.currentUser);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
    signIn,
    signUp,
    getDisplayName,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
