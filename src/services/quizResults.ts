import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, auth } from "@/firebase";
import type { QuizResult } from "../types/quizResult";
import { resolveNickname } from "@/context/UserContext";

const RESULTS_COLLECTION = "quizResults";

// CREATE: save quiz result when quiz finishes
// Uses addDoc to create a NEW document with auto-generated ID each time
// This ensures multiple quiz attempts create separate documents
export async function createQuizResult(data: {
  score: number;
  totalQuestions: number;
  nickname?: string;
  category?: string;
  categoryId?: number;
  uid?: string;
}) {
  const percentage = (data.score / data.totalQuestions) * 100;
  const currentUser = auth.currentUser;
  const uid = data.uid || currentUser?.uid || null;

  // Resolve nickname reliably: prioritize Firebase Auth displayName first
  let nickname: string;

  // 1. Prefer Firebase Auth displayName (most reliable source)
  if (currentUser?.displayName?.trim()) {
    nickname = currentUser.displayName.trim();
  }
  // 2. Use passed nickname if available
  else if (data.nickname?.trim()) {
    nickname = data.nickname.trim();
  }
  // 3. Fallback to context/localStorage
  else {
    nickname = resolveNickname(data.nickname || null);
  }

  try {
    const result = await addDoc(collection(db, RESULTS_COLLECTION), {
      uid: uid,                                    // Firebase auth uid for filtering user's scores
      score: data.score,                             // REAL computed score from quiz
      totalQuestions: data.totalQuestions,           // REAL question count (fixed to 10 for leaderboard fairness)
      accuracy: parseFloat(percentage.toFixed(1)),   // FIXED: Use 'accuracy' to match admin query
      percentage: parseFloat(percentage.toFixed(1)), // Keep for backward compatibility
      nicknameSnapshot: nickname,                    // FIXED: Use 'nicknameSnapshot' to match admin interface
      nickname: nickname,                            // Keep for backward compatibility
      categoryName: data.category?.trim() || "Uncategorized", // FIXED: Use 'categoryName' to match admin query
      category: data.category?.trim() || "Uncategorized", // Keep for backward compatibility
      categoryId: data.categoryId || null,           // Quiz category ID for replay functionality
      hidden: false,                                // Explicit default for leaderboard visibility
      createdAt: serverTimestamp(),                  // Server timestamp for consistency
    });
    
    console.log("[SAVE] Quiz result saved successfully:", {
      docId: result.id,
      uid: uid,
      nicknameSnapshot: nickname,
      accuracy: parseFloat(percentage.toFixed(1)),
      score: data.score,
      totalQuestions: data.totalQuestions,
      categoryName: data.category
    });
    
    return result;
  } catch (err) {
    console.error("[ERROR] Failed to save quiz result to Firestore:", err);
    console.error("[DEBUG] Attempted to save with uid:", uid, "nicknameSnapshot:", nickname);
    throw err;
  }
}

// READ: realtime leaderboard
export function listenLeaderboard(
  max: number,
  onData: (rows: QuizResult[]) => void,
  onError?: (e: Error) => void
) {
  const q = query(
    collection(db, RESULTS_COLLECTION),
    where("hidden", "!=", true), // Exclude hidden scores from public leaderboard
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

// UPDATE: hide/unhide a quiz result from leaderboard
// Privacy feature for users to control visibility of their scores
export async function updateQuizResultVisibility(
  id: string,
  hidden: boolean
) {
  try {
    const ref = doc(db, RESULTS_COLLECTION, id);
    
    // Check if document exists before updating
    const docSnap = await getDoc(ref);
    if (!docSnap.exists()) {
      console.error("[ERROR] Quiz result document does not exist:", id);
      throw new Error("Quiz result not found");
    }
    
    await updateDoc(ref, { hidden });
    
    console.log(`[PRIVACY] Quiz result ${id} visibility updated to:`, hidden);
    return true;
  } catch (error) {
    console.error("[ERROR] Failed to update quiz result visibility:", {
      id: id,
      error: error,
      errorCode: (error as any).code,
      errorMessage: (error as any).message
    });
    throw error;
  }
}

// DELETE: remove a result
export async function deleteQuizResult(id: string) {
  const ref = doc(db, RESULTS_COLLECTION, id);
  await deleteDoc(ref);
}