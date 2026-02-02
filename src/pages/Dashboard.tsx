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
        className="p-4 rounded-lg bg-teal-50/50 border border-teal-100"
      >
        <p className="text-xs text-teal-600 font-medium mb-2">TRIVIA</p>
        <h4 className="text-sm font-semibold text-slate-900 mb-2" dangerouslySetInnerHTML={{ __html: current.text }} />
        {revealed && (
          <div className="mt-3 text-xs text-slate-600 bg-white p-3 rounded border border-teal-100">
            <strong className="text-teal-700">{current.isTrue ? '✓ True' : '✗ False'}:</strong> {current.explanation}
          </div>
        )}
      </motion.div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => setRevealed((r) => !r)} variant="ghost" className="text-xs h-9">
          {revealed ? 'Hide' : 'Reveal'}
        </Button>
        <Button size="sm" onClick={next} className="text-xs h-9 bg-teal-600 hover:bg-teal-700 text-white">
          Next
        </Button>
        <Button size="sm" variant="outline" onClick={random} className="text-xs h-9 border-slate-300">
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
    <div className="max-w-280 mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 min-h-screen">
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-violet-600">
          Ready to Quiz?
        </h1>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
          Test your knowledge across dozens of categories. Challenge yourself and learn something new every day.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Start Game + Recent History */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Start a New Game Card */}
          <Card className="bg-linear-to-br from-violet-100/70 via-violet-50 to-white border-violet-200 shadow-sm hover:shadow-md relative overflow-hidden group transition-shadow rounded-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-violet-500/20 transition-all duration-500" />
            <CardContent className="p-6 md:p-8 relative z-10">
              <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-violet-600 text-white shadow-lg">
                <Play className="w-7 h-7 fill-current" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-slate-900">Start a New Game</h2>
              <p className="text-base text-slate-600 mb-6 max-w-md">
                Dive into our vast collection of trivia questions. Choose a category or go random!
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/categories">
                  <Button size="lg" className="h-11 px-6 bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2">
                    Browse Categories
                  </Button>
                </Link>
                <Link href="/favorites">
                  <Button variant="outline" size="lg" className="h-11 px-6 bg-white hover:bg-slate-50 border-slate-300 rounded-xl focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2">
                    View Favorites
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent History Card */}
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-violet-600" />
                Recent History
              </CardTitle>
              {history.length > 0 && (
                <Button size="sm" variant="ghost" onClick={clearAllHistory} className="h-9 text-xs hover:bg-slate-100">
                  <Trash className="w-4 h-4 mr-1.5 text-red-500" />
                  Clear All
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 text-slate-400">
                  <CalendarDays className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm">No quizzes taken yet.</p>
                </div>
              ) : (
                <div className="space-y-0 divide-y divide-slate-100">
                  {history.map((record, i) => (
                    <div key={i} className="flex items-center justify-between py-3 hover:bg-slate-50 transition-colors -mx-2 px-2 rounded-lg">
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-medium text-sm text-slate-900 truncate">{record.category}</span>
                        <span className="text-xs text-slate-500">
                          {format(new Date(record.date), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full">
                          <span className="font-bold text-sm text-violet-600">{record.score}</span>
                          <span className="text-slate-500 text-xs">/{record.total}</span>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => deleteHistoryEntry(i)} className="h-8 w-8 p-0 hover:bg-red-50">
                          <Trash className="w-4 h-4 text-slate-400 hover:text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Daily Challenge + Did You Know */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Daily Challenge Card */}
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl border-l-4 border-l-amber-400">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-amber-500" />
                Daily Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Today&apos;s challenge: <strong className="text-slate-900">General Knowledge</strong>
                <br />
                <span className="text-xs">Beat the clock and earn a streak!</span>
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Resets in</span>
                  <span className="bg-slate-100 text-slate-700 rounded-full px-2.5 py-1 text-xs font-mono font-medium">{countdownDisplay}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-700 rounded-full"
                    style={{ width: `${(progressRatio * 100).toFixed(2)}%` }}
                  />
                </div>
              </div>
              <Button 
                className="w-full h-10 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2" 
                onClick={handleDailyChallenge}
              >
                Play Now
                <span className="ml-2">→</span>
              </Button>
            </CardContent>
          </Card>

          {/* Did You Know Card */}
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl border-l-4 border-l-teal-400">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-teal-500" />
                Did You Know?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DidYouKnow />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
