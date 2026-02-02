"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    {/* Signup page is only accessible when NOT authenticated */}
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl">Create Account</CardTitle>
          <CardDescription>Join Open Trivia and start playing today</CardDescription>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="space-y-4 text-center">
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex flex-col items-center gap-3">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">Account Created Successfully!</p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Redirecting to dashboard...
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Nickname Field */}
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="nickname"
                    type="text"
                    placeholder="Your display name (2-30 characters)"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    disabled={isLoading}
                    required
                    minLength={2}
                    maxLength={30}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This will be your display name across the app
                </p>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* Password Requirements */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">Password Requirements:</p>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• At least 6 characters long</li>
                  <li>• Mix of uppercase and lowercase letters (recommended)</li>
                  <li>• Include numbers or special characters (recommended)</li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              {/* Login Link */}
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-semibold">
                  Login
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  );
}
