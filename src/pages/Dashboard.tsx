"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, BookOpen, Trophy, Clock, CalendarDays, Sparkles, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";

function DidYouKnow() {
  const facts = [
    {
      id: 1,
      text: "The hashtag symbol (#) is technically called an octothorpe.",
      isTrue: true,
      explanation: "The name 'octothorpe' dates back to the 1960s; other names include pound sign, number sign, and hash.",
    },
    {
      id: 2,
      text: "Honey never spoils — edible honey was found in ancient Egyptian tombs.",
      isTrue: true,
      explanation: "Because of its low water content and acidic pH, honey can remain stable for very long periods.",
    },
    {
      id: 3,
      text: "A group of flamingos is called a 'fluffle'.",
      isTrue: false,
      explanation: "Common group names include 'flamboyance' or simply a 'group' — 'fluffle' is a recent whimsical term used by some.",
    },
    {
      id: 4,
      text: "Bananas are berries, but strawberries aren't.",
      isTrue: true,
      explanation: "Botanically, bananas are berries; strawberries are aggregate fruits composed of many small 'achenes'.",
    },
    {
      id: 5,
      text: "There are more possible iterations of chess moves than atoms in the known universe.",
      isTrue: true,
      explanation: "The number of legal chess positions vastly surpasses the number of atoms estimated in the observable universe.",
    },
    {
      id: 6,
      text: "Octopuses have three hearts and blue blood.",
      isTrue: true,
      explanation: "Two hearts pump blood to the gills and one to the rest of the body; their blood uses copper-based hemocyanin, giving it a blue color.",
    },
    {
      id: 7,
      text: "The Eiffel Tower can be 15 cm taller during the summer.",
      isTrue: true,
      explanation: "Thermal expansion of the iron structure causes the tower to grow slightly on hot days.",
    },
    {
      id: 8,
      text: "Wombat poop is cube-shaped.",
      isTrue: true,
      explanation: "Wombats produce nearly cubic feces, which helps the droppings stack and mark territory without rolling away.",
    },
    {
      id: 9,
      text: "Venus is the hottest planet in the solar system because it orbits closest to the Sun.",
      isTrue: false,
      explanation: "Venus is hottest due to a runaway greenhouse effect and a dense CO2 atmosphere, not because it's the closest to the Sun (Mercury is closer).",
    },
    {
      id: 10,
      text: "A day on Venus (one rotation) is longer than its year (one orbit around the Sun).",
      isTrue: true,
      explanation: "Venus rotates very slowly; a sidereal day is longer than its orbital period.",
    },
    {
      id: 11,
      text: "The Great Wall of China is the only man-made object visible from space with the naked eye.",
      isTrue: false,
      explanation: "From low Earth orbit many man-made objects are visible under the right conditions; the Great Wall is not uniquely visible to the naked eye and can be hard to distinguish.",
    },
    {
      id: 12,
      text: "Sharks existed before trees.",
      isTrue: true,
      explanation: "Sharks have ancestors dating back over 400 million years, while the first trees appeared around 350 million years ago.",
    },
    {
      id: 13,
      text: "Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramid.",
      isTrue: true,
      explanation: "The Great Pyramid was completed around 2560 BCE; Cleopatra lived around 30 BCE, which is much closer to 1969 CE than to the pyramid's construction.",
    },
    {
      id: 14,
      text: "A bolt of lightning is hotter than the surface of the Sun.",
      isTrue: true,
      explanation: "Lightning can reach temperatures of ~30,000 °C, several times hotter than the Sun's surface (~5,500 °C).",
    },
    {
      id: 15,
      text: "Goldfish have a three-second memory span.",
      isTrue: false,
      explanation: "Research shows goldfish can remember things for months and can be trained to perform tasks.",
    },
    {
      id: 16,
      text: "The inventor of the Pringles can is buried in one.",
      isTrue: true,
      explanation: "Fred Baur, who invented the Pringles potato chip can, had his ashes partially buried in one per his request.",
    },
    {
      id: 17,
      text: "Humans share about 50% of their DNA with bananas.",
      isTrue: true,
      explanation: "While the comparison sounds odd, many basic cellular processes are conserved between plants and animals, leading to surprising genetic overlap.",
    },
    {
      id: 18,
      text: "The original name for 'Google' was 'Backrub'.",
      isTrue: true,
      explanation: "During early development the search engine was called Backrub before the founders settled on 'Google'.",
    },
    {
      id: 19,
      text: "Humans cannot distinguish more than ten basic tastes.",
      isTrue: false,
      explanation: "Recent research identifies more than the classic five tastes (sweet, sour, salty, bitter, umami), including fat and others — taste is more nuanced.",
    },
    {
      id: 20,
      text: "The shortest war in history lasted less than an hour.",
      isTrue: true,
      explanation: "The Anglo-Zanzibar War of 1896 reportedly lasted between 38 and 45 minutes, making it one of the shortest recorded wars.",
    },
  ];

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (autoPlay) {
      timerRef.current = window.setInterval(() => {
        setIndex((i) => (i + 1) % facts.length);
        setRevealed(false);
      }, 5000);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [autoPlay, facts.length]);

  const next = () => {
    setIndex((i) => (i + 1) % facts.length);
    setRevealed(false);
  };

  const random = () => {
    let nextIdx = Math.floor(Math.random() * facts.length);
    if (nextIdx === index) nextIdx = (index + 1) % facts.length;
    setIndex(nextIdx);
    setRevealed(false);
  };

  const current = facts[index];

  return (
    <div className="space-y-4">
      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="p-4 rounded-lg bg-teal-50/50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-800/50"
      >
        <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mb-2">TRIVIA</p>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2" dangerouslySetInnerHTML={{ __html: current.text }} />
        {revealed && (
          <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded border border-teal-100 dark:border-teal-800/50">
            <strong className="text-teal-700 dark:text-teal-300">{current.isTrue ? '✓ True' : '✗ False'}:</strong> {current.explanation}
          </div>
        )}
      </motion.div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => setRevealed((r) => !r)} variant="ghost" className="text-xs h-9 dark:text-slate-300 dark:hover:bg-slate-700">
          {revealed ? 'Hide' : 'Reveal'}
        </Button>
        <Button size="sm" onClick={next} className="text-xs h-9 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white">
          Next
        </Button>
        <Button size="sm" variant="outline" onClick={random} className="text-xs h-9 border-slate-300 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
          Random
        </Button>
      </div>
    </div>
  );
}

