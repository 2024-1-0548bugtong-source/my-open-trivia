// src/pages/QuizPage.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Star, Loader, CheckCircle2, XCircle } from "lucide-react";
import type { Preferences } from "../types";

interface Question {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  category: string;
  difficulty: string;
}

interface QuizPageProps {
  prefs: Preferences;
  addFavorite: (question: string, correctAnswer: string, category: string, difficulty: string) => void;
  addHistory?: (category: string, score: number) => void;
}

const QuizPage = ({ prefs, addFavorite, addHistory }: QuizPageProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [favoriteAdded, setFavoriteAdded] = useState(false);

  const category = searchParams.get("category") || "";
  const difficulty = searchParams.get("difficulty") || "";
  const type = searchParams.get("type") || "";

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        let url = `https://opentdb.com/api.php?amount=${prefs.amount}&category=${category}`;
        if (difficulty) url += `&difficulty=${difficulty}`;
        if (type) url += `&type=${type}`;

        const res = await axios.get(url);
        setQuestions(res.data.results);
      } catch (err) {
        console.error("Error fetching questions", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [prefs.amount, category, difficulty, type]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <Loader className="mx-auto animate-spin text-primary mb-4" size={48} />
          <p className="text-muted font-semibold text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-destructive font-semibold text-lg mb-4">Failed to load questions</p>
          <button
            onClick={() => navigate("/categories")}
            className="px-6 py-3 rounded-lg font-semibold text-primary-foreground bg-primary hover:brightness-95 transition"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];
  const allAnswers = [current.correct_answer, ...current.incorrect_answers].sort(() => Math.random() - 0.5);
  // derived correctness used inline; no standalone var required
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelectAnswer = (answer: string) => {
    if (!isAnswered) {
      setSelectedAnswer(answer);
      setIsAnswered(true);
      if (answer === current.correct_answer) {
        setScore(score + 1);
      }
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      if (addHistory) addHistory(current.category, score);
      navigate("/dashboard", {
        state: { finalScore: score, totalQuestions: questions.length },
      });
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setFavoriteAdded(false);
    }
  };

  const handleAddFavorite = () => {
    addFavorite(current.question, current.correct_answer, current.category, current.difficulty);
    setFavoriteAdded(true);
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted font-semibold uppercase tracking-wide">
                Question {currentIndex + 1} of {questions.length}
              </p>
              <h2 className="text-3xl font-bold text-primary mt-1">{score}/{questions.length}</h2>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[rgba(255,255,255,0.03)] rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300 bg-primary"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-4 leading-relaxed">
            {current.question}
          </h3>

          {/* Answer buttons */}
          <div className="space-y-4">
            {allAnswers.map((answer) => {
              const isSelected = selectedAnswer === answer;
              const isAnswerCorrect = answer === current.correct_answer;
              const showCorrect = isAnswered && isAnswerCorrect;
              const showIncorrect = isAnswered && isSelected && !isAnswerCorrect;

              const baseClasses = 'w-full p-4 rounded-xl flex items-center gap-4 transition-all font-medium text-left border';
              const stateClasses = showCorrect
                ? 'bg-[rgba(34,197,94,0.12)] border-[rgba(34,197,94,0.35)] text-(--foreground)'
                : showIncorrect
                ? 'bg-[rgba(255,99,99,0.12)] border-[rgba(255,99,99,0.35)] text-(--foreground)'
                : isSelected
                ? 'bg-[rgba(20,184,166,0.12)] border-(--primary) text-(--foreground)'
                : 'bg-[rgba(255,255,255,0.02)] border-(--border) text-(--muted) hover:border-(--primary) hover:bg-[rgba(20,184,166,0.03)] cursor-pointer';

              return (
                <button
                  key={answer}
                  onClick={() => handleSelectAnswer(answer)}
                  disabled={isAnswered}
                  className={`${baseClasses} ${stateClasses} ${isAnswered && !isSelected && !isAnswerCorrect ? 'opacity-60' : ''}`}
                >
                  {showCorrect && <CheckCircle2 className="text-primary shrink-0" size={20} strokeWidth={2} />}
                  {showIncorrect && <XCircle className="text-destructive shrink-0" size={20} strokeWidth={2} />}
                  {!isAnswered && <div className="w-5 h-5 rounded-full border-2 border-current" />}
                  <span>{answer}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        {isAnswered && (
          <div className="flex gap-4">
            <button
              onClick={handleAddFavorite}
              className={`flex-1 p-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                favoriteAdded
                  ? "bg-linear-to-r from-green-400 to-green-500 text-white"
                  : "bg-linear-to-r from-yellow-400 to-yellow-500 text-blue-900 hover:shadow-lg transform hover:scale-105"
              }`}
            >
              <Star
                size={24}
                strokeWidth={2}
                fill={favoriteAdded ? "currentColor" : "none"}
              />
              {favoriteAdded ? "Added!" : "Save Question"}
            </button>
            <button
              onClick={handleNext}
              className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              {isLastQuestion ? "Finish Quiz" : "Next Question"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
