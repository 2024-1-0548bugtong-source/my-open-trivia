import { Timestamp } from "firebase/firestore";

export interface QuizResult {
  id: string;
  score: number;
  totalQuestions: number;
  percentage?: number; // Optional for backward compatibility
  nickname: string;
  category?: string;
  createdAt: Timestamp;
}

export interface QuizResultInput {
  score: number;
  totalQuestions: number;
  nickname?: string;
  category?: string;
}
