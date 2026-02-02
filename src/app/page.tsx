"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        // User is logged in, stay on dashboard (this page renders Dashboard)
        // Do nothing - let Dashboard render
      } else {
        // User is not logged in, redirect to login
        router.push("/login");
      }
    }
  }, [isAuthenticated, loading, router]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show nothing while redirecting unauthenticated users
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated - lazy load Dashboard to avoid importing on redirect
  const Dashboard = require("@/pages/Dashboard").default;
  return <Dashboard />;
}
