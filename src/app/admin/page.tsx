"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Shield, Trophy, Home, Users, Settings, Loader, RefreshCw, LogIn, AlertTriangle, Activity, Zap, TrendingUp, ArrowRight } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAuthReady } from "@/hooks/useAuthReady";
import { cn } from "@/lib/utils";

interface AdminMetrics {
  totalUsers: number;
  totalGames: number;
  avgScore: number;
  avgAccuracy: number;
  todayGames: number;
  recentActivity: any[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isAdmin, loading: adminLoading, error: adminError } = useAdminAuth();
  const { user } = useAuthReady();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch metrics only after admin is verified
  const fetchMetrics = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      console.log('[ADMIN-DASHBOARD] Starting fetchMetrics, user:', user ? user.uid : 'null');
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get ID token (no forced refresh)
      const token = await user.getIdToken();
      
      // Decode JWT payload to check aud/iss (safe - no secrets exposed)
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('[ADMIN-DASHBOARD] Token payload:', {
        aud: payload.aud,
        iss: payload.iss,
        uid: payload.uid
      });
      
      console.log('[ADMIN-DASHBOARD] Token acquired, length:', token.length);
      console.log('[ADMIN-DASHBOARD] Token preview:', token.substring(0, 20) + '...');
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[ADMIN-DASHBOARD] Fetching metrics with token length:', token.length);
      }

      // Send Authorization header with Bearer token
      const response = await fetch('/api/admin/metrics', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('[ADMIN-DASHBOARD] Response status:', response.status);
      }

      // Always try to parse JSON
      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('[ADMIN-DASHBOARD] Failed to parse JSON response:', parseError);
        throw new Error(`Invalid response from server (${response.status})`);
      }

      if (!response.ok) {
        // Handle specific error cases - NO RETRY LOOPS
        if (response.status === 401) {
          // Token is invalid - show unauthorized state, don't redirect
          throw new Error('Unauthorized - Please log in again');
        }
        
        if (response.status === 403) {
          throw new Error('Admin access required. Make sure you have admin role set.');
        }
        
        // For other errors, use structured error message
        const errorMessage = responseData?.error || responseData?.message || `Failed to fetch metrics (${response.status})`;
        
        // Log full response for debugging
        if (process.env.NODE_ENV === 'development') {
          console.error('[ADMIN-DASHBOARD] API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            data: responseData
          });
        }
        
        throw new Error(errorMessage);
      }

      // Success case
      if (responseData?.success && responseData?.data) {
        setMetrics(responseData.data);
      } else {
        // Handle malformed success response
        console.error('[ADMIN-DASHBOARD] Malformed success response:', responseData);
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('[ADMIN-DASHBOARD] Failed to fetch metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle auth states and admin verification
  useEffect(() => {
    if (adminLoading) {
      // Still loading auth state - show stable loading UI
      return;
    }

    if (adminError) {
      // Auth error - show error state
      setError(adminError);
      setLoading(false);
      return;
    }

    if (!isAdmin) {
      // Not admin - show 403 UI, don't redirect
      setError('Admin access required. You do not have permission to access this page.');
      setLoading(false);
      return;
    }

    // Admin verified - fetch metrics
    fetchMetrics();
  }, [isAdmin, adminLoading, adminError, router]);

  // Loading state
  if (adminLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader className="w-6 h-6 animate-spin mx-auto mb-3 text-violet-500" />
          <p className="text-sm text-muted-foreground">Verifying admin access…</p>
        </div>
      </div>
    );
  }

  // Admin access denied
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-full max-w-sm text-center">
          <div className="flex justify-center mb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/20 shadow-sm ring-1 ring-red-200/60 dark:ring-red-700/40">
              <Shield className="w-6 h-6 text-red-600 dark:text-red-400" strokeWidth={2} />
            </div>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-1">Admin Access Required</h1>
          <p className="text-sm text-muted-foreground mb-6">
            You don’t have permission to access the admin dashboard.
          </p>
          <div className="space-y-2">
            <Button onClick={() => router.push('/')} className="w-full rounded-xl">Go to Home</Button>
            <Button variant="outline" onClick={() => router.push('/login?next=/admin')} className="w-full rounded-xl">Try Different Account</Button>
          </div>
        </div>
      </div>
    );
  }

  const adminSections = [
    {
      title: "Leaderboard",
      description: "View top scores and rankings",
      href: "/admin/leaderboard",
      icon: Trophy,
      gradient: "from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/20",
      ring: "ring-amber-200/60 dark:ring-amber-700/40",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Statistics",
      description: "Daily aggregated statistics",
      href: "/admin/stats",
      icon: BarChart3,
      gradient: "from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/20",
      ring: "ring-sky-200/60 dark:ring-sky-700/40",
      iconColor: "text-sky-600 dark:text-sky-400",
    },
    {
      title: "Moderation",
      description: "Nickname moderation tools",
      href: "/admin/moderation",
      icon: Shield,
      gradient: "from-rose-100 to-red-100 dark:from-rose-900/30 dark:to-red-900/20",
      ring: "ring-rose-200/60 dark:ring-rose-700/40",
      iconColor: "text-rose-600 dark:text-rose-400",
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/30 shadow-sm ring-1 ring-violet-200/60 dark:ring-violet-700/40">
            <Zap className="h-5 w-5 text-violet-600 dark:text-violet-400" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Overview of your Open Trivia app</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMetrics(true)}
            disabled={refreshing}
            className="rounded-lg h-8 text-xs gap-1.5"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" asChild className="rounded-lg h-8 text-xs gap-1.5">
            <Link href="/">
              <Home className="w-3.5 h-3.5" />
              Back to App
            </Link>
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/40 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-300 flex-1">{error}</span>
          <Button variant="ghost" size="sm" onClick={() => fetchMetrics()} className="rounded-lg h-7 text-xs text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30">
            Retry
          </Button>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Users */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/20 ring-1 ring-sky-200/60 dark:ring-sky-700/40">
              <Users className="h-4 w-4 text-sky-600 dark:text-sky-400" strokeWidth={2} />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Users</span>
          </div>
          {loading ? (
            <Loader className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : error ? (
            <span className="text-lg font-bold text-red-500">—</span>
          ) : (
            <span className="text-3xl font-black text-foreground tabular-nums">{metrics?.totalUsers || 0}</span>
          )}
        </div>

        {/* Total Games */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/20 ring-1 ring-emerald-200/60 dark:ring-emerald-700/40">
              <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Games</span>
          </div>
          {loading ? (
            <Loader className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : error ? (
            <span className="text-lg font-bold text-red-500">—</span>
          ) : (
            <span className="text-3xl font-black text-foreground tabular-nums">{metrics?.totalGames || 0}</span>
          )}
        </div>

        {/* Avg Score */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/20 ring-1 ring-violet-200/60 dark:ring-violet-700/40">
              <TrendingUp className="h-4 w-4 text-violet-600 dark:text-violet-400" strokeWidth={2} />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Score</span>
          </div>
          {loading ? (
            <Loader className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : error ? (
            <span className="text-lg font-bold text-red-500">—</span>
          ) : (
            <span className="text-3xl font-black text-foreground tabular-nums">{metrics?.avgScore?.toFixed(1) || 0}</span>
          )}
        </div>
      </div>

      {/* Today’s Activity */}
      <div className="rounded-2xl border border-border bg-card shadow-sm dark:shadow-none overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/20 ring-1 ring-amber-200/60 dark:ring-amber-700/40">
            <Activity className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" strokeWidth={2} />
          </div>
          <h2 className="text-sm font-bold text-foreground">Today’s Activity</h2>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border">
          <div className="px-5 py-5 text-center">
            <div className="text-2xl font-black text-foreground tabular-nums mb-0.5">
              {loading ? <Loader className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /> : metrics?.todayGames || 0}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Games Today</p>
          </div>
          <div className="px-5 py-5 text-center">
            <div className="text-2xl font-black text-foreground tabular-nums mb-0.5">
              {loading ? <Loader className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /> : <>{metrics?.avgAccuracy?.toFixed(1) || 0}%</>}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Avg Accuracy</p>
          </div>
          <div className="px-5 py-5 text-center">
            <div className="text-2xl font-black text-foreground tabular-nums mb-0.5">
              {loading ? <Loader className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /> : metrics?.recentActivity?.length || 0}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Recent Activities</p>
          </div>
        </div>
      </div>

      {/* Admin sections */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {adminSections.map((section) => (
            <Link key={section.href} href={section.href} className="group">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm dark:shadow-none transition-all duration-150 hover:shadow-md hover:-translate-y-0.5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br shadow-sm ring-1",
                    section.gradient, section.ring
                  )}>
                    <section.icon className={cn("h-4 w-4", section.iconColor)} strokeWidth={2} />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 ml-auto group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-0.5">{section.title}</h3>
                <p className="text-[11px] text-muted-foreground">{section.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
