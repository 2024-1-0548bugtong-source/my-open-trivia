import type { Preferences } from "../types";
interface QuizPageProps {
    prefs: Preferences;
    addFavorite: (question: string, correctAnswer: string, category: string, difficulty: string) => void;
    addHistory?: (category: string, score: number) => void;
}
declare const QuizPage: ({ prefs, addFavorite, addHistory }: QuizPageProps) => import("react/jsx-runtime").JSX.Element;
export default QuizPage;
//# sourceMappingURL=QuizPage.d.ts.map