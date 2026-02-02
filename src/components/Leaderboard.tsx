"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Trophy, Shield, TrendingUp } from "lucide-react";
import { listenLeaderboard, updateQuizResult, deleteQuizResult } from "../services/quizResults";
import type { QuizResult } from "../types/quizResult";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { TOTAL_QUESTIONS, QUESTION_TYPE, DIFFICULTY } from "@/lib/quizConstants";
import Link from "next/link";

export default function Leaderboard({ compact = false }: { compact?: boolean }) {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNickname, setEditNickname] = useState("");
  const [editScore, setEditScore] = useState("");

  useEffect(() => {
    const unsubscribe = listenLeaderboard(
      compact ? 10 : 50,  // Show top 10 in compact mode, top 50 in full
      (data) => {
        setResults(data as QuizResult[]);
      },
      (err) => console.error("Leaderboard error:", err)
    );

    return () => unsubscribe();
  }, [compact]);

  const handleEdit = (result: QuizResult) => {
    setEditingId(result.id);
    setEditNickname(result.nickname);
    setEditScore(result.score.toString());
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (!editNickname.trim()) {
      alert("Nickname cannot be empty");
      return;
    }

    try {
      await updateQuizResult(editingId, {
        nickname: editNickname.trim(),
        score: parseInt(editScore, 10),
      });
      setEditingId(null);
      setEditNickname("");
      setEditScore("");
      console.log("Update successful for doc:", editingId);
    } catch (err) {
      console.error("Update failed:", err);
      alert(
        `Failed to update result: ${err instanceof Error ? err.message : "Unknown error"}. Check browser console and Firestore rules.`
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this result?")) return;

    try {
      await deleteQuizResult(id);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete result");
    }
  };

  return (
    <div className={compact ? "" : "container mx-auto p-6 space-y-6"}>
      <Card className={`shadow-sm ${compact ? "h-full" : ""}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Trophy 
              className="text-yellow-500" 
              size={compact ? 24 : 32} 
              strokeWidth={2}
            />
            <div className="flex-1">
              <CardTitle className={compact ? "text-xl" : "text-3xl"}>
                {compact ? "Top Players" : "Leaderboard"}
              </CardTitle>
              {!compact && (
                <CardDescription className="mt-1">Top quiz results from all players</CardDescription>
              )}
            </div>
          </div>
          
          {!compact && (
            <div className="mt-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-3">
              <Shield className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={16} strokeWidth={2} />
              <div className="space-y-0.5 text-xs text-blue-700 dark:text-blue-300">
                <p className="font-semibold">Standardized Rules</p>
                <p>{TOTAL_QUESTIONS} Questions • {QUESTION_TYPE === 'multiple' ? 'Multiple Choice' : 'True/False'} • Medium Difficulty</p>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className={compact ? "pb-6" : ""}>
          {results.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <TrendingUp className="text-muted-foreground/50" size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold mb-2">No leaderboard data yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                Complete a quiz to appear here and compete with others!
              </p>
              {!compact && (
                <Button asChild size="lg">
                  <Link href="/categories">
                    Start Your First Quiz
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">%</TableHead>
                    {!compact && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => {
                    const percentage = result.percentage ?? ((result.score / result.totalQuestions) * 100).toFixed(1);
                    const percentageValue = typeof percentage === 'number' ? percentage : parseFloat(percentage);
                    return (
                      <TableRow key={result.id}>
                        <TableCell className="font-bold">
                          {index === 0 && "🥇"}
                          {index === 1 && "🥈"}
                          {index === 2 && "🥉"}
                          {index > 2 && `#${index + 1}`}
                        </TableCell>
                        <TableCell className="font-medium">{result.nickname}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {result.category ?? "Uncategorized"}
                        </TableCell>
                        <TableCell className="text-center font-semibold">{result.score}/{TOTAL_QUESTIONS}</TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-semibold ${
                              percentageValue >= 80
                                ? "text-green-600"
                                : percentageValue >= 60
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {percentageValue.toFixed(1)}%
                          </span>
                        </TableCell>
                        {!compact && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(result)}
                              >
                                <Pencil size={16} strokeWidth={2} />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(result.id)}
                              >
                                <Trash2 size={16} strokeWidth={2} />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Quiz Result</DialogTitle>
            <DialogDescription>Update the nickname or score for this result.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                placeholder="Enter nickname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="score">Score</Label>
              <Input
                id="score"
                type="number"
                value={editScore}
                onChange={(e) => setEditScore(e.target.value)}
                placeholder="Enter score"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
