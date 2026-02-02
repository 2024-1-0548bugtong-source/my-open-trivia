"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader, ArrowLeft } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      // Send password reset email
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      let errorMessage = "Failed to send reset email";
      if (err instanceof Error) {
        if (err.message.includes("user-not-found")) {
          // Don't reveal if account exists or not for security
          errorMessage = "If an account exists with this email, you will receive a reset link.";
          setSuccess(true);
          return;
        } else if (err.message.includes("invalid-email")) {
          errorMessage = "Invalid email address format";
        } else if (err.message.includes("too-many-requests")) {
          errorMessage = "Too many reset attempts. Please try again later.";
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl">Reset Password</CardTitle>
          <CardDescription>
            {success
              ? "Check your email for reset instructions"
              : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6 flex flex-col items-center gap-4 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Reset Email Sent!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    If an account exists with <strong>{email}</strong>, you will receive a password reset link
                    in your inbox. Please check your email (including spam folder) within a few minutes.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Didn't receive the email?</strong>
                  <ul className="mt-2 space-y-1">
                    <li>• Check your spam or junk folder</li>
                    <li>• Make sure you entered the correct email</li>
                    <li>• Try again after a few minutes</li>
                  </ul>
                </p>
              </div>

              <Link href="/login">
                <Button variant="outline" className="w-full" size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
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

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Password Reset Instructions:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>1. Enter your email address</li>
                    <li>2. We'll send you a reset link</li>
                    <li>3. Click the link and set a new password</li>
                    <li>4. Login with your new password</li>
                  </ul>
                </p>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              {/* Back to Login Link */}
              <p className="text-center text-sm">
                <Link href="/login" className="text-primary hover:underline font-semibold">
                  Back to Login
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
