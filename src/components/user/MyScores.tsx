"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader, Trophy, Play, Clock, Star, Trash2, CalendarDays, Trash, RotateCcw, Eye, EyeOff, Heart, FolderOpen, Shield } from "lucide-react";
import { collection, query, where, getDocs, orderBy, updateDoc, doc, getDoc, limit } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { updateQuizResultVisibility } from "@/services/quizResults";
import type { QuizResult } from "@/types/quizResult";
import { formatDate } from "@/utils/formatDate";
import { TOTAL_QUESTIONS } from "@/lib/quizConstants";
import { format, parse, isValid } from "date-fns";
import { Timestamp } from "firebase/firestore";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TriviaQuestion { 
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface QuizHistory {
  category: string;
  score: number;
  total: number;
  date: string;
  quizResultId?: string | null; // Link to leaderboard entry for privacy control
  hidden?: boolean; // Privacy state from leaderboard
}

interface MyScoresProps {
  showStatsOnly?: boolean;
  showActivityOnly?: boolean;
}

export default function MyScores({ showStatsOnly = false, showActivityOnly = false }: MyScoresProps) {
  const user = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [scores, setScores] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [bestScore, setBestScore] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Favorites state
  const [favorites, setFavorites] = useState<TriviaQuestion[]>([]);
  const [favoriteCategories, setFavoriteCategories] = useState<number[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});

  // Recent History state - Now loaded from Firestore for reliable quizResultId
  const [history, setHistory] = useState<QuizHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Clear history confirmation dialog state
  const [showClearHistoryDialog, setShowClearHistoryDialog] = useState(false);

  // Make fetchRecentActivity available in component scope
  const fetchRecentActivityRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const fetchUserScores = async () => {
      const currentUser = auth.currentUser;

      // Can't query without uid (auth required)
      if (!currentUser?.uid) {
        console.log("[MyScores] No authenticated user, skipping fetch");
        setLoading(false);
        setError("Please log in to view your scores.");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Query Firestore for results matching the user's uid, ordered by createdAt descending
        const q = query(
          collection(db, "quizResults"),
          where("uid", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);

        const results: QuizResult[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as QuizResult));

        console.log("[MyScores] Fetched", results.length, "results for uid:", currentUser.uid);

        // Sort by score descending for best score display
        const sortedByScore = [...results].sort((a, b) => b.score - a.score);

        setScores(results); // Keep chronological order for the table

        // Find best score
        if (sortedByScore.length > 0) {
          setBestScore(sortedByScore[0]);
        }
      } catch (err) {
        console.error("[MyScores] Error fetching user scores:", err);
        setError("Failed to load your scores. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Fetch Recent Activity from Firestore for reliable quizResultId
    const fetchRecentActivity = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser?.uid) {
        console.log("[RecentActivity] No authenticated user, skipping fetch");
        setHistoryLoading(false);
        return;
      }

      try {
        setHistoryLoading(true);

        // Query Firestore for recent quiz results
        const q = query(
          collection(db, "quizResults"),
          where("uid", "==", currentUser.uid),
          orderBy("createdAt", "desc"),
          limit(10)
        );
        const querySnapshot = await getDocs(q);

        const recentActivity: QuizHistory[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            category: data.categoryName || data.category || "Unknown",
            score: data.score,
            total: data.totalQuestions,
            date: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
            quizResultId: doc.id, // ✅ Always has the Firestore document ID
            hidden: data.hidden || false
          };
        });

        console.log("[RecentActivity] Fetched", recentActivity.length, "items from Firestore");
        setHistory(recentActivity);
      } catch (err) {
        console.error("[RecentActivity] Error fetching recent activity:", err);
        // Fallback to localStorage if Firestore fails
        const storedHistory = JSON.parse(localStorage.getItem('quiz_history') || '[]');
        setHistory(storedHistory);
      } finally {
        setHistoryLoading(false);
      }
    };

    const loadLocalData = () => {
      // Load favorites from localStorage
      const stored = JSON.parse(localStorage.getItem('trivia_favorites') || '[]');
      setFavorites(stored);

      const storedCats = JSON.parse(localStorage.getItem('fav_categories') || '[]');
      setFavoriteCategories(storedCats);

      // fetch category map to display names for favorite categories
      (async () => {
        try {
          const res = await axios.get('https://opentdb.com/api_category.php');
          const map: Record<number, string> = {};
          res.data.trivia_categories.forEach((c: any) => (map[c.id] = c.name));
          setCategoryMap(map);
        } catch (e) {
          // ignore
        }
      })();
    };

    fetchUserScores();
    fetchRecentActivity(); // ✅ Load recent activity from Firestore
    loadLocalData();
    
    // Store function reference for use in error handlers
    fetchRecentActivityRef.current = fetchRecentActivity;
  }, []);

  const removeFavorite = (questionText: string) => {
    const updated = favorites.filter(q => q.question !== questionText);
    setFavorites(updated);
    localStorage.setItem('trivia_favorites', JSON.stringify(updated));
    toast({ description: "Removed from favorites" });
  };

  const removeCategoryFavorite = (catId: number) => {
    const updated = favoriteCategories.filter((id) => id !== catId);
    setFavoriteCategories(updated);
    localStorage.setItem('fav_categories', JSON.stringify(updated));
    toast({ description: 'Category removed from favorites' });
  };

  const openCategory = (catId: number) => {
    router.push(`/categories?cat=${catId}`);
  };

  const clearAllHistory = () => {
    if (!history || history.length === 0) return;
    setShowClearHistoryDialog(true);
  };

  const confirmClearHistory = () => {
    localStorage.removeItem('quiz_history');
    setHistory([]);
    setShowClearHistoryDialog(false);
    toast({ description: "All history cleared successfully" });
  };

  const deleteHistoryEntry = (idx: number) => {
    const newHist = history.filter((_, i) => i !== idx);
    localStorage.setItem('quiz_history', JSON.stringify(newHist));
    setHistory(newHist);
  };

  const replayCategory = (categoryName: string, categoryId?: number) => {
    // If we have categoryId, navigate directly to quiz
    if (categoryId) {
      router.push(`/quiz?category=${categoryId}`);
    } else {
      // Fallback: Find category ID from category name (simplified approach)
      router.push(`/categories?category=${encodeURIComponent(categoryName)}`);
    }
  };

  const toggleScoreVisibility = async (scoreId: string, currentlyHidden: boolean) => {
    try {
      const scoreRef = doc(db, "quizResults", scoreId);
      
      // First check if document exists before updating
      const scoreDoc = await getDoc(scoreRef);
      if (!scoreDoc.exists()) {
        console.error("[ERROR] Quiz result document does not exist:", scoreId);
        toast({
          title: "Error",
          description: "Quiz result not found. It may have been deleted.",
          variant: "destructive"
        });
        return;
      }
      
      await updateDoc(scoreRef, {
        hidden: !currentlyHidden
      });
      
      console.log("[SUCCESS] Updated score visibility:", {
        scoreId: scoreId,
        newHiddenState: !currentlyHidden
      });
      
      // Update local state
      setScores(prevScores => 
        prevScores.map(score => 
          score.id === scoreId ? { ...score, hidden: !currentlyHidden } : score
        )
      );
      
      toast({
        description: currentlyHidden ? "Score is now visible on leaderboard" : "Score hidden from leaderboard"
      });
    } catch (error) {
      console.error("[ERROR] Error updating score visibility:", {
        scoreId: scoreId,
        error: error,
        errorCode: (error as any).code,
        errorMessage: (error as any).message
      });
      
      toast({
        title: "Error",
        description: "Failed to update score visibility. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleHistoryVisibility = async (historyItem: QuizHistory, currentlyHidden: boolean) => {
    if (!historyItem.quizResultId) {
      toast({
        title: "Privacy Control Unavailable",
        description: "This quiz attempt cannot be hidden from the leaderboard. Refreshing your activity list...",
        variant: "destructive"
      });
      
      // Auto refresh activity list from Firestore
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      return;
    }

    // Optimistically update UI first
    const newHiddenState = !currentlyHidden;
    setHistory(prevHistory => 
      prevHistory.map(item => 
        item.date === historyItem.date 
          ? { ...item, hidden: newHiddenState }
          : item
      )
    );

    try {
      await updateQuizResultVisibility(historyItem.quizResultId, newHiddenState);
      
      console.log("[SUCCESS] Updated history visibility:", {
        quizResultId: historyItem.quizResultId,
        newHiddenState: newHiddenState
      });
      
      toast({
        description: newHiddenState 
          ? "This attempt is now hidden from the leaderboard" 
          : "This attempt is now visible on the leaderboard"
      });
    } catch (error) {
      console.error("Error updating history visibility:", error);
      
      // Revert optimistic update on error
      setHistory(prevHistory => 
        prevHistory.map(item => 
          item.date === historyItem.date 
            ? { ...item, hidden: currentlyHidden }
            : item
        )
      );
      
      // Check if it's a "not found" error
      if ((error as any).message?.includes("not found") || (error as any).message?.includes("No document to update")) {
        toast({
          title: "Activity Not Found",
          description: "Couldn't update this activity. Refreshing your activity list...",
          variant: "destructive"
        });
        
        // Re-fetch from Firestore to get updated data
        setTimeout(() => {
          if (fetchRecentActivityRef.current) {
            fetchRecentActivityRef.current();
          }
        }, 1000);
      } else {
        toast({
          title: "Error",
          description: "Failed to update privacy settings. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  // Helper function to format percentage consistently
  const formatPercentage = (score: number, total: number) => {
    return Math.round((score / total) * 100) + "%";
  };

  // Helper function to format date consistently
  const formatDateConsistent = (dateInput: Timestamp | string) => {
    let date: Date;
    
    if (dateInput instanceof Timestamp) {
      // Handle Firestore Timestamp
      date = dateInput.toDate();
    } else {
      // Handle string date (from localStorage history)
      const parsedDate = parse(dateInput, "M/d/yyyy", new Date());
      if (!isValid(parsedDate)) {
        return "—"; // Fallback for invalid dates
      }
      date = parsedDate;
    }
    
    return format(date, "MMM d, yyyy");
  };

  // When showActivityOnly, render cards as direct fragment children
  // so the parent grid in page.tsx can place them side-by-side.
  if (showActivityOnly) {
    return (
      <>
        {/* ─── RECENT ACTIVITY CARD ─── */}
        <div className="rounded-xl border border-border bg-card h-full flex flex-col">
            {/* Card header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/30 shadow-sm ring-1 ring-violet-200/60 dark:ring-violet-700/40">
                  <Clock className="h-4 w-4 text-violet-600 dark:text-violet-400" strokeWidth={2.25} />
                </div>
                <h3 className="text-sm font-semibold tracking-tight text-foreground">Recent Activity</h3>
              </div>
              {history.length > 0 && (
                <button
                  onClick={clearAllHistory}
                  className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors px-2 py-1 -mr-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 focus-visible:ring-offset-2"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Card body */}
            <div className="px-6 pb-6 flex-1">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader className="h-6 w-6 animate-spin text-violet-500 mb-3" />
                  <p className="text-xs text-muted-foreground">Loading activity…</p>
                </div>
              ) : history.length === 0 ? (
                /* Empty state — compact */
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/30 shadow-sm ring-1 ring-violet-200/60 dark:ring-violet-700/40 mb-3">
                    <CalendarDays className="h-7 w-7 text-violet-600 dark:text-violet-400" strokeWidth={1.75} />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">No recent activity</h4>
                  <p className="text-xs text-muted-foreground mb-4 max-w-55 leading-5">Start a quiz to see your progress here.</p>
                  <Button asChild size="sm" className="h-10 bg-violet-600 hover:bg-violet-700 text-white rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 focus-visible:ring-offset-2">
                    <Link href="/categories">
                      <Play size={14} strokeWidth={2.5} className="mr-1.5" />
                      Start a Quiz
                    </Link>
                  </Button>
                </div>
              ) : (
                /* Activity list */
                <div className="flex flex-col gap-2">
                  {history.slice(0, 5).map((record, i) => {
                    const isHidden = record.hidden || false;
                    const hasPrivacyControl = !!record.quizResultId;

                    return (
                      <div
                        key={i}
                        className={`group flex items-center gap-4 min-h-14 px-4 py-3 rounded-lg transition-colors ${
                          isHidden
                            ? "bg-muted/40 border border-border"
                            : "hover:bg-slate-50 dark:hover:bg-white/3"
                        }`}
                      >
                        {/* Left: title + meta */}
                        <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium leading-5 text-foreground truncate">
                              {record.category}
                            </span>
                            {isHidden && (
                              <Badge variant="secondary" className="text-[11px] font-medium px-1.5 py-0 h-5 leading-5 shrink-0">
                                <Shield className="h-3 w-3 mr-0.5" />
                                Hidden
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground leading-5">
                            {format(new Date(record.date), "MMM d, h:mm a")}
                          </span>
                        </div>

                        {/* Right: score pill + actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Score pill */}
                          <span
                            className={`inline-flex items-center gap-0.5 rounded-full px-3 py-1 text-xs font-semibold leading-4 ring-1 ring-inset ${
                              isHidden
                                ? "bg-slate-50 text-slate-500 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:ring-slate-700"
                                : record.score / record.total >= 0.7
                                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200/60 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-700/40"
                                  : record.score / record.total >= 0.4
                                    ? "bg-amber-50 text-amber-700 ring-amber-200/60 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-700/40"
                                    : "bg-violet-50 text-violet-700 ring-violet-200/60 dark:bg-violet-900/20 dark:text-violet-300 dark:ring-violet-700/40"
                            }`}
                          >
                            {record.score}<span className="opacity-50">/{record.total}</span>
                          </span>

                          {/* Action icons */}
                          <div className="flex items-center gap-0.5">
                            {hasPrivacyControl && (
                              <button
                                onClick={() => toggleHistoryVisibility(record, isHidden)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/70 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/25 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:ring-offset-1"
                                aria-label={isHidden ? "Show on leaderboard" : "Hide from leaderboard"}
                              >
                                {isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                              </button>
                            )}
                            <button
                              onClick={() => replayCategory(record.category)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/70 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/25 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-1"
                              aria-label="Replay category"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => deleteHistoryEntry(i)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/70 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/25 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 focus-visible:ring-offset-1"
                              aria-label="Remove activity"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {history.length > 5 && (
                    <div className="pt-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 focus-visible:ring-offset-2"
                      >
                        View all {history.length} activities
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ─── FAVORITES CARD ─── */}
          <div className="rounded-xl border border-border bg-card h-full flex flex-col">
            {/* Card header */}
            <div className="flex flex-col gap-1 px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/30 shadow-sm ring-1 ring-amber-200/60 dark:ring-amber-700/40">
                  <Heart className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="currentColor" strokeWidth={2.25} />
                </div>
                <h3 className="text-sm font-semibold tracking-tight text-foreground">Favorites</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-5 pl-11">
                Questions &amp; Categories you&apos;ve saved.
              </p>
            </div>

            {/* Card body */}
            <div className="px-6 pb-6 flex-1">
              {/* Favorite categories */}
              {favoriteCategories.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <FolderOpen className="h-3.5 w-3.5" />
                    Categories
                  </h4>
                  <div className="flex flex-col gap-2">
                    {favoriteCategories.slice(0, 3).map((id) => (
                      <div
                        key={`cat-${id}`}
                        className="group flex items-center justify-between min-h-12 px-4 py-2.5 rounded-lg border border-border hover:bg-slate-50 dark:hover:bg-white/3 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-medium text-foreground truncate block">{categoryMap[id] ?? `Category ${id}`}</span>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            onClick={() => openCategory(id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/70 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/25 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-1"
                            aria-label="Open category"
                          >
                            <Play className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => removeCategoryFavorite(id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/70 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/25 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 focus-visible:ring-offset-1"
                            aria-label="Remove category from favorites"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorite questions */}
              {favorites.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5" fill="currentColor" />
                    Questions
                  </h4>
                  <div className="flex flex-col gap-2">
                    {favorites.slice(0, 3).map((fav, i) => (
                      <div
                        key={`fav-${i}`}
                        className="group flex items-start justify-between gap-3 min-h-12 px-4 py-2.5 rounded-lg border border-border hover:bg-slate-50 dark:hover:bg-white/3 transition-colors"
                      >
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p className="text-sm font-medium text-foreground line-clamp-2 leading-5">{fav.question}</p>
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                            <span>{fav.category}</span>
                            <span className="text-border">·</span>
                            <span className="capitalize">{fav.difficulty}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFavorite(fav.question)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/70 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/25 transition-all duration-150 shrink-0 mt-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 focus-visible:ring-offset-1"
                          aria-label="Remove question from favorites"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state — compact & centered */}
              {favorites.length === 0 && favoriteCategories.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/30 shadow-sm ring-1 ring-amber-200/60 dark:ring-amber-700/40 mb-3">
                    <Heart className="h-7 w-7 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">No favorites yet</h4>
                  <p className="text-xs text-muted-foreground mb-4 max-w-sm leading-5">
                    Save questions and categories to access them quickly.
                  </p>
                  <Button asChild size="sm" className="h-10 bg-amber-500 hover:bg-amber-600 text-white rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 focus-visible:ring-offset-2">
                    <Link href="/categories">
                      <Play size={14} strokeWidth={2.5} className="mr-1.5" />
                      Browse Categories
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Clear History Confirmation Dialog */}
          <Dialog open={showClearHistoryDialog} onOpenChange={setShowClearHistoryDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear All History?</DialogTitle>
                <DialogDescription>
                  This will permanently delete all your quiz history. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowClearHistoryDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmClearHistory}>
                  Clear All History
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
  }

  return (
    <div className="space-y-8">
      {/* SECTION: My Stats Only - Simple & Warm */}
      {showStatsOnly && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Best Score Summary */}
          {bestScore && !loading && (
            <Card className="border border-amber-200 dark:border-amber-800 bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-8 pb-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-linear-to-br from-amber-400 to-orange-500 rounded-xl p-3 shadow-md">
                    <Trophy className="text-white" size={20} strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground font-medium mb-2">Your Best Score</p>
                    <p className="text-2xl font-bold text-amber-900 dark:text-amber-200">
                      {bestScore.score}/{TOTAL_QUESTIONS}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {bestScore.category || 'Unknown'} • {formatPercentage(bestScore.score, TOTAL_QUESTIONS)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateConsistent(bestScore.createdAt)}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => replayCategory(bestScore.category || 'General', bestScore.categoryId)} 
                  size="lg" 
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <RotateCcw size={16} strokeWidth={2} className="mr-2" />
                  Replay Category
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Your Rank */}
          {!loading && (
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-8 pb-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-linear-to-br from-violet-500 to-purple-600 rounded-xl p-3 shadow-md">
                    <Trophy className="text-white" size={20} strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground font-medium mb-2">Your Rank</p>
                    <p className="text-2xl font-bold text-foreground">
                      {scores.length > 0 ? "Keep climbing!" : "Ready to start?"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {scores.length > 0 ? "Every quiz makes you stronger" : "Your first quiz awaits"}
                    </p>
                  </div>
                </div>
                {scores.length === 0 && (
                  <Button 
                    asChild
                    size="lg" 
                    className="w-full bg-violet-500 hover:bg-violet-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <Link href="/categories">
                      <Play size={16} strokeWidth={2} className="mr-2" />
                      Start Your First Quiz
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
