"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader, Eye, EyeOff, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useAdminClaim } from "@/hooks/useAdminClaim";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { signIn, user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminClaim();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Check for admin mode from URL params
  useEffect(() => {
    const mode = searchParams?.get("mode");
    setIsAdminMode(mode === "admin");
  }, [searchParams]);

  // Handle redirect based on auth state and admin status
  useEffect(() => {
    if (!user) return; // Wait for user to be available
    if (adminLoading) return; // Wait for admin check to complete

    const next = searchParams?.get("next");
    
    // Check if user is admin and redirect accordingly
    if (isAdmin) {
      // Admin users should go to /admin by default, unless next is a non-admin route
      if (!next || next === "/admin" || next.startsWith("/admin")) {
        console.log('[LOGIN] Admin user, redirecting to /admin');
        router.replace("/admin");
        return;
      }
    } else {
      // Non-admin users should not access admin routes
      if (next && next.startsWith("/admin")) {
        console.log('[LOGIN] Non-admin user trying to access admin, redirecting to home');
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges. Redirecting to home...",
          variant: "destructive",
        });
        router.replace("/");
        return;
      }
    }
    
    // Normal redirect for non-admin destinations
    router.replace(next || "/");
  }, [user, adminLoading, isAdmin, router, searchParams, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      // Sign in with Firebase Auth
      await signIn(email, password);
      
      toast({
        title: "Login Successful!",
        description: "Welcome back!",
      });

      // Force token refresh immediately after successful login to get fresh admin claims
      if (user) {
        try {
          await user.getIdTokenResult(true); // Force refresh to get latest custom claims
          console.log('[LOGIN] Token refreshed after successful login');
        } catch (refreshError) {
          console.warn('[LOGIN] Token refresh failed, but login succeeded:', refreshError);
        }
      }

      // Let useEffect handle redirect based on admin status

    } catch (err) {
      let errorMessage = "Failed to sign in";
      if (err instanceof Error) {
        if (err.message.includes("user-not-found")) {
          errorMessage = "No account found with this email address.";
        } else if (err.message.includes("wrong-password")) {
          errorMessage = "Incorrect password. Please try again.";
        } else if (err.message.includes("too-many-requests")) {
          errorMessage = "Too many login attempts. Please try again later.";
        } else if (err.message.includes("invalid-email")) {
          errorMessage = "Invalid email address format";
        } else if (err.message.includes("invalid-credential")) {
          errorMessage = "Invalid email or password. Please try again.";
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredAuth={false}>
    {/* Login page is only accessible when NOT authenticated */}
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-slate-50 to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Floating brand badge */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full px-5 py-2.5 shadow-sm ring-1 ring-border">
            <span className="text-xl leading-none select-none">🧠</span>
            <span className="text-sm font-bold text-foreground tracking-tight">Open Trivia</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-none border border-border overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-2 text-center">
            <div className="flex justify-center mb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/30 shadow-sm ring-1 ring-violet-200/60 dark:ring-violet-700/40">
                <Shield size={26} strokeWidth={2} className="text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your account to continue
              {isAdminMode && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-violet-100 text-violet-700 ring-1 ring-inset ring-violet-200/60 dark:bg-violet-900/30 dark:text-violet-300 dark:ring-violet-700/40">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </span>
              )}
            </p>
          </div>

          {/* Form */}
          <div className="p-8 pt-6">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-11 rounded-xl bg-muted/30 border-border focus-visible:ring-violet-500/40 text-sm"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                  <Link
                    href="/reset-password"
                    className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline underline-offset-2"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    className="h-11 rounded-xl bg-muted/30 border-border focus-visible:ring-violet-500/40 text-sm pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/40 rounded-xl px-4 py-3 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-red-800 dark:text-red-200">Login Error</p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* Remember me */}
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-border text-violet-600 focus:ring-2 focus:ring-violet-500/40 focus:ring-offset-0"
                />
                <Label htmlFor="remember" className="text-sm font-medium text-muted-foreground cursor-pointer">
                  Keep me signed in
                </Label>
              </div>

              {/* Submit */}
              <Button 
                type="submit" 
                className="w-full h-11 text-sm font-semibold rounded-xl shadow-lg shadow-violet-500/20 dark:shadow-violet-900/30 bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/25"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            {/* Divider + Sign up */}
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-semibold hover:underline underline-offset-2">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          Secure login powered by Firebase Authentication
        </p>
      </div>
    </div>
    </ProtectedRoute>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-violet-50 via-slate-50 to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
        <div className="text-center">
          <Loader className="w-6 h-6 animate-spin mx-auto text-violet-500" />
          <p className="text-sm text-muted-foreground mt-3">Loading…</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
