import { Trophy, Users } from "lucide-react";

interface LeaderboardEmptyStateProps {
  hasFilter?: boolean;
}

export default function LeaderboardEmptyState({ hasFilter = false }: LeaderboardEmptyStateProps) {
  return (
    <div className="text-center py-16 px-6">
      <div className="flex justify-center mb-5">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/20 shadow-sm ring-1 ring-amber-200/50 dark:ring-amber-700/30">
          {hasFilter ? (
            <Users className="w-7 h-7 text-amber-500 dark:text-amber-400" />
          ) : (
            <Trophy className="w-7 h-7 text-amber-500 dark:text-amber-400" />
          )}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {hasFilter ? "No entries found" : "No leaderboard entries yet"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
        {hasFilter 
          ? "No entries match the selected category. Try a different filter or check back later."
          : "Once players complete games, entries will appear here. The leaderboard automatically updates in real-time."
        }
      </p>
    </div>
  );
}
