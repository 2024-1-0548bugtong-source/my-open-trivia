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
import { ArrowLeft, Check, X, RefreshCw, AlertCircle, Play, Settings2, Star, Trophy, Shield } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { createQuizResult } from "@/services/quizResults";
import { useUser } from "@/context/UserContext";
import { TOTAL_QUESTIONS, QUESTION_TYPE, DIFFICULTY } from "@/lib/quizConstants";

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

type Difficulty = 'any' | 'easy' | 'medium' | 'hard';
type QuestionType = 'any' | 'multiple' | 'boolean';

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
  const { toast } = useToast();

  // Initialize favorites from local storage
  useEffect(() => {
    const storedFavs = JSON.parse(localStorage.getItem('fav_categories') || '[]');
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

  const saveHistory = (categoryName: string, finalScore: number, total: number) => {
    const historyItem = {
      category: categoryName,
      score: finalScore,
      total: total,
      date: new Date().toISOString(),
    };

    const existingHistory = JSON.parse(localStorage.getItem('quiz_history') || '[]');
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
      
      // Save to localStorage history
      saveHistory(categoryName, finalScore, totalQuestions);
      
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
        
        createQuizResult({
          score: finalScore,
          totalQuestions: TOTAL_QUESTIONS,
          nickname: currentNickname, // Use logged-in nickname from context
          category: categoryName,     // Quiz category name
        }).catch((err) => {
          console.error("[ERROR] Failed to save quiz result to Firestore:", err);
          hasSavedRef.current = false; // Reset on error to allow retry
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
    if (!selectedCategory) return;
    
    console.log("[RESET] Starting new quiz, resetting all state");
    
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
      let url = `https://opentdb.com/api.php?amount=${TOTAL_QUESTIONS}&category=${selectedCategory.id}`;
      
      // Always use standardized difficulty and type for leaderboard fairness
      url += `&difficulty=${DIFFICULTY}`;
      url += `&type=${QUESTION_TYPE}`;

      const response = await axios.get(url);
      
      if (response.data.response_code === 0) {
        setQuestions(response.data.results);
        setView('quiz');
      } else {
        let errorMessage = "Could not find enough questions for these settings.";
        if (response.data.response_code === 1) errorMessage = "Not enough questions available for your specific query.";
        
        toast({
          title: "Warning",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to fetch questions", error);
      toast({
        title: "Error",
        description: "Failed to load questions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingQuestions(false);
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
    <div className="p-6 max-w-5xl mx-auto h-full flex flex-col">
      <AnimatePresence mode="wait">
        {/* VIEW: CATEGORY LIST */}
        {view === 'list' && (
          <motion.div
            key="categories-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Trivia Categories</h1>
              <p className="text-muted-foreground">Select a topic to start configuring your quiz.</p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : (
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {sortedCategories.map((cat) => (
                  <motion.div key={cat.id} variants={item}>
                    <div 
                      className="relative group"
                      onClick={() => handleCategorySelect(cat)}
                    >
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-24 text-lg font-medium whitespace-normal text-center hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-300 shadow-sm relative",
                          favoriteCategories.includes(cat.id) && "border-primary/50 bg-primary/5"
                        )}
                      >
                        {cat.name}
                      </Button>
                      <div 
                        className="absolute top-2 right-2 z-10 cursor-pointer p-1 rounded-full hover:bg-background/80 text-muted-foreground/40 hover:text-yellow-500 transition-colors"
                        onClick={(e) => toggleCategoryFavorite(e, cat.id)}
                      >
                        <Star className={cn("w-4 h-4", favoriteCategories.includes(cat.id) ? "fill-yellow-400 text-yellow-400" : "")} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* VIEW: CONFIGURATION */}
        {view === 'config' && selectedCategory && (
          <motion.div
            key="config-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center justify-center py-12"
          >
            <Card className="w-full max-w-md border-2 shadow-xl">
              <CardHeader className="text-center pb-2">
                <div className="flex justify-start w-full mb-4">
                  <Button variant="ghost" size="sm" onClick={handleBackToList} className="text-muted-foreground">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Categories
                  </Button>
                </div>
                <CardTitle className="text-2xl font-bold text-primary">{selectedCategory.name}</CardTitle>
                <p className="text-muted-foreground">Customize your quiz settings</p>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Leaderboard Rules</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      All leaderboard attempts use standardized settings:<br/>
                      <strong>{TOTAL_QUESTIONS} questions</strong> • <strong>Multiple Choice</strong> • <strong>Medium difficulty</strong>
                    </p>
                  </div>
                </div>

              </CardContent>
              <CardFooter className="pt-2 pb-8 px-6">
                <Button 
                  size="lg" 
                  className="w-full text-lg font-semibold shadow-lg shadow-primary/25" 
                  onClick={handleStartQuiz}
                  disabled={isLoadingQuestions}
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 mb-6 sticky top-0 bg-background/80 backdrop-blur-md z-20 py-4 border-b">
              <Button variant="ghost" size="icon" onClick={handleBackToConfig} className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl font-bold flex flex-wrap items-center gap-2">
                  {selectedCategory?.name}
                  <Badge variant="secondary" className="ml-2">{questions.length} Qs</Badge>
                </h1>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-muted-foreground block">Score</span>
                <span className="text-xl font-bold text-primary">{score} / {questions.length}</span>
              </div>
              {isDailyMode && (
                <div className="text-right ml-4">
                  <span className="text-sm font-medium text-muted-foreground block">Time Left</span>
                  <span className={cn("text-xl font-mono", (dailyTimeLeft ?? 0) <= 10 ? "text-red-500" : "text-primary")}>{formatSeconds(dailyTimeLeft)}</span>
                </div>
              )}
            </div>

            {questions.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                 <div className="bg-muted p-4 rounded-full">
                   <AlertCircle className="w-8 h-8 text-muted-foreground" />
                 </div>
                 <h3 className="text-lg font-medium">No questions found</h3>
                 <p className="text-muted-foreground">Try adjusting your filters or selecting a different category.</p>
                 <Button onClick={handleBackToConfig}>Adjust Settings</Button>
               </div>
            ) : (
              <div className="space-y-8 pb-20">
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

      {/* SCORE DIALOG */}
      <Dialog open={showScoreModal} onOpenChange={setShowScoreModal}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">Quiz Completed!</DialogTitle>
            <DialogDescription className="text-center text-lg">
              You scored
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <span className="text-6xl font-black text-primary block mb-2">{score}</span>
            <span className="text-muted-foreground">out of {questions.length}</span>
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <Button variant="outline" onClick={handleBackToConfig}>Try Again</Button>
            <Button onClick={handleBackToList}>Choose New Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
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
    const favorites = JSON.parse(localStorage.getItem('trivia_favorites') || '[]');
    const exists = favorites.some((f: TriviaQuestion) => f.question === question.question);
    setIsFavorite(exists);
  }, [question]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('trivia_favorites') || '[]');
    
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
      <Card className="overflow-hidden border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow relative group">
        <div className="absolute top-4 right-4 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("rounded-full hover:bg-background/80", isFavorite ? "text-yellow-500" : "text-muted-foreground/30 hover:text-yellow-500")}
            onClick={toggleFavorite}
          >
            <Star className={cn("w-5 h-5", isFavorite && "fill-current")} />
          </Button>
        </div>

        <CardHeader className="pb-2 pr-12">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className={cn(
              "text-xs uppercase tracking-wider opacity-70",
              question.difficulty === 'hard' && "border-red-200 text-red-700 bg-red-50 dark:bg-red-950/30 dark:text-red-400",
              question.difficulty === 'medium' && "border-yellow-200 text-yellow-700 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400",
              question.difficulty === 'easy' && "border-green-200 text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-400",
            )}>
              {question.difficulty}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">Q{index + 1}</span>
          </div>
          <CardTitle 
            className="text-xl leading-relaxed font-medium"
            dangerouslySetInnerHTML={{ __html: question.question }} 
          />
        </CardHeader>
        <CardContent className="pt-4">
          <div className={cn(
            "grid gap-3",
            question.type === 'boolean' ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2"
          )}>
            {options.map((option, optIdx) => {
              let className = "justify-start text-left h-auto py-3 px-4 text-base font-normal hover:bg-accent/50 transition-colors";
              
              if (answered) {
                if (isCorrect(option)) {
                  className += " bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 hover:bg-green-100 opacity-100";
                } else if (selectedOption === option) {
                  className += " bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 hover:bg-red-100 opacity-100";
                } else {
                  className += " opacity-40";
                }
              }

              return (
                <Button
                  key={optIdx}
                  variant="outline"
                  className={className}
                  onClick={() => handleSelect(option)}
                  disabled={answered || disabled}
                >
                  <div className="flex items-center w-full gap-3">
                    {question.type !== 'boolean' && (
                      <div className="shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs text-muted-foreground">
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                    )}
                    <span className="grow" dangerouslySetInnerHTML={{ __html: option }} />
                    {answered && isCorrect(option) && (
                      <Check className="w-4 h-4 text-green-600 ml-auto" />
                    )}
                    {answered && selectedOption === option && !isCorrect(option) && (
                      <X className="w-4 h-4 text-red-600 ml-auto" />
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
