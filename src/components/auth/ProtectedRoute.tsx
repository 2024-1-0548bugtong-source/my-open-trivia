"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredAuth?: boolean; // If true, user must be logged in
}

export function ProtectedRoute({ children, requiredAuth = true }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (requiredAuth && !isAuthenticated) {
        // User must be logged in but isn't
        router.push("/login");
      } else if (!requiredAuth && isAuthenticated) {
        // User must NOT be logged in but is (e.g., login page)
        router.push("/");
      }
    }
  }, [isAuthenticated, loading, requiredAuth, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If requiredAuth is true, user must be authenticated to see content
  if (requiredAuth && !isAuthenticated) {
    return null;
  }

  // If requiredAuth is false, user must NOT be authenticated
  if (!requiredAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
export default ProtectedRoute;