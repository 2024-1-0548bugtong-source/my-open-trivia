"use client";

import { useAdminClaim } from "@/hooks/useAdminClaim";
import { Loader, Shield, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminLayoutShell from "@/components/AdminLayoutShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, loading, error } = useAdminClaim();
  const router = useRouter();

  // Handle redirects based on authentication and admin status
  useEffect(() => {
    if (!loading) {
      if (isAdmin === false) {
        // User is not admin (including unauthenticated users)
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login')) {
          const nextPath = "/admin";
          router.push(`/login?mode=admin&next=${encodeURIComponent(nextPath)}`);
        }
      }
      // If isAdmin is true, render admin content
      // If isAdmin is null, still loading - handled below
    }
  }, [isAdmin, loading, router]);

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // If not admin, show loading state while redirecting
  if (error || isAdmin === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Only render admin content if we're certain user is admin
  if (isAdmin === true) {
    return <AdminLayoutShell>{children}</AdminLayoutShell>;
  }

  // Fallback loading state
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
