"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader, Eye, EyeOff, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signUp } = useAuth();

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    setError(null);

    // Nickname validation
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      setError("Please enter a nickname");
      return false;
    }
    if (trimmedNickname.length < 2) {
      setError("Nickname must be at least 2 characters");
      return false;
    }
    if (trimmedNickname.length > 30) {
      setError("Nickname must be at most 30 characters");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Password validation
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Create user with Firebase Auth and set displayName
      await signUp(email, password, nickname.trim());
      
      setSuccess(true);
      toast({
        title: "Account Created!",
        description: `Welcome, ${nickname.trim()}! Redirecting to dashboard...`,
      });

      // Redirect to dashboard after successful signup
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      let errorMessage = "Failed to create account";
      if (err instanceof Error) {
        if (err.message.includes("email-already-in-use")) {
          errorMessage = "Email is already in use. Please use a different email or login.";
        } else if (err.message.includes("weak-password")) {
          errorMessage = "Password is too weak. Please use a stronger password.";
        } else if (err.message.includes("invalid-email")) {
          errorMessage = "Invalid email address format";
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
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/30 shadow-sm ring-1 ring-emerald-200/60 dark:ring-emerald-700/40">
                <User size={26} strokeWidth={2} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Create your account</h1>
            <p className="text-sm text-muted-foreground">Join Open Trivia and start playing today</p>
          </div>

          {/* Form */}
          <div className="p-8 pt-6">
            {success ? (
              <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/20 shadow-sm ring-1 ring-emerald-200/60 dark:ring-emerald-700/40">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Account Created!</h3>
                <p className="text-sm text-muted-foreground">Redirecting to dashboard…</p>
              </div>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Nickname */}
                <div className="space-y-2">
                  <Label htmlFor="nickname" className="text-sm font-medium text-foreground">Nickname</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                    <Input
                      id="nickname"
                      type="text"
                      placeholder="Your display name"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      disabled={isLoading}
                      required
                      minLength={2}
                      maxLength={30}
                      className="h-11 rounded-xl bg-muted/30 border-border focus-visible:ring-violet-500/40 text-sm pl-10"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground/60">2-30 characters — shown on the leaderboard</p>
                </div>

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
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium text-foreground">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      className="h-11 rounded-xl bg-muted/30 border-border focus-visible:ring-violet-500/40 text-sm pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/40 rounded-xl px-4 py-3 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                {/* Password tips */}
                <div className="bg-violet-50/60 dark:bg-violet-950/15 border border-violet-200/40 dark:border-violet-800/30 rounded-xl px-4 py-3">
                  <p className="text-[11px] font-semibold text-violet-800 dark:text-violet-300 mb-1.5">Password tips</p>
                  <ul className="text-[11px] text-violet-700/80 dark:text-violet-400/70 space-y-0.5">
                    <li>• At least 6 characters</li>
                    <li>• Mix letters, numbers & symbols for strength</li>
                  </ul>
                </div>

                {/* Submit */}
                <Button 
                  type="submit" 
                  className="w-full h-11 text-sm font-semibold rounded-xl shadow-lg shadow-violet-500/20 dark:shadow-violet-900/30 bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/25"
                  disabled={isLoading} 
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
            )}

            {/* Divider + Login */}
            {!success && (
              <div className="mt-8 pt-6 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-semibold hover:underline underline-offset-2">
                    Sign in
                  </Link>
                </p>
              </div>
            )}
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
