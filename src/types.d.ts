export interface Question {
    category: string;
    type: 'multiple' | 'boolean';
    difficulty: string;
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
}
export interface QuizHistoryEntry {
    date: number;
    category: string;
    score: number;
}
export interface Preferences {
    amount: number;
    difficulty?: string;
    type?: string;
    theme?: 'light' | 'dark';
}
export interface FavoriteQuestion {
    id: string;
    question: string;
    correctAnswer: string;
    category: string;
    difficulty: string;
}
//# sourceMappingURL=types.d.ts.map