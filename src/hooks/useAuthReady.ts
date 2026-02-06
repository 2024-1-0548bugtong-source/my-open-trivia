"use client";

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/firebase';

interface AuthReadyState {
  user: User | null;
  loading: boolean;
  settled: boolean; // true when auth state is fully resolved
}

/**
 * Single, canonical auth readiness hook that uses onAuthStateChanged
 * Only transitions to loading=false once auth is settled
 * No redirects are allowed while loading=true
 */
export function useAuthReady(): AuthReadyState {
  const [state, setState] = useState<AuthReadyState>({
    user: null,
    loading: true,
    settled: false,
  });

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('[AUTH-READY] Auth state changed:', { 
        user: user ? user.uid : null, 
        email: user?.email || 'none' 
      });
      
      setState({
        user,
        loading: false,
        settled: true,
      });
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return state;
}