interface QuizHistory {
  category: string;
  score: number;
  total: number;
  date: string;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const getMsUntilMidnight = () => {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  return Math.max(0, nextMidnight.getTime() - now.getTime());
};

const formatCountdown = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

export default function Dashboard() {
  const [history, setHistory] = useState<QuizHistory[]>(() => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('quiz_history') || '[]');
  });
  const [timeLeftMs, setTimeLeftMs] = useState(getMsUntilMidnight());
  const router = useRouter();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeftMs(getMsUntilMidnight());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const clearAllHistory = () => {
    if (!history || history.length === 0) return;
    if (!window.confirm('Clear all recent quiz history? This cannot be undone.')) return;
    localStorage.removeItem('quiz_history');
    setHistory([]);
  };

  const deleteHistoryEntry = (idx: number) => {
    const newHist = history.filter((_, i) => i !== idx);
    localStorage.setItem('quiz_history', JSON.stringify(newHist));
    setHistory(newHist);
  };

  const handleDailyChallenge = () => {
    // Simulate picking a random category for the daily challenge
    // Ideally this would be seeded by the date so everyone gets the same one
    const randomCatId = 9; // General Knowledge
    router.push(`/categories?daily=true&cat=${randomCatId}`);
  };

  const countdownDisplay = formatCountdown(timeLeftMs);
  const progressRatio = Math.min(1, Math.max(0, (DAY_IN_MS - timeLeftMs) / DAY_IN_MS));

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-violet-600 dark:text-violet-400">
          Ready to Quiz?
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Test your knowledge across dozens of categories. Challenge yourself and learn something new every day.
        </p>
      </div>

      {/* Start New Game - Full Width Hero Card */}
      <div className="mt-6">
        <Card className="bg-gradient-to-br from-violet-100/80 via-violet-50 to-white dark:from-violet-950/60 dark:via-violet-900/40 dark:to-slate-800 border-violet-200 dark:border-violet-800 shadow-lg hover:shadow-xl dark:hover:shadow-2xl dark:shadow-black/20 relative overflow-hidden group transition-all duration-300 rounded-3xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/15 dark:bg-violet-400/25 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-violet-500/25 dark:group-hover:bg-violet-400/35 transition-all duration-500" />
          <CardContent className="p-8 md:p-10 relative z-10 flex flex-col justify-center">
            <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-violet-600 dark:bg-violet-500 text-white shadow-xl group-hover:scale-110 transition-transform duration-300">
              <Play className="w-10 h-10 fill-current" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              Start a New Game
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-lg leading-relaxed">
              Dive into our vast collection of trivia questions. Choose a category or go random and challenge your knowledge!
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/categories">
                <Button size="lg" className="h-14 px-8 bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white rounded-2xl shadow-lg hover:shadow-xl dark:hover:shadow-2xl dark:shadow-black/20 transition-all duration-300 text-lg font-semibold hover:scale-105">
                  Browse Categories
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: DidYouKnow (left) + DailyChallenge (right) - Paired Row */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Did You Know Card */}
        <div className="h-full lg:min-h-[240px]">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl dark:hover:shadow-2xl dark:shadow-black/20 transition-all duration-300 rounded-3xl border-l-4 border-l-teal-400 dark:border-l-teal-500 overflow-hidden group hover:scale-[1.02] h-full">
            <CardHeader className="pb-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30">
              <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/50 group-hover:bg-teal-200 dark:group-hover:bg-teal-900/70 transition-colors">
                  <BookOpen className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                Did You Know?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <DidYouKnow />
            </CardContent>
          </Card>
        </div>

        {/* Daily Challenge Card */}
        <div className="h-full lg:min-h-[240px]">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl dark:hover:shadow-2xl dark:shadow-black/20 transition-all duration-300 rounded-3xl border-l-4 border-l-amber-400 dark:border-l-amber-500 overflow-hidden group hover:scale-[1.02] h-full">
            <CardHeader className="pb-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/70 transition-colors">
                  <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                Daily Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="space-y-3">
                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Today&apos;s challenge: <strong className="text-slate-900 dark:text-slate-100 text-lg">General Knowledge</strong>
                  <br />
                  <span className="text-sm text-slate-500 dark:text-slate-400">Beat the clock and earn a streak!</span>
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Resets in</span>
                  <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full px-3 py-1.5 text-sm font-mono font-semibold border border-amber-200 dark:border-amber-800">
                    {countdownDisplay}
                  </span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 dark:from-amber-500 dark:to-orange-400 transition-all duration-700 rounded-full shadow-sm"
                    style={{ width: `${(progressRatio * 100).toFixed(2)}%` }}
                  />
                </div>
              </div>
              <Button 
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 dark:from-amber-400 dark:to-orange-400 dark:hover:from-amber-500 dark:hover:to-orange-500 text-white rounded-2xl shadow-lg hover:shadow-xl dark:hover:shadow-2xl dark:shadow-black/20 transition-all duration-300 font-semibold text-base hover:scale-[1.02]" 
                onClick={handleDailyChallenge}
              >
                Play Now
                <span className="ml-2">→</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
