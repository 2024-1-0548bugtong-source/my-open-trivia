"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Check, X, RefreshCw, AlertCircle, Play, Settings2, Star, Trophy, Shield, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { createQuizResult } from "@/services/quizResults";
import { useUser, resolveNickname } from "@/context/UserContext";
import { auth } from "@/firebase";
import { TOTAL_QUESTIONS, QUESTION_TYPE, DIFFICULTY } from "@/lib/quizConstants";
import { fetchQuestionsWithFallback } from "@/api/opentdb";
import { Surface } from "@/components/ui/surface";
import { Panel } from "@/components/ui/panel";

// Fun emoji mapping for each Open Trivia DB category
const CATEGORY_EMOJI: Record<number, string> = {
  9: '🧠',   // General Knowledge
  10: '📚',  // Books
  11: '🎬',  // Film
  12: '🎵',  // Music
  13: '🎭',  // Musicals & Theatres
  14: '📺',  // Television
  15: '🎮',  // Video Games
  16: '🎲',  // Board Games
  17: '🔬',  // Science & Nature
  18: '💻',  // Computers
  19: '🧮',  // Mathematics
  20: '📖',  // Mythology
  21: '⚽',  // Sports
  22: '🌍',  // Geography
  23: '📜',  // History
  24: '🏛️',  // Politics
  25: '🎨',  // Art
  26: '👑',  // Celebrities
  27: '🐾',  // Animals
  28: '🚗',  // Vehicles
  29: '🦸',  // Comics
  30: '📱',  // Gadgets
  31: '🍣',  // Japanese Anime & Manga
  32: '✏️',  // Cartoon & Animations
};

const CATEGORY_COLORS: Record<number, string> = {
  9:  'from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/20 hover:from-violet-100 hover:to-purple-100 dark:hover:from-violet-950/50 dark:hover:to-purple-950/40',
  10: 'from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/20 hover:from-sky-100 hover:to-blue-100 dark:hover:from-sky-950/50 dark:hover:to-blue-950/40',
  11: 'from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20 hover:from-rose-100 hover:to-pink-100 dark:hover:from-rose-950/50 dark:hover:to-pink-950/40',
  12: 'from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/30 dark:to-pink-950/20 hover:from-fuchsia-100 hover:to-pink-100 dark:hover:from-fuchsia-950/50 dark:hover:to-pink-950/40',
  13: 'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 hover:from-amber-100 hover:to-yellow-100 dark:hover:from-amber-950/50 dark:hover:to-yellow-950/40',
  14: 'from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/20 hover:from-teal-100 hover:to-emerald-100 dark:hover:from-teal-950/50 dark:hover:to-emerald-950/40',
  15: 'from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/20 hover:from-indigo-100 hover:to-violet-100 dark:hover:from-indigo-950/50 dark:hover:to-violet-950/40',
  16: 'from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-950/50 dark:hover:to-amber-950/40',
  17: 'from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-950/50 dark:hover:to-green-950/40',
  18: 'from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/20 hover:from-cyan-100 hover:to-sky-100 dark:hover:from-cyan-950/50 dark:hover:to-sky-950/40',
  19: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-950/50 dark:hover:to-indigo-950/40',
  20: 'from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/20 hover:from-purple-100 hover:to-fuchsia-100 dark:hover:from-purple-950/50 dark:hover:to-fuchsia-950/40',
  21: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-950/50 dark:hover:to-emerald-950/40',
  22: 'from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/20 hover:from-teal-100 hover:to-cyan-100 dark:hover:from-teal-950/50 dark:hover:to-cyan-950/40',
  23: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-950/50 dark:hover:to-orange-950/40',
  24: 'from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/20 hover:from-slate-100 hover:to-gray-100 dark:hover:from-slate-950/50 dark:hover:to-gray-950/40',
  25: 'from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/20 hover:from-pink-100 hover:to-rose-100 dark:hover:from-pink-950/50 dark:hover:to-rose-950/40',
  26: 'from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/20 hover:from-yellow-100 hover:to-amber-100 dark:hover:from-yellow-950/50 dark:hover:to-amber-950/40',
  27: 'from-lime-50 to-green-50 dark:from-lime-950/30 dark:to-green-950/20 hover:from-lime-100 hover:to-green-100 dark:hover:from-lime-950/50 dark:hover:to-green-950/40',
  28: 'from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20 hover:from-red-100 hover:to-orange-100 dark:hover:from-red-950/50 dark:hover:to-orange-950/40',
  29: 'from-sky-50 to-indigo-50 dark:from-sky-950/30 dark:to-indigo-950/20 hover:from-sky-100 hover:to-indigo-100 dark:hover:from-sky-950/50 dark:hover:to-indigo-950/40',
  30: 'from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/20 hover:from-gray-100 hover:to-slate-100 dark:hover:from-gray-950/50 dark:hover:to-slate-950/40',
  31: 'from-rose-50 to-fuchsia-50 dark:from-rose-950/30 dark:to-fuchsia-950/20 hover:from-rose-100 hover:to-fuchsia-100 dark:hover:from-rose-950/50 dark:hover:to-fuchsia-950/40',
  32: 'from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/20 hover:from-orange-100 hover:to-yellow-100 dark:hover:from-orange-950/50 dark:hover:to-yellow-950/40',
};

