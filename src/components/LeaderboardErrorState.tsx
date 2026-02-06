import { AlertTriangle, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LeaderboardErrorStateProps {
  error: string;
  onRetry: () => void;
  isIndexError?: boolean;
}

export default function LeaderboardErrorState({ 
  error, 
  onRetry, 
  isIndexError = false 
}: LeaderboardErrorStateProps) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <Card className="border-destructive/20 bg-destructive/5 rounded-2xl shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-rose-100 to-red-100 dark:from-rose-900/30 dark:to-red-900/20 ring-1 ring-rose-200/60 dark:ring-rose-700/40">
            <AlertTriangle className="w-5 h-5 text-rose-500 dark:text-rose-400" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold text-rose-600 dark:text-rose-400 mb-1.5">
                Couldn’t load leaderboard
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isIndexError 
                  ? "This query requires a Firestore database index. It's being created automatically and will be ready in a few minutes."
                  : "Check your connection or permissions. If the problem persists, contact support."
                }
              </p>
            </div>

            {isDev && isIndexError && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Developer Info:</strong> Composite index required for query:
                </p>
                <code className="text-xs bg-blue-100 p-2 rounded block">
                  quizResults → (hidden, categoryId, score, accuracy, createdAt)
                </code>
                <p className="text-xs text-blue-600 mt-2">
                  Check Firebase Console → Firestore → Indexes for creation status.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button 
                onClick={onRetry} 
                variant="outline" 
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
              
              {isDev && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="gap-2"
                  asChild
                >
                  <a 
                    href="https://console.firebase.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Firebase Console
                  </a>
                </Button>
              )}
            </div>

            {isDev && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Technical details
                </summary>
                <pre className="mt-2 p-2 bg-muted rounded text-red-600 overflow-auto">
                  {error}
                </pre>
              </details>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
