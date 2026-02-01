"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Trophy } from "lucide-react";
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

export default function Leaderboard() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNickname, setEditNickname] = useState("");
  const [editScore, setEditScore] = useState("");

  useEffect(() => {
    const unsubscribe = listenLeaderboard(
      50,
      (data) => {
        setResults(data as QuizResult[]);
      },
      (err) => console.error("Leaderboard error:", err)
    );

    return () => unsubscribe();
  }, []);

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
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <div>
              <CardTitle className="text-3xl">Leaderboard</CardTitle>
              <CardDescription>Top quiz results from all players</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No quiz results yet. Complete a quiz to see your score here!
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Percentage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => {
                    const percentage = ((result.score / result.totalQuestions) * 100).toFixed(1);
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
                          {result.category || "Unknown"}
                        </TableCell>
                        <TableCell className="text-center font-semibold">{result.score}</TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {result.totalQuestions}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-semibold ${
                              parseFloat(percentage) >= 80
                                ? "text-green-600"
                                : parseFloat(percentage) >= 60
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {percentage}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(result)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(result.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
