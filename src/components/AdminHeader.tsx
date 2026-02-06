"use client";

import { useRouter } from "next/navigation";
import { useAuth } from '@/context/AuthContext';
import { useAdminClaim } from '@/hooks/useAdminClaim';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, Loader } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isAdmin, loading } = useAdminClaim();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  // Don't render if not authenticated or still checking admin status
  if (!user || loading) {
    return (
      <div className="flex items-center justify-between w-full px-2">
        <div className="flex items-center gap-2">
          <Loader className="w-4 h-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Verifying admin access...</span>
        </div>
      </div>
    );
  }

  // Don't render if not admin
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-semibold text-foreground">Admin Dashboard</span>
        <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-violet-100 text-violet-700 ring-1 ring-inset ring-violet-200/60 dark:bg-violet-900/30 dark:text-violet-300 dark:ring-violet-700/40">
          Admin
        </span>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground rounded-lg h-8">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted">
                <Shield size={12} strokeWidth={2.5} className="text-muted-foreground" />
              </div>
              <span className="hidden sm:inline text-xs font-medium">Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuItem disabled className="flex-col items-start py-2.5">
              <div className="text-[11px] text-muted-foreground">Signed in as</div>
              <div className="text-sm font-semibold text-foreground">{user.email}</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">✓ Admin verified</div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout} disabled={isLoggingOut} className="text-sm">
              <LogOut size={14} strokeWidth={2} className="mr-2" />
              {isLoggingOut ? "Signing out…" : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
