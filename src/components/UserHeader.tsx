"use client";

import { useRouter } from "next/navigation";
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { LogOut, User, Loader, Sun, Moon, Settings } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function UserHeader() {
  const router = useRouter();
  const { user, logout, getDisplayName } = useAuth();
  const { theme, setTheme } = useTheme();
  const displayName = getDisplayName();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Logout from Firebase Auth (also clears old localStorage)
      await logout();
      // Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  // Show header if Firebase user is authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center justify-between w-full px-2">
      <div className="flex items-center gap-2">
        <User size={16} strokeWidth={2} className="text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          Playing as: <span className="font-semibold text-primary">{displayName}</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <Sun size={18} strokeWidth={2} />
          ) : (
            <Moon size={18} strokeWidth={2} />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <User size={16} strokeWidth={2} />
              <span className="hidden sm:inline">Account</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem disabled className="flex-col items-start">
              <div className="text-xs text-muted-foreground">Logged in as</div>
              <div className="font-semibold">{user.email}</div>
              <div className="text-xs text-muted-foreground">Display name: {displayName}</div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push("/user")}>
              <User size={16} strokeWidth={2} className="mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/preferences")}>
              <Settings size={16} strokeWidth={2} className="mr-2" />
              Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout} 
              disabled={isLoggingOut}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
            >
              {isLoggingOut ? (
                <>
                  <Loader size={16} strokeWidth={2} className="mr-2 animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut size={16} strokeWidth={2} className="mr-2" />
                  Logout
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
