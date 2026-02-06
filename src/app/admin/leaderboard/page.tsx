"use client";

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader, RefreshCw, Trophy, Eye } from "lucide-react";
import LeaderboardSkeleton from "@/components/LeaderboardSkeleton";
import LeaderboardEmptyState from "@/components/LeaderboardEmptyState";
import LeaderboardErrorState from "@/components/LeaderboardErrorState";

interface LeaderboardEntry {
  id: string;
  uid: string;
  nicknameSnapshot: string;
  categoryId: string | number;
  categoryName: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  createdAt: Timestamp;
  hidden: boolean;
}

interface Category {
  id: number;
  name: string;
}

export default function AdminLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isIndexError, setIsIndexError] = useState(false);

  // Load categories for filter dropdown
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

  // Load leaderboard entries
  const loadLeaderboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    setIsIndexError(false);

    try {
      let q = query(
        collection(db, "quizResults"),
        where("hidden", "==", false),
        orderBy("score", "desc"),
        orderBy("accuracy", "desc"),
        orderBy("createdAt", "desc"),
        limit(20)
      );

      // Apply category filter if selected
      if (selectedCategory !== "all") {
        q = query(
          collection(db, "quizResults"),
          where("hidden", "==", false),
          where("categoryId", "==", parseInt(selectedCategory)),
          orderBy("score", "desc"),
          orderBy("accuracy", "desc"),
          orderBy("createdAt", "desc"),
          limit(20)
        );
      }

      const querySnapshot = await getDocs(q);
      const leaderboardData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LeaderboardEntry));

      setEntries(leaderboardData);
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error("Failed to load leaderboard:", err);
      
      // Check for Firestore index error
      if (err.message && err.message.includes('index')) {
        setIsIndexError(true);
        setError("Firestore index required for this query");
      } else {
        setError(err.message || "Failed to load leaderboard data");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [selectedCategory]);

  const handleRefresh = () => {
    loadLeaderboard(true);
  };

  const getCategoryName = (categoryId: string | number) => {
    const category = categories.find(cat => cat.id === Number(categoryId));
    return category?.name || `Category ${categoryId}`;
  };

  // Show loading skeleton
  if (loading) {
    return <LeaderboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Leaderboard (Read-Only)
          </h2>
          <p className="text-muted-foreground">
            Top 20 entries • Filter by category • Real-time data
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
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
          Last refreshed: {lastRefresh.toLocaleTimeString()}
        </p>
      )}

      {/* Error State */}
      {error && (
        <LeaderboardErrorState 
          error={error} 
          onRetry={() => loadLeaderboard()}
          isIndexError={isIndexError}
        />
      )}

      {/* Main Content */}
      {!error && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Top {entries.length} Entries
              {selectedCategory !== "all" && (
                <Badge variant="secondary">
                  {getCategoryName(selectedCategory)}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <LeaderboardEmptyState hasFilter={selectedCategory !== "all"} />
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 text-sm font-medium text-muted-foreground border-b pb-2">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-3">Player</div>
                  <div className="col-span-3">Category</div>
                  <div className="col-span-2">Score</div>
                  <div className="col-span-2">Accuracy</div>
                  <div className="col-span-1">Date</div>
                </div>
                
                {entries.map((entry, index) => (
                  <div key={entry.id} className="grid grid-cols-12 items-center py-3 border-b last:border-0">
                    <div className="col-span-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-sm">
                        {index === 0 && "🥇"}
                        {index === 1 && "🥈"}
                        {index === 2 && "🥉"}
                        {index > 2 && `#${index + 1}`}
                      </div>
                    </div>
                    <div className="col-span-3">
                      <div className="font-medium">{entry.nicknameSnapshot}</div>
                      <div className="text-xs text-muted-foreground">UID: {entry.uid.slice(0, 8)}...</div>
                    </div>
                    <div className="col-span-3">
                      <div className="font-medium">{entry.categoryName}</div>
                      <div className="text-xs text-muted-foreground">ID: {entry.categoryId}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="font-bold">{entry.score}/{entry.totalQuestions}</div>
                    </div>
                    <div className="col-span-2">
                      <Badge variant={entry.accuracy >= 80 ? "default" : entry.accuracy >= 60 ? "secondary" : "destructive"}>
                        {entry.accuracy.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="col-span-1 text-sm text-muted-foreground">
                      {entry.createdAt.toDate().toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Debug Query Info - Only in Development */}
      {process.env.NODE_ENV === "development" && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-2">📊 Query Information</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Collection:</strong> quizResults</p>
              <p><strong>Filter:</strong> hidden == false {selectedCategory !== "all" && `&& categoryId == ${selectedCategory}`}</p>
              <p><strong>Ordering:</strong> score desc → accuracy desc → createdAt desc</p>
              <p><strong>Limit:</strong> 20 entries</p>
              <p className="text-xs mt-2 text-blue-600">
                ⚠️ Requires composite index: (hidden, categoryId, score, accuracy, createdAt)
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
