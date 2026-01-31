import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, BookOpen, Trophy, Clock, CalendarDays, Sparkles, Trash } from "lucide-react";
import { Link, useLocation } from "wouter";
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
  }, [autoPlay]);

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
        className="p-4 rounded-md bg-linear-to-r from-transparent to-primary/5"
      >
        <p className="text-sm text-muted-foreground italic mb-2">Tip</p>
        <h4 className="text-base font-semibold mb-2" dangerouslySetInnerHTML={{ __html: current.text }} />
        {revealed && (
          <div className="mt-2 text-sm text-muted-foreground bg-muted/5 p-3 rounded">
            <strong>{current.isTrue ? 'True' : 'False'}:</strong> {current.explanation}
          </div>
        )}
      </motion.div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => setRevealed((r) => !r)} variant="ghost">
          <Sparkles className="w-4 h-4 mr-2" />
          {revealed ? 'Hide Explanation' : 'Reveal'}
        </Button>
        <Button size="sm" onClick={next}>
          Next
        </Button>
        <Button size="sm" variant="outline" onClick={random}>
          Random
        </Button>
        <Button size="sm" className="ml-auto" variant={autoPlay ? 'secondary' : 'ghost'} onClick={() => setAutoPlay((v) => !v)}>
          {autoPlay ? 'Stop Auto' : 'Auto Play'}
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
  const [history, setHistory] = useState<QuizHistory[]>([]);
  const [timeLeftMs, setTimeLeftMs] = useState(getMsUntilMidnight());
  const [, setLocation] = useLocation();

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem('quiz_history') || '[]');
    setHistory(storedHistory);
  }, []);

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
    setLocation(`/categories?daily=true&cat=${randomCatId}`);
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
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center space-y-2"
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary bg-clip-text">
          Ready to Quiz?
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Test your knowledge across dozens of categories. Challenge yourself and learn something new every day.
        </p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <motion.div variants={item} className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2">
          <Card className="h-full bg-linear-to-br from-primary/5 to-primary/10 border-none shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
            <CardContent className="p-8 flex flex-col justify-center h-full relative z-10">
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground shadow-xl">
                <Play className="w-8 h-8 fill-current" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Start a New Game</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-md">
                Dive into our vast collection of trivia questions. Choose a category or go random!
              </p>
              <div className="flex gap-4">
                <Link href="/categories">
                  <Button size="lg" className="text-lg px-8 py-6 shadow-primary/25 shadow-lg hover:shadow-primary/40 transition-all">
                    Browse Categories
                  </Button>
                </Link>
                <Link href="/favorites">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-background/50 backdrop-blur-sm hover:bg-background/80">
                    View Favorites
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="row-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2 flex items-start justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent History
              </CardTitle>
              {history.length > 0 && (
                <div>
                  <Button size="sm" variant="ghost" onClick={clearAllHistory}>
                    <Trash className="w-4 h-4 mr-2 text-destructive" />
                    Clear All
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col">
              {history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                  <CalendarDays className="w-12 h-12 mb-2 opacity-20" />
                  <p className="text-sm">No quizzes taken yet.</p>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto pr-2 max-h-[300px] md:max-h-full">
                  {history.map((record, i) => (
                    <div key={i} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">{record.category}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(record.date), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                          <span className="font-bold text-primary">{record.score}</span>
                          <span className="text-muted-foreground text-xs">/{record.total}</span>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => deleteHistoryEntry(i)}>
                          <Trash className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full hover:shadow-md transition-shadow border-l-4 border-l-chart-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-chart-4" />
                Daily Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-between h-full gap-4">
              <p className="text-muted-foreground">
                Today's challenge: <strong>General Knowledge</strong>. <br/>
                Beat the clock and earn a streak!
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Resets in</span>
                  <span className="font-mono text-base text-primary">{countdownDisplay}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-chart-4 transition-all duration-700"
                    style={{ width: `${(progressRatio * 100).toFixed(2)}%` }}
                  />
                </div>
              </div>
              <Button variant="secondary" className="w-full group" onClick={handleDailyChallenge}>
                Play Daily 
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
            <Card className="h-full hover:shadow-md transition-shadow border-l-4 border-l-chart-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-chart-2" />
                  Did You Know?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DidYouKnow />
              </CardContent>
            </Card>
        </motion.div>

      </motion.div>
    </div>
  );
}
