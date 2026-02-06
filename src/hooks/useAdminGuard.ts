import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/firebase";

export function useAdminGuard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (authLoading) return;

      // Not logged in - redirect to login
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        // Get ID token result to check custom claims
        const tokenResult = await user.getIdTokenResult(true);
        const hasAdminRole = tokenResult.claims.role === "admin";
        
        setIsAdmin(hasAdminRole);
        
        if (!hasAdminRole) {
          // Logged in but not admin - redirect to home
          router.push("/");
          setError("Access denied. Admin role required.");
        }
      } catch (err) {
        console.error("Error checking admin role:", err);
        setError("Failed to verify admin access");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [user, authLoading, router]);

  return { isAdmin, loading, error };
}
