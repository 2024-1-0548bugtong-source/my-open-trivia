import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import type { QuizResult } from "../types/quizResult";

const RESULTS_COLLECTION = "quizResults";

// CREATE: save quiz result when quiz finishes
// Uses addDoc to create a NEW document with auto-generated ID each time
// This ensures multiple quiz attempts create separate documents
export async function createQuizResult(data: {
  score: number;
  totalQuestions: number;
  nickname?: string;
  category?: string;
}) {
  return await addDoc(collection(db, RESULTS_COLLECTION), {
    score: data.score,                         // REAL computed score from quiz
    totalQuestions: data.totalQuestions,       // REAL question count
    nickname: data.nickname?.trim() || "Guest", // User nickname or default
    category: data.category || "Unknown",      // Quiz category name
    createdAt: serverTimestamp(),               // Server timestamp for consistency
  });
}

// READ: realtime leaderboard
export function listenLeaderboard(
  max: number,
  onData: (rows: QuizResult[]) => void,
  onError?: (e: Error) => void
) {
  const q = query(
    collection(db, RESULTS_COLLECTION),
    orderBy("score", "desc"),
    orderBy("createdAt", "desc"),
    limit(max)
  );

  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuizResult)));
    },
    (err) => onError?.(err as Error)
  );
}

// UPDATE: edit a result (nickname/score)
// Called from Leaderboard when user edits a document
// Uses updateDoc with specific doc id to modify fields
export async function updateQuizResult(
  id: string,
  updates: { nickname?: string; score?: number }
) {
  const ref = doc(db, RESULTS_COLLECTION, id);
  await updateDoc(ref, updates);
}

// DELETE: remove a result
export async function deleteQuizResult(id: string) {
  const ref = doc(db, RESULTS_COLLECTION, id);
  await deleteDoc(ref);
}