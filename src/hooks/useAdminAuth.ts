"use client";

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useAuthReady } from './useAuthReady';

interface AdminAuthState {
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to verify admin claim using cached token decoding
 * Uses the admin:true custom claim consistently
 * Prevents duplicate execution with ref guard
 */
export function useAdminAuth(): AdminAuthState {
  const { user, loading: authLoading, settled } = useAuthReady();
  const [state, setState] = useState<AdminAuthState>({
    isAdmin: false,
    loading: true,
    error: null,
  });
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Reset state when auth state changes
    if (authLoading || !settled) {
      setState({
        isAdmin: false,
        loading: true,
        error: null,
      });
      setHasChecked(false);
      return;
    }

    // Prevent duplicate execution
    if (hasChecked) return;

    // No user - not admin
    if (!user) {
      setState({
        isAdmin: false,
        loading: false,
        error: null,
      });
      setHasChecked(true);
      return;
    }

    // User exists - verify admin claim using cached token
    const verifyAdminClaim = async () => {
      try {
        console.log('[ADMIN-AUTH] Verifying admin claim for user:', user.uid);
        
        // Get ID token result to check custom claims (use cached token, no forced refresh)
        const tokenResult = await user.getIdTokenResult();
        const hasAdminRole = tokenResult.claims.admin === true; // Use admin:true consistently

        if (process.env.NODE_ENV === 'development') {
          console.log('[ADMIN-AUTH] Token claims:', tokenResult.claims);
          console.log('[ADMIN-AUTH] Admin role check:', hasAdminRole);
        }
        
        const isAdmin = hasAdminRole;
        
        console.log('[ADMIN-AUTH] Admin claim verified:', { 
          uid: user.uid, 
          admin: isAdmin,
          hasAdminClaim: 'admin' in tokenResult.claims
        });
        
        setState({
          isAdmin,
          loading: false,
          error: null,
        });
        setHasChecked(true);
      } catch (error) {
        console.error('[ADMIN-AUTH] Error verifying admin claim:', error);
        setState({
          isAdmin: false,
          loading: false,
          error: 'Failed to verify admin access',
        });
        setHasChecked(true);
      }
    };

    verifyAdminClaim();
  }, [user, authLoading, settled, hasChecked]);

  return state;
}
