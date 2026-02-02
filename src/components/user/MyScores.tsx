"use client";

import { useEffect, useState } from "react";
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
import { Loader, Trophy, Play } from "lucide-react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { useUser } from "@/context/UserContext";
import type { QuizResult } from "@/types/quizResult";
import { formatDate } from "@/utils/formatDate";
import { TOTAL_QUESTIONS } from "@/lib/quizConstants";
import Link from "next/link";

export default function MyScores() {
  const user = useUser();
  const [scores, setScores] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [bestScore, setBestScore] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    fetchUserScores();
  }, []);

  return (
    <div className="space-y-6">
      {/* Best Score Summary */}
      {bestScore && !loading && (
        <Card className="border-2 border-yellow-200 dark:border-yellow-800 bg-linear-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 shadow-sm">
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-400 rounded-full p-3 shrink-0">
                <Trophy className="text-yellow-900" size={24} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium">Your Best Score</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">
                  {bestScore.score}/{TOTAL_QUESTIONS}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {bestScore.category} • {bestScore.percentage?.toFixed(1) || ((bestScore.score / TOTAL_QUESTIONS) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Scores Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">My Scores</CardTitle>
          <CardDescription className="text-sm">Your quiz results sorted by highest score</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin text-muted-foreground" size={24} strokeWidth={2} />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Trophy className="text-muted-foreground/50" size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold mb-2">No quiz attempts yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                Play a quiz to see your results here and track your progress over time.
              </p>
              <Button asChild size="lg">
                <Link href="/categories">
                  <Play size={16} strokeWidth={2} className="mr-2" />
                  Start a Quiz
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">%</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scores.map((result) => {
                    const percentage = result.percentage ?? ((result.score / result.totalQuestions) * 100).toFixed(1);
                    const percentageValue = typeof percentage === 'number' ? percentage : parseFloat(percentage);

                    return (
                      <TableRow key={result.id}>
                        <TableCell className="text-center font-semibold">
                          {result.score}/{TOTAL_QUESTIONS}
                        </TableCell>
                        <TableCell className="text-sm">
                          <Badge variant="secondary">{result.category ?? "Uncategorized"}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-semibold ${
                              percentageValue >= 80
                                ? "text-green-600 dark:text-green-400"
                                : percentageValue >= 60
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {percentageValue.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {formatDate(result.createdAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
