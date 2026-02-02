"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldX, User, Mail, LogOut, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * DEV-ONLY Authentication Test Panel
 * Shows current auth state and provides quick testing actions
 * Only renders in development environment
 */
export default function AuthDevPanel() {
  const { user: firebaseUser, isAuthenticated, loading, logout, getDisplayName } = useAuth();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {!isExpanded ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsExpanded(true)}
          className="shadow-lg bg-background/95 backdrop-blur border-2"
          title="Show auth dev panel"
        >
          <ShieldCheck size={16} className="mr-2" />
          Auth: {loading ? "..." : isAuthenticated ? "✓" : "✗"}
        </Button>
      ) : (
        <Card className="shadow-xl bg-background/95 backdrop-blur border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldCheck size={16} />
                Auth Dev Panel
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0"
              >
                ✕
              </Button>
            </div>
            <CardDescription className="text-xs">
              Development testing only
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {/* Auth Status */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Firebase Auth:</span>
              <Badge variant={isAuthenticated ? "default" : "secondary"} className="text-xs">
                {loading ? (
                  <RefreshCw size={12} className="mr-1 animate-spin" />
                ) : isAuthenticated ? (
                  <ShieldCheck size={12} className="mr-1" />
                ) : (
                  <ShieldX size={12} className="mr-1" />
                )}
                {loading ? "Loading" : isAuthenticated ? "Authenticated" : "Not Authenticated"}
              </Badge>
            </div>

            {/* User Email */}
            {firebaseUser && (
              <div className="flex items-start gap-2 py-2 px-3 bg-muted/50 rounded-md">
                <Mail size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                <div className="overflow-hidden">
                  <div className="text-xs font-medium truncate">
                    {firebaseUser.email}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    UID: {firebaseUser.uid.substring(0, 8)}...
                  </div>
                </div>
              </div>
            )}

            {/* Display Name */}
            {firebaseUser && (
              <div className="flex items-center gap-2 py-2 px-3 bg-muted/50 rounded-md">
                <User size={14} className="shrink-0 text-muted-foreground" />
                <div className="text-xs">
                  <span className="text-muted-foreground">Display Name: </span>
                  <span className="font-medium">{getDisplayName()}</span>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-col gap-2 pt-2 border-t">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="text-xs h-8"
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push("/signup")}
                  className="text-xs h-8"
                >
                  Sign Up
                </Button>
              </div>
              {isAuthenticated && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleLogout}
                  className="text-xs h-8"
                >
                  <LogOut size={14} className="mr-1" />
                  Logout
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => router.push("/user")}
                className="text-xs h-8"
              >
                <User size={14} className="mr-1" />
                Profile (Protected)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
