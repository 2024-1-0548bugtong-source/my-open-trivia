/**
 * Admin Claim Hook
 * Checks if the current user has admin custom claims
 * Uses Firebase getIdTokenResult() to verify role (cached tokens only)
 */

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

export function useAdminClaim() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate execution in React Strict Mode
    if (hasCheckedRef.current) return;
    
    const checkAdminClaim = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get ID token result to check custom claims (use cached token, no forced refresh)
        const tokenResult = await user.getIdTokenResult();
        const hasAdminRole = tokenResult.claims.admin === true; // Use admin:true consistently

        setIsAdmin(hasAdminRole);
        hasCheckedRef.current = true;
      } catch (err) {
        console.error("Error checking admin claims:", err);
        setError("Failed to verify admin access");
        setIsAdmin(false);
        hasCheckedRef.current = true;
      } finally {
        setLoading(false);
      }
    };

    checkAdminClaim();
  }, [user]);

  return { isAdmin, loading, error };
}

/**
 * Helper function to check admin claims outside of React components
 * Uses cached tokens only - no forced refresh
 */
export async function checkAdminClaim(user: any): Promise<boolean> {
  if (!user) return false;

  try {
    const tokenResult = await user.getIdTokenResult(); // Use cached token
    return tokenResult.claims.admin === true; // Use admin:true consistently
  } catch (error) {
    console.error("Error checking admin claims:", error);
    return false;
  }
}
