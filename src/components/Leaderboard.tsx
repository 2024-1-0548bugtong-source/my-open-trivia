"use client";

import { useEffect, useState } from "react";
import { Trophy, Shield, TrendingUp, Crown, Medal, Sparkles, Star, Flame, Hash } from "lucide-react";
import { listenLeaderboard } from "../services/quizResults";
import type { QuizResult } from "../types/quizResult";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TOTAL_QUESTIONS } from "@/lib/quizConstants";
import Link from "next/link";
import { Surface } from "@/components/ui/surface";
import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

const RANK_STYLES = [
  // 1st place
  "bg-linear-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 border-amber-200/60 dark:border-amber-700/40",
  // 2nd place
  "bg-linear-to-br from-slate-50 to-gray-100 dark:from-slate-900/40 dark:to-gray-900/30 border-slate-200/60 dark:border-slate-700/40",
  // 3rd place
  "bg-linear-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/15 border-orange-200/60 dark:border-orange-800/40",
];

const RANK_ICONS = ["🥇", "🥈", "🥉"];

function ScorePill({ value }: { value: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset tabular-nums",
        value >= 70
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200/60 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-700/40"
          : value >= 40
            ? "bg-amber-50 text-amber-700 ring-amber-200/60 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-700/40"
            : "bg-rose-50 text-rose-700 ring-rose-200/60 dark:bg-rose-900/20 dark:text-rose-300 dark:ring-rose-700/40"
      )}
    >
      {value.toFixed(1)}%
    </span>
  );
}

