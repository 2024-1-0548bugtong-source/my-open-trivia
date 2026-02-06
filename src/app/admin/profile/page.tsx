"use client";

import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UserProfile from "@/components/user/UserProfile";
import { Settings, User as UserIcon } from "lucide-react";
import { useMemo, useEffect, useState } from "react";

export default function AdminProfilePage() {
  const { getDisplayName } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by setting display name only on client
  useEffect(() => {
    setDisplayName(getDisplayName());
    setIsMounted(true);
  }, [getDisplayName]);

  // Conditional rendering content - hooks are already declared above
  const renderContent = () => {
    if (!isMounted) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          {/* Compact Admin Profile Header */}
          <div className="mb-8">
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8 relative overflow-hidden">
              <div className="relative z-10 flex items-center gap-6">
                {/* Avatar */}
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-background border border-border shadow-sm">
                  <UserIcon size={28} strokeWidth={2} className="text-primary" />
                </div>
                
                {/* Welcome Message */}
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Admin Profile
                  </h1>
                  <p className="text-muted-foreground">
                    Manage your admin account settings and preferences.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="mb-8">
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-primary/10 rounded-xl p-3">
                  <Settings className="text-primary" size={24} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Account Information</h2>
                  <p className="text-muted-foreground mt-1">Manage your profile settings and security preferences</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <UserProfile />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      {renderContent()}
    </ProtectedRoute>
  );
}
