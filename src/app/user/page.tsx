"use client";

import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UserProfile from "@/components/user/UserProfile";
import MyScores from "@/components/user/MyScores";
import Leaderboard from "@/components/Leaderboard";
import { User as UserIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function UserPage() {
  const { getDisplayName } = useAuth();
  const displayName = getDisplayName();
  
  return (
    <ProtectedRoute>
    {/* User profile requires authentication */}
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
      {/* PRIMARY: Page Header - Clear focal point */}
      <div className="mb-6 sm:mb-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10">
            <UserIcon size={24} strokeWidth={2} className="text-primary" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              My Profile
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              Welcome back, <span className="font-semibold text-foreground">{displayName}</span>
            </p>
          </div>
        </div>
        <Separator className="mt-4" />
      </div>

      {/* SECONDARY: Content Grid - Clear sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* PRIMARY CONTENT: Profile Settings + My Scores */}
        <div className="lg:col-span-2 space-y-6 order-1">
          <UserProfile />
          <MyScores />
        </div>

        {/* TERTIARY: Leaderboard Sidebar - Supporting info */}
        <div className="lg:col-span-1 order-2">
          <div className="lg:sticky lg:top-6">
            <Leaderboard compact={true} />
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