export default function Leaderboard({ compact = false }: { compact?: boolean }) {
  const [results, setResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    const unsubscribe = listenLeaderboard(
      compact ? 10 : 50,
      (data) => {
        setResults(data as QuizResult[]);
      },
      (err) => console.error("Leaderboard error:", err)
    );

    return () => unsubscribe();
  }, [compact]);

  return (
    <Surface variant={compact ? "section" : "page"}>
      <div className={compact ? "" : "max-w-4xl mx-auto px-6 py-10"}>

        {/* ── Page header (full mode only) ── */}
        {!compact && (
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/30 shadow-sm ring-1 ring-amber-200/60 dark:ring-amber-700/40">
                <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Leaderboard</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Top quiz results from all players</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Rules banner (full mode only) ── */}
        {!compact && (
          <div className="mb-8">
            <Panel variant="info" icon={Shield} title="Standardized Rules">
              {TOTAL_QUESTIONS} Questions • Mixed Question Types • Randomized Difficulty
            </Panel>
          </div>
        )}

        {/* ── Compact card wrapper ── */}
        {compact ? (
          <Card className="h-full rounded-2xl border border-border shadow-sm dark:shadow-none overflow-hidden">
            <CardHeader className="pb-4 pt-5 px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/30 shadow-sm ring-1 ring-amber-200/60 dark:ring-amber-700/40">
                  <Trophy className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                </div>
                <CardTitle className="text-lg font-bold">Top Players</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pb-6 px-5">
              {results.length === 0 ? (
                <EmptyState compact />
              ) : (
                <LeaderboardTable results={results} compact />
              )}
            </CardContent>
          </Card>
        ) : (
          /* ── Full-page table ── */
          results.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Podium — top 3 cards */}
              {results.length >= 3 && (
                <div className="grid grid-cols-3 gap-4 mb-10">
                  {results.slice(0, 3).map((result, i) => {
                    const pct = result.percentage ?? ((result.score / result.totalQuestions) * 100);
                    const pctVal = typeof pct === "number" ? pct : parseFloat(String(pct));
                    const podiumIcons = [
                      <Crown key="crown" className="h-5 w-5 text-amber-500" />,
                      <Medal key="medal" className="h-5 w-5 text-slate-400" />,
                      <Medal key="medal3" className="h-5 w-5 text-orange-400" />,
                    ];
                    return (
                      <div
                        key={result.id}
                        className={cn(
                          "relative rounded-2xl border p-6 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
                          RANK_STYLES[i],
                          i === 0 && "ring-2 ring-amber-300/50 dark:ring-amber-600/30 shadow-md"
                        )}
                      >
                        <span className="text-4xl leading-none select-none block mb-3">{RANK_ICONS[i]}</span>
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          {podiumIcons[i]}
                          <p className="font-bold text-foreground text-base truncate">{result.nickname}</p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{result.category ?? "Uncategorized"}</p>
                        <div className="mt-4 flex items-center justify-center gap-2.5">
                          <span className="text-xl font-black text-foreground tabular-nums">{result.score}/{TOTAL_QUESTIONS}</span>
                          <ScorePill value={pctVal} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Remaining rows */}
              <LeaderboardTable results={results} compact={false} />
            </>
          )
        )}
      </div>
    </Surface>
  );
}

/* ── Empty state ── */
function EmptyState({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("text-center px-6", compact ? "py-12" : "py-20")}>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/20 shadow-sm ring-1 ring-amber-200/50 dark:ring-amber-700/30 mb-5">
        <Trophy className="text-amber-500 dark:text-amber-400" size={28} strokeWidth={1.75} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No leaderboard data yet</h3>
      <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto leading-relaxed">
        Complete a quiz to appear here and compete with others!
      </p>
      {!compact && (
        <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary/20 px-8">
          <Link href="/categories">
            <Flame className="h-4 w-4 mr-2" />
            Start Your First Quiz
          </Link>
        </Button>
      )}
    </div>
  );
}

/* ── Table ── */
function LeaderboardTable({ results, compact }: { results: QuizResult[]; compact: boolean }) {
  // In full-page mode with podium, skip first 3 in the table
  const showPodium = !compact && results.length >= 3;
  const rows = showPodium ? results.slice(3) : results;

  if (rows.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border bg-muted/40">
            <TableHead className="w-16 py-3.5 pl-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Hash className="h-3 w-3 text-violet-400" />
                Rank
              </div>
            </TableHead>
            <TableHead className="py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Player</TableHead>
            {!compact && (
              <TableHead className="py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Category</TableHead>
            )}
            <TableHead className="text-center w-24 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="flex items-center justify-center gap-1.5">
                <Star className="h-3 w-3 text-amber-400" />
                Score
              </div>
            </TableHead>
            <TableHead className="text-center w-24 py-3.5 pr-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="flex items-center justify-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                %
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((result, i) => {
            const globalIndex = showPodium ? i + 3 : i;
            const percentage = result.percentage ?? ((result.score / result.totalQuestions) * 100);
            const percentageValue = typeof percentage === "number" ? percentage : parseFloat(String(percentage));
            const isTop3 = globalIndex < 3;

            return (
              <TableRow
                key={result.id}
                className={cn(
                  "transition-colors",
                  isTop3
                    ? RANK_STYLES[globalIndex] + " hover:brightness-95"
                    : "hover:bg-muted/20"
                )}
              >
                <TableCell className="font-bold text-sm py-3.5 pl-5">
                  {isTop3 ? (
                    <span className="text-lg leading-none select-none">{RANK_ICONS[globalIndex]}</span>
                  ) : (
                    <span className="text-muted-foreground/70 tabular-nums font-medium">#{globalIndex + 1}</span>
                  )}
                </TableCell>
                <TableCell className="py-3.5">
                  <span className="font-semibold text-sm text-foreground">{result.nickname}</span>
                </TableCell>
                {!compact && (
                  <TableCell className="py-3.5 hidden sm:table-cell">
                    <span className="inline-flex items-center rounded-full bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground ring-1 ring-inset ring-border/50">
                      {result.category ?? "Uncategorized"}
                    </span>
                  </TableCell>
                )}
                <TableCell className="text-center py-3.5">
                  <span className="text-sm font-bold text-foreground tabular-nums">{result.score}/{TOTAL_QUESTIONS}</span>
                </TableCell>
                <TableCell className="text-center py-3.5 pr-5">
                  <ScorePill value={percentageValue} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
