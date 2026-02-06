"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader, RefreshCw, BarChart3, TrendingUp, Calendar, Target } from "lucide-react";

interface DailyStats {
  quizCount: number;
  totalScore: number;
  totalQuestions: number;
  categoryCounts: Record<string, number>;
  updatedAt: any; // Firestore Timestamp
}

interface Category {
  id: number;
  name: string;
}

export default function AdminStats() {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayKey());

  function getTodayKey(): string {
    // Asia/Manila timezone (UTC+8)
    const now = new Date();
    const manilaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    return manilaTime.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  // Load categories for name mapping
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("https://opentdb.com/api_category.php");
        const data = await response.json();
        setCategories(data.trivia_categories || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    loadCategories();
  }, []);

  // Load daily stats
  const loadStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const dateKey = selectedDate || getTodayKey();
      const statsDoc = doc(db, "statsDaily", dateKey);
      const statsSnapshot = await getDoc(statsDoc);

      if (statsSnapshot.exists()) {
        setStats(statsSnapshot.data() as DailyStats);
      } else {
        setStats({
          quizCount: 0,
          totalScore: 0,
          totalQuestions: 0,
          categoryCounts: {},
          updatedAt: null
        });
      }
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to load stats:", err);
      setError("Failed to load daily statistics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [selectedDate]);

  const handleRefresh = () => {
    loadStats(true);
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === Number(categoryId));
    return category?.name || `Category ${categoryId}`;
  };

  const getMostPlayedCategory = (): { categoryId: string; count: number; name: string } | null => {
    if (!stats || !stats.categoryCounts || Object.keys(stats.categoryCounts).length === 0) {
      return null;
    }

    let maxCount = 0;
    let maxCategoryId = "";

    Object.entries(stats.categoryCounts).forEach(([categoryId, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxCategoryId = categoryId;
      }
    });

    return {
      categoryId: maxCategoryId,
      count: maxCount,
      name: getCategoryName(maxCategoryId)
    };
  };

  const averageScore = stats && stats.quizCount > 0 
    ? (stats.totalScore / stats.quizCount).toFixed(1)
    : "0";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const mostPlayed = getMostPlayedCategory();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            Daily Statistics (Aggregated)
          </h2>
          <p className="text-muted-foreground">
            No PII • Server-side aggregation • Real-time data
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={getTodayKey()}
            className="px-3 py-2 border rounded-md text-sm"
          />
          
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {lastRefresh && (
        <p className="text-sm text-muted-foreground">
          Last refreshed: {lastRefresh.toLocaleTimeString()} • Date: {selectedDate || getTodayKey()}
        </p>
      )}

      {error && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Played</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.quizCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total quiz attempts today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}</div>
            <p className="text-xs text-muted-foreground">
              Out of {stats?.totalQuestions || 0} total questions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Played Category</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mostPlayed ? mostPlayed.name : "None"}
            </div>
            <p className="text-xs text-muted-foreground">
              {mostPlayed ? `${mostPlayed.count} plays` : "No activity today"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {stats && Object.keys(stats.categoryCounts).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.categoryCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([categoryId, count]) => (
                    <div key={categoryId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{getCategoryName(categoryId)}</Badge>
                        <span className="text-sm text-muted-foreground">ID: {categoryId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{count}</span>
                        <span className="text-sm text-muted-foreground">
                          ({((count / stats.quizCount) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No category data available for this date.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">📊 Query Information</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Collection:</strong> statsDaily/{selectedDate || getTodayKey()}</p>
                <p><strong>Document ID:</strong> {selectedDate || getTodayKey()} (YYYY-MM-DD)</p>
                <p><strong>Timezone:</strong> Asia/Manila (UTC+8)</p>
                <p><strong>Last Updated:</strong> {stats?.updatedAt ? stats.updatedAt.toDate().toLocaleString() : "Never"}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">🔒 Privacy & Security</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• No PII (Personally Identifiable Information)</p>
                <p>• Server-side aggregation only</p>
                <p>• Admin read-only access</p>
                <p>• Client writes denied</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">📈 Data Schema</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>quizCount:</strong> {stats?.quizCount || 0}</p>
                <p><strong>totalScore:</strong> {stats?.totalScore || 0}</p>
                <p><strong>totalQuestions:</strong> {stats?.totalQuestions || 0}</p>
                <p><strong>categoryCounts:</strong> {Object.keys(stats?.categoryCounts || {}).length} categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
