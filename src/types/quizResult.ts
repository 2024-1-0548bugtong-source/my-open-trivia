import { Timestamp } from "firebase/firestore";

export interface QuizResult {
  id: string;
  uid: string | null;   // Firebase auth uid for filtering user's own scores
  score: number;
  totalQuestions: number;
  percentage?: number; // Optional for backward compatibility
  nickname: string;
  category?: string;
  difficulty?: string;
  createdAt: Timestamp;
}

export interface QuizResultInput {
  score: number;
  totalQuestions: number;
  nickname?: string;
  category?: string;
}
