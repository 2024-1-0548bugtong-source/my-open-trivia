import { Timestamp } from "firebase/firestore";

export interface QuizResult {
  id: string;
  uid: string | null;   // Firebase auth uid for filtering user's own scores
  score: number;
  totalQuestions: number;
  accuracy?: number;    // Added: Percentage score (matches admin query)
  percentage?: number; // Optional for backward compatibility
  nicknameSnapshot?: string; // Added: Nickname snapshot (matches admin query)
  nickname: string;     // Keep for backward compatibility
  categoryName?: string; // Added: Category name (matches admin query)
  category?: string;    // Keep for backward compatibility
  categoryId?: number; // Quiz category ID for replay functionality
  difficulty?: string;
  createdAt: Timestamp;
  hidden?: boolean; // Privacy feature: hide from public leaderboard
}

export interface QuizResultInput {
  score: number;
  totalQuestions: number;
  nickname?: string;
  category?: string;
}