const DEFAULT_GRADIENT = 'from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/20 hover:from-slate-100 hover:to-gray-100 dark:hover:from-slate-950/50 dark:hover:to-gray-950/40';

interface Category {
  id: number;
  name: string;
}

interface TriviaQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

type Difficulty = 'any' | 'easy' | 'medium' | 'hard' | 'randomized';
type QuestionType = 'any' | 'multiple' | 'boolean' | 'mixed';

const DAILY_CHALLENGE_SECONDS = 90; // 1.5 minutes to answer the daily challenge

export default function Categories() {
  const user = useUser();
  const nickname = user?.nickname;
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [favoriteCategories, setFavoriteCategories] = useState<number[]>([]);
  const [isDailyMode, setIsDailyMode] = useState(false);
  const [dailyTimeLeft, setDailyTimeLeft] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  
  // Quiz Configuration (standardized for leaderboard fairness)
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTY);
  const [questionType, setQuestionType] = useState<QuestionType>(QUESTION_TYPE);
  const [amount, setAmount] = useState<number>(TOTAL_QUESTIONS);
  const [view, setView] = useState<'list' | 'config' | 'quiz'>('list');

  // Quiz Progress State
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0); // Track current score to avoid stale closures
  const hasSavedRef = useRef(false); // Prevent duplicate Firestore saves
  const [answeredCount, setAnsweredCount] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isFetching, setIsFetching] = useState(false); // Request guard to prevent duplicate requests
  const { toast } = useToast();

  // Initialize favorites from local storage
  useEffect(() => {
    const storedFavs: number[] = JSON.parse(localStorage.getItem('fav_categories') || '[]');
    setFavoriteCategories(storedFavs);
  }, []);

  const toggleCategoryFavorite = (e: React.MouseEvent, catId: number) => {
    e.stopPropagation();
    let newFavs;
    if (favoriteCategories.includes(catId)) {
      newFavs = favoriteCategories.filter(id => id !== catId);
      toast({ description: "Category removed from favorites" });
    } else {
      newFavs = [...favoriteCategories, catId];
      toast({ description: "Category added to favorites" });
    }
    setFavoriteCategories(newFavs);
    localStorage.setItem('fav_categories', JSON.stringify(newFavs));
  };

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://opentdb.com/api_category.php');
        setCategories(response.data.trivia_categories);
        
        // Check for URL params (Daily Challenge or direct category link)
        const params = new URLSearchParams(window.location.search);
        const daily = params.get('daily');
        const catId = params.get('cat');

        if (daily === 'true') {
          setIsDailyMode(true);
        }

        if (catId) {
          const cat = response.data.trivia_categories.find((c: any) => c.id === parseInt(catId));
          if (cat) {
            setSelectedCategory(cat);
            setView('config');
            // user will manually start the quiz; timer activates once quiz view loads
          }
        }

      } catch (error) {
        console.error("Failed to fetch categories", error);
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [toast]);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setView('config');
  };

  const saveHistory = (categoryName: string, finalScore: number, total: number, quizResultId?: string) => {
    const historyItem = {
      category: categoryName,
      score: finalScore,
      total: total,
      date: new Date().toISOString(),
      quizResultId: quizResultId || null, // Store the leaderboard entry ID for privacy control
    };

    const existingHistory: any[] = JSON.parse(localStorage.getItem('quiz_history') || '[]');
    const newHistory = [historyItem, ...existingHistory].slice(0, 20); // Keep last 20
    localStorage.setItem('quiz_history', JSON.stringify(newHistory));
  };

  // Watch for quiz completion
  const finalizeQuiz = useCallback(() => {
    if (quizFinished) return;
    setQuizFinished(true);
    setShowScoreModal(true);
    
    if (selectedCategory && questions.length > 0) {
      // Use scoreRef to get the ACTUAL current score (not stale closure value)
      const finalScore = scoreRef.current;
      const totalQuestions = questions.length;
      const categoryName = selectedCategory.name;
      const currentNickname = nickname || "Guest";
      
      // SINGLE SAVE STRATEGY: Only save to Firestore once per attempt
      if (!hasSavedRef.current) {
        hasSavedRef.current = true; // Mark as saved to prevent duplicates
        
        // FAIRNESS CHECK: Only save if question count matches standardized rules
        if (totalQuestions !== TOTAL_QUESTIONS) {
          console.warn(
            `[FAIRNESS] Quiz has ${totalQuestions} questions but leaderboard requires ${TOTAL_QUESTIONS}. ` +
            `Not saving to leaderboard. This can happen if the API returns fewer questions than requested.`
          );
          toast({
            title: "Quiz Complete",
            description: `${totalQuestions} questions received (expected ${TOTAL_QUESTIONS}). Not saved to leaderboard due to fairness rules. Try again!`,
            variant: "default"
          });
          return;
        }
        
        console.log("[SAVE] Saving quiz result to Firestore:", {
          score: finalScore,
          totalQuestions: TOTAL_QUESTIONS,
          nickname: currentNickname,
          category: categoryName,
          difficulty: DIFFICULTY,
          type: QUESTION_TYPE,
          percentage: ((finalScore / TOTAL_QUESTIONS) * 100).toFixed(1),
          timestamp: new Date().toISOString()
        });
        
        const uid = auth.currentUser?.uid || undefined;
        
        createQuizResult({
          score: finalScore,
          totalQuestions: TOTAL_QUESTIONS,
          nickname: currentNickname, // Use logged-in nickname from context
          category: categoryName,     // Quiz category name
          categoryId: selectedCategory.id, // Quiz category ID for replay functionality
          uid: uid,                   // Firebase auth uid for filtering user's scores
        }).then((result) => {
          // Save history with the quiz result ID for privacy control
          saveHistory(categoryName, finalScore, totalQuestions, result.id);
        }).catch((err) => {
          console.error("[ERROR] Failed to save quiz result to Firestore:", err);
          hasSavedRef.current = false; // Reset on error to allow retry
          // Still save history even if leaderboard save fails
          saveHistory(categoryName, finalScore, totalQuestions);
        });
      } else {
        console.warn("[SKIP] Quiz result already saved, preventing duplicate save");
      }
    }
  }, [quizFinished, selectedCategory, questions.length, nickname, answeredCount, score]);

  useEffect(() => {
    if (quizFinished) return;
    if (questions.length > 0 && answeredCount === questions.length) {
      const timer = setTimeout(() => {
        finalizeQuiz();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [answeredCount, questions.length, finalizeQuiz, quizFinished]);

  useEffect(() => {
    if (!isDailyMode || view !== 'quiz' || quizFinished) return;
    if (dailyTimeLeft === 0) {
      finalizeQuiz();
    }
  }, [dailyTimeLeft, isDailyMode, view, quizFinished, finalizeQuiz]);

  useEffect(() => {
    if (!isDailyMode || view !== 'quiz' || quizFinished) {
      return;
    }
    setDailyTimeLeft((prev) => (prev === null ? DAILY_CHALLENGE_SECONDS : prev));
    const interval = window.setInterval(() => {
      setDailyTimeLeft((prev) => {
        if (prev === null) return prev;
        return prev <= 1 ? 0 : prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isDailyMode, view, quizFinished]);


  const handleStartQuiz = async () => {
    if (!selectedCategory || isFetching) return;
    
    console.log("[RESET] Starting new quiz, resetting all state");
    
    setIsFetching(true); // Prevent duplicate requests
    setIsLoadingQuestions(true);
    setQuestions([]); 
    setScore(0);
    scoreRef.current = 0; // Reset ref when starting new quiz
    hasSavedRef.current = false; // Reset save flag for new attempt
    setAnsweredCount(0);
    setShowScoreModal(false);
    setQuizFinished(false);
    setDailyTimeLeft(isDailyMode ? DAILY_CHALLENGE_SECONDS : null);

    try {
      // Use the new API with fallback logic and no difficulty/type filters
      const fetchedQuestions = await fetchQuestionsWithFallback({
        amount: TOTAL_QUESTIONS,
        category: selectedCategory.id
        // No difficulty or type filters for better availability
      });
      
      if (fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions);
        setView('quiz');
        
        // Show friendly message if we had to use fallback
        if (fetchedQuestions.length < TOTAL_QUESTIONS) {
          toast({
            title: "Quiz Started",
            description: `This category has limited questions. We found ${fetchedQuestions.length} questions for you.`,
            variant: "default"
          });
        }
      } else {
        throw new Error("No questions available");
      }
      
    } catch (error: any) {
      console.error("Failed to fetch questions", error);
      
      if (error.message.includes('Too many requests')) {
        toast({
          title: "Rate Limited",
          description: "Too many requests. Please wait a moment and try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load questions. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoadingQuestions(false);
      setIsFetching(false); // Re-enable requests
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(s => s + 1);
      scoreRef.current += 1; // Keep ref in sync
    }
    setAnsweredCount(c => c + 1);
  };

  const handleBackToList = () => {
    console.log("[RESET] Returning to category list, resetting quiz state");
    setSelectedCategory(null);
    setView('list');
    setQuestions([]);
    setScore(0);
    scoreRef.current = 0;
    hasSavedRef.current = false; // Reset save flag for next attempt
    setAnsweredCount(0);
    setShowScoreModal(false);
    setQuizFinished(false);
    setDailyTimeLeft(null);
  };

  const handleBackToConfig = () => {
    console.log("[RESET] Returning to config, resetting quiz state");
    setView('config');
    setQuestions([]);
    setScore(0);
    scoreRef.current = 0;
    hasSavedRef.current = false; // Reset save flag for next attempt
    setAnsweredCount(0);
    setShowScoreModal(false);
    setQuizFinished(false);
    setDailyTimeLeft(isDailyMode ? DAILY_CHALLENGE_SECONDS : null);
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 }
  };

  // Sort categories: Favorites first
  const sortedCategories = [...categories].sort((a, b) => {
    const aFav = favoriteCategories.includes(a.id);
    const bFav = favoriteCategories.includes(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  return (
    <Surface variant="page">
      <div className="max-w-6xl mx-auto px-6 py-8">
      <AnimatePresence mode="wait">
        {/* VIEW: CATEGORY LIST */}
        {view === 'list' && (
          <motion.div
            key="categories-list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {/* Page header */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/30 shadow-sm ring-1 ring-violet-200/60 dark:ring-violet-700/40">
                  <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" strokeWidth={2} />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Pick a Category</h1>
              </div>
              <p className="text-muted-foreground text-sm ml-13">Choose a topic and test your knowledge — favorites are pinned to the top.</p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-2xl" />
                ))}
              </div>
            ) : (
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {sortedCategories.map((cat) => {
                  const isFav = favoriteCategories.includes(cat.id);
                  const emoji = CATEGORY_EMOJI[cat.id] || '❓';
                  const gradient = CATEGORY_COLORS[cat.id] || DEFAULT_GRADIENT;

                  return (
                    <motion.div key={cat.id} variants={item}>
                      <div
                        className="relative group cursor-pointer"
                        onClick={() => handleCategorySelect(cat)}
                      >
                        <div
                          className={cn(
                            "flex flex-col items-center justify-center gap-2.5 h-32 rounded-2xl border transition-all duration-200 px-4 py-5",
                            "bg-linear-to-br shadow-sm",
                            gradient,
                            isFav
                              ? "border-violet-300 dark:border-violet-600 ring-2 ring-violet-200/50 dark:ring-violet-700/30"
                              : "border-border hover:border-violet-300 dark:hover:border-violet-600",
                            "hover:shadow-md hover:-translate-y-0.5"
                          )}
                        >
                          <span className="text-3xl leading-none select-none" role="img" aria-label={cat.name}>
                            {emoji}
                          </span>
                          <span className="text-sm font-semibold text-foreground text-center leading-tight line-clamp-2">
                            {cat.name}
                          </span>
                        </div>

                        {/* Favorite star */}
                        <button
                          className={cn(
                            "absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-150",
                            isFav
                              ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 shadow-sm"
                              : "text-muted-foreground/30 hover:text-yellow-500 hover:bg-yellow-50/80 dark:hover:bg-yellow-900/20"
                          )}
                          onClick={(e) => toggleCategoryFavorite(e, cat.id)}
                          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Star className={cn("w-3.5 h-3.5", isFav && "fill-current")} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* VIEW: CONFIGURATION */}
        {view === 'config' && selectedCategory && (
          <motion.div
            key="config-view"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center py-8"
          >
            <Card className="w-full max-w-md rounded-2xl border border-border shadow-lg dark:shadow-none overflow-hidden">
              {/* Decorative header band */}
              <div className={cn(
                "h-28 bg-linear-to-br flex items-center justify-center relative",
                CATEGORY_COLORS[selectedCategory.id] || DEFAULT_GRADIENT
              )}>
                <span className="text-5xl select-none" role="img" aria-label={selectedCategory.name}>
                  {CATEGORY_EMOJI[selectedCategory.id] || '❓'}
                </span>
                <button
                  onClick={handleBackToList}
                  className="absolute top-3 left-3 flex items-center gap-1.5 text-xs font-medium text-foreground/60 hover:text-foreground bg-white/70 dark:bg-black/30 backdrop-blur-sm rounded-lg px-2.5 py-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>

              <CardHeader className="text-center pb-2 pt-5">
                <CardTitle className="text-2xl font-bold text-foreground">{selectedCategory.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Ready to test your knowledge?</p>
              </CardHeader>
              <CardContent className="space-y-5 pt-4 px-6">
                <Panel variant="info" icon={Shield} title="Leaderboard Rules">
                  All leaderboard attempts use standardized settings:<br/>
                  <strong>{TOTAL_QUESTIONS} questions</strong> • <strong>Multiple Choice</strong> • <strong>Medium difficulty</strong>
                </Panel>
              </CardContent>
              <CardFooter className="pt-2 pb-7 px-6">
                <Button 
                  size="lg" 
                  className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5" 
                  onClick={handleStartQuiz}
                  disabled={isLoadingQuestions || isFetching}
                >
                  {isLoadingQuestions ? (
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-5 h-5 mr-2 fill-current" />
                  )}
                  {isLoadingQuestions ? "Loading Questions..." : "Start Quiz"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {/* VIEW: QUIZ QUESTIONS */}
        {view === 'quiz' && (
          <motion.div
            key="questions-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-4 mb-8 sticky top-0 bg-background/80 backdrop-blur-md z-20 py-4 -mx-6 px-6 border-b border-border">
              <button onClick={handleBackToConfig} className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex-1 flex items-center gap-2.5">
                <span className="text-xl leading-none select-none">{CATEGORY_EMOJI[selectedCategory?.id || 0] || '❓'}</span>
                <h1 className="text-lg font-bold text-foreground truncate">
                  {selectedCategory?.name}
                </h1>
                <Badge variant="secondary" className="text-[11px] font-medium shrink-0">{questions.length} Qs</Badge>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">Score</span>
                  <span className="text-lg font-bold text-primary tabular-nums">{score}/{questions.length}</span>
                </div>
              </div>
              {isDailyMode && (
                <div className="text-right ml-4">
                  <span className="text-sm font-medium text-muted-foreground block">Time Left</span>
                  <span className={cn("text-xl font-mono", (dailyTimeLeft ?? 0) <= 10 ? "text-red-500" : "text-primary")}>{formatSeconds(dailyTimeLeft)}</span>
                </div>
              )}
            </div>

            {questions.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                 <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700/40">
                   <AlertCircle className="w-7 h-7 text-slate-500 dark:text-slate-400" />
                 </div>
                 <h3 className="text-lg font-semibold text-foreground">No questions found</h3>
                 <p className="text-sm text-muted-foreground max-w-xs">Try adjusting your filters or selecting a different category.</p>
                 <Button onClick={handleBackToConfig} variant="outline" className="rounded-xl">Adjust Settings</Button>
               </div>
            ) : (
              <div className="space-y-6 pb-20">
                {questions.map((q, idx) => (
                  <TriviaCard 
                    key={idx} 
                    question={q} 
                    index={idx} 
                    onAnswer={handleAnswer}
                    disabled={isDailyMode && (dailyTimeLeft === 0)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* SCORE DIALOG */}
      <Dialog open={showScoreModal} onOpenChange={setShowScoreModal}>
        <DialogContent className="sm:max-w-md text-center rounded-2xl">
          <DialogHeader>
            <div className="mx-auto w-20 h-20 bg-linear-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/20 rounded-2xl flex items-center justify-center mb-4 shadow-sm ring-1 ring-amber-200/60 dark:ring-amber-700/40">
              <Trophy className="w-9 h-9 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">Quiz Completed!</DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              Here&apos;s how you did
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <span className="text-6xl font-black text-primary block mb-1 tabular-nums">{score}</span>
            <span className="text-sm text-muted-foreground">out of {questions.length} questions</span>
            {questions.length > 0 && (
              <div className="mt-4">
                <span className={cn(
                  "inline-flex items-center rounded-full px-3.5 py-1 text-sm font-semibold ring-1 ring-inset",
                  (score / questions.length) >= 0.7
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200/60 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-700/40"
                    : (score / questions.length) >= 0.4
                      ? "bg-amber-50 text-amber-700 ring-amber-200/60 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-700/40"
                      : "bg-rose-50 text-rose-700 ring-rose-200/60 dark:bg-rose-900/20 dark:text-rose-300 dark:ring-rose-700/40"
                )}>
                  {Math.round((score / questions.length) * 100)}%
                </span>
              </div>
            )}
          </div>
          <DialogFooter className="sm:justify-center gap-3">
            <Button variant="outline" onClick={handleBackToConfig} className="rounded-xl">Try Again</Button>
            <Button onClick={handleBackToList} className="rounded-xl">New Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Surface>
  );
}

function TriviaCard({ question, index, onAnswer, disabled = false }: { question: TriviaQuestion; index: number, onAnswer: (isCorrect: boolean) => void, disabled?: boolean }) {
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();
  
  // Shuffle options only once on mount
  const [options] = useState(() => {
    const allOptions = [...question.incorrect_answers, question.correct_answer];
    return allOptions.sort(() => Math.random() - 0.5);
  });

  // Check if favorite on mount
  useEffect(() => {
    const favorites: TriviaQuestion[] = JSON.parse(localStorage.getItem('trivia_favorites') || '[]');
    const exists = favorites.some((f: TriviaQuestion) => f.question === question.question);
    setIsFavorite(exists);
  }, [question]);

  const toggleFavorite = () => {
    const favorites: TriviaQuestion[] = JSON.parse(localStorage.getItem('trivia_favorites') || '[]');
    
    if (isFavorite) {
      const newFavorites = favorites.filter((f: TriviaQuestion) => f.question !== question.question);
      localStorage.setItem('trivia_favorites', JSON.stringify(newFavorites));
      setIsFavorite(false);
      toast({ description: "Removed from favorites" });
    } else {
      localStorage.setItem('trivia_favorites', JSON.stringify([...favorites, question]));
      setIsFavorite(true);
      toast({ description: "Added to favorites" });
    }
  };

  const handleSelect = (option: string) => {
    if (answered || disabled) return;
    setSelectedOption(option);
    setAnswered(true);
    onAnswer(option === question.correct_answer);
  };

  const isCorrect = (option: string) => option === question.correct_answer;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200 relative group">
        {/* Favorite button */}
        <button
          className={cn(
            "absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150",
            isFavorite
              ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 shadow-sm"
              : "text-muted-foreground/25 hover:text-yellow-500 hover:bg-yellow-50/80 dark:hover:bg-yellow-900/20"
          )}
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star className={cn("w-4 h-4", isFavorite && "fill-current")} />
        </button>

        <CardHeader className="pb-3 pr-14">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className={cn(
              "text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ring-1 ring-inset",
              question.difficulty === 'hard' && "ring-red-200/60 text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 dark:ring-red-800/40",
              question.difficulty === 'medium' && "ring-amber-200/60 text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 dark:ring-amber-800/40",
              question.difficulty === 'easy' && "ring-emerald-200/60 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:ring-emerald-800/40",
            )}>
              {question.difficulty}
            </Badge>
            <span className="text-[11px] font-medium text-muted-foreground/60 tabular-nums">Q{index + 1}</span>
          </div>
          <CardTitle 
            className="text-lg leading-relaxed font-medium text-foreground"
            dangerouslySetInnerHTML={{ __html: question.question }} 
          />
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <div className={cn(
            "grid gap-2.5",
            question.type === 'boolean' ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2"
          )}>
            {options.map((option, optIdx) => {
              const base = "justify-start text-left h-auto py-3 px-4 text-sm font-normal rounded-xl border transition-all duration-150";
              let optionClass = base + " hover:bg-accent/40 hover:border-border";
              
              if (answered) {
                if (isCorrect(option)) {
                  optionClass = base + " bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800 ring-1 ring-emerald-200/60 dark:ring-emerald-700/40";
                } else if (selectedOption === option) {
                  optionClass = base + " bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 ring-1 ring-red-200/60 dark:ring-red-700/40";
                } else {
                  optionClass = base + " opacity-35";
                }
              }

              return (
                <Button
                  key={optIdx}
                  variant="outline"
                  className={optionClass}
                  onClick={() => handleSelect(option)}
                  disabled={answered || disabled}
                >
                  <div className="flex items-center w-full gap-3">
                    {question.type !== 'boolean' && (
                      <div className="shrink-0 w-6 h-6 rounded-lg bg-muted/60 flex items-center justify-center text-[11px] font-semibold text-muted-foreground">
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                    )}
                    <span className="grow" dangerouslySetInnerHTML={{ __html: option }} />
                    {answered && isCorrect(option) && (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 ml-auto shrink-0" />
                    )}
                    {answered && selectedOption === option && !isCorrect(option) && (
                      <X className="w-4 h-4 text-red-600 dark:text-red-400 ml-auto shrink-0" />
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function formatSeconds(value: number | null) {
  if (value === null) return '--:--';
  const minutes = Math.floor(value / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (value % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}
