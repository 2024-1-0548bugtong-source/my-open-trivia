// src/types.ts

// A single trivia question
export interface Question {
  category: string;
  type: 'multiple' | 'boolean';
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

// History entry for quiz attempts
export interface QuizHistoryEntry {
  date: number;
  category: string;
  score: number;
}

// User preferences
export interface Preferences {
  amount: number;
  difficulty?: string;
  type?: string;
  theme?: 'light' | 'dark';
}


// Favorite question for saved items
export interface FavoriteQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  category: string;
  difficulty: string;
}
