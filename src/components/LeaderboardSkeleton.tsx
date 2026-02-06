export default function LeaderboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-10 bg-muted rounded w-48 animate-pulse"></div>
          <div className="h-9 bg-muted rounded w-20 animate-pulse"></div>
        </div>
      </div>

      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="grid grid-cols-12 items-center py-3 border-b">
            <div className="col-span-1">
              <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
            </div>
            <div className="col-span-3 space-y-1">
              <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
              <div className="h-3 bg-muted rounded w-16 animate-pulse"></div>
            </div>
            <div className="col-span-3 space-y-1">
              <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
              <div className="h-3 bg-muted rounded w-12 animate-pulse"></div>
            </div>
            <div className="col-span-2">
              <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
            </div>
            <div className="col-span-2">
              <div className="h-6 bg-muted rounded w-12 animate-pulse"></div>
            </div>
            <div className="col-span-1">
              <div className="h-4 bg-muted rounded w-12 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
